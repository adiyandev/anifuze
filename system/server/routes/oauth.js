import {Router} from 'express';
import {requireAdmin} from './auth.js';
import {requirePermission} from '../auth/permissions.js';
import {getOAuthSettings,saveOAuthSettings} from '../services/oauth.js';
import {recordAudit} from '../services/audit.js';
export const oauthRouter=Router();
oauthRouter.get('/admin/oauth',requireAdmin,requirePermission('settings_manage'),async(_req,res)=>{try{res.json({ok:true,oauth:await getOAuthSettings()})}catch(e){res.status(500).json({ok:false,error:e.message})}});
oauthRouter.put('/admin/oauth',requireAdmin,requirePermission('settings_manage'),async(req,res)=>{try{const oauth=await saveOAuthSettings(req.body||{});await recordAudit({adminUserId:req.admin.id,action:'oauth.settings_updated',resourceType:'oauth',details:{googleEnabled:oauth.google_enabled,googleConfigured:oauth.google_configured},ipAddress:req.ip,userAgent:req.get('user-agent')});res.json({ok:true,oauth})}catch(e){res.status(400).json({ok:false,error:e.message})}});
