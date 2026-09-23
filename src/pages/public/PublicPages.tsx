import {Link,useParams,useLocation,useNavigate} from 'react-router-dom';
import {useEffect,useMemo,useState} from 'react';
import {builderService} from '../../services/mockServices';
import {fetchRealHomepageAnime,fetchCatalog,fetchAnimeSchedule,fetchAnimeById} from '../../services/anilistService';
import {useApp} from '../../contexts/AppContext';
import {watchProgressService} from '../../services/watchProgressService';

const isAnimeItem=(a:any)=>{const t=String(a?.type||a?.format||a?.mediaType||'').toUpperCase();return !t.includes('MANGA')&&!t.includes('NOVEL')&&!t.includes('LIGHT_NOVEL')&&!t.includes('MANHWA')&&!t.includes('MANHUA')};
const animeOnly=(items:any[])=>Array.isArray(items)?items.filter(isAnimeItem):[];
const Card=({a,compact=false}:{a:any;compact?:boolean})=><Link className={compact?'vault-card compact':'vault-card'} to={'/anime/'+a.id}><div className="vault-card-poster"><img src={a.cover} alt={a.title}/><span className="vault-card-badge">{a.status}</span><span className="vault-card-play">▶</span></div><div className="vault-card-info"><strong>{a.title}</strong><small>{a.type} · {a.episodes} Episodes</small></div></Link>;

