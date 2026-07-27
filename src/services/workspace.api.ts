import api from './api';

export type UpdateWorkspacePayload = {
  companyName?: string;
  logoUrl?: string | null;
  employeeCount?: string;
  timeZone?: string;
  language?: string;
  currencyLocale?: string;
};

export type UpdateWorkspaceResponse = {
  success: boolean;
  message: string;
  workspace: {
    id: string;
    companyName: string;
    logoUrl?: string | null;
    employeeCount?: string | null;
    timeZone?: string | null;
    language?: string | null;
    currencyLocale?: string | null;
    loadSampleData?: boolean;
  };
};

export const updateWorkspaceProfile = async (
  payload: UpdateWorkspacePayload,
): Promise<UpdateWorkspaceResponse> => {
  const response = await api.patch<UpdateWorkspaceResponse>('/workspace/profile', payload);
  return response.data;
};

/** Alias for backward compatibility */
export const updateWorkspaceBranding = updateWorkspaceProfile;
