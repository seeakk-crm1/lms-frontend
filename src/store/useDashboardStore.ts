import { create } from 'zustand';
import axios from 'axios';
import { getDashboardSummary, type DashboardRange, type DashboardSummaryFilters } from '../services/dashboard.api';
import { formatCurrency } from '../utils/currency';

export interface KPIData {
    title: string;
    value: string;
    growth: string;
    trend: 'up' | 'down';
    iconName: string;
    format?: 'number' | 'currency';
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
    filters: DashboardSummaryFilters;
    selectedOfficeId?: string;
    scheduleDateLabel: string;
    kpiData: KPIData[];
    leadGrowthData: LeadGrowthData[];
    pipelineData: PipelineData[];
    activities: Activity[];
    lobData: LOBData[];
    meetings: Meeting[];
    error: string | null;
    reset: () => void;
    setSelectedOfficeId: (officeId?: string) => void;
    setFilters: (filters: Partial<DashboardSummaryFilters>) => void;
    fetchDashboardData: (filters?: Partial<DashboardSummaryFilters>) => Promise<void>;
}

const initialFilters: DashboardSummaryFilters = {
    range: '7d',
};

const createInitialDashboardSlice = (): Omit<DashboardState, 'reset' | 'setSelectedOfficeId' | 'setFilters' | 'fetchDashboardData'> => ({
    isLoading: true,
    isRefreshing: false,
    selectedRange: '7d',
    filters: initialFilters,
    selectedOfficeId: undefined,
    scheduleDateLabel: '',
    kpiData: [],
    leadGrowthData: [],
    pipelineData: [],
    activities: [],
    lobData: [],
    meetings: [],
    error: null,
});

let isFetchingAPI = false;
let dashboardRequestSequence = 0;

const useDashboardStore = create<DashboardState>((set) => ({
    ...createInitialDashboardSlice(),

    reset: () => set(() => ({ ...createInitialDashboardSlice(), error: null })),
    setSelectedOfficeId: (officeId) => set((state) => ({
        selectedOfficeId: officeId,
        filters: { ...state.filters, officeId },
    })),
    setFilters: (patch) => set((state) => {
        const nextFilters = { ...state.filters, ...patch };
        return {
            filters: nextFilters,
            selectedRange: nextFilters.range,
            selectedOfficeId: nextFilters.officeId,
        };
    }),

    fetchDashboardData: async (patch) => {
        const state = useDashboardStore.getState();
        const requestedFilters = {
            ...state.filters,
            ...(patch || {}),
        };
        const requestedRange = requestedFilters.range;
        const requestedOfficeId = requestedFilters.officeId;
        const hasExistingData = state.kpiData.length > 0;
        const requestId = dashboardRequestSequence + 1;
        dashboardRequestSequence = requestId;

        if (isFetchingAPI && JSON.stringify(requestedFilters) === JSON.stringify(state.filters)) {
            return;
        }

        isFetchingAPI = true;

        set({
            isLoading: true,
            isRefreshing: hasExistingData,
            error: null,
            selectedRange: requestedRange,
            selectedOfficeId: requestedOfficeId,
            filters: requestedFilters,
            kpiData: [],
        });

        try {
            const response = await getDashboardSummary(requestedFilters);
            if (requestId !== dashboardRequestSequence) return;
            const dashboard = response.data;

            set({
                isLoading: false,
                isRefreshing: false,
                scheduleDateLabel: dashboard.scheduleDateLabel,
                kpiData: dashboard.kpis.map((kpi) => ({
                    ...kpi,
                    value: kpi.format === 'currency'
                        ? formatCurrency(kpi.value)
                        : new Intl.NumberFormat('en-US').format(kpi.value),
                })),
                leadGrowthData: dashboard.leadGrowth,
                pipelineData: dashboard.pipeline,
                activities: dashboard.activities,
                lobData: dashboard.lob,
                meetings: dashboard.meetings,
            });
        } catch (error) {
            if (requestId !== dashboardRequestSequence) return;
            const message = axios.isAxiosError(error)
                ? (error.response?.data?.message || error.response?.data?.error || error.message)
                : "Failed to load dashboard data";
            set({
                error: String(message || "Failed to load dashboard data"),
                isLoading: false,
                isRefreshing: false,
            });
        } finally {
            isFetchingAPI = false;
        }
    }
}));

export default useDashboardStore;
