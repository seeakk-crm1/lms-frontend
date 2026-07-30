import React, { useCallback, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDownSquare, ChevronUpSquare, GitBranch, Search, Users, UserCheck, Building } from 'lucide-react';
import DashboardLayout from '../../../components/dashboard/DashboardLayout';
import OrganisationTree from './OrganisationTree';
import SupervisorTree from './SupervisorTree';
import { useOrganisationChartQuery } from './useOrganisationChartQuery';
import { useSupervisorHierarchyQuery } from './useSupervisorHierarchyQuery';
import { useOrganisationChartStore } from './organisationChart.store';
import { OrganisationChartNode } from './types';
import UserSidePanel from './UserSidePanel';

const collectNodeIds = (roots: OrganisationChartNode[]): string[] => {
  const ids: string[] = [];
  const queue = [...roots];
  while (queue.length > 0) {
    const next = queue.shift();
    if (!next) break;
    ids.push(next.id);
    next.children.forEach((child) => queue.push(child));
  }
  return ids;
};

const TreeSkeleton: React.FC = () => (
  <div className="rounded-3xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm">
    <div className="animate-pulse space-y-6">
      <div className="h-6 w-64 rounded bg-gray-200" />
      <div className="flex flex-col md:flex-row gap-5">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="rounded-2xl border border-gray-100 p-4 w-[240px] bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gray-200" />
              <div className="space-y-2 flex-1">
                <div className="h-3 rounded bg-gray-200 w-4/5" />
                <div className="h-2.5 rounded bg-gray-200 w-3/5" />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="h-2.5 rounded bg-gray-200 w-full" />
              <div className="h-2.5 rounded bg-gray-200 w-5/6" />
              <div className="h-2.5 rounded bg-gray-200 w-4/6" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const OrganisationChartPage: React.FC = () => {
  const [includeInactive, setIncludeInactive] = useState(false);

  const { searchQuery, setSearch, expandAll, collapseAll } = useOrganisationChartStore();
  const { data: deptData, isLoading: deptLoading, isFetching: deptFetching, isError: deptIsError, error: deptError, refetch: deptRefetch } = useOrganisationChartQuery(includeInactive);
  const { data: supData, isLoading: supLoading, isFetching: supFetching, isError: supIsError, error: supError, refetch: supRefetch } = useSupervisorHierarchyQuery(includeInactive);

  const deptRoots = deptData?.data || [];
  const deptMeta = deptData?.meta;

  const supRoots = supData?.data || [];
  const supMeta = supData?.meta;

  const allNodeIds = useMemo(() => {
    const ids1 = collectNodeIds(deptRoots);
    const ids2 = collectNodeIds(supRoots);
    return Array.from(new Set([...ids1, ...ids2]));
  }, [deptRoots, supRoots]);

  const handleExpandAll = useCallback(() => {
    expandAll(allNodeIds);
  }, [allNodeIds, expandAll]);

  const handleCollapseAll = useCallback(() => {
    collapseAll();
  }, [collapseAll]);

  const isLoading = deptLoading || supLoading;
  const isFetching = deptFetching || supFetching;

  return (
    <DashboardLayout>
      <div className="flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar relative p-4 md:p-8">
        <div className="absolute top-0 right-0 w-[840px] h-[520px] bg-gradient-to-bl from-emerald-50/90 via-transparent to-transparent pointer-events-none -z-10" />

        <div className="max-w-[1500px] mx-auto space-y-6 md:space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <motion.div initial={{ opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-600 text-[10px] font-bold uppercase tracking-wider">
                  Admin
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">Organisation Chart</h1>
              <p className="text-sm text-gray-500 mt-1">Visual hierarchy of departments and assigned supervisor reporting structures.</p>
            </motion.div>

            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
              <label className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search name, role, department"
                  className="w-full sm:w-72 pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  aria-label="Search organisation chart"
                />
              </label>

              <button
                onClick={handleExpandAll}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-bold hover:bg-gray-50"
                aria-label="Expand all nodes"
              >
                <ChevronDownSquare className="w-4 h-4 text-emerald-600" />
                Expand All
              </button>
              <button
                onClick={handleCollapseAll}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-bold hover:bg-gray-50"
                aria-label="Collapse all nodes"
              >
                <ChevronUpSquare className="w-4 h-4 text-emerald-600" />
                Collapse All
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Users</p>
              <p className="text-2xl font-black mt-1">{deptMeta?.totalUsers ?? supMeta?.totalUsers ?? 0}</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Supervisor Root Nodes</p>
              <p className="text-2xl font-black mt-1">{supMeta?.rootCount ?? 0}</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Orphan / Unassigned</p>
              <p className="text-2xl font-black mt-1">{supMeta?.orphanCount ?? 0}</p>
            </div>
            <label className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm flex items-center justify-between gap-3 cursor-pointer">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Include Inactive</p>
                <p className="text-sm font-bold mt-1 text-gray-700">{includeInactive ? 'Enabled' : 'Disabled'}</p>
              </div>
              <button
                type="button"
                onClick={() => setIncludeInactive((value) => !value)}
                className={`w-12 h-7 rounded-full p-1 transition ${includeInactive ? 'bg-emerald-500' : 'bg-gray-300'}`}
                aria-label="Toggle inactive users"
              >
                <span className={`block h-5 w-5 rounded-full bg-white transition ${includeInactive ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold shadow-sm hover:bg-gray-50"
            >
              Print / PDF
            </button>
          </div>

          {/* Section 1: Department Hierarchy */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">Department Hierarchy</h2>
                  <p className="text-xs text-gray-500">Organized by company workspace departments</p>
                </div>
              </div>
            </div>

            {deptLoading || deptFetching ? (
              <TreeSkeleton />
            ) : deptIsError ? (
              <div className="rounded-3xl border border-red-200 bg-red-50 p-8 shadow-sm">
                <p className="text-lg font-black text-red-700">Failed to load department hierarchy</p>
                <p className="text-sm text-red-600 mt-1">{(deptError as Error)?.message || 'Unknown error'}</p>
                <button
                  onClick={() => deptRefetch()}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700"
                >
                  Retry
                </button>
              </div>
            ) : (
              <div className="rounded-3xl border border-gray-200 bg-white p-4 md:p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400">Department Hierarchy Tree</p>
                  <span className="text-xs font-bold text-gray-500 inline-flex items-center gap-1">
                    <GitBranch className="w-3.5 h-3.5" />
                    Read only
                  </span>
                </div>
                <OrganisationTree roots={deptRoots} />
              </div>
            )}
          </div>

          {/* Section Divider */}
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-slate-100 px-4 text-xs font-bold text-gray-400 uppercase tracking-widest rounded-full border border-gray-200 py-1">
                Hierarchy Views
              </span>
            </div>
          </div>

          {/* Section 2: Supervisor Hierarchy */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">Supervisor Hierarchy</h2>
                  <p className="text-xs text-gray-500">Organized purely by assigned supervisor reporting relationships</p>
                </div>
              </div>
            </div>

            {supLoading || supFetching ? (
              <TreeSkeleton />
            ) : supIsError ? (
              <div className="rounded-3xl border border-red-200 bg-red-50 p-8 shadow-sm">
                <p className="text-lg font-black text-red-700">Failed to load supervisor hierarchy</p>
                <p className="text-sm text-red-600 mt-1">{(supError as Error)?.message || 'Unknown error'}</p>
                <button
                  onClick={() => supRefetch()}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700"
                >
                  Retry
                </button>
              </div>
            ) : (
              <div className="rounded-3xl border border-gray-200 bg-white p-4 md:p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400">Supervisor Reporting Tree</p>
                  <span className="text-xs font-bold text-gray-500 inline-flex items-center gap-1">
                    <GitBranch className="w-3.5 h-3.5 text-emerald-600" />
                    Read only
                  </span>
                </div>
                <SupervisorTree roots={supRoots} />
              </div>
            )}
          </div>
        </div>
      </div>

      <UserSidePanel />
    </DashboardLayout>
  );
};

export default OrganisationChartPage;
