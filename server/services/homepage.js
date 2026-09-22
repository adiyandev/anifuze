import {requestForCatalog,normalizeMedia} from './anilist.js';

const fields='id title{romaji english native} description episodes status genres averageScore popularity coverImage{large extraLarge} bannerImage format seasonYear';
const queries={
 trending:'query($page:Int,$perPage:Int){Page(page:$page,perPage:$perPage){media(type:ANIME,isAdult:false,sort:TRENDING_DESC){'+fields+'}}}',
 popular:'query($page:Int,$perPage:Int){Page(page:$page,perPage:$perPage){media(type:ANIME,isAdult:false,sort:POPULARITY_DESC){'+fields+'}}}',
 latest:'query($page:Int,$perPage:Int){Page(page:$page,perPage:$perPage){media(type:ANIME,isAdult:false,status:RELEASING,sort:UPDATED_AT_DESC){'+fields+'}}}'
};

async function section(kind,limit){
 const data=await requestForCatalog(queries[kind],{page:1,perPage:Math.min(24,Math.max(1,limit||12))});
 return (data?.Page?.media||[]).map(normalizeMedia);
}

export async function getHomepageData(){
 const [trending,popular,latest]=await Promise.all([section('trending',12),section('popular',12),section('latest',12)]);
 return {
  source:'anilist',
  sections:[
   {id:'trending',type:'anime_grid',title:'Trending Now',description:'What everyone is watching right now.',items:trending},
   {id:'latest',type:'anime_grid',title:'Latest Episodes',description:'Fresh releases from currently airing anime.',items:latest},
   {id:'popular',type:'anime_grid',title:'Popular Anime',description:'Popular titles from the AniList catalog.',items:popular}
  ],
  featured:trending.slice(0,5)[0]||popular[0]||null
 };
}