import {Router} from 'express';
import {requireAdmin} from './auth.js';
import {requirePermission} from '../auth/permissions.js';
import {listNotifications,createNotification,updateNotification,deleteNotification,deliverByAudience} from '../services/notifications.js';

const router=Router();

router.get('/admin/notifications',requireAdmin,requirePermission('notifications_manage'),async(req,res)=>{
 try{res.json({ok:true,notifications:await listNotifications(req.query)});}
 catch(e){res.status(400).json({ok:false,error:e.message});}
});

router.post('/admin/notifications',requireAdmin,requirePermission('notifications_manage'),async(req,res)=>{
 try{res.status(201).json({ok:true,notification:await createNotification(req.body||{})});}
 catch(e){res.status(400).json({ok:false,error:e.message});}
});

router.patch('/admin/notifications/:id',requireAdmin,requirePermission('notifications_manage'),async(req,res)=>{
 try{res.json({ok:true,notification:await updateNotification(req.params.id,req.body||{})});}
 catch(e){res.status(400).json({ok:false,error:e.message});}
});

router.post('/admin/notifications/:id/deliver',requireAdmin,requirePermission('notifications_manage'),async(req,res)=>{\n try{res.json(await deliverByAudience(req.params.id));}\n catch(e){res.status(400).json({ok:false,error:e.message});}\n});\n\nrouter.delete('/admin/notifications/:id',requireAdmin,requirePermission('notifications_manage'),async(req,res)=>{
 try{res.json(await deleteNotification(req.params.id));}
 catch(e){res.status(400).json({ok:false,error:e.message});}
});

export {router as notificationsRouter};
