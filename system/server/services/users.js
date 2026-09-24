import crypto from 'node:crypto';
import {promisify} from 'node:util';
import {query} from '../db/index.js';

const scrypt=promisify(crypto.scrypt);
const STATUSES=new Set(['active','disabled']);
const normalizeEmail=v=>String(v??'').trim().toLowerCase();
const cleanUsername=v=>String(v??'').trim();

async function hashPassword(password){
 const salt=crypto.randomBytes(16).toString('hex');
 const key=await scrypt(password,salt,64,{N:16384,r:8,p:1});
 return salt+':'+key.toString('hex');
}

export async function listUsers({search='',status='',limit=100}={}){
 const q=String(search).trim().toLowerCase();
 const safeLimit=Math.min(Math.max(Number(limit)||100,1),200);
 const params=[]; const where=[];
 if(q){params.push('%'+q+'%');where.push('(LOWER(username) LIKE $1 OR LOWER(email) LIKE $1 OR id LIKE $1)');}
 if(status){if(!STATUSES.has(status))throw new Error('Invalid user status.');params.push(status);where.push('status=$'+params.length);}
 const r=await query(`SELECT id,username,email,status,created_at,last_active_at FROM af_users ${where.length?'WHERE '+where.join(' AND '):''} ORDER BY created_at DESC LIMIT ${safeLimit}`,params);
 return r.rows;
}

export async function getUser(id){
 const r=await query('SELECT id,username,email,status,created_at,last_active_at FROM af_users WHERE id=$1',[String(id)]);
 return r.rows[0]||null;
}

export async function updateUser(id,input={}){
 const current=await getUser(id);
 if(!current)throw new Error('User not found.');
 const username=input.username===undefined?current.username:cleanUsername(input.username);
 const email=input.email===undefined?current.email:normalizeEmail(input.email);
 const status=input.status===undefined?current.status:String(input.status);
 if(!/^[A-Za-z0-9_.-]{3,100}$/.test(username))throw new Error('Username must be 3-100 characters and use letters, numbers, dots, underscores, or hyphens.');
 if(!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)||email.length>320)throw new Error('Invalid email address.');
 if(!STATUSES.has(status))throw new Error('Invalid user status.');
 await query('UPDATE af_users SET username=$2,email=$3,status=$4 WHERE id=$1',[current.id,username,email,status]);
 return getUser(current.id);
}

export async function resetUserPassword(id,password){
 if(String(password||'').length<12)throw new Error('Password must be at least 12 characters.');
 const user=await getUser(id);if(!user)throw new Error('User not found.');
 await query('UPDATE af_users SET password_hash=$2 WHERE id=$1',[user.id,await hashPassword(password)]);
 return {ok:true};
}

export async function deleteUser(id){
 const user=await getUser(id);if(!user)throw new Error('User not found.');
 await query('DELETE FROM af_watch_history WHERE user_id=$1',[user.id]);
 await query('DELETE FROM af_favorites WHERE user_id=$1',[user.id]);
 await query('DELETE FROM af_watchlists WHERE user_id=$1',[user.id]);
 await query('DELETE FROM af_comments WHERE user_id=$1',[user.id]);
 await query('DELETE FROM af_reports WHERE reporter_user_id=$1',[user.id]);
 await query('DELETE FROM af_users WHERE id=$1',[user.id]);
 return {ok:true};
}