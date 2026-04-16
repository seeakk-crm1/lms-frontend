import React from 'react';
import { motion } from 'framer-motion';
import useDashboardStore from '../../store/useDashboardStore';

const PipelineStages: React.FC = () => {
    const { pipelineData, isLoading } = useDashboardStore();

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
            <div className="flex-1 flex flex-col justify-center gap-6">
                {pipelineData.map((stage, idx) => (
                    <div key={idx} className="group cursor-pointer">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-sm font-bold text-gray-700 group-hover:text-emerald-600 transition-colors uppercase tracking-wider">{stage.name}</span>
                            <span className="text-xs font-black text-gray-900 bg-gray-50 px-2 py-1 rounded">{stage.count} Leads</span>
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
            )}
        </motion.div>
    );
};

export default PipelineStages;
