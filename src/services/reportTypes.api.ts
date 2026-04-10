import api from './api';
import type {
  GeneratedReportResponse,
  ReportExecutionFilter,
  ReportTypeListResponse,
  ReportTypePayload,
  ReportTypeQueryParams,
  ReportTypeStatus,
} from '../modules/report-types/types/reportType.types';

export const getReportTypes = async (params: ReportTypeQueryParams): Promise<ReportTypeListResponse> => {
  const response = await api.get('/report-types', {
    params: {
      page: params.page,
      limit: params.limit,
      search: params.search || undefined,
      status: params.status || undefined,
      module: params.module || undefined,
    },
  });
  return response.data;
};

export const createReportType = async (payload: ReportTypePayload) => {
  const response = await api.post('/report-types', payload);
  return response.data;
};

export const updateReportType = async (id: string, payload: Partial<ReportTypePayload>) => {
  const response = await api.put(`/report-types/${id}`, payload);
  return response.data;
};

export const toggleReportType = async (id: string, status?: ReportTypeStatus) => {
  const response = await api.patch(`/report-types/${id}/status`, status ? { status } : {});
  return response.data;
};

export const deleteReportType = async (id: string) => {
  const response = await api.delete(`/report-types/${id}`);
  return response.data;
};

export const generateReport = async (payload: {
  reportTypeId: string;
  filters: ReportExecutionFilter[];
  page?: number;
  limit?: number;
}): Promise<GeneratedReportResponse> => {
  const response = await api.post('/reports/generate', {
    reportTypeId: payload.reportTypeId,
    filters: payload.filters,
    page: payload.page ?? 1,
    limit: payload.limit ?? 25,
  });
  return response.data;
};
