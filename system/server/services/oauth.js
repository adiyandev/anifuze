import crypto from 'node:crypto';
import {query} from '../db/index.js';
import {config} from '../config.js';
import {hashPassword,createUserSession} from './userAuth.js';

const secretKey=()=>crypto.createHash('sha256').update(String(process.env.ANIFUZE_ENCRYPTION_KEY||config.installationId)).digest();
const encrypt=v=>{if(!v)return null;const iv=crypto.randomBytes(12);const cipher=crypto.createCipheriv('aes-256-gcm',secretKey(),iv);const data=Buffer.concat([cipher.update(String(v),'utf8'),cipher.final()]);return [iv.toString('base64url'),cipher.getAuthTag().toString('base64url'),data.toString('base64url')].join('.')};
const decrypt=v=>{if(!v)return '';try{const [iv,tag,data]=String(v).split('.');const decipher=crypto.createDecipheriv('aes-256-gcm',secretKey(),Buffer.from(iv,'base64url'));decipher.setAuthTag(Buffer.from(tag,'base64url'));return Buffer.concat([decipher.update(Buffer.from(data,'base64url')),decipher.final()]).toString('utf8')}catch{return ''}};
export async function getOAuthSettings(){
 const r=await query('SELECT id,google_enabled,google_client_id,google_client_secret,google_redirect_uri,updated_at FROM af_oauth_settings WHERE id=1');
 const x=r.rows[0]||{}; return {...x,google_client_secret:x.google_client_secret?'••••••••••••':'',google_configured:Boolean(x.google_client_id&&x.google_client_secret)};
}
export async function getGoogleOAuthConfig(){
 const r=await query('SELECT google_enabled,google_client_id,google_client_secret,google_redirect_uri FROM af_oauth_settings WHERE id=1');
 const x=r.rows[0]||{}; return {...x,google_client_secret:decrypt(x.google_client_secret)};
}
export async function saveOAuthSettings(input={}){
 const enabled=Boolean(input.google_enabled);
 const clientId=String(input.google_client_id||'').trim().slice(0,500);
 const redirectUri=String(input.google_redirect_uri||'').trim().slice(0,1000);
 const current=await getGoogleOAuthConfig();
 const provided=String(input.google_client_secret||'').trim();
 const clientSecret=provided?encrypt(provided):current.google_client_secret?encrypt(current.google_client_secret):null;
 if(enabled&&(!clientId||!clientSecret))throw new Error('Google sign-in requires a Client ID and Client Secret.');
 if(enabled&&redirectUri&&!/^https:\/\//i.test(redirectUri)&&config.nodeEnv==='production')throw new Error('Google redirect URI must use HTTPS in production.');
 await query('UPDATE af_oauth_settings SET google_enabled=$1,google_client_id=$2,google_client_secret=$3,google_redirect_uri=$4,updated_at=CURRENT_TIMESTAMP WHERE id=1',[enabled,clientId||null,clientSecret,redirectUri||null]);
 return getOAuthSettings();
}
export async function getGoogleIdentity(code){
 const cfg=await getGoogleOAuthConfig();
 if(!cfg.google_enabled||!cfg.google_client_id||!cfg.google_client_secret||!cfg.google_redirect_uri)throw new Error('Google sign-in is not configured.');
 const tokenResponse=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({code,client_id:cfg.google_client_id,client_secret:cfg.google_client_secret,redirect_uri:cfg.google_redirect_uri,grant_type:'authorization_code'})});
 if(!tokenResponse.ok)throw new Error('Google authorization failed.');
 const tokens=await tokenResponse.json();
 if(!tokens.access_token)throw new Error('Google did not return an access token.');
 const userResponse=await fetch('https://openidconnect.googleapis.com/v1/userinfo',{headers:{Authorization:'Bearer '+tokens.access_token}});
 if(!userResponse.ok)throw new Error('Could not retrieve your Google profile.');
 const profile=await userResponse.json();
 if(!profile.sub||!profile.email||profile.email_verified!==true)throw new Error('Google account email verification is required.');
 return {sub:String(profile.sub),email:String(profile.email).trim().toLowerCase(),displayName:String(profile.name||profile.email.split('@')[0]).trim().slice(0,80)};
}
export async function loginWithGoogle({identity,req}){
 const linked=await query('SELECT u.* FROM af_user_oauth_accounts a JOIN af_users u ON u.id=a.user_id WHERE a.provider=$1 AND a.provider_subject=$2 AND u.enabled=TRUE AND u.status=\'active\'',['google',identity.sub]);
 let user=linked.rows[0];
 if(!user){
  const existing=await query('SELECT id,username,email,display_name,password_hash,status,enabled,email_verified FROM af_users WHERE email=$1',[identity.email]);
  if(existing.rows[0]){
   user=existing.rows[0];
   if(!user.email_verified)throw new Error('This email already has an account. Verify that account by email before linking Google.');
  }else{
   const id=crypto.randomUUID(),username=(identity.displayName.toLowerCase().replace(/[^a-z0-9_.-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,70)||'user')+'-'+id.slice(0,8),now=new Date().toISOString().slice(0,19).replace('T',' ');
   user={id,username,email:identity.email,display_name:identity.displayName,status:'active',enabled:true,email_verified:true,password_hash:await hashPassword(crypto.randomBytes(32).toString('base64url'))};
   await query('INSERT INTO af_users(id,username,email,display_name,password_hash,status,enabled,email_verified,created_at,last_active_at,updated_at) VALUES($1,$2,$3,$4,$5,\'active\',TRUE,TRUE,$6,$6,$6)',[id,username,identity.email,identity.displayName,user.password_hash,now]);
  }
  await query('INSERT INTO af_user_oauth_accounts(id,user_id,provider,provider_subject,provider_email,created_at,updated_at) VALUES($1,$2,$3,$4,$5,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)',[crypto.randomUUID(),user.id,'google',identity.sub,identity.email]);
 }else{
  await query('UPDATE af_user_oauth_accounts SET provider_email=$3,updated_at=CURRENT_TIMESTAMP WHERE provider=$1 AND provider_subject=$2',['google',identity.sub,identity.email]);
 }
 return createUserSession(user,{req,remember:true});
}
