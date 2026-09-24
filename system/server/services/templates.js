import {query} from '../db/index.js';
import fs from 'node:fs/promises';
import {config} from '../config.js';
import {fetchTemplatePackageMetadata,downloadVerifiedPackage,installTemplatePackage,removeStoredTemplate} from './templatePackage.js';

const parse=x=>{try{return typeof x==='string'?JSON.parse(x):x||{}}catch{return {}}};

export const normalizeTemplate=x=>({id:String(x?.id||'').trim(),name:String(x?.name||'').trim(),version:String(x?.version||'1.0.0'),status:String(x?.status||'available'),config:parse(x?.config),description:String(x?.description||''),category:String(x?.category||''),packageUrl:String(x?.packageUrl||x?.package_url||''),packageSha256:String(x?.packageSha256||x?.package_sha256||'').toLowerCase(),packageSignature:String(x?.packageSignature||x?.package_signature||''),packageSize:Number(x?.packageSize||x?.package_size||0),compatibility:parse(x?.compatibility)});

function versionParts(value){
 const match=String(value||'').trim().replace(/^v/i,'').match(/^(\d+)(?:\.(\d+))?(?:\.(\d+))?/);
 return match?[Number(match[1]),Number(match[2]||0),Number(match[3]||0)]:null;
}
function compareVersions(a,b){
 const av=versionParts(a),bv=versionParts(b);
 if(!av||!bv)return null;
 for(let i=0;i<3;i++){if(av[i]!==bv[i])return av[i]>bv[i]?1:-1;}
 return 0;
}
export function templateCompatibility(template, currentVersion=config.version){
 const c=parse(template?.compatibility);
 const min=c.minVersion||c.minAniFuzeVersion||c.min;
 const max=c.maxVersion||c.maxAniFuzeVersion||c.max;
 const exact=c.version||c.aniFuzeVersion;
 if(exact){
  const cmp=compareVersions(currentVersion,exact);
  if(cmp===null)return {compatible:false,reason:'Template compatibility metadata is invalid.'};
  if(cmp!==0)return {compatible:false,reason:`Requires AniFuze ${exact}.`};
 }
 if(min){
  const cmp=compareVersions(currentVersion,min);
  if(cmp===null)return {compatible:false,reason:'Template minimum version metadata is invalid.'};
  if(cmp<0)return {compatible:false,reason:`Requires AniFuze ${min} or newer.`};
 }
 if(max){
  const cmp=compareVersions(currentVersion,max);
  if(cmp===null)return {compatible:false,reason:`Template maximum version metadata is invalid.`};
  if(cmp>0)return {compatible:false,reason:`Supports AniFuze ${max} or older.`};
 }
 if(Array.isArray(c.supportedVersions)&&c.supportedVersions.length){
  const supported=c.supportedVersions.some(v=>compareVersions(currentVersion,v)===0);
  if(!supported)return {compatible:false,reason:'This template does not support the installed AniFuze version.'};
 }
 return {compatible:true,reason:''};
}

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

async function snapshotInstalled(t){
 await query(`INSERT INTO af_template_versions(id,version,name,status,config,installed_at,updated_at,package_url,package_sha256,package_signature,package_size,package_path,compatibility,description,category)
 VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
 ON CONFLICT(id,version) DO NOTHING`,[t.id,t.version,t.name,t.status,JSON.stringify(t.config||{}),t.installed_at,t.updated_at,t.package_url,t.package_sha256,t.package_signature,t.package_size,t.package_path,JSON.stringify(t.compatibility||{}),t.description||'',t.category||'']);
}

export async function installTemplate(id){
 const remote=normalizeTemplate(await fetchTemplatePackageMetadata(id));
 if(!remote.id)throw new Error('Template was not found.');
 const compatibility=templateCompatibility(remote);
 if(!compatibility.compatible)throw new Error(`Template is incompatible: ${compatibility.reason}`);
 const existing=await getInstalledTemplate(remote.id);
 if(existing&&existing.version===remote.version&&(!remote.packageSha256||remote.packageSha256===existing.package_sha256)){
  return existing;
 }
 if(existing)await snapshotInstalled(existing);
 const packageBuffer=await downloadVerifiedPackage(remote);
 const installedPackage=await installTemplatePackage(remote,packageBuffer);
 remote.config=installedPackage.manifest.config||remote.config;
 const now=new Date().toISOString();
 await query(`INSERT INTO af_templates(id,name,version,status,config,installed_at,updated_at,package_url,package_sha256,package_signature,package_size,package_path,compatibility,description,category)
 VALUES($1,$2,$3,$4,$5,$6,$6,$7,$8,$9,$10,$11,$12,$13,$14)
 ON CONFLICT(id) DO UPDATE SET name=$2,version=$3,status=$4,config=$5,updated_at=$6,package_url=$7,package_sha256=$8,package_signature=$9,package_size=$10,package_path=$11,compatibility=$12,description=$13,category=$14`,
 [remote.id,remote.name,remote.version,'installed',JSON.stringify(remote.config),now,remote.packageUrl,remote.packageSha256,remote.packageSignature,packageBuffer.length,installedPackage.path,JSON.stringify(remote.compatibility),remote.description,remote.category]);
 return getInstalledTemplate(remote.id);
}

