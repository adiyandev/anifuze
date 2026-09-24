import crypto from 'node:crypto';
import {query} from '../db/index.js';

export async function recordAudit({adminUserId=null,action,resourceType=null,resourceId=null,details={},ipAddress=null,userAgent=null}){
  try{await query('INSERT INTO af_audit_logs (id,admin_user_id,action,resource_type,resource_id,details,ip_address,user_agent) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',[crypto.randomUUID(),adminUserId,action,resourceType,resourceId,JSON.stringify(details||{}),ipAddress,userAgent]);}catch(error){console.error('Audit log write failed:',error?.message||error);}
}
export async function listAuditLogs({q='',action='',resourceType='',limit=50,offset=0}={}){
 const values=[];const where=[];
 if(q){values.push('%'+String(q).trim()+'%');where.push('(LOWER(a.action) LIKE LOWER(}
 if(action){values.push(String(action));where.push('a.action=$'+values.length);}
 if(resourceType){values.push(String(resourceType));where.push('a.resource_type=$'+values.length);}
 const lim=Math.min(Math.max(Number(limit)||50,1),200);const off=Math.max(Number(offset)||0,0);
 values.push(lim,off);
 const whereSql=where.length?'WHERE '+where.join(' AND '):'';
 const r=await query('SELECT a.id,a.admin_user_id,a.action,a.resource_type,a.resource_id,a.details,a.ip_address,a.user_agent,a.created_at,u.email FROM af_audit_logs a LEFT JOIN af_admin_users u ON u.id=a.admin_user_id '+whereSql+' ORDER BY a.created_at DESC LIMIT $'+(values.length-1)+' OFFSET $'+values.length,[...values]);
 const c=await query('SELECT COUNT(*) AS count FROM af_audit_logs a LEFT JOIN af_admin_users u ON u.id=a.admin_user_id '+whereSql,values.slice(0,-2));
 return {items:r.rows,total:c.rows[0]?.count||0,limit:lim,offset:off};
}+values.length+') OR LOWER(a.resource_type) LIKE LOWER(}
 if(action){values.push(String(action));where.push('a.action=$'+values.length);}
 if(resourceType){values.push(String(resourceType));where.push('a.resource_type=$'+values.length);}
 const lim=Math.min(Math.max(Number(limit)||50,1),200);const off=Math.max(Number(offset)||0,0);
 values.push(lim,off);
 const whereSql=where.length?'WHERE '+where.join(' AND '):'';
 const r=await query('SELECT a.id,a.admin_user_id,a.action,a.resource_type,a.resource_id,a.details,a.ip_address,a.user_agent,a.created_at,u.email FROM af_audit_logs a LEFT JOIN af_admin_users u ON u.id=a.admin_user_id '+whereSql+' ORDER BY a.created_at DESC LIMIT $'+(values.length-1)+' OFFSET $'+values.length,[...values]);
 const c=await query('SELECT COUNT(*) AS count FROM af_audit_logs a LEFT JOIN af_admin_users u ON u.id=a.admin_user_id '+whereSql,values.slice(0,-2));
 return {items:r.rows,total:c.rows[0]?.count||0,limit:lim,offset:off};
}+values.length+') OR LOWER(a.resource_id) LIKE LOWER(}
 if(action){values.push(String(action));where.push('a.action=$'+values.length);}
 if(resourceType){values.push(String(resourceType));where.push('a.resource_type=$'+values.length);}
 const lim=Math.min(Math.max(Number(limit)||50,1),200);const off=Math.max(Number(offset)||0,0);
 values.push(lim,off);
 const whereSql=where.length?'WHERE '+where.join(' AND '):'';
 const r=await query('SELECT a.id,a.admin_user_id,a.action,a.resource_type,a.resource_id,a.details,a.ip_address,a.user_agent,a.created_at,u.email FROM af_audit_logs a LEFT JOIN af_admin_users u ON u.id=a.admin_user_id '+whereSql+' ORDER BY a.created_at DESC LIMIT $'+(values.length-1)+' OFFSET $'+values.length,[...values]);
 const c=await query('SELECT COUNT(*) AS count FROM af_audit_logs a LEFT JOIN af_admin_users u ON u.id=a.admin_user_id '+whereSql,values.slice(0,-2));
 return {items:r.rows,total:c.rows[0]?.count||0,limit:lim,offset:off};
}+values.length+') OR LOWER(u.email) LIKE LOWER(}
 if(action){values.push(String(action));where.push('a.action=$'+values.length);}
 if(resourceType){values.push(String(resourceType));where.push('a.resource_type=$'+values.length);}
 const lim=Math.min(Math.max(Number(limit)||50,1),200);const off=Math.max(Number(offset)||0,0);
 values.push(lim,off);
 const whereSql=where.length?'WHERE '+where.join(' AND '):'';
 const r=await query('SELECT a.id,a.admin_user_id,a.action,a.resource_type,a.resource_id,a.details,a.ip_address,a.user_agent,a.created_at,u.email FROM af_audit_logs a LEFT JOIN af_admin_users u ON u.id=a.admin_user_id '+whereSql+' ORDER BY a.created_at DESC LIMIT $'+(values.length-1)+' OFFSET $'+values.length,[...values]);
 const c=await query('SELECT COUNT(*) AS count FROM af_audit_logs a LEFT JOIN af_admin_users u ON u.id=a.admin_user_id '+whereSql,values.slice(0,-2));
 return {items:r.rows,total:c.rows[0]?.count||0,limit:lim,offset:off};
}+values.length+'))');}
 if(action){values.push(String(action));where.push('a.action=$'+values.length);}
 if(resourceType){values.push(String(resourceType));where.push('a.resource_type=$'+values.length);}
 const lim=Math.min(Math.max(Number(limit)||50,1),200);const off=Math.max(Number(offset)||0,0);
 values.push(lim,off);
 const whereSql=where.length?'WHERE '+where.join(' AND '):'';
 const r=await query('SELECT a.id,a.admin_user_id,a.action,a.resource_type,a.resource_id,a.details,a.ip_address,a.user_agent,a.created_at,u.email FROM af_audit_logs a LEFT JOIN af_admin_users u ON u.id=a.admin_user_id '+whereSql+' ORDER BY a.created_at DESC LIMIT $'+(values.length-1)+' OFFSET $'+values.length,[...values]);
 const c=await query('SELECT COUNT(*) AS count FROM af_audit_logs a LEFT JOIN af_admin_users u ON u.id=a.admin_user_id '+whereSql,values.slice(0,-2));
 return {items:r.rows,total:c.rows[0]?.count||0,limit:lim,offset:off};
}