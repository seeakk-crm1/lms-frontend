import api from './api';

export interface MetaStatusData {
  status: 'NOT_CONNECTED' | 'CONNECTED' | 'REAUTH_REQUIRED' | 'PAUSED' | 'ERROR';
  accountName: string | null;
  connectedPagesCount: number;
  activeFormsCount: number;
  importedToday: number;
  importedMonth: number;
  failedImports: number;
  lastSync: string | null;
}

export interface MetaFieldMappingItem {
  metaFieldName: string;
  metaFieldLabel?: string;
  seeakkFieldKey: string;
}

export interface MetaFormConfigInput {
  enabled: boolean;
  defaultLeadStageId?: string | null;
  leadSourceId?: string | null;
  assignmentType: 'UNASSIGNED' | 'SPECIFIC_USER' | 'ROUND_ROBIN';
  assignmentUserId?: string | null;
  roundRobinUserIds?: string[];
  fieldMappings: MetaFieldMappingItem[];
}

export interface MetaAutomationInput {
  name: string;
  metaConnectionId?: string | null;
  metaPageConnectionId: string;
  metaFormId: string;
  formName?: string;
  enabled?: boolean;
  defaultLeadStageId?: string | null;
  leadSourceId?: string | null;
  assignmentType: 'UNASSIGNED' | 'SPECIFIC_USER' | 'ROUND_ROBIN';
  assignmentUserId?: string | null;
  roundRobinUserIds?: string[];
  fieldMappings: MetaFieldMappingItem[];
}

export const getMetaAuthUrl = async (): Promise<{ url: string }> => {
  const response = await api.get('/integrations/meta/auth-url');
  return response.data.data;
};

export const getMetaStatus = async (): Promise<MetaStatusData> => {
  const response = await api.get('/integrations/meta/status');
  return response.data.data;
};

export const getMetaPagesAndForms = async (): Promise<any[]> => {
  const response = await api.get('/integrations/meta/pages');
  return response.data.data;
};

export const saveMetaFormConfig = async (formId: string, payload: MetaFormConfigInput): Promise<any> => {
  const response = await api.put(`/integrations/meta/forms/${formId}`, payload);
  return response.data;
};

export const getMetaSyncActivity = async (): Promise<any[]> => {
  const response = await api.get('/integrations/meta/sync-activity');
  return response.data.data;
};

export const retryMetaFailedImport = async (importId: string): Promise<any> => {
  const response = await api.post(`/integrations/meta/sync-activity/${importId}/retry`);
  return response.data;
};

export const disconnectMeta = async (): Promise<any> => {
  const response = await api.post('/integrations/meta/disconnect');
  return response.data;
};

// Multi-Automation System API Clients
export const getMetaConnections = async (): Promise<any[]> => {
  const response = await api.get('/integrations/meta/connections');
  return response.data.data;
};

export const getMetaPagesForConnection = async (connectionId: string): Promise<any[]> => {
  const response = await api.get(`/integrations/meta/connections/${connectionId}/pages`);
  return response.data.data;
};

export const getMetaPageForms = async (pageConnectionId: string): Promise<any[]> => {
  const response = await api.get(`/integrations/meta/pages/${pageConnectionId}/forms`);
  return response.data.data;
};

export const getMetaFormFields = async (pageConnectionId: string, metaFormId: string): Promise<any[]> => {
  const response = await api.get(`/integrations/meta/pages/${pageConnectionId}/forms/${metaFormId}/fields`);
  return response.data.data;
};

export const getSeeakkLeadFields = async (): Promise<any[]> => {
  const response = await api.get('/integrations/meta/seeakk-lead-fields');
  return response.data.data;
};

export const getMetaAutomations = async (): Promise<any[]> => {
  const response = await api.get('/integrations/meta/automations');
  return response.data.data;
};

export const createMetaAutomation = async (payload: MetaAutomationInput): Promise<any> => {
  const response = await api.post('/integrations/meta/automations', payload);
  return response.data;
};

export const getMetaAutomationById = async (id: string): Promise<any> => {
  const response = await api.get(`/integrations/meta/automations/${id}`);
  return response.data.data;
};

export const updateMetaAutomation = async (id: string, payload: Partial<MetaAutomationInput>): Promise<any> => {
  const response = await api.put(`/integrations/meta/automations/${id}`, payload);
  return response.data;
};

export const toggleMetaAutomation = async (id: string, enabled: boolean): Promise<any> => {
  const response = await api.patch(`/integrations/meta/automations/${id}/toggle`, { enabled });
  return response.data;
};

export const duplicateMetaAutomation = async (id: string): Promise<any> => {
  const response = await api.post(`/integrations/meta/automations/${id}/duplicate`);
  return response.data;
};

export const deleteMetaAutomation = async (id: string): Promise<any> => {
  const response = await api.delete(`/integrations/meta/automations/${id}`);
  return response.data;
};
