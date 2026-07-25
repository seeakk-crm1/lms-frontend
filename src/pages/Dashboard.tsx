import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import KPICards from '../components/dashboard/KPICards';
import LeadGrowthChart from '../components/dashboard/LeadGrowthChart';
import PipelineStages from '../components/dashboard/PipelineStages';
import QuickLeadWidget from '../components/dashboard/QuickLeadWidget';
import RecentActivityWidget from '../components/dashboard/RecentActivityWidget';
import LOBAnalysisWidget from '../components/dashboard/LOBAnalysisWidget';
import CalendarWidget from '../components/dashboard/CalendarWidget';
import useDashboardStore from '../store/useDashboardStore';
import useAuthStore from '../store/useAuthStore';
import FollowUpCapacityWidget from '../components/dashboard/FollowUpCapacityWidget';
import { hasAnyPermission, hasPermission } from '../utils/permission.util';
import OfficeFilterSelect from '../components/OfficeFilterSelect';
import { canUseOfficeFilter } from '../utils/officeFilterAccess';
import SearchableSelect, { type Option } from '../components/SearchableSelect';
import { getLeadMeta, getLeadAssignees } from '../services/leads.api';
import { getUsers } from '../services/users.api';
import type { DashboardSummaryFilters, DashboardStatusFilter } from '../services/dashboard.api';

interface DashboardProps {
    mode?: 'admin' | 'operations';
}

type DashboardFilterMeta = {
    stages: Option[];
    sources: Option[];
};

let filterMetaRequest: Promise<DashboardFilterMeta> | null = null;
const userOptionsRequests = new Map<string, Promise<Option[]>>();

const loadDashboardFilterMeta = (): Promise<DashboardFilterMeta> => {
    if (!filterMetaRequest) {
        filterMetaRequest = getLeadMeta()
            .then((meta) => ({
                stages: (meta.stages || []).map((item: any) => ({ value: item.id, label: item.label })),
                sources: (meta.sources || []).map((item: any) => ({ value: item.id, label: item.label })),
            }))
            .catch((error) => {
                filterMetaRequest = null;
                throw error;
            });
    }
    return filterMetaRequest;
};

const loadDashboardUserOptions = (officeId?: string): Promise<Option[]> => {
    const key = officeId || 'ALL';
    const existing = userOptionsRequests.get(key);
    if (existing) return existing;

    const request = getLeadAssignees()
        .then((payload) => {
            const rawUsers = payload?.data || payload?.users || (Array.isArray(payload) ? payload : []);
            return rawUsers
                .filter((item: any) => item?.isActive !== false)
                .map((item: any) => ({
                    value: item.id,
                    label: item.name || item.username || item.email,
                }));
        })
        .catch(() =>
            getUsers({
                page: 1,
                limit: 500,
                isActive: true,
                officeId,
            }).then((payload) => {
                const users = payload?.users || [];
                return users
                    .filter((item: any) => item?.isActive !== false)
                    .map((item: any) => ({
                        value: item.id,
                        label: item.name || item.username || item.email,
                    }));
            })
        )
        .finally(() => {
            userOptionsRequests.delete(key);
        });

    userOptionsRequests.set(key, request);
    return request;
};

