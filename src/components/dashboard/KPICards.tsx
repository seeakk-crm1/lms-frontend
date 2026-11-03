import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, Variants } from 'framer-motion';
import { TrendingUp, Users, Target, CheckCircle2, IndianRupee, LucideIcon } from 'lucide-react';
import useDashboardStore from '../../store/useDashboardStore';
import type { DashboardPreferenceItem } from '../../types/dashboardPreferences.types';

const iconMap: Record<string, LucideIcon> = {
    Target, Users, CheckCircle2, TrendingUp, IndianRupee
};

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
        opacity: 1, 
        y: 0, 
        transition: { 
            type: "spring", 
            stiffness: 300, 
            damping: 24 
        } 
    }
};

const getKpiRoute = (title: string): string | null => {
    const normalized = title.trim().toLowerCase();
    if (normalized === 'closed leads') {
        return '/leads/closed';
    }
    if (
        normalized.includes('lead') ||
        normalized.includes('revenue') ||
        normalized === "today's leads" ||
        normalized === 'total leads' ||
        normalized === 'expected revenue' ||
        normalized === 'revenue'
    ) {
        return '/leads';
    }
    if (
        normalized.includes('user') ||
        normalized === 'active users'
    ) {
        return '/admin/users';
    }
    return null;
};

const titleToKeyMap: Record<string, string> = {
    "today's leads": 'today_leads',
    "total leads": 'total_leads',
    "closed leads": 'closed_leads',
    "expected revenue": 'expected_revenue',
    "revenue": 'revenue',
    "total advance": 'total_advance',
    "active users": 'active_users',
};

export interface KPICardsProps {
    cardPreferences?: DashboardPreferenceItem[];
}

const KPICards: React.FC<KPICardsProps> = ({ cardPreferences }) => {
    const navigate = useNavigate();
    const kpiData = useDashboardStore((state) => state.kpiData);
    const isLoading = useDashboardStore((state) => state.isLoading);

    const orderedKpiCards = useMemo(() => {
        if (!cardPreferences || cardPreferences.length === 0) {
            return kpiData.map((kpi) => ({
                ...kpi,
                displayTitle: kpi.title,
                originalTitle: kpi.title,
            }));
        }

        const kpiMapByKey = new Map<string, any>();
        kpiData.forEach((kpi) => {
            const key = titleToKeyMap[kpi.title.trim().toLowerCase()] || kpi.title;
            kpiMapByKey.set(key, kpi);
        });

        const visiblePrefs = cardPreferences.filter((p) => p.isVisible);

        return visiblePrefs
            .map((pref) => {
                const kpi = kpiMapByKey.get(pref.key);
                if (!kpi) return null;
                return {
                    ...kpi,
                    displayTitle: pref.displayTitle || pref.customTitle || kpi.title,
                    originalTitle: kpi.title,
                };
            })
            .filter(Boolean);
    }, [kpiData, cardPreferences]);

    // Skeletons
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm overflow-hidden h-36 relative">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 rounded-full bg-gray-100 animate-pulse"></div>
                        </div>
                        <div className="w-24 h-3 bg-gray-100 rounded-full animate-pulse mb-3"></div>
                        <div className="w-16 h-8 bg-gray-100 rounded-lg animate-pulse mb-3"></div>
                        <div className="w-32 h-3 bg-gray-100 rounded-full animate-pulse"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (orderedKpiCards.length === 0) {
        return null;
    }

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 mb-5 sm:mb-6"
        >
            {orderedKpiCards.map((kpi: any, idx: number) => {
                const IconComponent = iconMap[kpi.iconName] || Target;
                const route = getKpiRoute(kpi.originalTitle || kpi.title);
                const isClickable = Boolean(route);

                const handleClick = () => {
                    if (route) {
                        navigate(route);
                    }
                };

                const handleKeyDown = (e: React.KeyboardEvent) => {
                    if ((e.key === 'Enter' || e.key === ' ') && route) {
                        e.preventDefault();
                        navigate(route);
                    }
                };

                return (
                    <motion.div
                        key={kpi.originalTitle || idx}
                        variants={itemVariants}
                        whileHover={isClickable ? { y: -2, boxShadow: '0 10px 25px -10px rgba(16,185,129,0.15)' } : undefined}
                        onClick={handleClick}
                        onKeyDown={handleKeyDown}
                        role={isClickable ? 'button' : undefined}
                        tabIndex={isClickable ? 0 : undefined}
                        className={`bg-white rounded-xl p-3.5 sm:p-4 border border-gray-200/80 shadow-xs transition-all duration-200 relative overflow-hidden group outline-none ${
                            isClickable ? 'cursor-pointer hover:border-emerald-300 focus-visible:ring-2 focus-visible:ring-emerald-500' : ''
                        }`}
                    >
                        <div className="flex items-start justify-between mb-2.5 relative z-10">
                            <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-2xs group-hover:bg-emerald-600 group-hover:text-white transition-all duration-200">
                                <IconComponent size={18} strokeWidth={2.2} />
                            </div>
                            <div className="flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                                <TrendingUp
                                    size={12}
                                    strokeWidth={2.5}
                                    className={`${kpi.trend === 'up' ? 'text-emerald-600' : 'text-rose-500 rotate-180'}`}
                                />
                                <span className={`text-[11px] font-bold ${kpi.trend === 'up' ? 'text-emerald-600' : 'text-rose-500'}`}>
                                    {kpi.growth}
                                </span>
                            </div>
                        </div>

                        <div className="relative z-10">
                            <p
                                className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1 truncate"
                                title={kpi.displayTitle !== kpi.originalTitle ? `Original metric: ${kpi.originalTitle}` : undefined}
                            >
                                {kpi.displayTitle}
                            </p>
                            <h3 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight tracking-tight">{kpi.value}</h3>
                        </div>
                    </motion.div>
                );
            })}
        </motion.div>
    );
};

export default KPICards;
