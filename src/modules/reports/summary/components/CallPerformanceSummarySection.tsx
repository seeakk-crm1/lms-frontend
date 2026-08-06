import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PhoneCall, CheckCircle2, PhoneOff, Percent, FileSpreadsheet, Download, Layers } from 'lucide-react';
import { fetchCallSummaryReport, exportCallReport } from '../../../../services/calls.api';

interface CallPerformanceSummarySectionProps {
  filters: any;
}

const CallPerformanceSummarySection: React.FC<CallPerformanceSummarySectionProps> = ({ filters }) => {
  const [exporting, setExporting] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['call-performance-summary', filters],
    queryFn: () =>
      fetchCallSummaryReport({
        startDate: filters.startDate,
        endDate: filters.endDate,
        userIds: filters.userId ? (Array.isArray(filters.userId) ? filters.userId : [filters.userId]) : undefined,
        officeId: filters.officeId,
        departmentId: filters.departmentId,
      }),
  });

  const handleExport = async (format: 'xlsx' | 'csv') => {
    setExporting(true);
    try {
      const filterParams = {
        startDate: filters.startDate,
        endDate: filters.endDate,
        userIds: filters.userId ? (Array.isArray(filters.userId) ? filters.userId : [filters.userId]) : undefined,
        officeId: filters.officeId,
        departmentId: filters.departmentId,
      };
      const blobData = await exportCallReport({ format, filters: filterParams });
      const url = window.URL.createObjectURL(new Blob([blobData]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `call_summary_report_${Date.now()}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  if (isLoading) {
    return <div className="h-48 animate-pulse rounded-3xl bg-gray-100 mt-6" />;
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
  const maxValues = data?.maxValues || {
    totalAttempts: 1,
    uniqueCalls: 1,
    connectedCalls: 1,
    notConnectedCalls: 1,
    followUpsCreated: 1,
    leadsMoved: 1,
  };

  return (
    <div className="mt-8 space-y-6 print:break-inside-avoid">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-emerald-500 pb-3">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-100 p-2.5 rounded-2xl text-emerald-600">
            <PhoneCall size={22} />
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900">Call Performance Summary</h3>
            <p className="text-xs font-semibold text-gray-500">
              Workspace call volume, connection rates, and user-wise daily unique call breakdowns.
            </p>
          </div>
        </div>

        {/* Action Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleExport('xlsx')}
            disabled={exporting}
            className="flex items-center gap-2 rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-600 transition"
          >
            <FileSpreadsheet size={14} />
            <span>{exporting ? 'Exporting...' : 'Export Excel (.xlsx)'}</span>
          </button>
          <button
            type="button"
            onClick={() => handleExport('csv')}
            disabled={exporting}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-bold text-gray-700 shadow-sm hover:bg-gray-50 transition"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Top Metric Summary Cards */}
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

      {/* User Call Performance Breakdown Table (With In-Cell Data Bars) */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <h4 className="font-bold text-gray-900 text-sm">User Call Performance Breakdown</h4>
          <span className="text-xs font-semibold text-gray-500">{usersList.length} users active</span>
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
                <th className="px-4 py-3 min-w-[200px]">Selected Substages</th>
                <th className="px-4 py-3 text-right min-w-[110px]">Follow-ups</th>
                <th className="px-4 py-3 text-right min-w-[110px]">Stage Moved</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-semibold">
              {usersList.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-400 font-medium italic">
                    No call activity found for the selected filters.
                  </td>
                </tr>
              ) : (
                usersList.map((user: any) => {
                  const uniquePct = Math.min(100, Math.round((user.uniqueCalls / maxValues.uniqueCalls) * 100));
                  const totalPct = Math.min(100, Math.round((user.totalAttempts / maxValues.totalAttempts) * 100));
                  const connPct = Math.min(100, Math.round((user.connectedCalls / maxValues.connectedCalls) * 100));
                  const notConnPct = Math.min(100, Math.round((user.notConnectedCalls / maxValues.notConnectedCalls) * 100));

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

                      {/* Selected Substages Badges */}
                      <td className="px-4 py-3">
                        {user.selectedSubstages && user.selectedSubstages.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 max-w-xs">
                            {user.selectedSubstages.slice(0, 3).map((sub: any) => (
                              <span
                                key={sub.substageId}
                                className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold border"
                                style={{
                                  backgroundColor: `${sub.color}15`,
                                  color: sub.color,
                                  borderColor: `${sub.color}30`,
                                }}
                              >
                                {sub.name} <span className="opacity-75">({sub.count})</span>
                              </span>
                            ))}
                            {user.selectedSubstages.length > 3 && (
                              <span className="text-[10px] font-semibold text-gray-400 self-center">
                                +{user.selectedSubstages.length - 3} more
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic text-[11px]">None</span>
                        )}
                      </td>

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
    </div>
  );
};

export default React.memo(CallPerformanceSummarySection);
