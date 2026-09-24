import {query} from '../db/index.js';
import {testProvider} from './providers.js';

export async function monitorProviderHealth(){
 const r=await query('SELECT id FROM af_providers WHERE enabled=TRUE');
 const results=[];
 for(const row of r.rows){
  try{results.push({providerId:row.id,...await testProvider(row.id)});}
  catch(error){results.push({providerId:row.id,status:'Offline',error:error.message});}
 }
 return results;
}
export async function getProviderHealth(){
 const r=await query('SELECT id,name,type,enabled,status,latency_ms,request_count,error_count,last_checked_at FROM af_providers ORDER BY priority ASC,name ASC');
 return r.rows.map(p=>{const requests=Number(p.request_count||0),errors=Number(p.error_count||0);return {...p,error_rate:requests?Number(((errors/requests)*100).toFixed(2)):0}});
}
export function providerHealthRank(provider){
 const status=String(provider?.status||'').toLowerCase();
 return status==='healthy'?0:status==='degraded'?1:status==='offline'?2:1;
}
export function shouldAttemptProvider(provider,now=Date.now()){
 if(!provider?.enabled)return false;
 if(String(provider.status||'').toLowerCase()!=='offline'||!provider.last_checked_at)return true;
 const checked=Date.parse(provider.last_checked_at);
 if(!Number.isFinite(checked))return true;
 const cooldown=Math.min(300000,Math.max(10000,Number(provider.config_json?.health?.cooldownMs)||60000));
 return now-checked>=cooldown;
}
