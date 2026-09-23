import os from 'node:os';
import fs from 'node:fs/promises';
import {config} from '../config.js';
import {healthCheck,listAniFuzeTables} from '../db/index.js';

async function disk(){try{const stat=await fs.statfs(process.cwd());const total=Number(stat.blocks)*Number(stat.bsize);const free=Number(stat.bavail)*Number(stat.bsize);return {total,free,used:Math.max(0,total-free)};}catch{return null;}}
export async function getSystemInformation(){
 const started=process.uptime(); let database={ok:false,client:config.db.client};
 try{database=await healthCheck();}catch(e){database={ok:false,client:config.db.client,error:e.message};}
 const [storage,tables]=await Promise.all([disk(),listAniFuzeTables().catch(()=>[])]);
 return {generatedAt:new Date().toISOString(),application:{name:'AniFuze',environment:config.nodeEnv,version:process.env.npm_package_version||'unknown',installationId:config.installationId,domain:config.domain,uptimeSeconds:Math.floor(started)},runtime:{node:process.version,platform:process.platform,arch:process.arch,cpus:os.cpus().length,memory:{total:os.totalmem(),free:os.freemem(),heapUsed:process.memoryUsage().heapUsed,heapTotal:process.memoryUsage().heapTotal}},database:{...database,tableCount:tables.length},storage};
}
