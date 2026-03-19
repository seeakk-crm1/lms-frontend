import React, { useCallback, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDownSquare, ChevronUpSquare, GitBranch, Search, Users } from 'lucide-react';
import DashboardHeader from '../../../components/dashboard/DashboardHeader';
import DashboardSidebar from '../../../components/dashboard/DashboardSidebar';
import OrganisationTree from './OrganisationTree';
import { useOrganisationChartQuery } from './useOrganisationChartQuery';
import { useOrganisationChartStore } from './organisationChart.store';
import { OrganisationChartNode } from './types';

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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [, setMobileMenuOpen] = useState(false);
  const [includeInactive, setIncludeInactive] = useState(false);

  const { searchQuery, setSearch, expandAll, collapseAll } = useOrganisationChartStore();
  const { data, isLoading, isFetching, isError, error, refetch } = useOrganisationChartQuery(includeInactive);

  const roots = data?.data || [];
  const meta = data?.meta;
  const allNodeIds = useMemo(() => collectNodeIds(roots), [roots]);

  const handleExpandAll = useCallback(() => {
    expandAll(allNodeIds);
  }, [allNodeIds, expandAll]);

  const handleCollapseAll = useCallback(() => {
    collapseAll();
  }, [collapseAll]);

  return (
    <div className="h-screen w-full bg-gray-50 flex overflow-hidden font-sans text-gray-900">
      <DashboardSidebar
        isCollapsed={isSidebarCollapsed}
        toggleCollapsed={() => setIsSidebarCollapsed((value) => !value)}
      />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <DashboardHeader setMobileMenuOpen={setMobileMenuOpen} />

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
                <p className="text-sm text-gray-500 mt-1">Visual hierarchy of users, roles, and departments.</p>
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
                <p className="text-2xl font-black mt-1">{meta?.totalUsers ?? 0}</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Root Nodes</p>
                <p className="text-2xl font-black mt-1">{meta?.rootCount ?? 0}</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Orphans</p>
                <p className="text-2xl font-black mt-1">{meta?.orphanCount ?? 0}</p>
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

            {isLoading || isFetching ? (
              <TreeSkeleton />
            ) : isError ? (
              <div className="rounded-3xl border border-red-200 bg-red-50 p-8 shadow-sm">
                <p className="text-lg font-black text-red-700">Failed to load organisation chart</p>
                <p className="text-sm text-red-600 mt-1">{(error as Error)?.message || 'Unknown error'}</p>
                <button
                  onClick={() => refetch()}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700"
                >
                  Retry
                </button>
              </div>
            ) : (
              <div className="rounded-3xl border border-gray-200 bg-white p-4 md:p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400">Hierarchy Tree</p>
                  <span className="text-xs font-bold text-gray-500 inline-flex items-center gap-1">
                    <GitBranch className="w-3.5 h-3.5" />
                    Read only
                  </span>
                </div>
                <OrganisationTree roots={roots} />
              </div>
            )}

            {!isLoading && !isFetching && roots.length === 0 && (
              <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
                <Users className="mx-auto w-8 h-8 text-gray-400" />
                <p className="mt-2 text-base font-black">No organisation data available</p>
                <p className="text-sm text-gray-500">Add users and reporting managers to render the hierarchy.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrganisationChartPage;

