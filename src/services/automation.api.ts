import api from './api';

export interface WorkflowAction {
  id?: string;
  actionType: string;
  actionConfig: Record<string, any>;
  delaySeconds: number;
  runIfConfig?: string | null;
}

export interface AutomationWorkflow {
  id: string;
  name: string;
  description?: string;
  triggerType: string;
  triggerConfig: string; // JSON string
  conditionConfig: string; // JSON string
  active: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
  actions: WorkflowAction[];
  _count?: {
    executions: number;
  };
}

export interface WorkflowExecution {
  id: string;
  workspaceId: string;
  workflowId: string;
  workflowVersion: number;
  workflowSnapshot: string;
  eventId: string;
  recordType: string;
  recordId: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'PARTIALLY_FAILED' | 'SKIPPED' | 'CANCELLED';
  startedAt: string;
  completedAt?: string;
  error?: string;
  createdAt: string;
  actionExecutions?: WorkflowActionExecution[];
}

export interface WorkflowActionExecution {
  id: string;
  workflowExecutionId: string;
  actionId: string;
  position: number;
  status: 'PENDING' | 'RUNNING' | 'WAITING' | 'COMPLETED' | 'FAILED' | 'SKIPPED';
  scheduledAt: string;
  startedAt?: string;
  completedAt?: string;
  attemptCount: number;
  error?: string;
  createdAt: string;
  action?: WorkflowAction;
}

export interface AutomationMeta {
  stages: { id: string; name: string }[];
  sources: { id: string; name: string }[];
  users: { id: string; name: string }[];
  departments: { id: string; name: string }[];
  offices: { id: string; name: string }[];
}

export const getWorkflows = async (): Promise<AutomationWorkflow[]> => {
  const response = await api.get('/settings/automations');
  return response.data?.data || [];
};

export const getWorkflowById = async (id: string): Promise<AutomationWorkflow> => {
  const response = await api.get(`/settings/automations/${id}`);
  return response.data?.data;
};

export const createWorkflow = async (payload: Omit<AutomationWorkflow, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Promise<AutomationWorkflow> => {
  const response = await api.post('/settings/automations', payload);
  return response.data?.data;
};

export const updateWorkflow = async (id: string, payload: Partial<Omit<AutomationWorkflow, 'id' | 'createdAt' | 'updatedAt'>>): Promise<AutomationWorkflow> => {
  const response = await api.put(`/settings/automations/${id}`, payload);
  return response.data?.data;
};

export const deleteWorkflow = async (id: string): Promise<void> => {
  await api.delete(`/settings/automations/${id}`);
};

export const toggleWorkflowStatus = async (id: string, active: boolean): Promise<AutomationWorkflow> => {
  const response = await api.patch(`/settings/automations/${id}/status`, { active });
  return response.data?.data;
};

export const getWorkflowRuns = async (id: string): Promise<WorkflowExecution[]> => {
  const response = await api.get(`/settings/automations/${id}/runs`);
  return response.data?.data || [];
};

export const getWorkflowRunDetail = async (runId: string): Promise<WorkflowExecution> => {
  const response = await api.get(`/settings/automations/runs/${runId}`);
  return response.data?.data;
};

export const getAutomationMeta = async (): Promise<AutomationMeta> => {
  const response = await api.get('/settings/automations/meta');
  return response.data?.data;
};
