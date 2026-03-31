export interface LeadLifeCycleTransition {
  id?: string;
  lifecycleId?: string;
  fromStageId: string;
  toStageId: string;
  numberOfDays: number;
  sortOrder: number;
  workspaceId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LeadLifeCycle {
  id: string;
  name: string;
  isDefault: boolean;
  workspaceId: string;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  transitions: LeadLifeCycleTransition[];
}

export interface LeadLifeCycleFilters {
  search: string;
}

export interface LeadLifeCyclePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListLeadLifeCyclesResponse {
  success: boolean;
  message: string;
  data: {
    lifeCycles: LeadLifeCycle[];
  };
  pagination: LeadLifeCyclePagination;
}

export interface LeadLifeCycleMutationResponse<T = LeadLifeCycle> {
  success: boolean;
  message: string;
  data: {
    lifeCycle: T;
  };
}

export interface LeadLifeCycleFormValues {
  name: string;
  isDefault: boolean;
  transitions: Array<{
    fromStageId: string;
    toStageId: string;
    numberOfDays: number;
    sortOrder?: number;
  }>;
}

export interface LeadLifeCycleFormState {
  mode: 'create' | 'edit';
  isModalOpen: boolean;
}

export interface LeadStageOption {
  id: string;
  name: string;
}
