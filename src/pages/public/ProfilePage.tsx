import {useEffect,useMemo,useState} from 'react';
import {Link,useNavigate} from 'react-router-dom';
import {Award,Camera,Check,Clock,Edit3,Heart,Play,Settings,Sparkles,Tv,UserRound} from 'lucide-react';
import {useApp} from '../../contexts/AppContext';
import {watchProgressService} from '../../services/watchProgressService';
import {fetchAnimeById} from '../../services/anilistService';

type WatchItem={animeId:string;episode:number;progressSeconds:number;durationSeconds:number;updatedAt:number};
type Tab='continue'|'favorites'|'history'|'recommendations';

const PROFILE_KEY='anifuze_demo_profile';
const STATE_KEY='anifuze_user_state';

const readProfile=()=>{try{return JSON.parse(localStorage.getItem(PROFILE_KEY)||'{}')}catch{return {}}};
const readFavorites=():string[]=>{try{const s=JSON.parse(localStorage.getItem(STATE_KEY)||'{}');return Array.isArray(s.favorites)?s.favorites:Array.isArray(s.watchlist)?s.watchlist:[]}catch{return []}};

function formatTime(seconds:number){const m=Math.floor(seconds/60);const s=Math.floor(seconds%60);return m+':'+String(s).padStart(2,'0')}

