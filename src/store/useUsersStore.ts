import { create } from 'zustand';
import { UserFilters } from '../types/user.types';

interface UsersState {
  // Modal State
  isCreateModalOpen: boolean;
  selectedUserId: string | null;
  
  // Table State
  search: string;
  filters: UserFilters;
  page: number;
  limit: number;
  
  // Actions
  setSearch: (value: string) => void;
  setFilters: (filters: UserFilters) => void;
  setPage: (page: number) => void;
  
  openCreateModal: (userId?: string) => void;
  closeCreateModal: () => void;
}

export const useUsersStore = create<UsersState>((set) => ({
  // Initial State
  isCreateModalOpen: false,
  selectedUserId: null,
  
  search: '',
  filters: {},
  page: 1,
  limit: 10,
  
  // Actions
  setSearch: (value) => set({ search: value, page: 1 }),
  setFilters: (filters) => set({ filters, page: 1 }),
  setPage: (page) => set({ page }),
  
  openCreateModal: (userId) => set({ 
    isCreateModalOpen: true, 
    selectedUserId: userId || null 
  }),
  closeCreateModal: () => set({ 
    isCreateModalOpen: false, 
    selectedUserId: null 
  }),
}));
