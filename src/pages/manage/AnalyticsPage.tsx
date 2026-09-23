import { useMemo, useState } from 'react';
import { Activity, ArrowUpRight, CalendarDays, ChartNoAxesCombined, Clock3, Download, Globe2, Monitor, Play, RefreshCw, Server, Smartphone, Tablet, TrendingUp, Users, Video, type LucideIcon } from 'lucide-react';

type Range = '24h' | '7d' | '30d' | '90d';

const ranges: Range[] = ['24h', '7d', '30d', '90d'];
const basePoints = [38,45,42,57,51,66,62,73,68,82,77,91,86,96,88,104,98,112,108,121,116,128,124,136];
const popular = [['One Piece',18420,18],['Solo Leveling',15210,15],['Jujutsu Kaisen',12840,13],['Demon Slayer',10490,10],['Attack on Titan',9270,9]] as const;
const providers = [['AniWave',72,1.8],['MegaCloud',64,2.3],['Vidstream',51,3.1],['StreamWish',43,4.2]] as const;
const devices: Array<[string, number, LucideIcon]> = [['Desktop',58,Monitor],['Mobile',31,Smartphone],['Tablet',11,Tablet]];

function Metric({icon: Icon,label,value,change,sub}:{icon:LucideIcon;label:string;value:string;change:string;sub:string}) {
  return <article className="an-metric"><div className="an-metric-top"><span className="an-icon"><Icon size={16}/></span><small>{label}</small><span className="an-change"><ArrowUpRight size={11}/>{change}</span></div><strong>{value}</strong><p>{sub}</p></article>;
}

