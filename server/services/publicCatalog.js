import {query} from '../db/index.js';
import {normalizeMedia,requestForCatalog,searchAniList} from './anilist.js';
import {withCache} from './cache.js';

export const SORTS=Object.freeze({
  popularity:'POPULARITY_DESC',
  trending:'TRENDING_DESC',
  score:'SCORE_DESC',
  updated:'UPDATED_AT_DESC',
  newest:'START_DATE_DESC',
  title:'TITLE_ROMAJI'
});
export const TYPES=Object.freeze(['TV','TV_SHORT','MOVIE','SPECIAL','OVA','ONA','MUSIC']);
export const STATUSES=Object.freeze(['FINISHED','RELEASING','NOT_YET_RELEASED','CANCELLED','HIATUS']);

async function visibilityFor(ids){
  if(!ids.length)return new Map();
  const placeholders=ids.map((_,i)=>'$'+(i+1)).join(',');
  const r=await query('SELECT provider_external_id,enabled FROM af_anime WHERE provider_id=$'+(ids.length+1)+' AND provider_external_id IN ('+placeholders+')',[...ids,'anilist']);
  return new Map(r.rows.map(x=>[String(x.provider_external_id),Boolean(x.enabled)]));
}

async function browseAniList({page,perPage,type,status,sort}){
  const variables={page,perPage,sort:[sort]};
  const args=['isAdult:false','sort:$sort','type:ANIME'];
  let definitions='$page:Int,$perPage:Int,$sort:[MediaSort]';
  if(type){definitions+=',$type:MediaType';args[2]='type:$type';variables.type=type;}
  if(status){definitions+=',$status:MediaStatus';args.push('status:$status');variables.status=status;}
  const queryText='query('+definitions+'){Page(page:$page,perPage:$perPage){media('+args.join(',')+'){id title{romaji english native} description episodes status genres averageScore popularity coverImage{large extraLarge} bannerImage format seasonYear}}}';
  const data=await requestForCatalog(queryText,variables);
  return {items:(data?.Page?.media||[]).map(normalizeMedia),source:'anilist',stale:false};
}

export async function publicSearchCatalog({q='',page=1,perPage=24,type='',status='',sort='popularity'}={}){
 const clean=String(q||'').trim().slice(0,100);
 const p=Math.max(1,Number(page)||1);
 const pp=Math.min(50,Math.max(1,Number(perPage)||24));
 const selectedType=TYPES.includes(String(type))?String(type):'';
 const selectedStatus=STATUSES.includes(String(status))?String(status):'';
 const selectedSort=SORTS[String(sort)]||SORTS.popularity;
 const key='catalog:'+JSON.stringify({q:clean,page:p,perPage:pp,type:selectedType,status:selectedStatus,sort:selectedSort});
 return withCache(key,async()=>{
  const result=clean
    ? await searchAniList(clean,{page:p,perPage:pp})
    : await browseAniList({page:p,perPage:pp,type:selectedType,status:selectedStatus,sort:selectedSort});
  const visibility=await visibilityFor((result.items||[]).map(x=>String(x.externalId)));
  const items=(result.items||[]).filter(x=>!visibility.has(String(x.externalId))||visibility.get(String(x.externalId))===true);
  return {items,source:result.source||'anilist',stale:Boolean(result.stale),page:p,perPage:pp};
 },120000);
}
