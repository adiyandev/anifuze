import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {config} from '../../system/server/config.js';
import {checkRequirements} from './requirements.js';
import {getInstallationIdentity,verifyLicenseKey} from './license.js';
import {verifyLicense as verifyStoredLicense} from '../../system/server/services/license.js';
import {runMigrations,migrationSnapshot} from '../../system/server/migrate.js';
import {testDatabase,toEnv} from './database.js';
import {saveInstallerEmailSettings} from '../../system/server/services/email.js';
import {saveOAuthSettings} from '../../system/server/services/oauth.js';
import {deployLocalRelease} from './deploy.js';
import {useRuntimeDatabase,query,dropAniFuzeTables} from '../../system/server/db/index.js';
const LOCK_FILE=path.resolve('.anifuze-installed'); const ENV_FILE=path.resolve('.env');
export async function isInstallerLocked(){return fs.access(LOCK_FILE).then(()=>true).catch(()=>false);}
export async function installerStatus(licenseKey=config.licenseKey,dbClient='postgres'){
 const r=await checkRequirements({dbClient}); const i=getInstallationIdentity(); const locked=await isInstallerLocked();
 let l={valid:false,status:'missing'};
 if(licenseKey){if(config.nodeEnv==='development'&&licenseKey==='dev-license')l={valid:true,status:'development'};else if(licenseKey==='dev-license')l={valid:false,status:'missing'};}
 return {locked,requirements:r,license:l,identity:{installationId:i.installationId,domain:i.domain,licenseKey:licenseKey?'********':'missing'}};
}
export async function executeInstallation({database,email,oauth,admin,domain,licenseKey,providerMarketplaceUrl,deployment}={}){
 if(await isInstallerLocked())throw new Error('AniFuze installer is already locked.');
 const status=await installerStatus(licenseKey,database?.client||'postgres');
 if(!status.requirements.ok)throw new Error('Server requirements are not satisfied.');
 const license=await verifyLicenseKey(licenseKey);
 if(!license.valid)throw new Error('License verification failed: '+(license.error||license.status||'invalid license')+'.');
 if(!database||!admin?.email||!admin.password||admin.password.length<12||admin.password!==admin.confirm)throw new Error('Owner account details are invalid.');
 await testDatabase(database); useRuntimeDatabase(database);
 const target=deployment?.targetDir||config.deploymentTarget||''; const source=deployment?.sourceDir||config.releaseDir||'';
 if(target&&source)await deployLocalRelease({sourceDir:source,targetDir:target}); const beforeTables=await migrationSnapshot();
 const previous=await fs.readFile(ENV_FILE,'utf8').catch(()=>null);
 const marketplaceUrl=String(providerMarketplaceUrl??process.env.ANIFUZE_PROVIDER_MARKETPLACE_URL??'').trim();
 if(marketplaceUrl){const u=new URL(marketplaceUrl);if(u.protocol!=='https:'&&config.nodeEnv==='production')throw new Error('Provider marketplace URL must use HTTPS in production.');}
 const env=toEnv(database,status.identity.installationId,licenseKey??config.licenseKey,domain??config.domain,marketplaceUrl);
 try{
  await fs.writeFile(ENV_FILE,env,{mode:0o600}); await fs.chmod(ENV_FILE,0o600).catch(()=>{});
  await runMigrations(); await verifyStoredLicense(licenseKey);
  if(email)await saveInstallerEmailSettings(email);
  if(oauth)await saveOAuthSettings(oauth);
  const salt=crypto.randomBytes(16).toString('hex');
  const passwordHash=await new Promise((resolve,reject)=>crypto.scrypt(admin.password,salt,64,(e,k)=>e?reject(e):resolve(salt+':'+k.toString('hex')));
  const now=new Date().toISOString().slice(0,19).replace('T',' '); const ownerId=crypto.randomUUID();
  await query('INSERT INTO af_admin_users (id,email,password_hash,role,enabled,must_setup_2fa,created_at,updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$7)',[ownerId,admin.email.toLowerCase(),passwordHash,'owner',true,true,now]);
  await query('INSERT INTO af_admin_2fa (admin_user_id,email_enabled,recovery_enabled,enabled,updated_at) VALUES ($1,$2,$3,$4,$5)',[ownerId,true,true,false,now]);
  await fs.writeFile(LOCK_FILE,new Date().toISOString()+'\n',{flag:'wx',mode:0o600});
  return {ok:true,locked:true,owner:{email:admin.email.toLowerCase(),role:'owner'}};
 }catch(error){
  await fs.rm(LOCK_FILE,{force:true}); const afterTables=await migrationSnapshot().catch(()=>[]);
  await dropAniFuzeTables(afterTables.filter(name=>!beforeTables.includes(name))).catch(()=>{});
  if(previous===null)await fs.rm(ENV_FILE,{force:true});else await fs.writeFile(ENV_FILE,previous,{mode:0o600});
  throw new Error('Installation rolled back: '+(error?.message||error));
 }
}
export async function rollbackInstallation(){await fs.rm(LOCK_FILE,{force:true});return {ok:true};}
export function installerPaths(){return {envFile:ENV_FILE,lockFile:LOCK_FILE};}
