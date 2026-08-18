import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { RotateCcw, LayoutGrid, Sparkles, Plus, Trash2, Loader2 } from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import KPICards from '../components/dashboard/KPICards';
import LeadGrowthChart from '../components/dashboard/LeadGrowthChart';
import PipelineStages from '../components/dashboard/PipelineStages';
import RecentActivityWidget from '../components/dashboard/RecentActivityWidget';
import LOBAnalysisWidget from '../components/dashboard/LOBAnalysisWidget';
import CalendarWidget from '../components/dashboard/CalendarWidget';
import useDashboardStore from '../store/useDashboardStore';
import useAuthStore from '../store/useAuthStore';
import FollowUpCapacityWidget from '../components/dashboard/FollowUpCapacityWidget';
import ProductPerformanceWidget from '../components/dashboard/ProductPerformanceWidget';
import { hasAnyPermission, hasPermission } from '../utils/permission.util';
import OfficeFilterSelect from '../components/OfficeFilterSelect';
import { canUseOfficeFilter } from '../utils/officeFilterAccess';
import SearchableSelect, { type Option } from '../components/SearchableSelect';
import { getLeadMeta, getLeadAssignees } from '../services/leads.api';
import { getUsers } from '../services/users.api';
import type { DashboardSummaryFilters, DashboardStatusFilter } from '../services/dashboard.api';
import { useNavigate } from 'react-router-dom';
import {
  getPipelineSections,
  deletePipeline,
  duplicatePipeline,
  type PipelineSection,
  type Pipeline,
} from '../services/customPipelines.api';
import { CustomDashboardSection } from '../components/dashboard/custom/CustomDashboardSection';
import { PipelineBuilderWizard } from '../components/dashboard/custom/PipelineBuilderWizard';
import { SectionManagerModal } from '../components/dashboard/custom/SectionManagerModal';

