import {Link,useParams,useLocation,useNavigate} from 'react-router-dom';
import {useMemo,useState} from 'react';
import {anime} from '../../data/mock';
import {useApp} from '../../contexts/AppContext';

const Card=({a}:{a:any})=><Link className="anime-card" to={'/anime/'+a.id}><img src={a.cover} alt={a.title}/><div><span>{a.genre}</span><strong>{a.title}</strong><small>{a.episodes} episodes · {a.status}</small></div></Link>;

export function HomePage(){
 const{settings}=useApp();
 const blocks=JSON.parse(localStorage.getItem('anifuze_builder')||'[]');
 const hero=blocks.find((x:any)=>x.type==='Hero'); const featured=anime[0]; const slides=anime.slice(0,5);
 return <section className="av-home">
  <div className="av-hero">
   <div className="av-hero-backdrop" style={{backgroundImage:'linear-gradient(90deg,rgba(7,7,7,.98) 0%,rgba(7,7,7,.84) 38%,rgba(7,7,7,.3) 70%,#070707 100%),linear-gradient(0deg,#070707 0%,transparent 30%),url('+featured.cover+')'}}/>
   <div className="av-hero-content">
    <span className="av-featured">✦ FEATURED ON {settings.siteName.toUpperCase()}</span>
    <h1>{hero?.title||featured.title}</h1>
    <div className="av-hero-meta"><span>{featured.type}</span><i>•</i><span>{featured.status}</span><i>•</i><span>2026</span><i>•</i><b>★ 4.8</b></div>
    <p>{hero?.content||featured.description}</p>
    <div className="actions"><Link className="av-play-btn" to={'/watch/'+featured.id}>▶ Watch Now</Link><Link className="av-info-btn" to={'/anime/'+featured.id}>ⓘ Details</Link></div>
   </div><div className="av-dots">{slides.map((x:any,i:number)=><span key={x.id} className={i===0?'active':''}/>)}</div>
  </div>
  <div className="av-home-content">
   <section className="av-section"><div className="av-section-head"><div><h2>🔥 Trending Anime</h2><p>What everyone is watching right now.</p></div><Link to="/trending">View all ›</Link></div><div className="av-cards">{anime.slice(0,6).map(a=><Link className="av-card" to={'/anime/'+a.id} key={a.id}><div className="av-card-media"><img src={a.cover} alt={a.title}/><div className="av-card-play">▶</div></div><h3>{a.title}</h3><small>{a.type} <b>•</b> {a.episodes} Episodes</small></Link>)}</div></section>
   <section className="av-section"><div className="av-section-head"><div><h2>🆕 Latest Episodes</h2><p>Fresh releases from your catalog.</p></div><Link to="/latest">View all ›</Link></div><div className="av-cards">{anime.slice(2,8).map(a=><Link className="av-card" to={'/anime/'+a.id} key={a.id}><div className="av-card-media"><img src={a.cover} alt={a.title}/><div className="av-card-play">▶</div></div><h3>{a.title}</h3><small>Episode {Math.min(a.episodes,12)} <b>•</b> 1080p</small></Link>)}</div></section>
   <section className="av-strip"><div><span>ANIFUZE PLATFORM</span><h2>{settings.tagline}</h2><p>Build and run your own anime streaming experience.</p></div><Link className="av-info-btn" to="/manage">Open Admin Panel</Link></section>
  </div>
 </section>;
}
export function Shelf({title}:{title:string}){return <section className="shelf"><div className="section-title"><div><span className="eyebrow">DISCOVER</span><h2>{title}</h2></div><Link to="/browse">View all →</Link></div><div className="poster-grid">{anime.slice(0,4).map(a=><Card a={a} key={a.id}/>)}</div></section>}

