import {Router} from 'express';
import {requireAdmin} from './auth.js';
import {requirePermission} from '../auth/permissions.js';
import {getSystemInformation} from '../services/systemInfo.js';
const router=Router();
router.get('/admin/system-info',requireAdmin,requirePermission('system_view'),async(_req,res)=>{try{res.json({ok:true,system:await getSystemInformation()});}catch(e){res.status(500).json({ok:false,error:e.message});}});
export {router as systemInfoRouter};
