import api from './api';
import { getLifeCycles } from './admin/lead-life-cycle/leadLifeCycleService';
import { getLeadSources } from './leadSource.api';
import { getLeadStages } from './leadStage.api';
import { getUsers } from './users.api';
import type {
  LeadCreatePayload,
  LeadDynamicValuePayload,
  LeadOption,
  LeadUpdatePayload,
  ListLeadsResponse,
} from '../types/lead.types';
import type { LeadDynamicField } from '../modules/admin/lead-dynamics/types';
import type { LeadLifeCycle } from '../types/admin/lead-life-cycle/leadLifeCycle.types';
import type { LeadSource } from '../types/leadSource.types';
import type { LeadStage } from '../types/leadStage.types';

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
  const [usersData, sourcesData, stagesData, lifeCyclesData, dynamicFields] = await Promise.all([
    getUsers({ page: 1, limit: 100, isActive: true }),
    getLeadSources({ page: 1, limit: 100, search: '', status: 'ACTIVE' }),
    getLeadStages({ page: 1, limit: 100, search: '', status: 'ACTIVE' }),
    getLifeCycles({ page: 1, limit: 100 }),
    getActiveLeadDynamicFields(),
  ]);

  return {
    users: mapUserOptions(usersData?.users || []),
    sources: mapSourceOptions(sourcesData?.data || []),
    stages: mapStageOptions(stagesData?.data || []),
    lifeCycles: mapLifeCycleOptions(lifeCyclesData?.data?.lifeCycles || []),
    dynamicFields,
  };
};
