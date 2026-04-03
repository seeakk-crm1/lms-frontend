import { create } from 'zustand';
import type {
  BulkAssignAssignmentType,
  BulkAssignFilters,
  BulkAssignPreviewLead,
  BulkAssignResultSummary,
} from '../types/lead.types';

interface BulkAssignProgressState {
  current: number;
  total: number;
  status: 'IDLE' | 'PREPARING' | 'IN_PROGRESS' | 'COMPLETED' | 'PARTIAL' | 'FAILED';
  transport: 'SYNC_READY_FOR_WEBSOCKET';
}

interface BulkAssignStoreState {
  filters: BulkAssignFilters;
  appliedFilters: BulkAssignFilters;
  hasApplied: boolean;
  applyVersion: number;
  assignmentType: BulkAssignAssignmentType;
  selectedAssignee: string;
  selectedAssigneeIds: string[];
  previewCount: number | null;
  previewLeads: BulkAssignPreviewLead[];
  lastResult: BulkAssignResultSummary | null;
  progress: BulkAssignProgressState;
  loading: boolean;
  setFilters: (filters: Partial<BulkAssignFilters>) => void;
  applyFilters: () => void;
  resetFilters: () => void;
  setAssignmentType: (assignmentType: BulkAssignAssignmentType) => void;
  setAssignee: (selectedAssignee: string) => void;
  addRoundRobinAssignee: (assigneeId: string) => void;
  removeRoundRobinAssignee: (assigneeId: string) => void;
  clearRoundRobinAssignees: () => void;
  setPreviewCount: (previewCount: number | null) => void;
  setPreviewLeads: (previewLeads: BulkAssignPreviewLead[]) => void;
  setLastResult: (result: BulkAssignResultSummary | null) => void;
  setProgress: (progress: Partial<BulkAssignProgressState>) => void;
  resetProgress: () => void;
  setLoading: (loading: boolean) => void;
}

const emptyFilters: BulkAssignFilters = {};
const initialProgress: BulkAssignProgressState = {
  current: 0,
  total: 0,
  status: 'IDLE',
  transport: 'SYNC_READY_FOR_WEBSOCKET',
};

const useBulkAssignStore = create<BulkAssignStoreState>((set) => ({
  filters: emptyFilters,
  appliedFilters: emptyFilters,
  hasApplied: false,
  applyVersion: 0,
  assignmentType: 'SINGLE',
  selectedAssignee: '',
  selectedAssigneeIds: [],
  previewCount: null,
  previewLeads: [],
  lastResult: null,
  progress: initialProgress,
  loading: false,
  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),
  applyFilters: () =>
    set((state) => ({
      appliedFilters: { ...state.filters },
      hasApplied: true,
      applyVersion: state.applyVersion + 1,
      lastResult: null,
    })),
  resetFilters: () =>
    set({
      filters: emptyFilters,
      appliedFilters: emptyFilters,
      hasApplied: false,
      applyVersion: 0,
      assignmentType: 'SINGLE',
      selectedAssignee: '',
      selectedAssigneeIds: [],
      previewCount: null,
      previewLeads: [],
      lastResult: null,
      progress: initialProgress,
      loading: false,
    }),
  setAssignmentType: (assignmentType) =>
    set({
      assignmentType,
      selectedAssignee: '',
      selectedAssigneeIds: [],
      lastResult: null,
    }),
  setAssignee: (selectedAssignee) => set({ selectedAssignee }),
  addRoundRobinAssignee: (assigneeId) =>
    set((state) => ({
      selectedAssigneeIds: state.selectedAssigneeIds.includes(assigneeId)
        ? state.selectedAssigneeIds
        : [...state.selectedAssigneeIds, assigneeId],
      lastResult: null,
    })),
  removeRoundRobinAssignee: (assigneeId) =>
    set((state) => ({
      selectedAssigneeIds: state.selectedAssigneeIds.filter((value) => value !== assigneeId),
    })),
  clearRoundRobinAssignees: () => set({ selectedAssigneeIds: [] }),
  setPreviewCount: (previewCount) => set({ previewCount }),
  setPreviewLeads: (previewLeads) => set({ previewLeads }),
  setLastResult: (lastResult) => set({ lastResult }),
  setProgress: (progress) =>
    set((state) => ({
      progress: { ...state.progress, ...progress },
    })),
  resetProgress: () => set({ progress: initialProgress }),
  setLoading: (loading) => set({ loading }),
}));

export const hasActiveBulkAssignFilters = (filters: BulkAssignFilters): boolean =>
  Object.values(filters).some((value) => Boolean(value && String(value).trim()));

export default useBulkAssignStore;
