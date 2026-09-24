import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const dir=path.dirname(fileURLToPath(import.meta.url));
test('migration ids are unique and schema is portable',async()=>{
 const names=(await fs.readdir(path.join(dir,'migrations'))).filter(x=>x.endsWith('.sql')).sort();
 const ids=names.map(x=>x.split('_')[0]);
 assert.equal(new Set(ids).size,ids.length,'migration ids must be unique');
 for(const name of names){
  const sql=(await fs.readFile(path.join(dir,'migrations',name),'utf8')).toUpperCase();
  assert.equal(sql.includes('GEN_RANDOM_UUID'),false, name+' uses PostgreSQL-only UUID generation');
  assert.equal(sql.includes('::JSONB'),false, name+' uses PostgreSQL-only JSONB cast');
  assert.equal(sql.includes('ON CONFLICT'),false, name+' contains non-portable ON CONFLICT syntax');
  assert.equal(sql.includes('RETURNING '),false, name+' contains non-portable RETURNING syntax');
 }
});
