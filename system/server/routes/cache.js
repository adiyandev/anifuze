import {Router} from 'express';
import {requireAdmin} from './auth.js';
import {requirePermission} from '../auth/permissions.js';
import {cacheClear,cacheDelete,cacheKeys,cacheStats} from '../services/cache.js';
import {recordAudit} from '../services/audit.js';

export const cacheRouter=Router();
cacheRouter.use(requireAdmin,requirePermission('cache_manage'));
cacheRouter.get('/admin/cache',(_req,res)=>res.json({ok:true,stats:cacheStats(),entries:cacheKeys()}));
cacheRouter.post('/admin/cache/clear',async(req,res)=>{const count=cacheClear();await recordAudit({adminUserId:req.admin.id,action:'cache.cleared',resourceType:'cache',details:{count},ipAddress:req.ip,userAgent:req.get('user-agent')});res.json({ok:true,cleared:count,stats:cacheStats()});});
cacheRouter.delete('/admin/cache/:key(*)',async(req,res)=>{const key=decodeURIComponent(req.params.key);const deleted=cacheDelete(key);if(deleted)await recordAudit({adminUserId:req.admin.id,action:'cache.deleted',resourceType:'cache',resourceId:key,ipAddress:req.ip,userAgent:req.get('user-agent')});res.json({ok:true,deleted});});
