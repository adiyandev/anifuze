export type LocalWatchEntry={animeId:string;episode:number;progressSeconds:number;durationSeconds:number;updatedAt:number};

const KEY='anifuze_watch_progress';
const read=():LocalWatchEntry[]=>{try{const value=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(value)?value:[]}catch{return []}};
const write=(items:LocalWatchEntry[])=>localStorage.setItem(KEY,JSON.stringify(items.slice(0,100)));

export const watchProgressService={
 list:()=>read().sort((a,b)=>b.updatedAt-a.updatedAt),
 get:(animeId:string,episode=1)=>read().find(x=>x.animeId===animeId&&x.episode===episode)||null,
 save:(entry:Omit<LocalWatchEntry,'updatedAt'>)=>{const items=read().filter(x=>!(x.animeId===entry.animeId&&x.episode===entry.episode));items.unshift({...entry,updatedAt:Date.now()});write(items);},
 remove:(animeId:string)=>write(read().filter(x=>x.animeId!==animeId)),
 clear:()=>write([]),
};
