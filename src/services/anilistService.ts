import type {Anime} from '../types';

const ENDPOINT='https://graphql.anilist.co';

type AniListMedia={
 id:number; title:{romaji:string;english?:string|null}; description?:string|null; episodes?:number|null;
 status?:string|null; genres?:string[]; averageScore?:number|null; popularity?:number|null;
 coverImage?:{large?:string|null;extraLarge?:string|null}|null; bannerImage?:string|null;
 format?:string|null; seasonYear?:number|null;
};

const query=`
query($page:Int,$perPage:Int,$sort:[MediaSort],$status:MediaStatus,$type:MediaType,$search:String){
 Page(page:$page,perPage:$perPage){
  media(type:$type,status:$status,search:$search,sort:$sort,isAdult:false){
   id title{romaji english} description episodes status genres averageScore popularity
   coverImage{large extraLarge} bannerImage format seasonYear
  }
 }
}`;

const mapMedia=(m:AniListMedia):Anime=>({
 id:String(m.id),
 title:m.title.english||m.title.romaji,
 type:m.format==='MOVIE'?'Movie':'Series',
 status:m.status==='RELEASING'?'Ongoing':m.status==='FINISHED'?'Completed':m.status==='NOT_YET_RELEASED'?'Upcoming':m.status||'Unknown',
 episodes:m.episodes||0,
 views:m.popularity?m.popularity.toLocaleString():'—',
 genre:(m.genres||[]).slice(0,2).join(' · ')||'Anime',
 description:(m.description||'').replace(/<[^>]+>/g,'').replace(/\\s+/g,' ').trim(),
 cover:m.coverImage?.extraLarge||m.coverImage?.large||'',
 banner:m.bannerImage||m.coverImage?.extraLarge||m.coverImage?.large||'',
 score:m.averageScore?m.averageScore/10:undefined,
 year:m.seasonYear||undefined
});

async function fetchAniList({page=1,perPage=24,sort=['POPULARITY_DESC'],status,type,search}:any){
 const body={query,variables:{page,perPage,sort,status:type?status:status,type,search}};
 const res=await fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(body)});
 if(!res.ok)throw new Error('AniList request failed');
 const json=await res.json();
 if(json?.errors?.length)throw new Error(json.errors[0].message||'AniList request failed');
 return (json?.data?.Page?.media||[]).map(mapMedia) as Anime[];
}

const sortMap:Record<string,string>={popularity:'POPULARITY_DESC',trending:'TRENDING_DESC',score:'SCORE_DESC',updated:'UPDATED_AT_DESC',newest:'START_DATE_DESC',title:'TITLE_ROMAJI'};

export async function fetchCatalog(options:any={}){
 const params=new URLSearchParams();
 if(options.q)params.set('q',options.q);
 params.set('page',String(options.page||1));
 params.set('perPage',String(options.perPage||24));
 if(options.type)params.set('type',options.type);
 if(options.status)params.set('status',options.status);
 params.set('sort',options.sort||'popularity');
 try{
  const res=await fetch('/api/catalog?'+params.toString());
  if(res.ok){const data=await res.json();return data.items||[] as Anime[];}
 }catch{}
 const type=options.type||undefined;
 const status=options.status||undefined;
 const sort=sortMap[options.sort||'popularity']||sortMap.popularity;
 return fetchAniList({page:options.page||1,perPage:options.perPage||24,sort:[sort],type,status,search:options.q||undefined});
}

export async function fetchBrowseAnime(){return fetchCatalog({sort:'popularity'});}
export async function fetchLatestAnime(){return fetchCatalog({sort:'updated',status:'RELEASING'});}

const scheduleQuery=`
query($page:Int,$perPage:Int,$notYetAired:Boolean,$airingAt_greater:Int,$airingAt_lesser:Int){
 Page(page:$page,perPage:$perPage){
  airingSchedules(notYetAired:$notYetAired,airingAt_greater:$airingAt_greater,airingAt_lesser:$airingAt_lesser,sort:TIME){
   id airingAt episode timeUntilAiring
   media{id title{romaji english} description episodes status genres averageScore popularity coverImage{large extraLarge} bannerImage format seasonYear}
  }
 }
}`;

export type AniListScheduleItem=Anime & {airingAt:number;episode:number;timeUntilAiring:number};

export async function fetchAnimeSchedule(){
 const now=Math.floor(Date.now()/1000),week=now+7*24*60*60;
 const res=await fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({query:scheduleQuery,variables:{page:1,perPage:50,notYetAired:true,airingAt_greater:now,airingAt_lesser:week}})});
 if(!res.ok)throw new Error('AniList schedule request failed');
 const json=await res.json();
 return (json?.data?.Page?.airingSchedules||[]).map((s:any)=>({...mapMedia(s.media),airingAt:s.airingAt,episode:s.episode,timeUntilAiring:s.timeUntilAiring})) as AniListScheduleItem[];
}

export async function fetchRealHomepageAnime(){
 const [trending,latest]=await Promise.all([fetchCatalog({sort:'trending'}),fetchCatalog({sort:'popularity',status:'RELEASING'})]);
 return {trending,latest};
}

export async function fetchAnimeById(id:string){
 const detailQuery=`query($id:Int){Media(id:$id,type:ANIME){id title{romaji english} description episodes status genres averageScore popularity coverImage{large extraLarge} bannerImage format seasonYear}}`;
 const res=await fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({query:detailQuery,variables:{id:Number(id)}})});
 if(!res.ok)throw new Error('AniList detail request failed');
 const json=await res.json(),media=json?.data?.Media;
 if(!media)throw new Error('Anime not found');
 return mapMedia(media);
}