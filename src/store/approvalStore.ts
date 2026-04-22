import { create } from 'zustand';
import type { LeadApprovalFilters, LeadApprovalListItem, LeadPagination } from '../types/lead.types';

type ApprovalSortKey = 'createdAt' | 'updatedAt' | 'status' | 'leadName';
type ApprovalSortDirection = 'asc' | 'desc';

interface ApprovalStoreState {
  approvals: LeadApprovalListItem[];
  filters: LeadApprovalFilters;
  pagination: LeadPagination;
  selectedApproval: LeadApprovalListItem | null;
  loading: boolean;
  sortBy: ApprovalSortKey;
  sortDirection: ApprovalSortDirection;
  setApprovals: (approvals: LeadApprovalListItem[]) => void;
  setFilters: (filters: Partial<LeadApprovalFilters>) => void;
  setPagination: (pagination: Partial<LeadPagination>) => void;
  setSelectedApproval: (approval: LeadApprovalListItem | null) => void;
  resetModal: () => void;
  setLoading: (loading: boolean) => void;
  setSort: (sortBy: ApprovalSortKey) => void;
  resetFilters: () => void;
}

const defaultPagination: LeadPagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
  hasNext: false,
  hasPrev: false,
};

const useApprovalStore = create<ApprovalStoreState>((set) => ({
  approvals: [],
  filters: {
    search: '',
    status: '',
    dateFrom: '',
    dateTo: '',
  },
  pagination: defaultPagination,
  selectedApproval: null,
  loading: false,
  sortBy: 'createdAt',
  sortDirection: 'desc',
  setApprovals: (approvals) => set({ approvals }),
  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
      pagination: { ...state.pagination, page: 1 },
    })),
  setPagination: (pagination) =>
    set((state) => ({
      pagination: { ...state.pagination, ...pagination },
    })),
  setSelectedApproval: (selectedApproval) => set({ selectedApproval }),
  resetModal: () => set({ selectedApproval: null }),
  setLoading: (loading) => set({ loading }),
  setSort: (sortBy) =>
    set((state) => ({
      sortBy,
      sortDirection:
        state.sortBy === sortBy
          ? state.sortDirection === 'asc'
            ? 'desc'
            : 'asc'
          : sortBy === 'status'
            ? 'asc'
            : 'desc',
    })),
  resetFilters: () =>
    set({
      filters: {
        search: '',
        status: '',
        dateFrom: '',
        dateTo: '',
      },
      pagination: defaultPagination,
    }),
}));

export default useApprovalStore;
