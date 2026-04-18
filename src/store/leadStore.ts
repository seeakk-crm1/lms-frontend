import { create } from 'zustand';
import type { LeadDrawerState, LeadFilters, LeadFormValues, LeadListItem, LeadMetaOptions, LeadPagination } from '../types/lead.types';

interface LeadStoreState {
  leads: LeadListItem[];
  filters: LeadFilters;
  search: string;
  pagination: LeadPagination;
  selectedLead: LeadListItem | null;
  drawerState: LeadDrawerState;
  lobModalOpen: boolean;
  dynamicFields: LeadMetaOptions['dynamicFields'];
  setLeads: (leads: LeadListItem[]) => void;
  setFilters: (filters: Partial<LeadFilters>) => void;
  setSearch: (search: string) => void;
  setPagination: (pagination: Partial<LeadPagination>) => void;
  setSelectedLead: (lead: LeadListItem | null) => void;
  setDrawerState: (drawerState: Partial<LeadDrawerState>) => void;
  setLobModalOpen: (open: boolean) => void;
  setDynamicFields: (dynamicFields: LeadMetaOptions['dynamicFields']) => void;
  openCreateDrawer: () => void;
  openEditDrawer: (lead: LeadListItem) => void;
  closeDrawer: () => void;
}

export const createEmptyLeadFormValues = (): LeadFormValues => ({
  name: '',
  email: '',
  phone: '',
  expectedRevenue: '',
  assignedToId: '',
  stageId: '',
  lifecycleId: '',
  sourceId: '',
  nextFollowUpAt: '',
  followUpDescription: '',
  reasonId: '',
  remarks: '',
  dynamicValues: {},
});

export const useLeadStore = create<LeadStoreState>((set) => ({
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
  drawerState: {
    isOpen: false,
    mode: 'create',
  },
  lobModalOpen: false,
  dynamicFields: [],
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
  setDrawerState: (drawerState) =>
    set((state) => ({
      drawerState: { ...state.drawerState, ...drawerState },
    })),
  setLobModalOpen: (lobModalOpen) => set({ lobModalOpen }),
  setDynamicFields: (dynamicFields) => set({ dynamicFields }),
  openCreateDrawer: () =>
    set({
      selectedLead: null,
      drawerState: { isOpen: true, mode: 'create' },
      lobModalOpen: false,
    }),
  openEditDrawer: (lead) =>
    set({
      selectedLead: lead,
      drawerState: { isOpen: true, mode: 'edit' },
      lobModalOpen: false,
    }),
  closeDrawer: () =>
    set({
      drawerState: { isOpen: false, mode: 'create' },
      selectedLead: null,
      lobModalOpen: false,
    }),
}));

export default useLeadStore;
