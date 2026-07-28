import React, { useEffect, useState, useCallback } from 'react';
import {
  Package,
  TrendingUp,
  Award,
  DollarSign,
  BarChart3,
  X,
  User,
  Users,
  Calendar,
  Layers,
  ArrowUpRight,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';
import {
  getProductAnalytics,
  type ProductPerformanceItem,
  type ProductPerformanceResponse,
  type DashboardSummaryFilters,
} from '../../services/dashboard.api';
import useDashboardStore from '../../store/useDashboardStore';
import { formatCurrency } from '../../utils/currency';
import LeadViewDrawer from '../../pages/leads/components/LeadViewDrawer';

export default function ProductPerformanceWidget() {
  const dashboardFilters = useDashboardStore((state) => state.filters);
  const selectedOfficeId = useDashboardStore((state) => state.selectedOfficeId);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ProductPerformanceResponse['data'] | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductPerformanceItem | null>(null);
  const [activeLead, setActiveLead] = useState<any | null>(null);

  const mergedFilters = React.useMemo<DashboardSummaryFilters>(
    () => ({
      ...dashboardFilters,
      officeId: selectedOfficeId || dashboardFilters.officeId,
    }),
    [dashboardFilters, selectedOfficeId],
  );

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getProductAnalytics(mergedFilters);
      if (res.success && res.data) {
        setData(res.data);
      } else {
        setData(null);
      }
    } catch (err: any) {
      console.error('Error fetching product performance analytics:', err);
      setError('Unable to load Product Analytics.');
    } finally {
      setLoading(false);
    }
  }, [mergedFilters]);

  useEffect(() => {
    void fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading && !data) {
    return (
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm animate-pulse space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gray-100" />
          <div className="space-y-2">
            <div className="h-4 w-48 rounded bg-gray-200" />
            <div className="h-3 w-64 rounded bg-gray-100" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-gray-50 border border-gray-100" />
          ))}
        </div>
        <div className="h-64 rounded-2xl bg-gray-50 border border-gray-100" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-rose-100 bg-rose-50/50 p-6 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
            !
          </div>
          <div>
            <p className="text-sm font-black text-rose-900">{error}</p>
            <p className="text-xs text-rose-700 font-semibold mt-0.5">Please check your network connection and try again.</p>
          </div>
        </div>
        <button
          onClick={() => void fetchAnalytics()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-rose-200 text-xs font-bold text-rose-800 hover:bg-rose-100 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </button>
      </div>
    );
  }

  if (!data || !data.hasProducts) {
    return (
      <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm text-center">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
          <Package className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-black text-gray-900">No products available yet</h3>
        <p className="mt-1.5 text-sm font-semibold text-gray-500 max-w-md mx-auto">
          Create products from <span className="font-bold text-emerald-700">Master Configuration → Products</span> to enable product-wise analytics.
        </p>
      </div>
    );
  }

  const { stats, products, hasProductActivity } = data;

  const maxRevenue = Math.max(...products.map((p) => p.totalRevenue), 1);

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm space-y-6 relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600">Product Intelligence</p>
            </div>
            <h3 className="text-xl font-black text-gray-900 tracking-tight mt-0.5">Product Performance Analytics</h3>
            <p className="text-xs font-semibold text-gray-500 mt-0.5">Real-time performance of products across all leads.</p>
          </div>
        </div>

        <button
          onClick={() => void fetchAnalytics()}
          className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 rounded-2xl border border-gray-200 bg-gray-50/80 text-xs font-bold text-gray-700 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-all active:scale-95"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Metrics
        </button>
      </div>

      {/* Summary KPI Cards Above Chart */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4 hover:border-emerald-200 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-gray-500">Products</span>
              <Package className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="mt-2 text-2xl font-black text-gray-900">{stats.totalProducts}</p>
            <p className="mt-1 text-[11px] font-semibold text-gray-400">Total Active Products</p>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-4 hover:border-emerald-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-800">Best Seller</span>
              <Award className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="mt-2 text-lg font-black text-emerald-950 truncate">{stats.bestSellerName}</p>
            <p className="mt-1 text-[11px] font-bold text-emerald-700">{stats.bestSellerLeadCount} Leads Associated</p>
          </div>

          <div className="rounded-2xl border border-sky-100 bg-sky-50/30 p-4 hover:border-sky-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-sky-800">Highest Revenue</span>
              <DollarSign className="w-4 h-4 text-sky-600" />
            </div>
            <p className="mt-2 text-lg font-black text-sky-950 truncate">{formatCurrency(stats.highestRevenueAmount)}</p>
            <p className="mt-1 text-[11px] font-bold text-sky-700 truncate">{stats.highestRevenueName}</p>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-amber-50/30 p-4 hover:border-amber-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-amber-800">Lowest Performer</span>
              <TrendingUp className="w-4 h-4 text-amber-600 rotate-180" />
            </div>
            <p className="mt-2 text-lg font-black text-amber-950 truncate">{stats.lowestPerformerName}</p>
            <p className="mt-1 text-[11px] font-bold text-amber-700">{formatCurrency(stats.lowestPerformerRevenue)}</p>
          </div>

          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/30 p-4 hover:border-indigo-300 transition-all col-span-2 md:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-indigo-800">Avg Product Rev</span>
              <BarChart3 className="w-4 h-4 text-indigo-600" />
            </div>
            <p className="mt-2 text-lg font-black text-indigo-950 truncate">{formatCurrency(stats.avgProductRevenue)}</p>
            <p className="mt-1 text-[11px] font-bold text-indigo-700">Per Product Average</p>
          </div>
        </div>
      )}

      {/* Main Chart Section */}
      {!hasProductActivity ? (
        <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center bg-gray-50/30">
          <ShoppingBag className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-base font-black text-gray-800">No product activity found.</p>
          <p className="text-xs font-medium text-gray-500 mt-1">
            None of the leads match active product assignments under the currently selected dashboard filters.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-wider px-2">
            <span>Product & Performance Details</span>
            <span>Total Revenue</span>
          </div>

          <div className="space-y-3">
            {products.map((prod) => {
              const widthPct = Math.max(Math.round((prod.totalRevenue / maxRevenue) * 100), 4);
              return (
                <div
                  key={prod.id}
                  onClick={() => setSelectedProduct(prod)}
                  className="group relative cursor-pointer rounded-2xl border border-gray-100 bg-white p-4 transition-all duration-200 hover:border-emerald-300 hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-gray-900 text-sm group-hover:text-emerald-600 transition-colors">
                          {prod.name}
                        </span>
                        {prod.code && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                            {prod.code}
                          </span>
                        )}
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                          {prod.leadCount} Leads ({prod.quantitySold} Qty)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-bold text-gray-700">
                      <div>
                        <span className="text-gray-400 text-[10px] uppercase block">Conv Rate</span>
                        <span className="text-emerald-700">{prod.conversionRate}%</span>
                      </div>
                      <div>
                        <span className="text-gray-400 text-[10px] uppercase block">Avg Deal</span>
                        <span>{formatCurrency(prod.averageDealSize)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-gray-400 text-[10px] uppercase block">Total Revenue</span>
                        <span className="text-base font-black text-gray-900 group-hover:text-emerald-600 transition-colors">
                          {formatCurrency(prod.totalRevenue)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Horizontal Bar Chart Representation */}
                  <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden relative flex">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500 group-hover:from-emerald-600 group-hover:to-emerald-500"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px] font-semibold text-gray-500">
                    <div className="flex items-center gap-3">
                      <span>Closed: <strong className="text-emerald-700">{formatCurrency(prod.closedRevenue)}</strong></span>
                      <span>Expected: <strong className="text-sky-700">{formatCurrency(prod.expectedRevenue)}</strong></span>
                    </div>
                    <span className="text-emerald-600 font-bold text-[10px] group-hover:underline flex items-center gap-1">
                      Click for Details <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Interactive Product Side Panel / Slide-Over Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl overflow-y-auto flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-100 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-lg">
                  {selectedProduct.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900">{selectedProduct.name}</h3>
                  <p className="text-xs font-semibold text-gray-500">
                    Unit Price: {formatCurrency(selectedProduct.unitPrice)}
                    {selectedProduct.code ? ` • Code: ${selectedProduct.code}` : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 flex-1">
              {/* Product Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="rounded-2xl bg-gray-50 p-4 border border-gray-100">
                  <span className="text-xs font-bold text-gray-500 uppercase">Total Revenue</span>
                  <p className="mt-1 text-xl font-black text-gray-900">{formatCurrency(selectedProduct.totalRevenue)}</p>
                </div>
                <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-100">
                  <span className="text-xs font-bold text-emerald-700 uppercase">Closed Revenue</span>
                  <p className="mt-1 text-xl font-black text-emerald-900">{formatCurrency(selectedProduct.closedRevenue)}</p>
                </div>
                <div className="rounded-2xl bg-sky-50 p-4 border border-sky-100">
                  <span className="text-xs font-bold text-sky-700 uppercase">Expected Revenue</span>
                  <p className="mt-1 text-xl font-black text-sky-900">{formatCurrency(selectedProduct.expectedRevenue)}</p>
                </div>
                <div className="rounded-2xl bg-gray-50 p-4 border border-gray-100">
                  <span className="text-xs font-bold text-gray-500 uppercase">Leads / Qty</span>
                  <p className="mt-1 text-xl font-black text-gray-900">
                    {selectedProduct.leadCount} / {selectedProduct.quantitySold}
                  </p>
                </div>
                <div className="rounded-2xl bg-gray-50 p-4 border border-gray-100">
                  <span className="text-xs font-bold text-gray-500 uppercase">Conversion Rate</span>
                  <p className="mt-1 text-xl font-black text-emerald-700">{selectedProduct.conversionRate}%</p>
                </div>
                <div className="rounded-2xl bg-gray-50 p-4 border border-gray-100">
                  <span className="text-xs font-bold text-gray-500 uppercase">Avg Deal Size</span>
                  <p className="mt-1 text-xl font-black text-gray-900">{formatCurrency(selectedProduct.averageDealSize)}</p>
                </div>
              </div>

              {/* Pipeline Distribution */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-500" /> Pipeline Distribution
                </h4>
                {selectedProduct.pipelineDistribution.length === 0 ? (
                  <p className="text-xs font-semibold text-gray-400">No stage data available.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.pipelineDistribution.map((stg) => (
                      <div
                        key={stg.id}
                        className="rounded-2xl border px-3.5 py-2 text-xs font-bold flex items-center gap-2"
                        style={{ borderColor: `${stg.color}30`, backgroundColor: `${stg.color}10` }}
                      >
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stg.color }} />
                        <span className="text-gray-900">{stg.name}</span>
                        <span className="px-1.5 py-0.5 rounded-full bg-white text-gray-800 text-[10px]">
                          {stg.count} ({formatCurrency(stg.revenue)})
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Top Assigned Users */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-500" /> Top Assigned Users
                </h4>
                {selectedProduct.topAssignedUsers.length === 0 ? (
                  <p className="text-xs font-semibold text-gray-400">No assigned user data available.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedProduct.topAssignedUsers.map((usr) => (
                      <div key={usr.id} className="rounded-xl border border-gray-100 bg-gray-50/50 p-3 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          <div className="h-7 w-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                            <User className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{usr.name}</p>
                            <p className="text-[10px] font-semibold text-gray-400">{usr.leadCount} Leads</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-gray-900">{formatCurrency(usr.productRevenue)}</p>
                          <p className="text-[10px] font-semibold text-emerald-700">Closed: {formatCurrency(usr.closedRevenue)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Leads */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-500" /> Recent Leads using {selectedProduct.name}
                </h4>
                {selectedProduct.recentLeads.length === 0 ? (
                  <p className="text-xs font-semibold text-gray-400">No recent leads found.</p>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {selectedProduct.recentLeads.map((ld) => (
                      <div
                        key={ld.id}
                        onClick={() => setActiveLead({ id: ld.id, name: ld.name })}
                        className="rounded-xl border border-gray-100 bg-white p-3 hover:border-emerald-300 hover:shadow-sm cursor-pointer transition-all flex items-center justify-between text-xs group"
                      >
                        <div>
                          <p className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors flex items-center gap-1.5">
                            {ld.name}
                            <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </p>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            {ld.companyName ? `${ld.companyName} • ` : ''}Assigned: {ld.assignedUser}
                          </p>
                        </div>

                        <div className="text-right">
                          <span
                            className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold text-white mb-1"
                            style={{ backgroundColor: ld.stageColor }}
                          >
                            {ld.stageName}
                          </span>
                          <p className="font-black text-gray-900">{formatCurrency(ld.amount)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lead Detail Drawer for Clicked Recent Lead */}
      <LeadViewDrawer
        isOpen={!!activeLead}
        lead={activeLead as any}
        onClose={() => setActiveLead(null)}
      />
    </div>
  );
}
