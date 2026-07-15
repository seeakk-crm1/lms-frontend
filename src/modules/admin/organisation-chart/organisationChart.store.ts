import { create } from 'zustand';

interface OrganisationChartFilters {
  department: string;
  role: string;
  office: string;
  status: string;
}

interface OrganisationChartState {
  expandedNodes: Record<string, boolean>;
  searchQuery: string;
  filters: OrganisationChartFilters;
  selectedNode: string | null;
  toggleNode: (id: string) => void;
  setSearch: (query: string) => void;
  setFilters: (filters: Partial<OrganisationChartFilters>) => void;
  setSelectedNode: (id: string | null) => void;
  expandAll: (nodeIds: string[]) => void;
  collapseAll: (nodeIds?: string[]) => void;
  expandNodes: (nodeIds: string[]) => void;
}

export const useOrganisationChartStore = create<OrganisationChartState>((set) => ({
  expandedNodes: {},
  searchQuery: '',
  filters: {
    department: '',
    role: '',
    office: '',
    status: '',
  },
  selectedNode: null,
  toggleNode: (id) =>
    set((state) => ({
      expandedNodes: {
        ...state.expandedNodes,
        [id]: !state.expandedNodes[id],
      },
    })),
  setSearch: (searchQuery) => set({ searchQuery }),
  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
  setSelectedNode: (selectedNode) => set({ selectedNode }),
  expandAll: (nodeIds) =>
    set(() => ({
      expandedNodes: nodeIds.reduce<Record<string, boolean>>((acc, id) => {
        acc[id] = true;
        return acc;
      }, {}),
    })),
  collapseAll: (nodeIds) =>
    set(() => ({
      expandedNodes: nodeIds
        ? nodeIds.reduce<Record<string, boolean>>((acc, id) => {
            acc[id] = false;
            return acc;
          }, {})
        : {},
    })),
  expandNodes: (nodeIds) =>
    set((state) => {
      const next = { ...state.expandedNodes };
      nodeIds.forEach((id) => {
        next[id] = true;
      });
      return { expandedNodes: next };
    }),
}));
