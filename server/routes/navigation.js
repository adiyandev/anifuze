import {Router} from 'express';
import {requireAdmin} from './auth.js';
import {requirePermission} from '../auth/permissions.js';
import {listNavigation,saveNavigation} from '../services/navigation.js';

const router=Router();

router.get('/navigation',async(_req,res)=>{
 try{res.json({ok:true,items:await listNavigation({publicOnly:true})});}
 catch(e){res.status(500).json({ok:false,error:'Navigation unavailable.'});}
});

router.get('/admin/navigation',requireAdmin,requirePermission('navigation_manage'),async(_req,res)=>{
 try{res.json({ok:true,items:await listNavigation()});}
 catch(e){res.status(500).json({ok:false,error:e.message});}
});

router.put('/admin/navigation',requireAdmin,requirePermission('navigation_manage'),async(req,res)=>{
 try{res.json({ok:true,items:await saveNavigation(req.body.items)});}
 catch(e){res.status(400).json({ok:false,error:e.message});}
});

export {router as navigationRouter};