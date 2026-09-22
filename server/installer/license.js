import crypto from 'node:crypto';
import {config} from '../config.js';
export function getInstallationIdentity(){return {installationId:config.installationId,domain:config.domain,licenseKey:config.licenseKey};}
export async function verifyLicense(){
 if(config.nodeEnv==='development'&&config.licenseKey==='dev-license') return {valid:true,status:'development',installationId:config.installationId,domain:config.domain};
 if(!config.licenseKey) return {valid:false,status:'missing'};
 return {valid:false,status:'verification_required'};
}
export function createInstallationId(){return crypto.randomUUID();}
