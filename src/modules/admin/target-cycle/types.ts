export type TargetCycleStatus = 'ACTIVE' | 'INACTIVE';

export interface TargetCycleRange {
  id?: string;
  startDay: number;
  endDay: number;
}

export interface TargetCyclePeriod {
  id: string;
  targetCycleId?: string;
  label: string;
  periodIndex: number;
  targetCount: number;
  startDate: string;
  endDate: string;
  lockingDate: string;
}

export interface TargetCycle {
  id: string;
  name: string;
  workspaceId: string;
  totalDays: number;
  status: TargetCycleStatus;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  ranges: TargetCycleRange[];
  description?: string | null;
  targetType?: 'WEEKLY' | 'MONTHLY' | 'SEMI_ANNUAL' | 'MANUAL';
  targetMetric?: 'LEADS' | 'REVENUE';
  leadStageId?: string | null;
  startDate?: string;
  endDate?: string | null;
  numberOfMonths?: number | null;
  lockingEnabled?: boolean;
  periods?: TargetCyclePeriod[];
  leadStage?: { id: string; name: string; color?: string | null } | null;
}

export interface TargetCycleFilters {
  search: string;
  status?: TargetCycleStatus;
}

export interface TargetCyclePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListTargetCyclesResponse {
  success: boolean;
  message: string;
  data: TargetCycle[];
  pagination: TargetCyclePagination;
}

export interface TargetCycleMutationResponse<T = TargetCycle> {
  success: boolean;
  message: string;
  data: T;
}

export interface TargetCycleFormValues {
  name: string;
  status: TargetCycleStatus;
  ranges: TargetCycleRange[];
}

export interface TargetCycleFormState {
  mode: 'create' | 'edit';
  isModalOpen: boolean;
  selectedCycle: TargetCycle | null;
}

