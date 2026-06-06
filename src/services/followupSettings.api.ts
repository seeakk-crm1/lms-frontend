import api from './api';

export interface FollowUpSettings {
  id: string;
  workspaceId: string;
  dailyLimitEnabled: boolean;
  dailyLimitCount: number;
  isActive: boolean;
  capacityValidationEnabled: boolean;
  bulkExtensionEnabled: boolean;
  autoDistributionEnabled: boolean;
  defaultBulkExtensionDuration: string;
  maxBulkExtensionCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TemporaryAccessEntry {
  id: string;
  userId: string;
  workspaceId: string;
  grantedById: string;
  duration: string;
  startsAt: string;
  expiresAt: string;
  isActive: boolean;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  grantedBy: {
    id: string;
    name: string | null;
    email: string;
  };
}

export const getFollowUpSettings = async (): Promise<{ success: boolean; data: FollowUpSettings }> => {
  const response = await api.get('/followup-settings');
  return response.data;
};

export const updateFollowUpSettings = async (payload: Partial<FollowUpSettings>): Promise<{ success: boolean; data: FollowUpSettings }> => {
  const response = await api.put('/followup-settings', payload);
  return response.data;
};

export const getTemporaryAccessList = async (): Promise<{ success: boolean; data: TemporaryAccessEntry[] }> => {
  const response = await api.get('/followup-settings/temporary-access');
  return response.data;
};

export const grantTemporaryAccess = async (payload: { userId: string; duration: string; customExpiryDate?: string }): Promise<{ success: boolean; data: TemporaryAccessEntry }> => {
  const response = await api.post('/followup-settings/temporary-access', payload);
  return response.data;
};

export const revokeTemporaryAccess = async (id: string): Promise<{ success: boolean }> => {
  const response = await api.delete(`/followup-settings/temporary-access/${id}`);
  return response.data;
};

export const bulkExtendFollowUps = async (payload: {
  followUpIds: string[];
  newFollowupDate: string;
  extensionReasonId?: string | null;
  recentDescription?: string | null;
  autoDistribute?: boolean;
}): Promise<{
  success: boolean;
  message: string;
  successCount: number;
  blockedCount: number;
  successIds?: string[];
  blockedIds?: string[];
  selectedCount?: number;
  movedCount?: number;
  remainingCount?: number;
  availableSlots?: number;
  lifecycleBlockedCount?: number;
  targetDate?: string;
  overdueSession?: {
    overdueFollowupRequired: boolean;
    overdueFollowupCount: number;
    items: Array<{ id: string }>;
  };
}> => {
  const response = await api.post('/followups/bulk-extend', payload);
  return response.data;
};

export const getTodayFollowUpUtilization = async (): Promise<{ success: boolean; data: { count: number; limit: number; limitEnabled: boolean } }> => {
  const response = await api.get('/followups/today-utilization');
  return response.data;
};
