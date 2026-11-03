import { format } from 'date-fns';
import type { SummaryFilters } from '../../../services/summaryReports.api';

export type ReportUserMode = 'all' | 'single' | 'multiple';

export interface ReportFilterState extends SummaryFilters {
  userMode?: ReportUserMode;
  supervisorId?: string;
  substageIds?: string[];
  revenueMin?: string;
}

export const createDefaultReportFilters = (): ReportFilterState => {
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  return {
    startDate: todayStr,
    endDate: todayStr,
    userId: undefined,
    userMode: 'all',
    page: 1,
    limit: 20,
  };
};
