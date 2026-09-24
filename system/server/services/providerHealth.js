import {query} from '../db/index.js';
import {testProvider} from './providers.js';
export async function monitorProviderHealth(){
 const r=await query('SELECT id FROM af_providers WHERE enabled=TRUE');
 return Promise.all(r.rows.map(async row=>{try{return await testProvider(row.id)}catch(error){return {status:'Offline',error:error.message,providerId:row.id}}}));
}
export async function getProviderHealth(){const r=await query('SELECT id,name,type,enabled,status,latency_ms,request_count,error_count,last_checked_at FROM af_providers ORDER BY priority ASC,name ASC');return r.rows.map(p=>{const requests=Number(p.request_count||0),errors=Number(p.error_count||0);return {...p,error_rate:requests?Number(((errors/requests)*100).toFixed(2)):0}})}