export async function getInstalledTemplate(id){
 const r=await query('SELECT id,name,version,status,config,installed_at,updated_at,package_url,package_sha256,package_signature,package_size,package_path,compatibility,description,category FROM af_templates WHERE id=$1',[String(id)]);
 const x=r.rows[0];
 return x?{...x,config:parse(x.config),compatibility:parse(x.compatibility)}:null;
}
export async function listInstalledTemplates(){
 const r=await query('SELECT id,name,version,status,config,installed_at,updated_at,package_url,package_sha256,package_signature,package_size,package_path,compatibility,description,category FROM af_templates ORDER BY name ASC');
 return r.rows.map(x=>({...x,config:parse(x.config),compatibility:parse(x.compatibility)}));
}
export async function getActiveTemplate(){
 const r=await query('SELECT s.active_template_id,s.config,t.name,t.version,t.status FROM af_template_settings s JOIN af_templates t ON t.id=s.active_template_id WHERE s.id=1');
 const x=r.rows[0];
 return x?{id:x.active_template_id,name:x.name,version:x.version,status:x.status,config:parse(x.config)}:null;
}
export async function activateTemplate(id){
 const installed=await getInstalledTemplate(id);
 if(!installed)throw new Error('Template is not installed.');
 const compatibility=templateCompatibility(installed);
 if(!compatibility.compatible)throw new Error(`Template is incompatible: ${compatibility.reason}`);
 await query('UPDATE af_template_settings SET active_template_id=$1,config=$2,updated_at=CURRENT_TIMESTAMP WHERE id=1',[installed.id,JSON.stringify(installed.config)]);
 return getActiveTemplate();
}
export async function checkTemplateUpdate(id){
 const installed=await getInstalledTemplate(id);
 if(!installed)throw new Error('Template is not installed.');
 const remote=normalizeTemplate(await fetchTemplatePackageMetadata(id));
 const cmp=compareVersions(remote.version,installed.version);
 const packageChanged=Boolean(remote.packageSha256&&installed.package_sha256&&remote.packageSha256!==installed.package_sha256);
 return {installed,remote,updateAvailable:cmp===null?remote.version!==installed.version||packageChanged:cmp>0||(cmp===0&&packageChanged),compatibility:templateCompatibility(remote)};
}
export async function updateTemplate(id){
 const check=await checkTemplateUpdate(id);
 if(!check.compatibility.compatible)throw new Error(`Template update is incompatible: ${check.compatibility.reason}`);
 if(!check.updateAvailable)return check.installed;
 return installTemplate(id);
}
export async function listTemplateVersions(id){
 const r=await query('SELECT id,version,name,status,config,installed_at,updated_at,package_url,package_sha256,package_signature,package_size,package_path,compatibility,description,category FROM af_template_versions WHERE id=$1 ORDER BY installed_at DESC',[String(id)]);
 return r.rows.map(x=>({...x,config:parse(x.config),compatibility:parse(x.compatibility)}));
}
export async function rollbackTemplate(id,version){
 const current=await getInstalledTemplate(id);
 const versions=await listTemplateVersions(id);
 const target=versions.find(x=>x.version===String(version||''));
 if(!target)throw new Error('Rollback version is not installed.');
 const compatibility=templateCompatibility(target);
 if(!compatibility.compatible)throw new Error(`Template is incompatible: ${compatibility.reason}`);
 if(!target.package_path)throw new Error('Rollback package path is missing.');
 try{await fs.access(target.package_path);}catch{throw new Error('Rollback package is missing from template storage.');}
 if(current)await snapshotInstalled(current);
 await query(`UPDATE af_templates SET name=$2,version=$3,status='installed',config=$4,installed_at=$5,updated_at=CURRENT_TIMESTAMP,package_url=$6,package_sha256=$7,package_signature=$8,package_size=$9,package_path=$10,compatibility=$11,description=$12,category=$13 WHERE id=$1`,
 [target.id,target.name,target.version,JSON.stringify(target.config),target.installed_at,target.package_url,target.package_sha256,target.package_signature,target.package_size,target.package_path,JSON.stringify(target.compatibility),target.description,target.category]);
 const active=await getActiveTemplate();
 if(active?.id===String(id))await query('UPDATE af_template_settings SET active_template_id=$1,config=$2,updated_at=CURRENT_TIMESTAMP WHERE id=1',[target.id,JSON.stringify(target.config)]);
 return getInstalledTemplate(id);
}
export async function removeTemplate(id){
 const active=await getActiveTemplate();
 if(active?.id===String(id))throw new Error('The active template cannot be removed. Activate another template first.');
 const installed=await getInstalledTemplate(id);
 if(!installed)throw new Error('Template is not installed.');
 await query('DELETE FROM af_templates WHERE id=$1',[String(id)]);
 await removeStoredTemplate(id);
 return installed;
}
