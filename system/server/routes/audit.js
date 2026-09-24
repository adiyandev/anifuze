import {Router} from 'express';
import {requireAdmin} from './auth.js';
import {requirePermission} from '../auth/permissions.js';
import {listAuditLogs} from '../services/audit.js';
const router=Router();
router.get('/admin/audit-logs',requireAdmin,requirePermission('audit_view'),async(req,res)=>{
 try{res.json({ok:true,...await listAuditLogs({q:req.query.q,action:req.query.action,resourceType:req.query.resourceType,limit:req.query.limit,offset:req.query.offset})});}
 catch(e){res.status(400).json({ok:false,error:e.message});}
});
export {router as auditRouter};