import {getProvider} from './providers.js';
import {executeProviderRequest} from './providerConsole.js';

export const PROVIDER_SDK_VERSION=1;
export const PROVIDER_OPERATIONS=Object.freeze(['search','getAnime','getEpisodes','getSources']);
const METHODS=new Set(['GET','POST','PUT','PATCH']);
const TEMPLATE=/\{(animeId|episodeId|episode|animeProviderId|query|page)\}/g;

export function createProviderContext({animeId='',episode='1',episodeId='',animeProviderId='',query='',page=1}={}){
 return {animeId:String(animeId),episode:String(episode),episodeId:String(episodeId||episode),animeProviderId:String(animeProviderId||animeId),query:String(query),page:String(page)};
}
export function interpolate(value,context){return String(value??'').replace(TEMPLATE,(_,key)=>encodeURIComponent(String(context[key]??'')));}

function object(value,name){
 if(value==null)return {};
 if(typeof value==='string'){try{value=JSON.parse(value)}catch{throw new Error(name+' must be valid JSON.')}}
 if(!value||typeof value!=='object'||Array.isArray(value))throw new Error(name+' must be an object.');
 return value;
}
export function validateProviderDefinition(definition={}){
 const mode=String(definition.mode||definition.type||'API').toLowerCase();
 if(!['api','embed','direct','custom'].includes(mode))throw new Error('Unsupported provider mode.');
 if(mode==='embed'){
  const template=definition.urlTemplate||definition.url_template||definition.embedUrl;
  if(!/^https?:\/\//i.test(String(template||'')))throw new Error('Embed providers require an HTTP(S) URL template.');
  return true;
 }
 const source=definition.source||{};const endpoint=source.endpoint||definition.sourceEndpoint;
 if(!endpoint)throw new Error('API providers require a source endpoint.');
 return true;
}
export function validateProviderSdkManifest(manifest={}){
 const m=object(manifest,'manifest');
 const version=Number(m.sdkVersion??m.sdk_version??PROVIDER_SDK_VERSION);
 if(version!==PROVIDER_SDK_VERSION)throw new Error('Unsupported provider SDK version.');
 const operations=object(m.operations??{},'operations');
 for(const [name,raw] of Object.entries(operations)){
  if(!PROVIDER_OPERATIONS.includes(name))throw new Error('Unsupported provider operation: '+name+'.');
  const op=object(raw,'operation');
  if(!String(op.endpoint??'').trim())throw new Error('Provider operation '+name+' has no endpoint.');
  const method=String(op.method||'GET').toUpperCase();
  if(!METHODS.has(method))throw new Error('Unsupported method for '+name+'.');
 }
 return {sdkVersion:version,operations};
}
export function normalizeProviderResponse(raw={}){
 const value=raw?.sources??raw?.data?.sources??raw?.results??raw?.data??raw;
 const list=Array.isArray(value)?value:(value?.url?[value]:[]);
 return list.map(x=>typeof x==='string'?{url:x,type:'auto',quality:'',language:''}:{url:String(x?.url??x?.file??x?.src??x?.source??''),type:String(x?.type??x?.format??'auto'),quality:String(x?.quality??''),language:String(x?.language??x?.lang??'')}).filter(x=>/^https?:\/\//i.test(x.url));
}
export async function getProviderDefinition(providerId){
 const provider=await getProvider(providerId);if(!provider)throw new Error('Provider not found.');
 if(!provider.enabled)throw new Error('Provider is disabled.');
 validateProviderDefinition({...provider.config_json,type:provider.type});
 return provider;
}
export function createProviderClient(provider){
 if(!provider?.id)throw new Error('Provider is required.');
 const manifest=validateProviderSdkManifest(provider.config_json?.sdk??provider.config_json);
 return {
  sdkVersion:PROVIDER_SDK_VERSION,
  providerId:String(provider.id),
  async call(operation,context={}){
   if(!PROVIDER_OPERATIONS.includes(operation))throw new Error('Unsupported provider operation.');
   const op=manifest.operations[operation];
   if(!op)throw new Error('Provider does not implement '+operation+'.');
   const ctx=createProviderContext(context);
   const endpoint=interpolate(op.endpoint,ctx);
   const query=Object.fromEntries(Object.entries(op.query??{}).map(([k,v])=>[k,interpolate(v,ctx)]));
   const headers=Object.fromEntries(Object.entries(op.headers??{}).map(([k,v])=>[k,interpolate(v,ctx)]));
   const body=op.body===undefined?undefined:JSON.parse(JSON.stringify(op.body,(k,v)=>typeof v==='string'?interpolate(v,ctx):v));
   const result=await executeProviderRequest({providerId:provider.id,method:String(op.method||'GET').toUpperCase(),endpoint,headers,queryParams:query,body});
   if(result.status<200||result.status>=300)throw new Error('Provider returned HTTP '+result.status+'.');
   let raw;try{raw=JSON.parse(result.body||'{}')}catch{throw new Error('Provider returned non-JSON data.');}
   return {raw,status:result.status,time_ms:result.time_ms,data:operation==='getSources'?normalizeProviderResponse(raw):raw};
  },
  search:context=>this.call('search',context)
 };
}
export async function invokeProviderOperation(providerId,operation,context={}){
 const provider=await getProviderDefinition(providerId);
 return createProviderClient(provider).call(operation,context);
}
