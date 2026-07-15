import api from './api';

export type DashboardRange = '7d' | '30d' | '12m';

export type DashboardStatusFilter = 'ACTIVE' | 'OPEN' | 'CLOSED' | 'LOB' | 'ARCHIVED';

export interface DashboardSummaryFilters {
  range: DashboardRange;
  officeId?: string;
  userId?: string;
  stageId?: string;
  sourceId?: string;
  status?: DashboardStatusFilter;
  dateFrom?: string;
  dateTo?: string;
}

export interface DashboardSummaryResponse {
  success: boolean;
  data: {
    kpis: Array<{
      title: string;
      value: number;
      growth: string;
      trend: 'up' | 'down';
      iconName: string;
      format?: 'number' | 'currency';
    }>;
    leadGrowth: Array<{
      name: string;
      leads: number;
    }>;
    pipeline: Array<{
      name: string;
      count: number;
      percent: number;
      color: string;
    }>;
    activities: Array<{
      id: string;
      user: string;
      action: string;
      target: string;
      time: string;
      avatar: string | null;
      status: 'assigned' | 'pending' | 'closed';
    }>;
    lob: Array<{
      name: string;
      lost: number;
    }>;
    meetings: Array<{
      id: string;
      title: string;
      time: string;
      type: string;
    }>;
    scheduleDateLabel: string;
    range: DashboardRange;
    pendingApprovals: number;
    expectedRevenue: number;
  };
}

const buildRequestKey = (filters: Record<string, unknown>): string =>
  JSON.stringify(
    Object.entries(filters)
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .sort(([a], [b]) => a.localeCompare(b)),
  );

const inFlightSummaryRequests = new Map<string, Promise<DashboardSummaryResponse>>();
const inFlightRevenueRequests = new Map<string, Promise<RevenueAnalyticsResponse>>();

export const getDashboardSummary = async (filters: DashboardSummaryFilters): Promise<DashboardSummaryResponse> => {
  const key = buildRequestKey(filters);
  const existing = inFlightSummaryRequests.get(key);
  if (existing) return existing;

  const request = api
    .get('/dashboard/summary', {
      params: filters,
    })
    .then((response) => response.data);

  inFlightSummaryRequests.set(key, request);
  try {
    return await request;
  } finally {
    inFlightSummaryRequests.delete(key);
  }
};

export interface RevenueAnalyticsFilters {
  dateFrom?: string;
  dateTo?: string;
  userId?: string;
  stageId?: string;
  sourceId?: string;
  status?: DashboardStatusFilter;
  supervisorId?: string;
  officeId?: string;
}

export interface RevenueAnalyticsResponse {
  success: boolean;
  data: {
    kpis: {
      totalRevenue: number;
      todayRevenue: number;
      thisMonthRevenue: number;
      thisYearRevenue: number;
    };
    graphs: {
      dailyRevenue: Array<{ name: string; revenue: number }>;
      monthlyRevenue: Array<{ name: string; revenue: number }>;
      yearlyRevenue: Array<{ name: string; revenue: number }>;
    };
    metrics: {
      revenueByUser: Array<{ id: string; name: string; email: string; amount: number }>;
      revenueByStage: Array<{ id: string; name: string; color: string; amount: number }>;
      revenueConversionTrends: Array<{ month: string; revenue: number; count: number }>;
      topPerformers: Array<{ id: string; name: string; email: string; amount: number }>;
    };
  };
}

export const getRevenueAnalytics = async (filters: RevenueAnalyticsFilters): Promise<RevenueAnalyticsResponse> => {
  const key = buildRequestKey(filters);
  const existing = inFlightRevenueRequests.get(key);
  if (existing) return existing;

  const request = api
    .get('/dashboard/revenue', {
      params: filters,
    })
    .then((response) => response.data);

  inFlightRevenueRequests.set(key, request);
  try {
    return await request;
  } finally {
    inFlightRevenueRequests.delete(key);
  }
};
