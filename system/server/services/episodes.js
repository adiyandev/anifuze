import {query} from '../db/index.js';
import {getAniListAnime} from './anilist.js';

export async function listEpisodes({animeId='',search='',limit=100}={}){
 const params=[];let where='1=1';
 if(animeId){params.push(String(animeId));where+=' AND e.anime_id=$'+params.length;}
 if(search){params.push('%'+String(search).trim().toLowerCase().slice(0,100)+'%');where+=' AND (LOWER(COALESCE(e.title,\'\')) LIKE $'+params.length+' OR LOWER(a.title) LIKE $'+params.length+')';}
 const n=Math.min(200,Math.max(1,Number(limit)||100));
 const r=await query('SELECT e.id,e.anime_id,e.provider_external_id,e.episode_number,e.title,e.description,e.thumbnail_url,e.air_date,e.duration_seconds,e.sort_order,e.visible,e.notes,e.synced_at,a.title AS anime_title,o.title_override AS anime_title_override,eo.title_override,eo.description_override,eo.thumbnail_url_override,eo.sort_order_override FROM af_episodes e JOIN af_anime a ON a.id=e.anime_id LEFT JOIN af_anime_overrides o ON o.anime_id=a.id LEFT JOIN af_episode_overrides eo ON eo.episode_id=e.id WHERE '+where+' ORDER BY a.title ASC,e.sort_order ASC,e.episode_number ASC LIMIT '+n,params);
 return r.rows;
}

export async function updateEpisode(id,body={}){
 const eid=String(id);const found=await query('SELECT id FROM af_episodes WHERE id=$1',[eid]);if(!found.rows[0])throw new Error('Episode not found.');
 if(body.visible!==undefined&&typeof body.visible!=='boolean')throw new Error('visible must be boolean.');
 if(body.sort_order_override!==undefined&&body.sort_order_override!==null&&!Number.isInteger(Number(body.sort_order_override)))throw new Error('sort_order_override must be an integer or null.');
 for(const k of ['title_override','description_override','thumbnail_url_override','notes'])if(body[k]!==undefined&&body[k]!==null&&typeof body[k]!=='string')throw new Error(k+' must be a string or null.');
 if(body.visible!==undefined)await query('UPDATE af_episodes SET visible=$1,updated_at=CURRENT_TIMESTAMP WHERE id=$2',[body.visible,eid]);
 const fields=['title_override','description_override','thumbnail_url_override','sort_order_override'];
 if(fields.some(k=>body[k]!==undefined)){
  const old=(await query('SELECT title_override,description_override,thumbnail_url_override,sort_order_override FROM af_episode_overrides WHERE episode_id=$1',[eid])).rows[0]||{};
  const vals=fields.map(k=>body[k]===undefined?(old[k]??null):body[k]);
  if(process.env.DB_CLIENT==='postgres')await query('INSERT INTO af_episode_overrides(episode_id,title_override,description_override,thumbnail_url_override,sort_order_override,updated_at) VALUES($1,$2,$3,$4,$5,CURRENT_TIMESTAMP) ON CONFLICT(episode_id) DO UPDATE SET title_override=EXCLUDED.title_override,description_override=EXCLUDED.description_override,thumbnail_url_override=EXCLUDED.thumbnail_url_override,sort_order_override=EXCLUDED.sort_order_override,updated_at=CURRENT_TIMESTAMP',[eid,...vals]);
  else await query('INSERT INTO af_episode_overrides(episode_id,title_override,description_override,thumbnail_url_override,sort_order_override,updated_at) VALUES(?,?,?,?,?,CURRENT_TIMESTAMP) ON DUPLICATE KEY UPDATE title_override=VALUES(title_override),description_override=VALUES(description_override),thumbnail_url_override=VALUES(thumbnail_url_override),sort_order_override=VALUES(sort_order_override),updated_at=CURRENT_TIMESTAMP',[eid,...vals]);
 }
 if(body.notes!==undefined)await query('UPDATE af_episodes SET notes=$1,updated_at=CURRENT_TIMESTAMP WHERE id=$2',[body.notes,eid]);
 return (await listEpisodes({limit:1})).find(x=>x.id===eid)||null;
}

export async function syncEpisodesForAnime(animeId){
 const row=(await query('SELECT id,provider_id,provider_external_id FROM af_anime WHERE id=$1',[String(animeId)])).rows[0];if(!row)throw new Error('Anime not found.');
 if(row.provider_id!=='anilist')throw new Error('This episode synchronizer currently supports AniList anime only.');
 const {item}=await getAniListAnime(row.provider_external_id);const count=Number(item.episodes||0);if(!count)return {status:'no_episode_count',count:0};
 for(let i=1;i<=count;i++){
  const id='anilist:'+row.id+':'+i;const values=[id,row.id,String(i),i,'Episode '+i,null,null,null,0,i,new Date()];
  if(process.env.DB_CLIENT==='postgres')await query('INSERT INTO af_episodes(id,anime_id,provider_external_id,episode_number,title,description,thumbnail_url,air_date,duration_seconds,sort_order,synced_at,created_at,updated_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP) ON CONFLICT(id) DO UPDATE SET provider_external_id=EXCLUDED.provider_external_id,episode_number=EXCLUDED.episode_number,synced_at=EXCLUDED.synced_at,updated_at=CURRENT_TIMESTAMP',values);
  else await query('INSERT INTO af_episodes(id,anime_id,provider_external_id,episode_number,title,description,thumbnail_url,air_date,duration_seconds,sort_order,synced_at,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP) ON DUPLICATE KEY UPDATE provider_external_id=VALUES(provider_external_id),episode_number=VALUES(episode_number),synced_at=VALUES(synced_at),updated_at=CURRENT_TIMESTAMP',values);
 }
 return {status:'success',count};
}
