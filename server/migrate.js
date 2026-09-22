import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {query,listAniFuzeTables} from './db/index.js';
import {config} from './config.js';
const dir=path.dirname(fileURLToPath(import.meta.url)); const migrationDir=path.join(dir,'migrations');
async function ensureHistory(){await query('CREATE TABLE IF NOT EXISTS af_migration_history (id INTEGER PRIMARY KEY, name VARCHAR(255) NOT NULL, applied_at TIMESTAMP NOT NULL)');}
function splitSql(sql){
 const out=[];let start=0;let quote=null;let lineComment=false;let blockComment=false;
 for(let i=0;i<sql.length;i++){const c=sql[i],n=sql[i+1];
  if(lineComment){if(c==='\n')lineComment=false;continue}
  if(blockComment){if(c==='*'&&n==='/'){blockComment=false;i++}continue}
  if(!quote&&c==='-'&&n==='-'){lineComment=true;i++;continue}
  if(!quote&&c==='/'&&n==='*'){blockComment=true;i++;continue}
  if(quote){if(c===quote){if(sql[i+1]===quote)i++;else quote=null}else if(c==='\\')i++;continue}
  if(c==="'"||c==='"'||c===String.fromCharCode(96)){quote=c;continue}
  if(c===';'){if(sql.slice(start,i).trim())out.push(sql.slice(start,i).trim());start=i+1}
 }
 if(sql.slice(start).trim())out.push(sql.slice(start).trim()); return out;
}
function adapt(sql){return config.db.client==='postgres'?sql:sql.replace(/CREATE INDEX IF NOT EXISTS/gi,'CREATE INDEX');}
export async function runMigrations(){
 await ensureHistory();
 const names=(await fs.readdir(migrationDir)).filter(x=>x.endsWith('.sql')).sort();
 const applied=(await query('SELECT id,name FROM af_migration_history')).rows;
 const done=new Set(applied.map(x=>String(x.name))); const newly=[];
 for(const name of names){if(done.has(name))continue;
  const sql=await fs.readFile(path.join(migrationDir,name),'utf8');
  try{for(const statement of splitSql(adapt(sql)))await query(statement);
   const id=Number(name.split('_')[0]);
   await query('INSERT INTO af_migration_history (id,name,applied_at) VALUES ($1,$2,CURRENT_TIMESTAMP)',[id,name]);
   newly.push(name);
  }catch(error){throw new Error('Migration '+name+' failed: '+(error?.message||error));}
 }
 return {applied:newly,total:names.length};
}
export async function migrationSnapshot(){return listAniFuzeTables();}
