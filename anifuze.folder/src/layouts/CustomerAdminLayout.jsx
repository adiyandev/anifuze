import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Tv, 
  Film, 
  Radio, 
  Terminal, 
  Activity, 
  Layers, 
  Users, 
  MessageSquare, 
  ShieldAlert, 
  Store, 
  ShoppingBag, 
  Wrench, 
  Palette, 
  Navigation, 
  FileText, 
  Globe, 
  Search, 
  BarChart3, 
  Bell, 
  Settings, 
  LogOut,
  ChevronDown,
  Menu,
  X,
  ExternalLink
} from 'lucide-react';
import { Badge } from '../ui/UIComponents';

export default function CustomerAdminLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navigationGroups = [
    {
      title: 'OVERVIEW',
      items: [
        { label: 'Dashboard', path: '/manage/dashboard', icon: LayoutDashboard }
      ]
    },
    {
      title: 'CONTENT',
      items: [
        { label: 'Anime', path: '/manage/anime', icon: Tv },
        { label: 'Episodes', path: '/manage/episodes', icon: Film },
        { label: 'Schedule', path: '/manage/schedule', icon: Radio }
      ]
    },
    {
      title: 'STREAMING INFRASTRUCTURE',
      items: [
        { label: 'Providers', path: '/manage/providers', icon: Radio },
        { label: 'Provider Console', path: '/manage/providers/console', icon: Terminal, badge: 'Dev' },
        { label: 'Provider Health', path: '/manage/providers/health', icon: Activity },
        { label: 'Source Manager', path: '/manage/providers/sources', icon: Layers }
      ]
    },
    {
      title: 'MARKETPLACE & BUILDER',
      items: [
        { label: 'Template Marketplace', path: '/manage/templates/marketplace', icon: Store },
        { label: 'Purchases', path: '/manage/purchases', icon: ShoppingBag },
        { label: 'Site Builder', path: '/manage/site-builder', icon: Wrench, badge: 'Visual' },
        { label: 'Appearance', path: '/manage/appearance', icon: Palette },
        { label: 'Navigation', path: '/manage/navigation', icon: Navigation },
        { label: 'Pages', path: '/manage/pages', icon: FileText }
      ]
    },
    {
      title: 'COMMUNITY & USERS',
      items: [
        { label: 'Users', path: '/manage/users', icon: Users },
        { label: 'Comments', path: '/manage/comments', icon: MessageSquare },
        { label: 'Reports', path: '/manage/reports', icon: ShieldAlert }
      ]
    },
    {
      title: 'SYSTEM & CONFIG',
      items: [
        { label: 'SEO Settings', path: '/manage/seo', icon: Search },
        { label: 'Custom Domains', path: '/manage/domains', icon: Globe },
        { label: 'Analytics', path: '/manage/analytics', icon: BarChart3 },
        { label: 'Notifications', path: '/manage/notifications', icon: Bell },
        { label: 'Website Settings', path: '/manage/settings', icon: Settings }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#070B17] text-slate-100 flex flex-col font-sans">
      {/* Top Bar */}
      <header className="h-16 bg-[#0B1020] border-b border-[#26324A] flex items-center justify-between px-4 lg:px-6 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-slate-400 hover:text-white p-1.5 rounded-lg bg-slate-800/50"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-violet-600 flex items-center justify-center font-black text-slate-950 text-base shadow-md">
              AF
            </div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent">
              AniFuze <span className="text-xs font-normal px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 ml-1">Panel</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <a 
            href="/" 
            target="_blank" 
            rel="noreferrer" 
            className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors bg-[#10172A] border border-[#26324A] px-3 py-1.5 rounded-lg"
          >
            <span>View Public Site</span>
            <ExternalLink size={13} />
          </a>

          <div className="flex items-center gap-3 pl-3 border-l border-[#26324A]">
            <div className="w-8 h-8 rounded-full bg-violet-600/30 border border-violet-500/40 flex items-center justify-center text-violet-300 font-semibold text-xs">
              AD
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-200">Adiyan Site</span>
              <span className="text-[10px] text-slate-400">Owner Console</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-16 left-0 z-30 w-64 bg-[#0B1020] border-r border-[#26324A] flex flex-col justify-between overflow-y-auto transition-transform duration-200 ease-in-out
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="p-4 space-y-6">
            {navigationGroups.map((group, idx) => (
              <div key={idx} className="space-y-1">
                <h4 className="text-[10px] font-bold text-slate-500 tracking-wider uppercase px-2 mb-1.5">
                  {group.title}
                </h4>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path || (item.path !== '/manage/dashboard' && location.pathname.startsWith(item.path));
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`
                        flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all
                        ${isActive 
                          ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold' 
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'}
                      `}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon size={16} className={isActive ? 'text-cyan-400' : 'text-slate-400'} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <Badge variant="purple" className="text-[9px] px-1.5 py-0">
                          {item.badge}
                        </Badge>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-[#26324A] bg-[#070B17]/50">
            <NavLink
              to="/platform"
              className="flex items-center gap-2 text-xs text-violet-400 hover:text-violet-300 transition-colors p-2 rounded-lg hover:bg-violet-500/10 border border-violet-500/20"
            >
              <ShieldAlert size={15} />
              <span>Switch to Platform Admin</span>
            </NavLink>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 bg-[#070B17] overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
