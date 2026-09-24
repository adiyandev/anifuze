import {Router} from 'express';
import {requireAdmin} from './auth.js';
import {requirePermission} from '../auth/permissions.js';
import {resolveStream} from '../services/streamResolver.js';

export const providerDiagnosticsRouter=Router();
providerDiagnosticsRouter.use('/admin/providers/diagnostics',requireAdmin,requirePermission('providers_console'));

providerDiagnosticsRouter.post('/admin/providers/diagnostics/stream',async(req,res)=>{
 try{
  const animeId=String(req.body?.animeId||'').trim();
  const episode=String(req.body?.episode||'1').trim();
  const providerId=req.body?.providerId?String(req.body.providerId):undefined;
  if(!animeId)return res.status(400).json({ok:false,error:'Anime ID is required.'});
  const started=Date.now();
  const result=await resolveStream({animeId,episode,providerId});
  res.json({ok:true,elapsed_ms:Date.now()-started,result});
 }catch(error){res.status(400).json({ok:false,error:error.message});}
});
