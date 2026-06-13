import React, { useMemo, useState } from 'react';
import { IndianRupee } from 'lucide-react';
import ReportPageShell from '../shared/ReportPageShell';
import ReportFiltersBar from '../shared/ReportFiltersBar';
import ReportPagination from '../shared/ReportPagination';
import { createDefaultReportFilters } from '../shared/reportFilterDefaults';
import { buildApiFilters, useReportUsers } from '../shared/useReportUsers';
import RevenueActivitySection from '../summary/components/RevenueActivitySection';
import { downloadCsv } from '../shared/exportUtils';
import { useQuery } from '@tanstack/react-query';
import { fetchRevenueSummary } from '../../../services/summaryReports.api';

const RevenueReportsPage: React.FC = () => {
  const [filters, setFilters] = useState(createDefaultReportFilters());
  const { data: users = [] } = useReportUsers();
  const apiFilters = useMemo(() => buildApiFilters(filters, users), [filters, users]);

  const revenueQuery = useQuery({
    queryKey: ['report-revenue-export', apiFilters],
    queryFn: () => fetchRevenueSummary(apiFilters),
  });

  const handleExport = () => {
    const rows = (revenueQuery.data?.data || []).map((item: any) => [
      item.lead?.name || '-',
      String(item.amount || 0),
      item.createdBy?.name || '-',
      item.createdAt || '-',
    ]);
    downloadCsv(`revenue-report-${Date.now()}.csv`, ['Lead', 'Amount', 'Closed By', 'Date'], rows);
  };

  return (
    <ReportPageShell
      title="Revenue Reports"
      description="Detailed revenue entries with lead, amount, closer, and date for the selected period."
      icon={<IndianRupee className="text-emerald-500" size={28} />}
      filters={<ReportFiltersBar filters={filters} setFilters={setFilters} />}
      onExportCsv={handleExport}
    >
      <RevenueActivitySection filters={apiFilters} />
      <ReportPagination
        page={filters.page || 1}
        totalPages={revenueQuery.data?.pagination?.totalPages}
        onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
      />
    </ReportPageShell>
  );
};

export default RevenueReportsPage;
