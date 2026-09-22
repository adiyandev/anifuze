import {Router} from 'express';
import {requireAdmin} from './auth.js';
import {requirePermission} from '../auth/permissions.js';
import {listNotifications,createNotification,updateNotification,deleteNotification,listUserNotifications,markNotificationRead,markAllNotificationsRead} from '../services/notifications.js';

const router=Router();

router.get('/notifications',async(req,res)=>{
 try{
  const items=await listNotifications({limit:req.query.limit,search:req.query.search,enabled:req.query.enabled});
  res.json({ok:true,notifications:items});
 }catch(e){res.status(503).json({ok:false,error:e.message});}
});

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

router.delete('/admin/notifications/:id',requireAdmin,requirePermission('notifications_manage'),async(req,res)=>{
 try{res.json(await deleteNotification(req.params.id));}
 catch(e){res.status(400).json({ok:false,error:e.message});}
});

router.get('/user/notifications',async(req,res)=>{
 const userId=String(req.headers['x-anifuze-user-id']||'').trim();
 if(!userId)return res.status(401).json({ok:false,error:'Authenticated user required.'});
 try{res.json({ok:true,notifications:await listUserNotifications(userId,{limit:req.query.limit,unreadOnly:String(req.query.unread||'')==='true'})});}
 catch(e){res.status(400).json({ok:false,error:e.message});}
});

router.patch('/user/notifications/:id/read',async(req,res)=>{
 const userId=String(req.headers['x-anifuze-user-id']||'').trim();
 if(!userId)return res.status(401).json({ok:false,error:'Authenticated user required.'});
 try{res.json(await markNotificationRead(userId,req.params.id));}
 catch(e){res.status(400).json({ok:false,error:e.message});}
});

router.post('/user/notifications/read-all',async(req,res)=>{
 const userId=String(req.headers['x-anifuze-user-id']||'').trim();
 if(!userId)return res.status(401).json({ok:false,error:'Authenticated user required.'});
 try{res.json(await markAllNotificationsRead(userId));}
 catch(e){res.status(400).json({ok:false,error:e.message});}
});

export {router as notificationsRouter};
