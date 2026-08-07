import { endOfDay, startOfDay } from 'date-fns';
import type { SummaryFilters } from '../../../services/summaryReports.api';

export type ReportUserMode = 'all' | 'single' | 'multiple';

export interface ReportFilterState extends SummaryFilters {
  userMode?: ReportUserMode;
  supervisorId?: string;
  substageIds?: string[];
  revenueMin?: string;
}

export const createDefaultReportFilters = (): ReportFilterState => ({
  startDate: startOfDay(new Date()).toISOString(),
  endDate: endOfDay(new Date()).toISOString(),
  userId: undefined,
  userMode: 'all',
  page: 1,
  limit: 20,
});
