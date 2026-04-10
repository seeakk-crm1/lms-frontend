import api from './api';
import type { LOBAuditResponse, LOBAnalysisFilters, LOBAnalysisSummary, LOBStageBreakdown } from '../modules/lob-analysis/types/lobAnalysis.types';

const mapFiltersToApi = (filters: LOBAnalysisFilters) => ({
  date_from: filters.dateFrom || undefined,
  date_to: filters.dateTo || undefined,
  stage: filters.stage || undefined,
  reason_id: filters.reasonId || undefined,
  user_id: filters.userId || undefined,
  location_id: filters.locationId || undefined,
});

export const getLOBAnalysisSummary = async (filters: LOBAnalysisFilters): Promise<{ success: boolean; data: LOBAnalysisSummary }> => {
  const response = await api.get('/lob-analysis/summary', {
    params: mapFiltersToApi(filters),
  });
  return response.data;
};

export const getLOBStageBreakdown = async (filters: LOBAnalysisFilters): Promise<{ success: boolean; data: LOBStageBreakdown }> => {
  const response = await api.get('/lob-analysis/stage-breakdown', {
    params: mapFiltersToApi(filters),
  });
  return response.data;
};

export const getLOBAuditTrail = async (
  filters: LOBAnalysisFilters & { page?: number; limit?: number },
): Promise<LOBAuditResponse> => {
  const response = await api.get('/lob-analysis/audit', {
    params: {
      ...mapFiltersToApi(filters),
      page: filters.page || 1,
      limit: filters.limit || 20,
    },
  });
  return response.data;
};
