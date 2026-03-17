import { create } from 'zustand';
import { Department, DepartmentFilters, DepartmentPagination } from '../types/department.types';

interface DepartmentState {
  departments: Department[];
  selectedDepartment: Department | null;
  filters: DepartmentFilters;
  pagination: DepartmentPagination;

  setDepartments: (departments: Department[]) => void;
  setSelectedDepartment: (department: Department | null) => void;
  setFilters: (filters: Partial<DepartmentFilters>) => void;
  setPagination: (pagination: Partial<DepartmentPagination>) => void;
  resetDepartmentForm: () => void;
}

const useDepartmentStore = create<DepartmentState>((set) => ({
  departments: [],
  selectedDepartment: null,
  filters: {
    search: '',
    status: undefined,
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  },

  setDepartments: (departments) => set({ departments }),
  setSelectedDepartment: (department) => set({ selectedDepartment: department }),
  setFilters: (filters) => set((state) => ({ 
    filters: { ...state.filters, ...filters },
    pagination: { ...state.pagination, page: 1 } // Reset to page 1 on filter change
  })),
  setPagination: (pagination) => set((state) => ({ 
    pagination: { ...state.pagination, ...pagination } 
  })),
  resetDepartmentForm: () => set({ selectedDepartment: null }),
}));

export default useDepartmentStore;