export function CatalogPage(){
 const loc=useLocation(); const [q,setQ]=useState('');
 const title=loc.pathname==='/search'?'Search library':loc.pathname==='/genres'?'Genres':loc.pathname==='/latest'?'Latest releases':loc.pathname==='/trending'?'Trending anime':loc.pathname==='/movies'?'Anime movies':loc.pathname==='/ongoing'?'Ongoing series':loc.pathname==='/completed'?'Completed series':'Browse library';
 const filtered=useMemo(()=>anime.filter(a=>a.title.toLowerCase().includes(q.toLowerCase())||a.genre.toLowerCase().includes(q.toLowerCase())),[q]);
 return <section className="page"><span className="eyebrow">LIBRARY</span><h1>{title}</h1>{loc.pathname==='/search'&&<input className="search" value={q} onChange={e=>setQ(e.target.value)} placeholder="Search anime, genres, studios…" autoFocus/>}<div className="filters"><button className="selected">All titles</button><button>Series</button><button>Movies</button><button>Ongoing</button><button>Completed</button></div>{title==='Genres'?<div className="chips">{['Action','Fantasy','Sci-fi','Romance','Adventure','Mystery','Drama','Sports'].map(x=><span key={x}>{x}</span>)}</div>:<div className="poster-grid">{filtered.map(a=><Card key={a.id} a={a}/>)}</div>}</section>;
}

export function AnimeDetailsPage(){
 const{id='eclipse-samurai'}=useParams(); const a=anime.find(x=>x.id===id)||anime[0];
 const[watchlist,setWatchlist]=useState(()=>JSON.parse(localStorage.getItem('anifuze_user_state')||'{}').watchlist?.includes(a.id)||false);
 const toggle=()=>{const state=JSON.parse(localStorage.getItem('anifuze_user_state')||'{}');const list=Array.isArray(state.watchlist)?state.watchlist:[];const next=watchlist?list.filter((x:string)=>x!==a.id):[...list,a.id];localStorage.setItem('anifuze_user_state',JSON.stringify({...state,watchlist:next}));setWatchlist(!watchlist)};
 return <section className="detail"><img className="detail-cover" src={a.cover} alt={a.title}/><div><span className="eyebrow">{a.type} · {a.status}</span><h1>{a.title}</h1><p>{a.description}</p><div className="chips"><span>{a.genre}</span><span>★ 4.8</span><span>2026</span><span>{a.episodes} episodes</span></div><div className="actions"><Link className="button" to={'/watch/'+a.id}>Watch now →</Link><button className="button ghost" onClick={toggle}>{watchlist?'✓ In watchlist':'+ Watchlist'}</button></div><h3>Episodes</h3><div className="episode-list">{Array.from({length:Math.min(a.episodes,12)},(_,i)=><Link key={i} to={'/watch/'+a.id+'?episode='+(i+1)}>Episode {i+1}<span>24m · 1080p</span></Link>)}</div></div></section>;
}

export function WatchPage(){
 const{id}=useParams(); const a=anime.find(x=>x.id===id)||anime[0]; const[ep,setEp]=useState(1);
 const saveProgress=()=>{const state=JSON.parse(localStorage.getItem('anifuze_user_state')||'{}');const history=Array.isArray(state.history)?state.history.filter((x:string)=>x!==a.id):[];localStorage.setItem('anifuze_user_state',JSON.stringify({...state,history:[a.id,...history].slice(0,20)}));};
 return <section className="watch"><div className="player"><span>MOCK PLAYBACK · SAFE STREAM</span><b>▶</b><small>Source: StreamForge API · 1080p · Sub</small></div><div className="watch-info"><span className="eyebrow">NOW PLAYING</span><h1>{a.title} · Episode {ep}</h1><div className="actions"><button className="button ghost" disabled={ep===1} onClick={()=>{setEp(ep-1);saveProgress()}}>← Previous</button><button className="button" disabled={ep>=a.episodes} onClick={()=>{setEp(ep+1);saveProgress()}}>Next episode →</button></div><div className="chips"><span>StreamForge · Healthy</span><span>EmbedWave · Healthy</span><span>Fallback ready</span></div></div></section>;
}

export function AuthPage(){
 const{setRole}=useApp(); const nav=useNavigate();
 const enter=(role:'customer'|'platform_admin',to:string)=>{setRole(role);nav(to)};
 return <section className="auth"><span className="eyebrow">ANIFUZE DEMO ACCESS</span><h1>Enter your workspace.</h1><p>Choose a mock role. Customer and platform administration are private experiences.</p><button className="button" onClick={()=>enter('customer','/manage/dashboard')}>Sign in as customer</button><button className="button ghost" onClick={()=>enter('platform_admin','/platform')}>Sign in as platform admin</button><Link to="/">Continue as public visitor</Link></section>;
}

export function CustomPage(){const{settings}=useApp();return <section className="page"><span className="eyebrow">CUSTOM PAGE</span><h1>Created with AniFuze.</h1><p>Customer-managed pages inherit the active {settings.siteName} visual system.</p></section>}
