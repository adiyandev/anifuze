import crypto from 'node:crypto';
import {promisify} from 'node:util';
import {query} from '../db/index.js';
import {sendEmail} from './email.js';
const scrypt=promisify(crypto.scrypt);
const SHORT_SESSION_MS=1000*60*60*24;
const TOKEN_MS=1000*60*30;
const tokenHash=t=>crypto.createHash('sha256').update(String(t)).digest('hex');
const tokenValue=()=>crypto.randomBytes(32).toString('base64url');
const safeUser=async email=>{const r=await query('SELECT id,username,email,display_name,email_verified,enabled,status FROM af_users WHERE email=$1',[String(email||'').trim().toLowerCase()]);return r.rows[0]||null};
const LONG_SESSION_MS=1000*60*60*24*30;
const hashPassword=async p=>{const salt=crypto.randomBytes(16).toString('hex');const key=await scrypt(p,salt,64,{N:16384,r:8,p:1});return salt+':'+key.toString('hex')};
const verifyPassword=async(p,stored)=>{const [salt,hex]=String(stored).split(':');if(!salt||!hex)return false;const key=await scrypt(p,salt,64,{N:16384,r:8,p:1});const a=Buffer.from(hex,'hex');return a.length===key.length&&crypto.timingSafeEqual(a,key)};
const publicUser=u=>({id:u.id,email:u.email,displayName:u.display_name||u.username,emailVerified:Boolean(u.email_verified)});
export async function createUser({email,displayName,password}){const e=String(email||'').trim().toLowerCase(),n=String(displayName||'').trim();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))throw new Error('Enter a valid email address.');if(n.length<2||n.length>80)throw new Error('Display name must be 2–80 characters.');if(String(password||'').length<8)throw new Error('Password must be at least 8 characters.');const exists=await query('SELECT id FROM af_users WHERE email=$1',[e]);if(exists.rows[0])throw new Error('An account with that email already exists.');const id=crypto.randomUUID(),username=(n.toLowerCase().replace(/[^a-z0-9_.-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,70)||'user')+'-'+id.slice(0,8),now=new Date().toISOString().slice(0,19).replace('T',' ');await query('INSERT INTO af_users(id,username,email,display_name,password_hash,status,enabled,email_verified,created_at,last_active_at,updated_at) VALUES($1,$2,$3,$2,$4,\'active\',TRUE,FALSE,$5,$5,$5)',[id,username,e,await hashPassword(password),now]);return{id,email:e,displayName:n,emailVerified:false}}
export async function loginUser({email,password,req,remember=true}){const e=String(email||'').trim().toLowerCase();const r=await query('SELECT id,username,email,display_name,password_hash,status,enabled,email_verified FROM af_users WHERE email=$1',[e]);const u=r.rows[0];if(!u||u.status!=='active'||!u.enabled||!(await verifyPassword(String(password||''),u.password_hash)))throw new Error('Invalid email or password.');const id=crypto.randomBytes(32).toString('base64url'),now=new Date(),expires=new Date(now.getTime()+(remember?LONG_SESSION_MS:SHORT_SESSION_MS));await query('INSERT INTO af_user_sessions(id,user_id,expires_at,created_at,last_seen_at,ip_address,user_agent,remember_me) VALUES($1,$2,$3,$4,$4,$5,$6,$7)',[id,u.id,expires.toISOString(),now.toISOString(),req.ip,String(req.headers['user-agent']||'').slice(0,1000),Boolean(remember)]);await query('UPDATE af_users SET last_active_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE id=$1',[u.id]);return{id,expires,user:publicUser(u),remember:Boolean(remember)}}
export async function getUserFromRequest(req){const raw=String(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('anifuze_user_session='));if(!raw)return null;let id;try{id=decodeURIComponent(raw.slice(raw.indexOf('=')+1))}catch{return null}const r=await query('SELECT s.*,u.email,u.username,u.display_name,u.email_verified,u.enabled,u.status FROM af_user_sessions s JOIN af_users u ON u.id=s.user_id WHERE s.id=$1 AND s.expires_at>CURRENT_TIMESTAMP AND u.enabled=TRUE AND u.status=\'active\'',[id]);const row=r.rows[0];if(!row)return null;const expires=new Date(Date.now()+(row.remember_me?LONG_SESSION_MS:SHORT_SESSION_MS));await query('UPDATE af_user_sessions SET last_seen_at=CURRENT_TIMESTAMP,expires_at=$2 WHERE id=$1',[row.id,expires.toISOString()]);return{...publicUser(row),sessionId:row.id,remember:Boolean(row.remember_me)}}
export async function logoutUser(req){const u=await getUserFromRequest(req);if(u)await query('DELETE FROM af_user_sessions WHERE id=$1',[u.sessionId])}
export const userCookie=(res,id,maxAge)=>res.setHeader('Set-Cookie',`anifuze_user_session=${encodeURIComponent(id)}; Max-Age=${maxAge}; Path=/; HttpOnly; SameSite=Lax${process.env.NODE_ENV==='production'?'; Secure':''}`);
export const clearUserCookie=res=>userCookie(res,'',0);

