import { create } from 'zustand';
import { Sample, Favorite, Application, FilterState, SearchResult, Download, ReproduceExperiment } from '../types';
import { mockSamples, mockFavorites, mockApplications, mockDownloads } from '../data/mockData';

const STORAGE_KEYS = {
  favorites: 'lowalt_favorites',
  selectedSamples: 'lowalt_selected_samples',
  applications: 'lowalt_applications',
  downloads: 'lowalt_downloads',
  savedFilters: 'lowalt_saved_filters',
  defaultFilterId: 'lowalt_default_filter_id',
  highlightedAppId: 'lowalt_highlighted_app_id',
  experiments: 'lowalt_experiments',
  downloadPackages: 'lowalt_download_packages',
};

interface SavedFilter {
  id: string;
  name: string;
  filter: FilterState;
  keyword: string;
  createdAt: string;
  isDefault: boolean;
}

interface DownloadPackage {
  applicationId: string;
  files: {
    name: string;
    size: string;
    checksum: string;
  }[];
  expiresAt: string;
}

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('Failed to save to localStorage:', e);
  }
}

interface AppState {
  samples: Sample[];
  favorites: Favorite[];
  applications: Application[];
  downloads: Download[];
  downloadPackages: Record<string, DownloadPackage>;
  experiments: ReproduceExperiment[];
  filter: FilterState;
  keyword: string;
  searchResults: SearchResult;
  selectedSamples: string[];
  savedFilters: SavedFilter[];
  highlightedAppId: string | null;

  setFilter: (filter: Partial<FilterState>) => void;
  setKeyword: (keyword: string) => void;
  resetFilter: () => void;
  searchSamples: () => void;
  addFavorite: (sampleId: string, note?: string) => void;
  removeFavorite: (sampleId: string) => void;
  updateFavoriteNote: (sampleId: string, note: string) => void;
  isFavorite: (sampleId: string) => boolean;
  addSelectedSample: (sampleId: string) => void;
  removeSelectedSample: (sampleId: string) => void;
  clearSelectedSamples: () => void;
  submitApplication: (purpose: string) => string;
  setHighlightedAppId: (id: string | null) => void;
  recordDownload: (applicationId: string) => void;
  getDownloadsForApplication: (applicationId: string) => Download[];
  getDownloadPackage: (applicationId: string) => DownloadPackage;
  regenerateDownloadPackage: (applicationId: string) => DownloadPackage;
  checkPackageExpired: (applicationId: string) => boolean;
  saveFilterAs: (name: string) => void;
  loadFilter: (savedFilter: SavedFilter, autoSearch?: boolean) => void;
  deleteSavedFilter: (id: string) => void;
  renameFilter: (id: string, newName: string) => void;
  setDefaultFilter: (id: string) => void;
  getDefaultFilter: () => SavedFilter | null;
  addSamplesToSelection: (sampleIds: string[]) => void;
  removeSamplesFromSelection: (sampleIds: string[]) => void;
  selectAllVisibleSamples: () => void;
  selectBySceneType: (sceneType: string) => void;
  selectBySensorType: (sensorType: string) => void;
  createExperiment: (data: Omit<ReproduceExperiment, 'id' | 'created_at'>) => string;
  updateExperiment: (id: string, updates: Partial<ReproduceExperiment>) => void;
  deleteExperiment: (id: string) => void;
  getExperimentsForApplication: (applicationId: string) => ReproduceExperiment[];
}

const generateChecksum = () => {
  return Array.from({ length: 32 }, () => 
    '0123456789abcdef'[Math.floor(Math.random() * 16)]
  ).join('');
};

const generateDownloadPackage = (applicationId: string, sampleIds: string[]): DownloadPackage => {
  const files = sampleIds.map((id, index) => ({
    name: `sample_${id}.zip`,
    size: `${(100 + Math.random() * 500).toFixed(1)} MB`,
    checksum: generateChecksum(),
  }));
  
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  
  return {
    applicationId,
    files,
    expiresAt: expiresAt.toISOString(),
  };
};

