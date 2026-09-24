import {Router} from 'express';
import {requireAdmin} from './auth.js';
import {requirePermission} from '../auth/permissions.js';
import {getFooter,saveFooter} from '../services/footer.js';
const router=Router();
router.get('/footer',async(_req,res)=>{try{res.json({ok:true,footer:await getFooter()});}catch{res.status(500).json({ok:false,error:'Footer unavailable.'});}});
router.get('/admin/footer',requireAdmin,requirePermission('navigation_manage'),async(_req,res)=>{try{res.json({ok:true,footer:await getFooter()});}catch{res.status(500).json({ok:false,error:'Footer unavailable.'});}});
router.put('/admin/footer',requireAdmin,requirePermission('navigation_manage'),async(req,res)=>{try{res.json({ok:true,footer:await saveFooter(req.body||{})});}catch(e){res.status(400).json({ok:false,error:e.message});}});
export {router as footerRouter};
