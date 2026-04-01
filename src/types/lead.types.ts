import type { LeadDynamicField } from '../modules/admin/lead-dynamics/types';
import type { LeadLifeCycle } from './admin/lead-life-cycle/leadLifeCycle.types';
import type { LeadSource } from './leadSource.types';
import type { LeadStage } from './leadStage.types';
import type { User } from './user.types';

export interface LeadListItem {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  expectedRevenue: number | null;
  assignedToId: string | null;
  stageId: string | null;
  lifecycleId: string | null;
  sourceId: string | null;
  nextFollowUpAt: string | null;
  isClosed: boolean;
  isLOB: boolean;
  workspaceId: string;
  createdById: string;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  assignedTo: (Pick<User, 'id' | 'email' | 'name' | 'username'> & { displayName?: string }) | null;
  stage: Pick<LeadStage, 'id' | 'name' | 'color' | 'isLOB' | 'isClosed'> | null;
  lifecycle: Pick<LeadLifeCycle, 'id' | 'name' | 'isDefault'> | null;
  source: Pick<LeadSource, 'id' | 'name' | 'status'> | null;
  createdBy: Pick<User, 'id' | 'email' | 'name' | 'username'> & { displayName?: string };
  lobLogs: Array<{
    id: string;
    reasonId: string;
    remarks: string | null;
    changedById: string;
    changedAt: string;
  }>;
}

export interface LeadPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface LeadFilters {
  stage?: string;
  assignedTo?: string;
  source?: string;
  status?: 'OPEN' | 'CLOSED' | 'LOB' | 'ACTIVE';
  createdFrom?: string;
  createdTo?: string;
}

export interface ListLeadsResponse {
  success: boolean;
  message: string;
  leads: LeadListItem[];
  pagination: LeadPagination;
}

export interface LeadMutationResponse {
  success: boolean;
  message: string;
  data: LeadListItem;
}

export interface LeadCreatePayload {
  name: string;
  email?: string;
  phone?: string;
  expectedRevenue?: number;
  assignedToId?: string;
  stageId?: string;
  lifecycleId?: string;
  sourceId?: string;
  nextFollowUpAt?: string;
  followUpDescription?: string;
  reasonId?: string;
  remarks?: string;
}

export interface LeadUpdatePayload {
  name?: string;
  email?: string | null;
  phone?: string | null;
  expectedRevenue?: number | null;
  assignedToId?: string | null;
  stageId?: string | null;
  lifecycleId?: string | null;
  sourceId?: string | null;
  nextFollowUpAt?: string | null;
  followUpDescription?: string;
  isClosed?: boolean;
  reasonId?: string | null;
  remarks?: string | null;
}

export interface LeadDynamicValuePayload {
  fieldId: string;
  value: string;
}

export interface LeadFormValues {
  name: string;
  email: string;
  phone: string;
  expectedRevenue: string;
  assignedToId: string;
  stageId: string;
  lifecycleId: string;
  sourceId: string;
  nextFollowUpAt: string;
  followUpDescription: string;
  reasonId: string;
  remarks: string;
  dynamicValues: Record<string, string | string[]>;
}

export interface LeadDrawerState {
  isOpen: boolean;
  mode: 'create' | 'edit';
}

export interface LeadOption {
  id: string;
  label: string;
  subtitle?: string;
}

export interface LeadMetaOptions {
  users: LeadOption[];
  sources: LeadOption[];
  stages: Array<LeadOption & { color?: string; isLOB?: boolean; isClosed?: boolean }>;
  lifeCycles: Array<LeadOption & { isDefault?: boolean; transitions?: LeadLifeCycle['transitions'] }>;
  dynamicFields: LeadDynamicField[];
}
