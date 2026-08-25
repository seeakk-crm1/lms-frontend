import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAttendanceSummary, SummaryFilters } from '../../../../services/summaryReports.api';
import { Clock } from 'lucide-react';
import { format } from 'date-fns';
import { formatAttendanceTime } from '../../../../utils/attendanceTimezone';

interface AttendanceActivitySectionProps {
  filters: SummaryFilters;
}

const AttendanceActivitySection: React.FC<AttendanceActivitySectionProps> = ({ filters }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['summary-attendance', filters],
    queryFn: () => fetchAttendanceSummary(filters),
  });

  if (isLoading) return <div className="h-40 bg-gray-100 animate-pulse rounded-2xl mt-6"></div>;
  if (!data?.data || data.data.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
        <Clock className="text-sky-500" size={20} /> Attendance Activity
      </h2>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 font-bold border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Check In</th>
                <th className="px-6 py-4">Check Out</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((att: any) => (
                <tr key={att.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold text-gray-900">{att.user?.name || '-'}</td>
                  <td className="px-6 py-4">{format(new Date(att.date), 'dd MMM yyyy')}</td>
                  <td className="px-6 py-4">{formatAttendanceTime(att.checkInTime)}</td>
                  <td className="px-6 py-4">{formatAttendanceTime(att.checkOutTime)}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-md text-xs font-bold bg-gray-100 text-gray-600">
                      {att.status || 'PRESENT'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceActivitySection;
