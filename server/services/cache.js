const store=new Map();
let hits=0;
let misses=0;
let sets=0;
let deletes=0;

function now(){return Date.now();}
function cleanKey(key){return String(key??'').trim().slice(0,500);}

export function cacheGet(key){
 const k=cleanKey(key); const entry=store.get(k);
 if(!entry){misses++;return undefined;}
 if(entry.expiresAt<=now()){store.delete(k);misses++;return undefined;}
 hits++; return entry.value;
}

export function cacheSet(key,value,ttlMs=300000){
 const k=cleanKey(key); if(!k)return value;
 const ttl=Math.max(1000,Number(ttlMs)||300000);
 store.set(k,{value,createdAt:now(),expiresAt:now()+ttl}); sets++; return value;
}

export function cacheDelete(key){const k=cleanKey(key);const deleted=store.delete(k);if(deleted)deletes++;return deleted;}
export function cacheClear(){const count=store.size;store.clear();deletes+=count;return count;}
export function cacheKeys(){return [...store.entries()].filter(([,e])=>e.expiresAt>now()).map(([key,e])=>({key,createdAt:e.createdAt,expiresAt:e.expiresAt,size:estimateSize(e.value)}));}
function estimateSize(value){try{return Buffer.byteLength(JSON.stringify(value),'utf8');}catch{return 0;}}
export function cacheStats(){
 const entries=cacheKeys();
 const bytes=entries.reduce((sum,e)=>sum+e.size,0);
 return {entries:entries.length,bytes,hits,misses,sets,deletes,hitRate:hits+misses?Number((hits/(hits+misses)*100).toFixed(2)):0};
}
export function withCache(key,loader,ttlMs=300000){const cached=cacheGet(key);if(cached!==undefined)return Promise.resolve(cached);return Promise.resolve().then(loader).then(value=>cacheSet(key,value,ttlMs));}
