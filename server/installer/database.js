import {createPoolForDatabase,closePool} from '../db/index.js';
const validClient=c=>['postgres','mysql','mariadb'].includes(c);
const ident=s=>String(s).replace(/[^a-zA-Z0-9_$-]/g,'');
export async function testDatabase(d){
 if(!validClient(d.client)||!d.host||!d.name||!d.user) throw new Error('Complete the database configuration.');
 const pool=createPoolForDatabase({...d,port:Number(d.port),password:String(d.password??'')});
 try{await pool.query('SELECT 1');return {ok:true,client:d.client,host:d.host,port:Number(d.port),name:d.name};}
 finally{await closePool(pool);}
}
export async function createDatabaseIfNeeded(d){
 const database=ident(d.name); if(!database) throw new Error('Invalid database name.');
 const admin={...d,name:d.client==='postgres'?'postgres':'mysql'};
 const pool=createPoolForDatabase({...admin,port:Number(d.port),password:String(d.password??'')});
 try{
  if(d.client==='postgres') await pool.query('CREATE DATABASE "'+database+'"');
  else await pool.query('CREATE DATABASE IF NOT EXISTS '+String.fromCharCode(96)+database+String.fromCharCode(96));
  return {created:true};
 }catch(error){
  const message=String(error?.message||error);
  if(/already exists|database .* exists|42P04|ER_DB_CREATE_EXISTS/i.test(message)) return {created:false,existing:true};
  return {created:false,permissionDenied:true,message};
 }finally{await closePool(pool);}
}
export function toEnv(d,installationId,licenseKey,domain){
 return ['NODE_ENV=production','DB_CLIENT='+d.client,'DB_HOST='+d.host,'DB_PORT='+Number(d.port),'DB_NAME='+d.name,'DB_USER='+d.user,'DB_PASSWORD='+quote(d.password),'DB_SSL='+Boolean(d.ssl),'ANIFUZE_INSTALLATION_ID='+quote(installationId),'ANIFUZE_LICENSE_KEY='+quote(licenseKey),'ANIFUZE_DOMAIN='+quote(domain),'ANIFUZE_LICENSE_SERVICE_URL='+quote(process.env.ANIFUZE_LICENSE_SERVICE_URL||'')].join('\\n')+'\\n';
}
function quote(v){return '"'+String(v??'').replace(/\\/g,'\\\\').replace(/"/g,'\\\"').replace(/\n/g,'')+'"';}
