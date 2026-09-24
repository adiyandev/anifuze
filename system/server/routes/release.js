import {Router} from 'express';
import {requireAdmin} from './auth.js';
import {requirePermission} from '../auth/permissions.js';
import {stageRelease,clearStagedRelease,getReleaseState} from '../services/releaseManager.js';
import {recordAudit} from '../services/audit.js';

export const releaseRouter=Router();
releaseRouter.use(requireAdmin,requirePermission('updates_manage'));
releaseRouter.get('/admin/updates/release',async(_req,res)=>{
  try{res.json({ok:true,state:await getReleaseState()});}
  catch(error){res.status(500).json({ok:false,error:error.message});}
});
releaseRouter.post('/admin/updates/release/stage',async(req,res)=>{
  try{
    const result=await stageRelease(req.body||{});
    await recordAudit({adminUserId:req.admin.id,action:'release.staged',resourceType:'release',resourceId:result.version,details:{version:result.version,checksum:result.checksum,backup:result.backup?.filename||null},ipAddress:req.ip,userAgent:req.get('user-agent')});
    res.json({ok:true,result,state:await getReleaseState()});
  }catch(error){res.status(400).json({ok:false,error:error.message});}
});
releaseRouter.delete('/admin/updates/release/stage',async(req,res)=>{
  try{
    const state=await clearStagedRelease();
    await recordAudit({adminUserId:req.admin.id,action:'release.stage_cleared',resourceType:'release',ipAddress:req.ip,userAgent:req.get('user-agent')});
    res.json({ok:true,state});
  }catch(error){res.status(400).json({ok:false,error:error.message});}
});
