import api from './api';

export type DashboardRange = '7d' | '30d' | '12m';

export interface DashboardSummaryResponse {
  success: boolean;
  data: {
    kpis: Array<{
      title: string;
      value: number;
      growth: string;
      trend: 'up' | 'down';
      iconName: string;
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
  };
}

export const getDashboardSummary = async (range: DashboardRange): Promise<DashboardSummaryResponse> => {
  const response = await api.get('/dashboard/summary', {
    params: {
      range,
    },
  });

  return response.data;
};
