import {Router} from 'express';
import {installerStatus,executeInstallation,isInstallerLocked,rollbackInstallation} from '../installer/index.js';

export const installerRouter=Router();

installerRouter.get('/status',async(_req,res)=>{
  try{res.json(await installerStatus());}
  catch(error){res.status(500).json({ok:false,error:error.message});}
});

installerRouter.post('/install',async(_req,res)=>{
  try{
    const result=await executeInstallation();
    res.status(201).json(result);
  }catch(error){res.status(400).json({ok:false,error:error.message});}
});

installerRouter.post('/rollback',async(_req,res)=>{
  if(await isInstallerLocked()) return res.status(409).json({ok:false,error:'Installer is locked.'});
  res.json(await rollbackInstallation());
});