import DashboardCustomizerDrawer from '../components/dashboard/DashboardCustomizerDrawer';
import { useDashboardPreferencesQuery } from '../hooks/useDashboardPreferences';
import { SlidersHorizontal } from 'lucide-react';

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

    const navigate = useNavigate();
    const [customSections, setCustomSections] = useState<PipelineSection[]>([]);
    const [isLoadingCustomSections, setIsLoadingCustomSections] = useState(false);
    const [isBuilderOpen, setIsBuilderOpen] = useState(false);
    const [isSectionManagerOpen, setIsSectionManagerOpen] = useState(false);
    const [isCustomizerDrawerOpen, setIsCustomizerDrawerOpen] = useState(false);
    const [activeSectionIdForBuilder, setActiveSectionIdForBuilder] = useState<string | undefined>(undefined);
    const [editingPipeline, setEditingPipeline] = useState<Pipeline | null>(null);
    const [deletingPipelineConfirm, setDeletingPipelineConfirm] = useState<Pipeline | null>(null);
    const [isDeletingPipeline, setIsDeletingPipeline] = useState(false);

    const { data: preferencesData } = useDashboardPreferencesQuery();

    const loadCustomSections = useCallback(async () => {
        try {
            setIsLoadingCustomSections(true);
            const data = await getPipelineSections();
            setCustomSections(data || []);
        } catch (err) {
            console.error('Failed to load custom sections', err);
        } finally {
            setIsLoadingCustomSections(false);
        }
    }, []);

    useEffect(() => {
        void loadCustomSections();

        const handleFocus = () => {
            void loadCustomSections();
        };

        const handleLeadUpdate = () => {
            void loadCustomSections();
        };

        window.addEventListener('focus', handleFocus);
        window.addEventListener('seeakk:leads-updated', handleLeadUpdate);

        const intervalId = setInterval(() => {
            void loadCustomSections();
        }, 20000);

        return () => {
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('seeakk:leads-updated', handleLeadUpdate);
            clearInterval(intervalId);
        };
    }, [loadCustomSections]);

    const canCustomizeDashboard =
        preferencesData?.canCustomize ??
        hasAnyPermission(user?.permissions || [], [
            'DASHBOARD_CUSTOMIZE',
            'DASHBOARD_CUSTOM_MANAGE_SECTIONS',
            'DASHBOARD_CUSTOM_CREATE_OWN',
            'DASHBOARD_CUSTOM_VIEW',
            'SYSTEM_CONFIG',
        ]);

    const handlePipelineClick = (pipeline: Pipeline) => {
        const stageFilter = pipeline.filtersJson?.find((f) => f.field === 'stageId');
        const userFilter = pipeline.filtersJson?.find((f) => f.field === 'assignedToId');
        const sourceFilter = pipeline.filtersJson?.find((f) => f.field === 'sourceId');
        const officeFilter = pipeline.filtersJson?.find((f) => f.field === 'officeId');

        navigate('/leads', {
            state: {
                customPipeline: pipeline,
                stageId: stageFilter ? stageFilter.value : undefined,
                assignedToId: userFilter ? userFilter.value : undefined,
                sourceId: sourceFilter ? sourceFilter.value : undefined,
                officeId: officeFilter ? officeFilter.value : undefined,
                filtersJson: pipeline.filtersJson,
                filterLogic: pipeline.filterLogic,
            },
        });
    };

    const handleEditPipeline = (pipeline: Pipeline) => {
        setEditingPipeline(pipeline);
        setIsBuilderOpen(true);
    };

    const handleDuplicatePipeline = async (pipeline: Pipeline) => {
        try {
            await duplicatePipeline(pipeline.id);
            toast.success(`Pipeline "${pipeline.name}" duplicated successfully!`);
            void loadCustomSections();
        } catch (err: any) {
            toast.error(err?.response?.data?.error || 'Failed to duplicate pipeline');
        }
    };

    const handleDeletePipelineClick = (pipeline: Pipeline) => {
        setDeletingPipelineConfirm(pipeline);
    };

    const handleConfirmDeletePipeline = async () => {
        if (!deletingPipelineConfirm) return;
        try {
            setIsDeletingPipeline(true);
            await deletePipeline(deletingPipelineConfirm.id);
            toast.success(`Pipeline "${deletingPipelineConfirm.name}" deleted successfully!`);
            setDeletingPipelineConfirm(null);
            void loadCustomSections();
        } catch (err: any) {
            toast.error(err?.response?.data?.error || 'Failed to delete pipeline');
        } finally {
            setIsDeletingPipeline(false);
        }
    };

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
        'ASSIGNED_USERS_VIEW',
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
    const hasAnyDashboardSection = [canSeeMetrics, canSeeGrowth, canSeeActivity, canSeeLOB, canSeeCalendar].some(Boolean);
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

    const orderedSections = useMemo(() => {
        const rawSections = preferencesData?.sections;
        if (!rawSections || rawSections.length === 0) {
            return [
                { key: 'followup_capacity', isVisible: true, displayOrder: 1 },
                { key: 'cards_group', isVisible: true, displayOrder: 2 },
                { key: 'growth_and_pipeline', isVisible: true, displayOrder: 3 },
                { key: 'product_performance', isVisible: true, displayOrder: 4 },
                { key: 'grid_widgets_group', isVisible: true, displayOrder: 5 },
            ];
        }
        const visibleSorted = [...rawSections]
            .filter((s) => s.isVisible)
            .sort((a, b) => a.displayOrder - b.displayOrder);

        const items: { key: string; isVisible: boolean; displayOrder: number }[] = [
            { key: 'cards_group', isVisible: true, displayOrder: 0.5 },
        ];

        visibleSorted.forEach((sec) => {
            if (sec.key === 'recent_activity' || sec.key === 'lob_analysis' || sec.key === 'calendar_widget') {
                if (!items.some((i) => i.key === 'grid_widgets_group')) {
                    items.push({ key: 'grid_widgets_group', isVisible: true, displayOrder: sec.displayOrder });
                }
            } else {
                items.push(sec);
            }
        });

        items.sort((a, b) => a.displayOrder - b.displayOrder);
        return items;
    }, [preferencesData?.sections]);

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
                                    <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                                        {canCustomizeDashboard && (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsCustomizerDrawerOpen(true)}
                                                    className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-2.5 text-xs font-black text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-95 cursor-pointer"
                                                >
                                                    <SlidersHorizontal className="h-4 w-4" />
                                                    Customize Dashboard
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsSectionManagerOpen(true)}
                                                    className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-all active:scale-95 cursor-pointer"
                                                >
                                                    <LayoutGrid className="h-4 w-4 text-emerald-600" />
                                                    Manage Sections
                                                </button>
                                            </>
                                        )}
                                        <button
                                            type="button"
                                            onClick={handleClearFilters}
                                            className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50/80 px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-all shadow-sm active:scale-95 group cursor-pointer"
                                        >
                                            <RotateCcw className="h-3.5 w-3.5 text-gray-500 group-hover:text-emerald-600 transition-colors" />
                                            Clear Filters
                                        </button>
                                    </div>
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

                        {/* Render Sections Dynamically Based on Preferences */}
                        {orderedSections.map((sec) => {
                            if (!sec.isVisible) return null;
                            switch (sec.key) {
                                case 'followup_capacity':
                                    return canSeeMetrics ? (
                                        <div key="followup_capacity" className="mb-6">
                                            <FollowUpCapacityWidget />
                                        </div>
                                    ) : null;
                                case 'cards_group':
                                    return canSeeMetrics ? (
                                        <KPICards key="cards_group" cardPreferences={preferencesData?.cards} />
                                    ) : null;
                                case 'growth_and_pipeline':
                                    return canSeeGrowth ? (
                                        <div key="growth_and_pipeline" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                            <LeadGrowthChart />
                                            <PipelineStages />
                                        </div>
                                    ) : null;
                                case 'product_performance':
                                    return canSeeMetrics ? (
                                        <div key="product_performance" className="mb-6">
                                            <ProductPerformanceWidget />
                                        </div>
                                    ) : null;
                                case 'grid_widgets_group':
                                    return (canSeeActivity || canSeeLOB || canSeeCalendar) ? (
                                        <div key="grid_widgets_group" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {canSeeActivity && (preferencesData?.sections?.find(s => s.key === 'recent_activity')?.isVisible ?? true) && <RecentActivityWidget />}
                                            {canSeeLOB && (preferencesData?.sections?.find(s => s.key === 'lob_analysis')?.isVisible ?? true) && <LOBAnalysisWidget />}
                                            {canSeeCalendar && (preferencesData?.sections?.find(s => s.key === 'calendar_widget')?.isVisible ?? true) && <CalendarWidget />}
                                        </div>
                                    ) : null;
                                default:
                                    return null;
                            }
                        })}

                        {/* Custom Dashboard Pipeline Sections */}
                        {customSections.length > 0 ? (
                            <div className="space-y-6 pt-4 border-t border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-500">Custom Lead Pipelines</p>
                                        <h3 className="text-xl font-black text-gray-900">Customized Reporting & Pipeline Monitoring</h3>
                                    </div>
                                    {canCustomizeDashboard && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditingPipeline(null);
                                                setActiveSectionIdForBuilder(undefined);
                                                setIsBuilderOpen(true);
                                            }}
                                            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 border border-emerald-100 hover:bg-emerald-100 transition-colors cursor-pointer"
                                        >
                                            <Plus className="h-3.5 w-3.5" />
                                            New Custom Pipeline
                                        </button>
                                    )}
                                </div>

                                {customSections.map((section) => (
                                    <CustomDashboardSection
                                        key={section.id}
                                        section={section}
                                        onAddPipeline={(secId) => {
                                            setEditingPipeline(null);
                                            setActiveSectionIdForBuilder(secId);
                                            setIsBuilderOpen(true);
                                        }}
                                        onEditSection={() => setIsSectionManagerOpen(true)}
                                        onDeleteSection={() => setIsSectionManagerOpen(true)}
                                        onEditPipeline={handleEditPipeline}
                                        onDuplicatePipeline={handleDuplicatePipeline}
                                        onDeletePipeline={handleDeletePipelineClick}
                                        onPipelineClick={handlePipelineClick}
                                        canManage={canCustomizeDashboard}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-3xl border border-dashed border-emerald-200 bg-emerald-50/20 p-8 text-center">
                                <Sparkles className="mx-auto h-8 w-8 text-emerald-500 mb-2" />
                                <h3 className="text-base font-black text-gray-900">Create Your Own Dashboard Pipelines</h3>
                                <p className="mt-1 max-w-md mx-auto text-xs font-semibold text-gray-500">
                                    Build custom lead views using stages, users, offices, dates, revenue, follow-ups, dynamic fields, and more.
                                </p>
                                {canCustomizeDashboard && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (customSections.length === 0) {
                                                setIsSectionManagerOpen(true);
                                            } else {
                                                setEditingPipeline(null);
                                                setIsBuilderOpen(true);
                                            }
                                        }}
                                        className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-2.5 text-xs font-black text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-600 transition-all cursor-pointer"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Create First Pipeline Section
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Custom Pipeline Modals */}
                        <PipelineBuilderWizard
                            isOpen={isBuilderOpen}
                            onClose={() => setIsBuilderOpen(false)}
                            onSuccess={loadCustomSections}
                            sections={customSections}
                            initialSectionId={activeSectionIdForBuilder}
                            editPipeline={editingPipeline}
                            stages={useMemo(() => filterMeta.stages.map((s) => ({ id: s.value, name: s.label })), [filterMeta.stages])}
                            sources={useMemo(() => filterMeta.sources.map((s) => ({ id: s.value, name: s.label })), [filterMeta.sources])}
                            users={useMemo(() => userOptions.map((u) => ({ id: u.value, name: u.label })), [userOptions])}
                        />

                        <SectionManagerModal
                            isOpen={isSectionManagerOpen}
                            onClose={() => setIsSectionManagerOpen(false)}
                            onSuccess={loadCustomSections}
                            sections={customSections}
                        />

                        {/* Custom Pipeline Delete Confirmation Modal */}
                        <AnimatePresence>
                            {deletingPipelineConfirm && (
                                <div className="fixed inset-0 z-[10400] flex items-center justify-center p-4">
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        onClick={() => setDeletingPipelineConfirm(null)}
                                        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                                    />

                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: 15 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: 15 }}
                                        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-2xl"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-2xl bg-red-100 p-3 text-red-600">
                                                <Trash2 className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-black text-gray-900">Delete Custom Pipeline</h3>
                                                <p className="text-xs font-semibold text-gray-500">This action cannot be undone.</p>
                                            </div>
                                        </div>

                                        <p className="mt-4 text-xs font-semibold text-gray-600 leading-relaxed">
                                            Are you sure you want to delete pipeline <strong className="text-gray-900">&ldquo;{deletingPipelineConfirm.name}&rdquo;</strong>? It will be permanently removed from your dashboard.
                                        </p>

                                        <div className="mt-6 flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setDeletingPipelineConfirm(null)}
                                                disabled={isDeletingPipeline}
                                                className="flex-1 rounded-xl border border-gray-200 bg-white py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleConfirmDeletePipeline}
                                                disabled={isDeletingPipeline}
                                                className="flex-1 rounded-xl bg-red-600 py-2.5 text-xs font-black text-white hover:bg-red-700 disabled:opacity-50 transition-all shadow-md shadow-red-600/20 flex items-center justify-center gap-2 cursor-pointer"
                                            >
                                                {isDeletingPipeline ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete Pipeline'}
                                            </button>
                                        </div>
                                    </motion.div>
                                </div>
                            )}
                        </AnimatePresence>

                        <DashboardCustomizerDrawer
                            isOpen={isCustomizerDrawerOpen}
                            onClose={() => setIsCustomizerDrawerOpen(false)}
                            preferencesData={preferencesData}
                        />

                    </div>
                </div>
        </DashboardLayout>
    );
};

export default Dashboard;
