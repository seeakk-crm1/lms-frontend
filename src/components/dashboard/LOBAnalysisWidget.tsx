import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { BriefcaseBusiness } from 'lucide-react';
import useDashboardStore from '../../store/useDashboardStore';

const LOBAnalysisWidget: React.FC = () => {
    const { lobData, isLoading } = useDashboardStore();

    if (isLoading) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-50">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse"></div>
                        <div>
                            <div className="w-24 h-4 bg-gray-100 rounded mb-1 animate-pulse"></div>
                            <div className="w-32 h-3 bg-gray-50 rounded animate-pulse"></div>
                        </div>
                    </div>
                </div>
                <div className="flex-1 w-full bg-gray-50/50 rounded-xl animate-pulse min-h-[200px]"></div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.6 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-full hover:shadow-[0_10px_30px_-15px_rgba(16,185,129,0.15)] transition-shadow duration-300"
        >
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                        <BriefcaseBusiness size={16} />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-gray-900 leading-tight">LOB Analysis</h3>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Lost Leads by Stage</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 w-full min-h-[220px] relative z-10 pt-2">
                {lobData.length === 0 ? (
                    <div className="h-full flex items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/60 text-sm font-medium text-gray-400">
                        No LOB movement recorded yet.
                    </div>
                ) : (
                <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={lobData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }} barSize={32}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 700 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 700 }}
                        />
                        <Tooltip
                            cursor={{ fill: '#f9fafb' }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '12px 16px', fontWeight: 'bold' }}
                            itemStyle={{ color: '#10B981', fontWeight: 800 }}
                        />
                        <Bar
                            dataKey="lost"
                            fill="#10B981"
                            radius={[6, 6, 0, 0]}
                            animationDuration={1500}
                        />
                    </BarChart>
                </ResponsiveContainer>
                )}
            </div>
        </motion.div>
    );
};

export default LOBAnalysisWidget;
