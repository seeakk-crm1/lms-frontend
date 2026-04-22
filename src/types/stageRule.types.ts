export type StageRuleStatus = 'ACTIVE' | 'INACTIVE';
export type StageRuleInputType = 'TEXT' | 'TEXTAREA' | 'RADIO' | 'SELECT';

export interface StageRule {
  id: string;
  name: string;
  inputType: StageRuleInputType;
  options?: string[];
  sortOrder: number;
  required: boolean;
  status: StageRuleStatus;
  stageId?: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StageRuleFilters {
  search: string;
  status?: StageRuleStatus;
  stageId?: string;
}

export interface StageRulePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListStageRulesResponse {
  success: boolean;
  message?: string;
  data: StageRule[];
  pagination: StageRulePagination;
}

export interface CreateStageRuleInput {
  name: string;
  inputType: StageRuleInputType;
  options?: string[];
  sortOrder: number;
  required: boolean;
  status: StageRuleStatus;
  stageId?: string;
}

export interface UpdateStageRuleInput extends Partial<CreateStageRuleInput> {}
