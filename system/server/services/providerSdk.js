import {getProvider} from './providers.js';

const METHODS=new Set(['GET','POST','PUT','PATCH','DELETE']);
const TEMPLATE=/\\{(animeId|episodeId|episode|animeProviderId)\\}/g;

export function createProviderContext({animeId='',episode='1',episodeId='',animeProviderId=''}={}){
 return {animeId:String(animeId),episode:String(episode),episodeId:String(episodeId||episode),animeProviderId:String(animeProviderId||animeId)};
}
export function interpolate(value,context){return String(value??'').replace(TEMPLATE,(_,key)=>encodeURIComponent(String(context[key]??'')));}
export function validateProviderDefinition(definition={}){
 const mode=String(definition.mode||definition.type||'API').toLowerCase();
 if(!['api','embed','direct','custom'].includes(mode))throw new Error('Unsupported provider mode.');
 if(mode==='embed'){
  const template=definition.urlTemplate||definition.url_template||definition.embedUrl;
  if(!/^https?:\\/\\//i.test(String(template||'')))throw new Error('Embed providers require an HTTP(S) URL template.');
 } else {
  const source=definition.source||{};const endpoint=source.endpoint||definition.sourceEndpoint;
  if(!endpoint)throw new Error('API providers require a source endpoint.');
 }
 return true;
}
export function normalizeProviderResponse(raw={}){
 const value=raw?.sources??raw?.data?.sources??raw?.results??raw?.data??raw;
 const list=Array.isArray(value)?value:(value?.url?[value]:[]);
 return list.map(x=>typeof x==='string'?{url:x,type:'auto',quality:'',language:''}:{url:String(x?.url??x?.file??x?.src??x?.source??''),type:String(x?.type??x?.format??'auto'),quality:String(x?.quality??''),language:String(x?.language??x?.lang??'')}).filter(x=>/^https?:\\/\\//i.test(x.url));
}
export async function getProviderDefinition(providerId){
 const provider=await getProvider(providerId);if(!provider)throw new Error('Provider not found.');
 if(!provider.enabled)throw new Error('Provider is disabled.');
 validateProviderDefinition({...provider.config_json,type:provider.type});
 return provider;
}
export {METHODS};
