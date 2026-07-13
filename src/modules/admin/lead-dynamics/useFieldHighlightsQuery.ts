import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';

export interface FieldHighlightConfig {
  id: string;
  workspaceId: string;
  fieldKey: string;
  isEnabled: boolean;
  updatedAt: string;
}

export const useFieldHighlightsQuery = () => {
  return useQuery({
    queryKey: ['field-highlights'],
    queryFn: async () => {
      const response = await api.get('/admin/field-highlights');
      return response.data as FieldHighlightConfig[];
    },
  });
};
