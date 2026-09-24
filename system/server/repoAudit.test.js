import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const ignored=new Set(['node_modules','.git','dist','storage']);
const forbidden=[/anifuze_demo_admin/i,/demo admin login/i,/mock data/i,/lorem ipsum/i,/coming soon/i,/fake data/i,/dummy data/i];
async function walk(dir,out=[]){
 for(const entry of await fs.readdir(dir,{withFileTypes:true})){
  if(ignored.has(entry.name)||entry.name==='repoAudit.test.js')continue;
  const full=path.join(dir,entry.name);
  if(entry.isDirectory())await walk(full,out);
  else if(/\.(js|jsx|ts|tsx|json|css|sql|md|yml|yaml)$/.test(entry.name))out.push(full);
 }
 return out;
}
test('repository contains no demo/mock authentication or placeholder content',async()=>{
 const files=await walk(root);
 const hits=[];
 for(const file of files){
  const text=await fs.readFile(file,'utf8');
  for(const pattern of forbidden)if(pattern.test(text))hits.push(path.relative(root,file)+': '+pattern);
 }
 assert.deepEqual(hits,[]);
});
