import React, { useMemo, useState } from 'react';
import { Briefcase } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import ReportPageShell from '../shared/ReportPageShell';
import ReportFiltersBar from '../shared/ReportFiltersBar';
import ReportPagination from '../shared/ReportPagination';
import { createDefaultReportFilters } from '../shared/reportFilterDefaults';
import { buildApiFilters, useReportUsers } from '../shared/useReportUsers';
import LeadsSection from '../summary/components/LeadsSection';
import LeadUpdatesSection from '../summary/components/LeadUpdatesSection';
import StageMovementsSection from '../summary/components/StageMovementsSection';
import { downloadCsv } from '../shared/exportUtils';
import { fetchLeadsSummary } from '../../../services/summaryReports.api';

const LeadReportsPage: React.FC = () => {
  const [filters, setFilters] = useState(createDefaultReportFilters());
  const { data: users = [] } = useReportUsers();
  const apiFilters = useMemo(() => buildApiFilters(filters, users), [filters, users]);

  const leadsQuery = useQuery({
    queryKey: ['report-leads-export', apiFilters],
    queryFn: () => fetchLeadsSummary(apiFilters),
  });

  const handleExport = () => {
    const rows = (leadsQuery.data?.data || []).map((lead: any) => [
      lead.name || '-',
      lead.source?.name || '-',
      lead.stage?.name || '-',
      lead.createdBy?.name || '-',
      lead.createdAt || '-',
    ]);
    downloadCsv(`lead-report-${Date.now()}.csv`, ['Lead', 'Source', 'Stage', 'Assigned To', 'Created'], rows);
  };

  return (
    <ReportPageShell
      title="Lead Reports"
      description="Every lead created, updated, and stage movement with full lead-level detail."
      icon={<Briefcase className="text-emerald-500" size={28} />}
      filters={<ReportFiltersBar filters={filters} setFilters={setFilters} />}
      onExportCsv={handleExport}
    >
      <LeadsSection filters={apiFilters} />
      <LeadUpdatesSection filters={apiFilters} />
      <StageMovementsSection filters={apiFilters} />
      <ReportPagination
        page={filters.page || 1}
        totalPages={leadsQuery.data?.pagination?.totalPages}
        onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
      />
    </ReportPageShell>
  );
};

export default LeadReportsPage;
