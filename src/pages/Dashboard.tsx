import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import KPICards from '../components/dashboard/KPICards';
import LeadGrowthChart from '../components/dashboard/LeadGrowthChart';
import PipelineStages from '../components/dashboard/PipelineStages';
import QuickLeadWidget from '../components/dashboard/QuickLeadWidget';
import RecentActivityWidget from '../components/dashboard/RecentActivityWidget';
import LOBAnalysisWidget from '../components/dashboard/LOBAnalysisWidget';
import CalendarWidget from '../components/dashboard/CalendarWidget';
import useDashboardStore from '../store/useDashboardStore';

const Dashboard: React.FC = () => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { fetchDashboardData, error } = useDashboardStore();

    useEffect(() => {
        void fetchDashboardData();
    }, [fetchDashboardData]);

    return (
        <div className="h-screen w-full bg-gray-50 flex overflow-hidden font-sans text-gray-900 selection:bg-emerald-200 selection:text-emerald-900">

            {/* Desktop Sidebar Sidebar */}
            <DashboardSidebar
                isCollapsed={isSidebarCollapsed}
                toggleCollapsed={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 md:hidden"
                            onClick={() => setMobileMenuOpen(false)}
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 z-50 md:hidden flex"
                        >
                            <DashboardSidebar isMobile={true} isCollapsed={false} toggleCollapsed={() => setMobileMenuOpen(false)} />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                <DashboardHeader setMobileMenuOpen={setMobileMenuOpen} />

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
            </main>
        </div>
    );
};

export default Dashboard;
