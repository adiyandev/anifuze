import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {config} from '../config.js';

const MAX_PACKAGE_BYTES=50*1024*1024;
const MAX_ARCHIVE_ENTRIES=256;
const MAX_ENTRY_BYTES=10*1024*1024;
const MAX_UNPACKED_BYTES=40*1024*1024;
const MAX_PATH_LENGTH=512;
const execFileAsync=promisify(execFile);
const TEMPLATE_ROOT=path.resolve(process.cwd(),'storage','templates');
function verifySignature(buffer,signature){
 const publicKey=String(config.templatePublicKey||'').trim();
 if(!publicKey)throw new Error('Template signing key is not configured.');
 if(!signature)throw new Error('Template package signature is missing.');
 return crypto.verify(null,buffer,publicKey,Buffer.from(signature,'base64url'));
}
const parse=x=>{try{return typeof x==='string'?JSON.parse(x):x||{}}catch{return {}}};

function serviceBase(){
 const base=String(config.templateServiceUrl||'').trim();
 if(!base)throw new Error('AniFuze template service is not configured.');
 const url=new URL(base);
 if(url.protocol!=='https:'&&config.nodeEnv!=='development')throw new Error('Template service must use HTTPS.');
 return url;
}

export async function fetchTemplatePackageMetadata(id){
 const base=serviceBase();
 const url=new URL('/templates/'+encodeURIComponent(String(id)),base);
 const response=await fetch(url,{headers:{accept:'application/json','user-agent':'AniFuze-TemplateClient/'+config.version},signal:AbortSignal.timeout(15000)});
 const data=await response.json().catch(()=>null);
 if(!response.ok||!data)throw new Error(data?.error||'Template service request failed.');
 const template=data.template||data;
 return {
  ...template,
  id:String(template.id||''),
  packageUrl:String(template.packageUrl||template.package_url||''),
  packageSha256:String(template.packageSha256||template.package_sha256||'').toLowerCase(),
  packageSignature:String(template.packageSignature||template.package_signature||''),
  packageSize:Number(template.packageSize||template.package_size||0),
  compatibility:parse(template.compatibility)
 };
}

export async function downloadVerifiedPackage(metadata){
 if(!metadata.packageUrl)throw new Error('Template package URL is missing.');
 if(!/^[a-f0-9]{64}$/i.test(metadata.packageSha256))throw new Error('Template package SHA-256 is missing or invalid.');
 const url=new URL(metadata.packageUrl,serviceBase());
 if(url.protocol!=='https:'&&config.nodeEnv!=='development')throw new Error('Template package must use HTTPS.');
 const response=await fetch(url,{headers:{accept:'application/octet-stream','user-agent':'AniFuze-TemplateClient/'+config.version},signal:AbortSignal.timeout(60000)});
 if(!response.ok)throw new Error('Template package download failed.');
 const contentLength=Number(response.headers.get('content-length')||0);
 if(contentLength>MAX_PACKAGE_BYTES)throw new Error('Template package exceeds the allowed size.');
 const buffer=Buffer.from(await response.arrayBuffer());
 if(buffer.length>MAX_PACKAGE_BYTES)throw new Error('Template package exceeds the allowed size.');
 if(metadata.packageSize&&buffer.length!==metadata.packageSize)throw new Error('Template package size verification failed.');
 const hash=crypto.createHash('sha256').update(buffer).digest('hex');
 if(hash!==metadata.packageSha256.toLowerCase())throw new Error('Template package integrity verification failed.');
 if(!verifySignature(buffer,metadata.packageSignature))throw new Error('Template package signature verification failed.');
 return buffer;
}

export async function removeStoredTemplate(id){
 const safeId=String(id||'').replace(/[^a-zA-Z0-9._-]/g,'_');
 const root=path.join(TEMPLATE_ROOT,safeId);
 await fs.rm(root,{recursive:true,force:true});
}

export async function storeTemplatePackage(metadata,buffer){
 const safeId=metadata.id.replace(/[^a-zA-Z0-9._-]/g,'_');
 const safeVersion=String(metadata.version||'1.0.0').replace(/[^a-zA-Z0-9._-]/g,'_');
 const root=path.resolve(process.cwd(),'storage','templates',safeId);
 await fs.mkdir(root,{recursive:true});
 const filePath=path.join(root,safeVersion+'.package');
 const temp=filePath+'.tmp-'+crypto.randomBytes(8).toString('hex');
 await fs.writeFile(temp,buffer,{mode:0o600});
 await fs.rename(temp,filePath);
 return filePath;
}


