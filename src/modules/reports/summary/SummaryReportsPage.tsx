import React, { useState } from 'react';
import DashboardLayout from '../../../components/dashboard/DashboardLayout';
import SummaryFilters from './components/SummaryFilters';
import SummaryCardSection from './components/SummaryCardSection';
import ActivityTimelineSection from './components/ActivityTimelineSection';
import LeadsSection from './components/LeadsSection';
import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';
import { FileText, Download } from 'lucide-react';
import { format, startOfDay, endOfDay } from 'date-fns';

const SummaryReportsPage: React.FC = () => {
  const [filters, setFilters] = useState<any>({
    startDate: startOfDay(new Date()).toISOString(),
    endDate: endOfDay(new Date()).toISOString(),
  });

  const { data: users } = useQuery({
    queryKey: ['users-list'],
    queryFn: async () => {
      const res = await api.get('/admin/users');
      return res.data.users;
    }
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <DashboardLayout>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 bg-gray-50 print:bg-white print:p-0">
        <div className="max-w-[1400px] mx-auto space-y-6">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 flex items-center gap-3">
                <FileText className="text-emerald-500" size={28} /> Summary Reports
              </h1>
              <p className="text-sm text-gray-500 mt-1">Generate human-readable business summaries instantly.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-bold text-sm shadow-sm transition-all"
              >
                <Download size={16} /> Export PDF
              </button>
            </div>
          </div>

          <div className="print:hidden">
            <SummaryFilters filters={filters} setFilters={setFilters} users={users || []} />
          </div>

          <div className="hidden print:block mb-8">
            <h1 className="text-2xl font-black text-gray-900 border-b border-gray-200 pb-4 mb-4">
              Business Summary Report
            </h1>
            <p className="text-gray-600 font-medium">Date Range: {format(new Date(filters.startDate), 'MMM dd, yyyy')} - {format(new Date(filters.endDate), 'MMM dd, yyyy')}</p>
          </div>

          <SummaryCardSection filters={filters} />
          <ActivityTimelineSection filters={filters} />
          <LeadsSection filters={filters} />
          
          {/* Add more sections here (Followups, Revenue, Attendance, Targets) 
              following the exact same lazy-loaded pattern as LeadsSection */}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SummaryReportsPage;
