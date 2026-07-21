import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export type LeadLatestActivityResponse = {
  latestFollowUpNote: { text: string; createdAt: string } | null;
  latestLeadRemark: { text: string; createdAt: string } | null;
};

const fetchLeadLatestActivity = async (leadId: string): Promise<LeadLatestActivityResponse> => {
  const { data } = await api.get<LeadLatestActivityResponse>(`/leads/${leadId}/latest-activity`);
  return data;
};

export const useLeadLatestActivityQuery = (leadId: string | null) => {
  return useQuery({
    queryKey: ['lead-latest-activity', leadId],
    queryFn: () => fetchLeadLatestActivity(leadId!),
    enabled: !!leadId,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};
