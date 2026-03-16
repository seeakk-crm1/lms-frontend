import { create } from 'zustand';
import { Role, RoleFilters, Permission } from '../types/role.types';

interface RoleState {
  roles: Role[];
  selectedRole: Role | null;
  permissions: Permission[];
  filters: RoleFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  permissionUIState: Record<string, boolean>; // Group collapse state

  setRoles: (roles: Role[]) => void;
  setSelectedRole: (role: Role | null) => void;
  setPermissions: (permissions: Permission[]) => void;
  setFilters: (filters: Partial<RoleFilters>) => void;
  setPagination: (pagination: any) => void;
  togglePermissionGroup: (group: string) => void;
  resetRoleForm: () => void;
}

const useRoleStore = create<RoleState>((set) => ({
  roles: [],
  selectedRole: null,
  permissions: [],
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
  permissionUIState: {},

  setRoles: (roles) => set({ roles }),
  setSelectedRole: (role) => set({ selectedRole: role }),
  setPermissions: (permissions) => set({ permissions }),
  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
  setPagination: (pagination) => set({ pagination }),
  togglePermissionGroup: (group) =>
    set((state) => ({
      permissionUIState: {
        ...state.permissionUIState,
        [group]: !state.permissionUIState[group],
      },
    })),
  resetRoleForm: () => set({ selectedRole: null }),
}));

export default useRoleStore;
