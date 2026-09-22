import express from 'express';
import {config} from './config.js';
import {healthCheck} from './db/index.js';
import {runMigrations} from './migrate.js';
import {installerRouter} from './routes/installer.js';
import {authRouter} from './routes/auth.js';
import {anilistRouter} from './routes/anilist.js';
import {episodesRouter} from './routes/episodes.js';
import {providersRouter} from './routes/providers.js';
import {providerConsoleRouter} from './routes/providerConsole.js';
import {providerHealthRouter} from './routes/providerHealth.js';
import {isInstallerLocked} from './installer/index.js';

const app=express();
app.disable('x-powered-by');
app.use(express.json({limit:'1mb'}));

app.get('/api/health',async(_req,res)=>{try{res.json({ok:true,service:'anifuze',database:await healthCheck()});}catch{res.status(503).json({ok:false,error:'Database unavailable'});}});
app.use('/api/installer',installerRouter);
app.use('/api/auth',authRouter);
app.use('/api',anilistRouter);
app.use('/api',episodesRouter);
app.use('/api',providersRouter);
app.use('/api',providerConsoleRouter);
app.use('/api',providerHealthRouter);
app.get('/api/system/install',(_req,res)=>res.json({installationId:config.installationId,domain:config.domain,nodeEnv:config.nodeEnv}));

const start=async()=>{if(await isInstallerLocked())await runMigrations();app.listen(config.port,()=>console.log('AniFuze server listening on :' + config.port));};
start().catch(error=>{console.error('AniFuze startup failed:',error.message);process.exit(1);});
