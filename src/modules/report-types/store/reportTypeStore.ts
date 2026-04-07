import { create } from 'zustand';
import type { ReportModule, ReportType, ReportTypeFilters } from '../types/reportType.types';

interface ReportTypeStoreState {
  search: string;
  filters: ReportTypeFilters;
  selected: ReportType | null;
  page: number;
  limit: number;
  setSearch: (value: string) => void;
  setFilters: (value: Partial<ReportTypeFilters>) => void;
  setSelected: (value: ReportType | null) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  resetFilters: () => void;
  setModuleFilter: (module: ReportModule | '') => void;
}

const useReportTypeStore = create<ReportTypeStoreState>((set) => ({
  search: '',
  filters: {},
  selected: null,
  page: 1,
  limit: 10,
  setSearch: (search) => set({ search, page: 1 }),
  setFilters: (value) => set((state) => ({ filters: { ...state.filters, ...value }, page: 1 })),
  setSelected: (selected) => set({ selected }),
  setPage: (page) => set({ page }),
  setLimit: (limit) => set({ limit, page: 1 }),
  resetFilters: () => set({ search: '', filters: {}, page: 1 }),
  setModuleFilter: (module) =>
    set((state) => ({
      filters: { ...state.filters, module },
      page: 1,
    })),
}));

export default useReportTypeStore;
