export interface ExtensionReason {
  id: string;
  workspaceId: string;
  reasonName: string;
  description?: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ActiveExtensionReasonOption {
  id: string;
  reasonName: string;
  isActive: boolean;
  sortOrder: number;
}

export interface ExtensionReasonListResponse {
  data: ExtensionReason[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ExtensionReasonPayload {
  reasonName: string;
  description?: string | null;
  isActive: boolean;
  sortOrder: number;
}

export interface ExtensionReasonFilters {
  isActive?: boolean | 'ALL';
}
