import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, FileBarChart2, RefreshCcw } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useLeadMetaQuery } from '../../hooks/useLeads';
import { useOfficesQuery } from '../../hooks/admin/office/useOfficeQuery';
import { useCountriesQuery } from '../locations/hooks/useLocations';
import useAuthStore from '../../store/useAuthStore';
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
  dateFrom: '',
  dateTo: '',
  stage: '',
  reasonId: '',
  userId: '',
  locationId: '',
};

const LOBAnalysisPage: React.FC = () => {
  const [draftFilters, setDraftFilters] = useState<LOBAnalysisFilters>(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState<LOBAnalysisFilters>(emptyFilters);
  const [page, setPage] = useState(1);

  const { user } = useAuthStore();
  const { data: leadMeta } = useLeadMetaQuery();
  const countriesQuery = useCountriesQuery({ page: 1, limit: 100, isActive: true });
  const officesQuery = useOfficesQuery();
  const lobAnalysis = useLOBAnalysis(appliedFilters, page, 20);

  const canView = ['admin', 'manager', 'superadmin'].includes(roleKey(user?.role));

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
    const countryOptions = (countriesQuery.data?.data || []).map((country) => ({
      value: country.id,
      label: `Country: ${country.name}`,
    }));
    const officeOptions = ((officesQuery.data?.data?.offices || []) as Array<{ id?: string; name?: string; isActive?: boolean }>)
      .filter((office) => office?.id && office?.isActive !== false)
      .map((office) => ({
        value: office.id as string,
        label: `Office: ${office.name || office.id}`,
      }));

    return [...countryOptions, ...officeOptions];
  }, [countriesQuery.data, officesQuery.data]);

  const appliedChips = useMemo(() => {
    const chips: string[] = [];
    if (appliedFilters.dateFrom) chips.push(`From: ${appliedFilters.dateFrom}`);
    if (appliedFilters.dateTo) chips.push(`To: ${appliedFilters.dateTo}`);
    if (appliedFilters.stage) chips.push(`Stage filtered`);
    if (appliedFilters.reasonId) chips.push(`Reason filtered`);
    if (appliedFilters.userId) chips.push(`User filtered`);
    if (appliedFilters.locationId) chips.push(`Location filtered`);
    return chips;
  }, [appliedFilters]);


  return (
    <DashboardLayout>
      {!canView ? (
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="max-w-lg rounded-[32px] border border-rose-100 bg-white p-8 text-center shadow-[0_25px_60px_-35px_rgba(15,23,42,0.25)]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h1 className="mt-5 text-3xl font-black text-gray-900">LOB Analysis Access Needed</h1>
            <p className="mt-3 text-sm font-semibold leading-7 text-gray-500">
              Your current role does not expose this analysis screen in the UI. Ask an administrator to grant LOB analysis or reporting access.
            </p>
          </div>
        </div>
      ) : (
        <div className="relative flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar p-4 md:p-8">
          <div className="absolute right-0 top-0 -z-10 h-[420px] w-[720px] bg-gradient-to-bl from-emerald-50 via-transparent to-transparent" />

          <div className="mx-auto max-w-[1480px] space-y-6 md:space-y-8">
            <section className="relative overflow-hidden rounded-[32px] border border-white/70 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.98),rgba(249,250,251,0.96))] p-6 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.35)]">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <p className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-black uppercase tracking-[0.24em] text-emerald-600">
                    <FileBarChart2 size={14} />
                    LOB Analysis Dashboard
                  </p>
                  <h1 className="mt-4 text-4xl font-black tracking-tight text-gray-950 md:text-5xl">Loss Of Business Insights</h1>
                  <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-gray-500">
                    Track where leads fall into LOB, understand the top reasons behind those exits, and review the full audit trail behind every movement.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => lobAnalysis.refetchAll()}
                  className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 transition hover:border-gray-300 hover:text-gray-900"
                >
                  <RefreshCcw size={16} />
                  Refresh
                </button>
              </div>
            </section>

            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-600 shadow-sm">
                <FileBarChart2 className="h-4 w-4 text-emerald-500" />
                <span>{appliedChips.length ? 'Filters applied' : 'No filters applied'}</span>
              </div>

              {appliedChips.map((chip) => (
                <span key={chip} className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-emerald-600">
                  {chip}
                </span>
              ))}
            </div>

            <LOBFilters
              filters={draftFilters}
              stageOptions={stageOptions}
              reasonOptions={reasonOptions}
              userOptions={userOptions}
              locationOptions={locationOptions}
              onChange={(patch) => setDraftFilters((current) => ({ ...current, ...patch }))}
              onApply={() => {
                setAppliedFilters(draftFilters);
                setPage(1);
              }}
              onReset={() => {
                setDraftFilters(emptyFilters);
                setAppliedFilters(emptyFilters);
                setPage(1);
              }}
            />

            <LOBKPIStats data={lobAnalysis.summary} loading={lobAnalysis.isLoading} />

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.9fr)]">
              <LOBStageChart breakdown={lobAnalysis.chart} summary={lobAnalysis.summary} loading={lobAnalysis.isLoading} />
              <LOBReasonsList data={lobAnalysis.summary?.top_reasons || []} loading={lobAnalysis.isLoading} />
            </div>

            <LOBAuditTable
              data={lobAnalysis.auditLogs}
              loading={lobAnalysis.isLoading || lobAnalysis.isFetching}
              page={page}
              totalPages={lobAnalysis.auditPagination?.totalPages || 1}
              total={lobAnalysis.auditPagination?.total || 0}
              onPageChange={setPage}
            />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default LOBAnalysisPage;
