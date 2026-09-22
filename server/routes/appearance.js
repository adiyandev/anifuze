import {Router} from 'express';
import {requireAdmin} from './auth.js';
import {requirePermission} from '../auth/permissions.js';
import {getAppearance,saveAppearance} from '../services/appearance.js';
const router=Router();
router.get('/appearance',async(_req,res)=>{try{res.json({ok:true,appearance:await getAppearance()});}catch(e){res.status(500).json({ok:false,error:e.message});}});
router.get('/admin/appearance',requireAdmin,requirePermission('appearance_manage'),async(_req,res)=>{try{res.json({ok:true,appearance:await getAppearance()});}catch(e){res.status(500).json({ok:false,error:e.message});}});
router.put('/admin/appearance',requireAdmin,requirePermission('appearance_manage'),async(req,res)=>{try{res.json({ok:true,appearance:await saveAppearance(req.body)});}catch(e){res.status(400).json({ok:false,error:e.message});}});
export {router as appearanceRouter};