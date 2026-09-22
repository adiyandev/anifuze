import fs from 'node:fs/promises';
import path from 'node:path';
import {checkRequirements} from './requirements.js';
import {verifyLicense,getInstallationIdentity} from './license.js';
import {runMigrations} from '../migrate.js';

const LOCK_FILE=path.resolve('.anifuze-installed');
const ENV_FILE=path.resolve('.env');

export async function isInstallerLocked(){
  return fs.access(LOCK_FILE).then(()=>true).catch(()=>false);
}

export async function installerStatus(){
  const requirements=await checkRequirements();
  const license=await verifyLicense();
  return {locked:await isInstallerLocked(),requirements,license,identity:getInstallationIdentity()};
}

export async function executeInstallation({createLock=true}={}){
  if(await isInstallerLocked()) throw new Error('AniFuze installer is already locked.');
  const status=await installerStatus();
  if(!status.requirements.ok) throw new Error('Server requirements are not satisfied.');
  if(!status.license.valid) throw new Error('License verification failed.');
  await runMigrations();
  if(createLock) await fs.writeFile(LOCK_FILE,new Date().toISOString()+'\\n',{flag:'wx',mode:0o600});
  return {ok:true,locked:true};
}

export async function rollbackInstallation(){
  await fs.rm(LOCK_FILE,{force:true});
  return {ok:true};
}

export function installerPaths(){
  return {envFile:ENV_FILE,lockFile:LOCK_FILE};
}
