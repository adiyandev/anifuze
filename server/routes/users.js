import {Router} from 'express';
import crypto from 'node:crypto';
import {requireAdmin} from './auth.js';
import {requirePermission} from '../auth/permissions.js';
import {listUsers,getUser,updateUser,resetUserPassword,deleteUser} from '../services/users.js';

const router=Router();
router.get('/admin/users',requireAdmin,requirePermission('users_view'),async(req,res)=>{
 try{res.json({ok:true,users:await listUsers({search:req.query.q,status:req.query.status,limit:req.query.limit})});}
 catch(e){res.status(400).json({ok:false,error:e.message});}
});
router.get('/admin/users/:id',requireAdmin,requirePermission('users_view'),async(req,res)=>{
 try{const user=await getUser(req.params.id);if(!user)return res.status(404).json({ok:false,error:'User not found.'});res.json({ok:true,user});}
 catch(e){res.status(400).json({ok:false,error:e.message});}
});
router.patch('/admin/users/:id',requireAdmin,requirePermission('users_manage'),async(req,res)=>{
 try{res.json({ok:true,user:await updateUser(req.params.id,req.body||{})});}
 catch(e){res.status(400).json({ok:false,error:e.message});}
});
router.post('/admin/users/:id/password',requireAdmin,requirePermission('users_manage'),async(req,res)=>{
 try{res.json(await resetUserPassword(req.params.id,req.body?.password));}
 catch(e){res.status(400).json({ok:false,error:e.message});}
});
router.delete('/admin/users/:id',requireAdmin,requirePermission('users_manage'),async(req,res)=>{
 try{res.json(await deleteUser(req.params.id));}
 catch(e){res.status(400).json({ok:false,error:e.message});}
});
export {router as usersRouter};