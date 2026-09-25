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
 if(licenseKey){const checked=await verifyLicenseKey(licenseKey);l={valid:Boolean(checked.valid),status:checked.status||'invalid',plan:checked.plan||null,customer:checked.customer||null,expiresAt:checked.expiresAt||null,error:checked.error||null};}
 return {locked,requirements:r,license:l,identity:{installationId:i.installationId,domain:i.domain,licenseKey:licenseKey?'********':'missing'}};
}
export async function executeInstallation({database,email,oauth,admin,domain,licenseKey,providerMarketplaceUrl,deployment}={}){
 if(await isInstallerLocked())throw new Error('AniFuze installer is already locked or another installation is running.');
 let acquired=false; let beforeTables=[]; let previous=null;
 try{
  await fs.writeFile(LOCK_FILE,'INSTALLING\\n',{flag:'wx',mode:0o600}); acquired=true;
  const status=await installerStatus(licenseKey,'postgres');
  if(!status.requirements.ok)throw new Error('Server requirements are not satisfied.');
  const license=await verifyLicenseKey(licenseKey); if(!license.valid)throw new Error('License verification failed: '+(license.error||license.status||'invalid license')+'.');
  if(!database||database.client!=='postgres')throw new Error('AniFuze production installations require PostgreSQL.');
  if(!admin?.email||!admin.password||admin.password.length<12||admin.password!==admin.confirm)throw new Error('Owner account details are invalid.');
  await testDatabase(database); useRuntimeDatabase(database);
  const target=deployment?.targetDir||config.deploymentTarget||''; const source=deployment?.sourceDir||config.releaseDir||'';
  if(target&&source)await deployLocalRelease({sourceDir:source,targetDir:target});
  beforeTables=await migrationSnapshot(); previous=await fs.readFile(ENV_FILE,'utf8').catch(()=>null);
  const marketplaceUrl=String(providerMarketplaceUrl??process.env.ANIFUZE_PROVIDER_MARKETPLACE_URL??'').trim();
  if(marketplaceUrl){const u=new URL(marketplaceUrl);if(u.protocol!=='https:'&&config.nodeEnv==='production')throw new Error('Provider marketplace URL must use HTTPS in production.');}
  const env=toEnv(database,status.identity.installationId,licenseKey??config.licenseKey,domain??config.domain,marketplaceUrl);
  const envTemp=ENV_FILE+'.tmp-'+process.pid+'-'+Date.now(); await fs.writeFile(envTemp,env,{mode:0o600}); await fs.chmod(envTemp,0o600).catch(()=>{}); await fs.rename(envTemp,ENV_FILE);
  process.env.DB_CLIENT='postgres'; process.env.DB_HOST=database.host; process.env.DB_PORT=String(database.port); process.env.DB_NAME=database.name; process.env.DB_USER=database.user; process.env.DB_PASSWORD=String(database.password??''); process.env.DB_SSL=String(Boolean(database.ssl)); process.env.ANIFUZE_INSTALLATION_ID=status.identity.installationId; process.env.ANIFUZE_LICENSE_KEY=String(licenseKey??''); process.env.ANIFUZE_DOMAIN=String(domain??config.domain); process.env.ANIFUZE_LICENSE_SERVICE_URL=String(config.licenseServiceUrl||process.env.ANIFUZE_LICENSE_SERVICE_URL||'https://animefusion.onrender.com');
  await runMigrations(); const verified=await verifyStoredLicense(licenseKey); if(!['active','grace'].includes(String(verified.status)))throw new Error('Stored license activation failed.');
  if(email)await saveInstallerEmailSettings(email); if(oauth)await saveOAuthSettings(oauth);
  const salt=crypto.randomBytes(16).toString('hex'); const passwordHash=await new Promise((resolve,reject)=>crypto.scrypt(admin.password,salt,64,{N:16384,r:8,p:1},(e,k)=>e?reject(e):resolve(salt+':'+k.toString('hex'))));
  const now=new Date().toISOString().slice(0,19).replace('T',' '); const ownerId=crypto.randomUUID();
  await query('INSERT INTO af_admin_users (id,email,password_hash,role,enabled,must_setup_2fa,created_at,updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$7)',[ownerId,admin.email.toLowerCase(),passwordHash,'owner',true,true,now]);
  await query('INSERT INTO af_admin_2fa (admin_user_id,email_enabled,recovery_enabled,enabled,updated_at) VALUES ($1,$2,$3,$4,$5)',[ownerId,true,true,false,now]);
  await fs.writeFile(LOCK_FILE,new Date().toISOString()+'\\n',{mode:0o600});
  return {ok:true,locked:true,owner:{email:admin.email.toLowerCase(),role:'owner'},license:{plan:license.plan||null,expiresAt:license.expiresAt||null},installationId:status.identity.installationId};
 }catch(error){
  if(acquired){await fs.rm(LOCK_FILE,{force:true}).catch(()=>{}); const afterTables=await migrationSnapshot().catch(()=>[]); await dropAniFuzeTables(afterTables.filter(name=>!beforeTables.includes(name))).catch(()=>{}); if(previous===null)await fs.rm(ENV_FILE,{force:true}).catch(()=>{});else await fs.writeFile(ENV_FILE,previous,{mode:0o600}).catch(()=>{});}
  throw new Error('Installation rolled back: '+(error?.message||error));
 }
}
export async function rollbackInstallation(){await fs.rm(LOCK_FILE,{force:true});return {ok:true};}
export function installerPaths(){return {envFile:ENV_FILE,lockFile:LOCK_FILE};}