const Dashboard: React.FC<DashboardProps> = ({ mode = 'operations' }) => {
    const fetchDashboardData = useDashboardStore((state) => state.fetchDashboardData);
    const clearFilters = useDashboardStore((state) => state.clearFilters);
    const dashboardFilters = useDashboardStore((state) => state.filters);
    const selectedOfficeId = useDashboardStore((state) => state.selectedOfficeId);
    const error = useDashboardStore((state) => state.error);
    const user = useAuthStore((state) => state.user);
    const [filterMeta, setFilterMeta] = useState<DashboardFilterMeta>({ stages: [], sources: [] });
    const [userOptions, setUserOptions] = useState<Option[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const selectedUserIdRef = useRef(dashboardFilters.userId);

    const handleClearFilters = useCallback(() => {
        selectedUserIdRef.current = undefined;
        clearFilters();
    }, [clearFilters]);

    const canSeeMetrics = hasAnyPermission(user?.permissions || [], [
        'LEADS_VIEW_ALL',
        'LEADS_VIEW_OWN',
        'LEADS_VIEW_TEAM',
        'REPORTS_VIEW',
        'LOB_ANALYSIS_VIEW',
        'USERS_VIEW',
        'SYSTEM_CONFIG',
        'DASHBOARD_VIEW_OWN',
        'DASHBOARD_VIEW_ASSIGNED',
        'DASHBOARD_VIEW_ALL',
        'DASHBOARD_VIEW_OWN_OFFICE',
        'DASHBOARD_VIEW_ASSIGNED_OFFICES',
        'DASHBOARD_VIEW_ALL_OFFICES',
    ]);
    const canSeeGrowth = hasAnyPermission(user?.permissions || [], [
        'LEADS_VIEW_ALL',
        'LEADS_VIEW_OWN',
        'LEADS_VIEW_TEAM',
        'REPORTS_VIEW',
        'LOB_ANALYSIS_VIEW',
        'DASHBOARD_VIEW_OWN',
        'DASHBOARD_VIEW_ASSIGNED',
        'DASHBOARD_VIEW_ALL',
        'DASHBOARD_VIEW_OWN_OFFICE',
        'DASHBOARD_VIEW_ASSIGNED_OFFICES',
        'DASHBOARD_VIEW_ALL_OFFICES',
    ]);
    const canQuickAddLead = hasPermission(user?.permissions || [], 'LEADS_CREATE');
    const canSeeActivity = hasAnyPermission(user?.permissions || [], [
        'LEADS_VIEW_ALL',
        'LEADS_VIEW_OWN',
        'LEADS_VIEW_TEAM',
        'USERS_VIEW',
        'REPORTS_VIEW',
        'DASHBOARD_VIEW_OWN',
        'DASHBOARD_VIEW_ASSIGNED',
        'DASHBOARD_VIEW_ALL',
        'DASHBOARD_VIEW_OWN_OFFICE',
        'DASHBOARD_VIEW_ASSIGNED_OFFICES',
        'DASHBOARD_VIEW_ALL_OFFICES',
    ]);
    const canSeeLOB = hasAnyPermission(user?.permissions || [], [
        'LOB_ANALYSIS_VIEW',
        'REPORTS_VIEW',
        'DASHBOARD_VIEW_OWN',
        'DASHBOARD_VIEW_ASSIGNED',
        'DASHBOARD_VIEW_ALL',
        'DASHBOARD_VIEW_OWN_OFFICE',
        'DASHBOARD_VIEW_ASSIGNED_OFFICES',
        'DASHBOARD_VIEW_ALL_OFFICES',
    ]);
    const canSeeCalendar = hasAnyPermission(user?.permissions || [], [
        'LEADS_VIEW_ALL',
        'LEADS_VIEW_OWN',
        'LEADS_VIEW_TEAM',
        'SYSTEM_CONFIG',
        'DASHBOARD_VIEW_OWN',
        'DASHBOARD_VIEW_ASSIGNED',
        'DASHBOARD_VIEW_ALL',
        'DASHBOARD_VIEW_OWN_OFFICE',
        'DASHBOARD_VIEW_ASSIGNED_OFFICES',
        'DASHBOARD_VIEW_ALL_OFFICES',
    ]);
    const hasAnyDashboardSection = [canSeeMetrics, canSeeGrowth, canQuickAddLead, canSeeActivity, canSeeLOB, canSeeCalendar].some(Boolean);
    const shouldFetchDashboardData = [canSeeMetrics, canSeeGrowth, canSeeActivity, canSeeLOB, canSeeCalendar].some(Boolean);
    const showOfficeFilter = canUseOfficeFilter(user);
    const showUserFilter = showOfficeFilter;
    const statusOptions = useMemo<Option[]>(
        () => [
            { value: 'ACTIVE', label: 'Active' },
            { value: 'OPEN', label: 'Open' },
            { value: 'CLOSED', label: 'Closed' },
            { value: 'LOB', label: 'LOB' },
            { value: 'ARCHIVED', label: 'Archived' },
        ],
        [],
    );

    const hasFetched = useRef(false);

    useEffect(() => {
        selectedUserIdRef.current = dashboardFilters.userId;
    }, [dashboardFilters.userId]);

    useEffect(() => {
        if (!shouldFetchDashboardData) return;
        if (hasFetched.current) return;
        hasFetched.current = true;
        
        void fetchDashboardData();
    }, [fetchDashboardData, shouldFetchDashboardData]);

    useEffect(() => {
        let mounted = true;
        void loadDashboardFilterMeta()
            .then((meta) => {
                if (!mounted) return;
                setFilterMeta(meta);
            })
            .catch(() => {
                if (mounted) setFilterMeta({ stages: [], sources: [] });
            });
        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        if (!showUserFilter) return;
        let mounted = true;
        setIsLoadingUsers(true);
        void loadDashboardUserOptions(selectedOfficeId || undefined)
            .then((options) => {
                if (!mounted) return;
                setUserOptions(options);
                const selectedUserId = selectedUserIdRef.current;
                if (selectedUserId && !options.some((option) => option.value === selectedUserId)) {
                    void fetchDashboardData({ userId: undefined });
                }
            })
            .catch(() => {
                if (mounted) setUserOptions([]);
            })
            .finally(() => {
                if (mounted) setIsLoadingUsers(false);
            });
        return () => {
            mounted = false;
        };
    }, [fetchDashboardData, selectedOfficeId, showUserFilter]);

    const applyDashboardFilters = useCallback((patch: Partial<DashboardSummaryFilters>) => {
        void fetchDashboardData(patch);
    }, [fetchDashboardData]);

    return (
        <DashboardLayout>
            <div className="flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar relative">

                    {/* Top Right Background Decorator */}
                    <div className="absolute top-0 right-0 w-[800px] h-[500px] bg-gradient-to-bl from-emerald-50/80 via-transparent to-transparent pointer-events-none -z-10" />

                    <div className="max-w-[1600px] mx-auto p-6 md:p-8 space-y-8">
                        {error && (
                            <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                                {error}
                            </div>
                        )}

                        {hasAnyDashboardSection ? (
                            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                                <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-500">Dashboard Filters</p>
                                        <p className="mt-1 text-sm font-semibold text-gray-500">Metrics refresh for every selected reporting filter.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleClearFilters}
                                        className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50/80 px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-all self-start sm:self-auto shadow-sm active:scale-95 group"
                                    >
                                        <RotateCcw className="h-3.5 w-3.5 text-gray-500 group-hover:text-emerald-600 transition-colors" />
                                        Clear Filters
                                    </button>
                                </div>
                                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
                                    {showOfficeFilter ? (
                                    <OfficeFilterSelect
                                        value={selectedOfficeId || ''}
                                        onChange={(officeId) => {
                                            applyDashboardFilters({ officeId, userId: undefined });
                                        }}
                                    />
                                    ) : null}
                                    {showUserFilter ? (
                                        <SearchableSelect
                                            name="dashboardUserId"
                                            value={dashboardFilters.userId || ''}
                                            options={userOptions}
                                            placeholder={isLoadingUsers ? 'Loading users...' : 'User'}
                                            allowClear
                                            clearLabel="All Users"
                                            onChange={(event) => applyDashboardFilters({ userId: event.target.value || undefined })}
                                        />
                                    ) : null}
                                    <SearchableSelect
                                        name="dashboardStageId"
                                        value={dashboardFilters.stageId || ''}
                                        options={filterMeta.stages}
                                        placeholder="Lead Stage"
                                        allowClear
                                        clearLabel="All Stages"
                                        onChange={(event) => applyDashboardFilters({ stageId: event.target.value || undefined })}
                                    />
                                    <SearchableSelect
                                        name="dashboardSourceId"
                                        value={dashboardFilters.sourceId || ''}
                                        options={filterMeta.sources}
                                        placeholder="Lead Source"
                                        allowClear
                                        clearLabel="All Sources"
                                        onChange={(event) => applyDashboardFilters({ sourceId: event.target.value || undefined })}
                                    />
                                    <SearchableSelect
                                        name="dashboardStatus"
                                        value={dashboardFilters.status || ''}
                                        options={statusOptions}
                                        placeholder="Status"
                                        allowClear
                                        clearLabel="All Status"
                                        onChange={(event) => applyDashboardFilters({ status: (event.target.value || undefined) as DashboardStatusFilter | undefined })}
                                    />
                                    <input
                                        type="date"
                                        value={dashboardFilters.dateFrom || ''}
                                        onChange={(event) => applyDashboardFilters({ dateFrom: event.target.value || undefined })}
                                        className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                                        aria-label="Dashboard date from"
                                    />
                                    <input
                                        type="date"
                                        value={dashboardFilters.dateTo || ''}
                                        onChange={(event) => applyDashboardFilters({ dateTo: event.target.value || undefined })}
                                        className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                                        aria-label="Dashboard date to"
                                    />
                                </div>
                            </div>
                        ) : null}

                        {!hasAnyDashboardSection ? (
                            <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-10 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.18)]">
                                <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-500">
                                    {mode === 'admin' ? 'Admin Dashboard' : 'Workspace Dashboard'}
                                </p>
                                <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900">
                                    Dashboard access is ready, but no widgets are allowed for this permission set yet.
                                </h2>
                                <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-slate-500">
                                    This is a safe fallback for accounts that can sign in but do not yet have any dashboard-visible permissions assigned.
                                </p>
                            </div>
                        ) : null}

                        {canSeeMetrics && (
                            <div className="mb-6">
                                <FollowUpCapacityWidget />
                            </div>
                        )}

                        {canSeeMetrics && <KPICards />}

                        {canSeeGrowth && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <LeadGrowthChart />
                                <PipelineStages />
                            </div>
                        )}

                        {(canQuickAddLead || canSeeActivity || canSeeLOB || canSeeCalendar) && (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                                {canQuickAddLead && <QuickLeadWidget />}
                                {canSeeActivity && <RecentActivityWidget />}
                                {canSeeLOB && <LOBAnalysisWidget />}
                                {canSeeCalendar && <CalendarWidget />}
                            </div>
                        )}

                    </div>
                </div>
        </DashboardLayout>
    );
};

export default Dashboard;
