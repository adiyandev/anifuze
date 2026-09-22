export const ADMIN_PERMISSIONS=Object.freeze({
  dashboard_view:['owner','admin'],
  anime_view:['owner','admin'], anime_manage:['owner','admin'],
  episodes_view:['owner','admin'], episodes_manage:['owner','admin'],
  providers_view:['owner','admin'], providers_manage:['owner','admin'], providers_console:['owner','admin'], providers_health:['owner','admin'], sources_view:['owner','admin'],
  templates_view:['owner','admin'], templates_manage:['owner','admin'], site_builder_manage:['owner','admin'], appearance_manage:['owner','admin'], navigation_manage:['owner','admin'], pages_manage:['owner','admin'], seo_manage:['owner','admin'],
  users_view:['owner','admin'], users_manage:['owner','admin'], comments_moderate:['owner','admin','moderator'], reports_moderate:['owner','admin','moderator'],
  analytics_view:['owner','admin'], notifications_manage:['owner','admin'], settings_manage:['owner','admin'], security_manage:['owner','admin'], audit_view:['owner','admin'], system_view:['owner','admin'],
  backups_manage:['owner'], maintenance_manage:['owner','admin'], updates_manage:['owner'], license_manage:['owner'], installation_manage:['owner']
});
export const ROLE_PERMISSIONS=Object.freeze(Object.fromEntries(['owner','admin','moderator'].map(role=>[role,Object.freeze(Object.entries(ADMIN_PERMISSIONS).filter(([,roles])=>roles.includes(role)).map(([permission])=>permission))])));
export function hasPermission(role,permission){return Boolean(role&&ROLE_PERMISSIONS[role]?.includes(permission));}
export function requirePermission(...permissions){return async(req,res,next)=>{if(!req.admin)return res.status(401).json({ok:false,error:'Authentication required.'});if(!permissions.length||permissions.some(permission=>hasPermission(req.admin.role,permission)))return next();return res.status(403).json({ok:false,error:'Insufficient permissions.'});};}
export function requireAllPermissions(...permissions){return async(req,res,next)=>{if(!req.admin)return res.status(401).json({ok:false,error:'Authentication required.'});if(permissions.every(permission=>hasPermission(req.admin.role,permission)))return next();return res.status(403).json({ok:false,error:'Insufficient permissions.'});};}
