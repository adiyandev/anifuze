import crypto from 'node:crypto';

const buckets=new Map();
const WINDOW_MS=60_000;
const MAX_REQUESTS=120;

export function securityHeaders(req,res,next){
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('X-Frame-Options','SAMEORIGIN');
  res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy','camera=(),microphone=(),geolocation=()');
  if(req.secure||req.headers['x-forwarded-proto']==='https'){
    res.setHeader('Strict-Transport-Security','max-age=31536000; includeSubDomains');
  }
  next();
}

export function requestId(req,res,next){
  const id=String(req.headers['x-request-id']||crypto.randomUUID()).slice(0,100);
  res.setHeader('X-Request-Id',id);
  req.requestId=id;
  next();
}

export function apiRateLimit(req,res,next){
  if(!req.path.startsWith('/api/')||req.path==='/api/health')return next();
  const now=Date.now();
  const key=String(req.ip||req.socket.remoteAddress||'unknown');
  const bucket=buckets.get(key);
  if(!bucket||now-bucket.startedAt>=WINDOW_MS){buckets.set(key,{startedAt:now,count:1});return next();}
  bucket.count++;
  if(bucket.count>MAX_REQUESTS){
    res.setHeader('Retry-After',String(Math.ceil((WINDOW_MS-(now-bucket.startedAt))/1000)));
    return res.status(429).json({ok:false,error:'Too many requests. Please try again later.',requestId:req.requestId});
  }
  next();
}

export function pruneRateLimitBuckets(){
  const cutoff=Date.now()-WINDOW_MS;
  for(const [key,bucket] of buckets)if(bucket.startedAt<cutoff)buckets.delete(key);
}
