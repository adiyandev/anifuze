import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Eye, 
  Tv, 
  Film, 
  Activity, 
  ArrowUpRight, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  TrendingUp,
  Server
} from 'lucide-react';
import { Card, Badge, Button } from '../../components/ui/UIComponents';
import { analyticsService, providerService, animeService } from '../../services/apiServices';

export default function CustomerDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [providers, setProviders] = useState([]);
  const [anime, setAnime] = useState([]);

  useEffect(() => {
    analyticsService.getAnalytics().then(setAnalytics);
    providerService.getProviders().then(setProviders);
    animeService.getAnime().then(setAnime);
  }, []);

  if (!analytics) return <div className="text-slate-400 p-6">Loading dashboard metrics...</div>;

  return (
    <div className="space-y-8">
      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#26324A] pb-5">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Good afternoon. Here's what's happening with your website.
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time streaming metrics, provider health status, and traffic overview.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="success" className="px-3 py-1 text-xs">
            ● All Systems Operational
          </Badge>
          <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>
            Refresh Stats
          </Button>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase">Total Users</span>
            <Users size={16} className="text-cyan-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white">{analytics.totalUsers.toLocaleString()}</div>
            <div className="text-[11px] text-emerald-400 flex items-center gap-0.5 mt-1 font-medium">
              <ArrowUpRight size={12} /> +12.4% this week
            </div>
          </div>
        </Card>

        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase">Visitors</span>
            <Eye size={16} className="text-violet-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white">{analytics.visitors.toLocaleString()}</div>
            <div className="text-[11px] text-emerald-400 flex items-center gap-0.5 mt-1 font-medium">
              <ArrowUpRight size={12} /> +8.1% this week
            </div>
          </div>
        </Card>

        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase">Anime Views</span>
            <Tv size={16} className="text-cyan-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white">{analytics.animeViews.toLocaleString()}</div>
            <div className="text-[11px] text-emerald-400 flex items-center gap-0.5 mt-1 font-medium">
              <ArrowUpRight size={12} /> +18.2% this week
            </div>
          </div>
        </Card>

        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase">Episode Views</span>
            <Film size={16} className="text-amber-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white">{analytics.episodeViews.toLocaleString()}</div>
            <div className="text-[11px] text-emerald-400 flex items-center gap-0.5 mt-1 font-medium">
              <ArrowUpRight size={12} /> +14.5% this week
            </div>
          </div>
        </Card>

        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase">Total Streams</span>
            <TrendingUp size={16} className="text-cyan-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white">{analytics.streams.toLocaleString()}</div>
            <div className="text-[11px] text-emerald-400 flex items-center gap-0.5 mt-1 font-medium">
              <ArrowUpRight size={12} /> +22.0% this week
            </div>
          </div>
        </Card>

        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase">Uptime</span>
            <Activity size={16} className="text-emerald-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-400">{analytics.providerUptime}</div>
            <div className="text-[11px] text-slate-400 mt-1">Provider SLA High</div>
          </div>
        </Card>
      </div>

      {/* Main Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Traffic Chart & Popular Anime */}
        <div className="lg:col-span-2 space-y-6">
          {/* Traffic Overview */}
          <Card>
            <div className="flex items-center justify-between border-b border-[#26324A] pb-4 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp size={16} className="text-cyan-400" />
                Traffic Overview & Streams (7 Days)
              </h3>
              <div className="text-xs text-slate-400">Live CDN Analytics</div>
            </div>

            <div className="h-48 flex items-end justify-between gap-3 pt-6 px-2">
              {analytics.dailyStats.map((item, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div className="w-full flex items-end justify-center gap-1.5 h-full">
                    <div 
                      className="w-1/2 bg-cyan-500/40 hover:bg-cyan-400 rounded-t-md transition-all relative group" 
                      style={{ height: `${(item.visitors / 25000) * 100}%` }}
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-cyan-300 text-[10px] px-2 py-0.5 rounded border border-cyan-500/30 whitespace-nowrap pointer-events-none transition-opacity z-10">
                        {item.visitors.toLocaleString()} Vis
                      </div>
                    </div>
                    <div 
                      className="w-1/2 bg-violet-600/50 hover:bg-violet-500 rounded-t-md transition-all relative group" 
                      style={{ height: `${(item.streams / 30000) * 100}%` }}
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-violet-300 text-[10px] px-2 py-0.5 rounded border border-violet-500/30 whitespace-nowrap pointer-events-none transition-opacity z-10">
                        {item.streams.toLocaleString()} Str
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">{item.day}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-[#26324A] text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-cyan-500/40 border border-cyan-400"></span>
                <span className="text-slate-300">Unique Visitors</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-violet-600/50 border border-violet-500"></span>
                <span className="text-slate-300">Video Streams</span>
              </div>
            </div>
          </Card>

          {/* Popular Anime */}
          <Card>
            <div className="flex items-center justify-between border-b border-[#26324A] pb-4 mb-4">
              <h3 className="text-sm font-bold text-white">Popular Anime On Your Platform</h3>
              <a href="/manage/anime" className="text-xs text-cyan-400 hover:underline font-semibold">View All</a>
            </div>
            <div className="divide-y divide-[#26324A]">
              {anime.slice(0, 4).map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img src={item.poster} alt={item.title} className="w-10 h-14 object-cover rounded-md border border-[#26324A]" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-100">{item.title}</h4>
                      <p className="text-[11px] text-slate-400">{item.type} • {item.episodes} Episodes</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-cyan-400">{item.views.toLocaleString()}</span>
                    <span className="text-[10px] text-slate-500 block">Total Views</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right 1 Column: Provider Health & System Status */}
        <div className="space-y-6">
          {/* Provider Health Overview */}
          <Card>
            <div className="flex items-center justify-between border-b border-[#26324A] pb-4 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Server size={16} className="text-cyan-400" />
                Provider Status
              </h3>
              <a href="/manage/providers" className="text-xs text-cyan-400 hover:underline font-semibold">Manage</a>
            </div>

            <div className="space-y-3">
              {providers.map((p) => (
                <div key={p.id} className="p-3 bg-[#0B1020] border border-[#26324A] rounded-lg flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-200">{p.name}</div>
                    <div className="text-[10px] text-slate-400">{p.type} • {p.latency}</div>
                  </div>
                  {p.enabled ? (
                    <Badge variant="success" className="text-[10px] flex items-center gap-1">
                      <CheckCircle2 size={10} /> Online
                    </Badge>
                  ) : (
                    <Badge variant="error" className="text-[10px] flex items-center gap-1">
                      <XCircle size={10} /> Disabled
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Quick System Actions */}
          <Card>
            <h3 className="text-sm font-bold text-white mb-3">Quick Management Shortcuts</h3>
            <div className="grid grid-cols-2 gap-2">
              <a href="/manage/site-builder" className="p-3 bg-[#0B1020] hover:bg-[#151D32] border border-[#26324A] rounded-lg text-center transition-colors">
                <span className="text-xs font-bold text-cyan-400 block">Site Builder</span>
                <span className="text-[10px] text-slate-400">Edit Layout</span>
              </a>
              <a href="/manage/providers/console" className="p-3 bg-[#0B1020] hover:bg-[#151D32] border border-[#26324A] rounded-lg text-center transition-colors">
                <span className="text-xs font-bold text-violet-400 block">Console</span>
                <span className="text-[10px] text-slate-400">API Tester</span>
              </a>
              <a href="/manage/templates/marketplace" className="p-3 bg-[#0B1020] hover:bg-[#151D32] border border-[#26324A] rounded-lg text-center transition-colors">
                <span className="text-xs font-bold text-amber-400 block">Marketplace</span>
                <span className="text-[10px] text-slate-400">Templates</span>
              </a>
              <a href="/manage/seo" className="p-3 bg-[#0B1020] hover:bg-[#151D32] border border-[#26324A] rounded-lg text-center transition-colors">
                <span className="text-xs font-bold text-emerald-400 block">SEO Config</span>
                <span className="text-[10px] text-slate-400">Domains</span>
              </a>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