const PRESENTATION_KEYS=new Set(['primary','primaryColor','accent','accentColor','background','backgroundColor','surface','surfaceColor','text','textColor','muted','mutedColor','radius','cardRadius','font','fontFamily','effects','containerWidth','layout']);
const MAX_MANIFEST_KEYS=64;
const MAX_MANIFEST_DEPTH=6;
const MAX_STRING_LENGTH=2048;
const MANIFEST_KEYS=new Set(['type','id','version','name','description','author','category','license','preview','compatibility','config']);

function validateValue(value,depth=0,seen=new Set()){
 if(depth>MAX_MANIFEST_DEPTH)throw new Error('Template manifest config is too deeply nested.');
 if(typeof value==='string'){if(value.length>MAX_STRING_LENGTH)throw new Error('Template manifest contains an oversized string.');return;}
 if(value===null||typeof value==='number'||typeof value==='boolean')return;
 if(Array.isArray(value)){if(value.length>MAX_MANIFEST_KEYS)throw new Error('Template manifest contains too many array items.');value.forEach(x=>validateValue(x,depth+1,seen));return;}
 if(typeof value==='object'){
  if(seen.has(value))throw new Error('Template manifest config contains a circular reference.');
  seen.add(value);
  const keys=Object.keys(value); if(keys.length>MAX_MANIFEST_KEYS)throw new Error('Template manifest contains too many config keys.');
  for(const key of keys){if(key==='__proto__'||key==='prototype'||key==='constructor')throw new Error('Template manifest contains a forbidden config key.');validateValue(value[key],depth+1,seen)}
  seen.delete(value);return;
 }
 throw new Error('Template manifest contains an unsupported value type.');
}

export function validateTemplateManifest(manifest,metadata={}){
 if(!manifest||typeof manifest!=='object'||Array.isArray(manifest))throw new Error('Template package manifest must be a JSON object.');
 if(String(manifest.type||'template')!=='template')throw new Error('Unsupported template package type.');
 if(!/^[a-zA-Z0-9][a-zA-Z0-9._-]{1,127}$/.test(String(manifest.id||'')))throw new Error('Template manifest ID is invalid.');
 if(!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(String(manifest.version||'')))throw new Error('Template manifest version must use semantic versioning.');
 if(metadata.id!=null&&String(manifest.id)!==String(metadata.id))throw new Error('Template package manifest does not match marketplace metadata.');
 if(metadata.version!=null&&String(manifest.version)!==String(metadata.version))throw new Error('Template package manifest does not match marketplace metadata.');
 const manifestKeys=Object.keys(manifest);
 if(manifestKeys.length>MANIFEST_KEYS.size)throw new Error('Template manifest contains too many keys.');
 for(const key of manifestKeys)if(!MANIFEST_KEYS.has(key))throw new Error('Template manifest contains an unsupported key: '+key+'.');
 if(manifest.name!=null&&(!String(manifest.name).trim()||String(manifest.name).length>255))throw new Error('Template manifest name is invalid.');
 if(manifest.description!=null&&String(manifest.description).length>MAX_STRING_LENGTH)throw new Error('Template manifest description is too long.');
 if(manifest.author!=null&&(!String(manifest.author).trim()||String(manifest.author).length>255))throw new Error('Template manifest author is invalid.');
 if(manifest.category!=null&&(!String(manifest.category).trim()||String(manifest.category).length>100))throw new Error('Template manifest category is invalid.');
 const configData=manifest.config;
 if(configData==null||typeof configData!=='object'||Array.isArray(configData))throw new Error('Template manifest config must be an object.');
 validateValue(configData);
  for(const key of Object.keys(configData)){
    if(!PRESENTATION_KEYS.has(key)) throw new Error('Unsupported template config key: '+key+'. Templates may only define presentation settings.');
  }
 return true;
}

