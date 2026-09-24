import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {config} from '../config.js';

const MAX_PACKAGE_BYTES=50*1024*1024;
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


function safeArchivePath(entry){
 const normalized=String(entry||'').replace(/\\/g,'/');
 if(!normalized||normalized.startsWith('/')||normalized.includes('\\0'))return false;
 const clean=path.posix.normalize(normalized);
 return clean!=='.'&&!clean.startsWith('../')&&!clean.includes('/../')&&!path.posix.isAbsolute(clean);
}
export async function installTemplatePackage(metadata,buffer){
 if(!metadata?.id)throw new Error('Template package has no template ID.');
 const safeId=String(metadata.id).replace(/[^a-zA-Z0-9._-]/g,'_');
 const safeVersion=String(metadata.version||'1.0.0').replace(/[^a-zA-Z0-9._-]/g,'_');
 const root=path.join(TEMPLATE_ROOT,safeId);
 const finalDir=path.join(root,safeVersion);
 const tempDir=path.join(root,'.install-'+crypto.randomBytes(8).toString('hex'));
 await fs.mkdir(tempDir,{recursive:true});
 const archive=path.join(tempDir,'package.tar');
 try{
  await fs.writeFile(archive,buffer,{mode:0o600});
  const {stdout}=await execFileAsync('tar',['-tf',archive],{maxBuffer:2*1024*1024,timeout:15000});
  const entries=stdout.split(/\\r?\\n/).map(x=>x.trim()).filter(Boolean);
  if(!entries.length||entries.some(x=>!safeArchivePath(x)))throw new Error('Template package contains an unsafe archive path.');
  if(!entries.some(x=>x==='anifuze-template.json'))throw new Error('Template package manifest is missing.');
  const {stdout:details}=await execFileAsync('tar',['-tvf',archive],{maxBuffer:4*1024*1024,timeout:15000});
  if(/\s(?:->|link to)\s/.test(details))throw new Error('Template package cannot contain symbolic or hard links.');
  await execFileAsync('tar',['-xf',archive,'-C',tempDir,'--no-same-owner','--no-same-permissions','--no-overwrite-dir'],{timeout:30000,maxBuffer:1024*1024});
  const manifestPath=path.join(tempDir,'anifuze-template.json');
  let manifest;
  try{manifest=JSON.parse(await fs.readFile(manifestPath,'utf8'));}catch{throw new Error('Template package manifest is missing or invalid.');}
  if(String(manifest.id||'')!==String(metadata.id)||String(manifest.version||'')!==String(metadata.version))throw new Error('Template package manifest does not match marketplace metadata.');
  if(String(manifest.type||'template')!=='template')throw new Error('Unsupported template package type.');
  const configData=manifest.config&&typeof manifest.config==='object'?manifest.config:{};
  const manifestFile=path.join(tempDir,'anifuze-template.json');
  await fs.writeFile(manifestFile,JSON.stringify({...manifest,config:configData},null,2),{mode:0o600});
  await fs.mkdir(root,{recursive:true});
  await fs.rm(finalDir,{recursive:true,force:true});
  await fs.rename(tempDir,finalDir);
  return {path:finalDir,manifest};
 }catch(error){
  await fs.rm(tempDir,{recursive:true,force:true}).catch(()=>{});
  throw error;
 }
}
