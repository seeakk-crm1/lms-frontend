export type DepartmentStatus = 'ACTIVE' | 'INACTIVE';

export interface Department {
  id: string;
  name: string;
  description: string | null;
  status: DepartmentStatus;
  workspaceId: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  _count?: {
    users: number;
  };
}

export interface DepartmentFilters {
  search: string;
  status?: DepartmentStatus;
}

export interface ListDepartmentsQuery {
  page: number;
  limit: number;
  search?: string;
  status?: DepartmentStatus;
}

export interface DepartmentPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListDepartmentsResponse {
  success: boolean;
  message?: string;
  data: Department[];
  pagination: DepartmentPagination;
}

export interface CreateDepartmentInput {
  name: string;
  status: DepartmentStatus;
  description?: string;
}

export interface UpdateDepartmentInput extends Partial<CreateDepartmentInput> {}