export function AnalyticsPage() {
  const [range,setRange] = useState<Range>('7d');
  const [tab,setTab] = useState<'traffic'|'providers'>('traffic');
  const [refreshing,setRefreshing] = useState(false);
  const multiplier = range === '24h' ? 1 : range === '7d' ? 1.8 : range === '30d' ? 3.6 : 6.4;
  const spark = useMemo(() => {
    const factor = range === '30d' ? 1.35 : range === '90d' ? 1.7 : 1;
    return basePoints.map(value => value * factor);
  }, [range]);
  const max = Math.max(...spark);
  const totalViews = Math.round(68240 * multiplier).toLocaleString();
  const streamStarts = Math.round(38920 * multiplier).toLocaleString();
  const visitors = Math.round(24810 * multiplier).toLocaleString();
  const users = Math.round(8340 * multiplier).toLocaleString();
  const refresh = () => { setRefreshing(true); window.setTimeout(() => setRefreshing(false), 650); };
  const chartPoint = (value:number,index:number) => {
    const x = (index / (spark.length - 1)) * 1000;
    const y = 300 - (value / max) * 234;
    return x + ',' + y;
  };

  return <section className="analytics-page">
    <div className="an-hero"><div><div className="an-kicker"><ChartNoAxesCombined size={13}/> PLATFORM INSIGHTS</div><h1>Analytics</h1><p>Understand traffic, viewing activity, and streaming performance across AniFuze.</p></div><div className="an-actions"><button className="an-btn ghost" onClick={refresh}><RefreshCw className={refreshing ? 'an-spin' : ''} size={14}/>Refresh</button><button className="an-btn"><Download size={14}/>Export report</button></div></div>
    <div className="an-range">{ranges.map(item => <button className={range === item ? 'active' : ''} key={item} onClick={() => setRange(item)}>{item}</button>)}<span><CalendarDays size={13}/> Current demo period</span></div>
    <div className="an-grid"><Metric icon={Users} label="Visitors" value={visitors} change="+12.8%" sub="vs previous period"/><Metric icon={Activity} label="Registered users" value={users} change="+8.4%" sub="active accounts"/><Metric icon={Video} label="Anime views" value={totalViews} change="+16.2%" sub="catalog page views"/><Metric icon={Play} label="Stream starts" value={streamStarts} change="+10.7%" sub="playback sessions"/></div>
    <div className="an-main-grid">
      <article className="an-card an-chart-card"><div className="an-card-head"><div><h2>Traffic overview</h2><p>Views and stream activity over the selected period.</p></div><div className="an-legend"><i/>Views <i/>Streams</div></div>
        <div className="an-chart"><div className="an-y"><span>150</span><span>100</span><span>50</span><span>0</span></div><div className="an-plot">{[0,1,2,3].map(item => <div className="an-gridline" style={{bottom:(item * 33.33) + '%'}} key={item}/>)}<svg viewBox="0 0 1000 300" preserveAspectRatio="none" aria-label="Traffic chart"><polyline points={spark.map(chartPoint).join(' ')} fill="none" stroke="currentColor" strokeWidth="4" vectorEffect="non-scaling-stroke"/></svg>{spark.map((value,index) => <span className="an-point" key={index} style={{left:((index / (spark.length - 1)) * 100) + '%',bottom:((value / max) * 78) + '%'}}/>)}</div></div>
        <div className="an-x">{['00:00','04:00','08:00','12:00','16:00','20:00','Now'].map(label => <span key={label}>{label}</span>)}</div>
      </article>
      <article className="an-card"><div className="an-card-head"><div><h2>Peak activity</h2><p>When your audience is most active.</p></div><Clock3 size={16}/></div><div className="an-peak"><strong>20:00 – 22:00</strong><span>Peak viewing window</span><div className="an-bars">{[35,42,48,56,64,78,91,84,69,52,39,30].map((height,index) => <i style={{height:height + '%'}} key={index}/>)}</div><div className="an-peak-labels"><span>00</span><span>06</span><span>12</span><span>18</span><span>24</span></div></div></article>
    </div>
    <div className="an-main-grid">
      <article className="an-card"><div className="an-card-head"><div><h2>Popular anime</h2><p>Most viewed titles in the selected period.</p></div><TrendingUp size={16}/></div><div className="an-table">{popular.map(([name,views,share],index) => <div className="an-row" key={name}><b className="an-rank">{String(index + 1).padStart(2,'0')}</b><div className="an-title"><strong>{name}</strong><span>{share}% of total views · {views.toLocaleString()} views</span></div><div className="an-progress"><i style={{width:(share * 4.8) + '%'}}/></div></div>)}</div></article>
      <article className="an-card"><div className="an-card-head"><div><h2>Audience devices</h2><p>Sessions by device category.</p></div><Globe2 size={16}/></div><div className="an-devices">{devices.map(([name,percentage,Icon]) => <div key={name}><span className="an-device-icon"><Icon size={15}/></span><div><b>{name}</b><small>{percentage}% of sessions</small></div><strong>{percentage}%</strong></div>)}</div><div className="an-device-total"><span>Browser coverage</span><b>Chrome 62% · Safari 24% · Firefox 9%</b></div></article>
    </div>
    <article className="an-card an-provider-card"><div className="an-card-head"><div><h2>Provider performance</h2><p>Streaming provider usage and response time.</p></div><div className="an-segment"><button className={tab === 'traffic' ? 'active' : ''} onClick={() => setTab('traffic')}>Usage</button><button className={tab === 'providers' ? 'active' : ''} onClick={() => setTab('providers')}>Response</button></div></div><div className="an-provider-list">{providers.map(([name,usage,latency]) => <div className="an-provider" key={name}><span className="an-provider-icon"><Server size={14}/></span><div><strong>{name}</strong><small>{tab === 'traffic' ? usage + '% of stream starts' : latency + 's average response'}</small></div><div className="an-provider-meter"><i style={{width:usage + '%'}}/></div></div>)}</div></article>
    <div className="an-footnote"><span>Demo analytics data</span><span>Backend collection will replace these values in the analytics backend phase.</span></div>
  </section>;
}
