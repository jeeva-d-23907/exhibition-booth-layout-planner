import { create } from 'zustand';
import { Booth, WalkPath, LayoutObject, Tool, SelectedElement, PathStyle, ObjectType } from '../types';

interface HistoryEntry {
  booths: Booth[];
  paths: WalkPath[];
  objects: LayoutObject[];
}

export interface Analytics {
  total: number;
  available: number;
  reserved: number;
  sold: number;
  revenue: number;
  potential: number;
  categories: Record<string, number>;
}

interface State {
  booths: Booth[];
  paths: WalkPath[];
  objects: LayoutObject[];
  selectedElement: SelectedElement;
  tool: Tool;
  gridEnabled: boolean;
  gridSize: number;
  zoom: number;
  stagePos: { x: number; y: number };
  darkMode: boolean;
  showAnalytics: boolean;
  searchQuery: string;
  filterStatus: string;
  filterCategory: string;
  nextBoothNumber: number;
  currentPathStyle: PathStyle;
  currentPathWidth: number;
  currentObjectType: ObjectType;
  history: HistoryEntry[];
  future: HistoryEntry[];
}

interface Actions {
  addBooth: (booth: Booth) => void;
  updateBooth: (id: string, partial: Partial<Booth>) => void;
  deleteBooth: (id: string) => void;
  duplicateBooth: (id: string) => void;
  addPath: (path: WalkPath) => void;
  updatePath: (id: string, partial: Partial<WalkPath>) => void;
  deletePath: (id: string) => void;
  addObject: (obj: LayoutObject) => void;
  updateObject: (id: string, partial: Partial<LayoutObject>) => void;
  deleteObject: (id: string) => void;
  setSelectedElement: (el: SelectedElement) => void;
  setTool: (tool: Tool) => void;
  toggleGrid: () => void;
  setZoom: (z: number) => void;
  setStagePos: (pos: { x: number; y: number }) => void;
  toggleDarkMode: () => void;
  toggleAnalytics: () => void;
  undo: () => void;
  redo: () => void;
  setSearchQuery: (q: string) => void;
  setFilterStatus: (s: string) => void;
  setFilterCategory: (c: string) => void;
  snapToGrid: (v: number) => number;
  getAnalytics: () => Analytics;
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => void;
  resetCanvas: () => void;
  deleteSelected: () => void;
}

const MAX_HISTORY = 50;

