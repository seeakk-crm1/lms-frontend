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
import { hasAnyPermission, hasPermission } from '../utils/permissions';

interface DashboardProps {
    mode?: 'admin' | 'operations';
}

const Dashboard: React.FC<DashboardProps> = ({ mode = 'operations' }) => {
    const { fetchDashboardData, error } = useDashboardStore();
    const user = useAuthStore((state) => state.user);

    const canSeeMetrics = hasAnyPermission(user, [
        'LEADS_VIEW_ALL',
        'LEADS_VIEW_OWN',
        'LEADS_VIEW_TEAM',
        'REPORTS_VIEW',
        'LOB_ANALYSIS_VIEW',
        'USERS_VIEW',
        'SYSTEM_CONFIG',
    ]);
    const canSeeGrowth = hasAnyPermission(user, [
        'LEADS_VIEW_ALL',
        'LEADS_VIEW_OWN',
        'LEADS_VIEW_TEAM',
        'REPORTS_VIEW',
        'LOB_ANALYSIS_VIEW',
    ]);
    const canQuickAddLead = hasPermission(user, 'LEADS_CREATE');
    const canSeeActivity = hasAnyPermission(user, [
        'LEADS_VIEW_ALL',
        'LEADS_VIEW_OWN',
        'LEADS_VIEW_TEAM',
        'USERS_VIEW',
        'REPORTS_VIEW',
    ]);
    const canSeeLOB = hasAnyPermission(user, ['LOB_ANALYSIS_VIEW', 'REPORTS_VIEW']);
    const canSeeCalendar = hasAnyPermission(user, [
        'LEADS_VIEW_ALL',
        'LEADS_VIEW_OWN',
        'LEADS_VIEW_TEAM',
        'SYSTEM_CONFIG',
    ]);
    const hasAnyDashboardSection = [canSeeMetrics, canSeeGrowth, canQuickAddLead, canSeeActivity, canSeeLOB, canSeeCalendar].some(Boolean);
    const shouldFetchDashboardData = [canSeeMetrics, canSeeGrowth, canSeeActivity, canSeeLOB, canSeeCalendar].some(Boolean);

    useEffect(() => {
        if (!shouldFetchDashboardData) return;
        void fetchDashboardData();
    }, [fetchDashboardData, shouldFetchDashboardData]);

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
