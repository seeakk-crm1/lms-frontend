export type OfficeFilterStatus = 'ALL' | 'ACTIVE' | 'INACTIVE';

export interface Office {
  id: string;
  name: string;
  address?: string | null;
  country?: string | null;
  state?: string | null;
  district?: string | null;
  city?: string | null;
  isActive: boolean;
  createdBy?: string | null;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
}

export interface LocationOption {
  id: string;
  name: string;
  type: 'COUNTRY' | 'STATE' | 'DISTRICT' | 'CITY' | 'WARD' | 'CONSTITUENCY' | 'OFFICE';
  parentId?: string | null;
  countryId?: string | null;
  level?: {
    id: string;
    levelName: string;
    levelOrder: number;
  } | null;
  workspaceId: string;
}

export interface OfficeFilters {
  status: OfficeFilterStatus;
  country?: string;
  state?: string;
  district?: string;
  city?: string;
}

export interface OfficePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface OfficeFormValues {
  name: string;
  address?: string;
  country?: string;
  state?: string;
  district?: string;
  city?: string;
  isActive: boolean;
}

export interface ListOfficesApiResponse {
  success: boolean;
  message: string;
  data: {
    offices: Office[];
    pagination: OfficePagination;
  };
}

export interface OfficeMutationResponse {
  success: boolean;
  message: string;
  data: {
    office: Office;
  };
}
