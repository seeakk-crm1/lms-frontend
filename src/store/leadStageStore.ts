import { create } from 'zustand';
import { LeadStage, LeadStageFilters, LeadStagePagination } from '../types/leadStage.types';

interface LeadStageUIState {
  isCreateModalOpen: boolean;
  isEditModalOpen: boolean;
}

interface LeadStageState {
  leadStages: LeadStage[];
  selectedStage: LeadStage | null;
  filters: LeadStageFilters;
  search: string;
  pagination: LeadStagePagination;
  uiState: LeadStageUIState;
  setLeadStages: (leadStages: LeadStage[]) => void;
  setSearch: (search: string) => void;
  setFilters: (filters: Partial<LeadStageFilters>) => void;
  setPagination: (pagination: Partial<LeadStagePagination>) => void;
  setSelectedStage: (selectedStage: LeadStage | null) => void;
  setUIState: (uiState: Partial<LeadStageUIState>) => void;
  resetForm: () => void;
}

const useLeadStageStore = create<LeadStageState>((set) => ({
  leadStages: [],
  selectedStage: null,
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
  setLeadStages: (leadStages) => set({ leadStages }),
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
  setSelectedStage: (selectedStage) => set({ selectedStage }),
  setUIState: (uiState) =>
    set((state) => ({
      uiState: { ...state.uiState, ...uiState },
    })),
  resetForm: () =>
    set({
      selectedStage: null,
      uiState: { isCreateModalOpen: false, isEditModalOpen: false },
    }),
}));

export default useLeadStageStore;

