import React, { memo, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import OrganisationNode from './OrganisationNode';
import { OrganisationChartNode, OrganisationUserDirectoryEntry } from './types';
import { useOrganisationChartStore } from './organisationChart.store';

interface OrganisationTreeProps {
  roots: OrganisationChartNode[];
  directory?: Record<string, OrganisationUserDirectoryEntry>;
  onTreeReady?: (context: OrganisationTreeContext) => void;
}

export type OrganisationTreeContext = {
  nodeIds: string[];
  departments: string[];
  roles: string[];
  offices: string[];
  visibleCount: number;
  totalCount: number;
  rootCount: number;
};

export type DisplayOrganisationNode = Omit<OrganisationChartNode, 'children'> & {
  children: DisplayOrganisationNode[];
};

const getNodeNote = (value?: string | null): string => value?.trim() || '';

const collectUserNodes = (roots: OrganisationChartNode[]): OrganisationChartNode[] => {
  const users: OrganisationChartNode[] = [];
  const stack = [...roots];
  const visited = new Set<string>();

  while (stack.length > 0) {
    const node = stack.pop();
    if (!node) continue;
    if (visited.has(node.id)) continue;
    visited.add(node.id);

    if (node.nodeType === 'USER') {
      users.push(node);
    }
    node.children.forEach((child) => stack.push(child));
  }

  return users;
};

const wouldCreateCycle = (childId: string, parentId: string, parentByChild: Map<string, string | null>): boolean => {
  let current: string | null | undefined = parentId;
  const visited = new Set<string>();

  while (current) {
    if (current === childId) return true;
    if (visited.has(current)) return true;
    visited.add(current);
    current = parentByChild.get(current);
  }

  return false;
};

const buildSupervisorTree = (
  roots: OrganisationChartNode[],
  directory: Record<string, OrganisationUserDirectoryEntry> = {},
): DisplayOrganisationNode[] => {
  const users = collectUserNodes(roots);
  const nodeById = new Map<string, DisplayOrganisationNode>();
  const parentByChild = new Map<string, string | null>();

  users.forEach((user) => {
    const extra = directory[user.id];
    parentByChild.set(user.id, user.reportingTo || null);
    nodeById.set(user.id, {
      ...user,
      nodeType: 'USER',
      children: [],
      employeeId: user.employeeId || extra?.employeeId || null,
      designation: user.designation || extra?.designation || user.role || null,
      office: user.office || extra?.office || null,
      avatarUrl: user.avatarUrl || extra?.avatarUrl || null,
    });
  });

  const displayRoots: DisplayOrganisationNode[] = [];

  users.forEach((user) => {
    const node = nodeById.get(user.id);
    if (!node) return;
    const parentId = user.reportingTo || null;
    const parent = parentId ? nodeById.get(parentId) : null;

    if (!parent || parentId === user.id || wouldCreateCycle(user.id, parentId, parentByChild)) {
      displayRoots.push(node);
      return;
    }

    node.supervisorName = parent.name;
    parent.children.push(node);
  });

  const sortNodes = (nodes: DisplayOrganisationNode[], depth = 0) => {
    nodes.sort((a, b) => a.name.localeCompare(b.name));
    nodes.forEach((node) => {
      node.depth = depth;
      node.children.forEach((child) => {
        child.supervisorName = node.name;
      });
      sortNodes(node.children, depth + 1);
    });
  };

  sortNodes(displayRoots);
  return displayRoots;
};

const flattenDisplayNodes = (roots: DisplayOrganisationNode[]) => {
  const output: Array<{ node: DisplayOrganisationNode; parentId: string | null }> = [];
  const stack = roots.map((node) => ({ node, parentId: null }));
  const visited = new Set<string>();

  while (stack.length > 0) {
    const next = stack.pop();
    if (!next) continue;
    if (visited.has(next.node.id)) continue;
    visited.add(next.node.id);
    output.push(next);
    [...next.node.children].reverse().forEach((child) => stack.push({ node: child, parentId: next.node.id }));
  }

  return output;
};

const nodeMatchesSearch = (node: DisplayOrganisationNode, query: string): boolean => {
  if (!query) return true;
  const haystack = [
    node.name,
    node.employeeId,
    node.department,
    node.role,
    node.designation,
    node.office,
    node.supervisorName,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(query);
};

const nodeMatchesFilters = (
  node: DisplayOrganisationNode,
  filters: { department: string; role: string; office: string; status: string },
): boolean => {
  if (filters.department && node.department !== filters.department) return false;
  if (filters.role && node.role !== filters.role) return false;
  if (filters.office && (node.office || '') !== filters.office) return false;
  if (filters.status) {
    const expectedStatus = filters.status === 'active';
    if ((node.isActive ?? true) !== expectedStatus) return false;
  }
  return true;
};

const filterTree = (
  nodes: DisplayOrganisationNode[],
  visibleIds: Set<string>,
): DisplayOrganisationNode[] =>
  nodes
    .filter((node) => visibleIds.has(node.id))
    .map((node) => ({
      ...node,
      children: filterTree(node.children, visibleIds),
    }));

const uniqueSorted = (values: Array<string | null | undefined>): string[] =>
  Array.from(new Set(values.map(getNodeNote).filter(Boolean))).sort((a, b) => a.localeCompare(b));

const OrganisationTree: React.FC<OrganisationTreeProps> = ({ roots, directory, onTreeReady }) => {
  const {
    expandedNodes,
    searchQuery,
    filters,
    selectedNode,
    toggleNode,
    setSelectedNode,
    expandNodes,
  } = useOrganisationChartStore();

  const supervisorRoots = useMemo(() => buildSupervisorTree(roots, directory), [directory, roots]);
  const flat = useMemo(() => flattenDisplayNodes(supervisorRoots), [supervisorRoots]);

  const parentById = useMemo(() => {
    const map = new Map<string, string | null>();
    flat.forEach(({ node, parentId }) => map.set(node.id, parentId));
    return map;
  }, [flat]);

  const matchedIds = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return new Set(
      flat
        .filter(({ node }) => nodeMatchesSearch(node, query) && nodeMatchesFilters(node, filters))
        .map(({ node }) => node.id),
    );
  }, [filters, flat, searchQuery]);

  const pathIds = useMemo(() => {
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

  const visibleRoots = useMemo(() => {
    const hasSearchOrFilter = Boolean(
      searchQuery.trim() || filters.department || filters.role || filters.office || filters.status,
    );
    if (!hasSearchOrFilter) return supervisorRoots;
    return filterTree(supervisorRoots, pathIds);
  }, [filters, pathIds, searchQuery, supervisorRoots]);

  useEffect(() => {
    if (searchQuery.trim() && pathIds.size > 0) {
      expandNodes(Array.from(pathIds));
    }
  }, [expandNodes, pathIds, searchQuery]);

  useEffect(() => {
    onTreeReady?.({
      nodeIds: flat.map(({ node }) => node.id),
      departments: uniqueSorted(flat.map(({ node }) => node.department)),
      roles: uniqueSorted(flat.map(({ node }) => node.role)),
      offices: uniqueSorted(flat.map(({ node }) => node.office)),
      visibleCount: visibleRoots.reduce((count, node) => count + flattenDisplayNodes([node]).length, 0),
      totalCount: flat.length,
      rootCount: supervisorRoots.length,
    });
  }, [flat, onTreeReady, visibleRoots]);

  if (supervisorRoots.length === 0) {
    return (
      <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-sm">
        <p className="text-base font-bold text-gray-900">No organisation data available</p>
        <p className="text-sm text-gray-500 mt-1">Create users and set reporting managers to build the chart.</p>
      </div>
    );
  }

  if (visibleRoots.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center">
        <p className="text-base font-black text-gray-900">No users match the current search or filters.</p>
        <p className="mt-1 text-sm font-semibold text-gray-500">Adjust the filters to reveal more of the reporting tree.</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="min-w-full md:min-w-max px-1 md:px-6" role="tree" aria-label="Supervisor based organisation hierarchy">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-10 md:flex-row md:items-start md:justify-center"
        >
          {visibleRoots.map((root) => (
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
