import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  FileSpreadsheet,
  Filter,
  PhoneCall,
  PhoneOff,
  Search,
  Users,
  Layers,
} from 'lucide-react';
import ReportPageShell from '../../modules/reports/shared/ReportPageShell';
import ReportFiltersBar from '../../modules/reports/shared/ReportFiltersBar';
import { createDefaultReportFilters } from '../../modules/reports/shared/reportFilterDefaults';
import { buildApiFilters, useReportUsers } from '../../modules/reports/shared/useReportUsers';
import {
  CallSummaryReportData,
  exportCallReport,
  fetchCallDetailedReport,
  fetchCallSummaryReport,
} from '../../services/calls.api';
import { getCallMetricBarWidth } from '../../utils/barWidthUtils';

export const CallPerformanceReportPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'summary' | 'substages' | 'detailed'>('summary');
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [connectionFilter, setConnectionFilter] = useState<'ALL' | 'CONNECTED' | 'NOT_CONNECTED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [filters, setFilters] = useState(createDefaultReportFilters());
  const { data: users = [] } = useReportUsers();
  const apiFilters = useMemo(() => buildApiFilters(filters, users), [filters, users]);

  // Report Data State
  const [summaryData, setSummaryData] = useState<CallSummaryReportData | null>(null);
  const [detailedData, setDetailedData] = useState<{ rows: any[]; pagination: any } | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadReports();
  }, [apiFilters, connectionFilter, searchQuery, page, activeTab]);

  const loadReports = async () => {
    setLoading(true);
    setHasError(false);
    try {
      const userIds = apiFilters.userId
        ? Array.isArray(apiFilters.userId)
          ? apiFilters.userId
          : [apiFilters.userId]
        : undefined;

      const filterParams: any = {
        startDate: apiFilters.startDate,
        endDate: apiFilters.endDate,
        userIds,
        officeId: apiFilters.officeId,
        departmentId: apiFilters.departmentId,
        connectionStatus: connectionFilter !== 'ALL' ? connectionFilter : undefined,
      };

      if (activeTab === 'summary' || activeTab === 'substages') {
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
      setHasError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'xlsx' | 'csv') => {
    setExporting(true);
    try {
      const userIds = apiFilters.userId
        ? Array.isArray(apiFilters.userId)
          ? apiFilters.userId
          : [apiFilters.userId]
        : undefined;

      const filterParams = {
        startDate: apiFilters.startDate,
        endDate: apiFilters.endDate,
        userIds,
        officeId: apiFilters.officeId,
        departmentId: apiFilters.departmentId,
        connectionStatus: connectionFilter !== 'ALL' ? connectionFilter : undefined,
      };
      const blobData = await exportCallReport({ format, filters: filterParams });

      const url = window.URL.createObjectURL(new Blob([blobData]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `call_performance_report_${Date.now()}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  const metrics = summaryData?.metrics || {
    totalCalls: 0,
    uniqueCalls: 0,
    connectedCalls: 0,
    notConnectedCalls: 0,
    connectionRate: 0,
    leadsMoved: 0,
  };

  const userList = summaryData?.userSummaryList || [];
  const substageBreakdown = summaryData?.substageBreakdown || [];
  const maxValues = summaryData?.maxValues || {
    totalAttempts: 1,
    uniqueCalls: 1,
    connectedCalls: 1,
    notConnectedCalls: 1,
    followUpsCreated: 1,
    leadsMoved: 1,
  };

  const selectedSubstagesList = summaryData?.selectedSubstages || [];

  return (
    <ReportPageShell
      title="Call Performance Analytics"
      description="Track daily unique call attempts, agent connection ratios, substage transitions, and follow-up activities."
      icon={<PhoneCall className="text-emerald-500" size={28} />}
      filters={<ReportFiltersBar filters={filters} setFilters={setFilters} />}
      onExportCsv={() => handleExport('xlsx')}
    >
      <div className="space-y-6">
        {hasError && (
          <div className="rounded-3xl border border-rose-200 bg-rose-50/50 p-6 text-center space-y-3">
            <p className="text-sm font-bold text-rose-800">Unable to load call performance analytics right now.</p>
            <button
              type="button"
              onClick={() => loadReports()}
              className="px-4 py-2 text-xs font-bold bg-rose-600 text-white rounded-xl shadow hover:bg-rose-700 transition"
            >
              Retry Call Report
            </button>
          </div>
        )}

        {/* Metric Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Total Attempts</p>
            <p className="mt-1 text-2xl font-black text-gray-900">{metrics.totalCalls.toLocaleString()}</p>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 shadow-sm">
            <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Unique Calls</p>
            <p className="mt-1 text-2xl font-black text-emerald-700">{metrics.uniqueCalls.toLocaleString()}</p>
          </div>
          <div className="rounded-2xl border border-teal-100 bg-teal-50/50 p-4 shadow-sm">
            <p className="text-[11px] font-bold text-teal-700 uppercase tracking-wider">Attended Calls</p>
            <p className="mt-1 text-2xl font-black text-teal-700">{metrics.connectedCalls.toLocaleString()}</p>
          </div>
          <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-4 shadow-sm">
            <p className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">Not Attended</p>
            <p className="mt-1 text-2xl font-black text-rose-700">{metrics.notConnectedCalls.toLocaleString()}</p>
          </div>
          <div className="rounded-2xl border border-purple-100 bg-purple-50/50 p-4 shadow-sm col-span-2 md:col-span-1">
            <p className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">Connection Rate</p>
            <p className="mt-1 text-2xl font-black text-purple-700">{metrics.connectionRate}%</p>
          </div>
        </div>

        {/* Section Navigation Tabs & Connection Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
                activeTab === 'summary'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Summary Performance Report
            </button>
            <button
              onClick={() => setActiveTab('substages')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
                activeTab === 'substages'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Substage Breakdown ({substageBreakdown.length})
            </button>
            <button
              onClick={() => setActiveTab('detailed')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
                activeTab === 'detailed'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Detailed Call Logs
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <select
                value={connectionFilter}
                onChange={(e) => setConnectionFilter(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-700 shadow-sm"
              >
                <option value="ALL">All Connection Statuses</option>
                <option value="CONNECTED">Attended Calls Only</option>
                <option value="NOT_CONNECTED">Not Attended Calls Only</option>
              </select>
            </div>

            <button
              onClick={() => handleExport('csv')}
              disabled={exporting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-700 shadow-sm hover:bg-gray-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Summary Performance Report */}
        {activeTab === 'summary' && (
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-sm">User Call Performance Breakdown</h3>
              <span className="text-xs font-semibold text-gray-500">{userList.length} users active</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="text-[11px] text-gray-500 uppercase bg-gray-50/80 font-black border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 min-w-[150px]">User Name</th>
                    <th className="px-4 py-3 min-w-[130px]">Unique Calls</th>
                    <th className="px-4 py-3 min-w-[130px]">Total Calls</th>
                    <th className="px-4 py-3 min-w-[130px]">Attended Calls</th>
                    <th className="px-4 py-3 min-w-[130px]">Not Attended</th>
                    <th className="px-4 py-3 text-center min-w-[110px]">Connection Rate</th>
                    {selectedSubstagesList.map((sub) => (
                      <th key={sub.id} className="px-4 py-3 min-w-[140px]">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: sub.color || '#3b82f6' }} />
                          <div>
                            <div className="font-black text-gray-900 leading-tight">{sub.name}</div>
                            {sub.parentStageName && (
                              <div className="text-[9px] text-gray-400 font-normal lowercase">{sub.parentStageName}</div>
                            )}
                          </div>
                        </div>
                      </th>
                    ))}
                    <th className="px-4 py-3 text-right min-w-[110px]">Follow-ups</th>
                    <th className="px-4 py-3 text-right min-w-[110px]">Stage Moved</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-semibold">
                  {userList.length === 0 ? (
                    <tr>
                      <td colSpan={8 + selectedSubstagesList.length} className="px-4 py-8 text-center text-gray-400 font-medium italic">
                        No call activity found for the selected filters.
                      </td>
                    </tr>
                  ) : (
                    userList.map((user: any) => {
                      const totalPct = user.totalAttempts > 0 ? 100 : 0;
                      const uniquePct = getCallMetricBarWidth(user.uniqueCalls, user.totalAttempts);
                      const connPct = getCallMetricBarWidth(user.connectedCalls, user.totalAttempts);
                      const notConnPct = getCallMetricBarWidth(user.notConnectedCalls, user.totalAttempts);

                      return (
                        <tr key={user.userId} className="hover:bg-gray-50/80 transition-colors">
                          <td className="px-4 py-3 font-bold text-gray-900">
                            <div>{user.userName}</div>
                            <div className="text-[10px] text-gray-400 font-normal">{user.officeName} • {user.departmentName}</div>
                          </td>

                          {/* Unique Calls Bar */}
                          <td className="px-4 py-3">
                            <div className="relative flex items-center justify-between h-7 px-2.5 rounded-lg bg-emerald-50/50 border border-emerald-100/60 overflow-hidden">
                              <div
                                className="absolute left-0 top-0 bottom-0 bg-emerald-200/60 rounded-r-md transition-all duration-300"
                                style={{ width: `${uniquePct}%` }}
                              />
                              <span className="relative z-10 font-bold text-emerald-900">{user.uniqueCalls}</span>
                            </div>
                          </td>

                          {/* Total Calls Bar */}
                          <td className="px-4 py-3">
                            <div className="relative flex items-center justify-between h-7 px-2.5 rounded-lg bg-blue-50/50 border border-blue-100/60 overflow-hidden">
                              <div
                                className="absolute left-0 top-0 bottom-0 bg-blue-200/60 rounded-r-md transition-all duration-300"
                                style={{ width: `${totalPct}%` }}
                              />
                              <span className="relative z-10 font-bold text-blue-900">{user.totalAttempts}</span>
                            </div>
                          </td>

                          {/* Attended Calls Bar */}
                          <td className="px-4 py-3">
                            <div className="relative flex items-center justify-between h-7 px-2.5 rounded-lg bg-teal-50/50 border border-teal-100/60 overflow-hidden">
                              <div
                                className="absolute left-0 top-0 bottom-0 bg-teal-200/60 rounded-r-md transition-all duration-300"
                                style={{ width: `${connPct}%` }}
                              />
                              <span className="relative z-10 font-bold text-teal-900">{user.connectedCalls}</span>
                            </div>
                          </td>

                          {/* Not Attended Bar */}
                          <td className="px-4 py-3">
                            <div className="relative flex items-center justify-between h-7 px-2.5 rounded-lg bg-rose-50/50 border border-rose-100/60 overflow-hidden">
                              <div
                                className="absolute left-0 top-0 bottom-0 bg-rose-200/60 rounded-r-md transition-all duration-300"
                                style={{ width: `${notConnPct}%` }}
                              />
                              <span className="relative z-10 font-bold text-rose-900">{user.notConnectedCalls}</span>
                            </div>
                          </td>

                          <td className="px-4 py-3 text-center">
                            <span className="inline-block px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 font-bold border border-purple-100">
                              {user.connectionRate}%
                            </span>
                          </td>

                          {/* Dynamic Substage Columns */}
                          {selectedSubstagesList.map((sub) => {
                            const count = user.substageCounts?.[sub.id] || 0;
                            const barPct = getCallMetricBarWidth(count, user.totalAttempts);

                            return (
                              <td key={sub.id} className="px-4 py-3">
                                <div
                                  className="relative flex items-center justify-between h-7 px-2.5 rounded-lg border overflow-hidden"
                                  style={{
                                    backgroundColor: `${sub.color || '#3b82f6'}10`,
                                    borderColor: `${sub.color || '#3b82f6'}30`,
                                  }}
                                >
                                  <div
                                    className="absolute left-0 top-0 bottom-0 rounded-r-md transition-all duration-300"
                                    style={{
                                      width: `${barPct}%`,
                                      backgroundColor: `${sub.color || '#3b82f6'}35`,
                                    }}
                                  />
                                  <span className="relative z-10 font-bold" style={{ color: sub.color || '#1e293b' }}>
                                    {count}
                                  </span>
                                </div>
                              </td>
                            );
                          })}

                          <td className="px-4 py-3 text-right font-bold text-gray-800">{user.followUpsCreated}</td>
                          <td className="px-4 py-3 text-right font-bold text-gray-800">{user.leadsMoved}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Substage Breakdown */}
        {activeTab === 'substages' && (
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-sm">Substage Selection Breakdown</h3>
              <span className="text-xs font-semibold text-gray-500">{substageBreakdown.length} substages selected</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="text-[11px] text-gray-500 uppercase bg-gray-50/80 font-black border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3">Substage Name</th>
                    <th className="px-4 py-3">Parent Lead Stage</th>
                    <th className="px-4 py-3 text-center">Outcome Category</th>
                    <th className="px-4 py-3 text-right">Selected Count</th>
                    <th className="px-4 py-3 text-right">Unique Leads</th>
                    <th className="px-4 py-3 text-right">Active Users</th>
                    <th className="px-4 py-3 text-right">Attended Calls</th>
                    <th className="px-4 py-3 text-right">Not Attended</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-semibold">
                  {substageBreakdown.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-gray-400 font-medium italic">
                        No substage selections found for the selected filters.
                      </td>
                    </tr>
                  ) : (
                    substageBreakdown.map((sub: any) => (
                      <tr key={sub.substageId} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-4 py-3 font-bold text-gray-900">
                          <span
                            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold border"
                            style={{
                              backgroundColor: `${sub.color}15`,
                              color: sub.color,
                              borderColor: `${sub.color}30`,
                            }}
                          >
                            {sub.name}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-bold text-gray-700">{sub.stageName}</td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                              sub.outcomeCategory === 'POSITIVE'
                                ? 'bg-emerald-100 text-emerald-800'
                                : sub.outcomeCategory === 'NEGATIVE'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {sub.outcomeCategory}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-black text-gray-900">{sub.selectedCount}</td>
                        <td className="px-4 py-3 text-right font-bold text-gray-700">{sub.uniqueLeads}</td>
                        <td className="px-4 py-3 text-right font-bold text-gray-700">{sub.usersCount}</td>
                        <td className="px-4 py-3 text-right font-bold text-teal-700">{sub.connectedCalls}</td>
                        <td className="px-4 py-3 text-right font-bold text-rose-700">{sub.notConnectedCalls}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Detailed Call Logs */}
        {activeTab === 'detailed' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search lead name, phone, user, notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-800 shadow-sm"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-600">
                  <thead className="text-[11px] text-gray-500 uppercase bg-gray-50/80 font-black border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3">Date & Time</th>
                      <th className="px-4 py-3">User</th>
                      <th className="px-4 py-3">Lead Name</th>
                      <th className="px-4 py-3">Phone</th>
                      <th className="px-4 py-3">Connection Status</th>
                      <th className="px-4 py-3">Target Stage</th>
                      <th className="px-4 py-3">Selected Substage</th>
                      <th className="px-4 py-3">Outcome Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-semibold">
                    {loading ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                          Loading call logs...
                        </td>
                      </tr>
                    ) : !detailedData?.rows || detailedData.rows.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-8 text-center text-gray-400 italic">
                          No call logs found for the selected criteria.
                        </td>
                      </tr>
                    ) : (
                      detailedData.rows.map((row: any) => (
                        <tr key={row.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                            {row.submittedAt ? new Date(row.submittedAt).toLocaleString() : 'N/A'}
                          </td>
                          <td className="px-4 py-3 font-bold text-gray-900">
                            <div>{row.user?.name || row.user?.email || 'N/A'}</div>
                            <div className="text-[10px] text-gray-400 font-normal">
                              {row.user?.office?.name || 'N/A'}
                            </div>
                          </td>
                          <td className="px-4 py-3 font-bold text-gray-900">{row.lead?.name || 'N/A'}</td>
                          <td className="px-4 py-3 text-gray-700 font-mono">{row.lead?.phone || 'N/A'}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                row.connectionStatus === 'CONNECTED'
                                  ? 'bg-teal-100 text-teal-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {row.connectionStatus === 'CONNECTED' ? 'Attended' : 'Not Attended'}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-bold text-gray-800">
                            {row.targetStage?.name || row.substage?.leadStage?.name || 'N/A'}
                          </td>
                          <td className="px-4 py-3">
                            {row.substage ? (
                              <span
                                className="inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold border"
                                style={{
                                  backgroundColor: `${row.substage.leadStage?.color || '#3b82f6'}15`,
                                  color: row.substage.leadStage?.color || '#3b82f6',
                                  borderColor: `${row.substage.leadStage?.color || '#3b82f6'}30`,
                                }}
                              >
                                {row.substage.name}
                              </span>
                            ) : (
                              <span className="text-gray-400 italic">None</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-600 max-w-xs truncate" title={row.outcomeNotes || ''}>
                            {row.outcomeNotes || '-'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {detailedData?.pagination && detailedData.pagination.totalPages > 1 && (
                <div className="p-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs">
                  <span className="text-gray-500 font-medium">
                    Page {detailedData.pagination.page} of {detailedData.pagination.totalPages} ({detailedData.pagination.total} total)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(detailedData.pagination.totalPages, p + 1))}
                      disabled={page === detailedData.pagination.totalPages}
                      className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ReportPageShell>
  );
};

export default CallPerformanceReportPage;
