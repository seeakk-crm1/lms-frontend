import React from 'react';
import { motion } from 'framer-motion';
import { Zap, CornerDownRight, CheckCircle2 } from 'lucide-react';
import useDashboardStore from '../../store/useDashboardStore';

const RecentActivityWidget: React.FC = () => {
    const { activities, isLoading } = useDashboardStore();

    if (isLoading) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-50">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse"></div>
                        <div>
                            <div className="w-24 h-4 bg-gray-100 rounded mb-1 animate-pulse"></div>
                            <div className="w-16 h-3 bg-gray-50 rounded animate-pulse"></div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-6 flex-1">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex gap-4 items-start">
                            <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse shrink-0"></div>
                            <div className="flex-1">
                                <div className="w-full h-4 bg-gray-100 rounded mb-2 animate-pulse"></div>
                                <div className="w-3/4 h-3 bg-gray-50 rounded animate-pulse"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-full hover:shadow-[0_10px_30px_-15px_rgba(16,185,129,0.15)] transition-shadow duration-300"
        >
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                        <Zap size={16} />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-gray-900 leading-tight">Live Activity</h3>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Team updates</p>
                    </div>
                </div>
            </div>

            {activities.length === 0 ? (
                <div className="flex-1 flex items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/60 text-sm font-medium text-gray-400">
                    No recent activity in this workspace yet.
                </div>
            ) : (
            <div className="flex flex-col gap-6 flex-1">
                {activities.map((act) => (
                    <div key={act.id} className="flex gap-4 items-start group">
                        <div className="shrink-0 w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold border-2 border-white shadow-sm overflow-hidden">
                            {act.avatar ? (
                                <img src={act.avatar} alt={act.user} className="w-full h-full object-cover" />
                            ) : (
                                act.user.charAt(0)
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                <span className="font-bold">{act.user}</span> {act.action}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1">
                                <CornerDownRight size={12} className="text-gray-300" />
                                <span className="text-xs font-bold text-emerald-600 truncate">{act.target}</span>
                            </div>
                            <div className="mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center justify-between">
                                <span>{act.time}</span>
                                {act.status === 'closed' && <CheckCircle2 size={12} className="text-emerald-500" />}
                                {act.status === 'pending' && <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></span>}
                                {act.status === 'assigned' && <span className="w-2 h-2 rounded-full bg-blue-400"></span>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            )}
        </motion.div>
    );
};

export default RecentActivityWidget;
