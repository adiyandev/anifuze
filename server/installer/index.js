import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {config} from '../config.js';
import {checkRequirements} from './requirements.js';
import {verifyLicense,getInstallationIdentity} from './license.js';
import {runMigrations,migrationSnapshot} from '../migrate.js';
import {testDatabase,toEnv} from './database.js';
import {useRuntimeDatabase,query,dropAniFuzeTables} from '../db/index.js';
const LOCK_FILE=path.resolve('.anifuze-installed'); const ENV_FILE=path.resolve('.env');
export async function isInstallerLocked(){return fs.access(LOCK_FILE).then(()=>true).catch(()=>false);}
export async function installerStatus(){const r=await checkRequirements();const l=await verifyLicense();const i=getInstallationIdentity();return {locked:await isInstallerLocked(),requirements:r,license:l,identity:{installationId:i.installationId,domain:i.domain,licenseKey:i.licenseKey?'********':'missing'}};}
export async function executeInstallation({database,admin,domain,licenseKey}={}){
 if(await isInstallerLocked()) throw new Error('AniFuze installer is already locked.');
 const status=await installerStatus();
 if(!status.requirements.ok) throw new Error('Server requirements are not satisfied.');
 if(!status.license.valid) throw new Error('License verification failed.');
 if(!database||!admin?.email||!admin.password||admin.password.length<12||admin.password!==admin.confirm) throw new Error('Owner account details are invalid.');
 await testDatabase(database); useRuntimeDatabase(database); const beforeTables=await migrationSnapshot();
 const previous=await fs.readFile(ENV_FILE,'utf8').catch(()=>null);
 const env=toEnv(database,status.identity.installationId,licenseKey??config.licenseKey,domain??config.domain);
 try{
  await fs.writeFile(ENV_FILE,env,{mode:0o600}); await fs.chmod(ENV_FILE,0o600).catch(()=>{});
  await runMigrations();
  const salt=crypto.randomBytes(16).toString('hex');
  const passwordHash=await new Promise((resolve,reject)=>crypto.scrypt(admin.password,salt,64,(e,k)=>e?reject(e):resolve(salt+':'+k.toString('hex'))));
  const now=new Date().toISOString().slice(0,19).replace('T',' ');
  await query('INSERT INTO af_admin_users (id,email,password_hash,role,enabled,created_at,updated_at) VALUES ($1,$2,$3,$4,$5,$6,$6)',[crypto.randomUUID(),admin.email.toLowerCase(),passwordHash,'owner',true,now]);
  await fs.writeFile(LOCK_FILE,new Date().toISOString()+'\\n',{flag:'wx',mode:0o600});
  return {ok:true,locked:true,owner:{email:admin.email.toLowerCase(),role:'owner'}};
 }catch(error){
  await fs.rm(LOCK_FILE,{force:true});
  const afterTables=await migrationSnapshot().catch(()=>[]);
  await dropAniFuzeTables(afterTables.filter(name=>!beforeTables.includes(name))).catch(()=>{});
  if(previous===null) await fs.rm(ENV_FILE,{force:true}); else await fs.writeFile(ENV_FILE,previous,{mode:0o600});
  throw new Error('Installation rolled back: '+(error?.message||error));
 }
}
export async function rollbackInstallation(){await fs.rm(LOCK_FILE,{force:true});return {ok:true};}
export function installerPaths(){return {envFile:ENV_FILE,lockFile:LOCK_FILE};}
