import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  ShoppingBag,
  IndianRupee,
  Trophy,
  TrendingDown,
  Calculator,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
  PieChart,
  Pie,
  AreaChart,
  Area,
} from 'recharts';
import useDashboardStore from '../../store/useDashboardStore';
import {
  getProductAnalytics,
  type ProductAnalyticsResponse,
} from '../../services/dashboard.api';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6', '#6366f1'];

const formatMoney = (val: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val || 0);

const formatNumber = (val: number) => new Intl.NumberFormat('en-US').format(val || 0);

const ProductAnalyticsWidget: React.FC = () => {
  const navigate = useNavigate();
  const dashboardFilters = useDashboardStore((state) => state.filters);
  const [data, setData] = useState<ProductAnalyticsResponse['data'] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    getProductAnalytics({
      range: dashboardFilters.range || '7d',
      officeId: dashboardFilters.officeId,
      userId: dashboardFilters.userId,
      stageId: dashboardFilters.stageId,
      sourceId: dashboardFilters.sourceId,
      status: dashboardFilters.status,
      dateFrom: dashboardFilters.dateFrom,
      dateTo: dashboardFilters.dateTo,
    })
      .then((res) => {
        if (isMounted) {
          if (res?.success && res?.data) {
            setData(res.data);
          } else {
            setData(null);
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err?.message || 'Failed to load product analytics');
          setData(null);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [
    dashboardFilters.range,
    dashboardFilters.officeId,
    dashboardFilters.userId,
    dashboardFilters.stageId,
    dashboardFilters.sourceId,
    dashboardFilters.status,
    dashboardFilters.dateFrom,
    dashboardFilters.dateTo,
  ]);

  if (loading) {
    return (
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          <span className="text-sm font-semibold text-slate-600">Loading Product Analytics...</span>
        </div>
      </div>
    );
  }

  if (error || !data || !data.hasProducts || data.totalProducts === 0) {
    return null; // Automatically hidden if no products exist or loading failed
  }

  const handleProductClick = (productName: string) => {
    if (!productName) return;
    navigate(`/leads?search=${encodeURIComponent(productName)}`);
  };

  return (
    <div className="mt-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <Sparkles className="h-4 w-4" />
            </span>
            <h2 className="text-xl font-black text-slate-900">Product Analytics</h2>
          </div>
          <p className="mt-1 text-xs font-medium text-slate-500">
            Real-time sales performance, product revenue rankings, and conversion metrics.
          </p>
        </div>
      </div>

      {/* 6 Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {/* Card 1: Total Products */}
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:border-slate-200 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Products</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">{formatNumber(data.totalProducts)}</p>
          <p className="mt-1 text-[11px] font-medium text-slate-400">Configured Master Products</p>
        </div>

        {/* Card 2: Products Sold */}
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:border-slate-200 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Products Sold</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-600">{formatNumber(data.productsSold)}</p>
          <p className="mt-1 text-[11px] font-medium text-slate-400">Units attached to leads</p>
        </div>

        {/* Card 3: Total Product Revenue */}
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:border-slate-200 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Product Revenue</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <IndianRupee className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-xl font-black text-slate-900">{formatMoney(data.totalRevenue)}</p>
          <p className="mt-1 text-[11px] font-medium text-slate-400">Sum of product sales</p>
        </div>

        {/* Card 4: Best Selling Product */}
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:border-slate-200 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Best Seller</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <Trophy className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 truncate text-base font-extrabold text-slate-900" title={data.bestSellingProduct?.name || 'N/A'}>
            {data.bestSellingProduct?.name || 'None'}
          </p>
          <p className="mt-1 text-[11px] font-medium text-slate-500">
            {data.bestSellingProduct ? `${formatNumber(data.bestSellingProduct.quantitySold)} sold (${formatMoney(data.bestSellingProduct.revenue)})` : 'No sales recorded'}
          </p>
        </div>

        {/* Card 5: Lowest Selling Product */}
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:border-slate-200 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Lowest Seller</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 truncate text-base font-extrabold text-slate-900" title={data.lowestSellingProduct?.name || 'N/A'}>
            {data.lowestSellingProduct?.name || 'None'}
          </p>
          <p className="mt-1 text-[11px] font-medium text-slate-500">
            {data.lowestSellingProduct ? `${formatNumber(data.lowestSellingProduct.quantitySold)} sold (${formatMoney(data.lowestSellingProduct.revenue)})` : 'No sales recorded'}
          </p>
        </div>

        {/* Card 6: Average Product Value */}
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:border-slate-200 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Avg Unit Price</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
              <Calculator className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-xl font-black text-slate-900">{formatMoney(data.averageProductValue)}</p>
          <p className="mt-1 text-[11px] font-medium text-slate-400">Avg value per product sold</p>
        </div>
      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Chart 1: Product Sales Ranking */}
        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Product Sales Ranking</h3>
              <p className="text-xs font-medium text-slate-500">Revenue contribution per product</p>
            </div>
          </div>
          <div className="mt-6 h-72 w-full">
            {data.ranking.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={data.ranking.slice(0, 8)}
                  margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis
                    type="number"
                    tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                    stroke="#94a3b8"
                    fontSize={11}
                  />
                  <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={12} width={120} />
                  <Tooltip
                    formatter={(val: any) => [formatMoney(Number(val)), 'Revenue']}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff' }}
                    itemStyle={{ color: '#38bdf8' }}
                  />
                  <Bar
                    dataKey="revenue"
                    radius={[0, 8, 8, 0]}
                    cursor="pointer"
                    onClick={(entry: any) => handleProductClick(entry?.name || entry?.payload?.name || '')}
                  >
                    {data.ranking.slice(0, 8).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs font-medium text-slate-400">
                No product revenue data available
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Revenue Contribution Donut Chart */}
        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Revenue Share</h3>
              <p className="text-xs font-medium text-slate-500">Percentage distribution</p>
            </div>
          </div>
          <div className="mt-6 flex h-72 flex-col items-center justify-center">
            {data.revenueContribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.revenueContribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="revenue"
                  >
                    {data.revenueContribution.map((_, index) => (
                      <Cell key={`pie-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any, name: any, item: any) => [
                      `${formatMoney(Number(val))} (${item.payload.percentage}%)`,
                      name,
                    ]}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs font-medium text-slate-400">No revenue data to display</div>
            )}
          </div>
        </div>
      </div>

      {/* Chart 3: Product Revenue Trend */}
      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Product Revenue Trend</h3>
            <p className="text-xs font-medium text-slate-500">Sales velocity over time ({dashboardFilters.range || '7d'})</p>
          </div>
        </div>
        <div className="mt-6 h-64 w-full">
          {data.revenueTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.revenueTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="productRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`} />
                <Tooltip
                  formatter={(val: any) => [formatMoney(Number(val)), 'Revenue']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#productRevenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-xs font-medium text-slate-400">
              No trend data available
            </div>
          )}
        </div>
      </div>

      {/* Performance Table */}
      <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50/50 p-6">
          <h3 className="text-base font-extrabold text-slate-900">Product Performance Overview</h3>
          <p className="text-xs font-medium text-slate-500">
            Click any row to filter Leads by that product.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              <tr>
                <th className="px-6 py-3.5">Product</th>
                <th className="px-6 py-3.5 text-center">Quantity Sold</th>
                <th className="px-6 py-3.5 text-right">Revenue</th>
                <th className="px-6 py-3.5 text-right">Average Sale</th>
                <th className="px-6 py-3.5 text-center">Closed Leads</th>
                <th className="px-6 py-3.5 text-center">Open Leads</th>
                <th className="px-6 py-3.5 text-right">Conversion %</th>
                <th className="px-6 py-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {data.performanceTable.length > 0 ? (
                data.performanceTable.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => handleProductClick(item.name)}
                    className="group cursor-pointer transition-colors hover:bg-emerald-50/30"
                  >
                    <td className="px-6 py-4 font-bold text-slate-900 group-hover:text-emerald-700">
                      {item.name}
                      {item.code ? <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">{item.code}</span> : null}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-slate-900">{formatNumber(item.quantitySold)}</td>
                    <td className="px-6 py-4 text-right font-extrabold text-emerald-600">{formatMoney(item.revenue)}</td>
                    <td className="px-6 py-4 text-right text-slate-600">{formatMoney(item.averageSale)}</td>
                    <td className="px-6 py-4 text-center font-semibold text-emerald-600">{item.closedLeads}</td>
                    <td className="px-6 py-4 text-center font-semibold text-blue-600">{item.openLeads}</td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900">{item.conversionRate}%</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600 transition-colors group-hover:bg-emerald-500 group-hover:text-white">
                        View Leads <ArrowUpRight className="h-3 w-3" />
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-xs font-medium text-slate-400">
                    No product data available for current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductAnalyticsWidget;
