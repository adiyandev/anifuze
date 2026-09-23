import {Router} from 'express';
import {requireAdmin} from '../auth/middleware.js';
import {requirePermission} from '../auth/permissions.js';
import {cacheClear,cacheDelete,cacheKeys,cacheStats} from '../services/cache.js';
import {recordAudit} from '../services/audit.js';

export const cacheRouter=Router();
cacheRouter.use(requireAdmin,requirePermission('cache_manage'));
cacheRouter.get('/admin/cache',(_req,res)=>res.json({ok:true,stats:cacheStats(),entries:cacheKeys()}));
cacheRouter.post('/admin/cache/clear',async(req,res)=>{const count=cacheClear();await recordAudit(req,{action:'cache.cleared',resourceType:'cache',details:{count}});res.json({ok:true,cleared:count,stats:cacheStats()});});
cacheRouter.delete('/admin/cache/:key(*)',async(req,res)=>{const key=decodeURIComponent(req.params.key);const deleted=cacheDelete(key);if(deleted)await recordAudit(req,{action:'cache.deleted',resourceType:'cache',resourceId:key});res.json({ok:true,deleted});});
