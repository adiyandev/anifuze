import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import {config} from '../config.js';
import {query} from '../db/index.js';
import {createBackup} from './backups.js';

const VERSION=/^v?\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;
const clean=v=>String(v??'').trim();
const releaseDir=()=>path.resolve(config.releaseDir||path.join(process.cwd(),'storage','releases'));

function validHttpsUrl(value){
  const u=new URL(clean(value));
  if(u.protocol!=='https:')throw new Error('Release package URL must use HTTPS.');
  return u;
}
export async function getReleaseState(){
  const r=await query('SELECT * FROM af_release_state WHERE id=1');
  return r.rows[0]||{current_version:config.version,staged_version:null,status:'idle'};
}
export function validateRelease(release={}){
  const version=clean(release.version).replace(/^v/i,'');
  if(!VERSION.test(version))throw new Error('Invalid release version.');
  const packageUrl=clean(release.packageUrl||release.assetUrl);
  if(!packageUrl)throw new Error('Release package URL is required.');
  validHttpsUrl(packageUrl);
  const checksum=clean(release.sha256||release.checksum).toLowerCase();
  if(!/^[a-f0-9]{64}$/.test(checksum))throw new Error('A SHA-256 checksum is required for release packages.');
  return {version,packageUrl,checksum};
}
export async function stageRelease(release={}){
  const item=validateRelease(release);
  if(!/^\d+\.\d+\.\d+/.test(config.version)||item.version===clean(config.version).replace(/^v/i,''))throw new Error('Release is not newer than the installed version.');
  const backup=await createBackup({label:'pre-upgrade-'+item.version});
  await fs.mkdir(await releaseDir(),{recursive:true});
  const response=await fetch(item.packageUrl,{redirect:'manual',headers:{Accept:'application/octet-stream','User-Agent':'AniFuze-Updater'},signal:AbortSignal.timeout(30000)});
  if(!response.ok||response.status>=300)throw new Error('Release package download failed with HTTP '+response.status+'.');
  const data=Buffer.from(await response.arrayBuffer());
  if(data.length>100*1024*1024)throw new Error('Release package exceeds the 100 MB safety limit.');
  const actual=crypto.createHash('sha256').update(data).digest('hex');
  if(actual!==item.checksum)throw new Error('Release package checksum does not match the manifest.');
  const filename='anifuze-'+item.version+'.package';
  const target=path.join(await releaseDir(),filename);
  await fs.writeFile(target,data,{flag:'w'});
  await query('UPDATE af_release_state SET staged_version=$1,staged_package=$2,staged_checksum=$3,staged_at=CURRENT_TIMESTAMP,status=$4,last_error=NULL,updated_at=CURRENT_TIMESTAMP WHERE id=1',[item.version,target,item.checksum,'staged']);
  return {version:item.version,package:filename,checksum:item.checksum,backup};
}
export async function clearStagedRelease(){
  const state=await getReleaseState();
  if(state.staged_package)try{await fs.unlink(state.staged_package);}catch{}
  await query('UPDATE af_release_state SET staged_version=NULL,staged_package=NULL,staged_checksum=NULL,staged_at=NULL,status=\'idle\',last_error=NULL,updated_at=CURRENT_TIMESTAMP WHERE id=1');
  return getReleaseState();
}
