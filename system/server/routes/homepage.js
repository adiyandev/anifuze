import {Router} from 'express';
import {getHomepageData} from '../services/homepage.js';
const router=Router();
router.get('/homepage',async(_req,res)=>{
 try{res.json({ok:true,data:await getHomepageData()});}
 catch(error){res.status(502).json({ok:false,error:error.message||'Homepage provider unavailable'});}
});
export {router as homepageRouter};