import {getProvider,recordProviderResult} from './providers.js';
import {executeProviderRequest} from './providerConsole.js';
import {invokeProviderOperation} from './providerSdk.js';
import {providerHealthRank,shouldAttemptProvider} from './providerHealth.js';

const TEMPLATE=/\{(animeId|episodeId|episode|animeProviderId)\}/g;

function replaceTemplate(value,vars){
 return String(value??'').replace(TEMPLATE,(_,key)=>encodeURIComponent(String(vars[key]??'')));
}
function getPath(obj,path){
 if(!path)return obj;
 return String(path).split('.').filter(Boolean).reduce((v,k)=>v==null?undefined:v[k],obj);
}
function normalizeSources(raw,config,provider){
 const value=getPath(raw,config?.response?.sourcesPath||'sources')??raw;
 const list=Array.isArray(value)?value:(value?.url?[value]:[]);
 return list.map((x,i)=>{
  if(typeof x==='string')return {url:x,type:'auto',quality:'',language:'',providerId:provider.id,providerName:provider.name,index:i};
  const url=x?.url??x?.file??x?.src??x?.source;
  if(!url)return null;
  return {url:String(url),type:String(x?.type??x?.format??'auto'),quality:String(x?.quality??''),language:String(x?.language??x?.lang??''),providerId:provider.id,providerName:provider.name,index:i};
 }).filter(x=>x?.url&&/^https?:\/\//i.test(x.url));
}
async function resolveProvider(provider,vars){
 const config=provider.config_json||{};
 if(config.sdk?.operations?.getSources||config.operations?.getSources){
  const result=await invokeProviderOperation(provider.id,'getSources',vars);
  const sources=(result.data||[]).map((x,i)=>({...x,providerId:provider.id,providerName:provider.name,index:i}));
  if(!sources.length)throw new Error('Provider returned no playable sources.');
  return sources;
 }
 const sourceConfig=config.source||{};
 const headers=sourceConfig.headers||config.headers||{};
 const mode=String(config.mode||provider.type||'').toLowerCase();
 if(mode==='embed'||provider.type==='Embed'){
  const template=config.urlTemplate||config.url_template||config.embedUrl;
  if(!template)throw new Error('Embed provider has no URL template configured.');
  const url=replaceTemplate(template,vars);
  if(!/^https?:\/\//i.test(url))throw new Error('Provider produced an invalid playback URL.');
  return [{url,type:config.playbackType||'external',quality:config.quality||'',language:config.language||'',providerId:provider.id,providerName:provider.name,index:0}];
 }
 const source=config.source||{};
 const endpoint=replaceTemplate(sourceConfig.endpoint||config.sourceEndpoint||'/',vars);
 const method=String(sourceConfig.method||'GET').toUpperCase();
 const query=Object.fromEntries(Object.entries(sourceConfig.query||{}).map(([k,v])=>[k,replaceTemplate(v,vars)]));
 const body=sourceConfig.body?JSON.parse(JSON.stringify(sourceConfig.body,(k,v)=>typeof v==='string'?replaceTemplate(v,vars):v)):undefined;
 const resolvedHeaders=Object.fromEntries(Object.entries(headers).map(([k,v])=>[k,replaceTemplate(v,vars)]));
 const result=await executeProviderRequest({providerId:provider.id,method,endpoint,headers:resolvedHeaders,queryParams:query,body});
 if(result.status<200||result.status>=300)throw new Error('Provider returned HTTP '+result.status+'.');
 let raw;try{raw=JSON.parse(result.body||'{}')}catch{throw new Error('Provider returned non-JSON source data.');}
 const sources=normalizeSources(raw,config,provider);
 if(!sources.length)throw new Error('Provider returned no playable sources.');
 return sources;
}
export async function resolveStream({animeId,episode,episodeId,animeProviderId,providerId}={}){
 const id=String(animeId??'').trim();const ep=String(episode??'1').trim();if(!id)throw new Error('Anime ID is required.');
 const vars={animeId:id,episode:ep,episodeId:String(episodeId??ep),animeProviderId:String(animeProviderId??id)};
 const providers=await (await import('./providers.js')).listProviders();
 const errors=[];
 const candidates=providers.filter(p=>p.enabled&&(!providerId||String(p.id)===String(providerId))&&shouldAttemptProvider(p)).sort((a,b)=>providerHealthRank(a)-providerHealthRank(b)||Number(a.priority)-Number(b.priority));
 for(const provider of candidates){
  try{
   const started=Date.now();
   const sources=await resolveProvider(provider,vars);
   await recordProviderResult(provider.id,{success:true,latencyMs:Date.now()-started,error:false});
   return {animeId:id,episode:Number(ep)||1,provider:{id:provider.id,name:provider.name,type:provider.type},sources};
  }catch(error){await recordProviderResult(provider.id,{success:false,error:true}).catch(()=>{});errors.push({providerId:provider.id,providerName:provider.name,error:error?.message||'Provider failed'});}
 }
 return {animeId:id,episode:Number(ep)||1,provider:null,sources:[],errors};
}
