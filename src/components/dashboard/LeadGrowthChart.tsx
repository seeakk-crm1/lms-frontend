import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import useDashboardStore from '../../store/useDashboardStore';

const LeadGrowthChart: React.FC = () => {
    const { leadGrowthData, isLoading, isRefreshing, selectedRange, fetchDashboardData } = useDashboardStore();

    const filters = [
        { label: '7 Days', value: '7d' as const },
        { label: '30 Days', value: '30d' as const },
        { label: '12 Months', value: '12m' as const },
    ];

    if (isLoading) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 flex flex-col col-span-1 lg:col-span-2 relative h-[420px]">
                <div className="flex flex-col sm:flex-row justify-between mb-8 pb-4 border-b border-gray-50 gap-4">
                    <div className="w-1/3">
                        <div className="h-6 w-3/4 bg-gray-100 rounded-lg animate-pulse mb-2"></div>
                        <div className="h-4 w-1/2 bg-gray-50 rounded-lg animate-pulse"></div>
                    </div>
                    <div className="flex gap-2">
                        <div className="h-8 w-16 bg-gray-100 rounded-lg animate-pulse"></div>
                        <div className="h-8 w-16 bg-gray-100 rounded-lg animate-pulse"></div>
                    </div>
                </div>
                <div className="flex-1 w-full bg-gray-50/50 rounded-xl animate-pulse"></div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 flex flex-col col-span-1 lg:col-span-2 relative overflow-hidden h-[420px]"
        >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-4 border-b border-gray-50 z-10 gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 leading-tight">Growth Velocity — Lead Acquisition</h3>
                        <p className="text-sm font-medium text-gray-400 mt-1">Daily new lead generation volume</p>
                    </div>
                    <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl shrink-0">
                    {filters.map(({ label, value }) => (
                        <button
                            key={value}
                            onClick={() => void fetchDashboardData(value)}
                            disabled={isRefreshing}
                            className={`px-4 py-1.5 text-xs font-bold transition-all rounded-lg relative disabled:cursor-wait ${selectedRange === value ? 'text-gray-900 bg-white shadow-sm' : 'text-gray-400 hover:text-gray-700'
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex-1 w-full min-h-[260px] relative z-10">
                {leadGrowthData.length === 0 ? (
                    <div className="h-full flex items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/60 text-sm font-medium text-gray-400">
                        No lead activity available for this range yet.
                    </div>
                ) : (
                <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={leadGrowthData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#D1FAE5" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 600 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 600 }} />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '12px 16px', fontWeight: 'bold' }} itemStyle={{ color: '#10B981', fontWeight: 800 }} cursor={{ stroke: '#10B981', strokeWidth: 1, strokeDasharray: '4 4' }} />
                        <Area type="monotone" dataKey="leads" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorLeads)" animationDuration={1500} animationEasing="ease-in-out" />
                    </AreaChart>
                </ResponsiveContainer>
                )}
            </div>
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-emerald-50/50 to-transparent pointer-events-none" />
        </motion.div>
    );
};

export default LeadGrowthChart;
