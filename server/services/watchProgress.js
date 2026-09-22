import crypto from 'node:crypto';
import {query} from '../db/index.js';

const id=()=>crypto.randomUUID();

export async function listWatchHistory(userId,{limit=50}={}){
 const safe=Math.min(Math.max(Number(limit)||50,1),100);
 const r=await query(`SELECT h.id,h.user_id,h.anime_id,h.episode_id,h.progress_seconds,h.watched_at,
   a.title,a.cover_url,a.banner_url,a.episodes
   FROM af_watch_history h
   LEFT JOIN af_anime a ON a.id=h.anime_id
   WHERE h.user_id=$1
   ORDER BY h.watched_at DESC LIMIT ${safe}`,[String(userId)]);
 return r.rows;
}

export async function getWatchProgress(userId,animeId,episodeId=null){
 const params=[String(userId),String(animeId)];
 let sql='SELECT id,user_id,anime_id,episode_id,progress_seconds,watched_at FROM af_watch_history WHERE user_id=$1 AND anime_id=$2';
 if(episodeId){params.push(String(episodeId));sql+=' AND episode_id=$3';}
 sql+=' ORDER BY watched_at DESC LIMIT 1';
 const r=await query(sql,params);
 return r.rows[0]||null;
}

export async function saveWatchProgress(userId,input={}){
 const animeId=String(input.anime_id||'').trim();
 if(!animeId)throw new Error('Anime id is required.');
 const episodeId=input.episode_id?String(input.episode_id):null;
 const progress=Math.max(0,Math.floor(Number(input.progress_seconds)||0));
 const watchedAt=new Date().toISOString();
 const existing=await getWatchProgress(userId,animeId,episodeId);
 if(existing){
  await query('UPDATE af_watch_history SET progress_seconds=$2,watched_at=$3 WHERE id=$1',[existing.id,progress,watchedAt]);
  return getWatchProgress(userId,animeId,episodeId);
 }
 const record={id:id(),user_id:String(userId),anime_id:animeId,episode_id:episodeId,progress_seconds:progress,watched_at:watchedAt};
 await query('INSERT INTO af_watch_history(id,user_id,anime_id,episode_id,progress_seconds,watched_at) VALUES($1,$2,$3,$4,$5,$6)',[record.id,record.user_id,record.anime_id,record.episode_id,record.progress_seconds,record.watched_at]);
 return record;
}

export async function removeWatchHistory(userId,idOrAnime){
 const value=String(idOrAnime);
 await query('DELETE FROM af_watch_history WHERE user_id=$1 AND (id=$2 OR anime_id=$2)',[String(userId),value]);
 return {ok:true};
}

export async function clearWatchHistory(userId){
 await query('DELETE FROM af_watch_history WHERE user_id=$1',[String(userId)]);
 return {ok:true};
}
