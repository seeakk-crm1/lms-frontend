import React, { useEffect, useState } from 'react';
import {
  ArrowDownToLine,
  BarChart3,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  FileSpreadsheet,
  Filter,
  PhoneCall,
  PhoneOff,
  RefreshCw,
  Search,
  Sparkles,
  TrendingUp,
  User,
  Users,
} from 'lucide-react';
import {
  CallSummaryReportData,
  exportCallReport,
  fetchCallDetailedReport,
  fetchCallSummaryReport,
} from '../../services/calls.api';

export const CallPerformanceReportPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'summary' | 'detailed'>('summary');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Filters State
  const [datePreset, setDatePreset] = useState<'today' | 'yesterday' | 'this_week' | 'last_7' | 'this_month' | 'last_30' | 'custom'>('this_month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [connectionFilter, setConnectionFilter] = useState<'ALL' | 'CONNECTED' | 'NOT_CONNECTED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Report Data State
  const [summaryData, setSummaryData] = useState<CallSummaryReportData | null>(null);
  const [detailedData, setDetailedData] = useState<{ rows: any[]; pagination: any } | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    applyDatePreset(datePreset);
  }, [datePreset]);

  useEffect(() => {
    loadReports();
  }, [startDate, endDate, connectionFilter, searchQuery, page, activeTab]);

  const applyDatePreset = (preset: string) => {
    const now = new Date();
    let start = new Date();
    let end = new Date();

    if (preset === 'today') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (preset === 'yesterday') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    } else if (preset === 'this_week') {
      const day = now.getDay();
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day);
    } else if (preset === 'last_7') {
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (preset === 'this_month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (preset === 'last_30') {
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    if (preset !== 'custom') {
      setStartDate(start.toISOString().split('T')[0]);
      setEndDate(end.toISOString().split('T')[0]);
    }
  };

  const loadReports = async () => {
    setLoading(true);
    try {
      const filterParams: any = {
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        connectionStatus: connectionFilter !== 'ALL' ? connectionFilter : undefined,
      };

      if (activeTab === 'summary') {
        const data = await fetchCallSummaryReport(filterParams);
        setSummaryData(data);
      } else {
        const data = await fetchCallDetailedReport({
          ...filterParams,
          search: searchQuery || undefined,
          page,
          limit: 20,
        });
        setDetailedData(data);
      }
    } catch (err) {
      console.error('Failed to fetch call reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'xlsx' | 'csv') => {
    setExporting(true);
    try {
      const filters = {
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        connectionStatus: connectionFilter !== 'ALL' ? connectionFilter : undefined,
      };
      const blobData = await exportCallReport({ format, filters });

      const url = window.URL.createObjectURL(new Blob([blobData]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `call_performance_report_${Date.now()}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white shadow-xl border border-emerald-900/30">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>Reports & Analytics</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-wide">Call Performance Analytics</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Track daily unique call attempts, agent connection ratios, substage transitions, and follow-up activities.
          </p>
        </div>

        {/* Export Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('xlsx')}
            disabled={exporting}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{exporting ? 'Exporting...' : 'Export Excel (.xlsx)'}</span>
          </button>

          <button
            onClick={() => handleExport('csv')}
            disabled={exporting}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3 dark:bg-slate-900 dark:border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Date Range Presets */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl dark:bg-slate-800">
            {[
              { key: 'today', label: 'Today' },
              { key: 'yesterday', label: 'Yesterday' },
              { key: 'this_week', label: 'This Week' },
              { key: 'last_7', label: 'Last 7 Days' },
              { key: 'this_month', label: 'This Month' },
              { key: 'last_30', label: 'Last 30 Days' },
              { key: 'custom', label: 'Custom' },
            ].map((p) => (
              <button
                key={p.key}
                onClick={() => setDatePreset(p.key as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  datePreset === p.key
                    ? 'bg-slate-900 text-white shadow-sm dark:bg-emerald-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50 dark:text-slate-300'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Connection Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={connectionFilter}
              onChange={(e) => setConnectionFilter(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            >
              <option value="ALL">All Connections</option>
              <option value="CONNECTED">Connected Only</option>
              <option value="NOT_CONNECTED">Not Connected Only</option>
            </select>
          </div>
        </div>

        {/* Custom Date Inputs if Custom Selected */}
        {datePreset === 'custom' && (
          <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-1 rounded-lg border border-slate-300 text-xs dark:bg-slate-800 dark:border-slate-700"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-1 rounded-lg border border-slate-300 text-xs dark:bg-slate-800 dark:border-slate-700"
              />
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('summary')}
          className={`px-5 py-2.5 font-bold text-xs tracking-wide border-b-2 transition ${
            activeTab === 'summary'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Summary Performance Report
        </button>
        <button
          onClick={() => setActiveTab('detailed')}
          className={`px-5 py-2.5 font-bold text-xs tracking-wide border-b-2 transition ${
            activeTab === 'detailed'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Detailed Call Logs
        </button>
      </div>

      {loading ? (
        <div className="p-16 text-center text-slate-500 text-sm">Loading call performance analytics...</div>
      ) : activeTab === 'summary' && summaryData ? (
        <div className="space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Attempts</div>
              <div className="text-2xl font-black text-slate-900 mt-1 dark:text-white">{summaryData.metrics.totalCalls}</div>
              <div className="text-[10px] text-slate-500 mt-1">All dialing attempts</div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 shadow-sm dark:bg-emerald-950/30 dark:border-emerald-800">
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Unique Calls</div>
              <div className="text-2xl font-black text-emerald-950 mt-1 dark:text-emerald-200">{summaryData.metrics.uniqueCalls}</div>
              <div className="text-[10px] text-emerald-700/80 mt-1">Distinct lead-date pairs</div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Calls Connected</div>
              <div className="text-2xl font-black text-emerald-600 mt-1">{summaryData.metrics.connectedCalls}</div>
              <div className="text-[10px] text-slate-500 mt-1">Successful conversations</div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Not Connected</div>
              <div className="text-2xl font-black text-rose-600 mt-1">{summaryData.metrics.notConnectedCalls}</div>
              <div className="text-[10px] text-slate-500 mt-1">Unanswered / busy</div>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200 shadow-sm dark:bg-purple-950/30 dark:border-purple-800">
              <div className="text-[11px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">Connection Rate</div>
              <div className="text-2xl font-black text-purple-950 mt-1 dark:text-purple-200">{summaryData.metrics.connectionRate}%</div>
              <div className="text-[10px] text-purple-700/80 mt-1">Connected / Total</div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 shadow-sm dark:bg-amber-950/30 dark:border-amber-800">
              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">Leads Stage Moved</div>
              <div className="text-2xl font-black text-amber-950 mt-1 dark:text-amber-200">{summaryData.metrics.leadsMoved}</div>
              <div className="text-[10px] text-amber-700/80 mt-1">Pipeline progressions</div>
            </div>
          </div>

          {/* User-Wise Summary Table with In-Cell Data Bars */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-800">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between dark:bg-slate-800/50 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">User Call Performance Breakdown</h3>
              <span className="text-xs text-slate-500">{summaryData.userSummaryList.length} users active</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200 dark:bg-slate-800/80 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-3 min-w-[160px]">User Name</th>
                    <th className="px-4 py-3 text-right min-w-[120px]">Unique Calls</th>
                    <th className="px-4 py-3 text-right min-w-[100px]">Total Calls</th>
                    <th className="px-4 py-3 text-right min-w-[130px]">Connected</th>
                    <th className="px-4 py-3 text-right min-w-[120px]">Not Connected</th>
                    <th className="px-4 py-3 text-right min-w-[130px]">Connection Rate</th>
                    <th className="px-4 py-3 text-right min-w-[120px]">Positive</th>
                    <th className="px-4 py-3 text-right min-w-[130px]">Follow-ups</th>
                    <th className="px-4 py-3 text-right min-w-[130px]">Stage Moved</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {summaryData.userSummaryList.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-400 italic">
                        No call activity recorded for the selected date range.
                      </td>
                    </tr>
                  ) : (
                    summaryData.userSummaryList.map((row) => {
                      const maxVals = summaryData.maxValues;
                      const uniqueBarPct = Math.min((row.uniqueCalls / maxVals.uniqueCalls) * 100, 100);
                      const totalBarPct = Math.min((row.totalAttempts / maxVals.totalAttempts) * 100, 100);
                      const connBarPct = Math.min((row.connectedCalls / maxVals.connectedCalls) * 100, 100);
                      const notConnBarPct = Math.min((row.notConnectedCalls / maxVals.notConnectedCalls) * 100, 100);
                      const rateBarPct = row.connectionRate;

                      return (
                        <tr key={row.userId} className="hover:bg-slate-50/80 transition dark:hover:bg-slate-800/40">
                          <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                            <div>{row.userName}</div>
                            <div className="text-[10px] text-slate-400 font-normal">{row.officeName}</div>
                          </td>

                          {/* Unique Calls Data Bar */}
                          <td className="px-4 py-3 text-right relative">
                            <div
                              className="absolute top-1 bottom-1 right-1 bg-emerald-100/70 rounded-md transition-all dark:bg-emerald-950/40"
                              style={{ width: `${uniqueBarPct}%` }}
                            />
                            <span className="relative z-10 font-bold text-emerald-900 dark:text-emerald-200">
                              {row.uniqueCalls}
                            </span>
                          </td>

                          {/* Total Calls Data Bar */}
                          <td className="px-4 py-3 text-right relative">
                            <div
                              className="absolute top-1 bottom-1 right-1 bg-slate-200/60 rounded-md transition-all dark:bg-slate-700/40"
                              style={{ width: `${totalBarPct}%` }}
                            />
                            <span className="relative z-10 font-bold text-slate-900 dark:text-white">
                              {row.totalAttempts}
                            </span>
                          </td>

                          {/* Connected Data Bar */}
                          <td className="px-4 py-3 text-right relative">
                            <div
                              className="absolute top-1 bottom-1 right-1 bg-teal-100/70 rounded-md transition-all dark:bg-teal-950/40"
                              style={{ width: `${connBarPct}%` }}
                            />
                            <span className="relative z-10 font-bold text-teal-800 dark:text-teal-300">
                              {row.connectedCalls}
                            </span>
                          </td>

                          {/* Not Connected Data Bar */}
                          <td className="px-4 py-3 text-right relative">
                            <div
                              className="absolute top-1 bottom-1 right-1 bg-rose-100/60 rounded-md transition-all dark:bg-rose-950/40"
                              style={{ width: `${notConnBarPct}%` }}
                            />
                            <span className="relative z-10 font-bold text-rose-700 dark:text-rose-400">
                              {row.notConnectedCalls}
                            </span>
                          </td>

                          {/* Connection Rate Bar */}
                          <td className="px-4 py-3 text-right relative">
                            <div
                              className="absolute top-1 bottom-1 right-1 bg-purple-100/70 rounded-md transition-all dark:bg-purple-950/40"
                              style={{ width: `${rateBarPct}%` }}
                            />
                            <span className="relative z-10 font-bold text-purple-900 dark:text-purple-300">
                              {row.connectionRate}%
                            </span>
                          </td>

                          <td className="px-4 py-3 text-right font-medium text-slate-700 dark:text-slate-300">
                            {row.positiveOutcomes}
                          </td>

                          <td className="px-4 py-3 text-right font-medium text-slate-700 dark:text-slate-300">
                            {row.followUpsCreated}
                          </td>

                          <td className="px-4 py-3 text-right font-bold text-amber-700 dark:text-amber-400">
                            {row.leadsMoved}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : activeTab === 'detailed' && detailedData ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-800 space-y-4">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between dark:bg-slate-800/50 dark:border-slate-800">
            <div className="relative w-72">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search lead, phone, notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              />
            </div>
            <span className="text-xs text-slate-500 font-medium">Total: {detailedData.pagination.total} records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-500 font-bold uppercase tracking-wider dark:bg-slate-800">
                <tr>
                  <th className="px-4 py-3">Date & Time</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Lead Name</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Main Stage</th>
                  <th className="px-4 py-3">Substage</th>
                  <th className="px-4 py-3">Outcome Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {detailedData.rows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400 italic">
                      No detailed call records match your query.
                    </td>
                  </tr>
                ) : (
                  detailedData.rows.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50 transition dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                        {new Date(r.submittedAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                        {r.user?.name || r.user?.email}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{r.lead?.name}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{r.lead?.phone || 'N/A'}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded font-bold ${
                            r.connectionStatus === 'CONNECTED'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {r.connectionStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">
                        {r.targetStage?.name || r.substage?.leadStage?.name || '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{r.substage?.name || '—'}</td>
                      <td className="px-4 py-3 text-slate-500 max-w-xs truncate">{r.outcomeNotes || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {detailedData.pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between dark:border-slate-800">
              <span className="text-xs text-slate-500">
                Page {detailedData.pagination.page} of {detailedData.pagination.totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="px-3 py-1 rounded-lg border border-slate-300 text-xs disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  disabled={page >= detailedData.pagination.totalPages}
                  onClick={() => setPage(page + 1)}
                  className="px-3 py-1 rounded-lg border border-slate-300 text-xs disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
