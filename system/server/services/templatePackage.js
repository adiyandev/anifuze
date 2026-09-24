import crypto from 'node:crypto';
import {config} from '../config.js';

const MAX_PACKAGE_BYTES=50*1024*1024;
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
 return buffer;
}