export const useStore = create<AppState>((set, get) => ({
  samples: mockSamples,
  favorites: loadFromStorage(STORAGE_KEYS.favorites, mockFavorites),
  applications: loadFromStorage(STORAGE_KEYS.applications, mockApplications),
  downloads: loadFromStorage(STORAGE_KEYS.downloads, mockDownloads),
  downloadPackages: loadFromStorage(STORAGE_KEYS.downloadPackages, {}),
  experiments: loadFromStorage(STORAGE_KEYS.experiments, []),
  filter: {
    flightHeight: { min: 0, max: 200 },
    sensorTypes: [],
    terrains: [],
    weathers: [],
    targetClasses: [],
  },
  keyword: '',
  searchResults: {
    samples: mockSamples,
    total: mockSamples.length,
    page: 1,
    pageSize: 10,
  },
  selectedSamples: loadFromStorage(STORAGE_KEYS.selectedSamples, []),
  savedFilters: loadFromStorage(STORAGE_KEYS.savedFilters, []),
  highlightedAppId: loadFromStorage(STORAGE_KEYS.highlightedAppId, null),

  setFilter: (newFilter) => {
    set((state) => ({
      filter: { ...state.filter, ...newFilter },
    }));
  },

  setKeyword: (keyword) => {
    set({ keyword });
  },

  resetFilter: () => {
    set({
      filter: {
        flightHeight: { min: 0, max: 200 },
        sensorTypes: [],
        terrains: [],
        weathers: [],
        targetClasses: [],
      },
      keyword: '',
    });
  },

  searchSamples: () => {
    const { samples, filter, keyword } = get();
    const filtered = samples.filter((sample) => {
      if (sample.flight_height < filter.flightHeight.min || sample.flight_height > filter.flightHeight.max) {
        return false;
      }
      if (filter.sensorTypes.length > 0 && !filter.sensorTypes.includes(sample.sensor_type)) {
        return false;
      }
      if (filter.terrains.length > 0 && !filter.terrains.includes(sample.terrain)) {
        return false;
      }
      if (filter.weathers.length > 0 && !filter.weathers.includes(sample.weather)) {
        return false;
      }
      if (filter.targetClasses.length > 0) {
        const sampleClasses = sample.target_classes.split(',');
        const hasMatch = filter.targetClasses.some((cls) => sampleClasses.includes(cls));
        if (!hasMatch) return false;
      }
      if (keyword.trim()) {
        const kw = keyword.toLowerCase();
        const matchName = sample.name.toLowerCase().includes(kw);
        const matchDesc = sample.description.toLowerCase().includes(kw);
        const matchClasses = sample.target_classes.toLowerCase().includes(kw);
        if (!matchName && !matchDesc && !matchClasses) return false;
      }
      return true;
    });
    set({
      searchResults: {
        samples: filtered,
        total: filtered.length,
        page: 1,
        pageSize: 10,
      },
    });
  },

  addFavorite: (sampleId, note = '') => {
    const newFavorite: Favorite = {
      id: `f${Date.now()}`,
      user_id: 'user1',
      sample_id: sampleId,
      note,
      created_at: new Date().toISOString(),
    };
    set((state) => {
      const newFavorites = [...state.favorites, newFavorite];
      saveToStorage(STORAGE_KEYS.favorites, newFavorites);
      return { favorites: newFavorites };
    });
  },

  removeFavorite: (sampleId) => {
    set((state) => {
      const newFavorites = state.favorites.filter((f) => f.sample_id !== sampleId);
      saveToStorage(STORAGE_KEYS.favorites, newFavorites);
      return { favorites: newFavorites };
    });
  },

  updateFavoriteNote: (sampleId, note) => {
    set((state) => {
      const newFavorites = state.favorites.map((f) =>
        f.sample_id === sampleId ? { ...f, note } : f
      );
      saveToStorage(STORAGE_KEYS.favorites, newFavorites);
      return { favorites: newFavorites };
    });
  },

  isFavorite: (sampleId) => {
    return get().favorites.some((f) => f.sample_id === sampleId);
  },

  addSelectedSample: (sampleId) => {
    set((state) => {
      if (state.selectedSamples.includes(sampleId)) return state;
      const newSelected = [...state.selectedSamples, sampleId];
      saveToStorage(STORAGE_KEYS.selectedSamples, newSelected);
      return { selectedSamples: newSelected };
    });
  },

  removeSelectedSample: (sampleId) => {
    set((state) => {
      const newSelected = state.selectedSamples.filter((id) => id !== sampleId);
      saveToStorage(STORAGE_KEYS.selectedSamples, newSelected);
      return { selectedSamples: newSelected };
    });
  },

  clearSelectedSamples: () => {
    saveToStorage(STORAGE_KEYS.selectedSamples, []);
    set({ selectedSamples: [] });
  },

  addSamplesToSelection: (sampleIds) => {
    set((state) => {
      const newSelected = [...new Set([...state.selectedSamples, ...sampleIds])];
      saveToStorage(STORAGE_KEYS.selectedSamples, newSelected);
      return { selectedSamples: newSelected };
    });
  },

  removeSamplesFromSelection: (sampleIds) => {
    set((state) => {
      const newSelected = state.selectedSamples.filter((id) => !sampleIds.includes(id));
      saveToStorage(STORAGE_KEYS.selectedSamples, newSelected);
      return { selectedSamples: newSelected };
    });
  },

  selectAllVisibleSamples: () => {
    const { searchResults, selectedSamples } = get();
    const visibleIds = searchResults.samples.map((s) => s.id);
    const newSelected = [...new Set([...selectedSamples, ...visibleIds])];
    saveToStorage(STORAGE_KEYS.selectedSamples, newSelected);
    set({ selectedSamples: newSelected });
  },

  selectBySceneType: (sceneType) => {
    const { samples, selectedSamples } = get();
    const matchingIds = samples
      .filter((s) => s.scene_type === sceneType && !selectedSamples.includes(s.id))
      .map((s) => s.id);
    const newSelected = [...new Set([...selectedSamples, ...matchingIds])];
    saveToStorage(STORAGE_KEYS.selectedSamples, newSelected);
    set({ selectedSamples: newSelected });
  },

  selectBySensorType: (sensorType) => {
    const { samples, selectedSamples } = get();
    const matchingIds = samples
      .filter((s) => s.sensor_type === sensorType && !selectedSamples.includes(s.id))
      .map((s) => s.id);
    const newSelected = [...new Set([...selectedSamples, ...matchingIds])];
    saveToStorage(STORAGE_KEYS.selectedSamples, newSelected);
    set({ selectedSamples: newSelected });
  },

  createExperiment: (data) => {
    const newExperiment: ReproduceExperiment = {
      ...data,
      id: `exp${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    
    const state = get();
    const newExperiments = [newExperiment, ...state.experiments];
    saveToStorage(STORAGE_KEYS.experiments, newExperiments);
    set({ experiments: newExperiments });
    
    return newExperiment.id;
  },

  updateExperiment: (id, updates) => {
    set((state) => {
      const newExperiments = state.experiments.map((e) =>
        e.id === id ? { ...e, ...updates, updated_at: new Date().toISOString() } : e
      );
      saveToStorage(STORAGE_KEYS.experiments, newExperiments);
      return { experiments: newExperiments };
    });
  },

  deleteExperiment: (id) => {
    set((state) => {
      const newExperiments = state.experiments.filter((e) => e.id !== id);
      saveToStorage(STORAGE_KEYS.experiments, newExperiments);
      return { experiments: newExperiments };
    });
  },

  getExperimentsForApplication: (applicationId) => {
    return get().experiments.filter((e) => e.application_id === applicationId);
  },

  submitApplication: (purpose) => {
    const { selectedSamples } = get();
    if (selectedSamples.length === 0) return '';

    const newApplication: Application = {
      id: `app${Date.now()}`,
      user_id: 'user1',
      sample_ids: [...selectedSamples],
      purpose,
      status: 'pending',
      submitted_at: new Date().toISOString(),
    };

    set((state) => {
      const newApplications = [newApplication, ...state.applications];
      saveToStorage(STORAGE_KEYS.applications, newApplications);
      saveToStorage(STORAGE_KEYS.selectedSamples, []);
      saveToStorage(STORAGE_KEYS.highlightedAppId, newApplication.id);
      return { 
        applications: newApplications, 
        selectedSamples: [],
        highlightedAppId: newApplication.id 
      };
    });

    return newApplication.id;
  },

  setHighlightedAppId: (id) => {
    saveToStorage(STORAGE_KEYS.highlightedAppId, id);
    set({ highlightedAppId: id });
  },

  recordDownload: (applicationId) => {
    const newDownload: Download = {
      id: `d${Date.now()}`,
      application_id: applicationId,
      downloaded_at: new Date().toISOString(),
    };
    set((state) => {
      const newDownloads = [...state.downloads, newDownload];
      saveToStorage(STORAGE_KEYS.downloads, newDownloads);
      return { downloads: newDownloads };
    });
  },

  getDownloadsForApplication: (applicationId) => {
    return get().downloads.filter((d) => d.application_id === applicationId);
  },

  getDownloadPackage: (applicationId) => {
    const state = get();
    if (state.downloadPackages[applicationId]) {
      return state.downloadPackages[applicationId];
    }
    
    const app = state.applications.find((a) => a.id === applicationId);
    if (!app) {
      return { applicationId, files: [], expiresAt: '' };
    }
    
    const packageData = generateDownloadPackage(applicationId, app.sample_ids);
    
    const newPackages = { ...state.downloadPackages, [applicationId]: packageData };
    saveToStorage(STORAGE_KEYS.downloadPackages, newPackages);
    set({ downloadPackages: newPackages });
    
    return packageData;
  },

  regenerateDownloadPackage: (applicationId) => {
    const state = get();
    const app = state.applications.find((a) => a.id === applicationId);
    if (!app) {
      return { applicationId, files: [], expiresAt: '' };
    }
    
    const packageData = generateDownloadPackage(applicationId, app.sample_ids);
    
    const newPackages = { ...state.downloadPackages, [applicationId]: packageData };
    saveToStorage(STORAGE_KEYS.downloadPackages, newPackages);
    set({ downloadPackages: newPackages });
    
    return packageData;
  },

  checkPackageExpired: (applicationId) => {
    const state = get();
    const packageData = state.downloadPackages[applicationId];
    if (!packageData || !packageData.expiresAt) {
      return true;
    }
    return new Date(packageData.expiresAt) < new Date();
  },

  saveFilterAs: (name) => {
    const { filter, keyword } = get();
    const savedFilter: SavedFilter = {
      id: `sf${Date.now()}`,
      name,
      filter: { ...filter },
      keyword,
      createdAt: new Date().toISOString(),
      isDefault: false,
    };
    set((state) => {
      const newSaved = [savedFilter, ...state.savedFilters];
      saveToStorage(STORAGE_KEYS.savedFilters, newSaved);
      return { savedFilters: newSaved };
    });
  },

  loadFilter: (savedFilter, autoSearch = false) => {
    set({
      filter: savedFilter.filter,
      keyword: savedFilter.keyword,
    });
    if (autoSearch) {
      setTimeout(() => {
        get().searchSamples();
      }, 0);
    }
  },

  deleteSavedFilter: (id) => {
    set((state) => {
      const newSaved = state.savedFilters.filter((f) => f.id !== id);
      saveToStorage(STORAGE_KEYS.savedFilters, newSaved);
      return { savedFilters: newSaved };
    });
  },

  renameFilter: (id, newName) => {
    set((state) => {
      const newSaved = state.savedFilters.map((f) =>
        f.id === id ? { ...f, name: newName } : f
      );
      saveToStorage(STORAGE_KEYS.savedFilters, newSaved);
      return { savedFilters: newSaved };
    });
  },

  setDefaultFilter: (id) => {
    set((state) => {
      const newSaved = state.savedFilters.map((f) =>
        ({ ...f, isDefault: f.id === id })
      );
      saveToStorage(STORAGE_KEYS.savedFilters, newSaved);
      return { savedFilters: newSaved };
    });
  },

  getDefaultFilter: () => {
    return get().savedFilters.find((f) => f.isDefault) || null;
  },
}));