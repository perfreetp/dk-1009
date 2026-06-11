import { create } from 'zustand';
import { Sample, Favorite, Application, FilterState, SearchResult, Download } from '../types';
import { mockSamples, mockFavorites, mockApplications } from '../data/mockData';

const STORAGE_KEYS = {
  favorites: 'lowalt_favorites',
  selectedSamples: 'lowalt_selected_samples',
  applications: 'lowalt_applications',
  downloads: 'lowalt_downloads',
  savedFilters: 'lowalt_saved_filters',
};

interface SavedFilter {
  id: string;
  name: string;
  filter: FilterState;
  keyword: string;
  createdAt: string;
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
  filter: FilterState;
  keyword: string;
  searchResults: SearchResult;
  selectedSamples: string[];
  savedFilters: SavedFilter[];

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
  submitApplication: (purpose: string) => void;
  recordDownload: (applicationId: string) => void;
  getDownloadsForApplication: (applicationId: string) => Download[];
  saveFilterAs: (name: string) => void;
  loadFilter: (savedFilter: SavedFilter) => void;
  deleteSavedFilter: (id: string) => void;
  addSamplesToSelection: (sampleIds: string[]) => void;
  removeSamplesFromSelection: (sampleIds: string[]) => void;
}

export const useStore = create<AppState>((set, get) => ({
  samples: mockSamples,
  favorites: loadFromStorage(STORAGE_KEYS.favorites, mockFavorites),
  applications: loadFromStorage(STORAGE_KEYS.applications, mockApplications),
  downloads: loadFromStorage(STORAGE_KEYS.downloads, []),
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

  submitApplication: (purpose) => {
    const { selectedSamples } = get();
    if (selectedSamples.length === 0) return;

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
      return { applications: newApplications };
    });
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

  saveFilterAs: (name) => {
    const { filter, keyword } = get();
    const savedFilter: SavedFilter = {
      id: `sf${Date.now()}`,
      name,
      filter: { ...filter },
      keyword,
      createdAt: new Date().toISOString(),
    };
    set((state) => {
      const newSaved = [savedFilter, ...state.savedFilters];
      saveToStorage(STORAGE_KEYS.savedFilters, newSaved);
      return { savedFilters: newSaved };
    });
  },

  loadFilter: (savedFilter) => {
    set({
      filter: savedFilter.filter,
      keyword: savedFilter.keyword,
    });
  },

  deleteSavedFilter: (id) => {
    set((state) => {
      const newSaved = state.savedFilters.filter((f) => f.id !== id);
      saveToStorage(STORAGE_KEYS.savedFilters, newSaved);
      return { savedFilters: newSaved };
    });
  },
}));
