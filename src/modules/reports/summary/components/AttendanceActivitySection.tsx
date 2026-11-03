import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAttendanceSummary, SummaryFilters } from '../../../../services/summaryReports.api';
import { Clock } from 'lucide-react';
import {
  formatAttendanceTime,
  formatAttendanceDate,
  resolveAttendanceCheckIn,
  resolveAttendanceCheckOut,
} from '../../../../utils/attendanceTimezone';

interface AttendanceActivitySectionProps {
  filters: SummaryFilters;
  hideIfEmpty?: boolean;
}

const AttendanceActivitySection: React.FC<AttendanceActivitySectionProps> = ({ filters, hideIfEmpty = false }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['summary-attendance', filters],
    queryFn: () => fetchAttendanceSummary(filters),
  });

  if (isLoading) return <div className="h-32 bg-gray-100/80 animate-pulse rounded-xl border border-gray-200/80" />;

  const records = data?.data || [];
  const totalRecords = data?.pagination?.total ?? records.length;

  if (records.length === 0 && hideIfEmpty) return null;

  return (
    <div className="space-y-3 sm:space-y-3.5">
      <div className="flex items-center justify-between pb-2 border-b border-gray-200/80">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-50 text-sky-600 border border-sky-100/80">
            <Clock size={15} />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-gray-900">Attendance Activity</h3>
        </div>
        <span className="text-[11px] font-semibold text-gray-500">
          {totalRecords} {totalRecords === 1 ? 'Record' : 'Records'}
        </span>
      </div>

      {records.length === 0 ? (
        <div className="bg-white rounded-xl shadow-2xs border border-gray-200/80 p-8 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400 mb-2">
            <Clock size={20} />
          </div>
          <p className="text-sm font-semibold text-gray-800">No attendance records found for the selected date range.</p>
          <p className="text-xs text-gray-500 mt-1">Try adjusting the date range or user filters.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-2xs border border-gray-200/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="text-[10px] text-gray-500 uppercase bg-gray-50/90 font-bold border-b border-gray-200/80 tracking-wider">
                <tr>
                  <th className="px-3.5 py-2.5">User</th>
                  <th className="px-3.5 py-2.5">Date</th>
                  <th className="px-3.5 py-2.5">Check In</th>
                  <th className="px-3.5 py-2.5">Check Out</th>
                  <th className="px-3.5 py-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {records.map((att: any) => {
                  const resolvedCheckIn = resolveAttendanceCheckIn(att);
                  const resolvedCheckOut = resolveAttendanceCheckOut(att);
                  return (
                    <tr key={att.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-3.5 py-2.5 font-bold text-gray-900">{att.user?.name || '-'}</td>
                      <td className="px-3.5 py-2.5 text-gray-600">{formatAttendanceDate(att.date)}</td>
                      <td className="px-3.5 py-2.5 text-gray-600">{formatAttendanceTime(resolvedCheckIn)}</td>
                      <td className="px-3.5 py-2.5 text-gray-600">{formatAttendanceTime(resolvedCheckOut)}</td>
                      <td className="px-3.5 py-2.5 text-right">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700 border border-gray-200">
                          {att.status || 'PRESENT'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceActivitySection;
