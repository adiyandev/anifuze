import {anime,providers,defaultBlocks,defaultSettings,templates} from '../data/mock';
import {store} from './storage';
import type {Provider,Settings,BuilderBlock,Anime} from '../types';

const delay=(ms=180)=>new Promise(r=>setTimeout(r,ms));
const clone=<T,>(value:T):T=>JSON.parse(JSON.stringify(value));

export const animeService={
 async getAll(){await delay();return clone(store.get<Anime[]>('anifuze_anime',anime))},
 async getById(id:string){return (await this.getAll()).find(a=>a.id===id)},
 async save(item:Anime){const all=await this.getAll();store.set('anifuze_anime',all.some(a=>a.id===item.id)?all.map(a=>a.id===item.id?item:a):[item,...all]);return item},
 async delete(id:string){store.set('anifuze_anime',(await this.getAll()).filter(a=>a.id!==id))}
};

export const episodeService={
 async getAll(){await delay();return store.get<any[]>('anifuze_episodes',Array.from({length:24},(_,i)=>({id:'episode-'+(i+1),animeId:anime[i%anime.length].id,number:i+1,title:'Episode '+(i+1),visibility:'Published',duration:'24m',sources:3})))},
 async save(item:any){const all=await this.getAll();store.set('anifuze_episodes',all.some(x=>x.id===item.id)?all.map(x=>x.id===item.id?item:x):[item,...all]);return item},
 async delete(id:string){store.set('anifuze_episodes',(await this.getAll()).filter(x=>x.id!==id))}
};

export const providerService={
 async getAll(){await delay();return clone(store.get<Provider[]>('anifuze_providers',providers))},
 async getById(id:string){return (await this.getAll()).find(x=>x.id===id)},
 async save(p:Provider){const all=await this.getAll();store.set('anifuze_providers',all.some(x=>x.id===p.id)?all.map(x=>x.id===p.id?p:x):[...all,p]);return p},
 async delete(id:string){store.set('anifuze_providers',(await this.getAll()).filter(x=>x.id!==id))},
 async test(p:Provider){await delay(650);const status=p.enabled?'Connected':'Invalid Configuration';return{status,latency:p.enabled?String(p.latency||110)+' ms':'—',authentication:p.type==='API'?'Mock API key accepted':'Not required',reachable:p.enabled}},
 async testEmbed(template:string,vars:Record<string,string>){let url=template;for(const[k,v]of Object.entries(vars))url=url.replaceAll('{'+k+'}',v);const missing=(url.match(/\{[^}]+\}/g)||[]);return{valid:missing.length===0,url,missing}}
};

export const settingsService={get:()=>store.get<Settings>('anifuze_settings',defaultSettings),save:(v:Settings)=>store.set('anifuze_settings',v)};
export const builderService={get:()=>store.get<BuilderBlock[]>('anifuze_builder',defaultBlocks),save:(v:BuilderBlock[])=>store.set('anifuze_builder',v)};
export const templateService={
 getAll:()=>clone(templates),
 getById:(id:string)=>templates.find(t=>t.id===id),
 purchase:(id:string)=>{const ids=store.get<string[]>('anifuze_purchases',[]);store.set('anifuze_purchases',[...new Set([...ids,id])]);return true},
 install:(id:string)=>{const ids=store.get<string[]>('anifuze_templates',[]);store.set('anifuze_templates',[...new Set([...ids,id])]);return true},
 activate:(id:string)=>{store.set('anifuze_active_template',id);return true},
 uninstall:(id:string)=>store.set('anifuze_templates',store.get<string[]>('anifuze_templates',[]).filter(x=>x!==id))
};
export const userService={getAll:()=>store.get<any[]>('anifuze_users',Array.from({length:8},(_,i)=>({id:'user-'+i,username:['luna','orbit','kai','mika'][i%4]+i,email:'user'+i+'@example.test',status:i===3?'Banned':'Active',role:'public_user'}))),save:(u:any)=>{const all=userService.getAll();store.set('anifuze_users',all.some(x=>x.id===u.id)?all.map(x=>x.id===u.id?u:x):[u,...all]);return u}};
export const analyticsService={get:()=>({visitors:84241,users:8902,animeViews:142800,episodeViews:64200,streams:31482,providerUsage:99.2,period:'30D'})};
export const pageService={getAll:()=>store.get<any[]>('anifuze_pages',['Home','Browse','Latest','Trending','Schedule','Genres','About','Contact'].map((name,i)=>({id:name.toLowerCase(),name,hidden:false,homepage:i===0}))),save:(pages:any[])=>store.set('anifuze_pages',pages)};
export const navigationService={get:()=>store.get<any[]>('anifuze_navigation',[{label:'Browse',to:'/browse'},{label:'Latest',to:'/latest'},{label:'Trending',to:'/trending'},{label:'Schedule',to:'/schedule'}]),save:(items:any[])=>store.set('anifuze_navigation',items)};
export const notificationService={getAll:()=>store.get<any[]>('anifuze_notifications',[]),save:(items:any[])=>store.set('anifuze_notifications',items)};
export const domainService={get:()=>store.get('anifuze_domain',{domain:'demo.anifuze.site',dns:'Verified',ssl:'Active',connection:'Connected'}),connect:(domain:string)=>store.set('anifuze_domain',{domain,dns:'Pending',ssl:'Pending',connection:'Verification required'})};
export const collectionService={getAll:()=>store.get<any[]>('anifuze_collections',[]),save:(items:any[])=>store.set('anifuze_collections',items)};
export const commentService={getAll:()=>store.get<any[]>('anifuze_comments',[]),save:(items:any[])=>store.set('anifuze_comments',items)};
export const reportService={getAll:()=>store.get<any[]>('anifuze_reports',[]),save:(items:any[])=>store.set('anifuze_reports',items)};
