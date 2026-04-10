import { create } from 'zustand';
import type { ClosedLeadFilters, LeadListItem, LeadPagination } from '../types/lead.types';

interface ClosedLeadsStoreState {
  leads: LeadListItem[];
  filters: ClosedLeadFilters;
  search: string;
  pagination: LeadPagination;
  selectedLead: LeadListItem | null;
  setLeads: (leads: LeadListItem[]) => void;
  setFilters: (filters: Partial<ClosedLeadFilters>) => void;
  setSearch: (search: string) => void;
  setPagination: (pagination: Partial<LeadPagination>) => void;
  setSelectedLead: (lead: LeadListItem | null) => void;
}

const useClosedLeadsStore = create<ClosedLeadsStoreState>((set) => ({
  leads: [],
  filters: {},
  search: '',
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  },
  selectedLead: null,
  setLeads: (leads) => set({ leads }),
  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
      pagination: { ...state.pagination, page: 1 },
    })),
  setSearch: (search) =>
    set((state) => ({
      search,
      pagination: { ...state.pagination, page: 1 },
    })),
  setPagination: (pagination) =>
    set((state) => ({
      pagination: { ...state.pagination, ...pagination },
    })),
  setSelectedLead: (selectedLead) => set({ selectedLead }),
}));

export default useClosedLeadsStore;
