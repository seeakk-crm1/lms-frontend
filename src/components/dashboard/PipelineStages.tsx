import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useDashboardStore, { PipelineData } from '../../store/useDashboardStore';
import { useLeadStore } from '../../store/leadStore';
import useAuthStore from '../../store/useAuthStore';
import { hasAnyPermission } from '../../utils/permission.util';
import { toast } from 'react-hot-toast';

const PipelineStages: React.FC = () => {
    const navigate = useNavigate();
    const pipelineData = useDashboardStore((state) => state.pipelineData);
    const isLoading = useDashboardStore((state) => state.isLoading);
    const user = useAuthStore((state) => state.user);

    const canSeeLeads = hasAnyPermission(user?.permissions || [], [
        'LEADS_VIEW_ALL',
        'LEADS_VIEW_OWN',
        'LEADS_VIEW_TEAM',
    ]);

    const handleStageClick = (stage: PipelineData) => {
        if (!canSeeLeads) {
            toast.error('You do not have permission to view leads.');
            return;
        }

        const stageIdentifier = stage.id || stage.stageId || stage.name;
        useLeadStore.getState().setFilters({ stage: stageIdentifier });
        navigate(`/leads?stageId=${encodeURIComponent(stageIdentifier)}`, {
            state: { stageId: stageIdentifier }
        });
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 flex flex-col h-[420px]">
                <div className="mb-6 border-b border-gray-50 pb-4">
                    <div className="h-6 w-1/2 bg-gray-100 rounded-lg animate-pulse mb-2"></div>
                    <div className="h-4 w-3/4 bg-gray-50 rounded-lg animate-pulse"></div>
                </div>
                <div className="flex-1 flex flex-col justify-center gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="flex flex-col gap-2">
                            <div className="flex justify-between items-end">
                                <div className="h-4 w-32 bg-gray-100 rounded animate-pulse"></div>
                                <div className="h-4 w-12 bg-gray-50 rounded animate-pulse"></div>
                            </div>
                            <div className="w-full h-3 bg-gray-50 rounded-full animate-pulse"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 flex flex-col h-[420px]"
        >
            <div className="mb-6 border-b border-gray-50 pb-4">
                <h3 className="text-lg font-bold text-gray-900 leading-tight">Pipeline Stages</h3>
                <p className="text-sm font-medium text-gray-400 mt-1">Lead stage distribution and funnels</p>
            </div>
            {pipelineData.length === 0 ? (
                <div className="flex-1 flex items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/60 text-sm font-medium text-gray-400">
                    No pipeline stages have lead data yet.
                </div>
            ) : (
            <div className="flex-1 flex flex-col gap-5 overflow-y-auto custom-scrollbar pr-1">
                <div className="flex flex-col gap-3 my-auto">
                    {pipelineData.map((stage, idx) => (
                        <div
                            key={stage.id || stage.stageId || idx}
                            onClick={() => handleStageClick(stage)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    handleStageClick(stage);
                                }
                            }}
                            role="button"
                            tabIndex={0}
                            className="group cursor-pointer shrink-0 p-2.5 rounded-xl hover:bg-gray-50/80 transition-all outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                        >
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-sm font-bold text-gray-700 group-hover:text-emerald-600 transition-colors uppercase tracking-wider">{stage.name}</span>
                                <span className="text-xs font-black text-gray-900 bg-gray-50 group-hover:bg-emerald-50 group-hover:text-emerald-700 px-2 py-1 rounded transition-colors">{stage.count} Leads</span>
                            </div>
                            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${stage.percent}%` }}
                                    transition={{ duration: 1, delay: 0.3 + (idx * 0.1), ease: "easeOut" }}
                                    className="h-full rounded-full shadow-sm group-hover:brightness-110"
                                    style={{ backgroundColor: stage.color }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            )}
        </motion.div>
    );
};

export default PipelineStages;
