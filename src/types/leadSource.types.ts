export type LeadSourceStatus = 'ACTIVE' | 'INACTIVE';

export interface LeadSource {
  id: string;
  name: string;
  status: LeadSourceStatus;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LeadSourceFilters {
  search: string;
  status?: LeadSourceStatus;
}

export interface LeadSourcePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListLeadSourcesResponse {
  success: boolean;
  message?: string;
  data: LeadSource[];
  pagination: LeadSourcePagination;
}

export interface CreateLeadSourceInput {
  name: string;
  status: LeadSourceStatus;
}

export interface UpdateLeadSourceInput extends Partial<CreateLeadSourceInput> {}

