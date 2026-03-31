import { create } from 'zustand';
import type {
  LeadLifeCycle,
  LeadLifeCycleFilters,
  LeadLifeCycleFormState,
  LeadLifeCyclePagination,
} from '../../../types/admin/lead-life-cycle/leadLifeCycle.types';

interface LeadLifeCycleStoreState {
  lifeCycles: LeadLifeCycle[];
  selectedLifeCycle: LeadLifeCycle | null;
  filters: LeadLifeCycleFilters;
  search: string;
  pagination: LeadLifeCyclePagination;
  formState: LeadLifeCycleFormState;
  deleteCandidate: LeadLifeCycle | null;
  setLifeCycles: (lifeCycles: LeadLifeCycle[]) => void;
  setSelected: (selectedLifeCycle: LeadLifeCycle | null) => void;
  setSearch: (search: string) => void;
  setFilters: (filters: Partial<LeadLifeCycleFilters>) => void;
  setPagination: (pagination: Partial<LeadLifeCyclePagination>) => void;
  setFormState: (formState: Partial<LeadLifeCycleFormState>) => void;
  setDeleteCandidate: (lifeCycle: LeadLifeCycle | null) => void;
  resetForm: () => void;
}

export const useLeadLifeCycleStore = create<LeadLifeCycleStoreState>((set) => ({
  lifeCycles: [],
  selectedLifeCycle: null,
  filters: {
    search: '',
  },
  search: '',
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  },
  formState: {
    mode: 'create',
    isModalOpen: false,
  },
  deleteCandidate: null,
  setLifeCycles: (lifeCycles) => set({ lifeCycles }),
  setSelected: (selectedLifeCycle) => set({ selectedLifeCycle }),
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
  resetForm: () =>
    set({
      selectedLifeCycle: null,
      formState: {
        mode: 'create',
        isModalOpen: false,
      },
    }),
}));
