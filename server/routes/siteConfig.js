import {Router} from 'express';
import {requireAdmin} from './auth.js';
import {requirePermission} from '../auth/permissions.js';
import {getSiteConfig,updateSiteConfig,toPublicSiteConfig} from '../services/siteConfig.js';
import {recordAudit} from '../services/audit.js';

export const siteConfigRouter=Router();
siteConfigRouter.get('/site-config',async(_req,res)=>{try{res.json({ok:true,config:toPublicSiteConfig(await getSiteConfig())});}catch(e){res.status(503).json({ok:false,error:'Site configuration unavailable.'});}});
siteConfigRouter.get('/admin/site-config',requireAdmin,requirePermission('settings_manage'),async(_req,res)=>{try{res.json({ok:true,config:await getSiteConfig()});}catch(e){res.status(500).json({ok:false,error:e.message});}});
siteConfigRouter.put('/admin/site-config',requireAdmin,requirePermission('settings_manage'),async(req,res)=>{
 try{const config=await updateSiteConfig(req.body||{});await recordAudit({adminUserId:req.admin.id,action:'site_config.updated',resourceType:'site_config',resourceId:'1',details:{siteName:config.site_name,setupCompleted:config.setup_completed},ipAddress:req.ip,userAgent:req.headers['user-agent']});res.json({ok:true,config});}
 catch(e){res.status(400).json({ok:false,error:e.message});}
});