export function HomePage(){
 const{settings}=useApp(); const[fresh,setFresh]=useState<{trending:any[];latest:any[];popular:any[]}>({trending:[],latest:[],popular:[]});
 const[homepageBlocks,setHomepageBlocks]=useState<any[]>([]); const[template,setTemplate]=useState<any>(null);
 useEffect(()=>{let alive=true;
  fetch('/api/template').then(r=>r.ok?r.json():Promise.reject(new Error('Template unavailable'))).then(x=>{if(alive)setTemplate(x.template)}).catch(()=>{});
  fetch('/api/site-builder/public').then(r=>r.ok?r.json():Promise.reject(new Error('Builder unavailable'))).then(payload=>{if(alive)setHomepageBlocks(payload.blocks||[])}).catch(()=>{});
  fetch('/api/homepage').then(r=>r.ok?r.json():Promise.reject(new Error('Homepage unavailable'))).then(payload=>{
   if(!alive)return; const sections=payload?.data?.sections||[]; setHomepageBlocks(prev=>prev.length?prev:sections);
   setFresh({trending:animeOnly(sections.find((s:any)=>s.id==='trending')?.items||[]),latest:animeOnly(sections.find((s:any)=>s.id==='latest')?.items||[]),popular:animeOnly(sections.find((s:any)=>s.id==='popular')?.items||[])});
  }).catch(()=>{fetchRealHomepageAnime().then(data=>{if(alive)setFresh({trending:animeOnly(data.trending),latest:animeOnly(data.latest),popular:animeOnly(data.trending)})}).catch(()=>{})});
  return()=>{alive=false};
 },[]);
 const liveTrending=fresh.trending; const liveLatest=fresh.latest; const featured=liveTrending[0]||fresh.popular[0]; const slides=liveTrending.slice(0,5); const blocks=homepageBlocks.length?homepageBlocks:builderService.get().filter(b=>!b.hidden);
 if(!featured)return <section className={`vault-home template-${template?.id||'default'}`}><div className="vault-container"><div className="vault-builder-text"><span className="vault-kicker">ANIFUZE</span><h1>{fresh.trending.length===0?'Loading anime…':'No anime available'}</h1><p>{fresh.trending.length===0?'AniList is being queried for the latest catalog. Please try again in a moment.':'AniList returned no trending anime right now.'}</p><button className="vault-primary" onClick={()=>window.location.reload()}>Retry</button></div></div></section>;
 return <section className="vault-home">
  <div className="vault-hero"><div className="vault-hero-bg" style={{backgroundImage:`linear-gradient(90deg,rgba(8,8,8,.98) 0%,rgba(8,8,8,.78) 38%,rgba(8,8,8,.25) 72%,rgba(8,8,8,.82) 100%),linear-gradient(0deg,#080808 0%,transparent 35%),url(${featured.banner||featured.cover})`}}/>
   <div className="vault-hero-content"><span className="vault-kicker">✦ FEATURED ANIME</span><h1>{featured.title}</h1><div className="vault-meta"><span>{featured.type}</span><i>•</i><span>{featured.status}</span><i>•</i><span>{featured.episodes||'?'} Episodes</span><i>•</i><b>★ {featured.score==null?'—':featured.score.toFixed(1)} <small>AniList</small></b></div><p>{featured.description}</p><div className="vault-actions"><Link className="vault-primary" to={'/watch/'+featured.id}>▶ Watch Now</Link><Link className="vault-secondary" to={'/anime/'+featured.id}>ⓘ Details</Link></div></div>
   <div className="vault-dots">{slides.map((x:any,i)=><span className={i===0?'active':''} key={x.id}/>)}</div>
  </div>
  <div className="vault-container">{blocks.length?blocks.map((b:any)=><BuilderSection key={b.id} block={b} liveAnime={liveTrending} latestAnime={liveLatest}/>):<><Shelf title="Trending Anime" subtitle="What everyone is watching right now." items={liveTrending.slice(0,6)}/><Shelf title="Latest Episodes" subtitle="Fresh releases from AniList." items={liveLatest.slice(0,6)} episode/></>}
  </div>
 </section>;
}
function BuilderSection({block,liveAnime,latestAnime}:{block:any;liveAnime:any[];latestAnime:any[]}){const t=String(block.type||'').toLowerCase();if(t==='hero')return <div className="vault-builder-section vault-builder-hero"><span className="vault-kicker">CUSTOM HERO</span><h2>{block.title}</h2><p>{block.content}</p><Link className="vault-primary" to="/browse">Browse anime</Link></div>;if(['anime grid','anime_grid','anime carousel','anime_card','anime card','collection','stats'].includes(t))return <Shelf title={block.title} subtitle={block.content||block.description||''} items={animeOnly(block.items||liveAnime).slice(0,6)} episode={t==='anime card'||t==='anime_card'}/>;if(t==='episode list'||t==='schedule')return <Shelf title={block.title} subtitle={block.content} items={animeOnly(latestAnime).slice(0,6)} episode/>;if(t==='cta'||t==='banner')return <div className="vault-cta"><div><span>ANIFUZE</span><h2>{block.title}</h2><p>{block.content}</p></div><Link className="vault-secondary" to="/browse">Explore library ↗</Link></div>;if(t==='navbar'||t==='footer')return null;return <section className="vault-builder-text"><span className="vault-kicker">{block.type}</span><h2>{block.title}</h2><p>{block.content}</p></section>} 

function Shelf({title,subtitle,items,episode=false}:{title:string;subtitle:string;items:any[];episode?:boolean}){return <section className="vault-shelf"><div className="vault-section-head"><div><h2>{title}</h2><p>{subtitle}</p></div><Link to={episode?'/latest':'/trending'}>View all ›</Link></div><div className="vault-card-grid">{items.map(a=><Card a={a} key={a.id}/>)}</div></section>}

