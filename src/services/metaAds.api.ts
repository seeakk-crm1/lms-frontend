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
