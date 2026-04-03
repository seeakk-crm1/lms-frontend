import api from './api';
import { getLifeCycles } from './admin/lead-life-cycle/leadLifeCycleService';
import { getLeadSources } from './leadSource.api';
import { getLeadStages } from './leadStage.api';
import { getUsers } from './users.api';
import type {
  BulkAssignFilters,
  BulkAssignPayload,
  BulkAssignPreviewResponse,
  BulkAssignResponse,
  ClosedLeadListResponse,
  ExtendLeadSlaPayload,
  LeadCreatePayload,
  LeadDynamicValuePayload,
  LeadOption,
  UpdateClosedLeadPayload,
  LeadUpdatePayload,
  ListLeadsResponse,
} from '../types/lead.types';
import type { LeadDynamicField } from '../modules/admin/lead-dynamics/types';
import type { LeadLifeCycle } from '../types/admin/lead-life-cycle/leadLifeCycle.types';
import type { LeadSource } from '../types/leadSource.types';
import type { LeadStage } from '../types/leadStage.types';

const getSettledValue = <T>(result: PromiseSettledResult<T>, fallback: T): T =>
  result.status === 'fulfilled' ? result.value : fallback;

const mapBulkAssignFiltersToApi = (filters: BulkAssignFilters) => ({
  stage_id: filters.stageId || undefined,
  assigned_to: filters.assignedTo || undefined,
  lifecycle_id: filters.lifecycleId || undefined,
  source_id: filters.sourceId || undefined,
  followup_date_from: filters.followupDateFrom || undefined,
  followup_date_to: filters.followupDateTo || undefined,
  created_date_from: filters.createdDateFrom || undefined,
  created_date_to: filters.createdDateTo || undefined,
});

const mapAssignmentPayloadToApi = (payload: BulkAssignPayload) => ({
  filters: mapBulkAssignFiltersToApi(payload.filters),
  assignment_type: payload.assignmentType,
  assign_to: payload.assignTo || undefined,
  assign_to_ids: payload.assignToIds?.length ? payload.assignToIds : undefined,
});

export const getLeads = async (params: Record<string, unknown>): Promise<ListLeadsResponse> => {
  const response = await api.get('/leads', { params });
  return response.data;
};

export const createLead = async (payload: LeadCreatePayload) => {
  const response = await api.post('/leads', payload);
  return response.data;
};

export const getLeadById = async (id: string) => {
  const response = await api.get(`/leads/${id}`);
  return response.data;
};

export const updateLead = async (id: string, payload: LeadUpdatePayload) => {
  const response = await api.put(`/leads/${id}`, payload);
  return response.data;
};

export const deleteLead = async (id: string) => {
  const response = await api.delete(`/leads/${id}`);
  return response.data;
};

export const changeLeadStage = async (
  id: string,
  payload: { stageId: string; reasonId?: string; remarks?: string; nextFollowUpAt?: string; followUpDescription?: string },
) => {
  const response = await api.patch(`/leads/${id}/stage`, payload);
  return response.data;
};

export const extendLeadSla = async (id: string, payload: ExtendLeadSlaPayload) => {
  const response = await api.patch(`/leads/${id}/sla/extend`, payload);
  return response.data;
};

export const previewBulkAssign = async (filters: BulkAssignFilters): Promise<BulkAssignPreviewResponse> => {
  const response = await api.post('/leads/bulk-assign/preview', {
    ...mapBulkAssignFiltersToApi(filters),
    sample_limit: 5,
  });
  return response.data;
};

export const bulkAssignLeads = async (payload: BulkAssignPayload): Promise<BulkAssignResponse> => {
  const response = await api.post('/leads/bulk-assign', mapAssignmentPayloadToApi(payload));
  return response.data;
};

export const assignLead = async (id: string, payload: { assignedToId: string | null }) => {
  const response = await api.patch(`/leads/${id}/assign`, payload);
  return response.data;
};

export const exportLeads = async (params: Record<string, unknown>) => {
  const response = await api.get('/leads/export', {
    params,
    responseType: 'blob',
  });
  return response;
};

export const getClosedLeads = async (params: Record<string, unknown>): Promise<ClosedLeadListResponse> => {
  const response = await api.get('/leads/closed', { params });
  return response.data;
};

export const updateClosedLead = async (id: string, payload: UpdateClosedLeadPayload) => {
  const response = await api.patch(`/leads/${id}/closure`, payload);
  return response.data;
};

export const reopenLead = async (id: string) => {
  const response = await api.patch(`/leads/${id}/reopen`);
  return response.data;
};

export const exportClosedLeads = async (params: Record<string, unknown>) => {
  const response = await api.get('/leads/closed/export', {
    params,
    responseType: 'blob',
  });
  return response;
};

export const getActiveLeadDynamicFields = async (): Promise<LeadDynamicField[]> => {
  const response = await api.get('/lead-dynamics/active');
  return response.data?.data || [];
};

export const saveLeadDynamicValues = async (leadId: string, values: LeadDynamicValuePayload[]) => {
  const response = await api.post(`/leads/${leadId}/dynamic-values`, { values });
  return response.data;
};

const mapUserOptions = (users: any[]): LeadOption[] =>
  users
    .filter((user) => user?.isActive !== false)
    .map((user) => ({
      id: user.id,
      label: user.name || user.username || user.email,
      subtitle: user.email,
    }));

const mapSourceOptions = (sources: LeadSource[]): LeadOption[] =>
  sources
    .filter((source) => source.status === 'ACTIVE')
    .map((source) => ({
      id: source.id,
      label: source.name,
    }));

const mapStageOptions = (stages: LeadStage[]) =>
  stages
    .filter((stage) => stage.status === 'ACTIVE')
    .sort((left, right) => left.stageOrder - right.stageOrder)
    .map((stage) => ({
      id: stage.id,
      label: stage.name,
      color: stage.color,
      isLOB: stage.isLOB,
      isClosed: stage.isClosed,
    }));

const mapLifeCycleOptions = (lifeCycles: LeadLifeCycle[]) =>
  lifeCycles.map((lifeCycle) => ({
    id: lifeCycle.id,
    label: lifeCycle.name,
    isDefault: lifeCycle.isDefault,
    transitions: lifeCycle.transitions,
  }));

export const getLeadMeta = async () => {
  const [usersResult, sourcesResult, stagesResult, lifeCyclesResult, dynamicFieldsResult] = await Promise.allSettled([
    getUsers({ page: 1, limit: 100, isActive: true }),
    getLeadSources({ page: 1, limit: 100, search: '', status: 'ACTIVE' }),
    getLeadStages({ page: 1, limit: 100, search: '', status: 'ACTIVE' }),
    getLifeCycles({ page: 1, limit: 100 }),
    getActiveLeadDynamicFields(),
  ]);

  const usersData = getSettledValue(usersResult, { users: [] as any[] });
  const sourcesData = getSettledValue(sourcesResult, { data: [] as LeadSource[] });
  const stagesData = getSettledValue(stagesResult, { data: [] as LeadStage[] });
  const lifeCyclesData = getSettledValue(lifeCyclesResult, {
    data: { lifeCycles: [] as LeadLifeCycle[] },
  });
  const dynamicFields = getSettledValue(dynamicFieldsResult, [] as LeadDynamicField[]);

  return {
    users: mapUserOptions(usersData?.users || []),
    sources: mapSourceOptions(sourcesData?.data || []),
    stages: mapStageOptions(stagesData?.data || []),
    lifeCycles: mapLifeCycleOptions(lifeCyclesData?.data?.lifeCycles || []),
    dynamicFields,
  };
};
