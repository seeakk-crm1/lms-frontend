import { create } from 'zustand';
import { StageRule, StageRuleFilters, StageRulePagination } from '../types/stageRule.types';

interface StageRuleUIState {
  isCreateModalOpen: boolean;
  isEditModalOpen: boolean;
  isDeleteModalOpen: boolean;
}

interface StageRuleState {
  rules: StageRule[];
  selectedRule: StageRule | null;
  filters: StageRuleFilters;
  search: string;
  pagination: StageRulePagination;
  uiState: StageRuleUIState;
  setRules: (rules: StageRule[]) => void;
  setSearch: (search: string) => void;
  setFilters: (filters: Partial<StageRuleFilters>) => void;
  setPagination: (pagination: Partial<StageRulePagination>) => void;
  setSelectedRule: (rule: StageRule | null) => void;
  setUIState: (uiState: Partial<StageRuleUIState>) => void;
  resetForm: () => void;
}

const useStageRuleStore = create<StageRuleState>((set) => ({
  rules: [],
  selectedRule: null,
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
    isDeleteModalOpen: false,
  },
  setRules: (rules) => set({ rules }),
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
  setSelectedRule: (selectedRule) => set({ selectedRule }),
  setUIState: (uiState) =>
    set((state) => ({
      uiState: { ...state.uiState, ...uiState },
    })),
  resetForm: () =>
    set({
      selectedRule: null,
      uiState: {
        isCreateModalOpen: false,
        isEditModalOpen: false,
        isDeleteModalOpen: false,
      },
    }),
}));

export default useStageRuleStore;
