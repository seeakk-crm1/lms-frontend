import api from './api';

export interface ForgotPasswordResponse {
  message: string;
}

export interface ValidateResetTokenResponse {
  valid: boolean;
  email: string;
  expiresAt: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export const forgotPasswordAPI = async (email: string): Promise<ForgotPasswordResponse> => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

export const validateResetTokenAPI = async (token: string): Promise<ValidateResetTokenResponse> => {
  const response = await api.get('/auth/reset-password/validate', {
    params: { token },
  });
  return response.data;
};

export const resetPasswordAPI = async (payload: ResetPasswordPayload): Promise<ResetPasswordResponse> => {
  const response = await api.post('/auth/reset-password', payload);
  return response.data;
};
