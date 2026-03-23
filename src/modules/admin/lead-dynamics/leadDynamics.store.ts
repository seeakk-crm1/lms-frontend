import { create } from 'zustand';
import type {
  LeadDynamicField,
  LeadDynamicsFilters,
  LeadDynamicsModalState,
  LeadDynamicsPagination,
} from './types';

interface LeadDynamicsState {
  fields: LeadDynamicField[];
  selectedField: LeadDynamicField | null;
  modalState: LeadDynamicsModalState;
  deleteCandidate: LeadDynamicField | null;
  filters: LeadDynamicsFilters;
  pagination: LeadDynamicsPagination;
  setFields: (fields: LeadDynamicField[]) => void;
  setSelectedField: (field: LeadDynamicField | null) => void;
  openModal: (mode: 'create' | 'edit', field?: LeadDynamicField | null) => void;
  closeModal: () => void;
  resetForm: () => void;
  setDeleteCandidate: (field: LeadDynamicField | null) => void;
  setFilters: (filters: Partial<LeadDynamicsFilters>) => void;
  setPagination: (pagination: Partial<LeadDynamicsPagination>) => void;
}

export const useLeadDynamicsStore = create<LeadDynamicsState>((set) => ({
  fields: [],
  selectedField: null,
  modalState: { isOpen: false, mode: 'create' },
  deleteCandidate: null,
  filters: {
    search: '',
    status: 'ALL',
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  },
  setFields: (fields) => set({ fields }),
  setSelectedField: (selectedField) => set({ selectedField }),
  openModal: (mode, field = null) =>
    set({
      modalState: { isOpen: true, mode },
      selectedField: field,
    }),
  closeModal: () =>
    set({
      modalState: { isOpen: false, mode: 'create' },
      selectedField: null,
    }),
  resetForm: () =>
    set({
      selectedField: null,
      modalState: { isOpen: false, mode: 'create' },
    }),
  setDeleteCandidate: (deleteCandidate) => set({ deleteCandidate }),
  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
      pagination: { ...state.pagination, page: 1 },
    })),
  setPagination: (pagination) =>
    set((state) => ({
      pagination: { ...state.pagination, ...pagination },
    })),
}));
