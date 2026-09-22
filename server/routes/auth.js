import {Router} from 'express';
import crypto from 'node:crypto';

export const authRouter=Router();

const hashPassword=(password)=>crypto.createHash('sha256').update(password).digest('hex');

authRouter.post('/bootstrap-admin',async(req,res)=>{
  const {email,password}=req.body??{};
  if(typeof email!=='string'||!email.includes('@')||typeof password!=='string'||password.length<8){
    return res.status(400).json({ok:false,error:'Valid email and password of at least 8 characters are required.'});
  }
  // This endpoint is only the installer bootstrap contract. Production auth will
  // use a memory-hard password hash, secure sessions, CSRF protection and 2FA.
  res.status(201).json({ok:true,email,role:'owner',passwordHash:hashPassword(password)});
});
