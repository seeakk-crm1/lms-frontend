export type OfficeFilterStatus = 'ALL' | 'ACTIVE' | 'INACTIVE';

export interface Office {
  id: string;
  name: string;
  address?: string | null;
  countryId?: string | null;
  stateId?: string | null;
  districtId?: string | null;
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
  level?: {
    id: string;
    levelName: string;
    levelOrder: number;
  } | null;
  workspaceId: string;
}

export interface OfficeFilters {
  status: OfficeFilterStatus;
  countryId?: string;
  stateId?: string;
  districtId?: string;
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
  countryId: string;
  stateId: string;
  districtId: string;
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
