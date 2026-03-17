import api from './api';
import { CreateLeadStageInput, LeadStageFilters, UpdateLeadStageInput } from '../types/leadStage.types';

type ApiStageRule = {
  field: string;
  condition: string;
  value?: string | null;
  isMandatory?: boolean;
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
  const { stageOrder, ...rest } = data;
  return {
    ...rest,
    ...(stageOrder !== undefined ? { order: stageOrder } : {}),
    ...(data.rules
      ? {
          rules: data.rules.map((rule) => ({
            field: rule.field,
            condition: rule.condition,
            ...(rule.value !== undefined ? { value: rule.value } : {}),
            ...(rule.isMandatory !== undefined ? { isMandatory: rule.isMandatory } : {}),
          })),
        }
      : {}),
  };
};

const mapFromApi = (item: ApiLeadStage) => ({
  ...item,
  stageOrder: item.order,
  rules: (item.rules || []).map((rule) => ({
    field: rule.field,
    condition: rule.condition,
    ...(rule.value !== undefined ? { value: rule.value } : {}),
    ...(rule.isMandatory !== undefined ? { isMandatory: rule.isMandatory } : {}),
  })),
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