export const useStore = create<State & Actions>((set, get) => ({
  booths: [],
  paths: [],
  objects: [],
  selectedElement: null,
  tool: 'select',
  gridEnabled: true,
  gridSize: 40,
  zoom: 1,
  stagePos: { x: 0, y: 0 },
  darkMode: false,
  showAnalytics: false,
  searchQuery: '',
  filterStatus: 'all',
  filterCategory: 'all',
  nextBoothNumber: 1,
  currentPathStyle: 'main-aisle',
  currentPathWidth: 6,
  currentObjectType: 'entrance',
  history: [],
  future: [],

  snapToGrid: (v: number) => {
    const { gridEnabled, gridSize } = get();
    if (!gridEnabled) return v;
    return Math.round(v / gridSize) * gridSize;
  },

  addBooth: (booth: Booth) => {
    const state = get();
    const entry: HistoryEntry = { booths: state.booths, paths: state.paths, objects: state.objects };
    set(s => ({
      booths: [...s.booths, booth],
      nextBoothNumber: s.nextBoothNumber + 1,
      history: [...s.history.slice(-MAX_HISTORY + 1), entry],
      future: [],
    }));
  },

  updateBooth: (id: string, partial: Partial<Booth>) => {
    const state = get();
    const entry: HistoryEntry = { booths: state.booths, paths: state.paths, objects: state.objects };
    set(s => ({
      booths: s.booths.map(b => b.id === id ? { ...b, ...partial } : b),
      history: [...s.history.slice(-MAX_HISTORY + 1), entry],
      future: [],
    }));
  },

  deleteBooth: (id: string) => {
    const state = get();
    const entry: HistoryEntry = { booths: state.booths, paths: state.paths, objects: state.objects };
    set(s => ({
      booths: s.booths.filter(b => b.id !== id),
      selectedElement: s.selectedElement?.kind === 'booth' && s.selectedElement.id === id ? null : s.selectedElement,
      history: [...s.history.slice(-MAX_HISTORY + 1), entry],
      future: [],
    }));
  },

  duplicateBooth: (id: string) => {
    const state = get();
    const booth = state.booths.find(b => b.id === id);
    if (!booth) return;
    const newBooth: Booth = {
      ...booth,
      id: crypto.randomUUID(),
      x: booth.x + 40,
      y: booth.y + 40,
      number: `${state.nextBoothNumber}`,
    };
    const entry: HistoryEntry = { booths: state.booths, paths: state.paths, objects: state.objects };
    set(s => ({
      booths: [...s.booths, newBooth],
      nextBoothNumber: s.nextBoothNumber + 1,
      history: [...s.history.slice(-MAX_HISTORY + 1), entry],
      future: [],
    }));
  },

  addPath: (path: WalkPath) => {
    const state = get();
    const entry: HistoryEntry = { booths: state.booths, paths: state.paths, objects: state.objects };
    set(s => ({
      paths: [...s.paths, path],
      history: [...s.history.slice(-MAX_HISTORY + 1), entry],
      future: [],
    }));
  },

  updatePath: (id: string, partial: Partial<WalkPath>) => {
    const state = get();
    const entry: HistoryEntry = { booths: state.booths, paths: state.paths, objects: state.objects };
    set(s => ({
      paths: s.paths.map(p => p.id === id ? { ...p, ...partial } : p),
      history: [...s.history.slice(-MAX_HISTORY + 1), entry],
      future: [],
    }));
  },

  deletePath: (id: string) => {
    const state = get();
    const entry: HistoryEntry = { booths: state.booths, paths: state.paths, objects: state.objects };
    set(s => ({
      paths: s.paths.filter(p => p.id !== id),
      selectedElement: s.selectedElement?.kind === 'path' && s.selectedElement.id === id ? null : s.selectedElement,
      history: [...s.history.slice(-MAX_HISTORY + 1), entry],
      future: [],
    }));
  },

  addObject: (obj: LayoutObject) => {
    const state = get();
    const entry: HistoryEntry = { booths: state.booths, paths: state.paths, objects: state.objects };
    set(s => ({
      objects: [...s.objects, obj],
      history: [...s.history.slice(-MAX_HISTORY + 1), entry],
      future: [],
    }));
  },

  updateObject: (id: string, partial: Partial<LayoutObject>) => {
    const state = get();
    const entry: HistoryEntry = { booths: state.booths, paths: state.paths, objects: state.objects };
    set(s => ({
      objects: s.objects.map(o => o.id === id ? { ...o, ...partial } : o),
      history: [...s.history.slice(-MAX_HISTORY + 1), entry],
      future: [],
    }));
  },

  deleteObject: (id: string) => {
    const state = get();
    const entry: HistoryEntry = { booths: state.booths, paths: state.paths, objects: state.objects };
    set(s => ({
      objects: s.objects.filter(o => o.id !== id),
      selectedElement: s.selectedElement?.kind === 'object' && s.selectedElement.id === id ? null : s.selectedElement,
      history: [...s.history.slice(-MAX_HISTORY + 1), entry],
      future: [],
    }));
  },

  setSelectedElement: (el: SelectedElement) => set({ selectedElement: el }),
  setTool: (tool: Tool) => set({ tool }),
  toggleGrid: () => set(s => ({ gridEnabled: !s.gridEnabled })),
  setZoom: (z: number) => set({ zoom: Math.min(Math.max(z, 0.1), 5) }),
  setStagePos: (pos: { x: number; y: number }) => set({ stagePos: pos }),
  toggleDarkMode: () => {
    const darkMode = !get().darkMode;
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    set({ darkMode });
  },
  toggleAnalytics: () => set(s => ({ showAnalytics: !s.showAnalytics })),
  setSearchQuery: (q: string) => set({ searchQuery: q }),
  setFilterStatus: (s: string) => set({ filterStatus: s }),
  setFilterCategory: (c: string) => set({ filterCategory: c }),

  undo: () => {
    const { history, booths, paths, objects, future } = get();
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    const currentEntry: HistoryEntry = { booths, paths, objects };
    set({
      booths: prev.booths,
      paths: prev.paths,
      objects: prev.objects,
      history: history.slice(0, -1),
      future: [currentEntry, ...future.slice(0, MAX_HISTORY - 1)],
      selectedElement: null,
    });
  },

  redo: () => {
    const { history, booths, paths, objects, future } = get();
    if (future.length === 0) return;
    const next = future[0];
    const currentEntry: HistoryEntry = { booths, paths, objects };
    set({
      booths: next.booths,
      paths: next.paths,
      objects: next.objects,
      history: [...history.slice(-MAX_HISTORY + 1), currentEntry],
      future: future.slice(1),
      selectedElement: null,
    });
  },

  deleteSelected: () => {
    const { selectedElement, booths, paths, objects } = get();
    if (!selectedElement) return;
    if (selectedElement.kind === 'booth') {
      const booth = booths.find(b => b.id === selectedElement.id);
      if (booth?.locked) return;
      get().deleteBooth(selectedElement.id);
    } else if (selectedElement.kind === 'path') {
      const path = paths.find(p => p.id === selectedElement.id);
      if (path?.locked) return;
      get().deletePath(selectedElement.id);
    } else if (selectedElement.kind === 'object') {
      const obj = objects.find(o => o.id === selectedElement.id);
      if (obj?.locked) return;
      get().deleteObject(selectedElement.id);
    }
  },

  getAnalytics: () => {
    const { booths } = get();
    const total = booths.length;
    const available = booths.filter(b => b.status === 'available').length;
    const reserved = booths.filter(b => b.status === 'reserved').length;
    const sold = booths.filter(b => b.status === 'sold').length;
    const revenue = booths.filter(b => b.status === 'sold' && b.price).reduce((sum, b) => sum + (b.price || 0), 0);
    const potential = booths.filter(b => b.price).reduce((sum, b) => sum + (b.price || 0), 0);

    const categories: Record<string, number> = {};
    booths.forEach(b => {
      if (b.company?.category) {
        categories[b.company.category] = (categories[b.company.category] || 0) + 1;
      }
    });

    return { total, available, reserved, sold, revenue, potential, categories };
  },

  saveToLocalStorage: () => {
    const { booths, paths, objects, nextBoothNumber } = get();
    localStorage.setItem('exhibition-layout', JSON.stringify({ booths, paths, objects, nextBoothNumber }));
  },

  loadFromLocalStorage: () => {
    const data = localStorage.getItem('exhibition-layout');
    if (!data) return;
    try {
      const { booths, paths, objects, nextBoothNumber } = JSON.parse(data);
      set({ booths, paths, objects, nextBoothNumber, selectedElement: null, history: [], future: [] });
    } catch (e) {
      console.error('Failed to load layout', e);
    }
  },

  resetCanvas: () => {
    const state = get();
    const entry: HistoryEntry = { booths: state.booths, paths: state.paths, objects: state.objects };
    set({
      booths: [],
      paths: [],
      objects: [],
      selectedElement: null,
      nextBoothNumber: 1,
      history: [...state.history.slice(-MAX_HISTORY + 1), entry],
      future: [],
    });
  },
}));
