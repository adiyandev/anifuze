import {Router} from 'express';
import {requireAdmin} from './auth.js';
import {requirePermission} from '../auth/permissions.js';
import {listProviderMarketplace,getProviderMarketplaceItem,installMarketplaceProvider,updateMarketplaceProvider} from '../services/providerMarketplace.js';

const router=Router();
router.use('/admin/providers/marketplace',requireAdmin);
router.get('/admin/providers/marketplace',requirePermission('providers_view'),async(_req,res)=>{try{res.json({ok:true,providers:await listProviderMarketplace()})}catch(e){res.status(503).json({ok:false,error:e.message})}});
router.get('/admin/providers/marketplace/:id',requirePermission('providers_view'),async(req,res)=>{try{res.json({ok:true,provider:await getProviderMarketplaceItem(req.params.id)})}catch(e){res.status(404).json({ok:false,error:e.message})}});
router.post('/admin/providers/marketplace/:id/install',requirePermission('providers_manage'),async(req,res)=>{try{res.status(201).json({ok:true,provider:await installMarketplaceProvider(req.params.id)})}catch(e){res.status(400).json({ok:false,error:e.message})}});
router.post('/admin/providers/marketplace/:id/update',requirePermission('providers_manage'),async(req,res)=>{try{res.json({ok:true,provider:await updateMarketplaceProvider(req.params.id)})}catch(e){res.status(400).json({ok:false,error:e.message})}});
export {router as providerMarketplaceRouter};
