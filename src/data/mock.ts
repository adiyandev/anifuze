import type {Anime,Provider,Settings,BuilderBlock} from '../types';

export const anime:Anime[]=[
{id:'eclipse-samurai',title:'Eclipse Samurai',type:'Series',status:'Ongoing',episodes:24,views:'142.8K',genre:'Action · Fantasy',description:'A disgraced guardian follows a lunar blade through a city where old spirits are waking.',cover:'https://images.unsplash.com/photo-1518709594023-6eab9bab7b23?auto=format&fit=crop&w=700&q=85'},
{id:'neon-horizon',title:'Neon Horizon',type:'Series',status:'Ongoing',episodes:24,views:'98.4K',genre:'Sci-fi · Drama',description:'Pilots map the last safe route beyond a storm-lit orbital city.',cover:'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?auto=format&fit=crop&w=700&q=85'},
{id:'paper-moons',title:'Paper Moons',type:'Movie',status:'Completed',episodes:1,views:'76.1K',genre:'Romance · Slice of life',description:'Two artists find a shared language in letters folded into constellations.',cover:'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=700&q=85'},
{id:'tidebreakers',title:'Tidebreakers',type:'Series',status:'Completed',episodes:18,views:'61.5K',genre:'Adventure · Mystery',description:'A young crew charts an ocean that redraws itself every dawn.',cover:'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=700&q=85'},
{id:'starfall-protocol',title:'Starfall Protocol',type:'Series',status:'Ongoing',episodes:12,views:'54.2K',genre:'Sci-fi · Action',description:'A courier discovers a protocol that can rewrite the future of a fractured colony.',cover:'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?auto=format&fit=crop&w=700&q=85'},
{id:'violet-archive',title:'Violet Archive',type:'Series',status:'Completed',episodes:13,views:'48.9K',genre:'Mystery · Drama',description:'An archivist follows impossible records left behind by a vanished city.',cover:'https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?auto=format&fit=crop&w=700&q=85'},
{id:'skyline-runners',title:'Skyline Runners',type:'Series',status:'Ongoing',episodes:10,views:'42.6K',genre:'Sports · Adventure',description:'Rooftop racers turn a midnight city into their own impossible circuit.',cover:'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=700&q=85'},
{id:'after-rain',title:'After Rain',type:'Movie',status:'Completed',episodes:1,views:'39.1K',genre:'Romance · Drama',description:'A quiet summer changes when two strangers meet beneath the same station roof.',cover:'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=700&q=85'}
];

export const providers:Provider[]=[
{id:'streamforge',name:'StreamForge API',type:'API',status:'Healthy',priority:1,latency:84,requests:12480,enabled:true,baseUrl:'https://api.mock.streamforge.dev'},
{id:'embedwave',name:'EmbedWave',type:'Embed',status:'Healthy',priority:2,latency:127,requests:8460,enabled:true,template:'https://mock-provider.example/embed/{anilistId}/{episodeNumber}'},
{id:'vault-direct',name:'Vault Direct',type:'Direct',status:'Degraded',priority:3,latency:241,requests:2920,enabled:true},
{id:'archive',name:'Archive Relay',type:'Custom',status:'Offline',priority:4,latency:0,requests:380,enabled:false}
];

export const defaultSettings:Settings={siteName:'AniFuze',tagline:'Build. Customize. Stream.',primary:'#22D3EE',accent:'#8B5CF6',logo:'✦'};
export const defaultBlocks:BuilderBlock[]=[
{id:'hero',type:'Hero',title:'Eclipse Samurai',content:'A cinematic collection, curated for curious nights.'},
{id:'trending',type:'Anime Grid',title:'Trending now',content:'Hand-picked titles for your next watch.'},
{id:'latest',type:'Anime Carousel',title:'Latest episodes',content:'Fresh releases from your configured sources.'},
{id:'schedule',type:'Schedule',title:'Release schedule',content:'Know what is arriving next.'},
{id:'cta',type:'CTA',title:'Keep watching',content:'Your list is ready when you are.'}
];
export const templates=[
{id:'orbit',name:'Orbit Studio',creator:'Aki Tan',price:'$29',category:'Cinematic',rating:'4.9',color:'#3b277d'},
{id:'frame',name:'Frame Minimal',creator:'Nora Vale',price:'Free',category:'Minimal',rating:'4.8',color:'#116477'},
{id:'afterglow',name:'Afterglow',creator:'Lumen Works',price:'$49',category:'Community',rating:'4.7',color:'#6b3150'},
{id:'midnight',name:'Midnight Signal',creator:'Kiro Labs',price:'$39',category:'Dark',rating:'4.9',color:'#162c4b'},
{id:'daybreak',name:'Daybreak',creator:'Mina Studio',price:'$19',category:'Light',rating:'4.6',color:'#52677b'}
];