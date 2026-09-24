import {isInstallerLocked} from '../../../installer/server/index.js';

const allowedApiPrefixes=['/api/installer','/api/health'];
const allowedWebPrefixes=['/install'];

export async function installationGate(req,res,next){
 try{
  if(await isInstallerLocked())return next();
  const path=req.path;
  if(allowedApiPrefixes.some(prefix=>path===prefix||path.startsWith(prefix+'/')))return next();
  if(allowedWebPrefixes.some(prefix=>path===prefix||path.startsWith(prefix+'/')))return next();
  if(path.startsWith('/api/'))return res.status(503).json({ok:false,code:'INSTALLATION_REQUIRED',error:'AniFuze has not been installed yet.',installer:'/install'});
  return res.redirect(302,'/install');
 }catch(error){
  return res.status(503).json({ok:false,code:'INSTALLATION_GATE_ERROR',error:'Installation status unavailable.'});
 }
}
