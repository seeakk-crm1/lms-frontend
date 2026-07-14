import api from './api';
import type {
  FollowupLatestNoteItem,
  FollowupPerformanceItem,
} from '../modules/reports/shared/followupReport.types';

export interface SummaryFilters {
  startDate?: string;
  endDate?: string;
  userId?: string | string[];
  role?: string;
  leadSource?: string;
  leadStage?: string;
  branchId?: string;
  officeId?: string;
  departmentId?: string;
  page?: number;
  limit?: number;
}

const buildQuery = (filters: SummaryFilters) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      if (Array.isArray(value)) {
        value.forEach(v => params.append(key, v));
      } else {
        params.append(key, value.toString());
      }
    }
  });
  return params.toString();
};

export const fetchOverviewCard = async (filters: SummaryFilters) => {
  const { data } = await api.get(`/reports/summary/overview-card?${buildQuery(filters)}`);
  return data.data;
};

export const fetchTimeline = async (filters: SummaryFilters) => {
  const { data } = await api.get(`/reports/summary/timeline?${buildQuery(filters)}`);
  return data;
};

export const fetchLeadsSummary = async (filters: SummaryFilters) => {
  const { data } = await api.get(`/reports/summary/leads?${buildQuery(filters)}`);
  return data;
};

export const fetchFollowupsSummary = async (filters: SummaryFilters) => {
  const { data } = await api.get(`/reports/summary/followups?${buildQuery(filters)}`);
  return data;
};

export const fetchFollowupsDetailReport = async (filters: SummaryFilters) => {
  const { data } = await api.get(`/reports/summary/followups/detail?${buildQuery(filters)}`);
  return data;
};

export const fetchFollowupsPerformanceReport = async (filters: SummaryFilters): Promise<FollowupPerformanceItem[]> => {
  const { data } = await api.get(`/reports/summary/followups/performance?${buildQuery(filters)}`);
  return data.data;
};

export const fetchFollowupsLatestNotesReport = async (filters: SummaryFilters): Promise<FollowupLatestNoteItem[]> => {
  const { data } = await api.get(`/reports/summary/followups/latest-notes?${buildQuery(filters)}`);
  return data.data;
};

export const fetchExtensionsSummary = async (filters: SummaryFilters) => {
  const { data } = await api.get(`/reports/summary/extensions?${buildQuery(filters)}`);
  return data;
};

export const fetchStageMovementsSummary = async (filters: SummaryFilters) => {
  const { data } = await api.get(`/reports/summary/stage-movements?${buildQuery(filters)}`);
  return data;
};

export const fetchRevenueSummary = async (filters: SummaryFilters) => {
  const { data } = await api.get(`/reports/summary/revenue?${buildQuery(filters)}`);
  return data;
};

export const fetchAttendanceSummary = async (filters: SummaryFilters) => {
  const { data } = await api.get(`/reports/summary/attendance?${buildQuery(filters)}`);
  return data;
};

export const fetchTargetsSummary = async (filters: SummaryFilters) => {
  const { data } = await api.get(`/reports/summary/targets?${buildQuery(filters)}`);
  return data;
};

export const fetchAuditSummary = async (filters: SummaryFilters) => {
  const { data } = await api.get(`/reports/summary/audit?${buildQuery(filters)}`);
  return data;
};

export const fetchLeadUpdates = async (filters: SummaryFilters) => {
  const { data } = await api.get(`/reports/summary/lead-updates?${buildQuery(filters)}`);
  return data;
};

export const fetchApprovalsSummary = async (filters: SummaryFilters) => {
  const { data } = await api.get(`/reports/summary/approvals?${buildQuery(filters)}`);
  return data;
};

export const fetchCompanySummary = async (filters: SummaryFilters) => {
  const { data } = await api.get(`/reports/summary/company-summary?${buildQuery(filters)}`);
  return data;
};
