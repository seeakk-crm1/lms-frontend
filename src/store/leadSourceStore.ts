import { create } from 'zustand';
import { LeadSource, LeadSourceFilters, LeadSourcePagination } from '../types/leadSource.types';

interface LeadSourceUIState {
  isCreateModalOpen: boolean;
  isEditModalOpen: boolean;
}

interface LeadSourceState {
  leadSources: LeadSource[];
  selectedLeadSource: LeadSource | null;
  filters: LeadSourceFilters;
  search: string;
  pagination: LeadSourcePagination;
  uiState: LeadSourceUIState;
  setLeadSources: (leadSources: LeadSource[]) => void;
  setSearch: (search: string) => void;
  setFilters: (filters: Partial<LeadSourceFilters>) => void;
  setPagination: (pagination: Partial<LeadSourcePagination>) => void;
  setSelectedLeadSource: (leadSource: LeadSource | null) => void;
  setUIState: (uiState: Partial<LeadSourceUIState>) => void;
  resetForm: () => void;
}

const useLeadSourceStore = create<LeadSourceState>((set) => ({
  leadSources: [],
  selectedLeadSource: null,
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
  uiState: {
    isCreateModalOpen: false,
    isEditModalOpen: false,
  },
  setLeadSources: (leadSources) => set({ leadSources }),
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
  setSelectedLeadSource: (leadSource) => set({ selectedLeadSource: leadSource }),
  setUIState: (uiState) =>
    set((state) => ({
      uiState: { ...state.uiState, ...uiState },
    })),
  resetForm: () =>
    set({
      selectedLeadSource: null,
      uiState: {
        isCreateModalOpen: false,
        isEditModalOpen: false,
      },
    }),
}));

export default useLeadSourceStore;

