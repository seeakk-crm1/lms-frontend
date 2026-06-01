import { create } from 'zustand';
import type { ExtensionReason, ExtensionReasonFilters } from '../types/followUpExtensionReason.types';

interface ExtensionReasonStoreState {
  search: string;
  isActive: ExtensionReasonFilters['isActive'];
  selected: ExtensionReason | null;
  page: number;
  limit: number;
  setSearch: (value: string) => void;
  setIsActive: (value: ExtensionReasonStoreState['isActive']) => void;
  setSelected: (value: ExtensionReason | null) => void;
  setPage: (value: number) => void;
  resetFilters: () => void;
}

export const useExtensionReasonStore = create<ExtensionReasonStoreState>((set) => ({
  search: '',
  isActive: 'ALL',
  selected: null,
  page: 1,
  limit: 10,
  setSearch: (search) => set({ search, page: 1 }),
  setIsActive: (isActive) => set({ isActive, page: 1 }),
  setSelected: (selected) => set({ selected }),
  setPage: (page) => set({ page }),
  resetFilters: () => set({ search: '', isActive: 'ALL', page: 1 }),
}));

export default useExtensionReasonStore;
