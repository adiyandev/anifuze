import {query} from '../db/index.js';
const DEFAULTS={id:'orbit',name:'Orbit Studio',version:'1.0.0',homepage:{hero:true,sections:['trending','latest','popular']},watch:{player:true,episodes:true},pages:{home:true,browse:true,anime:true,watch:true,schedule:true},layout:{cardStyle:'poster',gridColumns:{desktop:6,tablet:4,mobile:2}}};
const parse=x=>{try{return typeof x==='string'?JSON.parse(x):x}catch{return {}}};
export async function ensureDefaultTemplate(){
 const r=await query('SELECT id FROM af_templates WHERE id=$1',['orbit']);
 if(!r.rows.length){const now=new Date();await query('INSERT INTO af_templates(id,name,version,status,config,installed_at,updated_at) VALUES($1,$2,$3,$4,$5,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)',['orbit','Orbit Studio','1.0.0','installed',JSON.stringify(DEFAULTS)]);}
 const s=await query('SELECT id FROM af_template_settings WHERE id=1');
 if(!s.rows.length)await query('INSERT INTO af_template_settings(id,active_template_id,config,updated_at) VALUES(1,$1,$2,CURRENT_TIMESTAMP)',['orbit',JSON.stringify(DEFAULTS)]);
}
export async function listTemplates(){await ensureDefaultTemplate();const r=await query('SELECT id,name,version,status,config,installed_at,updated_at FROM af_templates ORDER BY name ASC');return r.rows.map(x=>({...x,config:parse(x.config)}));}
export async function getActiveTemplate(){await ensureDefaultTemplate();const r=await query('SELECT s.active_template_id,s.config,t.name,t.version,t.status FROM af_template_settings s JOIN af_templates t ON t.id=s.active_template_id WHERE s.id=1');const x=r.rows[0];return x?{id:x.active_template_id,name:x.name,version:x.version,status:x.status,config:parse(x.config)}:DEFAULTS;}
export async function activateTemplate(id){await ensureDefaultTemplate();const r=await query('SELECT id,config FROM af_templates WHERE id=$1',[''+id]);if(!r.rows[0])throw new Error('Template not installed.');await query('UPDATE af_template_settings SET active_template_id=$1,config=$2,updated_at=CURRENT_TIMESTAMP WHERE id=1',[r.rows[0].id,r.rows[0].config]);return getActiveTemplate();}
export {DEFAULTS};