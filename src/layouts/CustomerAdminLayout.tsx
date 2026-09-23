import {Link,Outlet,useLocation} from 'react-router-dom';
import {BarChart3,Users,Film,Settings,Server,LogOut,Search,Eye,Menu,PlaySquare,Layers,CalendarDays,Radio,TerminalSquare,HeartPulse,Database,Palette,PanelLeft,FileText,Globe,ChartNoAxesCombined,Bell,Shield,ShoppingBag,MessageSquare,Mail,ScrollText} from 'lucide-react';
import {useApp} from '../contexts/AppContext';

const tabs=[['dashboard','Dashboard',BarChart3,'/admin/dashboard'],['users','Users',Users,'/admin/users'],['content','Content',Film,'/admin/anime'],['settings','Settings',Settings,'/admin/settings']] as const;
const groups=[
 ['CONTENT',[['Anime','/admin/anime',Film],['Episodes','/admin/episodes',PlaySquare],['Genres','/admin/genres',Layers],['Schedule','/admin/schedule',CalendarDays]]],
 ['STREAMING',[['Providers','/admin/providers',Radio],['Provider Console','/admin/providers/console',TerminalSquare],['Health','/admin/providers/health',HeartPulse],['Sources','/admin/providers/sources',Database]]],
 ['DESIGN',[['Marketplace','/admin/templates/marketplace',ShoppingBag],['My Templates','/admin/templates',Layers],['Site Builder','/admin/site-builder',Palette],['Appearance','/admin/appearance',Palette],['Navigation','/admin/navigation',PanelLeft],['Pages','/admin/pages',FileText]]],
 ['COMMUNITY',[['Users','/admin/users',Users],['Comments','/admin/comments',MessageSquare],['Reports','/admin/reports',Shield]]],
 ['SYSTEM',[['SEO','/admin/seo',Globe],['Domains','/admin/domains',Globe],['Analytics','/admin/analytics',ChartNoAxesCombined],['Audit Logs','/admin/audit-logs',ScrollText],['Backups','/admin/backups',Database],['Notifications','/admin/notifications',Bell],['Email','/admin/email',Mail],['Settings','/admin/settings',Settings],['Security','/admin/security',Shield]]],
] as const;

export function CustomerAdminLayout(){
 const loc=useLocation(); const {setRole}=useApp();
 const path=loc.pathname;
 const activeTop=path==='/admin/dashboard'?'dashboard':path.startsWith('/admin/users')?'users':path.startsWith('/admin/anime')||path.startsWith('/admin/episodes')||path.startsWith('/admin/genres')||path.startsWith('/admin/schedule')?'content':path.startsWith('/admin/settings')?'settings':'settings';
 const title=path==='/admin/dashboard'?'Admin Dashboard':path.split('/').filter(Boolean).at(-1)?.replace(/-/g,' ')||'Dashboard';
 return <div className="av-admin apple-admin-shell">
  <header className="av-admin-head">
   <Link className="av-admin-brand" to="/admin/dashboard"><span>✦</span><strong>AniFuze</strong><small>ADMIN PANEL</small></Link>
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
