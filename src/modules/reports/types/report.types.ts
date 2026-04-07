import type { AllowedReportFilterKey, ReportType } from '../../report-types/types/reportType.types';

export type ReportRunStatus = 'completed' | 'pending';

export interface SavedReportFilter {
  id: string;
  key: AllowedReportFilterKey;
  value: unknown;
  createdAt: string;
}

export interface SavedReportActor {
  id: string;
  name?: string | null;
  username?: string | null;
  email?: string | null;
  displayName?: string | null;
}

export interface SavedReport {
  id: string;
  workspaceId: string;
  reportName: string;
  reportTypeId: string;
  reportDate: string;
  isActive: boolean;
  isGenerated: boolean;
  generatedFileUrl: string | null;
  generatedAt: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  reportType: ReportType | null;
  createdBy: SavedReportActor | null;
  filters: SavedReportFilter[];
}

export interface SavedReportsResponse {
  success: boolean;
  data: SavedReport[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SavedReportPayload {
  reportName: string;
  reportTypeId: string;
  reportDate: string;
  isActive: boolean;
  filters: Array<{
    key: AllowedReportFilterKey;
    value: string[] | { from?: string; to?: string };
  }>;
}

export interface SavedReportFilters {
  search?: string;
  createdBy?: string;
  status?: ReportRunStatus | '';
  isActive?: 'true' | 'false' | '';
  reportTypeId?: string;
  createdAtFrom?: string;
  createdAtTo?: string;
  reportDateFrom?: string;
  reportDateTo?: string;
}

export interface SavedReportQueryParams extends SavedReportFilters {
  page: number;
  limit: number;
}

export interface SavedReportMutationResponse {
  success: boolean;
  message: string;
  data: SavedReport;
}

export interface GenerateSavedReportResponse {
  success: boolean;
  message: string;
  fileUrl: string;
  report: SavedReport;
  execution: {
    reportType: ReportType;
    rows: Array<Record<string, unknown>>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface DownloadSavedReportResponse {
  success: boolean;
  fileUrl: string;
  report: SavedReport;
}
