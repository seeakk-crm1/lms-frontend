import api from './api';

export type UpdateWorkspaceBrandingPayload = {
  companyName: string;
  logoUrl?: string | null;
};

export type UpdateWorkspaceBrandingResponse = {
  success: boolean;
  message: string;
  workspace: {
    id: string;
    companyName: string;
    logoUrl?: string | null;
  };
};

export const updateWorkspaceBranding = async (
  payload: UpdateWorkspaceBrandingPayload,
): Promise<UpdateWorkspaceBrandingResponse> => {
  const response = await api.patch<UpdateWorkspaceBrandingResponse>('/workspace/profile', payload);
  return response.data;
};
