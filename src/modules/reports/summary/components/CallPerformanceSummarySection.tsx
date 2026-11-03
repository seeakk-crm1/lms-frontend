import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PhoneCall, FileSpreadsheet, Download } from 'lucide-react';
import { fetchCallSummaryReport, exportCallReport } from '../../../../services/calls.api';
import { getCallMetricBarWidth } from '../../../../utils/barWidthUtils';

interface CallPerformanceSummarySectionProps {
  filters: any;
}

const CallPerformanceSummarySection: React.FC<CallPerformanceSummarySectionProps> = ({ filters }) => {
  const [exporting, setExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const userIds = filters.userId
    ? Array.isArray(filters.userId)
      ? filters.userId
      : [filters.userId]
    : undefined;

  const filterParams = {
    startDate: filters.startDate,
    endDate: filters.endDate,
    userIds,
    substageIds: filters.substageIds,
    supervisorId: filters.supervisorId,
    officeId: filters.officeId,
    departmentId: filters.departmentId,
    leadSource: filters.leadSource,
    leadStage: filters.leadStage,
    role: filters.role,
  };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['call-performance-summary', filterParams],
    queryFn: () => fetchCallSummaryReport(filterParams),
    staleTime: 60000,
    retry: 1,
  });

  const handleExport = async (format: 'xlsx' | 'csv' | 'pdf' | 'html') => {
    setExporting(true);
    setShowExportMenu(false);
    try {
      const blobData = await exportCallReport({ format, filters: filterParams });

      if (format === 'pdf') {
        const text = await blobData.text();
        const win = window.open('', '_blank');
        if (win) {
          win.document.write(text);
          win.document.close();
        }
        return;
      }

      const extension = format === 'html' ? 'html' : format;
      const mimeType = format === 'html' ? 'text/html' : format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

      const url = window.URL.createObjectURL(new Blob([blobData], { type: mimeType }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `call-performance-report.${extension}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Call report export failed', err);
    } finally {
      setExporting(false);
    }
  };

  if (isLoading) {
    return <div className="h-44 bg-gray-100/80 animate-pulse rounded-xl border border-gray-200/80" />;
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4 text-center">
        <p className="text-xs font-bold text-rose-700">Unable to load call performance data.</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-2 px-3 py-1 text-xs font-bold bg-rose-600 text-white rounded-lg shadow-2xs hover:bg-rose-700 transition cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  const metrics = data?.metrics || {
    totalCalls: 0,
    uniqueCalls: 0,
    connectedCalls: 0,
    notConnectedCalls: 0,
    connectionRate: 0,
    leadsMoved: 0,
  };

  const usersList = data?.userSummaryList || [];
  const selectedSubstagesList = data?.selectedSubstages || [];

  return (
    <div className="space-y-3.5 sm:space-y-4 print:break-inside-avoid">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-200/80">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100/80">
            <PhoneCall size={15} />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-gray-900 leading-tight">Call Performance Analytics</h3>
            <p className="text-[11px] font-medium text-gray-500">
              Workspace call volume, connection rates, and daily unique breakdowns.
            </p>
          </div>
        </div>

        {/* Unified Export Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowExportMenu(!showExportMenu)}
            disabled={exporting}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-700 shadow-2xs hover:bg-gray-50 transition cursor-pointer disabled:opacity-60"
          >
            <Download size={13} className="text-gray-500" />
            <span>{exporting ? 'Preparing...' : 'Export Calls'}</span>
          </button>

          {showExportMenu && (
            <div className="absolute right-0 mt-1.5 w-48 rounded-xl border border-gray-200/90 bg-white p-1 shadow-lg z-50">
              <button
                type="button"
                onClick={() => handleExport('pdf')}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition cursor-pointer"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded bg-rose-100 text-rose-600 font-extrabold text-[9px]">PDF</span>
                <span>PDF Report</span>
              </button>
              <button
                type="button"
                onClick={() => handleExport('html')}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition cursor-pointer"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded bg-blue-100 text-blue-600 font-extrabold text-[9px]">HTML</span>
                <span>Interactive HTML</span>
              </button>
              <button
                type="button"
                onClick={() => handleExport('xlsx')}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition cursor-pointer"
              >
                <FileSpreadsheet size={15} className="text-emerald-600" />
                <span>Excel (.xlsx)</span>
              </button>
              <button
                type="button"
                onClick={() => handleExport('csv')}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition cursor-pointer"
              >
                <Download size={14} className="text-gray-400" />
                <span>CSV File (.csv)</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Top Metric Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
        <div className="h-[74px] sm:h-[78px] rounded-xl border border-gray-200/80 bg-white p-3 shadow-2xs flex flex-col justify-center hover:border-gray-300 transition-all">
          <p className="text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider truncate">Total Attempts</p>
          <p className="mt-1 text-xl sm:text-2xl font-black text-gray-900 leading-none">{metrics.totalCalls.toLocaleString()}</p>
        </div>
        <div className="h-[74px] sm:h-[78px] rounded-xl border border-emerald-100/90 bg-emerald-50/40 p-3 shadow-2xs flex flex-col justify-center hover:border-emerald-200 transition-all">
          <p className="text-[10px] sm:text-[11px] font-bold text-emerald-700 uppercase tracking-wider truncate">Unique Calls</p>
          <p className="mt-1 text-xl sm:text-2xl font-black text-emerald-700 leading-none">{metrics.uniqueCalls.toLocaleString()}</p>
        </div>
        <div className="h-[74px] sm:h-[78px] rounded-xl border border-teal-100/90 bg-teal-50/40 p-3 shadow-2xs flex flex-col justify-center hover:border-teal-200 transition-all">
          <p className="text-[10px] sm:text-[11px] font-bold text-teal-700 uppercase tracking-wider truncate">Attended Calls</p>
          <p className="mt-1 text-xl sm:text-2xl font-black text-teal-700 leading-none">{metrics.connectedCalls.toLocaleString()}</p>
        </div>
        <div className="h-[74px] sm:h-[78px] rounded-xl border border-rose-100/90 bg-rose-50/40 p-3 shadow-2xs flex flex-col justify-center hover:border-rose-200 transition-all">
          <p className="text-[10px] sm:text-[11px] font-bold text-rose-700 uppercase tracking-wider truncate">Not Attended</p>
          <p className="mt-1 text-xl sm:text-2xl font-black text-rose-700 leading-none">{metrics.notConnectedCalls.toLocaleString()}</p>
        </div>
        <div className="h-[74px] sm:h-[78px] rounded-xl border border-indigo-100/90 bg-indigo-50/40 p-3 shadow-2xs flex flex-col justify-center hover:border-indigo-200 transition-all col-span-2 sm:col-span-1">
          <p className="text-[10px] sm:text-[11px] font-bold text-indigo-700 uppercase tracking-wider truncate">Connection Rate</p>
          <p className="mt-1 text-xl sm:text-2xl font-black text-indigo-700 leading-none">{metrics.connectionRate}%</p>
        </div>
      </div>

      {/* User Call Performance Breakdown Table */}
      <div className="rounded-xl border border-gray-200/80 bg-white shadow-2xs overflow-hidden">
        <div className="px-3.5 py-2.5 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between">
          <h4 className="font-bold text-gray-900 text-xs sm:text-sm">User Call Breakdown</h4>
          <span className="text-[11px] font-semibold text-gray-500">
            {usersList.length} {usersList.length === 1 ? 'user' : 'users'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="text-[10px] text-gray-500 uppercase bg-gray-50/90 font-bold border-b border-gray-200/80 tracking-wider">
              <tr>
                <th className="px-3.5 py-2.5 min-w-[140px]">User Name</th>
                <th className="px-3.5 py-2.5 min-w-[120px]">Unique Calls</th>
                <th className="px-3.5 py-2.5 min-w-[120px]">Total Calls</th>
                <th className="px-3.5 py-2.5 min-w-[120px]">Attended Calls</th>
                <th className="px-3.5 py-2.5 min-w-[120px]">Not Attended</th>
                <th className="px-3.5 py-2.5 text-center min-w-[100px]">Connection Rate</th>
                {selectedSubstagesList.map((sub) => (
                  <th key={sub.id} className="px-3.5 py-2.5 min-w-[130px]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: sub.color || '#3b82f6' }} />
                      <div className="truncate">
                        <div className="font-bold text-gray-900 leading-tight truncate">{sub.name}</div>
                        {sub.parentStageName && (
                          <div className="text-[9px] text-gray-400 font-normal lowercase truncate">{sub.parentStageName}</div>
                        )}
                      </div>
                    </div>
                  </th>
                ))}
                <th className="px-3.5 py-2.5 text-right min-w-[95px]">Follow-ups</th>
                <th className="px-3.5 py-2.5 text-right min-w-[95px]">Stage Moved</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-semibold">
              {usersList.length === 0 ? (
                <tr>
                  <td colSpan={8 + selectedSubstagesList.length} className="px-4 py-8 text-center text-gray-400 font-medium italic">
                    No call activity found for the selected filters.
                  </td>
                </tr>
              ) : (
                usersList.map((user: any) => {
                  const totalPct = user.totalAttempts > 0 ? 100 : 0;
                  const uniquePct = getCallMetricBarWidth(user.uniqueCalls, user.totalAttempts);
                  const connPct = getCallMetricBarWidth(user.connectedCalls, user.totalAttempts);
                  const notConnPct = getCallMetricBarWidth(user.notConnectedCalls, user.totalAttempts);

                  return (
                    <tr key={user.userId} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-3.5 py-2.5 font-bold text-gray-900">
                        <div className="truncate max-w-[160px]">{user.userName}</div>
                        <div className="text-[10px] text-gray-400 font-normal truncate max-w-[160px]">{user.officeName} • {user.departmentName}</div>
                      </td>

                      {/* Unique Calls Bar */}
                      <td className="px-3.5 py-2.5">
                        <div className="relative flex items-center justify-between h-6 px-2 rounded-md bg-emerald-50/50 border border-emerald-100/60 overflow-hidden">
                          <div
                            className="absolute left-0 top-0 bottom-0 bg-emerald-200/60 rounded-r transition-all duration-300"
                            style={{ width: `${uniquePct}%` }}
                          />
                          <span className="relative z-10 font-bold text-emerald-900 text-xs">{user.uniqueCalls}</span>
                        </div>
                      </td>

                      {/* Total Calls Bar */}
                      <td className="px-3.5 py-2.5">
                        <div className="relative flex items-center justify-between h-6 px-2 rounded-md bg-blue-50/50 border border-blue-100/60 overflow-hidden">
                          <div
                            className="absolute left-0 top-0 bottom-0 bg-blue-200/60 rounded-r transition-all duration-300"
                            style={{ width: `${totalPct}%` }}
                          />
                          <span className="relative z-10 font-bold text-blue-900 text-xs">{user.totalAttempts}</span>
                        </div>
                      </td>

                      {/* Attended Calls Bar */}
                      <td className="px-3.5 py-2.5">
                        <div className="relative flex items-center justify-between h-6 px-2 rounded-md bg-teal-50/50 border border-teal-100/60 overflow-hidden">
                          <div
                            className="absolute left-0 top-0 bottom-0 bg-teal-200/60 rounded-r transition-all duration-300"
                            style={{ width: `${connPct}%` }}
                          />
                          <span className="relative z-10 font-bold text-teal-900 text-xs">{user.connectedCalls}</span>
                        </div>
                      </td>

                      {/* Not Attended Bar */}
                      <td className="px-3.5 py-2.5">
                        <div className="relative flex items-center justify-between h-6 px-2 rounded-md bg-rose-50/50 border border-rose-100/60 overflow-hidden">
                          <div
                            className="absolute left-0 top-0 bottom-0 bg-rose-200/60 rounded-r transition-all duration-300"
                            style={{ width: `${notConnPct}%` }}
                          />
                          <span className="relative z-10 font-bold text-rose-900 text-xs">{user.notConnectedCalls}</span>
                        </div>
                      </td>

                      <td className="px-3.5 py-2.5 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-bold border border-purple-100 text-[11px]">
                          {user.connectionRate}%
                        </span>
                      </td>

                      {/* Dynamic Substage Columns */}
                      {selectedSubstagesList.map((sub) => {
                        const count = user.substageCounts?.[sub.id] || 0;
                        const barPct = getCallMetricBarWidth(count, user.totalAttempts);

                        return (
                          <td key={sub.id} className="px-3.5 py-2.5">
                            <div
                              className="relative flex items-center justify-between h-6 px-2 rounded-md border overflow-hidden"
                              style={{
                                backgroundColor: `${sub.color || '#3b82f6'}10`,
                                borderColor: `${sub.color || '#3b82f6'}30`,
                              }}
                            >
                              <div
                                className="absolute left-0 top-0 bottom-0 rounded-r transition-all duration-300"
                                style={{
                                  width: `${barPct}%`,
                                  backgroundColor: `${sub.color || '#3b82f6'}35`,
                                }}
                              />
                              <span className="relative z-10 font-bold text-xs" style={{ color: sub.color || '#1e293b' }}>
                                {count}
                              </span>
                            </div>
                          </td>
                        );
                      })}

                      <td className="px-3.5 py-2.5 text-right font-bold text-gray-800">{user.followUpsCreated}</td>
                      <td className="px-3.5 py-2.5 text-right font-bold text-gray-800">{user.leadsMoved}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default React.memo(CallPerformanceSummarySection);
