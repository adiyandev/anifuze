// AniFuze Front-End Mock Services Layer with LocalStorage Persistence
import { 
  MOCK_ANIME, 
  MOCK_EPISODES, 
  MOCK_PROVIDERS, 
  MOCK_TEMPLATES, 
  MOCK_USERS, 
  MOCK_ANALYTICS, 
  MOCK_SETTINGS,
  MOCK_PLATFORM_CUSTOMERS 
} from './mockData';

const getStorageItem = (key, defaultData) => {
  try {
    const item = localStorage.getItem(`anifuze_${key}`);
    return item ? JSON.parse(item) : defaultData;
  } catch {
    return defaultData;
  }
};

const setStorageItem = (key, data) => {
  try {
    localStorage.setItem(`anifuze_${key}`, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
};

// Anime Service
export const animeService = {
  getAnime: async () => getStorageItem('anime', MOCK_ANIME),
  createAnime: async (newAnime) => {
    const list = getStorageItem('anime', MOCK_ANIME);
    const created = { ...newAnime, id: String(Date.now()), views: 0, updated: 'Just now' };
    const updatedList = [created, ...list];
    setStorageItem('anime', updatedList);
    return created;
  },
  updateAnime: async (id, data) => {
    const list = getStorageItem('anime', MOCK_ANIME);
    const updatedList = list.map(item => item.id === id ? { ...item, ...data } : item);
    setStorageItem('anime', updatedList);
    return updatedList.find(item => item.id === id);
  },
  deleteAnime: async (id) => {
    const list = getStorageItem('anime', MOCK_ANIME);
    const updatedList = list.filter(item => item.id !== id);
    setStorageItem('anime', updatedList);
    return true;
  }
};

// Provider Service
export const providerService = {
  getProviders: async () => getStorageItem('providers', MOCK_PROVIDERS),
  createProvider: async (provider) => {
    const list = getStorageItem('providers', MOCK_PROVIDERS);
    const created = { ...provider, id: `p-${Date.now()}`, status: 'Online', latency: '65ms', requests: 0 };
    const updatedList = [...list, created];
    setStorageItem('providers', updatedList);
    return created;
  },
  updateProvider: async (id, data) => {
    const list = getStorageItem('providers', MOCK_PROVIDERS);
    const updatedList = list.map(p => p.id === id ? { ...p, ...data } : p);
    setStorageItem('providers', updatedList);
    return updatedList.find(p => p.id === id);
  },
  deleteProvider: async (id) => {
    const list = getStorageItem('providers', MOCK_PROVIDERS);
    const updatedList = list.filter(p => p.id !== id);
    setStorageItem('providers', updatedList);
    return true;
  },
  testProviderConnection: async (providerId) => {
    await new Promise(res => setTimeout(res, 800)); // simulate latency
    const isSuccess = Math.random() > 0.15; // 85% success chance
    if (isSuccess) {
      return { success: true, status: 200, responseTime: `${Math.floor(Math.random() * 120 + 30)}ms`, auth: 'Valid', reachable: true };
    }
    return { success: false, status: 401, responseTime: `${Math.floor(Math.random() * 200 + 100)}ms`, message: 'Authentication failed. Check API Key or Secret.' };
  },
  testEmbed: async ({ animeId, episodeId, episodeNumber, template }) => {
    await new Promise(res => setTimeout(res, 400));
    let url = template || 'https://example.com/embed/{animeId}/{episodeId}';
    url = url.replace('{animeId}', animeId || '123')
             .replace('{episodeId}', episodeId || 'ep-1')
             .replace('{episodeNumber}', episodeNumber || '1');
    return { generatedUrl: url, valid: true };
  }
};

// Template Service
export const templateService = {
  getTemplates: async () => getStorageItem('templates', MOCK_TEMPLATES),
  purchaseTemplate: async (id) => {
    const list = getStorageItem('templates', MOCK_TEMPLATES);
    const updated = list.map(t => t.id === id ? { ...t, isInstalled: true } : t);
    setStorageItem('templates', updated);
    return true;
  },
  activateTemplate: async (id) => {
    const list = getStorageItem('templates', MOCK_TEMPLATES);
    const updated = list.map(t => ({ ...t, isActive: t.id === id }));
    setStorageItem('templates', updated);
    return true;
  }
};

// Settings Service
export const settingsService = {
  getSettings: async () => getStorageItem('settings', MOCK_SETTINGS),
  updateSettings: async (newSettings) => {
    const current = getStorageItem('settings', MOCK_SETTINGS);
    const updated = { ...current, ...newSettings };
    setStorageItem('settings', updated);
    return updated;
  }
};

// Analytics Service
export const analyticsService = {
  getAnalytics: async () => MOCK_ANALYTICS
};

// Users Service
export const userService = {
  getUsers: async () => getStorageItem('users', MOCK_USERS),
  updateUserStatus: async (id, status) => {
    const list = getStorageItem('users', MOCK_USERS);
    const updated = list.map(u => u.id === id ? { ...u, status } : u);
    setStorageItem('users', updated);
    return updated;
  }
};

// Platform Admin Service
export const platformService = {
  getCustomers: async () => MOCK_PLATFORM_CUSTOMERS
};
