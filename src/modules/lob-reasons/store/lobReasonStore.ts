import { create } from 'zustand';
import type { LOBReason, LOBReasonFilters } from '../types/lobReason.types';

interface LOBReasonStoreState {
  search: string;
  status: LOBReasonFilters['status'] | 'ALL';
  selected: LOBReason | null;
  page: number;
  limit: number;
  setSearch: (value: string) => void;
  setStatus: (value: LOBReasonStoreState['status']) => void;
  setSelected: (value: LOBReason | null) => void;
  setPage: (value: number) => void;
  resetFilters: () => void;
}

export const useLOBStore = create<LOBReasonStoreState>((set) => ({
  search: '',
  status: 'ALL',
  selected: null,
  page: 1,
  limit: 10,
  setSearch: (search) => set({ search, page: 1 }),
  setStatus: (status) => set({ status, page: 1 }),
  setSelected: (selected) => set({ selected }),
  setPage: (page) => set({ page }),
  resetFilters: () => set({ search: '', status: 'ALL', page: 1 }),
}));

export default useLOBStore;
