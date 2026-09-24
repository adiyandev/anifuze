import {Router} from 'express';
import {publicSearchCatalog,SORTS,TYPES,STATUSES} from '../services/publicCatalog.js';
const router=Router();
router.get('/catalog',async(req,res)=>{
  try{
    const result=await publicSearchCatalog(req.query);
    res.json({ok:true,...result,sorts:Object.keys(SORTS),types:TYPES,statuses:STATUSES});
  }catch(error){res.status(502).json({ok:false,error:error.message});}
});
export {router as publicCatalogRouter};