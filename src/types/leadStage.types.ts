export type LeadStageStatus = 'ACTIVE' | 'INACTIVE';

export interface LeadStageRule {
  field: string;
  condition: string;
  value?: string;
  isMandatory?: boolean;
}

export interface LeadStage {
  id: string;
  name: string;
  color: string;
  isApprovalRequired: boolean;
  isLOB: boolean;
  isClosed: boolean;
  stageOrder: number;
  rules: LeadStageRule[];
  status: LeadStageStatus;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LeadStageFilters {
  search: string;
  status?: LeadStageStatus;
}

export interface LeadStagePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListLeadStagesResponse {
  success: boolean;
  message?: string;
  data: LeadStage[];
  pagination: LeadStagePagination;
}

export interface CreateLeadStageInput {
  name: string;
  color: string;
  isApprovalRequired: boolean;
  isLOB: boolean;
  isClosed: boolean;
  stageOrder: number;
  rules: LeadStageRule[];
  status: LeadStageStatus;
}

export interface UpdateLeadStageInput extends Partial<CreateLeadStageInput> {}
