import { create } from 'zustand';
import type { RosterEntry, RosterFilters, RosterPagination, RosterUser } from './types';

interface RosterModalState {
  isRosterModalOpen: boolean;
  isFormModalOpen: boolean;
}

interface RosterState {
  selectedUser: RosterUser | null;
  editingEntry: RosterEntry | null;
  filters: RosterFilters;
  search: string;
  pagination: RosterPagination;
  rosterEntries: RosterEntry[];
  modalState: RosterModalState;
  setUser: (user: RosterUser | null) => void;
  setEditingEntry: (entry: RosterEntry | null) => void;
  setFilters: (filters: Partial<RosterFilters>) => void;
  setSearch: (search: string) => void;
  setPagination: (pagination: Partial<RosterPagination>) => void;
  openModal: (type: keyof RosterModalState) => void;
  closeModal: (type: keyof RosterModalState) => void;
  setRosterEntries: (entries: RosterEntry[]) => void;
}

export const useRosterStore = create<RosterState>((set) => ({
  selectedUser: null,
  editingEntry: null,
  filters: {
    search: '',
    status: 'ACTIVE',
  },
  search: '',
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  },
  rosterEntries: [],
  modalState: {
    isRosterModalOpen: false,
    isFormModalOpen: false,
  },
  setUser: (selectedUser) => set({ selectedUser }),
  setEditingEntry: (editingEntry) => set({ editingEntry }),
  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
      pagination: { ...state.pagination, page: 1 },
    })),
  setSearch: (search) =>
    set((state) => ({
      search,
      filters: { ...state.filters, search },
      pagination: { ...state.pagination, page: 1 },
    })),
  setPagination: (pagination) =>
    set((state) => ({
      pagination: { ...state.pagination, ...pagination },
    })),
  openModal: (type) =>
    set((state) => ({
      modalState: { ...state.modalState, [type]: true },
    })),
  closeModal: (type) =>
    set((state) => ({
      modalState: { ...state.modalState, [type]: false },
      ...(type === 'isFormModalOpen' ? { editingEntry: null } : {}),
      ...(type === 'isRosterModalOpen' ? { editingEntry: null, selectedUser: null } : {}),
    })),
  setRosterEntries: (rosterEntries) => set({ rosterEntries }),
}));
