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
 year:m.seasonYear
});

async function fetchAnime(sort:'TRENDING_DESC'|'POPULARITY_DESC',status?:'RELEASING'|'FINISHED'){
 const body={query,variables:{page:1,perPage:12,sort:[sort],status}};
 const res=await fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(body)});
 if(!res.ok) throw new Error('AniList request failed');
 const json=await res.json();
 return (json?.data?.Page?.media||[]).map(mapMedia) as Anime[];
}

export async function fetchRealHomepageAnime(){
 const [trending,latest]=await Promise.all([
  fetchAnime('TRENDING_DESC'),
  fetchAnime('POPULARITY_DESC','RELEASING')
 ]);
 return {trending,latest};
}
