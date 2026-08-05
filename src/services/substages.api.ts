import api from './api';

export interface LeadSubstage {
  id: string;
  workspaceId: string;
  leadStageId: string;
  name: string;
  description?: string;
  sortOrder: number;
  status: 'ACTIVE' | 'INACTIVE';
  connectionStatusRestriction?: 'CONNECTED' | 'NOT_CONNECTED' | null;
  outcomeCategory?: 'POSITIVE' | 'FOLLOW_UP' | 'NEGATIVE' | 'NEUTRAL' | null;
  leadStage?: {
    id: string;
    name: string;
    color: string;
    order: number;
    isApprovalRequired: boolean;
    isLOB: boolean;
    isClosed: boolean;
  };
}

export interface GroupedSubstages {
  id: string;
  name: string;
  color: string;
  order: number;
  isApprovalRequired: boolean;
  isLOB: boolean;
  isClosed: boolean;
  substages: LeadSubstage[];
}

export const fetchSubstages = async (leadStageId?: string): Promise<LeadSubstage[]> => {
  const params = leadStageId ? { leadStageId } : {};
  const res = await api.get<{ success: boolean; data: LeadSubstage[] }>('/master/lead-substages', { params });
  return res.data.data;
};

export const fetchGroupedSubstages = async (): Promise<GroupedSubstages[]> => {
  const res = await api.get<{ success: boolean; data: GroupedSubstages[] }>('/master/lead-substages/grouped');
  return res.data.data;
};

export const createSubstage = async (payload: {
  leadStageId: string;
  name: string;
  description?: string;
  sortOrder?: number;
  connectionStatusRestriction?: 'CONNECTED' | 'NOT_CONNECTED' | null;
  outcomeCategory?: 'POSITIVE' | 'FOLLOW_UP' | 'NEGATIVE' | 'NEUTRAL' | null;
}): Promise<LeadSubstage> => {
  const res = await api.post<{ success: boolean; data: LeadSubstage }>('/master/lead-substages', payload);
  return res.data.data;
};

export const updateSubstage = async (
  id: string,
  payload: Partial<{
    name: string;
    description?: string | null;
    sortOrder?: number;
    connectionStatusRestriction?: 'CONNECTED' | 'NOT_CONNECTED' | null;
    outcomeCategory?: 'POSITIVE' | 'FOLLOW_UP' | 'NEGATIVE' | 'NEUTRAL' | null;
  }>,
): Promise<LeadSubstage> => {
  const res = await api.put<{ success: boolean; data: LeadSubstage }>(`/master/lead-substages/${id}`, payload);
  return res.data.data;
};

export const toggleSubstageStatus = async (id: string): Promise<LeadSubstage> => {
  const res = await api.patch<{ success: boolean; data: LeadSubstage }>(`/master/lead-substages/${id}/status`);
  return res.data.data;
};

export const deleteSubstage = async (id: string): Promise<void> => {
  await api.delete(`/master/lead-substages/${id}`);
};
