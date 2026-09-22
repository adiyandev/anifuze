import {Router} from 'express';
import {requireAdmin} from './auth.js';
import {requirePermission} from '../auth/permissions.js';
import {listEpisodes,updateEpisode,syncEpisodesForAnime} from '../services/episodes.js';
const router=Router();router.use('/admin/episodes',requireAdmin);
router.get('/admin/episodes',requirePermission('episodes_view'),async(req,res)=>{try{res.json({ok:true,items:await listEpisodes({animeId:req.query.animeId,search:req.query.q,limit:req.query.limit})});}catch(e){res.status(500).json({ok:false,error:e.message});}});
router.patch('/admin/episodes/:id',requirePermission('episodes_manage'),async(req,res)=>{try{res.json({ok:true,item:await updateEpisode(req.params.id,req.body||{})});}catch(e){res.status(400).json({ok:false,error:e.message});}});
router.post('/admin/episodes/sync/:animeId',requirePermission('episodes_manage'),async(req,res)=>{try{res.json({ok:true,...await syncEpisodesForAnime(req.params.animeId)});}catch(e){res.status(502).json({ok:false,error:e.message});}});
export {router as episodesRouter};
