import api from './api';

export interface MetaConnectionItem {
  id: string;
  name: string;
  metaUserId: string | null;
  metaUserName: string | null;
  metaBusinessId: string | null;
  status: 'CONNECTED' | 'EXPIRED' | 'RECONNECT_REQUIRED' | 'ERROR' | 'DISCONNECTED';
  tokenExpiresAt: string | null;
  pagesCount: number;
  automationsCount: number;
  lastHealthCheckAt: string | null;
  lastSyncAt: string | null;
  lastError: string | null;
  createdAt: string;
  pages?: Array<{
    id: string;
    metaPageId: string;
    pageName: string;
    pictureUrl?: string | null;
    status: string;
    subscribedToLeadgen: boolean;
  }>;
}

export interface MetaPageItem {
  id: string;
  metaPageId: string;
  pageName: string;
  pictureUrl?: string | null;
  subscribedToLeadgen: boolean;
  status: string;
}

export interface MetaFormItem {
  id: string;
  metaFormId: string;
  formName: string;
  enabled: boolean;
}

export interface MetaFormFieldItem {
  id: string;
  key: string;
  label: string;
  type: string;
}

export interface MetaMappingInput {
  destinationKey: string;
  sourceType: 'FIELD' | 'STATIC' | 'SYSTEM';
  sourceKey?: string;
  staticValue?: string;
}

export interface MetaAutomationItem {
  id: string;
  name: string;
  isActive: boolean;
  connectionId: string;
  connectionName: string;
  connectionStatus?: string;
  pageId: string;
  metaPageId?: string;
  pageName: string;
  pagePictureUrl?: string | null;
  metaFormId: string;
  metaFormName: string;
  mappingCount: number;
  leadsReceivedCount: number;
  lastLeadAt: string | null;
  lastSuccessAt: string | null;
  lastErrorAt: string | null;
  lastError: string | null;
  createdAt: string;
  mappings?: MetaMappingInput[];
}

export interface MetaTestResult {
  automationId: string;
  automationName: string;
  ready: boolean;
  checklist: Array<{
    name: string;
    passed: boolean;
    message: string;
  }>;
}

export interface MetaRunLogItem {
  id: string;
  automationId: string;
  automationName?: string;
  pageName?: string;
  formName?: string;
  leadgenId: string;
  status: 'RECEIVED' | 'PROCESSING' | 'SUCCESS' | 'DUPLICATE' | 'IGNORED' | 'RETRY' | 'FAILED';
  attempts: number;
  errorMessage: string | null;
  startedAt: string;
  completedAt: string | null;
  crmLead?: {
    id: string;
    name: string;
    phone: string;
    email: string;
  } | null;
}

// -----------------------------------------------------------------------------
// OAUTH & CONNECTIONS
// -----------------------------------------------------------------------------

export const getMetaAuthUrl = async (): Promise<{ url: string }> => {
  const response = await api.get('/integrations/meta/auth-url');
  return response.data.data;
};

export const getMetaConnections = async (): Promise<MetaConnectionItem[]> => {
  const response = await api.get('/integrations/meta/connections');
  return response.data.data;
};

export const disconnectMetaConnection = async (connectionId: string): Promise<any> => {
  const response = await api.delete(`/integrations/meta/connections/${connectionId}`);
  return response.data;
};

// -----------------------------------------------------------------------------
// DISCOVERY (PAGES, FORMS & FIELDS)
// -----------------------------------------------------------------------------

export const getMetaPagesForConnection = async (connectionId: string, refresh = false): Promise<MetaPageItem[]> => {
  const response = await api.get(`/integrations/meta/connections/${connectionId}/pages${refresh ? '?refresh=true' : ''}`);
  return response.data.data;
};

export const getMetaFormsForPage = async (pageId: string, refresh = false): Promise<MetaFormItem[]> => {
  const response = await api.get(`/integrations/meta/pages/${pageId}/forms${refresh ? '?refresh=true' : ''}`);
  return response.data.data;
};

export const getMetaFormFields = async (pageId: string, metaFormId: string): Promise<MetaFormFieldItem[]> => {
  const response = await api.get(`/integrations/meta/pages/${pageId}/forms/${metaFormId}/fields`);
  return response.data.data;
};

// -----------------------------------------------------------------------------
// AUTOMATIONS
// -----------------------------------------------------------------------------

export const getMetaAutomations = async (): Promise<MetaAutomationItem[]> => {
  const response = await api.get('/integrations/meta/automations');
  return response.data.data;
};

export const getMetaAutomationById = async (id: string): Promise<MetaAutomationItem> => {
  const response = await api.get(`/integrations/meta/automations/${id}`);
  return response.data.data;
};

export const createMetaAutomation = async (payload: {
  name: string;
  connectionId: string;
  pageId: string;
  metaFormId: string;
  metaFormName: string;
  isActive?: boolean;
  mappings: MetaMappingInput[];
}): Promise<MetaAutomationItem> => {
  const response = await api.post('/integrations/meta/automations', payload);
  return response.data.data;
};

export const updateMetaAutomation = async (
  id: string,
  payload: {
    name?: string;
    isActive?: boolean;
    mappings?: MetaMappingInput[];
  },
): Promise<MetaAutomationItem> => {
  const response = await api.put(`/integrations/meta/automations/${id}`, payload);
  return response.data.data;
};

export const deleteMetaAutomation = async (id: string): Promise<any> => {
  const response = await api.delete(`/integrations/meta/automations/${id}`);
  return response.data;
};

export const duplicateMetaAutomation = async (id: string): Promise<MetaAutomationItem> => {
  const response = await api.post(`/integrations/meta/automations/${id}/duplicate`);
  return response.data.data;
};

export const toggleMetaAutomation = async (id: string, isActive: boolean): Promise<any> => {
  const response = await api.post(`/integrations/meta/automations/${id}/toggle`, { isActive });
  return response.data.data;
};

export const testMetaAutomation = async (id: string): Promise<MetaTestResult> => {
  const response = await api.post(`/integrations/meta/automations/${id}/test`);
  return response.data.data;
};

// -----------------------------------------------------------------------------
// LOGS & RETRIES
// -----------------------------------------------------------------------------

export const getMetaAutomationLogs = async (): Promise<MetaRunLogItem[]> => {
  const response = await api.get('/integrations/meta/runs');
  return response.data.data;
};

export const retryMetaAutomationRun = async (runId: string): Promise<any> => {
  const response = await api.post(`/integrations/meta/runs/${runId}/retry`);
  return response.data;
};

// Legacy compatibility fallbacks
export const getMetaStatus = async (): Promise<any> => {
  const connections = await getMetaConnections();
  const isConnected = connections.some((c) => c.status === 'CONNECTED');
  return {
    status: isConnected ? 'CONNECTED' : 'NOT_CONNECTED',
    accountName: connections[0]?.name || null,
    connectedPagesCount: connections.reduce((acc, c) => acc + c.pagesCount, 0),
    activeFormsCount: connections.reduce((acc, c) => acc + c.automationsCount, 0),
    importedToday: 0,
    importedMonth: 0,
    failedImports: 0,
    lastSync: connections[0]?.lastSyncAt || null,
  };
};
export const getMetaPagesAndForms = async (): Promise<any[]> => [];
export const saveMetaFormConfig = async (_formId: string, _payload: any): Promise<any> => ({});
export const getMetaSyncActivity = getMetaAutomationLogs;
export const retryMetaFailedImport = retryMetaAutomationRun;
export const disconnectMeta = async () => ({});
