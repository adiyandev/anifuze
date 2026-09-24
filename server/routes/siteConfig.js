import {Router} from 'express';
import {requireAdmin} from './auth.js';
import {requirePermission} from '../auth/permissions.js';
import {getSiteConfig,updateSiteConfig,toPublicSiteConfig} from '../services/siteConfig.js';
import {recordAudit} from '../services/audit.js';

export const siteConfigRouter=Router();
siteConfigRouter.get('/site-config',async(_req,res)=>{try{res.json({ok:true,config:toPublicSiteConfig(await getSiteConfig())});}catch(e){res.status(503).json({ok:false,error:'Site configuration unavailable.'});}});
import {getAppearance} from '../services/appearance.js';
import {listNavigation} from '../services/navigation.js';
import {getFooter} from '../services/footer.js';
import {getSeo} from '../services/seo.js';
import {listPages} from '../services/pages.js';

siteConfigRouter.get('/admin/site-setup/status',requireAdmin,requirePermission('settings_manage'),async(_req,res)=>{
 try{
  const [site,appearance,navigation,footer,seo,pages]=await Promise.all([getSiteConfig(),getAppearance(),listNavigation(),getFooter(),getSeo(),listPages()]);
  const checks=[
   {id:'brand',label:'Brand identity',ready:Boolean(site.site_name&&site.tagline)},
   {id:'appearance',label:'Appearance',ready:Boolean(appearance.primary_color&&appearance.accent_color&&appearance.font_family)},
   {id:'navigation',label:'Navigation',ready:navigation.length>0},
   {id:'footer',label:'Footer',ready:Boolean(footer.enabled!==undefined)},
   {id:'seo',label:'SEO',ready:Boolean(seo.site_title&&seo.description)},
   {id:'pages',label:'Site pages',ready:pages.length>0},
   {id:'domain',label:'Domain',ready:Boolean(site.domain)},
   {id:'contact',label:'Support contact',ready:Boolean(site.support_email)}
  ];
  res.json({ok:true,setupCompleted:Boolean(site.setup_completed),checks,complete:checks.filter(x=>x.ready).length,total:checks.length});
 }catch(e){res.status(500).json({ok:false,error:e.message});}
});

siteConfigRouter.get('/admin/site-config',requireAdmin,requirePermission('settings_manage'),async(_req,res)=>{try{res.json({ok:true,config:await getSiteConfig()});}catch(e){res.status(500).json({ok:false,error:e.message});}});
siteConfigRouter.put('/admin/site-config',requireAdmin,requirePermission('settings_manage'),async(req,res)=>{
 try{const config=await updateSiteConfig(req.body||{});await recordAudit({adminUserId:req.admin.id,action:'site_config.updated',resourceType:'site_config',resourceId:'1',details:{siteName:config.site_name,setupCompleted:config.setup_completed},ipAddress:req.ip,userAgent:req.headers['user-agent']});res.json({ok:true,config});}
 catch(e){res.status(400).json({ok:false,error:e.message});}
});
