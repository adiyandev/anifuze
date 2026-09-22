import fs from 'node:fs/promises';
import os from 'node:os';
import process from 'node:process';

const requiredNodeMajor=18;
const checks=[];
const add=(name,ok,detail)=>checks.push({name,ok,detail});

export async function checkRequirements({dbClient='postgres',envPath='.env'}={}){
  add('Node.js',Number(process.versions.node.split('.')[0])>=requiredNodeMajor,process.version+' (18+ required)');
  add('64-bit runtime',process.arch==='x64'||process.arch==='arm64',process.arch);
  add('Database driver', ['postgres','mysql','mariadb'].includes(dbClient), dbClient);
  add('Environment configuration', await fs.access(envPath).then(()=>true).catch(()=>false), envPath);
  add('Memory',os.totalmem()>=1024*1024*1024,Math.round(os.totalmem()/1024/1024)+' MB detected');
  add('Storage',await fs.stat('.').then(s=>!!s).catch(()=>false),'Application directory accessible');
  add('HTTPS',process.env.NODE_ENV!=='production'||process.env.ANIFUZE_HTTPS==='true',process.env.NODE_ENV==='production'?'Production HTTPS flag required':'Development mode');
  return {ok:checks.every(x=>x.ok),checks};
}
