import crypto from 'node:crypto';
import {query} from '../db/index.js';
import {config} from '../config.js';

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
