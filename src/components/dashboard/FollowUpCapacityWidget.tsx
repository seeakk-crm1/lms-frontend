import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getTodayFollowUpUtilization } from '../../services/followupSettings.api';

type FollowUpUtilization = { count: number; limit: number; limitEnabled: boolean };

let utilizationRequest: Promise<FollowUpUtilization | null> | null = null;

const loadTodayFollowUpUtilization = (): Promise<FollowUpUtilization | null> => {
  if (!utilizationRequest) {
    utilizationRequest = getTodayFollowUpUtilization()
      .then((res) => (res.success ? res.data : null))
      .finally(() => {
        utilizationRequest = null;
      });
  }
  return utilizationRequest;
};

const FollowUpCapacityWidget: React.FC = () => {
  const [data, setData] = useState<FollowUpUtilization | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchUtilization = async () => {
      try {
        const nextData = await loadTodayFollowUpUtilization();
        if (mounted && nextData) {
          setData(nextData);
        }
      } catch (error) {
        console.error('Failed to load today follow-up utilization', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void fetchUtilization();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading || !data) {
    return (
      <div className="w-full bg-white rounded-2xl p-5 border border-gray-100 shadow-sm animate-pulse flex items-center justify-between h-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-full"></div>
          <div className="space-y-2">
            <div className="w-28 h-3 bg-gray-100 rounded-full"></div>
            <div className="w-20 h-2 bg-gray-100 rounded-full"></div>
          </div>
        </div>
        <div className="w-20 h-6 bg-gray-100 rounded-lg"></div>
      </div>
    );
  }

  const { count, limit, limitEnabled } = data;
  const pct = limit > 0 ? Math.min(100, Math.round((count / limit) * 100)) : 0;
  const isOverLimit = limitEnabled && count >= limit;

  // Modern HSL color mapping for states
  let barColor = 'bg-emerald-500';
  let badgeBg = 'bg-emerald-50 text-emerald-600';
  if (isOverLimit) {
    barColor = 'bg-red-500';
    badgeBg = 'bg-red-50 text-red-600';
  } else if (pct >= 80) {
    barColor = 'bg-amber-500';
    badgeBg = 'bg-amber-50 text-amber-600';
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-gradient-to-br from-white to-gray-50/50 rounded-2xl p-5 border border-gray-100/80 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group flex flex-col md:flex-row md:items-center justify-between gap-4"
    >
      {/* Background Decorator */}
      <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-emerald-50/40 rounded-full blur-2xl group-hover:bg-emerald-100/40 transition-all duration-300"></div>

      <div className="flex items-start gap-3.5 relative z-10">
        <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 ${
          isOverLimit ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'
        }`}>
          {isOverLimit ? <AlertCircle size={20} /> : <Calendar size={20} />}
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-gray-800">Daily Follow-Up Capacity</h4>
          <p className="text-xs font-semibold text-gray-400">
            {limitEnabled
              ? isOverLimit
                ? 'You have reached your daily follow-up limit for today.'
                : `You have ${limit - count} remaining follow-up slots for today.`
              : 'Daily follow-up limit is currently disabled.'}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full md:w-auto relative z-10">
        {/* Progress Bar (Only render if limits are enabled) */}
        {limitEnabled && (
          <div className="flex-1 md:w-48 space-y-1.5 min-w-[150px]">
            <div className="flex justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              <span>Utilization</span>
              <span>{pct}%</span>
            </div>
            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={`h-full rounded-full ${barColor}`}
              ></motion.div>
            </div>
          </div>
        )}

        <div className={`self-end sm:self-center px-4 py-2 rounded-xl text-sm font-black flex items-center gap-1.5 shadow-sm ${badgeBg}`}>
          {isOverLimit ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
          Today's Follow-Ups: {count} {limitEnabled ? `/ ${limit}` : ''}
        </div>
      </div>
    </motion.div>
  );
};

export default FollowUpCapacityWidget;