export async function issueUserToken(userId,type){
 const raw=tokenValue(),now=new Date(),expires=new Date(now.getTime()+TOKEN_MS);
 await query("DELETE FROM af_user_tokens WHERE user_id=$1 AND token_type=$2",[userId,type]);
 await query("INSERT INTO af_user_tokens(id,user_id,token_hash,token_type,expires_at,created_at) VALUES($1,$2,$3,$4,$5,$6)",[crypto.randomUUID(),userId,tokenHash(raw),type,expires.toISOString(),now.toISOString()]);
 return raw;
}
async function consumeToken(raw,type){
 const h=tokenHash(raw);const r=await query("SELECT * FROM af_user_tokens WHERE token_hash=$1 AND token_type=$2 AND used_at IS NULL AND expires_at>CURRENT_TIMESTAMP",[h,type]);const row=r.rows[0];if(!row)return null;
 await query("UPDATE af_user_tokens SET used_at=CURRENT_TIMESTAMP WHERE id=$1 AND used_at IS NULL",[row.id]);return row;
}
export async function sendVerificationEmail(user){
 const token=await issueUserToken(user.id,'verify_email');const url=(process.env.ANIFUZE_PUBLIC_URL||'').replace(/\/$/,'')+'/verify-email?token='+encodeURIComponent(token);
 await sendEmail({to:user.email,subject:'Verify your account',text:'Verify your account: '+url,html:'<h2>Verify your account</h2><p>Click the link below to verify your email.</p><p><a href="'+url+'">Verify email</a></p>'});
}
export async function verifyEmail(token){
 const row=await consumeToken(token,'verify_email');if(!row)throw new Error('This verification link is invalid or expired.');
 await query("UPDATE af_users SET email_verified=TRUE,updated_at=CURRENT_TIMESTAMP WHERE id=$1",[row.user_id]);return true;
}
export async function requestPasswordReset(email){
 const user=await safeUser(email);if(!user||!user.enabled||user.status!=='active')return {ok:true};
 const token=await issueUserToken(user.id,'password_reset');const url=(process.env.ANIFUZE_PUBLIC_URL||'').replace(/\/$/,'')+'/reset-password?token='+encodeURIComponent(token);
 await sendEmail({to:user.email,subject:'Reset your password',text:'Reset your password: '+url,html:'<h2>Password reset</h2><p><a href="'+url+'">Reset your password</a></p>'});
 return {ok:true};
}
export async function resetPassword(token,password){
 if(String(password||'').length<8)throw new Error('Password must be at least 8 characters.');
 const row=await consumeToken(token,'password_reset');if(!row)throw new Error('This reset link is invalid or expired.');
 const hash=await hashPassword(password);
 await query("UPDATE af_users SET password_hash=$2,updated_at=CURRENT_TIMESTAMP WHERE id=$1",[row.user_id,hash]);
 await query("DELETE FROM af_user_sessions WHERE user_id=$1",[row.user_id]);return true;
}
