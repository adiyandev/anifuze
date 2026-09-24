import {Router} from 'express';
import {requireAdmin} from './auth.js';
import {requirePermission} from '../auth/permissions.js';
import {getSeo,saveSeo,buildRobots,buildSitemap} from '../services/seo.js';

const router=Router();

router.get('/seo',async(_req,res)=>{
 try{res.json({ok:true,seo:await getSeo()});}
 catch(e){res.status(500).json({ok:false,error:e.message});}
});

router.get('/admin/seo',requireAdmin,requirePermission('seo_manage'),async(_req,res)=>{
 try{res.json({ok:true,seo:await getSeo()});}
 catch(e){res.status(500).json({ok:false,error:e.message});}
});

router.put('/admin/seo',requireAdmin,requirePermission('seo_manage'),async(req,res)=>{
 try{res.json({ok:true,seo:await saveSeo(req.body)});}
 catch(e){res.status(400).json({ok:false,error:e.message});}
});

router.get('/robots.txt',async(_req,res)=>{
 try{
  const seo=await getSeo();
  res.type('text/plain').send(buildRobots(seo));
 }catch(e){res.status(503).type('text/plain').send('User-agent: *\nDisallow: /\n');}
});

router.get('/sitemap.xml',async(_req,res)=>{
 try{
  const seo=await getSeo();
  if(!seo.sitemap_enabled)return res.status(404).type('text/plain').send('Sitemap disabled');
  res.type('application/xml').send(buildSitemap(seo));
 }catch(e){res.status(503).type('application/xml').send('<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');}
});

export {router as seoRouter};