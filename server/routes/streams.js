import {Router} from 'express';
import {resolveStream} from '../services/streamResolver.js';

export const streamsRouter=Router();
streamsRouter.get('/stream/:animeId',async(req,res)=>{
 try{
  const result=await resolveStream({animeId:req.params.animeId,episode:req.query.episode||1,episodeId:req.query.episodeId,animeProviderId:req.query.animeProviderId});
  if(!result.sources.length)return res.status(404).json({ok:false,error:'No playable streams found.',...result});
  res.json({ok:true,...result});
 }catch(error){res.status(400).json({ok:false,error:error.message});}
});
