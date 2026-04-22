import { create } from 'zustand';

interface OrganisationChartState {
  expandedNodes: Record<string, boolean>;
  searchQuery: string;
  selectedNode: string | null;
  toggleNode: (id: string) => void;
  setSearch: (query: string) => void;
  setSelectedNode: (id: string | null) => void;
  expandAll: (nodeIds: string[]) => void;
  collapseAll: () => void;
  expandNodes: (nodeIds: string[]) => void;
}

export const useOrganisationChartStore = create<OrganisationChartState>((set) => ({
  expandedNodes: {},
  searchQuery: '',
  selectedNode: null,
  toggleNode: (id) =>
    set((state) => ({
      expandedNodes: {
        ...state.expandedNodes,
        [id]: !state.expandedNodes[id],
      },
    })),
  setSearch: (searchQuery) => set({ searchQuery }),
  setSelectedNode: (selectedNode) => set({ selectedNode }),
  expandAll: (nodeIds) =>
    set(() => ({
      expandedNodes: nodeIds.reduce<Record<string, boolean>>((acc, id) => {
        acc[id] = true;
        return acc;
      }, {}),
    })),
  collapseAll: () => set({ expandedNodes: {} }),
  expandNodes: (nodeIds) =>
    set((state) => {
      const next = { ...state.expandedNodes };
      nodeIds.forEach((id) => {
        next[id] = true;
      });
      return { expandedNodes: next };
    }),
}));

