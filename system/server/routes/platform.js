import {Router} from 'express';
import {requireAdmin} from './auth.js';
import {requirePermission} from '../auth/permissions.js';
import {query} from '../db/index.js';

export const platformRouter=Router();
platformRouter.get('/admin/platform/overview',requireAdmin,requirePermission('dashboard_view'),async(_req,res)=>{
 try{
  const [users,anime,episodes,providers,templates,comments,reports,analytics,audit]=await Promise.all([
   query('SELECT COUNT(*)::int AS total,COUNT(*) FILTER (WHERE enabled=TRUE)::int AS active FROM af_users'),
   query('SELECT COUNT(*)::int AS total,COUNT(*) FILTER (WHERE enabled=TRUE)::int AS active FROM af_anime'),
   query('SELECT COUNT(*)::int AS total,COUNT(*) FILTER (WHERE visible=TRUE)::int AS visible FROM af_episodes'),
   query('SELECT COUNT(*)::int AS total,COUNT(*) FILTER (WHERE enabled=TRUE)::int AS active FROM af_providers'),
   query('SELECT COUNT(*)::int AS total,COUNT(*) FILTER (WHERE active=TRUE)::int AS active FROM af_templates'),
   query('SELECT COUNT(*)::int AS total,COUNT(*) FILTER (WHERE status=\'visible\')::int AS visible FROM af_comments'),
   query('SELECT COUNT(*)::int AS total,COUNT(*) FILTER (WHERE status=\'pending\')::int AS pending FROM af_reports'),
   query('SELECT COUNT(*)::int AS total FROM af_analytics_events'),
   query('SELECT COUNT(*)::int AS total FROM af_audit_logs')
  ]);
  res.json({ok:true,overview:{customers:users.rows[0],anime:anime.rows[0],episodes:episodes.rows[0],providers:providers.rows[0],templates:templates.rows[0],comments:comments.rows[0],reports:reports.rows[0],analytics:analytics.rows[0],audit:audit.rows[0]}});
 }catch(e){res.status(503).json({ok:false,error:'Platform overview unavailable.'});}
});
