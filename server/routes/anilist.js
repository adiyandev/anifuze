import {Router} from 'express';
import {requireAdmin} from './auth.js'; import {requirePermission} from '../auth/permissions.js';
import {searchAniList,getAniListAnime,syncAniList,getSyncStatus,getCachedCatalog} from '../services/anilist.js';
const router=Router();router.use('/admin/anilist',requireAdmin);
router.get('/admin/anilist/status',async(_req,res)=>{try{res.json({ok:true,...await getSyncStatus()});}catch(error){res.status(500).json({ok:false,error:error.message});}});
router.get('/admin/anilist/search',requirePermission('anime_view'),async(req,res)=>{try{res.json({ok:true,...await searchAniList(req.query.q,{page:req.query.page,perPage:req.query.perPage})});}catch(error){res.status(502).json({ok:false,error:error.message});}});
router.get('/admin/anilist/anime/:id',requirePermission('anime_view'),async(req,res)=>{try{res.json({ok:true,...await getAniListAnime(req.params.id)});}catch(error){res.status(502).json({ok:false,error:error.message});}});
router.get('/admin/anilist/catalog',requirePermission('anime_view'),async(req,res)=>{try{res.json({ok:true,items:await getCachedCatalog({limit:req.query.limit,search:req.query.q})});}catch(error){res.status(500).json({ok:false,error:error.message});}});
router.post('/admin/anilist/sync',requirePermission('anime_manage'),async(_req,res)=>{try{res.json({ok:true,...await syncAniList()});}catch(error){res.status(502).json({ok:false,error:error.message});}});
router.patch('/admin/anilist/anime/:id',requirePermission('anime_manage'),async(req,res)=>{
  const id=String(req.params.id||'');
  const existing=await getCachedCatalog({limit:1,search:''});
  const target=existing.find(x=>x.id===id);
  if(!target)return res.status(404).json({ok:false,error:'Anime not found.'});
  const body=req.body||{};
  if(typeof body.enabled!=='undefined'&&typeof body.enabled!=='boolean')return res.status(400).json({ok:false,error:'enabled must be boolean.'});
  const fields=['title_override','description_override','cover_url_override','banner_url_override'];
  for(const field of fields)if(body[field]!==undefined&&body[field]!==null&&typeof body[field]!=='string')return res.status(400).json({ok:false,error:field+' must be a string or null.'});
  const {query}=await import('../db/index.js');
  if(typeof body.enabled!=='undefined')await query('UPDATE af_anime SET enabled=$1,updated_at=CURRENT_TIMESTAMP WHERE id=$2',[body.enabled,id]);
  const overrideValues=fields.map(f=>body[f]===undefined?undefined:body[f]);
  if(overrideValues.some(v=>v!==undefined)){
    const current=await query('SELECT title_override,description_override,cover_url_override,banner_url_override FROM af_anime_overrides WHERE anime_id=$1',[id]);
    const old=current.rows[0]||{};
    const values=fields.map((f,i)=>overrideValues[i]===undefined?(old[f]??null):overrideValues[i]);
    if(process.env.DB_CLIENT==='postgres')await query('INSERT INTO af_anime_overrides(anime_id,title_override,description_override,cover_url_override,banner_url_override,updated_at) VALUES($1,$2,$3,$4,$5,CURRENT_TIMESTAMP) ON CONFLICT(anime_id) DO UPDATE SET title_override=EXCLUDED.title_override,description_override=EXCLUDED.description_override,cover_url_override=EXCLUDED.cover_url_override,banner_url_override=EXCLUDED.banner_url_override,updated_at=CURRENT_TIMESTAMP',[id,...values]);
    else await query('INSERT INTO af_anime_overrides(anime_id,title_override,description_override,cover_url_override,banner_url_override,updated_at) VALUES(?,?,?,?,?,CURRENT_TIMESTAMP) ON DUPLICATE KEY UPDATE title_override=VALUES(title_override),description_override=VALUES(description_override),cover_url_override=VALUES(cover_url_override),banner_url_override=VALUES(banner_url_override),updated_at=CURRENT_TIMESTAMP',[id,...values]);
  }
  res.json({ok:true});
});
export {router as anilistRouter};