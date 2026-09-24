import {query} from '../db/index.js';
import {config} from '../config.js';
import {fetchTemplatePackageMetadata,downloadVerifiedPackage,storeTemplatePackage,installTemplatePackage} from './templatePackage.js';

const parse=x=>{try{return typeof x==='string'?JSON.parse(x):x||{}}catch{return {}}};
export const normalizeTemplate=x=>({id:String(x?.id||'').trim(),name:String(x?.name||'').trim(),version:String(x?.version||'1.0.0'),status:String(x?.status||'available'),config:parse(x?.config),description:String(x?.description||''),category:String(x?.category||''),packageUrl:String(x?.packageUrl||x?.package_url||''),packageSha256:String(x?.packageSha256||x?.package_sha256||'').toLowerCase(),packageSignature:String(x?.packageSignature||x?.package_signature||''),packageSize:Number(x?.packageSize||x?.package_size||0),compatibility:parse(x?.compatibility)});
async function central(path){
 const base=String(config.templateServiceUrl||'').trim();
 if(!base)throw new Error('AniFuze template service is not configured.');
 const url=new URL(path,base);
 if(url.protocol!=='https:'&&config.nodeEnv!=='development')throw new Error('Template service must use HTTPS.');
 const r=await fetch(url,{headers:{accept:'application/json','user-agent':'AniFuze-TemplateClient/'+config.version},signal:AbortSignal.timeout(15000)});
 const data=await r.json().catch(()=>null);
 if(!r.ok||!data)throw new Error(data?.error||'Template service request failed.');
 return data;
}
export async function listTemplates(){const data=await central('/templates');return Array.isArray(data.templates)?data.templates.map(normalizeTemplate).filter(x=>x.id&&x.name):[];}
export async function getTemplate(id){const data=await central('/templates/'+encodeURIComponent(String(id)));return normalizeTemplate(data.template||data);}
export async function installTemplate(id){
 const remote=normalizeTemplate(await fetchTemplatePackageMetadata(id));
 const packageBuffer=await downloadVerifiedPackage(remote);
 const packagePath=await installTemplatePackage(remote,packageBuffer);
 if(!remote.id)throw new Error('Template was not found.');
 const now=new Date().toISOString();
 await query('INSERT INTO af_templates(id,name,version,status,config,installed_at,updated_at,package_url,package_sha256,package_signature,package_size,package_path,compatibility,description,category) VALUES($1,$2,$3,$4,$5,$6,$6,$7,$8,$9,$10,$11,$12,$13,$14) ON CONFLICT(id) DO UPDATE SET name=$2,version=$3,status=$4,config=$5,updated_at=$6,package_url=$7,package_sha256=$8,package_signature=$9,package_size=$10,package_path=$11,compatibility=$12,description=$13,category=$14',[remote.id,remote.name,remote.version,'installed',JSON.stringify(remote.config),now,remote.packageUrl,remote.packageSha256,remote.packageSignature,packageBuffer.length,packagePath,JSON.stringify(remote.compatibility),remote.description,remote.category]);
 return getInstalledTemplate(remote.id);
}
export async function getInstalledTemplate(id){const r=await query('SELECT id,name,version,status,config,installed_at,updated_at,package_url,package_sha256,package_signature,package_size,package_path,compatibility,description,category FROM af_templates WHERE id=$1',[String(id)]);const x=r.rows[0];return x?{...x,config:parse(x.config),compatibility:parse(x.compatibility)}:null;}
export async function listInstalledTemplates(){const r=await query('SELECT id,name,version,status,config,installed_at,updated_at,package_url,package_sha256,package_signature,package_size,package_path,compatibility,description,category FROM af_templates ORDER BY name ASC');return r.rows.map(x=>({...x,config:parse(x.config),compatibility:parse(x.compatibility)}));}
export async function getActiveTemplate(){const r=await query('SELECT s.active_template_id,s.config,t.name,t.version,t.status FROM af_template_settings s JOIN af_templates t ON t.id=s.active_template_id WHERE s.id=1');const x=r.rows[0];return x?{id:x.active_template_id,name:x.name,version:x.version,status:x.status,config:parse(x.config)}:null;}
export async function activateTemplate(id){const installed=await getInstalledTemplate(id);if(!installed)throw new Error('Template is not installed.');await query('UPDATE af_template_settings SET active_template_id=$1,config=$2,updated_at=CURRENT_TIMESTAMP WHERE id=1',[installed.id,JSON.stringify(installed.config)]);return getActiveTemplate();}
