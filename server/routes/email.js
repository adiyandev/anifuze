import {Router} from 'express';
import {requireAdmin} from './auth.js';
import {requirePermission} from '../auth/permissions.js';
import {getEmailSettings,saveEmailSettings,testEmail,listEmailTemplates,updateEmailTemplate} from '../services/email.js';

const router=Router();

router.get('/admin/email/settings',requireAdmin,requirePermission('email_manage'),async(_req,res)=>{try{res.json({ok:true,settings:await getEmailSettings()});}catch(e){res.status(500).json({ok:false,error:e.message});}});
router.put('/admin/email/settings',requireAdmin,requirePermission('email_manage'),async(req,res)=>{try{res.json({ok:true,settings:await saveEmailSettings(req.body||{})});}catch(e){res.status(400).json({ok:false,error:e.message});}});
router.post('/admin/email/test',requireAdmin,requirePermission('email_manage'),async(req,res)=>{try{res.json(await testEmail(req.body?.to));}catch(e){res.status(400).json({ok:false,error:e.message});}});
router.get('/admin/email/templates',requireAdmin,requirePermission('email_manage'),async(_req,res)=>{try{res.json({ok:true,templates:await listEmailTemplates()});}catch(e){res.status(500).json({ok:false,error:e.message});}});
router.patch('/admin/email/templates/:id',requireAdmin,requirePermission('email_manage'),async(req,res)=>{try{res.json({ok:true,template:await updateEmailTemplate(req.params.id,req.body||{})});}catch(e){res.status(400).json({ok:false,error:e.message});}});

export {router as emailRouter};
