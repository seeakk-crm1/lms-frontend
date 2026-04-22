export type RoleStatus = 'ACTIVE' | 'INACTIVE';

export interface Permission {
  id: string;
  key: string;
  group: string;
  description: string | null;
}

export interface Role {
  id: string;
  name: string;
  status: RoleStatus;
  description: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  permissionsCount?: number;
  permissions?: string[]; // Array of permission keys
}

export interface RoleFilters {
  search?: string;
  status?: RoleStatus;
}

export interface CreateRoleInput {
  name: string;
  status: RoleStatus;
  description?: string;
  permissions: string[];
}

export interface UpdateRoleInput extends Partial<CreateRoleInput> {}
