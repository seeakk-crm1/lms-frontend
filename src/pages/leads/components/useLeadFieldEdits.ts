import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';

export interface FieldEditSummary {
  id: string;
  leadId: string;
  fieldKey: string;
  editCount: number;
  updatedAt: string;
}

export interface FieldEditHistory {
  id: string;
  leadId: string;
  fieldKey: string;
  oldValue: string | null;
  newValue: string | null;
  changedById: string;
  changedAt: string;
  editNumber: number;
  reason: string | null;
  changedBy: {
    id: string;
    name: string;
  };
}

export interface LeadFieldEditsResponse {
  summaries: FieldEditSummary[];
  histories: FieldEditHistory[];
}

export const useLeadFieldEdits = (leadId?: string) => {
  return useQuery({
    queryKey: ['lead-field-edits', leadId],
    queryFn: async () => {
      if (!leadId) return { summaries: [], histories: [] };
      const response = await api.get(`/leads/${leadId}/field-edits`);
      return response.data as LeadFieldEditsResponse;
    },
    enabled: !!leadId,
  });
};
