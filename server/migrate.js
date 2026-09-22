import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {query} from './db/index.js';
const dir=path.dirname(fileURLToPath(import.meta.url));
const migrationDir=path.join(dir,'migrations');
async function ensureHistory(){await query('CREATE TABLE IF NOT EXISTS af_migration_history (id INTEGER PRIMARY KEY, name VARCHAR(255) NOT NULL, applied_at TIMESTAMP NOT NULL)');}
export async function runMigrations(){
  await ensureHistory();
  const names=(await fs.readdir(migrationDir)).filter(x=>x.endsWith('.sql')).sort();
  const applied=(await query('SELECT id,name FROM af_migration_history')).rows;
  const done=new Set(applied.map(x=>String(x.name)));
  for(const name of names){if(done.has(name)) continue; const sql=await fs.readFile(path.join(migrationDir,name),'utf8'); await query(sql); const id=Number(name.split('_')[0]); await query('INSERT INTO af_migration_history (id,name,applied_at) VALUES ($1,$2,CURRENT_TIMESTAMP)',[id,name]);}
  return {applied:names.filter(x=>!done.has(x)),total:names.length};
}
