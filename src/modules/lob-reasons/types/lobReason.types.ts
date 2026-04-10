export type LOBReasonStatus = 'ACTIVE' | 'INACTIVE';

export interface LOBReasonActor {
  id: string;
  name?: string | null;
  username?: string | null;
  email?: string | null;
  displayName?: string | null;
}

export interface LOBReason {
  id: string;
  workspaceId: string;
  name: string;
  status: LOBReasonStatus;
  createdById?: string | null;
  updatedById?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  createdBy?: LOBReasonActor | null;
  updatedBy?: LOBReasonActor | null;
}

export interface ActiveLOBReasonOption {
  id: string;
  name: string;
  status: LOBReasonStatus;
}

export interface LOBReasonListResponse {
  data: LOBReason[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LOBReasonPayload {
  name: string;
  status: LOBReasonStatus;
}

export interface LOBReasonFilters {
  status?: LOBReasonStatus | '';
}
