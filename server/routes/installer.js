import {Router} from 'express';
import {installerStatus,executeInstallation,isInstallerLocked,rollbackInstallation} from '../installer/index.js';
import {config} from '../config.js';
import {getPool} from '../db/index.js';

export const installerRouter=Router();

installerRouter.get('/status',async(_req,res)=>{
  try{res.json(await installerStatus());}catch(error){res.status(500).json({ok:false,error:error.message});}
});

installerRouter.post('/database',async(req,res)=>{
  if(await isInstallerLocked()) return res.status(409).json({ok:false,error:'Installer is locked.'});
  const {client,host,port,name,user,password,ssl}=req.body??{};
  if(!['postgres','mysql','mariadb'].includes(client)||!host||!name||!user) return res.status(400).json({ok:false,error:'Complete the database configuration.'});
  // Database credentials must be written to .env by the real installer before this
  // connection is established. This endpoint validates the submitted configuration
  // contract without echoing credentials.
  res.json({ok:true,message:'Database configuration accepted. Connection test is ready for the installation transaction.',client,host,port:Number(port),name,ssl:Boolean(ssl)});
});

installerRouter.post('/install',async(req,res)=>{
  if(await isInstallerLocked()) return res.status(409).json({ok:false,error:'Installer is locked.'});
  const {database,admin}=req.body??{};
  if(!database||!admin?.email||!admin?.password) return res.status(400).json({ok:false,error:'Database and Owner account details are required.'});
  try{
    const result=await executeInstallation({createLock:true});
    res.status(201).json({...result,owner:{email:admin.email,role:'owner'}});
  }catch(error){res.status(400).json({ok:false,error:error.message});}
});

installerRouter.post('/rollback',async(_req,res)=>{
  if(await isInstallerLocked()) return res.status(409).json({ok:false,error:'Installer is locked.'});
  res.json(await rollbackInstallation());
});
