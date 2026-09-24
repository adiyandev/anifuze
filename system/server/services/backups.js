import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {query,listAniFuzeTables} from '../db/index.js';
import {config} from '../config.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../storage/backups');
const safeName=name=>String(name||'').replace(/[^a-zA-Z0-9._-]/g,'_');
const quote=name=>config.db.client==='postgres'?'"'+name.replaceAll('"','""')+'"':'`'+name.replaceAll('`','``')+'`';
const tableColumns=async table=>{
 const sql=config.db.client==='postgres'
  ? 'SELECT column_name FROM information_schema.columns WHERE table_schema=$1 AND table_name=$2 ORDER BY ordinal_position'
  : 'SELECT column_name FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name=? ORDER BY ordinal_position';
 return (await query(sql,config.db.client==='postgres'?['public',table]:[table])).rows.map(x=>x.column_name);
};
export async function createBackup({label='manual'}={}){
 await fs.mkdir(root,{recursive:true}); const tables=await listAniFuzeTables(); const data={};
 for(const table of tables){const columns=await tableColumns(table);const rows=(await query('SELECT * FROM '+quote(table))).rows;data[table]={columns,rows};}
 const backup={format:'anifuze-backup',version:1,createdAt:new Date().toISOString(),installationId:config.installationId,domain:config.domain,databaseClient:config.db.client,label:String(label).slice(0,120),tables:data};
 const filename='anifuze-'+new Date().toISOString().replace(/[:.]/g,'-')+'-'+safeName(label)+'.json';
 await fs.writeFile(path.join(root,filename),JSON.stringify(backup));
 return {filename,createdAt:backup.createdAt,tables:tables.length,size:(await fs.stat(path.join(root,filename))).size};
}
function normalizeBackup(input){if(!input||input.format!=='anifuze-backup'||input.version!==1||!input.tables||typeof input.tables!=='object')throw new Error('Invalid AniFuze backup file.');return input;}
export async function restoreBackup(input){
 const backup=normalizeBackup(input); const current=await listAniFuzeTables(); const allowed=new Set(current);
 const tables=Object.keys(backup.tables).filter(t=>/^af_[A-Za-z0-9_$-]+$/.test(t)&&allowed.has(t));
 if(!tables.length)throw new Error('Backup contains no tables from this installation.');
 for(const table of [...tables].reverse())await query(config.db.client==='postgres'?'TRUNCATE TABLE '+quote(table)+' CASCADE':'DELETE FROM '+quote(table));
 let inserted=0;
 for(const table of tables){const block=backup.tables[table];const columns=Array.isArray(block.columns)?block.columns.filter(c=>/^[A-Za-z0-9_$-]+$/.test(c)):[];if(!columns.length)continue;for(const row of Array.isArray(block.rows)?block.rows:[]){const values=columns.map(c=>row?.[c]===undefined?null:row[c]);const placeholders=values.map((_,i)=>'$'+(i+1)).join(',');await query('INSERT INTO '+quote(table)+' ('+columns.map(quote).join(',')+') VALUES ('+placeholders+')',values);inserted++;}}
 return {tables:tables.length,rows:inserted,createdAt:backup.createdAt};
}
export async function listBackups(){await fs.mkdir(root,{recursive:true});const names=(await fs.readdir(root)).filter(x=>x.endsWith('.json')).sort().reverse();const out=[];for(const filename of names){try{const stat=await fs.stat(path.join(root,filename));out.push({filename,size:stat.size,createdAt:stat.mtime.toISOString()});}catch{}}return out;}
export async function readBackup(filename){const safe=safeName(filename);if(safe!==filename||!filename.endsWith('.json'))throw new Error('Invalid backup filename.');return JSON.parse(await fs.readFile(path.join(root,filename),'utf8'));}
export async function deleteBackup(filename){const safe=safeName(filename);if(safe!==filename||!filename.endsWith('.json'))throw new Error('Invalid backup filename.');await fs.unlink(path.join(root,filename));}
