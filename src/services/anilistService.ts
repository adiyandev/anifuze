import type {Anime} from '../types';

const ENDPOINT='https://graphql.anilist.co';

type AniListMedia={
 id:number; title:{romaji:string;english?:string|null}; description?:string|null; episodes?:number|null;
 status?:string|null; genres?:string[]; averageScore?:number|null; popularity?:number|null;
 coverImage?:{large?:string|null;extraLarge?:string|null}|null; bannerImage?:string|null;
 format?:string|null; seasonYear?:number|null;
};

const query=`
query($page:Int,$perPage:Int,$sort:[MediaSort],$status:MediaStatus){
 Page(page:$page,perPage:$perPage){
  media(type:ANIME,status:$status,sort:$sort,isAdult:false){
   id title{romaji english} description episodes status genres averageScore popularity
   coverImage{large extraLarge} bannerImage format seasonYear
  }
 }
}`;

const mapMedia=(m:AniListMedia):Anime=>({
 id:String(m.id),
 title:m.title.english||m.title.romaji,
 type:m.format==='MOVIE'?'Movie':'Series',
 status:m.status==='RELEASING'?'Ongoing':m.status==='FINISHED'?'Completed':'Upcoming',
 episodes:m.episodes||0,
 views:m.popularity?m.popularity.toLocaleString():'—',
 genre:(m.genres||[]).slice(0,2).join(' · ')||'Anime',
 description:(m.description||'').replace(/<[^>]+>/g,'').replace(/\\s+/g,' ').trim(),
 cover:m.coverImage?.extraLarge||m.coverImage?.large||'',
 banner:m.bannerImage||m.coverImage?.extraLarge||m.coverImage?.large||'',
 score:m.averageScore?m.averageScore/10:undefined,
 year:m.seasonYear||undefined
});

async function fetchAnime(sort:'TRENDING_DESC'|'POPULARITY_DESC'|'UPDATED_AT_DESC',status?:'RELEASING'|'FINISHED'){
 const body={query,variables:{page:1,perPage:24,sort:[sort],status}};
 const res=await fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(body)});
 if(!res.ok) throw new Error('AniList request failed');
 const json=await res.json();
 return (json?.data?.Page?.media||[]).map(mapMedia) as Anime[];
}

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

export async function fetchBrowseAnime(){return fetchAnime('POPULARITY_DESC');}
export async function fetchLatestAnime(){return fetchAnime('UPDATED_AT_DESC','RELEASING');}

export async function fetchAnimeSchedule(){
 const now=Math.floor(Date.now()/1000);
 const week=now+7*24*60*60;
 const res=await fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({query:scheduleQuery,variables:{page:1,perPage:50,notYetAired:true,airingAt_greater:now,airingAt_lesser:week}})});
 if(!res.ok) throw new Error('AniList schedule request failed');
 const json=await res.json();
 return (json?.data?.Page?.airingSchedules||[]).map((s:any)=>({...mapMedia(s.media),airingAt:s.airingAt,episode:s.episode,timeUntilAiring:s.timeUntilAiring})) as AniListScheduleItem[];
}

export async function fetchRealHomepageAnime(){
 const [trending,latest]=await Promise.all([
  fetchAnime('TRENDING_DESC'),
  fetchAnime('POPULARITY_DESC','RELEASING')
 ]);
 return {trending,latest};
}
