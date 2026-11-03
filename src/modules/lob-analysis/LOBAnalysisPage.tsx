import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, FileBarChart2, RefreshCcw } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useLeadMetaQuery } from '../../hooks/useLeads';
import { Country } from 'country-state-city';
import useAuthStore from '../../store/useAuthStore';
import { canUseOfficeFilter } from '../../utils/officeFilterAccess';
import LOBFilters from './LOBFilters';
import LOBKPIStats from './LOBKPIStats';
import LOBReasonsList from './LOBReasonsList';
import LOBStageChart from './LOBStageChart';
import LOBAuditTable from './LOBAuditTable';
import { useLOBAnalysis } from './useLOBAnalysis';
import type { LOBAnalysisFilters } from './types/lobAnalysis.types';

const roleKey = (role: unknown) =>
  String(typeof role === 'object' && role !== null ? (role as { name?: string }).name || '' : role || '')
    .toLowerCase()
    .trim()
    .replace(/[\s_-]+/g, '');

const emptyFilters: LOBAnalysisFilters = {
  search: '',
  dateFrom: '',
  dateTo: '',
  stage: '',
  reasonId: '',
  userId: '',
  locationId: '',
  officeId: '',
};

const LOBAnalysisPage: React.FC = () => {
  const [draftFilters, setDraftFilters] = useState<LOBAnalysisFilters>(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState<LOBAnalysisFilters>(emptyFilters);
  const [searchDraft, setSearchDraft] = useState('');
  const [page, setPage] = useState(1);

  const { user } = useAuthStore();
  const { data: leadMeta } = useLeadMetaQuery();
  const lobAnalysis = useLOBAnalysis(appliedFilters, page, 20);

  const canView = ['admin', 'manager', 'superadmin'].includes(roleKey(user?.role));
  const showOfficeFilter = canUseOfficeFilter(user);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const nextSearch = searchDraft.trim();
      setAppliedFilters((current) => ({ ...current, search: nextSearch }));
      setDraftFilters((current) => ({ ...current, search: nextSearch }));
      setPage(1);
    }, 320);

    return () => window.clearTimeout(timer);
  }, [searchDraft]);

  const stageOptions = useMemo(
    () => (leadMeta?.stages || []).map((item) => ({ value: item.id, label: item.label })),
    [leadMeta],
  );

  const reasonOptions = useMemo(
    () => (leadMeta?.lobReasons || []).map((item) => ({ value: item.id, label: item.label })),
    [leadMeta],
  );

  const userOptions = useMemo(
    () => (leadMeta?.users || []).map((item) => ({ value: item.id, label: item.label })),
    [leadMeta],
  );

  const locationOptions = useMemo(() => {
    return Country.getAllCountries().map((country) => ({
      value: country.isoCode,
      label: `Country: ${country.name}`,
    }));
  }, []);

  const appliedChips = useMemo(() => {
    const chips: string[] = [];
    if (appliedFilters.search) chips.push(`Search: ${appliedFilters.search}`);
    if (appliedFilters.dateFrom) chips.push(`From: ${appliedFilters.dateFrom}`);
    if (appliedFilters.dateTo) chips.push(`To: ${appliedFilters.dateTo}`);
    if (appliedFilters.stage) {
      const stageName = stageOptions.find((s) => s.value === appliedFilters.stage)?.label || 'Stage';
      chips.push(`Stage: ${stageName}`);
    }
    if (appliedFilters.reasonId) {
      const reasonName = reasonOptions.find((r) => r.value === appliedFilters.reasonId)?.label || 'Reason';
      chips.push(`Reason: ${reasonName}`);
    }
    if (appliedFilters.userId) {
      const userName = userOptions.find((u) => u.value === appliedFilters.userId)?.label || 'User';
      chips.push(`User: ${userName}`);
    }
    if (appliedFilters.locationId) {
      const locName = locationOptions.find((l) => l.value === appliedFilters.locationId)?.label || 'Location';
      chips.push(locName);
    }
    if (appliedFilters.officeId) chips.push('Office Filtered');
    return chips;
  }, [appliedFilters, stageOptions, reasonOptions, userOptions, locationOptions]);

  return (
    <DashboardLayout>
      {!canView ? (
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="max-w-md rounded-xl border border-rose-100 bg-white p-6 text-center shadow-2xs">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-500 border border-rose-100">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h1 className="mt-3.5 text-base sm:text-lg font-bold text-gray-900">LOB Analysis Access Needed</h1>
            <p className="mt-1.5 text-xs font-normal leading-relaxed text-gray-500">
              Your current role does not have permission to view LOB analytics. Contact an administrator to grant reporting access.
            </p>
          </div>
        </div>
      ) : (
        <div className="relative flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar bg-gray-50 p-3.5 sm:p-5 lg:p-6">
          <div className="mx-auto max-w-[1560px] space-y-3.5 sm:space-y-4">
            {/* Header Toolbar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 border border-emerald-100/80">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span>Analytics & Risk Control</span>
                </div>
                <h1 className="flex items-center gap-2 text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
                  <FileBarChart2 size={22} className="text-emerald-600" />
                  <span>Loss Of Business Insights</span>
                </h1>
                <p className="mt-0.5 text-xs text-gray-500">
                  Track where leads fall into LOB, understand the top reasons behind those exits, and review the full audit trail behind every movement.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => lobAnalysis.refetchAll()}
                  className="inline-flex items-center justify-center gap-1.5 h-8.5 px-3 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-700 shadow-2xs hover:bg-gray-50 hover:text-gray-900 transition-colors cursor-pointer"
                  title="Refresh LOB data"
                >
                  <RefreshCcw
                    size={14}
                    className={
                      lobAnalysis.isLoading || lobAnalysis.isFetching
                        ? 'animate-spin text-emerald-600'
                        : 'text-gray-500'
                    }
                  />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* Filter Scope Section */}
            <LOBFilters
              filters={draftFilters}
              stageOptions={stageOptions}
              reasonOptions={reasonOptions}
              userOptions={userOptions}
              locationOptions={locationOptions}
              showOfficeFilter={showOfficeFilter}
              appliedChips={appliedChips}
              onChange={(patch) => setDraftFilters((current) => ({ ...current, ...patch }))}
              onSearchChange={(value) => {
                setSearchDraft(value);
                setDraftFilters((current) => ({ ...current, search: value }));
              }}
              onApply={() => {
                setAppliedFilters({ ...draftFilters, search: searchDraft.trim() });
                setPage(1);
              }}
              onReset={() => {
                setSearchDraft('');
                setDraftFilters(emptyFilters);
                setAppliedFilters(emptyFilters);
                setPage(1);
              }}
            />

            {/* KPI Summary Stats */}
            <LOBKPIStats data={lobAnalysis.summary} loading={lobAnalysis.isLoading} />

            {/* Charts and Rankings Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.6fr)_minmax(320px,1fr)] gap-3.5 sm:gap-4">
              <LOBStageChart
                breakdown={lobAnalysis.chart}
                summary={lobAnalysis.summary}
                loading={lobAnalysis.isLoading}
              />
              <LOBReasonsList
                data={lobAnalysis.summary?.top_reasons || []}
                loading={lobAnalysis.isLoading}
              />
            </div>

            {/* Audit Log Table */}
            <LOBAuditTable
              data={lobAnalysis.auditLogs}
              loading={lobAnalysis.isLoading || lobAnalysis.isFetching}
              page={page}
              totalPages={lobAnalysis.auditPagination?.totalPages || 1}
              total={lobAnalysis.auditPagination?.total || 0}
              emptyTitle={appliedFilters.search ? 'No matching LOB records found' : undefined}
              emptyDescription={
                appliedFilters.search ? 'Try changing your search keywords or clearing filters.' : undefined
              }
              onPageChange={setPage}
            />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default LOBAnalysisPage;
