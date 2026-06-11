import { create } from 'zustand';
import { Sample, Favorite, Application, FilterState, SearchResult } from '../types';
import { mockSamples, mockFavorites, mockApplications } from '../data/mockData';

interface AppState {
  samples: Sample[];
  favorites: Favorite[];
  applications: Application[];
  filter: FilterState;
  searchResults: SearchResult;
  selectedSamples: string[];
  
  setFilter: (filter: Partial<FilterState>) => void;
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
}

export const useStore = create<AppState>((set, get) => ({
  samples: mockSamples,
  favorites: mockFavorites,
  applications: mockApplications,
  filter: {
    flightHeight: { min: 0, max: 200 },
    sensorTypes: [],
    terrains: [],
    weathers: [],
    targetClasses: [],
  },
  searchResults: {
    samples: mockSamples,
    total: mockSamples.length,
    page: 1,
    pageSize: 10,
  },
  selectedSamples: [],

  setFilter: (newFilter) => {
    set((state) => ({
      filter: { ...state.filter, ...newFilter },
    }));
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
    });
  },

  searchSamples: () => {
    const { samples, filter } = get();
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
    set((state) => ({
      favorites: [...state.favorites, newFavorite],
    }));
  },

  removeFavorite: (sampleId) => {
    set((state) => ({
      favorites: state.favorites.filter((f) => f.sample_id !== sampleId),
    }));
  },

  updateFavoriteNote: (sampleId, note) => {
    set((state) => ({
      favorites: state.favorites.map((f) =>
        f.sample_id === sampleId ? { ...f, note } : f
      ),
    }));
  },

  isFavorite: (sampleId) => {
    return get().favorites.some((f) => f.sample_id === sampleId);
  },

  addSelectedSample: (sampleId) => {
    set((state) => {
      if (state.selectedSamples.includes(sampleId)) return state;
      return { selectedSamples: [...state.selectedSamples, sampleId] };
    });
  },

  removeSelectedSample: (sampleId) => {
    set((state) => ({
      selectedSamples: state.selectedSamples.filter((id) => id !== sampleId),
    }));
  },

  clearSelectedSamples: () => {
    set({ selectedSamples: [] });
  },

  submitApplication: (purpose) => {
    const { selectedSamples } = get();
    if (selectedSamples.length === 0) return;
    
    const newApplication: Application = {
      id: `app${Date.now()}`,
      user_id: 'user1',
      sample_ids: selectedSamples,
      purpose,
      status: 'pending',
      submitted_at: new Date().toISOString(),
    };
    
    set((state) => ({
      applications: [...state.applications, newApplication],
      selectedSamples: [],
    }));
  },
}));
