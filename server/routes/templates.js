import {Router} from 'express';
import {requireAdmin} from './auth.js';
import {requirePermission} from '../auth/permissions.js';
import {listTemplates,getActiveTemplate,activateTemplate} from '../services/templates.js';
const router=Router();
router.get('/template',async(_req,res)=>{try{res.json({ok:true,template:await getActiveTemplate()});}catch(e){res.status(500).json({ok:false,error:e.message});}});
router.get('/admin/templates',requireAdmin,requirePermission('templates_view'),async(_req,res)=>res.json({ok:true,templates:await listTemplates()}));
router.patch('/admin/templates/active',requireAdmin,requirePermission('templates_manage'),async(req,res)=>{try{res.json({ok:true,template:await activateTemplate(req.body?.id)});}catch(e){res.status(400).json({ok:false,error:e.message});}});
export {router as templateRouter};