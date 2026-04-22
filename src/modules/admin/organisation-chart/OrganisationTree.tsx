import React, { memo, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import OrganisationNode from './OrganisationNode';
import { OrganisationChartNode } from './types';
import { useOrganisationChartStore } from './organisationChart.store';

interface OrganisationTreeProps {
  roots: OrganisationChartNode[];
}

type FlatNode = {
  id: string;
  name: string;
  role: string | null;
  department: string | null;
  parentId: string | null;
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
      role: next.node.role,
      department: next.node.department,
      parentId: next.parentId,
    });
    next.node.children.forEach((child) => queue.push({ node: child, parentId: next.node.id }));
  }

  return output;
};

const OrganisationTree: React.FC<OrganisationTreeProps> = ({ roots }) => {
  const {
    expandedNodes,
    searchQuery,
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
    if (!query) return new Set<string>();
    return new Set(
      flat
        .filter((node) => {
          const hay = `${node.name} ${node.role || ''} ${node.department || ''}`.toLowerCase();
          return hay.includes(query);
        })
        .map((node) => node.id),
    );
  }, [flat, searchQuery]);

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
        <p className="text-base font-bold text-gray-900">No organisation data available</p>
        <p className="text-sm text-gray-500 mt-1">Create users and set reporting managers to build the chart.</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="min-w-max px-3 md:px-6" role="tree" aria-label="Organisation hierarchy tree">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row gap-8 justify-center items-start"
        >
          {roots.map((root) => (
            <OrganisationNode
              key={root.id}
              node={root}
              expandedNodes={expandedNodes}
              selectedNode={selectedNode}
              searchQuery={searchQuery}
              matchedIds={matchedIds}
              pathIds={pathIds}
              onToggle={toggleNode}
              onSelect={setSelectedNode}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default memo(OrganisationTree);
