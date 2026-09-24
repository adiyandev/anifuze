export type WatchEntry={animeId:string;episode:number;progressSeconds:number;durationSeconds:number;updatedAt:number};
const api=async(path:string,init?:RequestInit)=>{const r=await fetch(path,{...init,credentials:'include'});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||'Watch data unavailable.');return d};
export const watchProgressService={
 async list():Promise<WatchEntry[]>{const d=await api('/api/watch/history');return (d.history||[]).map((x:any)=>({animeId:String(x.anime_id),episode:Number(x.episode_id)||1,progressSeconds:Number(x.progress_seconds)||0,durationSeconds:1440,updatedAt:new Date(x.watched_at).getTime()}))},
 async get(animeId:string,episode=1){const d=await api('/api/watch/progress?anime_id='+encodeURIComponent(animeId)+'&episode_id='+encodeURIComponent(String(episode)));const x=d.progress;if(!x)return null;return {animeId:String(x.anime_id),episode:Number(x.episode_id)||episode,progressSeconds:Number(x.progress_seconds)||0,durationSeconds:1440,updatedAt:new Date(x.watched_at).getTime()}},
 async save(entry:Omit<WatchEntry,'updatedAt'>){await api('/api/watch/progress',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({anime_id:entry.animeId,episode_id:String(entry.episode),progress_seconds:Math.max(0,Math.floor(entry.progressSeconds))})})},
 async remove(animeId:string){await api('/api/watch/history/'+encodeURIComponent(animeId),{method:'DELETE'})},
 async clear(){await api('/api/watch/history',{method:'DELETE'})},
};
