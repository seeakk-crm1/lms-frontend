import api from './api';

export interface FollowupContextData {
  leadRemarks: string | null;
  lastCompletedFollowup: {
    note: string;
    completedBy: string;
    completedAt: string;
  } | null;
}

export const getLeadFollowupContext = async (leadId: string): Promise<FollowupContextData> => {
  const { data } = await api.get(`/followups/lead-context/${leadId}`);
  return data.data;
};
