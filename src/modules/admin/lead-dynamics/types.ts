export type LeadDynamicsInputType =
  | 'TEXT'
  | 'TEXTAREA'
  | 'NUMBER'
  | 'DATE'
  | 'SELECT'
  | 'RADIO'
  | 'CHECKBOX'
  | 'FILE'
  | 'DATETIME';

export interface LeadDynamicOption {
  id?: string;
  value: string;
  sortOrder: number;
}

export interface LeadDynamicField {
  id: string;
  name: string;
  inputType: LeadDynamicsInputType;
  sortOrder: number;
  isRequired: boolean;
  isActive: boolean;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
  options: LeadDynamicOption[];
}

export interface LeadDynamicsFilters {
  search: string;
  status: 'ALL' | 'ACTIVE' | 'INACTIVE';
}

export interface LeadDynamicsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface LeadDynamicsFormValues {
  name: string;
  inputType: LeadDynamicsInputType;
  sortOrder: number;
  isRequired: boolean;
  isActive: boolean;
  options: LeadDynamicOption[];
}

export interface LeadDynamicsModalState {
  isOpen: boolean;
  mode: 'create' | 'edit';
}

export interface ListLeadDynamicsResponse {
  success: boolean;
  message: string;
  data: LeadDynamicField[];
  pagination: LeadDynamicsPagination;
}

export interface LeadDynamicsMutationResponse<T = LeadDynamicField> {
  success: boolean;
  message: string;
  data: T;
}
