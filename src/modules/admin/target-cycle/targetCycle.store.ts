import { create } from 'zustand';
import type {
  TargetCycle,
  TargetCycleFilters,
  TargetCycleFormState,
  TargetCyclePagination,
  TargetCycleRange,
} from './types';

interface TargetCycleState {
  targetCycles: TargetCycle[];
  filters: TargetCycleFilters;
  search: string;
  pagination: TargetCyclePagination;
  ranges: TargetCycleRange[];
  totalDays: number;
  formState: TargetCycleFormState;
  deleteCandidate: TargetCycle | null;
  setTargetCycles: (targetCycles: TargetCycle[]) => void;
  setSearch: (search: string) => void;
  setFilters: (filters: Partial<TargetCycleFilters>) => void;
  setPagination: (pagination: Partial<TargetCyclePagination>) => void;
  setFormState: (formState: Partial<TargetCycleFormState>) => void;
  setDeleteCandidate: (cycle: TargetCycle | null) => void;
  setRanges: (ranges: TargetCycleRange[]) => void;
  addRange: () => void;
  removeRange: (index: number) => void;
  updateRange: (index: number, patch: Partial<TargetCycleRange>) => void;
  calculateTotal: () => number;
  resetForm: () => void;
}

const DEFAULT_RANGE: TargetCycleRange = { startDay: 1, endDay: 1 };

const computeTotal = (ranges: TargetCycleRange[]): number =>
  ranges.reduce((sum, item) => sum + Math.max(0, item.endDay - item.startDay + 1), 0);

export const useTargetCycleStore = create<TargetCycleState>((set, get) => ({
  targetCycles: [],
  filters: {
    search: '',
    status: undefined,
  },
  search: '',
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  },
  ranges: [DEFAULT_RANGE],
  totalDays: 1,
  formState: {
    mode: 'create',
    isModalOpen: false,
    selectedCycle: null,
  },
  deleteCandidate: null,
  setTargetCycles: (targetCycles) => set({ targetCycles }),
  setSearch: (search) =>
    set((state) => ({
      search,
      filters: { ...state.filters, search },
      pagination: { ...state.pagination, page: 1 },
    })),
  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
      pagination: { ...state.pagination, page: 1 },
    })),
  setPagination: (pagination) =>
    set((state) => ({
      pagination: { ...state.pagination, ...pagination },
    })),
  setFormState: (formState) =>
    set((state) => ({
      formState: { ...state.formState, ...formState },
    })),
  setDeleteCandidate: (deleteCandidate) => set({ deleteCandidate }),
  setRanges: (ranges) =>
    set({
      ranges,
      totalDays: computeTotal(ranges),
    }),
  addRange: () =>
    set((state) => {
      const nextRanges = [...state.ranges, DEFAULT_RANGE];
      return { ranges: nextRanges, totalDays: computeTotal(nextRanges) };
    }),
  removeRange: (index) =>
    set((state) => {
      const nextRanges = state.ranges.filter((_, idx) => idx !== index);
      const normalized = nextRanges.length ? nextRanges : [DEFAULT_RANGE];
      return { ranges: normalized, totalDays: computeTotal(normalized) };
    }),
  updateRange: (index, patch) =>
    set((state) => {
      const nextRanges = state.ranges.map((item, idx) => (idx === index ? { ...item, ...patch } : item));
      return { ranges: nextRanges, totalDays: computeTotal(nextRanges) };
    }),
  calculateTotal: () => {
    const totalDays = computeTotal(get().ranges);
    set({ totalDays });
    return totalDays;
  },
  resetForm: () =>
    set({
      ranges: [DEFAULT_RANGE],
      totalDays: 1,
      formState: {
        mode: 'create',
        isModalOpen: false,
        selectedCycle: null,
      },
    }),
}));