export function ProfilePage(){
 const {role}=useApp(); const navigate=useNavigate();
 const [profile,setProfile]=useState<any>(()=>readProfile()); const [tab,setTab]=useState<Tab>('continue');
 const [history,setHistory]=useState<WatchItem[]>([]); const [anime,setAnime]=useState<Record<string,any>>({});
 const [editing,setEditing]=useState(false); const [draft,setDraft]=useState({username:'Demo User',bio:'Anime enthusiast exploring the AniFuze catalog.',banner:'',avatar:''});
 const [saved,setSaved]=useState(false);
 const demo=typeof window!=='undefined'&&window.location.hostname.endsWith('github.io');

 useEffect(()=>{const p={...draft,...profile};setDraft(p);},[]);
 useEffect(()=>{const load=async()=>{const entries=watchProgressService.list();setHistory(entries);const ids=[...new Set(entries.map(x=>x.animeId)),...readFavorites()];const results=await Promise.all(ids.slice(0,30).map(id=>fetchAnimeById(id).then(a=>[id,a] as const).catch(()=>null)));setAnime(Object.fromEntries(results.filter(Boolean) as [string,any][]));};load()},[]);
 const saveProfile=()=>{localStorage.setItem(PROFILE_KEY,JSON.stringify(draft));setProfile(draft);setSaved(true);setEditing(false);setTimeout(()=>setSaved(false),1800)};
 const continueItems=history.filter(x=>x.progressSeconds>0);
 const favorites=useMemo(()=>readFavorites().map(id=>anime[id]).filter(Boolean),[anime,profile]);
 const shown=tab==='continue'?continueItems:tab==='history'?history:[];
 const displayName=profile.username||draft.username||'Demo User';
 const avatar=profile.avatar||'';
 const banner=profile.banner||'';
 if(!demo&&role==='public_user')return <section className="vault-page"><div className="vault-builder-text"><h2>Sign in to view your profile</h2><Link className="vault-primary" to="/login">Sign in</Link></div></section>;

 return <section className="profile-vault">
  <div className="profile-vault-hero">{banner?<img src={banner} alt="" />:<div className="profile-vault-gradient"/>}<div className="profile-vault-hero-overlay"/>
   {editing&&<div className="profile-edit-note"><Camera size={14}/> Customize profile</div>}
  </div>
  <div className="profile-vault-body">
   <div className="profile-vault-head">
    <div className="profile-avatar">{avatar?<img src={avatar} alt={displayName}/>:<UserRound size={58}/>}</div>
    <div className="profile-identity"><div className="profile-name-row"><h1>{displayName}</h1><span className="profile-badge"><Check size={12}/> MEMBER</span></div><p>{profile.bio||draft.bio}</p><div className="profile-mini-meta"><span><Tv size={14}/> {history.length} streams</span><span><Heart size={14}/> {favorites.length} favorites</span><span><Award size={14}/> AniFuze member</span></div></div>
    <button className="profile-edit-btn" onClick={()=>setEditing(!editing)}><Edit3 size={15}/>{editing?'Cancel':'Edit Profile'}</button>
   </div>

   {editing&&<div className="profile-editor"><label>Username<input value={draft.username} maxLength={40} onChange={e=>setDraft({...draft,username:e.target.value})}/></label><label>Avatar URL<input value={draft.avatar} placeholder="https://..." onChange={e=>setDraft({...draft,avatar:e.target.value})}/></label><label>Banner URL<input value={draft.banner} placeholder="https://..." onChange={e=>setDraft({...draft,banner:e.target.value})}/></label><label className="profile-editor-wide">Bio<textarea maxLength={180} value={draft.bio} onChange={e=>setDraft({...draft,bio:e.target.value})}/></label><button className="vault-primary" onClick={saveProfile}><Check size={15}/> Save profile</button>{saved&&<span className="profile-saved">Saved</span>}</div>}

   <div className="profile-stat-grid"><div><b>{history.length}</b><span>Episodes Watched</span></div><div><b>{continueItems.length}</b><span>In Progress</span></div><div><b>{favorites.length}</b><span>Favorites</span></div><div><b>{Math.round(history.reduce((n,x)=>n+x.progressSeconds,0)/60)}</b><span>Minutes Watched</span></div></div>

   <div className="profile-tabs"><button className={tab==='continue'?'active':''} onClick={()=>setTab('continue')}><Play size={15}/> Continue ({continueItems.length})</button><button className={tab==='favorites'?'active':''} onClick={()=>setTab('favorites')}><Heart size={15}/> Favorites ({favorites.length})</button><button className={tab==='history'?'active':''} onClick={()=>setTab('history')}><Clock size={15}/> History ({history.length})</button><button className={tab==='recommendations'?'active':''} onClick={()=>setTab('recommendations')}><Sparkles size={15}/> For You</button></div>

   {tab==='recommendations'?<div className="profile-empty"><Sparkles size={38}/><h3>Recommendations</h3><p>Discover what's trending on AniFuze and build your watch history to personalize this space.</p><Link className="vault-secondary" to="/trending">Explore trending</Link></div>:tab==='favorites'?<div className="profile-poster-grid">{favorites.map(a=><Link className="profile-poster" to={'/anime/'+a.id} key={a.id}><img src={a.cover} alt={a.title}/><strong>{a.title}</strong></Link>)}{!favorites.length&&<div className="profile-empty"><Heart size={38}/><h3>No favorites yet</h3><p>Save anime you want to keep close.</p><Link className="vault-secondary" to="/browse">Browse anime</Link></div>}</div>:<div className="profile-watch-list">{shown.map(x=>{const a=anime[x.animeId];const pct=x.durationSeconds?Math.min(100,Math.round(x.progressSeconds/x.durationSeconds*100)):0;return <div className="profile-watch-row" key={x.animeId+'-'+x.episode}><img src={a?.cover} alt=""/><div className="profile-watch-copy"><strong>{a?.title||'Loading anime…'}</strong><span>Episode {x.episode} · {formatTime(x.progressSeconds)} watched</span><div className="profile-progress"><i style={{width:pct+'%'}}/></div></div><span className="profile-percent">{pct}%</span><Link className="vault-secondary" to={'/watch/'+x.animeId}>Resume</Link></div>})}{!shown.length&&<div className="profile-empty"><Tv size={38}/><h3>{tab==='continue'?'Nothing to continue':'No watch history'}</h3><p>Start watching anime and your activity will appear here.</p><Link className="vault-primary" to="/browse">Browse anime</Link></div>}</div>}
  </div>
 </section>
}
