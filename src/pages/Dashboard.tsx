import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import RevenueAnalytics from '../components/dashboard/RevenueAnalytics';
import FollowUpCapacityWidget from '../components/dashboard/FollowUpCapacityWidget';
import { hasAnyPermission, hasPermission } from '../utils/permission.util';
import OfficeFilterSelect from '../components/OfficeFilterSelect';
import { canUseOfficeFilter } from '../utils/officeFilterAccess';

interface DashboardProps {
    mode?: 'admin' | 'operations';
}

const Dashboard: React.FC<DashboardProps> = ({ mode = 'operations' }) => {
    const fetchDashboardData = useDashboardStore((state) => state.fetchDashboardData);
    const selectedOfficeId = useDashboardStore((state) => state.selectedOfficeId);
    const setSelectedOfficeId = useDashboardStore((state) => state.setSelectedOfficeId);
    const error = useDashboardStore((state) => state.error);
    const user = useAuthStore((state) => state.user);

    const canSeeMetrics = hasAnyPermission(user?.permissions || [], [
        'LEADS_VIEW_ALL',
        'LEADS_VIEW_OWN',
        'LEADS_VIEW_TEAM',
        'REPORTS_VIEW',
        'LOB_ANALYSIS_VIEW',
        'USERS_VIEW',
        'SYSTEM_CONFIG',
    ]);
    const canSeeGrowth = hasAnyPermission(user?.permissions || [], [
        'LEADS_VIEW_ALL',
        'LEADS_VIEW_OWN',
        'LEADS_VIEW_TEAM',
        'REPORTS_VIEW',
        'LOB_ANALYSIS_VIEW',
    ]);
    const canQuickAddLead = hasPermission(user?.permissions || [], 'LEADS_CREATE');
    const canSeeActivity = hasAnyPermission(user?.permissions || [], [
        'LEADS_VIEW_ALL',
        'LEADS_VIEW_OWN',
        'LEADS_VIEW_TEAM',
        'USERS_VIEW',
        'REPORTS_VIEW',
    ]);
    const canSeeLOB = hasAnyPermission(user?.permissions || [], ['LOB_ANALYSIS_VIEW', 'REPORTS_VIEW']);
    const canSeeCalendar = hasAnyPermission(user?.permissions || [], [
        'LEADS_VIEW_ALL',
        'LEADS_VIEW_OWN',
        'LEADS_VIEW_TEAM',
        'SYSTEM_CONFIG',
    ]);
    const getRoleName = (role: any): string => {
        if (typeof role === 'object' && role !== null) {
            return role.name || '';
        }
        return typeof role === 'string' ? role : '';
    };
    const roleName = getRoleName(user?.role).toLowerCase();
    const isPrivileged = roleName === 'superadmin' || roleName === 'admin';
    const canSeeRevenue = isPrivileged || hasAnyPermission(user?.permissions || [], [
        'VIEW_TOTAL_REVENUE',
        'VIEW_OWN_REVENUE',
    ]);
    const hasAnyDashboardSection = [canSeeMetrics, canSeeGrowth, canQuickAddLead, canSeeActivity, canSeeLOB, canSeeCalendar, canSeeRevenue].some(Boolean);
    const shouldFetchDashboardData = [canSeeMetrics, canSeeGrowth, canSeeActivity, canSeeLOB, canSeeCalendar].some(Boolean);

    const hasFetched = React.useRef(false);

    useEffect(() => {
        if (!shouldFetchDashboardData) return;
        if (hasFetched.current) return;
        hasFetched.current = true;
        
        void fetchDashboardData(undefined, selectedOfficeId);
    }, [fetchDashboardData, selectedOfficeId, shouldFetchDashboardData]);

    useEffect(() => {
        console.log('Dashboard Render Complete');
    }, []);

    console.log('Dashboard Render Started');
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

                        {hasAnyDashboardSection && canUseOfficeFilter(user) ? (
                            <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
                                <div>
                                    <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-500">Office Filter</p>
                                    <p className="mt-1 text-sm font-semibold text-gray-500">Dashboard metrics refresh for users assigned to the selected reporting office.</p>
                                </div>
                                <div className="w-full md:w-96">
                                    <OfficeFilterSelect
                                        value={selectedOfficeId || ''}
                                        onChange={(officeId) => {
                                            setSelectedOfficeId(officeId);
                                            void fetchDashboardData(undefined, officeId);
                                        }}
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

                        {canSeeRevenue && (
                            <div className="pt-4 pb-2">
                                <div className="mb-6 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Revenue Analytics Hub</h2>
                                        <p className="text-xs font-semibold text-gray-400 mt-1">Real-time workspace closing values and revenue trends</p>
                                    </div>
                                </div>
                                <RevenueAnalytics />
                            </div>
                        )}

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
