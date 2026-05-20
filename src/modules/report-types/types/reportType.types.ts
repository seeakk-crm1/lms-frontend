export type ReportTypeStatus = 'ACTIVE' | 'INACTIVE';
export type ReportModule = 'LEADS' | 'USERS' | 'REPORTS' | 'TARGETS' | 'FOLLOWUPS' | 'ACTIVITY';
export type ReportBaseDataSource = 'LEADS' | 'USERS' | 'FOLLOWUPS' | 'ACTIVITY';
export type AllowedReportFilterKey =
  | 'stage'
  | 'assignee'
  | 'lead_source'
  | 'created_date'
  | 'follow_up_date'
  | 'role'
  | 'department'
  | 'office'
  | 'status'
  | 'user'
  | 'module'
  | 'action';

export interface ReportTypeActor {
  id: string;
  name?: string | null;
  username?: string | null;
  email?: string | null;
  displayName?: string | null;
}

export interface ReportType {
  id: string;
  workspaceId: string;
  name: string;
  module: ReportModule;
  modules?: ReportModule[];
  baseDataSource: ReportBaseDataSource;
  baseDataSources?: ReportBaseDataSource[];
  description: string | null;
  allowedFilters: AllowedReportFilterKey[];
  status: ReportTypeStatus;
  category?: string;
  categories?: string[];
  trackModules?: string[];
  enableUserFilter?: boolean;
  enableDateFilter?: boolean;
  trackActivityTypes?: string[];
  allowExport?: boolean;
  showSummary?: boolean;
  showDetailedLogs?: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: ReportTypeActor | null;
  updatedBy: ReportTypeActor | null;
}

export interface ReportTypeListResponse {
  data: ReportType[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ReportTypeFilters {
  status?: ReportTypeStatus | '';
  module?: ReportModule | '';
}

export interface ReportTypeQueryParams extends ReportTypeFilters {
  page: number;
  limit: number;
  search?: string;
}

export interface ReportTypePayload {
  name: string;
  module: ReportModule;
  modules?: ReportModule[];
  baseDataSource: ReportBaseDataSource;
  baseDataSources?: ReportBaseDataSource[];
  description?: string;
  allowedFilters: AllowedReportFilterKey[];
  status?: ReportTypeStatus;
  category?: string;
  categories?: string[];
  trackModules?: string[];
  enableUserFilter?: boolean;
  enableDateFilter?: boolean;
  trackActivityTypes?: string[];
  allowExport?: boolean;
  showSummary?: boolean;
  showDetailedLogs?: boolean;
}

export interface ReportExecutionFilter {
  key: AllowedReportFilterKey;
  value: string[] | { from?: string; to?: string };
}

export interface GeneratedReportResponse {
  success: boolean;
  reportType: ReportType;
  rows: Array<Record<string, unknown>>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
