import {Router} from 'express';
import {listWatchHistory,getWatchProgress,saveWatchProgress,removeWatchHistory,clearWatchHistory} from '../services/watchProgress.js';

const router=Router();
const userId=req=>String(req.headers['x-anifuze-user-id']||req.query.user_id||'').trim();

router.get('/watch/history',async(req,res)=>{
 try{const uid=userId(req);if(!uid)return res.status(401).json({ok:false,error:'User authentication required.'});res.json({ok:true,history:await listWatchHistory(uid,{limit:req.query.limit})});}
 catch(e){res.status(400).json({ok:false,error:e.message});}
});
router.get('/watch/progress',async(req,res)=>{
 try{const uid=userId(req);if(!uid)return res.status(401).json({ok:false,error:'User authentication required.'});const animeId=String(req.query.anime_id||'');if(!animeId)return res.status(400).json({ok:false,error:'Anime id is required.'});res.json({ok:true,progress:await getWatchProgress(uid,animeId,req.query.episode_id||null)});}
 catch(e){res.status(400).json({ok:false,error:e.message});}
});
router.put('/watch/progress',async(req,res)=>{
 try{const uid=userId(req);if(!uid)return res.status(401).json({ok:false,error:'User authentication required.'});res.json({ok:true,progress:await saveWatchProgress(uid,req.body||{})});}
 catch(e){res.status(400).json({ok:false,error:e.message});}
});
router.delete('/watch/history/:id',async(req,res)=>{
 try{const uid=userId(req);if(!uid)return res.status(401).json({ok:false,error:'User authentication required.'});res.json(await removeWatchHistory(uid,req.params.id));}
 catch(e){res.status(400).json({ok:false,error:e.message});}
});
router.delete('/watch/history',async(req,res)=>{
 try{const uid=userId(req);if(!uid)return res.status(401).json({ok:false,error:'User authentication required.'});res.json(await clearWatchHistory(uid));}
 catch(e){res.status(400).json({ok:false,error:e.message});}
});
export {router as watchProgressRouter};
