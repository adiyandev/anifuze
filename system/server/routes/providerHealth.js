import {Router} from 'express';
import {requireAdmin} from './auth.js';
import {requirePermission} from '../auth/permissions.js';
import {getProviderHealth} from '../services/providerHealth.js';
const router=Router();router.use('/admin/providers/health',requireAdmin);
router.get('/admin/providers/health',requirePermission('providers_health'),async(_req,res)=>{try{res.json({ok:true,items:await getProviderHealth()})}catch(e){res.status(500).json({ok:false,error:e.message})}});
export {router as providerHealthRouter};