export function CatalogPage(){
 const loc=useLocation(); const path=loc.pathname;
 const isSearch=path==='/search'; const [q,setQ]=useState('');
 const [type,setType]=useState(''); const [status,setStatus]=useState(''); const [sort,setSort]=useState('popularity');
 const [items,setItems]=useState<any[]>([]); const [loading,setLoading]=useState(true); const [error,setError]=useState('');
 const title=path==='/search'?'Search Anime':path==='/genres'?'Genres':path==='/latest'?'Latest Episodes':path==='/trending'?'Trending Anime':path==='/movies'?'Movies':path==='/ongoing'?'Ongoing Anime':path==='/completed'?'Completed Anime':path==='/favorites'?'Your Favorites':path==='/watchlist'?'Your Watchlist':path==='/history'?'Watch History':path==='/continue-watching'?'Continue Watching':'Browse Anime';
 useEffect(()=>{if(path==='/schedule'||path==='/genres')return;let alive=true;setLoading(true);setError('');
  if(path==='/history'||path==='/continue-watching'){
   (async()=>{const entries=(await watchProgressService.list()).filter(e=>path==='/history'||e.progressSeconds>0);
   Promise.all(entries.map(e=>fetchAnimeById(e.animeId).then(a=>({...a,_watch:e})).catch(()=>null))).then(x=>{if(alive)setItems(x.filter(Boolean) as any[])}).catch(()=>{if(alive)setItems([])}).finally(()=>{if(alive)setLoading(false)});})();
   return()=>{alive=false};
  }
  const options:any={q:isSearch?q:'',sort,type,status};
  if(path==='/latest'){options.sort='updated';options.status='RELEASING';}
  if(path==='/trending')options.sort='trending';
  if(path==='/movies')options.type='MOVIE';
  if(path==='/ongoing')options.status='RELEASING';
  if(path==='/completed')options.status='FINISHED';
  fetchCatalog(options).then(x=>{if(alive)setItems(x)}).catch(e=>{if(alive){setItems([]);setError(e.message||'Could not load catalog.')}}).finally(()=>{if(alive)setLoading(false)});
  return()=>{alive=false};
 },[path,q,type,status,sort,isSearch]);
 if(path==='/schedule')return <SchedulePage/>;
 if(path==='/genres')return <section className="vault-page"><div className="vault-page-head"><div><span className="vault-kicker">DISCOVER</span><h1>Genres</h1><p>Provider-controlled AniList genres.</p></div></div><div className="vault-genre-grid">{['Action','Adventure','Comedy','Drama','Fantasy','Mystery','Romance','Sci-Fi','Sports','Supernatural','Thriller','Slice of Life'].map(g=><Link to="/browse" key={g}><span>GENRE</span><strong>{g}</strong><b>→</b></Link>)}</div></section>;
 return <section className="vault-page"><div className="vault-page-head"><div><span className="vault-kicker">DISCOVER · ANILIST</span><h1>{title}</h1><p>{isSearch?'Search the live AniList catalog.':'Browse anime with provider-controlled metadata.'}</p></div></div>
  {isSearch&&<div className="vault-search"><input autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder="Search anime, genres, studios..."/><kbd>⌘ K</kbd></div>}
  <div className="vault-filter-row">
   <select value={type} onChange={e=>setType(e.target.value)}><option value="">All types</option><option value="TV">TV</option><option value="MOVIE">Movies</option><option value="SPECIAL">Special</option><option value="OVA">OVA</option><option value="ONA">ONA</option></select>
   <select value={status} onChange={e=>setStatus(e.target.value)}><option value="">All statuses</option><option value="RELEASING">Ongoing</option><option value="FINISHED">Completed</option><option value="NOT_YET_RELEASED">Upcoming</option><option value="HIATUS">Hiatus</option></select>
   <select value={sort} onChange={e=>setSort(e.target.value)}><option value="popularity">Most popular</option><option value="trending">Trending</option><option value="score">Highest rated</option><option value="updated">Recently updated</option><option value="newest">Newest</option><option value="title">Title A–Z</option></select>
  </div>
  {loading?<div className="vault-builder-text"><h2>Loading AniList…</h2><p>Fetching the latest catalog.</p></div>:error?<div className="vault-builder-text"><h2>Catalog unavailable</h2><p>{error}</p><button className="vault-primary" onClick={()=>setQ(x=>x)}>Retry</button></div>:<div className="vault-library-grid">{items.map(a=><div className="watch-library-item" key={a.id}><Card a={a}/>{a._watch&&<div className="watch-library-progress"><span>Episode {a._watch.episode}</span><b>{Math.round((a._watch.progressSeconds/a._watch.durationSeconds)*100)}%</b><i><em style={{width:Math.min(100,(a._watch.progressSeconds/a._watch.durationSeconds)*100)+'%'}}/></i></div>}</div>)}</div>}
 </section>;
}

