import {Router} from 'express';
import {requireAdmin} from './auth.js';
import {requirePermission} from '../auth/permissions.js';
import {getProviderDefinition,invokeProviderOperation,PROVIDER_OPERATIONS} from '../services/providerSdk.js';

export const providerSdkRouter=Router();
providerSdkRouter.use('/admin/providers/sdk',requireAdmin,requirePermission('providers_console'));
providerSdkRouter.get('/admin/providers/sdk/:id',async(req,res)=>{
 try{const p=await getProviderDefinition(req.params.id);res.json({ok:true,sdkVersion:1,operations:PROVIDER_OPERATIONS.filter(op=>p.config_json?.sdk?.operations?.[op]||p.config_json?.operations?.[op])});}
 catch(e){res.status(400).json({ok:false,error:e.message});}
});
providerSdkRouter.post('/admin/providers/sdk/:id/:operation',async(req,res)=>{
 try{if(!PROVIDER_OPERATIONS.includes(req.params.operation))return res.status(400).json({ok:false,error:'Unsupported provider operation.'});const result=await invokeProviderOperation(req.params.id,req.params.operation,req.body||{});res.json({ok:true,...result});}
 catch(e){res.status(400).json({ok:false,error:e.message});}
});
