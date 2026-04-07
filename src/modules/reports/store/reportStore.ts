import { create } from 'zustand';
import type { SavedReport, SavedReportFilters } from '../types/report.types';

type ReportStoreState = {
  search: string;
  filters: SavedReportFilters;
  page: number;
  limit: number;
  selected: SavedReport | null;
  setSearch: (value: string) => void;
  setFilters: (value: Partial<SavedReportFilters>) => void;
  resetFilters: () => void;
  setPage: (value: number) => void;
  setSelected: (value: SavedReport | null) => void;
};

const initialFilters: SavedReportFilters = {
  createdBy: '',
  status: '',
  isActive: '',
  reportTypeId: '',
  createdAtFrom: '',
  createdAtTo: '',
  reportDateFrom: '',
  reportDateTo: '',
};

const useReportStore = create<ReportStoreState>((set) => ({
  search: '',
  filters: initialFilters,
  page: 1,
  limit: 10,
  selected: null,
  setSearch: (value) => set({ search: value, page: 1 }),
  setFilters: (value) =>
    set((state) => ({
      filters: {
        ...state.filters,
        ...value,
      },
      page: 1,
    })),
  resetFilters: () => set({ search: '', filters: initialFilters, page: 1 }),
  setPage: (value) => set({ page: value }),
  setSelected: (value) => set({ selected: value }),
}));

export default useReportStore;
