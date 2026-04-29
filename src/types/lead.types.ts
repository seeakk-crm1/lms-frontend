import type { FollowUpType } from './followup.types';
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
  companyName?: string | null;
  address?: string | null;
  expectedRevenue: number | null;
  generatedRevenue?: number | null;
  assignedToId: string | null;
  stageId: string | null;
  lifecycleId: string | null;
  sourceId: string | null;
  nextFollowUpAt: string | null;
  /** Matches the pending follow-up scheduled at `nextFollowUpAt`, when set. */
  nextFollowUpType?: FollowUpType | null;
  followUpDescription?: string | null;
  stageEnteredAt?: string | null;
  stageExpiresAt?: string | null;
  slaAction?: 'AUTO_LOB' | 'WARN_AND_CHOOSE' | null;
  slaWarningDays?: number | null;
  slaState?: 'ON_TRACK' | 'WARNING' | 'EXPIRED' | null;
  isClosed: boolean;
  isLOB: boolean;
  closedAt?: string | null;
  closedById?: string | null;
  closureType?: LeadClosureType | null;
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
  closedBy?: (Pick<User, 'id' | 'email' | 'name' | 'username'> & { displayName?: string }) | null;
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
  status?: 'OPEN' | 'CLOSED' | 'LOB' | 'ACTIVE' | 'ARCHIVED';
  createdFrom?: string;
  createdTo?: string;
}

export type LeadClosureType = 'WON' | 'LOST' | 'CANCELLED';

export interface ClosedLeadFilters {
  assignedTo?: string;
  source?: string;
  closureType?: LeadClosureType;
  dateFrom?: string;
  dateTo?: string;
  minRevenue?: string;
  maxRevenue?: string;
}

export interface ClosedLeadListResponse {
  data: LeadListItem[];
  pagination: LeadPagination;
}

export interface UpdateClosedLeadPayload {
  generatedRevenue: number;
  closureType: LeadClosureType;
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
  companyName?: string;
  address?: string;
  expectedRevenue?: number;
  assignedToId?: string;
  stageId?: string;
  lifecycleId?: string;
  sourceId?: string;
  nextFollowUpAt?: string;
  nextFollowUpType?: FollowUpType;
  followUpDescription?: string;
  reasonId?: string;
  remarks?: string;
  skipAutoStageAssignment?: boolean;
}

export interface LeadUpdatePayload {
  name?: string;
  email?: string | null;
  phone?: string | null;
  companyName?: string | null;
  address?: string | null;
  expectedRevenue?: number | null;
  assignedToId?: string | null;
  stageId?: string | null;
  lifecycleId?: string | null;
  sourceId?: string | null;
  nextFollowUpAt?: string | null;
  nextFollowUpType?: FollowUpType;
  followUpDescription?: string;
  isClosed?: boolean;
  reasonId?: string | null;
  remarks?: string | null;
}

export interface ExtendLeadSlaPayload {
  extraDays: number;
}

export interface BulkAssignFilters {
  stageId?: string;
  assignedTo?: string;
  lifecycleId?: string;
  sourceId?: string;
  followupDateFrom?: string;
  followupDateTo?: string;
  createdDateFrom?: string;
  createdDateTo?: string;
}

export type BulkAssignAssignmentType = 'SINGLE' | 'ROUND_ROBIN';

export interface BulkAssignPreviewLead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  createdAt: string;
  nextFollowUpAt: string | null;
  assignedTo: { id: string; label: string } | null;
  stage: { id: string; name: string } | null;
  source: { id: string; name: string } | null;
  lifecycle: { id: string; name: string } | null;
}

export interface BulkAssignPreviewResponse {
  success: boolean;
  count: number;
  sampleLeads: BulkAssignPreviewLead[];
}

export interface BulkAssignPayload {
  filters: BulkAssignFilters;
  assignmentType: BulkAssignAssignmentType;
  assignTo?: string;
  assignToIds?: string[];
}

export interface BulkAssignProgress {
  current: number;
  total: number;
  status: 'IDLE' | 'PREPARING' | 'IN_PROGRESS' | 'COMPLETED' | 'PARTIAL' | 'FAILED';
  transport: 'SYNC_READY_FOR_WEBSOCKET';
}

export interface BulkAssignResultSummary {
  updatedCount: number;
  failedCount: number;
  failedLeadIds: string[];
  assignmentType: BulkAssignAssignmentType;
}

export interface BulkAssignResponse {
  success: boolean;
  message: string;
  updated_count: number;
  failed_count: number;
  failed_lead_ids: string[];
  assignment_type: BulkAssignAssignmentType;
  progress: BulkAssignProgress;
}

export type LeadApprovalStatus = 'PENDING' | 'APPROVED' | 'DENIED';
export type LeadApprovalAction = 'APPROVE' | 'DENY';

export interface LeadApprovalActor {
  id: string;
  name?: string | null;
  username?: string | null;
  email?: string | null;
  displayName?: string;
}

export interface LeadApprovalListItem {
  id: string;
  status: LeadApprovalStatus;
  comment?: string | null;
  requestData?: Record<string, unknown> | null;
  approvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  lead: {
    id: string;
    name: string;
    email?: string | null;
    phone?: string | null;
    approvalState?: 'NONE' | 'PENDING';
  } | null;
  fromStage: {
    id: string;
    name: string;
  } | null;
  toStage: {
    id: string;
    name: string;
    isLOB?: boolean;
    isClosed?: boolean;
  } | null;
  requestedBy: LeadApprovalActor | null;
  assignedTo: LeadApprovalActor | null;
  approvedBy?: LeadApprovalActor | null;
}

export interface LeadApprovalFilters {
  search?: string;
  status?: LeadApprovalStatus | '';
  dateFrom?: string;
  dateTo?: string;
}

export interface LeadApprovalListResponse {
  success: boolean;
  message: string;
  data: LeadApprovalListItem[];
  pagination: LeadPagination;
}

export interface LeadApprovalActionPayload {
  action: LeadApprovalAction;
  comment: string;
}

export interface LeadDynamicValuePayload {
  fieldId: string;
  value: string;
}

export interface LeadFormValues {
  name: string;
  email: string;
  phone: string;
  companyName: string;
  address: string;
  assignedToId: string;
  stageId: string;
  lifecycleId: string;
  sourceId: string;
  nextFollowUpAt: string;
  nextFollowUpType: FollowUpType;
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
  lobReasons: LeadOption[];
  dynamicFields: LeadDynamicField[];
  canAssignOtherUsers: boolean;
}