function safeArchivePath(entry){
 const normalized=String(entry||'').replace(/\\/g,'/');
 if(!normalized||normalized.startsWith('/')||normalized.includes('\0'))return false;
 const clean=path.posix.normalize(normalized);
 return clean!=='.'&&!clean.startsWith('../')&&!clean.includes('/../')&&!path.posix.isAbsolute(clean);
}
export async function validateTemplatePackage(metadata,buffer){
 if(!metadata?.id)throw new Error('Template package has no template ID.');
 if(!Buffer.isBuffer(buffer))throw new Error('Template package must be a buffer.');
 if(buffer.length===0)throw new Error('Template package is empty.');
 if(buffer.length>MAX_PACKAGE_BYTES)throw new Error('Template package exceeds the allowed size.');
 const tempRoot=path.join(TEMPLATE_ROOT,'.validate-'+crypto.randomBytes(8).toString('hex'));
 const archive=path.join(tempRoot,'package.tar');
 try{
  await fs.mkdir(tempRoot,{recursive:true});
  await fs.writeFile(archive,buffer,{mode:0o600});
  const {stdout}=await execFileAsync('tar',['-tf',archive],{maxBuffer:2*1024*1024,timeout:15000});
  const entries=stdout.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
  if(!entries.length)throw new Error('Template package is empty.');
  if(entries.length>MAX_ARCHIVE_ENTRIES)throw new Error('Template package contains too many files.');
  if(entries.some(x=>x.length>MAX_PATH_LENGTH||!safeArchivePath(x)))throw new Error('Template package contains an unsafe archive path.');
  if(!entries.some(x=>x==='anifuze-template.json'))throw new Error('Template package manifest is missing.');
  const {stdout:details}=await execFileAsync('tar',['-tvf',archive],{maxBuffer:4*1024*1024,timeout:15000});
  if(/\\s(?:->|link to)\\s/.test(details))throw new Error('Template package cannot contain symbolic or hard links.');
  let unpackedBytes=0;
  for(const line of details.split(/\r?\n/).filter(Boolean)){
   const type=line[0];
   if(type!=='-'&&type!=='d')throw new Error('Template package contains an unsupported archive entry type.');
   if(type==='-'){
    const size=Number(line.trim().split(/\\s+/)[2]);
    if(!Number.isSafeInteger(size)||size<0)throw new Error('Template package contains an invalid file size.');
    if(size>MAX_ENTRY_BYTES)throw new Error('Template package contains an oversized file.');
    unpackedBytes+=size;
    if(unpackedBytes>MAX_UNPACKED_BYTES)throw new Error('Template package expands beyond the allowed size.');
   }
  }
  const {stdout:manifestText}=await execFileAsync('tar',['-xOf',archive,'anifuze-template.json'],{maxBuffer:MAX_STRING_LENGTH*8,timeout:15000});
  let manifest;
  try{manifest=JSON.parse(manifestText);}catch{throw new Error('Template package manifest is missing or invalid.');}
  validateTemplateManifest(manifest,metadata);
  return manifest;
 }finally{await fs.rm(tempRoot,{recursive:true,force:true}).catch(()=>{});}
}
export async function installTemplatePackage(metadata,buffer){
 if(!metadata?.id)throw new Error('Template package has no template ID.');
 const safeId=String(metadata.id).replace(/[^a-zA-Z0-9._-]/g,'_');
 const safeVersion=String(metadata.version||'1.0.0').replace(/[^a-zA-Z0-9._-]/g,'_');
 const root=path.join(TEMPLATE_ROOT,safeId);
 const finalDir=path.join(root,safeVersion);
 const installRoot=path.join(root,'.install-'+crypto.randomBytes(8).toString('hex'));
 const extractDir=path.join(installRoot,'content');
 const archive=path.join(installRoot,'package.tar');
 try{
  const manifest=await validateTemplatePackage(metadata,buffer);
  await fs.mkdir(extractDir,{recursive:true});
  await fs.writeFile(archive,buffer,{mode:0o600});
  await execFileAsync('tar',['-xf',archive,'-C',extractDir,'--no-same-owner','--no-same-permissions','--no-overwrite-dir'],{timeout:30000,maxBuffer:1024*1024});
  await fs.mkdir(root,{recursive:true});
  await fs.rm(finalDir,{recursive:true,force:true});
  await fs.rename(extractDir,finalDir);
  await fs.rm(installRoot,{recursive:true,force:true});
  return {path:finalDir,manifest};
 }catch(error){
  await fs.rm(installRoot,{recursive:true,force:true}).catch(()=>{});
  throw error;
 }
}
