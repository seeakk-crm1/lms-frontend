import api from './api';

export interface InviteValidationResponse {
  valid: boolean;
  invite: {
    email: string;
    expiresAt: string;
    workspace: {
      id: string;
      companyName: string;
    } | null;
    role: {
      id: string;
      name: string;
    } | null;
    user: {
      id: string;
      name: string | null;
    };
  };
}

export interface AcceptInvitePayload {
  token: string;
  password: string;
}

export interface AcceptInviteResponse {
  message: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    workspaceId?: string;
    role: {
      id?: string;
      name?: string;
    } | null;
  };
}

export interface SendUserInviteResponse {
  message: string;
  invite: {
    id: string;
    status: string;
    expiresAt: string;
    createdAt: string;
  };
  user: {
    id: string;
    name: string | null;
    email: string;
    workspaceId?: string | null;
    role: {
      id?: string;
      name?: string;
    } | null;
  };
}

export const validateInviteToken = async (token: string): Promise<InviteValidationResponse> => {
  const response = await api.get('/auth/invite/validate', {
    params: { token },
  });

  return response.data.data;
};

export const acceptInvite = async (payload: AcceptInvitePayload): Promise<AcceptInviteResponse> => {
  const response = await api.post('/auth/invite/accept', payload);
  return response.data.data;
};

export const sendInviteAPI = async (userId: string): Promise<SendUserInviteResponse> => {
  const response = await api.post(`/admin/users/${userId}/send-invite`);
  return response.data.data;
};
