import {query} from '../db/index.js';
import crypto from 'node:crypto';

const COMMENT_STATUSES=new Set(['visible','hidden','deleted']);
const REPORT_STATUSES=new Set(['pending','reviewing','resolved','dismissed']);
const LIMIT=v=>Math.min(Math.max(Number(v)||100,1),200);

export async function listComments({search='',status='',limit=100}={}){
 const q=String(search).trim().toLowerCase(),params=[],where=[];
 if(q){params.push('%'+q+'%');where.push('(LOWER(c.body) LIKE $1 OR LOWER(u.username) LIKE $1 OR c.id LIKE $1)')}
 if(status){if(!COMMENT_STATUSES.has(status))throw new Error('Invalid comment status.');params.push(status);where.push('c.status=$'+params.length)}
 const r=await query(`SELECT c.id,c.user_id,c.anime_id,c.episode_id,c.body,c.status,c.pinned,c.created_at,c.updated_at,u.username,u.email FROM af_comments c LEFT JOIN af_users u ON u.id=c.user_id ${where.length?'WHERE '+where.join(' AND '):''} ORDER BY c.created_at DESC LIMIT ${LIMIT(limit)}`,params);
 return r.rows;
}
export async function updateComment(id,input={}){
 const r=await query('SELECT * FROM af_comments WHERE id=$1',[String(id)]);if(!r.rows[0])throw new Error('Comment not found.');
 const cur=r.rows[0],status=input.status===undefined?cur.status:String(input.status),pinned=input.pinned===undefined?Boolean(cur.pinned):Boolean(input.pinned);
 if(!COMMENT_STATUSES.has(status))throw new Error('Invalid comment status.');
 const body=input.body===undefined?cur.body:String(input.body).trim();if(!body||body.length>5000)throw new Error('Comment body must be 1-5000 characters.');
 await query('UPDATE af_comments SET body=$2,status=$3,pinned=$4,updated_at=CURRENT_TIMESTAMP WHERE id=$1',[cur.id,body,status,pinned]);
 return (await listComments({search:cur.id}))[0]||null;
}
export async function deleteComment(id){const r=await query('DELETE FROM af_comments WHERE id=$1',[String(id)]);if(!r.rowCount)throw new Error('Comment not found.');return {ok:true};}

export async function listReports({search='',status='',limit=100}={}){
 const q=String(search).trim().toLowerCase(),params=[],where=[];
 if(q){params.push('%'+q+'%');where.push('(LOWER(r.reason) LIKE $1 OR LOWER(COALESCE(r.notes,\'\')) LIKE $1 OR r.target_id LIKE $1 OR r.id LIKE $1)')}
 if(status){if(!REPORT_STATUSES.has(status))throw new Error('Invalid report status.');params.push(status);where.push('r.status=$'+params.length)}
 const r=await query(`SELECT r.*,u.username AS reporter_username,u.email AS reporter_email FROM af_reports r LEFT JOIN af_users u ON u.id=r.reporter_user_id ${where.length?'WHERE '+where.join(' AND '):''} ORDER BY r.created_at DESC LIMIT ${LIMIT(limit)}`,params);
 return r.rows;
}
export async function updateReport(id,input={}){
 const r=await query('SELECT * FROM af_reports WHERE id=$1',[String(id)]);if(!r.rows[0])throw new Error('Report not found.');
 const cur=r.rows[0],status=input.status===undefined?cur.status:String(input.status),notes=input.notes===undefined?cur.notes:String(input.notes??'').trim();
 if(!REPORT_STATUSES.has(status))throw new Error('Invalid report status.');if(notes.length>5000)throw new Error('Report notes are too long.');
 await query('UPDATE af_reports SET status=$2,notes=$3,resolved_at=$4 WHERE id=$1',[cur.id,status,notes||null,['resolved','dismissed'].includes(status)?new Date().toISOString():null]);
 return (await listReports({search:cur.id}))[0]||null;
}
export async function createReport(input={}){
 const targetType=String(input.target_type||'').trim(),targetId=String(input.target_id||'').trim(),reason=String(input.reason||'').trim(),notes=String(input.notes||'').trim();
 if(!['comment','anime','episode','user'].includes(targetType)||!targetId||targetId.length>128)throw new Error('Invalid report target.');
 if(!reason||reason.length>255||notes.length>5000)throw new Error('Invalid report content.');
 const id=crypto.randomUUID();
 await query('INSERT INTO af_reports (id,reporter_user_id,target_type,target_id,reason,notes,status,created_at) VALUES ($1,$2,$3,$4,$5,$6,\'pending\',CURRENT_TIMESTAMP)',[id,input.null,targetType,targetId,reason,notes||null]);
 return {id};
}
export {COMMENT_STATUSES,REPORT_STATUSES};