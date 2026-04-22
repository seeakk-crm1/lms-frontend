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

const Dashboard: React.FC = () => {
    const { fetchDashboardData, error } = useDashboardStore();

    useEffect(() => {
        void fetchDashboardData();
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

                        {/* KPI SECTION */}
                        <KPICards />

                        {/* MIDDLE ROW: Chart + Pipeline */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <LeadGrowthChart />
                            <PipelineStages />
                        </div>

                        {/* BOTTOM ROW: Widgets Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                            <QuickLeadWidget />
                            <RecentActivityWidget />
                            <LOBAnalysisWidget />
                            <CalendarWidget />
                        </div>

                    </div>
                </div>
        </DashboardLayout>
    );
};

export default Dashboard;
