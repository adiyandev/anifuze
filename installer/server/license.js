import crypto from 'node:crypto';
import {config} from '../../system/server/config.js';

export function getInstallationIdentity(){return {installationId:config.installationId,domain:config.domain,licenseKey:config.licenseKey};}
export async function verifyLicenseKey(licenseKey){
 const key=String(licenseKey??'').trim();
 if(!key) return {valid:false,status:'missing',error:'Product key is required.'};
 if(config.nodeEnv==='development'&&key==='dev-license') return {valid:true,status:'development'};
 const endpoint=String(config.licenseServiceUrl||'').trim();
 if(!endpoint)return {valid:false,status:'unconfigured',error:'License service URL is not configured.'};
 try{
  const response=await fetch(endpoint,{method:'POST',headers:{'content-type':'application/json','accept':'application/json','user-agent':'AniFuze-Installer'},body:JSON.stringify({licenseKey:key,installationId:config.installationId,domain:config.domain,version:config.version}),signal:AbortSignal.timeout(10000)});
  const data=await response.json().catch(()=>({}));
  if(!response.ok||data.valid!==true)return {valid:false,status:'invalid',error:data.error||'License verification failed.'};
  return {valid:true,status:'active',plan:data.plan||null,customer:data.customer||null,expiresAt:data.expiresAt||null};
 }catch(error){return {valid:false,status:'unreachable',error:error.message};}
}
export function createInstallationId(){return crypto.randomUUID();}
