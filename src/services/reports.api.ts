import api from './api';
import type { ReportTypeListResponse } from '../modules/report-types/types/reportType.types';
import type {
  DownloadSavedReportResponse,
  GenerateSavedReportResponse,
  SavedReportMutationResponse,
  SavedReportPayload,
  SavedReportQueryParams,
  SavedReportsResponse,
} from '../modules/reports/types/report.types';

export const getSavedReports = async (params: SavedReportQueryParams): Promise<SavedReportsResponse> => {
  const response = await api.get('/reports', {
    params: {
      page: params.page,
      limit: params.limit,
      report_name: params.search || undefined,
      created_by: params.createdBy || undefined,
      status: params.status || undefined,
      is_active: params.isActive || undefined,
      report_type: params.reportTypeId || undefined,
      created_at_from: params.createdAtFrom || undefined,
      created_at_to: params.createdAtTo || undefined,
      report_date_from: params.reportDateFrom || undefined,
      report_date_to: params.reportDateTo || undefined,
    },
  });

  return response.data;
};

export const createSavedReport = async (payload: SavedReportPayload): Promise<SavedReportMutationResponse> => {
  const response = await api.post('/reports', payload);
  return response.data;
};

export const updateSavedReport = async (id: string, payload: Partial<SavedReportPayload>): Promise<SavedReportMutationResponse> => {
  const response = await api.put(`/reports/${id}`, payload);
  return response.data;
};

export const generateSavedReport = async (id: string): Promise<GenerateSavedReportResponse> => {
  const response = await api.post(`/reports/${id}/generate`);
  return response.data;
};

export const downloadSavedReport = async (id: string): Promise<DownloadSavedReportResponse> => {
  const response = await api.get(`/reports/${id}/download`);
  return response.data;
};

export const deleteSavedReport = async (id: string) => {
  const response = await api.delete(`/reports/${id}`);
  return response.data;
};

export const getActiveReportTypes = async (): Promise<ReportTypeListResponse> => {
  const response = await api.get('/report-types', {
    params: {
      page: 1,
      limit: 100,
      status: 'ACTIVE',
    },
  });
  return response.data;
};
