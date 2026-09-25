import {Router} from 'express';
import crypto from 'node:crypto';
import {getUserFromRequest} from '../services/userAuth.js';
import {query} from '../db/index.js';
import {getProvider,saveProvider,deleteProvider} from '../services/providers.js';
import {config} from '../config.js';

const router=Router();
const hash=v=>crypto.createHash('sha256').update(String(v)).digest('hex');
const licenseService=()=>String(config.licenseServiceUrl||process.env.ANIFUZE_LICENSE_SERVICE_URL||'').trim().replace(/\/$/,'');

async function customer(req,res,next){const user=await getUserFromRequest(req);if(!user)return res.status(401).json({ok:false,error:'Customer authentication required.'});req.customer=user;next();}
async function verifyEntitlement(req){
 const local=await query('SELECT key_hash,status,metadata FROM af_license WHERE id=1');
 const license=local.rows[0];if(!license?.key_hash||!['active','grace'].includes(String(license.status)))throw new Error('An active AniFuze license is required.');
 const endpoint=licenseService();if(!endpoint)throw new Error('AniFuze license service is not configured.');
 const response=await fetch(endpoint+'/api/license/verify',{method:'POST',headers:{'content-type':'application/json','accept':'application/json','user-agent':'AniFuze-Provider-Client'},body:JSON.stringify({licenseHash:license.key_hash,installationId:config.installationId,domain:config.domain,version:config.version})});
 const data=await response.json().catch(()=>({}));if(!response.ok||data.valid!==true)throw new Error(data.error||'AniFuze license verification failed.');return data;
}
router.use(customer);
router.get('/customer/providers',async(req,res)=>{try{const license=await verifyEntitlement(req);const {rows}=await query('SELECT id,name,type,base_url,config_json,priority,enabled,status,latency_ms,request_count,error_count,last_checked_at,created_at,updated_at FROM af_providers WHERE owner_user_id=$1 AND product_license_id=$2 ORDER BY priority ASC,name ASC',[req.customer.id,license.licenseId]);res.json({ok:true,items:rows.map(r=>({...r,config_json:r.config_json?JSON.parse(r.config_json):{}}))});}catch(e){res.status(403).json({ok:false,error:e.message});}});
router.post('/customer/providers',async(req,res)=>{try{const license=await verifyEntitlement(req);const body={...(req.body||{}),type:req.body?.type||'API'};if(!['API','Embed'].includes(body.type))return res.status(400).json({ok:false,error:'Customers may manage API and Embed providers only.'});const item=await saveProvider(null,body);await query('UPDATE af_providers SET owner_user_id=$1,ownership=\'customer\',product_license_id=$2,immutable_admin=TRUE WHERE id=$3',[req.customer.id,license.licenseId,item.id]);res.status(201).json({ok:true,item:await getProvider(item.id)});}catch(e){res.status(400).json({ok:false,error:e.message});}});
router.patch('/customer/providers/:id',async(req,res)=>{try{const license=await verifyEntitlement(req);const owned=await query('SELECT id FROM af_providers WHERE id=$1 AND owner_user_id=$2 AND product_license_id=$3 AND type IN (\'API\',\'Embed\')',[req.params.id,req.customer.id,license.licenseId]);if(!owned.rows[0])return res.status(404).json({ok:false,error:'Provider not found.'});const item=await saveProvider(req.params.id,{...(req.body||{}),type:undefined});await query('UPDATE af_providers SET immutable_admin=TRUE,ownership=\'customer\' WHERE id=$1',[item.id]);res.json({ok:true,item:await getProvider(item.id)});}catch(e){res.status(400).json({ok:false,error:e.message});}});
router.delete('/customer/providers/:id',async(req,res)=>{try{const license=await verifyEntitlement(req);const owned=await query('SELECT id FROM af_providers WHERE id=$1 AND owner_user_id=$2 AND product_license_id=$3 AND type IN (\'API\',\'Embed\')',[req.params.id,req.customer.id,license.licenseId]);if(!owned.rows[0])return res.status(404).json({ok:false,error:'Provider not found.'});await deleteProvider(req.params.id);res.json({ok:true});}catch(e){res.status(400).json({ok:false,error:e.message});}});
export {router as customerProvidersRouter};
