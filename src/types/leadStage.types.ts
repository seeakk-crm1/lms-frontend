export type LeadStageStatus = 'ACTIVE' | 'INACTIVE';

export interface LeadStageRule {
  id: string;
  name: string;
  inputType: 'TEXT' | 'TEXTAREA' | 'RADIO' | 'SELECT';
  options?: string[];
  sortOrder: number;
  required: boolean;
  status: LeadStageStatus;
  stageId?: string | null;
}

export interface LeadStageRuleAssignment {
  ruleId: string;
  required: boolean;
}

export interface LeadSubstageItem {
  id?: string;
  name: string;
  status?: LeadStageStatus;
}

export interface LeadStage {
  id: string;
  name: string;
  stageShortForm: string | null;
  showInCalendar: boolean;
  color: string;
  isApprovalRequired: boolean;
  isLOB: boolean;
  isClosed: boolean;
  stageOrder: number;
  rules: LeadStageRule[];
  substages?: LeadSubstageItem[];
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
  stageShortForm?: string | null;
  showInCalendar: boolean;
  color: string;
  isApprovalRequired: boolean;
  isLOB: boolean;
  isClosed: boolean;
  stageOrder: number;
  ruleAssignments: LeadStageRuleAssignment[];
  substages?: LeadSubstageItem[];
  status: LeadStageStatus;
}

export interface UpdateLeadStageInput extends Partial<Omit<CreateLeadStageInput, 'substages'>> {
  substages?: LeadSubstageItem[] | {
    create?: LeadSubstageItem[];
    update?: Array<{ id: string; name: string; status?: LeadStageStatus }>;
    remove?: string[];
  };
}
