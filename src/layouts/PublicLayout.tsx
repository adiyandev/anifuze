import {Link,Outlet,useLocation} from 'react-router-dom';
import {Search,Menu,X,Bell,CalendarDays,Compass,Layers,BarChart3,Download,UserCircle} from 'lucide-react';
import {useState} from 'react';
import {useApp} from '../contexts/AppContext';

export function PublicLayout(){
 const{settings,role,setRole}=useApp();const location=useLocation();const[open,setOpen]=useState(false);
 const nav=[['Home','/',Compass],['Browse','/browse',Layers],['Schedule','/schedule',CalendarDays],['Collections','/genres',Layers],['Stats','/trending',BarChart3],['Notifications','/latest',Bell]] as const;
 return <div className="vault-shell">
  <header className="vault-nav"><Link className="vault-brand" to="/"><span>{settings.logo||'✦'}</span><strong>{settings.siteName}</strong></Link>
   <nav className="vault-main-nav">{nav.map(([label,to,Icon])=><Link key={to} className={location.pathname===to?'active':''} to={to}><Icon size={15}/>{label}</Link>)}</nav>
   <div className="vault-nav-actions"><Link className="vault-search-trigger" to="/search"><Search size={16}/><span>Search anime...</span><kbd>⌘K</kbd></Link><Link className="vault-bell" to="/latest"><Bell size={16}/></Link>{role==='public_user'?<Link className="vault-signin" to="/login"><UserCircle size={15}/> Sign in</Link>:<button className="vault-avatar" onClick={()=>setRole('public_user')}>A</button>}<button className="vault-menu" onClick={()=>setOpen(!open)}>{open?<X size={19}/>:<Menu size={19}/>}</button></div>
  </header>
  {open&&<div className="vault-mobile-nav">{nav.map(([label,to])=><Link key={to} to={to} onClick={()=>setOpen(false)}>{label}</Link>)}<Link to="/search" onClick={()=>setOpen(false)}>Search</Link></div>}
  <main><Outlet/></main>
  <footer className="vault-footer"><div><Link className="vault-brand" to="/"><span>{settings.logo||'✦'}</span><strong>{settings.siteName}</strong></Link><p>{settings.tagline}</p></div><div className="vault-footer-links"><Link to="/browse">Browse</Link><Link to="/schedule">Schedule</Link><Link to="/genres">Genres</Link><Link to="/login">Account</Link></div><small>© 2026 {settings.siteName} · Built with AniFuze</small></footer>
 </div>
}