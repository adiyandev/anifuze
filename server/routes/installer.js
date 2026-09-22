import {Router} from 'express';
import {installerStatus,executeInstallation,isInstallerLocked,rollbackInstallation} from '../installer/index.js';
import {testDatabase} from '../installer/database.js';
export const installerRouter=Router();
installerRouter.get('/status',async(_req,res)=>{try{res.json(await installerStatus());}catch(error){res.status(500).json({ok:false,error:error.message});}});
installerRouter.post('/database',async(req,res)=>{if(await isInstallerLocked())return res.status(409).json({ok:false,error:'Installer is locked.'});try{res.json(await testDatabase(req.body??{}));}catch(error){res.status(400).json({ok:false,error:error.message});}});
installerRouter.post('/install',async(req,res)=>{if(await isInstallerLocked())return res.status(409).json({ok:false,error:'Installer is locked.'});try{res.status(201).json(await executeInstallation(req.body??{}));}catch(error){res.status(400).json({ok:false,error:error.message});}});
installerRouter.post('/rollback',async(_req,res)=>{if(await isInstallerLocked())return res.status(409).json({ok:false,error:'Installer is locked.'});res.json(await rollbackInstallation());});
