// Mock datasets for AniFuze SaaS Platform

export const MOCK_ANIME = [
  { id: '1', title: 'Solo Leveling Season 2', type: 'TV', status: 'Ongoing', episodes: 12, views: 142000, poster: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&q=80', updated: '2 hours ago', genres: ['Action', 'Fantasy'] },
  { id: '2', title: 'Jujutsu Kaisen: Culling Game', type: 'TV', status: 'Completed', episodes: 24, views: 320000, poster: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&q=80', updated: '1 day ago', genres: ['Action', 'Supernatural'] },
  { id: '3', title: 'Demon Slayer: Hashira Training', type: 'TV', status: 'Completed', episodes: 8, views: 280000, poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&q=80', updated: '3 days ago', genres: ['Action', 'Demons'] },
  { id: '4', title: 'Chainsaw Man Reze Arc', type: 'Movie', status: 'Upcoming', episodes: 1, views: 89000, poster: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=400&q=80', updated: '5 days ago', genres: ['Action', 'Horror'] },
  { id: '5', title: 'Frieren: Beyond Journey\'s End', type: 'TV', status: 'Completed', episodes: 28, views: 410000, poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80', updated: '1 week ago', genres: ['Adventure', 'Drama', 'Fantasy'] }
];

export const MOCK_EPISODES = [
  { id: 'ep-101', animeId: '1', episodeNumber: 1, title: 'Gotta Keep Going', duration: '24m', airDate: '2026-01-10', views: 42000, providersCount: 3 },
  { id: 'ep-102', animeId: '1', episodeNumber: 2, title: 'Suppression Order', duration: '23m', airDate: '2026-01-17', views: 38000, providersCount: 3 },
  { id: 'ep-103', animeId: '1', episodeNumber: 3, title: 'The Next Level', duration: '24m', airDate: '2026-01-24', views: 35000, providersCount: 2 }
];

export const MOCK_PROVIDERS = [
  { id: 'p-1', name: 'AniFuze Core Fast CDN API', type: 'API Provider', status: 'Online', priority: 1, latency: '42ms', requests: 124500, enabled: true, endpoint: 'https://api.anifuze-cdn.net/v1' },
  { id: 'p-2', name: 'StreamVerse High-Res Embed', type: 'Embed Provider', status: 'Online', priority: 2, latency: '110ms', requests: 84200, enabled: true, embedTemplate: 'https://embed.streamverse.io/v/{animeId}/{episodeId}' },
  { id: 'p-3', name: 'Backup Direct Video Mirror', type: 'Direct Video', status: 'Online', priority: 3, latency: '180ms', requests: 12000, enabled: true, endpoint: 'https://storage.anifuze.internal/streams' },
  { id: 'p-4', name: 'Legacy Custom Provider', type: 'Custom Provider', status: 'Offline', priority: 4, latency: '—', requests: 0, enabled: false, endpoint: 'https://legacy.provider.org/api' }
];

export const MOCK_TEMPLATES = [
  { id: 'tpl-1', name: 'AeroStream Pro', creator: 'AniFuze Official', category: 'Cinematic', price: 0, rating: 4.9, isInstalled: true, isActive: true, version: '2.4.0', previewImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80' },
  { id: 'tpl-2', name: 'CyberBlade Minimal', creator: 'NeonStudio', category: 'Minimal', price: 29, rating: 4.8, isInstalled: false, isActive: false, version: '1.2.0', previewImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&q=80' },
  { id: 'tpl-3', name: 'Kitsu Dark Theme', creator: 'OtakuWorks', category: 'Dark', price: 49, rating: 5.0, isInstalled: true, isActive: false, version: '3.0.1', previewImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&q=80' }
];

export const MOCK_USERS = [
  { id: 'u-1', username: 'AlexRider', email: 'alex@example.com', role: 'VIP Subscriber', joined: '2025-11-12', status: 'Active', lastActive: '5 mins ago' },
  { id: 'u-2', username: 'ShadowSlayer', email: 'shadow@example.com', role: 'User', joined: '2026-01-02', status: 'Active', lastActive: '1 hour ago' },
  { id: 'u-3', username: 'SpamBot9000', email: 'spammer@bad.org', role: 'User', joined: '2026-02-14', status: 'Banned', lastActive: '3 weeks ago' }
];

export const MOCK_ANALYTICS = {
  totalUsers: 14280,
  visitors: 98450,
  animeViews: 450120,
  episodeViews: 1209300,
  streams: 980400,
  providerUptime: '99.94%',
  dailyStats: [
    { day: 'Mon', visitors: 12000, streams: 14000 },
    { day: 'Tue', visitors: 14500, streams: 18200 },
    { day: 'Wed', visitors: 13200, streams: 16100 },
    { day: 'Thu', visitors: 15800, streams: 19500 },
    { day: 'Fri', visitors: 18900, streams: 24000 },
    { day: 'Sat', visitors: 22400, streams: 29800 },
    { day: 'Sun', visitors: 21000, streams: 28400 }
  ]
};

export const MOCK_SETTINGS = {
  siteName: 'AniFuze Demo Stream Site',
  logoUrl: '',
  primaryColor: '#22D3EE',
  secondaryColor: '#8B5CF6',
  seoTitle: 'Watch Anime Online in HD - AniFuze Customer Site',
  seoDescription: 'High quality anime streaming platform built with AniFuze SaaS.',
  customDomain: 'demo.anifuze.site',
  domainStatus: 'Active',
  sslStatus: 'Valid'
};

export const MOCK_PLATFORM_CUSTOMERS = [
  { id: 'c-101', name: 'Otaku Central', owner: 'Kenji Sato', plan: 'Enterprise Pro', domain: 'otaku-central.com', status: 'Active', monthlyFee: '$149' },
  { id: 'c-102', name: 'AniStream Hub', name2: 'Sarah Jenkins', plan: 'Starter', domain: 'anistream-hub.site', status: 'Active', monthlyFee: '$29' },
  { id: 'c-103', name: 'Tokyo Flix', owner: 'Marcus Vance', plan: 'Pro', domain: 'tokyoflix.net', status: 'Past Due', monthlyFee: '$79' }
];
