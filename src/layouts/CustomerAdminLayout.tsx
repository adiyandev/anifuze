import {Link,Outlet,useLocation} from 'react-router-dom';
import {BarChart3,Users,Film,Settings,Server,LogOut,Search,Eye,Menu} from 'lucide-react';
import {useApp} from '../contexts/AppContext';

type IconComponent = typeof BarChart3;

const tabs: Array<{id: string; label: string; Icon: IconComponent}>=[
 {id:'dashboard',label:'Dashboard',Icon:BarChart3},{id:'users',label:'Users',Icon:Users},{id:'anime',label:'Content',Icon:Film},{id:'settings',label:'Settings',Icon:Settings},{id:'system',label:'System',Icon:Server}
];
const groups=[
 ['CONTENT',[['Anime','/manage/anime'],['Episodes','/manage/episodes'],['Genres','/manage/genres'],['Collections','/manage/collections'],['Schedule','/manage/schedule']]],
 ['STREAMING',[['Providers','/manage/providers'],['Console','/manage/providers/console'],['Health','/manage/providers/health'],['Sources','/manage/providers/sources']]],
 ['DESIGN',[['Marketplace','/manage/templates/marketplace'],['My Templates','/manage/templates'],['Site Builder','/manage/site-builder'],['Appearance','/manage/appearance'],['Navigation','/manage/navigation'],['Pages','/manage/pages']]],
 ['SYSTEM',[['SEO','/manage/seo'],['Domains','/manage/domains'],['Analytics','/manage/analytics'],['Notifications','/manage/notifications'],['Settings','/manage/settings']]]
];

export function CustomerAdminLayout(){
 const loc=useLocation(); const {setRole}=useApp();
 const current=loc.pathname.split('/').filter(Boolean)[1]||'dashboard';
 const top=current==='dashboard'?'dashboard':current==='users'?'users':current==='anime'?'anime':current==='settings'?'settings':'system';
 return <div className="av-admin">
   <header className="av-admin-head">
    <Link className="av-admin-brand" to="/manage/dashboard"><span>✦</span><strong>AniFuze</strong><small>ADMIN PANEL</small></Link>
    <nav className="av-admin-tabs">{tabs.map(({id,label,Icon})=><Link key={id} className={top===id?'active':''} to={id==='dashboard'?'/manage/dashboard':id==='users'?'/manage/users':id==='anime'?'/manage/anime':'/manage/settings'}><Icon size={16}/>{label}</Link>)}</nav>
    <div className="av-admin-actions"><Link className="av-admin-search" to="/search"><Search size={15}/><span>Search</span><kbd>⌘ K</kbd></Link><Link className="av-admin-icon" to="/"><Eye size={16}/></Link><button className="av-admin-avatar" onClick={()=>setRole('public_user')}>A</button></div>
   </header>
   <div className="av-admin-body">
    <aside className="av-admin-subnav">
      <div className="av-admin-subnav-title"><Menu size={14}/> MANAGEMENT</div>
      {groups.map(([heading,items])=><div className="av-admin-group" key={heading as string}><small>{heading as string}</small>{(items as any[]).map(([label,to])=><Link key={to} className={loc.pathname===to?'active':''} to={to}>{label}</Link>)}</div>)}
      <button className="av-admin-signout" onClick={()=>setRole('public_user')}><LogOut size={14}/> Sign out</button>
    </aside>
    <main className="av-admin-main"><div className="av-admin-titlebar"><div><span>ADMINISTRATION</span><h1>{loc.pathname==='/manage/dashboard'?'Admin Dashboard':loc.pathname.split('/').filter(Boolean).at(-1)?.replace(/-/g,' ')}</h1></div><Link className="av-admin-preview" to="/">↗ Preview site</Link></div><Outlet/></main>
   </div>
 </div>;
}