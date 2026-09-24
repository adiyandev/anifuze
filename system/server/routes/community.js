import {Router} from 'express';
import {query} from '../db/index.js';
import {requireAdmin} from './auth.js';
import {requirePermission} from '../auth/permissions.js';
import {listComments,updateComment,deleteComment,listReports,updateReport,createReport} from '../services/community.js';
const router=Router();

router.get('/comments',async(req,res)=>{try{const r=await listComments({status:'visible',limit:req.query.limit});res.json({ok:true,comments:r});}catch(e){res.status(503).json({ok:false,error:e.message});}});
router.post('/reports',async(req,res)=>{try{res.status(201).json({ok:true,report:await createReport(req.body||{})});}catch(e){res.status(400).json({ok:false,error:e.message});}});

router.get('/admin/comments',requireAdmin,requirePermission('comments_moderate'),async(req,res)=>{try{res.json({ok:true,comments:await listComments(req.query)});}catch(e){res.status(400).json({ok:false,error:e.message});}});
router.patch('/admin/comments/:id',requireAdmin,requirePermission('comments_moderate'),async(req,res)=>{try{res.json({ok:true,comment:await updateComment(req.params.id,req.body||{})});}catch(e){res.status(400).json({ok:false,error:e.message});}});
router.delete('/admin/comments/:id',requireAdmin,requirePermission('comments_moderate'),async(req,res)=>{try{res.json(await deleteComment(req.params.id));}catch(e){res.status(400).json({ok:false,error:e.message});}});

router.get('/admin/reports',requireAdmin,requirePermission('reports_moderate'),async(req,res)=>{try{res.json({ok:true,reports:await listReports(req.query)});}catch(e){res.status(400).json({ok:false,error:e.message});}});
router.patch('/admin/reports/:id',requireAdmin,requirePermission('reports_moderate'),async(req,res)=>{try{res.json({ok:true,report:await updateReport(req.params.id,req.body||{})});}catch(e){res.status(400).json({ok:false,error:e.message});}});
router.delete('/admin/reports/:id',requireAdmin,requirePermission('reports_moderate'),async(req,res)=>{try{const r=await query('DELETE FROM af_reports WHERE id=$1',[String(req.params.id)]);if(!r.rowCount)return res.status(404).json({ok:false,error:'Report not found.'});res.json({ok:true});}catch(e){res.status(400).json({ok:false,error:e.message});}});
export {router as communityRouter};