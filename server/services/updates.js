import {query} from '../db/index.js';
import {config} from '../config.js';

const DEFAULT_URL='https://api.github.com/repos/adiyandev/anifuze/releases/latest';
const clean=(v,max)=>String(v??'').trim().slice(0,max);
const semver=v=>String(v??'').replace(/^v/i,'').split('-')[0].split('.').map(n=>Number(n)||0).slice(0,3);
export function compareVersions(a,b){const x=semver(a),y=semver(b);for(let i=0;i<3;i++){if(x[i]!==y[i])return x[i]>y[i]?1:-1;}return 0;}
export async function getUpdateSettings(){const r=await query('SELECT channel,manifest_url,auto_check,updated_at FROM af_update_settings WHERE id=1');return r.rows[0]||{channel:'stable',manifest_url:DEFAULT_URL,auto_check:true};}
export async function saveUpdateSettings(input={}){
 const current=await getUpdateSettings();
 const channel=['stable','beta','nightly'].includes(String(input.channel))?String(input.channel):current.channel;
 const manifestUrl=clean(input.manifest_url===undefined?current.manifest_url:input.manifest_url,1000)||DEFAULT_URL;
 const autoCheck=input.auto_check===undefined?Boolean(current.auto_check):Boolean(input.auto_check);
 await query('UPDATE af_update_settings SET channel=$1,manifest_url=$2,auto_check=$3,updated_at=CURRENT_TIMESTAMP WHERE id=1',[channel,manifestUrl,autoCheck]);
 return getUpdateSettings();
}
function normalizeRelease(data){
 const tag=String(data.tag_name||data.version||'').trim();
 return {version:tag.replace(/^v/i,''),tag,url:data.html_url||data.url||'',name:data.name||tag,publishedAt:data.published_at||null,notes:data.body||'',assets:(data.assets||[]).map(a=>({name:a.name,size:a.size||0,url:a.browser_download_url||''})).filter(a=>a.url)};
}
export async function checkForUpdate(){
 const settings=await getUpdateSettings();
 const url=settings.manifest_url||DEFAULT_URL;
 const response=await fetch(url,{headers:{Accept:'application/vnd.github+json','User-Agent':'AniFuze-Update-Checker'},signal:AbortSignal.timeout(10000)});
 if(!response.ok)throw new Error('Update server returned HTTP '+response.status+'.');
 const release=normalizeRelease(await response.json());
 if(!release.version)throw new Error('Update manifest did not contain a version.');
 const current=String(config.version||'1.0.0');
 return {currentVersion:current,available:compareVersions(release.version,current)>0,release,settings,checkedAt:new Date().toISOString()};
}
