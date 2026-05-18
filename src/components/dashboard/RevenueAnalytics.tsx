import React, { useState, useEffect, useCallback } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, TrendingUp, Calendar, Award, Filter, RefreshCw, UserCheck, PieChart, Trophy, Briefcase } from 'lucide-react';
import { getRevenueAnalytics, type RevenueAnalyticsFilters, type RevenueAnalyticsResponse } from '../../services/dashboard.api';
import { getLeadMeta } from '../../services/leads.api';
import { getSupervisors } from '../../services/users.api';
import { connectRealtime } from '../../services/realtime';
import useAuthStore from '../../store/useAuthStore';

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(val);
};

const RevenueAnalytics: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const userPermissions = user?.permissions || [];
  
  const getRoleName = (role: any): string => {
    if (typeof role === 'object' && role !== null) {
      return role.name || '';
    }
    return typeof role === 'string' ? role : '';
  };
  const roleName = getRoleName(user?.role).toLowerCase();
  const isPrivileged = roleName === 'superadmin' || roleName === 'admin';
  
  const hasTotalRevenue = isPrivileged || userPermissions.includes('VIEW_TOTAL_REVENUE');
  const hasOwnRevenue = isPrivileged || userPermissions.includes('VIEW_OWN_REVENUE');

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [filters, setFilters] = useState<RevenueAnalyticsFilters>({
    dateFrom: '',
    dateTo: '',
    userId: '',
    stageId: '',
    supervisorId: '',
  });

  // Data States
  const [data, setData] = useState<RevenueAnalyticsResponse['data'] | null>(null);
  const [metaOptions, setMetaOptions] = useState<{
    users: Array<{ id: string; label: string; subtitle?: string }>;
    stages: Array<{ id: string; label: string; color?: string; isClosed?: boolean }>;
    supervisors: Array<{ id: string; name: string; username?: string; email?: string }>;
  }>({
    users: [],
    stages: [],
    supervisors: [],
  });

  // Chart Range State
  const [chartView, setChartView] = useState<'daily' | 'monthly' | 'yearly'>('daily');

  const fetchMetadata = async () => {
    try {
      const [leadMeta, supervisorsList] = await Promise.all([
        getLeadMeta(),
        getSupervisors(),
      ]);

      let supervisors: any[] = [];
      if (Array.isArray(supervisorsList)) {
        supervisors = supervisorsList;
      } else if (supervisorsList && Array.isArray((supervisorsList as any).supervisors)) {
        supervisors = (supervisorsList as any).supervisors;
      }

      setMetaOptions({
        users: leadMeta.users || [],
        stages: (leadMeta.stages || []).filter((s) => s.isClosed),
        supervisors,
      });
    } catch (err: any) {
      console.error('Failed to load filters metadata', err);
    }
  };

  const fetchRevenueData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    setError(null);
    try {
      const res = await getRevenueAnalytics(filters);
      if (res.success && res.data) {
        setData(res.data);
      } else {
        setError('Failed to load revenue data');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'An error occurred fetching revenue analytics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters]);

  useEffect(() => {
    void fetchMetadata();
  }, []);

  useEffect(() => {
    void fetchRevenueData();
  }, [fetchRevenueData]);

  // Realtime Updates via Socket
  useEffect(() => {
    const socket = connectRealtime();
    if (!socket) return;

    const onRevenueUpdated = () => {
      void fetchRevenueData(true);
    };

    socket.on('revenue_updated', onRevenueUpdated);
    return () => {
      socket.off('revenue_updated', onRevenueUpdated);
    };
  }, [fetchRevenueData]);

  const handleFilterChange = (key: keyof RevenueAnalyticsFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      userId: '',
      stageId: '',
      supervisorId: '',
    });
  };

  const getChartData = () => {
    if (!data) return [];
    if (chartView === 'daily') return data.graphs.dailyRevenue;
    if (chartView === 'monthly') return data.graphs.monthlyRevenue;
    return data.graphs.yearlyRevenue;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-[76px] bg-white rounded-3xl border border-gray-100 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-white rounded-3xl border border-gray-100 animate-pulse" />
          ))}
        </div>
        <div className="h-[400px] bg-white rounded-3xl border border-gray-100 animate-pulse" />
      </div>
    );
  }

  const kpis = data?.kpis || { totalRevenue: 0, todayRevenue: 0, thisMonthRevenue: 0, thisYearRevenue: 0 };
  const chartData = getChartData();

  return (
    <div className="space-y-8">
      {/* Immersive Glassmorphism Filter Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/95 rounded-[28px] border border-gray-100 p-6 shadow-sm backdrop-blur-md relative overflow-hidden"
      >
        <div className="flex flex-col xl:flex-row gap-5 xl:items-center xl:justify-between z-10 relative">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <Filter className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-md font-black text-gray-900 leading-tight">Revenue Query System</h3>
              <p className="text-xs font-semibold text-gray-400 mt-0.5">Filter earned sales across workspace users, supervisors, and stages</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:flex xl:items-center gap-3 w-full xl:w-auto">
            {/* User Dropdown */}
            {hasTotalRevenue && (
              <select
                value={filters.userId || ''}
                onChange={(e) => handleFilterChange('userId', e.target.value)}
                className="min-w-[170px] rounded-2xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-xs font-bold text-gray-700 outline-none transition-all focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                aria-label="Filter by Closing User"
              >
                <option value="">All Closing Users</option>
                {metaOptions.users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.label}
                  </option>
                ))}
              </select>
            )}

            {/* Stage Dropdown */}
            <select
              value={filters.stageId || ''}
              onChange={(e) => handleFilterChange('stageId', e.target.value)}
              className="min-w-[170px] rounded-2xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-xs font-bold text-gray-700 outline-none transition-all focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              aria-label="Filter by Closed Stage"
            >
              <option value="">All Closed Stages</option>
              {metaOptions.stages.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>

            {/* Supervisor Dropdown */}
            {hasTotalRevenue && (
              <select
                value={filters.supervisorId || ''}
                onChange={(e) => handleFilterChange('supervisorId', e.target.value)}
                className="min-w-[170px] rounded-2xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-xs font-bold text-gray-700 outline-none transition-all focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                aria-label="Filter by Supervisor"
              >
                <option value="">All Supervisors</option>
                {metaOptions.supervisors.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            )}

            {/* Date From */}
            <input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="min-w-[130px] rounded-2xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-xs font-bold text-gray-700 outline-none transition-all focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              aria-label="Filter date from"
            />

            {/* Date To */}
            <input
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="min-w-[130px] rounded-2xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-xs font-bold text-gray-700 outline-none transition-all focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              aria-label="Filter date to"
            />

            {/* Reset Button */}
            {(filters.userId || filters.stageId || filters.supervisorId || filters.dateFrom || filters.dateTo) ? (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center justify-center rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-black text-gray-600 transition-colors hover:bg-gray-50 active:scale-[0.98]"
              >
                Reset
              </button>
            ) : null}

            {/* Refresh Button */}
            <button
              type="button"
              onClick={() => void fetchRevenueData(true)}
              disabled={refreshing}
              className="inline-flex items-center justify-center rounded-2xl bg-emerald-50 px-4 py-2.5 text-xs font-black text-emerald-600 transition-all hover:bg-emerald-100 active:scale-[0.98] disabled:cursor-wait"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
              Sync
            </button>
          </div>
        </div>
      </motion.div>

      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      {/* Premium KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Earned Revenue */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-sm flex flex-col justify-between h-36"
        >
          <div className="absolute right-0 top-0 -z-10 h-36 w-36 translate-x-4 -translate-y-4 rounded-full bg-emerald-50/50 blur-2xl" />
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-black uppercase tracking-[0.24em] text-gray-400">Total Earned Revenue</div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black tracking-tight text-gray-900">{formatCurrency(kpis.totalRevenue)}</div>
            <p className="text-[10px] font-semibold text-emerald-600 mt-1">Cumulated closed value</p>
          </div>
        </motion.div>

        {/* Today's Revenue */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-sm flex flex-col justify-between h-36"
        >
          <div className="absolute right-0 top-0 -z-10 h-36 w-36 translate-x-4 -translate-y-4 rounded-full bg-indigo-50/50 blur-2xl" />
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-black uppercase tracking-[0.24em] text-gray-400">Today's Closings</div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black tracking-tight text-gray-900">{formatCurrency(kpis.todayRevenue)}</div>
            <p className="text-[10px] font-semibold text-indigo-600 mt-1">Earned within last 24h</p>
          </div>
        </motion.div>

        {/* This Month's Revenue */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-sm flex flex-col justify-between h-36"
        >
          <div className="absolute right-0 top-0 -z-10 h-36 w-36 translate-x-4 -translate-y-4 rounded-full bg-rose-50/50 blur-2xl" />
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-black uppercase tracking-[0.24em] text-gray-400">Monthly Yield</div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black tracking-tight text-gray-900">{formatCurrency(kpis.thisMonthRevenue)}</div>
            <p className="text-[10px] font-semibold text-rose-600 mt-1">Month-to-date trajectory</p>
          </div>
        </motion.div>

        {/* This Year's Revenue */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-sm flex flex-col justify-between h-36"
        >
          <div className="absolute right-0 top-0 -z-10 h-36 w-36 translate-x-4 -translate-y-4 rounded-full bg-amber-50/50 blur-2xl" />
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-black uppercase tracking-[0.24em] text-gray-400">Yearly Target Tracking</div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Award className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black tracking-tight text-gray-900">{formatCurrency(kpis.thisYearRevenue)}</div>
            <p className="text-[10px] font-semibold text-amber-600 mt-1">Year-to-date cumulative</p>
          </div>
        </motion.div>
      </div>

      {/* Main Graph Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-6 sm:p-8 flex flex-col relative overflow-hidden h-[420px]"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-4 border-b border-gray-50 z-10 gap-4">
          <div>
            <h3 className="text-lg font-black text-gray-900 leading-tight">Revenue Stream Velocity</h3>
            <p className="text-xs font-semibold text-gray-400 mt-1">Visualizing generated revenue over time based on closed-won approvals</p>
          </div>
          <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl shrink-0">
            {(['daily', 'monthly', 'yearly'] as const).map((view) => (
              <button
                key={view}
                onClick={() => setChartView(view)}
                className={`px-4 py-1.5 text-[11px] font-black uppercase tracking-wider transition-all rounded-lg ${
                  chartView === view
                    ? 'text-gray-900 bg-white shadow-sm'
                    : 'text-gray-400 hover:text-gray-700'
                }`}
              >
                {view}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 w-full min-h-[260px] relative z-10">
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 text-xs font-black text-gray-400 uppercase tracking-widest">
              No revenue events recorded for this view
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#D1FAE5" stopOpacity={0} />
                  </linearGradient>
                </defs>
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
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(Number(val || 0)), 'Revenue'] as [any, any]}
                  contentStyle={{
                    borderRadius: '16px',
                    border: 'none',
                    boxShadow: '0 10px 25px -3px rgba(0,0,0,0.1)',
                    padding: '12px 16px',
                    fontWeight: 'black',
                    backgroundColor: '#ffffff',
                  }}
                  cursor={{ stroke: '#10B981', strokeWidth: 1.5, strokeDasharray: '4 4' }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10B981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  animationDuration={1000}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-emerald-50/20 to-transparent pointer-events-none" />
      </motion.div>

      {/* Breakdown Widgets Grid */}
      <div className={`grid grid-cols-1 ${hasTotalRevenue ? 'lg:grid-cols-2' : ''} gap-6`}>
        {/* Top Closing Performers */}
        {hasTotalRevenue && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[32px] border border-gray-100 p-6 shadow-sm"
          >
            <div className="flex items-center gap-2.5 mb-6 pb-3 border-b border-gray-50">
              <Trophy className="h-5 w-5 text-amber-500" />
              <div>
                <h3 className="text-sm font-black text-gray-900 leading-tight">Top Performance Leaderboard</h3>
                <p className="text-[11px] font-semibold text-gray-400 mt-0.5">Top closers based on cumulative approved closure revenue</p>
              </div>
            </div>

            <div className="space-y-4">
              {!data?.metrics.topPerformers || data.metrics.topPerformers.length === 0 ? (
                <p className="text-xs font-semibold text-gray-400 py-6 text-center">No closing events registered yet.</p>
              ) : (
                data.metrics.topPerformers.map((user, index) => (
                  <div key={user.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 font-black text-xs text-gray-700 uppercase">
                        {user.name.slice(0, 2)}
                      </div>
                      <div>
                        <div className="text-xs font-black text-gray-800">{user.name}</div>
                        <div className="text-[10px] font-semibold text-gray-400">{user.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-emerald-600">{formatCurrency(user.amount)}</span>
                      <span className="text-[10px] font-black bg-amber-50 text-amber-600 px-2 py-0.5 rounded-md">
                        #{index + 1}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* Revenue by Stage */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[32px] border border-gray-100 p-6 shadow-sm"
        >
          <div className="flex items-center gap-2.5 mb-6 pb-3 border-b border-gray-50">
            <PieChart className="h-5 w-5 text-indigo-500" />
            <div>
              <h3 className="text-sm font-black text-gray-900 leading-tight">Stage Breakdown Yield</h3>
              <p className="text-[11px] font-semibold text-gray-400 mt-0.5">Distribution of earned revenue across closed lead stages</p>
            </div>
          </div>

          <div className="space-y-4">
            {!data?.metrics.revenueByStage || data.metrics.revenueByStage.length === 0 ? (
              <p className="text-xs font-semibold text-gray-400 py-6 text-center">No stage distribution recorded.</p>
            ) : (
              data.metrics.revenueByStage.map((stage) => (
                <div key={stage.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: stage.color || '#10b981' }}
                    />
                    <span className="text-xs font-black text-gray-800">{stage.name}</span>
                  </div>
                  <span className="text-xs font-black text-gray-900">{formatCurrency(stage.amount)}</span>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RevenueAnalytics;
