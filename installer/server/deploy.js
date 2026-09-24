import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
const exec=promisify(execFile);

const safeTarget=p=>path.resolve(String(p||'').trim()||process.cwd());
const blocked=new Set(['.git','node_modules','storage','install','dist','.env','.anifuze-installed']);
async function copyTree(source,target){
 await fs.mkdir(target,{recursive:true});
 for(const entry of await fs.readdir(source,{withFileTypes:true})){
  if(blocked.has(entry.name))continue;
  const from=path.join(source,entry.name),to=path.join(target,entry.name);
  if(entry.isDirectory())await copyTree(from,to); else if(entry.isFile())await fs.copyFile(from,to);
 }
}
async function sha256(file){const h=crypto.createHash('sha256');h.update(await fs.readFile(file));return h.digest('hex')}
export async function deployLocalRelease({sourceDir,targetDir}){
 const source=safeTarget(sourceDir),target=safeTarget(targetDir);
 if(source===target)throw new Error('Deployment source and target must be different.');
 const stat=await fs.stat(source).catch(()=>null);if(!stat?.isDirectory())throw new Error('AniFuze release package is missing.');
 const marker=path.join(target,'.anifuze-deploying');
 await fs.mkdir(target,{recursive:true});await fs.writeFile(marker,new Date().toISOString());
 try{await copyTree(source,target);return {ok:true,targetDir:target,mode:'local'};}
 finally{await fs.rm(marker,{force:true}).catch(()=>{})}
}
export async function deployReleaseArchive({archivePath,targetDir}){
 const archive=path.resolve(archivePath),target=safeTarget(targetDir);
 if(!(await fs.stat(archive).catch(()=>null)))throw new Error('Release archive not found.');
 await fs.mkdir(target,{recursive:true});
 const marker=path.join(target,'.anifuze-deploying');await fs.writeFile(marker,new Date().toISOString());
 try{
  if(os.platform()==='win32')await exec('tar',['-xf',archive,'-C',target]);
  else await exec('tar',['-xf',archive,'-C',target]);
  return {ok:true,targetDir:target,mode:'archive',sha256:await sha256(archive)};
 }finally{await fs.rm(marker,{force:true}).catch(()=>{})}
}
