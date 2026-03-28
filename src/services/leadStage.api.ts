import api from './api';
import { CreateLeadStageInput, LeadStageFilters, UpdateLeadStageInput } from '../types/leadStage.types';

type ApiStageRule = {
  id: string;
  name: string;
  inputType: 'TEXT' | 'TEXTAREA' | 'RADIO' | 'SELECT';
  sortOrder: number;
  required: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  stageId?: string | null;
};

type ApiLeadStage = {
  id: string;
  name: string;
  color: string;
  isApprovalRequired: boolean;
  isLOB: boolean;
  isClosed: boolean;
  order: number;
  rules: ApiStageRule[];
  status: 'ACTIVE' | 'INACTIVE';
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
};

const toApiPayload = (data: CreateLeadStageInput | UpdateLeadStageInput) => {
  const { stageOrder, ruleAssignments, ...rest } = data;
  return {
    ...rest,
    ...(stageOrder !== undefined ? { order: stageOrder } : {}),
    ...(ruleAssignments !== undefined ? { ruleAssignments } : {}),
  };
};

const mapFromApi = (item: ApiLeadStage) => ({
  ...item,
  stageOrder: item.order,
  rules: item.rules || [],
});

export const getLeadStages = async (params?: LeadStageFilters & { page?: number; limit?: number }) => {
  const response = await api.get('/master/lead-stages', { params });
  return {
    ...response.data,
    data: (response.data?.data || []).map(mapFromApi),
  };
};

export const createLeadStage = async (data: CreateLeadStageInput) => {
  const response = await api.post('/master/lead-stages', toApiPayload(data));
  return mapFromApi(response.data.data);
};

export const updateLeadStage = async (id: string, data: UpdateLeadStageInput) => {
  const response = await api.put(`/master/lead-stages/${id}`, toApiPayload(data));
  return mapFromApi(response.data.data);
};

export const deleteLeadStage = async (id: string) => {
  const response = await api.delete(`/master/lead-stages/${id}`);
  return response.data;
};
