import React, { useState } from 'react';
import DashboardLayout from '../../../components/dashboard/DashboardLayout';
import SummaryFilters from './components/SummaryFilters';
import UserReportView from './components/UserReportView';
import CompanyReportView from './components/CompanyReportView';
import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';
import { FileText, Download } from 'lucide-react';
import { format } from 'date-fns';

const SummaryReportsPage: React.FC = () => {
  const [filters, setFilters] = useState<any>({
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    userId: undefined, // undefined = All Users
  });

  const { data: users } = useQuery({
    queryKey: ['users-list'],
    queryFn: async () => {
      const res = await api.get('/admin/users');
      const payload = res.data?.data;
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.users)) return payload.users;
      if (Array.isArray(res.data?.users)) return res.data.users;
      return [];
    }
  });

  const handlePrint = () => {
    window.print();
  };

  const renderContent = () => {
    if (!filters.userId) {
      // Company Wide Report
      return <CompanyReportView filters={filters} />;
    }

    if (Array.isArray(filters.userId)) {
      // Multiple Users Report
      return (
        <div className="space-y-12">
          {filters.userId.map((uid: string) => {
            const user = users?.find((u: any) => u.id === uid);
            return (
              <div key={uid} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 print:shadow-none print:border-none print:p-0">
                <UserReportView filters={{ ...filters, userId: uid }} userName={user?.name || 'Unknown User'} />
              </div>
            );
          })}
        </div>
      );
    }

    // Single User Report
    const singleUser = users?.find((u: any) => u.id === filters.userId);
    return <UserReportView filters={filters} userName={singleUser?.name || 'Unknown User'} />;
  };

  return (
    <DashboardLayout>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 bg-gray-50 print:bg-white print:p-0">
        <div className="max-w-[1400px] mx-auto space-y-6">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 flex items-center gap-3">
                <FileText className="text-emerald-500" size={28} /> Activity Reports
              </h1>
              <p className="text-sm text-gray-500 mt-1">Detailed chronological activity, movements, and analytics.</p>
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

          <div className="hidden print:block mb-8 border-b-2 border-gray-900 pb-4">
            <h1 className="text-3xl font-black text-gray-900 mb-2">
              Seeakk - Activity Report
            </h1>
            <p className="text-gray-600 font-bold">
              Generated on: {new Date().toLocaleString()}
            </p>
          </div>

          {renderContent()}
          
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SummaryReportsPage;
