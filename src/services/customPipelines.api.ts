import api from './api';

export interface FilterConditionInput {
  field: string;
  operator: string;
  value?: any;
}

export interface PipelineShareInput {
  shareType: 'USER' | 'ROLE' | 'OFFICE' | 'DEPARTMENT';
  targetId: string;
}

export interface PipelineSection {
  id: string;
  workspaceId: string;
  name: string;
  description?: string | null;
  layoutType: 'FULL' | 'TWO_COL' | 'THREE_COL' | 'FOUR_COL' | 'AUTO';
  visibilityType: 'PRIVATE' | 'SHARED' | 'WORKSPACE';
  sortOrder: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdById: string;
  createdAt: string;
  updatedAt: string;
  pipelines: Pipeline[];
  shares?: any[];
}

export interface PipelineMetrics {
  count: number;
  totalExpectedRevenue: number;
  totalClosedRevenue: number;
  averageRevenue: number;
  secondaryMetric: number;
  stageBreakdown: Array<{ stageId: string; name: string; color: string; count: number }>;
  lastRefreshedAt: string;
}

export interface Pipeline {
  id: string;
  workspaceId: string;
  sectionId: string;
  name: string;
  description?: string | null;
  metricType:
    | 'LEAD_COUNT'
    | 'TOTAL_EXPECTED_REVENUE'
    | 'TOTAL_CLOSED_REVENUE'
    | 'AVERAGE_REVENUE'
    | 'CONVERSION_RATE'
    | 'LOB_COUNT'
    | 'FOLLOWUP_COUNT'
    | 'OVERDUE_FOLLOWUP_COUNT'
    | 'STAGE_DISTRIBUTION';
  displayType:
    | 'COMPACT_CARD'
    | 'HORIZONTAL_BAR'
    | 'PROGRESS_BAR'
    | 'STATUS_CARD'
    | 'MINI_TABLE'
    | 'STAGE_BAR'
    | 'PERCENTAGE_CARD'
    | 'REVENUE_CARD';
  filtersJson: FilterConditionInput[];
  filterLogic: 'AND' | 'OR';
  visibilityType: 'PRIVATE' | 'SHARED' | 'WORKSPACE';
  sortOrder: number;
  status: 'ACTIVE' | 'INACTIVE';
  clickAction: 'OPEN_LEADS' | 'OPEN_DRAWER';
  createdById: string;
  createdAt: string;
  updatedAt: string;
  metrics?: PipelineMetrics;
  shares?: any[];
}

export const getPipelineSections = async (): Promise<PipelineSection[]> => {
  const { data } = await api.get('/dashboard/pipeline-sections');
  return data.data;
};

export const createPipelineSection = async (payload: {
  name: string;
  description?: string;
  layoutType?: string;
  visibilityType?: string;
  sortOrder?: number;
  shares?: PipelineShareInput[];
}): Promise<PipelineSection> => {
  const { data } = await api.post('/dashboard/pipeline-sections', payload);
  return data.data;
};

export const updatePipelineSection = async (
  id: string,
  payload: {
    name?: string;
    description?: string | null;
    layoutType?: string;
    visibilityType?: string;
    status?: string;
    sortOrder?: number;
    shares?: PipelineShareInput[];
  },
): Promise<PipelineSection> => {
  const { data } = await api.patch(`/dashboard/pipeline-sections/${id}`, payload);
  return data.data;
};

export const deletePipelineSection = async (id: string, movePipelinesToSectionId?: string): Promise<void> => {
  await api.delete(`/dashboard/pipeline-sections/${id}`, {
    params: { movePipelinesToSectionId },
  });
};

export const reorderPipelineSections = async (
  sections: Array<{ id: string; sortOrder: number }>,
): Promise<void> => {
  await api.patch('/dashboard/pipeline-sections/reorder', { sections });
};

export const createPipeline = async (payload: {
  sectionId: string;
  name: string;
  description?: string;
  metricType?: string;
  displayType?: string;
  filtersJson?: FilterConditionInput[];
  filterLogic?: 'AND' | 'OR';
  visibilityType?: string;
  clickAction?: string;
  sortOrder?: number;
  shares?: PipelineShareInput[];
}): Promise<Pipeline> => {
  const { data } = await api.post('/dashboard/pipelines', payload);
  return data.data;
};

export const updatePipeline = async (
  id: string,
  payload: {
    sectionId?: string;
    name?: string;
    description?: string | null;
    metricType?: string;
    displayType?: string;
    filtersJson?: FilterConditionInput[];
    filterLogic?: 'AND' | 'OR';
    visibilityType?: string;
    status?: string;
    clickAction?: string;
    sortOrder?: number;
    shares?: PipelineShareInput[];
  },
): Promise<Pipeline> => {
  const { data } = await api.patch(`/dashboard/pipelines/${id}`, payload);
  return data.data;
};

export const deletePipeline = async (id: string): Promise<void> => {
  await api.delete(`/dashboard/pipelines/${id}`);
};

export const duplicatePipeline = async (id: string): Promise<Pipeline> => {
  const { data } = await api.post(`/dashboard/pipelines/duplicate/${id}`);
  return data.data;
};

export const previewPipeline = async (payload: {
  filtersJson: FilterConditionInput[];
  filterLogic: 'AND' | 'OR';
  metricType?: string;
}): Promise<{
  metrics: PipelineMetrics;
  sampleLeads: any[];
  appliedFiltersCount: number;
}> => {
  const { data } = await api.post('/dashboard/pipelines/preview', payload);
  return data.data;
};

export const getPipelineResults = async (
  id: string,
  page = 1,
  limit = 25,
): Promise<{
  pipeline: Pipeline;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  leads: any[];
}> => {
  const { data } = await api.get(`/dashboard/pipelines/${id}/results`, {
    params: { page, limit },
  });
  return data.data;
};
