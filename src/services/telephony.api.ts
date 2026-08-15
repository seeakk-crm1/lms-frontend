import api from './api';

export interface ProviderCapabilities {
  inboundCalling: boolean;
  outboundCalling: boolean;
  callRecording: boolean;
  recordingWebhooks: boolean;
  callStatusWebhooks: boolean;
  internationalCalling: boolean;
}

export interface TelephonySettingsData {
  activeProvider: 'DEVICE_DIALER' | 'KNOWLARITY' | 'PLIVO' | 'EXOTEL';
  recordingEnabled: boolean;
  recordOutbound: boolean;
  recordInbound: boolean;
  recordingStorage: 'PROVIDER_STORAGE' | 'SEEAKK_STORAGE';
  retentionMonths: number;
}

export interface TelephonyProviderConfigItem {
  providerKey: 'DEVICE_DIALER' | 'KNOWLARITY' | 'PLIVO' | 'EXOTEL';
  providerName: string;
  capabilities: ProviderCapabilities;
  enabled: boolean;
  virtualNumber?: string;
  callerId?: string;
  hasApiKey: boolean;
  hasApiSecret: boolean;
  hasAccountId: boolean;
  hasAuthToken: boolean;
  hasWebhookSecret: boolean;
  lastHealthCheckAt?: string | null;
  lastError?: string | null;
}

export const getTelephonySettings = async (): Promise<TelephonySettingsData> => {
  const response = await api.get('/telephony/settings');
  return response.data.data;
};

export const updateTelephonySettings = async (payload: Partial<TelephonySettingsData>): Promise<TelephonySettingsData> => {
  const response = await api.put('/telephony/settings', payload);
  return response.data.data;
};

export const getTelephonyProviders = async (): Promise<TelephonyProviderConfigItem[]> => {
  const response = await api.get('/telephony/providers');
  return response.data.data;
};

export const saveTelephonyProviderConfig = async (
  providerKey: string,
  payload: {
    enabled?: boolean;
    apiKey?: string;
    apiSecret?: string;
    accountId?: string;
    authToken?: string;
    virtualNumber?: string;
    callerId?: string;
    webhookSecret?: string;
  },
): Promise<any> => {
  const response = await api.put(`/telephony/providers/${providerKey}`, payload);
  return response.data;
};

export const testTelephonyProviderConnection = async (providerKey: string): Promise<{ success: boolean; message: string }> => {
  const response = await api.post(`/telephony/providers/${providerKey}/test`);
  return response.data.data;
};

export interface TelephonyUserMappingItem {
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  providerKey: string;
  providerAgentId: string;
  providerPhoneNumber: string;
  enabled: boolean;
}

export const getRecordingPlayback = async (sessionId: string): Promise<{ url: string; recordingAvailable: boolean }> => {
  const response = await api.get(`/telephony/recordings/${sessionId}/play`);
  return response.data.data;
};

export const getTelephonyUserMappings = async (providerKey: string = 'KNOWLARITY'): Promise<TelephonyUserMappingItem[]> => {
  const response = await api.get('/telephony/user-mappings', { params: { providerKey } });
  return response.data.data;
};

export const saveTelephonyUserMapping = async (payload: {
  providerKey: string;
  userId: string;
  providerAgentId?: string;
  providerPhoneNumber?: string;
  enabled?: boolean;
}): Promise<any> => {
  const response = await api.put('/telephony/user-mappings', payload);
  return response.data;
};
