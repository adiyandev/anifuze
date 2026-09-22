import crypto from 'node:crypto';
import {query} from '../db/index.js';

const id=()=>crypto.randomUUID();
const TYPES=new Set(['info','success','warning','release','system']);
const AUDIENCES=new Set(['all','users','admins']);

function normalize(input={}){
 const title=String(input.title||'').trim();
 const message=String(input.message||'').trim();
 const type=String(input.type||'info').trim();
 const audience=String(input.audience||'all').trim();
 if(!title||title.length>255)throw new Error('Notification title must be 1-255 characters.');
 if(!message||message.length>5000)throw new Error('Notification message must be 1-5000 characters.');
 if(!TYPES.has(type))throw new Error('Invalid notification type.');
 if(!AUDIENCES.has(audience))throw new Error('Invalid notification audience.');
 return {title,message,type,audience,scheduled_at:input.scheduled_at?new Date(input.scheduled_at).toISOString():null,enabled:input.enabled===undefined?true:Boolean(input.enabled)};
}

export async function listNotifications({search='',enabled='',limit=100}={}){
 const q=String(search).trim().toLowerCase(),params=[],where=[];
 if(q){params.push('%'+q+'%');where.push('(LOWER(title) LIKE $1 OR LOWER(message) LIKE $1)');}
 if(enabled!==''){params.push(['true','1','yes'].includes(String(enabled).toLowerCase()));where.push('enabled=$'+params.length);}
 const r=await query(`SELECT id,title,message,type,audience,scheduled_at,sent_at,enabled,created_at
   FROM af_notifications ${where.length?'WHERE '+where.join(' AND '):''}
   ORDER BY created_at DESC LIMIT ${Math.min(Math.max(Number(limit)||100,1),200)}`,params);
 return r.rows;
}

export async function createNotification(input={}){
 const n=normalize(input),notification={id:id(),...n,created_at:new Date().toISOString()};
 await query('INSERT INTO af_notifications(id,title,message,type,audience,scheduled_at,enabled,created_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8)',[notification.id,notification.title,notification.message,notification.type,notification.audience,notification.scheduled_at,notification.enabled,notification.created_at]);
 return notification;
}

export async function updateNotification(notificationId,input={}){
 const r=await query('SELECT * FROM af_notifications WHERE id=$1',[String(notificationId)]);
 if(!r.rows[0])throw new Error('Notification not found.');
 const cur=r.rows[0],n=normalize({...cur,...input});
 await query('UPDATE af_notifications SET title=$2,message=$3,type=$4,audience=$5,scheduled_at=$6,enabled=$7 WHERE id=$1',[cur.id,n.title,n.message,n.type,n.audience,n.scheduled_at,n.enabled]);
 const updated=await query('SELECT id,title,message,type,audience,scheduled_at,sent_at,enabled,created_at FROM af_notifications WHERE id=$1',[cur.id]);\n return updated.rows[0]||null;
}

export async function deleteNotification(notificationId){
 const idValue=String(notificationId);
 await query('DELETE FROM af_user_notifications WHERE notification_id=$1',[idValue]);
 const r=await query('DELETE FROM af_notifications WHERE id=$1',[idValue]);
 if(!r.rowCount)throw new Error('Notification not found.');
 return {ok:true};
}

export async function listUserNotifications(userId,{limit=50,unreadOnly=false}={}){
 const uid=String(userId||'').trim();if(!uid)throw new Error('User id is required.');
 const safe=Math.min(Math.max(Number(limit)||50,1),100);
 const r=await query(`SELECT un.id,n.id AS notification_id,n.title,n.message,n.type,n.audience,un.read_at,un.created_at
   FROM af_user_notifications un JOIN af_notifications n ON n.id=un.notification_id
   WHERE un.user_id=$1 ${unreadOnly?'AND un.read_at IS NULL':''}
   ORDER BY un.created_at DESC LIMIT ${safe}`,[uid]);
 return r.rows;
}

export async function markNotificationRead(userId,idValue){
 const r=await query('UPDATE af_user_notifications SET read_at=CURRENT_TIMESTAMP WHERE id=$1 AND user_id=$2',[String(idValue),String(userId)]);
 if(!r.rowCount)throw new Error('Notification not found.');
 return {ok:true};
}

export async function markAllNotificationsRead(userId){
 await query('UPDATE af_user_notifications SET read_at=CURRENT_TIMESTAMP WHERE user_id=$1 AND read_at IS NULL',[String(userId)]);
 return {ok:true};
}

export async function deliverNotification(notificationId,userIds=[]){
 const n=(await query('SELECT * FROM af_notifications WHERE id=$1 AND enabled=true',[String(notificationId)])).rows[0];
 if(!n)throw new Error('Enabled notification not found.');
 const ids=[...new Set((userIds||[]).map(String).map(x=>x.trim()).filter(Boolean))];
 if(!ids.length)throw new Error('At least one recipient is required.');
 for(const userId of ids){
   const existing=await query('SELECT id FROM af_user_notifications WHERE notification_id=$1 AND user_id=$2 LIMIT 1',[n.id,userId]);
   if(!existing.rows[0]) await query('INSERT INTO af_user_notifications(id,notification_id,user_id,created_at) VALUES($1,$2,$3,CURRENT_TIMESTAMP)',[id(),n.id,userId]);
 }
 await query('UPDATE af_notifications SET sent_at=CURRENT_TIMESTAMP WHERE id=$1',[n.id]);
 return {ok:true,delivered:ids.length};
}

export async function deliverByAudience(notificationId,audience='all'){
 const n=(await query('SELECT * FROM af_notifications WHERE id=$1 AND enabled=true',[String(notificationId)])).rows[0];
 if(!n)throw new Error('Enabled notification not found.');
 const target=String(audience||n.audience);
 let rows;
 if(target==='admins') rows=(await query("SELECT id FROM af_admin_users WHERE enabled=TRUE")).rows;
 else if(target==='users') rows=(await query("SELECT id FROM af_users WHERE status='active'")).rows;
 else {
   const [users,admins]=await Promise.all([
     query("SELECT id FROM af_users WHERE status='active'"),
     query("SELECT id FROM af_admin_users WHERE enabled=TRUE")
   ]);
   rows=[...users.rows,...admins.rows];
 }
 return deliverNotification(notificationId,rows.map(x=>x.id));
}

export async function processDueNotifications(){
 const r=await query("SELECT id,audience FROM af_notifications WHERE enabled=true AND sent_at IS NULL AND scheduled_at IS NOT NULL AND scheduled_at <= CURRENT_TIMESTAMP");
 let delivered=0;
 for(const n of r.rows){ const result=await deliverByAudience(n.id,n.audience); delivered+=result.delivered||0; }
 return {processed:r.rows.length,delivered};
}
