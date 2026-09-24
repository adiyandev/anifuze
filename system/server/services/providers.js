import crypto from 'node:crypto';
import {query} from '../db/index.js';

const TYPES=new Set(['API','Embed','Direct','Custom']);
const secret=()=>{const raw=process.env.ANIFUZE_ENCRYPTION_KEY;if(!raw)return null;return crypto.createHash('sha256').update(raw).digest();};
function encrypt(value){if(value==null||value==='')return null;const key=secret();if(!key)throw new Error('ANIFUZE_ENCRYPTION_KEY is required to store provider credentials.');const iv=crypto.randomBytes(12);const c=crypto.createCipheriv('aes-256-gcm',key,iv);const data=Buffer.concat([c.update(String(value),'utf8'),c.final()]);return [iv.toString('base64url'),c.getAuthTag().toString('base64url'),data.toString('base64url')].join('.');
}
function decrypt(value){if(!value)return null;const key=secret();if(!key)return null;const [iv,tag,data]=String(value).split('.');try{const d=crypto.createDecipheriv('aes-256-gcm',key,Buffer.from(iv,'base64url'));d.setAuthTag(Buffer.from(tag,'base64url'));return Buffer.concat([d.update(Buffer.from(data,'base64url')),d.final()]).toString('utf8')}catch{return null}}
function json(v){if(v==null)return null;if(typeof v==='string'){JSON.parse(v);return v}return JSON.stringify(v)}
function clean(row){return {...row,config_json:row.config_json?JSON.parse(row.config_json):{},credentials_configured:Boolean(row.credentials_encrypted),credentials_encrypted:undefined};}
export async function listProviders(){const r=await query('SELECT id,name,type,base_url,config_json,credentials_encrypted,priority,enabled,status,latency_ms,request_count,error_count,last_checked_at,created_at,updated_at FROM af_providers ORDER BY priority ASC,name ASC');return r.rows.map(clean);}
export async function getProvider(id){const r=await query('SELECT id,name,type,base_url,config_json,credentials_encrypted,priority,enabled,status,latency_ms,request_count,error_count,last_checked_at,created_at,updated_at FROM af_providers WHERE id=$1',[String(id)]);return r.rows[0]?clean(r.rows[0]):null;}
export async function saveProvider(id,body={}){
 const existing=id?await getProvider(id):null;if(id&&!existing)throw new Error('Provider not found.');
 const name=String(body.name??existing?.name??'').trim().slice(0,200);const type=String(body.type??existing?.type??'API');if(!name)throw new Error('Provider name is required.');if(!TYPES.has(type))throw new Error('Unsupported provider type.');
 const baseUrl=body.base_url===undefined?(existing?.base_url??null):String(body.base_url||'').trim()||null;
 let configJson=body.config===undefined?(existing?.config_json??{}):body.config;configJson=json(configJson??{}); const mode=String(configJson?.mode||type).toLowerCase();
 if(mode==='api'&&!baseUrl)throw new Error('API providers require a base URL.');
 if(mode==='embed'&&!configJson?.urlTemplate&&!configJson?.url_template&&!configJson?.embedUrl)throw new Error('Embed providers require a playback URL template.');
 if(mode==='api'&&!configJson?.source?.endpoint&&!configJson?.sourceEndpoint)throw new Error('API providers require a source endpoint.');
 const priority=Number.isInteger(Number(body.priority??existing?.priority??1))?Number(body.priority??existing?.priority??1):1;if(priority<1||priority>999)throw new Error('Priority must be between 1 and 999.');
 const enabled=body.enabled===undefined?(existing?.enabled??true):body.enabled;if(typeof enabled!=='boolean')throw new Error('enabled must be boolean.');
 const credentialInput=body.credentials===undefined?undefined:body.credentials;
 const credentialCipher=credentialInput===undefined?(existing?.credentials_encrypted??null):encrypt(credentialInput?JSON.stringify(credentialInput):'');
 const now=new Date();
 const providerId=String(id||crypto.randomUUID());
 const vals=[providerId,name,type,baseUrl,configJson,credentialCipher,priority,enabled,existing?.status||'Offline',existing?.latency_ms??null,existing?.request_count??0,existing?.error_count??0,existing?.last_checked_at??null,existing?.created_at||now,now];
 if(process.env.DB_CLIENT==='postgres')await query('INSERT INTO af_providers(id,name,type,base_url,config_json,credentials_encrypted,priority,enabled,status,latency_ms,request_count,error_count,last_checked_at,created_at,updated_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) ON CONFLICT(id) DO UPDATE SET name=EXCLUDED.name,type=EXCLUDED.type,base_url=EXCLUDED.base_url,config_json=EXCLUDED.config_json,credentials_encrypted=EXCLUDED.credentials_encrypted,priority=EXCLUDED.priority,enabled=EXCLUDED.enabled,updated_at=CURRENT_TIMESTAMP',[...vals]);else await query('INSERT INTO af_providers(id,name,type,base_url,config_json,credentials_encrypted,priority,enabled,status,latency_ms,request_count,error_count,last_checked_at,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE name=VALUES(name),type=VALUES(type),base_url=VALUES(base_url),config_json=VALUES(config_json),credentials_encrypted=VALUES(credentials_encrypted),priority=VALUES(priority),enabled=VALUES(enabled),updated_at=CURRENT_TIMESTAMP',vals);
 return getProvider(providerId);
}
export async function deleteProvider(id){const r=await query('DELETE FROM af_providers WHERE id=$1',[String(id)]);return r;}
export async function testProvider(id){const p=await getProvider(id);if(!p)throw new Error('Provider not found.');const started=Date.now();let status='Healthy';let error=null;
 if(p.base_url){try{const health=p.config_json?.health||{};const target=health.endpoint||p.base_url;const u=new URL(target,p.base_url);if(!['http:','https:'].includes(u.protocol))throw new Error('URL must use HTTP or HTTPS.');const ac=new AbortController();const t=setTimeout(()=>ac.abort(),8000);const r=await fetch(u,{method:String(health.method||'GET').toUpperCase(),redirect:'manual',signal:ac.signal,headers:{Accept:'application/json'}});clearTimeout(t);status=r.status>=200&&r.status<400?'Healthy':r.status<500?'Degraded':'Offline';if(r.status>=400)error='HTTP '+r.status;}catch(e){status='Offline';error=e.name==='AbortError'?'Request timed out':e.message;}}
 const latency=Date.now()-started;await query('UPDATE af_providers SET status=$1,latency_ms=$2,request_count=request_count+1,error_count=error_count+$3,last_checked_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE id=$4',[status,latency,status==='Healthy'?0:1,String(id)]);return {status,latency_ms:latency,error};}
export function decryptProviderCredential(cipher){return decrypt(cipher);}
