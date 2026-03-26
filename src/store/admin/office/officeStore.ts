import { create } from 'zustand';
import type {
  Office,
  OfficeFilters,
  OfficePagination,
} from '../../../types/admin/office/office.types';

interface OfficeStoreState {
  offices: Office[];
  filters: OfficeFilters;
  search: string;
  pagination: OfficePagination;
  selectedOffice: Office | null;
  setOffices: (offices: Office[]) => void;
  setFilters: (filters: Partial<OfficeFilters>) => void;
  setSearch: (search: string) => void;
  setPagination: (pagination: Partial<OfficePagination>) => void;
  setSelectedOffice: (office: Office | null) => void;
  resetForm: () => void;
}

export const useOfficeStore = create<OfficeStoreState>((set) => ({
  offices: [],
  filters: {
    status: 'ALL',
    countryId: undefined,
    stateId: undefined,
    districtId: undefined,
  },
  search: '',
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  },
  selectedOffice: null,
  setOffices: (offices) => set({ offices }),
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
  setSelectedOffice: (selectedOffice) => set({ selectedOffice }),
  resetForm: () => set({ selectedOffice: null }),
}));
