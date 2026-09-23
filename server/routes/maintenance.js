import {Router} from 'express';
import {requireAdmin} from './auth.js';
import {requirePermission} from '../auth/permissions.js';
import {getMaintenance,saveMaintenance} from '../services/maintenance.js';
import {recordAudit} from '../services/audit.js';

export const maintenanceRouter=Router();

maintenanceRouter.get('/maintenance',async(_req,res)=>{
  try{res.json({ok:true,maintenance:await getMaintenance()});}
  catch(error){res.status(500).json({ok:false,error:error.message});}
});

maintenanceRouter.get('/admin/maintenance',requireAdmin,requirePermission('maintenance_manage'),async(_req,res)=>{
  try{res.json({ok:true,maintenance:await getMaintenance()});}
  catch(error){res.status(500).json({ok:false,error:error.message});}
});

maintenanceRouter.put('/admin/maintenance',requireAdmin,requirePermission('maintenance_manage'),async(req,res)=>{
  try{
    const maintenance=await saveMaintenance(req.body||{});
    await recordAudit({adminUserId:req.admin.id,action:'maintenance.updated',resourceType:'maintenance',details:{enabled:maintenance.enabled},ipAddress:req.ip,userAgent:req.get('user-agent')});
    res.json({ok:true,maintenance});
  }catch(error){res.status(400).json({ok:false,error:error.message});}
});
