import {query} from '../db/index.js';
import {config} from '../config.js';

export async function listSupportTickets(){const r=await query('SELECT * FROM af_support_tickets ORDER BY created_at DESC LIMIT 100');return r.rows;}
export async function createSupportTicket({adminUserId,subject,message,priority='normal'}){
 const s=String(subject||'').trim().slice(0,255),m=String(message||'').trim().slice(0,10000);
 if(!s||!m)throw new Error('Subject and message are required.');
 const p=['low','normal','high','urgent'].includes(priority)?priority:'normal';
 const r=await query('INSERT INTO af_support_tickets(admin_user_id,subject,message,priority) VALUES($1,$2,$3,$4) RETURNING *',[adminUserId,s,m,p]);
 const ticket=r.rows[0]; const webhook=String(process.env.ANIFUZE_SUPPORT_WEBHOOK_URL||'').trim();
 if(webhook){try{const x=await fetch(webhook,{method:'POST',headers:{'content-type':'application/json','user-agent':'AniFuze-Support'},body:JSON.stringify({ticket,installationId:config.installationId,domain:config.domain,version:config.version}),signal:AbortSignal.timeout(10000)});if(x.ok){const data=await x.json().catch(()=>({}));if(data.id||data.ticketId)await query('UPDATE af_support_tickets SET external_id=$1,updated_at=CURRENT_TIMESTAMP WHERE id=$2',[String(data.id||data.ticketId),ticket.id]);}}catch{}}
 return (await query('SELECT * FROM af_support_tickets WHERE id=$1',[ticket.id])).rows[0];
}
export async function updateSupportTicket(id,status){const allowed=['open','pending','resolved','closed'];if(!allowed.includes(status))throw new Error('Invalid ticket status.');const r=await query('UPDATE af_support_tickets SET status=$1,updated_at=CURRENT_TIMESTAMP WHERE id=$2 RETURNING *',[status,id]);return r.rows[0]||null;}