function SchedulePage(){
 const [items,setItems]=useState<any[]>([]);
 useEffect(()=>{let alive=true;fetchAnimeSchedule().then(x=>{if(alive)setItems(x)}).catch(()=>{if(alive)setItems([])});return()=>{alive=false}},[]);
 const days=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
 const grouped=days.map((d,i)=>({d,items:items.filter((x:any)=>new Date(x.airingAt*1000).getDay()===((i+1)%7))}));
 const upcoming=items[0];
 return <section className="vault-page schedule-vault"><div className="vault-page-head"><div><span className="vault-kicker">AIRING CALENDAR · ANILIST</span><h1>Anime Schedule</h1><p>Live upcoming releases from AniList.</p></div></div><div className="schedule-layout"><main>{upcoming&&<div className="schedule-feature"><img src={upcoming.banner||upcoming.cover} alt={upcoming.title}/><div><span className="vault-kicker">UP NEXT</span><h2>{upcoming.title}</h2><p>Episode {upcoming.episode} airs {new Date(upcoming.airingAt*1000).toLocaleString()}.</p><div className="countdown"><b>{String(Math.floor(upcoming.timeUntilAiring/3600)).padStart(2,'0')}</b><b>{String(Math.floor(upcoming.timeUntilAiring/60)%60).padStart(2,'0')}</b><b>{String(upcoming.timeUntilAiring%60).padStart(2,'0')}</b></div><Link className="vault-primary" to={'/anime/'+upcoming.id}>View anime</Link></div></div>}<div className="day-tabs">{days.map((d,i)=><button className={i===0?'active':''} key={d}>{d}<small>{grouped[i].items.length}</small></button>)}</div><div className="schedule-grid">{items.map(a=><Link className="schedule-card" to={'/anime/'+a.id} key={a.id+'-'+a.episode}><img src={a.cover} alt={a.title}/><div><small>{new Date(a.airingAt*1000).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</small><strong>{a.title}</strong><span>Episode {a.episode} · {a.genre}</span></div></Link>)}</div></main><aside className="schedule-side"><h3>Release activity</h3>{items.slice(0,8).map((a:any,i:number)=><div className="activity-item" key={a.id+'-side-'+i}><img src={a.cover} alt=""/><div><strong>{a.title}</strong><span>Episode {a.episode} upcoming</span></div><small>{Math.max(0,Math.floor(a.timeUntilAiring/3600))}h</small></div>)}</aside></div></section>
}
export function AnimeDetailsPage(){
 const{id}=useParams(); const[a,setA]=useState<any>(null); const[watchlist,setWatchlist]=useState(false);
 useEffect(()=>{let alive=true;if(id)fetchAnimeById(id).then(x=>{if(alive)setA(x)}).catch(()=>{});return()=>{alive=false}},[id]);
 if(!a)return <section className="vault-page"><h1>Loading anime…</h1></section>;
 const toggle=()=>{const s=JSON.parse(localStorage.getItem('anifuze_user_state')||'{}');const l=Array.isArray(s.watchlist)?s.watchlist:[];const next=watchlist?l.filter((x:string)=>x!==a.id):[...l,a.id];localStorage.setItem('anifuze_user_state',JSON.stringify({...s,watchlist:next}));setWatchlist(!watchlist)};
 return <section className="vault-detail"><div className="vault-detail-bg" style={{backgroundImage:`linear-gradient(90deg,#080808 15%,rgba(8,8,8,.78) 55%,#080808),url(${a.banner||a.cover})`}}/><div className="vault-detail-inner"><img className="vault-detail-poster" src={a.cover} alt={a.title}/><div className="vault-detail-copy"><span className="vault-kicker">{a.type} · {a.status}</span><h1>{a.title}</h1><div className="vault-meta"><span>{a.year||'—'}</span><i>•</i><span>{a.episodes||'?'} Episodes</span><i>•</i><b>★ {a.score==null?'—':a.score.toFixed(1)} <small>AniList</small></b></div><p>{a.description}</p><div className="vault-chip-row">{a.genre.split(' · ').map((g:string)=><span key={g}>{g}</span>)}<span>1080p</span><span>Sub</span></div><div className="vault-actions"><Link className="vault-primary" to={'/watch/'+a.id}>▶ Watch Now</Link><button className="vault-secondary" onClick={toggle}>{watchlist?'✓ In Watchlist':'+ Watchlist'}</button></div></div></div><div className="vault-episodes"><div className="vault-section-head"><div><h2>Episodes</h2><p>{a.episodes||0} episodes available</p></div></div><div className="episode-grid">{Array.from({length:Math.min(a.episodes||0,24)},(_,i)=><Link to={'/watch/'+a.id+'?episode='+(i+1)} key={i}><b>{String(i+1).padStart(2,'0')}</b><span>Episode {i+1}</span><small>24m · 1080p</small></Link>)}</div></div></section>;
}

export function WatchPage(){
 const{id}=useParams(); const[animeData,setAnimeData]=useState<any>(null); const[ep,setEp]=useState(1);
 const[progress,setProgress]=useState(0); const[playing,setPlaying]=useState(false);
 useEffect(()=>{let alive=true;if(id)fetchAnimeById(id).then(async x=>{if(alive){setAnimeData(x);const saved=await watchProgressService.get(id,1);if(saved)setProgress(saved.progressSeconds)}}).catch(()=>{});return()=>{alive=false}},[id]);
 useEffect(()=>{if(!playing||!animeData)return;const timer=window.setInterval(()=>setProgress(x=>Math.min(x+1,1440)),1000);return()=>window.clearInterval(timer)},[playing,animeData]);
 useEffect(()=>{if(!animeData||!id)return;watchProgressService.save({animeId:id,episode:ep,progressSeconds:progress,durationSeconds:1440})},[progress,ep,animeData,id]);
 const changeEpisode=async(next:number)=>{if(!animeData)return;await watchProgressService.save({animeId:id!,episode:ep,progressSeconds:progress,durationSeconds:1440});setEp(next);const saved=await watchProgressService.get(id!,next);setProgress(saved?.progressSeconds||0);setPlaying(false)};
 if(!animeData)return <section className="vault-page"><h1>Loading anime…</h1></section>;
 const percent=Math.min(100,(progress/1440)*100);
 return <section className="vault-watch"><div className="vault-player"><span>SAFE MOCK PLAYBACK</span><button onClick={()=>setPlaying(!playing)}>{playing?'❚❚':'▶'}</button><small>Mock source · 1080p · Sub</small><div className="watch-progress"><i style={{width:percent+'%'}}/></div></div><div className="vault-watch-head"><div><span className="vault-kicker">NOW PLAYING</span><h1>{animeData.title}</h1><p>Episode {ep} · {animeData.genre} · {Math.floor(progress/60)}:{String(progress%60).padStart(2,'0')} watched</p></div><div className="vault-actions"><button className="vault-secondary" disabled={ep===1} onClick={()=>changeEpisode(ep-1)}>← Previous</button><button className="vault-primary" disabled={ep>=(animeData.episodes||1)} onClick={()=>changeEpisode(ep+1)}>Next Episode →</button></div></div><div className="source-row"><span><i/> Mock source · Available</span></div><div className="watch-episodes"><h2>Episodes</h2><div className="episode-grid">{Array.from({length:Math.min(animeData.episodes||0,12)},(_,i)=><button className={ep===i+1?'current':''} onClick={()=>changeEpisode(i+1)} key={i}>{i+1}</button>)}</div></div></section>;
}

export function VerifyEmailPage(){const[token]=useState(()=>new URLSearchParams(window.location.search).get('token')||'');const[done,setDone]=useState(false);const[error,setError]=useState('');useEffect(()=>{if(!token)return setError('Verification token is missing.');fetch('/api/auth/user/verify-email',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token})}).then(async r=>{const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||'Verification failed.');setDone(true)}).catch(e=>setError(e.message))},[token]);return <section className="auth-page"><div className="auth-shell"><div className="auth-card"><div className="auth-copy"><span className="vault-kicker">ACCOUNT SECURITY</span><h1>{done?'Email verified':'Verify your email'}</h1><p>{done?'Your email address has been verified. You can return to your account.':error||'Checking your verification link…'}</p></div><Link className="auth-submit" to={done?'/profile':'/login'}>{done?'Continue':'Back to sign in'}</Link></div></div></section>}
export function ResetPasswordPage(){const[token]=useState(()=>new URLSearchParams(window.location.search).get('token')||'');const[p,setP]=useState(''),[c,setC]=useState(''),[done,setDone]=useState(false),[error,setError]=useState('');const submit=async(e:React.FormEvent)=>{e.preventDefault();setError('');if(p!==c)return setError('Passwords do not match.');try{const r=await fetch('/api/auth/user/reset-password',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token,password:p})});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||'Could not reset password.');setDone(true)}catch(e){setError(e instanceof Error?e.message:'Could not reset password.')}};return <section className="auth-page"><div className="auth-shell"><div className="auth-card"><div className="auth-copy"><span className="vault-kicker">ACCOUNT SECURITY</span><h1>{done?'Password updated':'Reset password'}</h1><p>{done?'Your password has been changed.':error||'Choose a new password for your account.'}</p></div>{!done&&<form className="auth-form" onSubmit={submit}><label><span>New password</span><input type="password" minLength={8} value={p} onChange={e=>setP(e.target.value)} required/></label><label><span>Confirm password</span><input type="password" minLength={8} value={c} onChange={e=>setC(e.target.value)} required/></label><button className="auth-submit">Update password</button></form>}{done&&<Link className="auth-submit" to="/login">Sign in</Link>}</div></div></section>}
export function AuthPage(){
 const{settings,refreshAuth}=useApp(); const navigate=useNavigate(); const location=useLocation();
 const isRegister=location.pathname==='/register';
 const[name,setName]=useState(''),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[confirm,setConfirm]=useState('');
 const[showPassword,setShowPassword]=useState(false),[showConfirm,setShowConfirm]=useState(false),[remember,setRemember]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const siteName=settings?.siteName||'AniFuze',primary=settings?.primary||'#ff2b7a';
 const submit=async(e:React.FormEvent)=>{e.preventDefault();setError('');if(isRegister&&password!==confirm){setError('Passwords do not match.');return}setBusy(true);try{
   const endpoint=isRegister?'/api/auth/user/register':'/api/auth/user/login';
   const body=isRegister?{displayName:name,email,password,remember}:{email,password,remember};
   const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},credentials:'include',body:JSON.stringify(body)});
   const data=await response.json().catch(()=>({}));
   if(!response.ok)throw new Error(data.error||'Authentication failed.');
   await refreshAuth();
   try{
    const legacyState=JSON.parse(localStorage.getItem('anifuze_user_state')||'{}');
    const legacyHistory=JSON.parse(localStorage.getItem('anifuze_watch_progress')||'[]');
    const payload={favorites:Array.isArray(legacyState?.favorites)?legacyState.favorites:[],watchlist:Array.isArray(legacyState?.watchlist)?legacyState.watchlist:[],history:Array.isArray(legacyHistory)?legacyHistory:[]};
    if(payload.favorites.length||payload.watchlist.length||payload.history.length){
      const migrated=await fetch('/api/user/migrate-local',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'include',body:JSON.stringify(payload)});
      if(migrated.ok){localStorage.removeItem('anifuze_user_state');localStorage.removeItem('anifuze_watch_progress');}
    }
   }catch{}
   navigate('/profile',{replace:true});
 }catch(err){setError(err instanceof Error?err.message:'Authentication failed.')}finally{setBusy(false)}};
 return <section className="auth-page"><div className="auth-backdrop"><div className="auth-orb auth-orb-one"/><div className="auth-orb auth-orb-two"/><div className="auth-grid"/></div>
  <div className="auth-shell"><Link className="auth-brand" to="/"><span>{settings?.logo||'✦'}</span><strong>{siteName}</strong></Link>
   <div className="auth-card"><div className="auth-card-glow" style={{'--auth-primary':primary} as React.CSSProperties}/>
    <div className="auth-copy"><span className="vault-kicker">{isRegister?'JOIN THE COMMUNITY':'WELCOME BACK'}</span><h1>{isRegister?'Create your account':'Sign in'}</h1><p>{isRegister?'Create your '+siteName+' account and keep your anime experience in sync.':'Sign in to continue to your '+siteName+' account.'}</p></div>
    {error&&<div className="auth-error" role="alert">{error}</div>}
    <form onSubmit={submit} className="auth-form">
     {isRegister&&<label><span>Display name</span><div className="auth-input-wrap"><input value={name} onChange={e=>setName(e.target.value)} placeholder="What should we call you?" autoComplete="name" required/></div></label>}
     <label><span>Email address</span><div className="auth-input-wrap"><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required/></div></label>
     <label><span>Password</span><div className="auth-input-wrap"><input type={showPassword?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder={isRegister?'At least 8 characters':'Your password'} autoComplete={isRegister?'new-password':'current-password'} minLength={isRegister?8:1} required/><button type="button" className="auth-eye" onClick={()=>setShowPassword(v=>!v)}>{showPassword?'Hide':'Show'}</button></div></label>
     {isRegister&&<label><span>Confirm password</span><div className="auth-input-wrap"><input type={showConfirm?'text':'password'} value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Repeat your password" autoComplete="new-password" required/><button type="button" className="auth-eye" onClick={()=>setShowConfirm(v=>!v)}>{showConfirm?'Hide':'Show'}</button></div></label>}
     {!isRegister&&<div className="auth-row"><label className="auth-check"><input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)}/><span>Remember me</span></label><button type="button" className="auth-link" onClick={async()=>{const emailValue=email.trim();if(!emailValue)return setError('Enter your email address first.');setBusy(true);try{const r=await fetch('/api/auth/user/forgot-password',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:emailValue})});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||'Could not request password reset.');setError('If that account exists, a password reset email has been sent.')}catch(e){setError(e instanceof Error?e.message:'Could not request password reset.')}finally{setBusy(false)}}}>Forgot password?</button></div>}
     <button className="auth-submit" type="submit" disabled={busy}>{busy?'Signing in…':isRegister?'Create account':'Sign in'}</button>
    </form>
    <div className="auth-divider"><span>OR</span></div>
    <button className="auth-google" type="button" onClick={()=>setError('Google sign-in is not enabled for this installation yet.')}>Continue with Google</button>
    {isRegister&&<p className="auth-terms">By creating an account, you agree to the site’s terms and privacy policy.</p>}
    <p className="auth-switch">{isRegister?'Already have an account?':'Don’t have an account?'} <Link to={isRegister?'/login':'/register'}>{isRegister?'Sign in':'Create one'}</Link></p>
   </div><Link className="auth-back" to="/">← Back to {siteName}</Link>
  </div></section>;
}
export function CustomPage(){const{settings}=useApp();return <section className="vault-page"><span className="vault-kicker">CUSTOM PAGE</span><h1>Created with AniFuze.</h1><p>Customer-managed pages inherit the active {settings.siteName} visual system.</p></section>}
