import {Router} from 'express';
import {createUser,loginUser,getUserFromRequest,logoutUser,userCookie,clearUserCookie,sendVerificationEmail,verifyEmail,requestPasswordReset,resetPassword} from '../services/userAuth.js';
import crypto from 'node:crypto';
import {getGoogleOAuthConfig,getGoogleIdentity,loginWithGoogle} from '../services/oauth.js';
const router=Router(),attempts=new Map();
const allow=(key,max=8,windowMs=15*60*1000)=>{const now=Date.now(),x=attempts.get(key);if(!x||now-x.start>windowMs){attempts.set(key,{start:now,count:1});return true}x.count++;return x.count<=max};
const setSession=(res,session)=>userCookie(res,session.id,session.remember?60*60*24*30:60*60*24);
router.post('/user/register',async(req,res)=>{if(!allow('register:'+req.ip,6))return res.status(429).json({ok:false,error:'Too many attempts. Try again later.'});try{const user=await createUser(req.body||{});const session=await loginUser({email:req.body?.email,password:req.body?.password,req,remember:req.body?.remember!==false});setSession(res,session);try{await sendVerificationEmail({...user,id:session.user.id,email:session.user.email})}catch{} res.status(201).json({ok:true,user:session.user,verificationRequired:true})}catch(e){res.status(400).json({ok:false,error:e.message})}});
router.post('/user/login',async(req,res)=>{const email=String(req.body?.email||'').trim().toLowerCase();if(!allow('login:'+req.ip+':'+email))return res.status(429).json({ok:false,error:'Too many login attempts. Try again later.'});try{const session=await loginUser({email,password:req.body?.password,req,remember:req.body?.remember!==false});setSession(res,session);res.json({ok:true,user:session.user})}catch(e){res.status(401).json({ok:false,error:e.message})}});
router.get('/user/me',async(req,res)=>{const user=await getUserFromRequest(req);if(!user)return res.status(401).json({ok:false,error:'Not authenticated.'});res.json({ok:true,user})});
router.post('/user/logout',async(req,res)=>{await logoutUser(req);clearUserCookie(res);res.json({ok:true})});
export {router as userAuthRouter};

router.post('/user/verify-email',async(req,res)=>{try{await verifyEmail(req.body?.token);res.json({ok:true})}catch(e){res.status(400).json({ok:false,error:e.message})}});
router.post('/user/resend-verification',async(req,res)=>{try{const user=await getUserFromRequest(req);if(!user)return res.status(401).json({ok:false,error:'Authentication required.'});if(user.emailVerified)return res.json({ok:true,alreadyVerified:true});await sendVerificationEmail(user);res.json({ok:true})}catch(e){res.status(400).json({ok:false,error:e.message})}});
router.post('/user/forgot-password',async(req,res)=>{if(!allow('reset:'+req.ip,5))return res.status(429).json({ok:false,error:'Too many requests. Try again later.'});try{await requestPasswordReset(req.body?.email);res.json({ok:true})}catch(e){res.status(400).json({ok:false,error:'If that account exists, a reset email has been sent.'})}});
router.post('/user/reset-password',async(req,res)=>{try{await resetPassword(req.body?.token,req.body?.password);res.json({ok:true})}catch(e){res.status(400).json({ok:false,error:e.message})}});

router.get('/google',async(req,res)=>{
 try{
  const cfg=await getGoogleOAuthConfig();
  if(!cfg.google_enabled||!cfg.google_client_id||!cfg.google_client_secret||!cfg.google_redirect_uri)return res.status(503).send('Google sign-in is not configured.');
  const state=crypto.randomBytes(32).toString('base64url');
  const cookie=`anifuze_google_oauth_state=${encodeURIComponent(state)}; Max-Age=600; Path=/; HttpOnly; SameSite=Lax${process.env.NODE_ENV==='production'?'; Secure':''}`;
  res.setHeader('Set-Cookie',cookie);
  const params=new URLSearchParams({client_id:cfg.google_client_id,redirect_uri:cfg.google_redirect_uri,response_type:'code',scope:'openid email profile',state,access_type:'online',prompt:'select_account'});
  res.redirect('https://accounts.google.com/o/oauth2/v2/auth?'+params);
 }catch(e){res.status(500).send(e.message||'Google sign-in unavailable.')}
});
router.get('/google/callback',async(req,res)=>{
 try{
  const cookies=Object.fromEntries(String(req.headers.cookie||'').split(';').filter(Boolean).map(x=>{const i=x.indexOf('=');return [x.slice(0,i).trim(),decodeURIComponent(x.slice(i+1).trim())]}));
  const returnedState=Buffer.from(String(req.query?.state||''));const savedState=Buffer.from(String(cookies.anifuze_google_oauth_state||''));if(!returnedState.length||returnedState.length!==savedState.length||!crypto.timingSafeEqual(returnedState,savedState))return res.status(400).send('Invalid OAuth state.');
  if(!req.query?.code)return res.status(400).send('Google authorization was not completed.');
  const identity=await getGoogleIdentity(String(req.query.code));
  const session=await loginWithGoogle({identity,req});
  userCookie(res,session.id,session.remember?60*60*24*30:60*60*24);
  res.redirect('/anifuze/'); 
 }catch(e){res.status(400).send(e.message||'Google sign-in failed.')}
});
