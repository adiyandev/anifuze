import {Link,Outlet,useLocation} from 'react-router-dom';
import {BarChart3,Users,Film,Settings,Server,LogOut,Search,Eye,Menu,PlaySquare,Layers,CalendarDays,Radio,TerminalSquare,HeartPulse,Database,Palette,PanelLeft,FileText,Globe,ChartNoAxesCombined,Bell,Shield,ShoppingBag,MessageSquare} from 'lucide-react';
import {useApp} from '../contexts/AppContext';

const tabs=[['dashboard','Dashboard',BarChart3,'/manage/dashboard'],['users','Users',Users,'/manage/users'],['content','Content',Film,'/manage/anime'],['settings','Settings',Settings,'/manage/settings']] as const;
const groups=[
 ['CONTENT',[['Anime','/manage/anime',Film],['Episodes','/manage/episodes',PlaySquare],['Genres','/manage/genres',Layers],['Collections','/manage/collections',Layers],['Schedule','/manage/schedule',CalendarDays]]],
 ['STREAMING',[['Providers','/manage/providers',Radio],['Provider Console','/manage/providers/console',TerminalSquare],['Health','/manage/providers/health',HeartPulse],['Sources','/manage/providers/sources',Database]]],
 ['DESIGN',[['Marketplace','/manage/templates/marketplace',ShoppingBag],['My Templates','/manage/templates',Layers],['Site Builder','/manage/site-builder',Palette],['Appearance','/manage/appearance',Palette],['Navigation','/manage/navigation',PanelLeft],['Pages','/manage/pages',FileText]]],
 ['COMMUNITY',[['Users','/manage/users',Users],['Comments','/manage/comments',MessageSquare],['Reports','/manage/reports',Shield]]],
 ['SYSTEM',[['SEO','/manage/seo',Globe],['Domains','/manage/domains',Globe],['Analytics','/manage/analytics',ChartNoAxesCombined],['Notifications','/manage/notifications',Bell],['Settings','/manage/settings',Settings]]],
] as const;

export function CustomerAdminLayout(){
 const loc=useLocation(); const {setRole}=useApp();
 const path=loc.pathname;
 const activeTop=path==='/manage/dashboard'?'dashboard':path.startsWith('/manage/users')?'users':path.startsWith('/manage/anime')||path.startsWith('/manage/episodes')||path.startsWith('/manage/genres')||path.startsWith('/manage/collections')||path.startsWith('/manage/schedule')?'content':'settings';
 const title=path==='/manage/dashboard'?'Admin Dashboard':path.split('/').filter(Boolean).at(-1)?.replace(/-/g,' ')||'Dashboard';
 return <div className="av-admin apple-admin-shell">
  <header className="av-admin-head">
   <Link className="av-admin-brand" to="/manage/dashboard"><span>✦</span><strong>AniFuze</strong><small>ADMIN PANEL</small></Link>
   <nav className="av-admin-tabs">{tabs.map(([id,label,Icon,to])=><Link key={id} className={activeTop===id?'active':''} to={to}><Icon size={15}/>{label}</Link>)}</nav>
   <div className="av-admin-actions"><Link className="av-admin-search" to="/search"><Search size={14}/><span>Search</span><kbd>⌘ K</kbd></Link><Link className="av-admin-icon" to="/"><Eye size={15}/></Link><button className="av-admin-avatar" onClick={()=>setRole('public_user')}>A</button></div>
  </header>
  <div className="av-admin-body">
   <aside className="av-admin-subnav">
    <div className="av-admin-subnav-title"><Menu size={13}/> MANAGEMENT</div>
    {groups.map(([heading,items])=><div className="av-admin-group" key={heading}><small>{heading}</small>{items.map(([label,to,Icon])=><Link key={to} className={path===to?'active':''} to={to}><Icon size={13}/><span>{label}</span></Link>)}</div>)}
    <button className="av-admin-signout" onClick={()=>setRole('public_user')}><LogOut size={13}/> Sign out</button>
   </aside>
   <main className="av-admin-main">
    <div className="av-admin-titlebar"><div><span>ADMINISTRATION</span><h1>{title}</h1></div><Link className="av-admin-preview" to="/">↗ Preview site</Link></div>
    <Outlet/>
   </main>
  </div>
 </div>;
}
