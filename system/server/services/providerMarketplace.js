import {query} from '../db/index.js';
import {config} from '../config.js';
import {getProvider,saveProvider} from './providers.js';

const TYPES=new Set(['API','Embed','Direct','Custom']);
const parse=v=>{if(v==null)return {};if(typeof v==='object')return v;try{return JSON.parse(String(v))}catch{return {}}};
const SAFE_CONFIG_KEYS=new Set(['mode','source','response','headers','query','body','urlTemplate','url_template','embedUrl','playbackType','quality','language','health']);
function sanitizeConfig(value){if(!value||typeof value!=='object'||Array.isArray(value))return {};const out={};for(const [k,v] of Object.entries(value)){if(!SAFE_CONFIG_KEYS.has(k))continue;if(k==='headers'||k==='query'||k==='body'){if(v&&typeof v==='object'&&!Array.isArray(v))out[k]=Object.fromEntries(Object.entries(v).filter(([key])=>!/password|secret|token|api[-_]?key|credential|authorization|cookie/i.test(key)));else continue;}else if(typeof v==='string')out[k]=v.slice(0,4000);else if(typeof v==='object')out[k]=v;}return out;}
const versionParts=v=>{const m=String(v||'').trim().replace(/^v/i,'').match(/^(\d+)(?:\.(\d+))?(?:\.(\d+))?/);return m?[+m[1],+(m[2]||0),+(m[3]||0)]:null};
const compare=(a,b)=>{const x=versionParts(a),y=versionParts(b);if(!x||!y)return null;for(let i=0;i<3;i++)if(x[i]!==y[i])return x[i]>y[i]?1:-1;return 0};

export function normalizeProviderListing(raw={}){
 const id=String(raw.id||raw.providerId||'').trim();
 const name=String(raw.name||'').trim();
 const type=String(raw.type||'API').trim();
 const version=String(raw.version||'1.0.0').trim();
 const description=String(raw.description||'').trim().slice(0,2000);
 const category=String(raw.category||'').trim().slice(0,100);
 const baseUrl=String(raw.baseUrl??raw.base_url??'').trim();
 const providerConfig=sanitizeConfig(parse(raw.config));
 const compatibility=parse(raw.compatibility);
 if(!id||!name)throw new Error('Marketplace provider is missing id or name.');
 if(!/^[a-zA-Z0-9._-]{1,128}$/.test(id))throw new Error('Marketplace provider id is invalid.');
 if(!TYPES.has(type))throw new Error('Marketplace provider type is unsupported.');
 if(!versionParts(version))throw new Error('Marketplace provider version is invalid.');
 if(baseUrl){const u=new URL(baseUrl);if(!['http:','https:'].includes(u.protocol))throw new Error('Marketplace provider base URL must use HTTP(S).');}
 return {id,name,type,version,description,category,baseUrl,config:providerConfig,compatibility};
}
export function providerCompatibility(item,currentVersion=config.version){
 const c=parse(item.compatibility);
 const exact=c.version||c.aniFuzeVersion;
 const min=c.minVersion||c.minAniFuzeVersion||c.min;
 const max=c.maxVersion||c.maxAniFuzeVersion||c.max;
 if(exact){const cmp=compare(currentVersion,exact);if(cmp===null||cmp!==0)return {compatible:false,reason:`Requires AniFuze ${exact}.`};}
 if(min){const cmp=compare(currentVersion,min);if(cmp===null||cmp<0)return {compatible:false,reason:`Requires AniFuze ${min} or newer.`};}
 if(max){const cmp=compare(currentVersion,max);if(cmp===null||cmp>0)return {compatible:false,reason:`Supports AniFuze ${max} or older.`};}
 if(Array.isArray(c.supportedVersions)&&c.supportedVersions.length&&!c.supportedVersions.some(v=>compare(currentVersion,v)===0))return {compatible:false,reason:'This provider does not support the installed AniFuze version.'};
 return {compatible:true,reason:''};
}
async function central(path){
 const base=String(config.providerMarketplaceUrl||'').trim();
 if(!base)throw new Error('AniFuze provider marketplace is not configured.');
 const url=new URL(path,base);
 if(url.protocol!=='https:'&&config.nodeEnv!=='development')throw new Error('Provider marketplace must use HTTPS.');
 const r=await fetch(url,{headers:{accept:'application/json','user-agent':'AniFuze-ProviderClient/'+config.version},signal:AbortSignal.timeout(15000)});
 const data=await r.json().catch(()=>null);
 if(!r.ok||!data)throw new Error(data?.error||'Provider marketplace request failed.');
 return data;
}
export async function listProviderMarketplace(){
 const data=await central('/providers');
 const raw=Array.isArray(data.providers)?data.providers:[];
 const installed=await listInstalledMarketplaceProviders();
 const byId=new Map(installed.map(x=>[String(x.marketplace.id),x]));
 return raw.map(normalizeProviderListing).map(item=>{
  const current=byId.get(item.id);
  const compatibility=providerCompatibility(item);
  const cmp=current?compare(item.version,current.marketplace.version):null;
  return {...item,installed:Boolean(current),installedVersion:current?.marketplace.version||null,updateAvailable:Boolean(current&&compatibility.compatible&&(cmp===null?item.version!==current.marketplace.version:cmp>0)),compatibility};
 });
}
export async function getProviderMarketplaceItem(id){
 const data=await central('/providers/'+encodeURIComponent(String(id)));
 return normalizeProviderListing(data.provider||data);
}
export async function listInstalledMarketplaceProviders(){
 const items=await (async()=>{const r=await query('SELECT id,name,type,base_url,config_json,enabled,priority,updated_at FROM af_providers ORDER BY name ASC');return r.rows})();
 return items.map(row=>{const cfg=parse(row.config_json);return cfg?.marketplace?.id?{...row,config:cfg,marketplace:cfg.marketplace}:null}).filter(Boolean);
}
export async function installMarketplaceProvider(id){
 const item=await getProviderMarketplaceItem(id);
 const compatibility=providerCompatibility(item);
 if(!compatibility.compatible)throw new Error(`Provider is incompatible: ${compatibility.reason}`);
 const existing=(await listInstalledMarketplaceProviders()).find(x=>x.marketplace.id===item.id);
 const cmp=existing?compare(item.version,existing.marketplace.version):null;
 if(existing&&cmp!==null&&cmp<=0)return getProvider(existing.id);
 const providerConfig={...item.config,marketplace:{id:item.id,version:item.version,category:item.category,description:item.description}};
 return saveProvider(existing?.id||null,{name:item.name,type:item.type,base_url:item.baseUrl||null,priority:existing?.priority||1,enabled:existing?.enabled??true,config:providerConfig});
}
export async function updateMarketplaceProvider(id){
 const current=await getProvider(id);
 if(!current)throw new Error('Provider not found.');
 const marketplaceId=current.config_json?.marketplace?.id;
 if(!marketplaceId)throw new Error('Provider is not installed from the marketplace.');
 return installMarketplaceProvider(marketplaceId);
}
