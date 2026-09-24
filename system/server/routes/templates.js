import {Router} from 'express';
import {requireAdmin} from './auth.js';
import {requirePermission} from '../auth/permissions.js';
import {listMarketplaceTemplates,getTemplate,installTemplate,listInstalledTemplates,getActiveTemplate,activateTemplate,checkTemplateUpdate,updateTemplate,listTemplateVersions,rollbackTemplate,removeTemplate} from '../services/templates.js';
const router=Router();

router.get('/template',async(_req,res)=>{try{res.json({ok:true,template:await getActiveTemplate()});}catch(e){res.status(500).json({ok:false,error:e.message});}});
router.get('/admin/templates/marketplace',requireAdmin,requirePermission('templates_view'),async(_req,res)=>{try{res.json({ok:true,templates:await listMarketplaceTemplates()});}catch(e){res.status(503).json({ok:false,error:e.message});}});
router.get('/admin/templates',requireAdmin,requirePermission('templates_view'),async(_req,res)=>{try{res.json({ok:true,templates:await listInstalledTemplates()});}catch(e){res.status(500).json({ok:false,error:e.message});}});
router.get('/admin/templates/:id',requireAdmin,requirePermission('templates_view'),async(req,res)=>{try{const t=await getTemplate(req.params.id);const installed=await checkTemplateUpdate(req.params.id).catch(()=>null);res.json({ok:true,template:t,installed:installed?.installed||null,updateAvailable:Boolean(installed?.updateAvailable),compatibility:installed?.compatibility||null});}catch(e){try{const t=await getTemplate(req.params.id);res.json({ok:true,template:t,installed:null,updateAvailable:false});}catch(_){res.status(404).json({ok:false,error:e.message});}}});
router.get('/admin/templates/:id/versions',requireAdmin,requirePermission('templates_view'),async(req,res)=>{try{res.json({ok:true,versions:await listTemplateVersions(req.params.id)});}catch(e){res.status(500).json({ok:false,error:e.message});}});
router.get('/admin/templates/:id/update',requireAdmin,requirePermission('templates_view'),async(req,res)=>{try{res.json({ok:true,...await checkTemplateUpdate(req.params.id)});}catch(e){res.status(400).json({ok:false,error:e.message});}});
router.post('/admin/templates/:id/install',requireAdmin,requirePermission('templates_manage'),async(req,res)=>{try{res.status(201).json({ok:true,template:await installTemplate(req.params.id)});}catch(e){res.status(400).json({ok:false,error:e.message});}});
router.post('/admin/templates/:id/update',requireAdmin,requirePermission('templates_manage'),async(req,res)=>{try{res.json({ok:true,template:await updateTemplate(req.params.id)});}catch(e){res.status(400).json({ok:false,error:e.message});}});
router.post('/admin/templates/:id/rollback',requireAdmin,requirePermission('templates_manage'),async(req,res)=>{try{res.json({ok:true,template:await rollbackTemplate(req.params.id,req.body?.version)});}catch(e){res.status(400).json({ok:false,error:e.message});}});
router.delete('/admin/templates/:id',requireAdmin,requirePermission('templates_manage'),async(req,res)=>{try{res.json({ok:true,template:await removeTemplate(req.params.id)});}catch(e){res.status(400).json({ok:false,error:e.message});}});
router.patch('/admin/templates/active',requireAdmin,requirePermission('templates_manage'),async(req,res)=>{try{res.json({ok:true,template:await activateTemplate(req.body?.id)});}catch(e){res.status(400).json({ok:false,error:e.message});}});

export {router as templateRouter};