import { create } from 'zustand';
import { getDashboardSummary, type DashboardRange } from '../services/dashboard.api';

export interface KPIData {
    title: string;
    value: string;
    growth: string;
    trend: 'up' | 'down';
    iconName: string;
}

export interface LeadGrowthData {
    name: string;
    leads: number;
}

export interface PipelineData {
    name: string;
    count: number;
    percent: number;
    color: string;
}

export interface Activity {
    id: string;
    user: string;
    action: string;
    target: string;
    time: string;
    avatar: string | null;
    status: string;
}

export interface LOBData {
    name: string;
    lost: number;
}

export interface Meeting {
    id: string;
    title: string;
    time: string;
    type: string;
}

interface DashboardState {
    isLoading: boolean;
    isRefreshing: boolean;
    selectedRange: DashboardRange;
    scheduleDateLabel: string;
    kpiData: KPIData[];
    leadGrowthData: LeadGrowthData[];
    pipelineData: PipelineData[];
    activities: Activity[];
    lobData: LOBData[];
    meetings: Meeting[];
    error: string | null;
    fetchDashboardData: (range?: DashboardRange) => Promise<void>;
}

const useDashboardStore = create<DashboardState>((set) => ({
    isLoading: true,
    isRefreshing: false,
    selectedRange: '7d',
    scheduleDateLabel: '',
    kpiData: [],
    leadGrowthData: [],
    pipelineData: [],
    activities: [],
    lobData: [],
    meetings: [],
    error: null,

    fetchDashboardData: async (range) => {
        const requestedRange = range ?? useDashboardStore.getState().selectedRange;
        const hasExistingData = useDashboardStore.getState().kpiData.length > 0;

        set({
            isLoading: hasExistingData ? false : true,
            isRefreshing: hasExistingData,
            error: null,
            selectedRange: requestedRange,
        });

        try {
            const response = await getDashboardSummary(requestedRange);
            const dashboard = response.data;

            set({
                isLoading: false,
                isRefreshing: false,
                scheduleDateLabel: dashboard.scheduleDateLabel,
                kpiData: dashboard.kpis.map((kpi) => ({
                    ...kpi,
                    value: new Intl.NumberFormat('en-US').format(kpi.value),
                })),
                leadGrowthData: dashboard.leadGrowth,
                pipelineData: dashboard.pipeline,
                activities: dashboard.activities,
                lobData: dashboard.lob,
                meetings: dashboard.meetings,
            });
        } catch (error) {
            set({
                error: "Failed to load dashboard data",
                isLoading: false,
                isRefreshing: false,
            });
        }
    }
}));

export default useDashboardStore;
