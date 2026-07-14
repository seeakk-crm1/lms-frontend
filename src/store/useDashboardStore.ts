import { create } from 'zustand';
import axios from 'axios';
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
    fetchDashboardData: (range?: DashboardRange, officeId?: string) => Promise<void>;
}

const createInitialDashboardSlice = (): Omit<DashboardState, 'reset' | 'setSelectedOfficeId' | 'fetchDashboardData'> => ({
    isLoading: true,
    isRefreshing: false,
    selectedRange: '7d',
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

const useDashboardStore = create<DashboardState>((set) => ({
    ...createInitialDashboardSlice(),

    reset: () => set(() => ({ ...createInitialDashboardSlice(), error: null })),
    setSelectedOfficeId: (officeId) => set({ selectedOfficeId: officeId }),

    fetchDashboardData: async (range, officeId) => {
        const state = useDashboardStore.getState();
        const requestedRange = range ?? state.selectedRange;
        const requestedOfficeId = officeId !== undefined ? officeId : state.selectedOfficeId;
        const hasExistingData = state.kpiData.length > 0;

        if (isFetchingAPI && requestedRange === state.selectedRange && requestedOfficeId === state.selectedOfficeId) {
            return;
        }

        isFetchingAPI = true;

        set({
            isLoading: hasExistingData ? false : true,
            isRefreshing: hasExistingData,
            error: null,
            selectedRange: requestedRange,
            selectedOfficeId: requestedOfficeId,
        });

        try {
            const response = await getDashboardSummary(requestedRange, requestedOfficeId);
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
