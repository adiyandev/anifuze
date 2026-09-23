import crypto from 'node:crypto';
import {query} from '../db/index.js';
import {config} from '../config.js';

const normalizeKey=v=>String(v??'').trim().slice(0,500);
const hashKey=key=>crypto.createHash('sha256').update(key).digest('hex');
const hint=key=>key.length>8?key.slice(0,4)+'…'+key.slice(-4):'••••';
const row=async()=>{const r=await query('SELECT * FROM af_license WHERE id=1');return r.rows[0]||{status:'unlicensed'};};

export async function getLicense(){return row();}

async function persist({key,status,plan,customer,domain,expiresAt,metadata,lastError=null}){
 const keyHash=key?hashKey(key):null;
 await query(`UPDATE af_license SET key_hash=$1,key_hint=$2,status=$3,plan=$4,customer=$5,domain=$6,expires_at=$7,last_checked_at=CURRENT_TIMESTAMP,last_error=$8,metadata=$9,updated_at=CURRENT_TIMESTAMP WHERE id=1`,
 [keyHash,key?hint(key):null,status,plan||null,customer||null,domain||config.domain,expiresAt||null,lastError,JSON.stringify(metadata||{})]);
 return row();
}

export async function verifyLicense(inputKey=config.licenseKey){
 const key=normalizeKey(inputKey);
 if(!key||key==='dev-license')return persist({key:null,status:'unlicensed',domain:config.domain,lastError:'No production license key configured.'});
 const endpoint=String(process.env.ANIFUZE_LICENSE_SERVICE_URL||'').trim();
 if(!endpoint)return persist({key,status:'unverified',domain:config.domain,lastError:'License service URL is not configured.'});
 try{
  const response=await fetch(endpoint,{method:'POST',headers:{'content-type':'application/json','accept':'application/json','user-agent':'AniFuze-License-Client'},body:JSON.stringify({licenseKey:key,installationId:config.installationId,domain:config.domain,version:config.version}),signal:AbortSignal.timeout(10000)});
  const data=await response.json().catch(()=>({}));
  if(!response.ok||data.valid===false)throw new Error(data.error||'License verification failed.');
  if(data.valid!==true)throw new Error('License service returned an invalid verification response.');
  return persist({key,status:'active',plan:data.plan,customer:data.customer,domain:data.domain||config.domain,expiresAt:data.expiresAt,metadata:data,lastError:null});
 }catch(error){
  await query('UPDATE af_license SET status=CASE WHEN status=\'active\' THEN \'grace\' ELSE \'unverified\' END,last_checked_at=CURRENT_TIMESTAMP,last_error=$1,updated_at=CURRENT_TIMESTAMP WHERE id=1',[error.message]);
  return row();
 }
}
export async function clearLicense(){await query('UPDATE af_license SET key_hash=NULL,key_hint=NULL,status=\'unlicensed\',plan=NULL,customer=NULL,domain=NULL,expires_at=NULL,last_checked_at=CURRENT_TIMESTAMP,last_error=NULL,metadata=\'{}\',updated_at=CURRENT_TIMESTAMP WHERE id=1');return row();}
