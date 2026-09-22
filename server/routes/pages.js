import {Router} from 'express';
import {requireAdmin} from './auth.js';
import {requirePermission} from '../auth/permissions.js';
import {listPages,setPageEnabled} from '../services/pages.js';

const router=Router();
router.get('/pages',async(_req,res)=>{try{res.json({ok:true,pages:await listPages({publicOnly:true})});}catch{res.status(500).json({ok:false,error:'Pages unavailable.'});}});
router.get('/admin/pages',requireAdmin,requirePermission('pages_manage'),async(_req,res)=>{try{res.json({ok:true,pages:await listPages()});}catch(e){res.status(500).json({ok:false,error:e.message});}});
router.patch('/admin/pages/:slug',requireAdmin,requirePermission('pages_manage'),async(req,res)=>{try{res.json({ok:true,pages:await setPageEnabled(req.params.slug,req.body.enabled)});}catch(e){res.status(400).json({ok:false,error:e.message});}});
export {router as pagesRouter};