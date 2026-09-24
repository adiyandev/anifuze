import {Router} from 'express';
import {requireAdmin} from './auth.js';
import {requirePermission} from '../auth/permissions.js';
import {listBlocks,saveBlocks} from '../services/siteBuilder.js';
const router=Router();
router.get('/site-builder/public',async(_req,res)=>{try{res.json({ok:true,blocks:await listBlocks('home',true)});}catch(e){res.status(500).json({ok:false,error:e.message});}});
router.get('/admin/site-builder',requireAdmin,requirePermission('site_builder_manage'),async(_req,res)=>{try{res.json({ok:true,blocks:await listBlocks('home',false)});}catch(e){res.status(500).json({ok:false,error:e.message});}});
router.put('/admin/site-builder',requireAdmin,requirePermission('site_builder_manage'),async(req,res)=>{try{res.json({ok:true,blocks:await saveBlocks('home',req.body?.blocks)});}catch(e){res.status(400).json({ok:false,error:e.message});}});
export {router as siteBuilderRouter};