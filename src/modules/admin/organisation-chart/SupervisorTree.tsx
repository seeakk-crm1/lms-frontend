import React, { memo, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import SupervisorNode from './SupervisorNode';
import { OrganisationChartNode } from './types';
import { useOrganisationChartStore } from './organisationChart.store';

interface SupervisorTreeProps {
  roots: OrganisationChartNode[];
}

type FlatNode = {
  id: string;
  name: string;
  role: string | null;
  department: string | null;
  parentId: string | null;
  isActive: boolean;
};

const flattenNodes = (roots: OrganisationChartNode[]): FlatNode[] => {
  const output: FlatNode[] = [];
  const queue: Array<{ node: OrganisationChartNode; parentId: string | null }> = roots.map((node) => ({
    node,
    parentId: null,
  }));

  while (queue.length > 0) {
    const next = queue.shift();
    if (!next) break;
    output.push({
      id: next.node.id,
      name: next.node.name,
      role: next.node.role || null,
      department: next.node.department || null,
      parentId: next.parentId,
      isActive: next.node.isActive ?? true,
    });
    next.node.children.forEach((child) => queue.push({ node: child, parentId: next.node.id }));
  }

  return output;
};

const SupervisorTree: React.FC<SupervisorTreeProps> = ({ roots }) => {
  const {
    expandedNodes,
    searchQuery,
    filters,
    selectedNode,
    toggleNode,
    setSelectedNode,
    expandNodes,
  } = useOrganisationChartStore();

  const flat = useMemo(() => flattenNodes(roots), [roots]);

  const parentById = useMemo(() => {
    const map = new Map<string, string | null>();
    flat.forEach((node) => map.set(node.id, node.parentId));
    return map;
  }, [flat]);

  const matchedIds = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const hasSearch = !!query;
    const hasFilters = !!(filters.department || filters.role || filters.status);

    if (!hasSearch && !hasFilters) return new Set<string>();

    return new Set(
      flat
        .filter((node) => {
          let matches = true;

          if (hasFilters) {
            if (filters.department && node.department !== filters.department) matches = false;
            if (filters.role && node.role !== filters.role) matches = false;
            if (filters.status) {
              const expectedStatus = filters.status === 'active';
              if (node.isActive !== expectedStatus) matches = false;
            }
          }

          if (matches && hasSearch) {
            const hay = `${node.name} ${node.role || ''} ${node.department || ''}`.toLowerCase();
            if (!hay.includes(query)) matches = false;
          }

          return matches;
        })
        .map((node) => node.id),
    );
  }, [flat, searchQuery, filters]);

  const pathIds = useMemo(() => {
    if (matchedIds.size === 0) return new Set<string>();
    const paths = new Set<string>();
    matchedIds.forEach((id) => {
      let current: string | null | undefined = id;
      while (current) {
        paths.add(current);
        current = parentById.get(current);
      }
    });
    return paths;
  }, [matchedIds, parentById]);

  useEffect(() => {
    if (searchQuery.trim() && pathIds.size > 0) {
      expandNodes(Array.from(pathIds));
    }
  }, [expandNodes, pathIds, searchQuery]);

  if (roots.length === 0) {
    return (
      <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-sm">
        <Users className="mx-auto w-10 h-10 text-gray-400 mb-2" />
        <p className="text-base font-bold text-gray-900">No Supervisor Hierarchy Available</p>
        <p className="text-sm text-gray-500 mt-1">Assign supervisors to users to generate the hierarchy.</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto pb-6">
      <div className="min-w-max px-4 md:px-8 py-2" role="tree" aria-label="Supervisor hierarchy tree">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-row justify-center items-start"
        >
          {roots.map((root, index) => {
            const isFirst = index === 0;
            const isLast = index === roots.length - 1;
            const isOnly = roots.length === 1;

            return (
              <div key={root.id} className="relative flex flex-col items-center px-6">
                {/* Horizontal bar linking multiple top-level root supervisors if > 1 root */}
                {!isOnly && (
                  <div
                    className={`absolute top-0 h-0.5 bg-slate-300 ${
                      isFirst
                        ? 'left-1/2 right-0'
                        : isLast
                        ? 'left-0 right-1/2'
                        : 'left-0 right-0'
                    }`}
                  />
                )}
                {!isOnly && <div className="w-0.5 h-6 bg-slate-300 relative z-10" />}

                <SupervisorNode
                  node={root}
                  expandedNodes={expandedNodes}
                  selectedNode={selectedNode}
                  searchQuery={searchQuery}
                  matchedIds={matchedIds}
                  pathIds={pathIds}
                  onToggle={toggleNode}
                  onSelect={setSelectedNode}
                />
              </div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};

export default memo(SupervisorTree);
