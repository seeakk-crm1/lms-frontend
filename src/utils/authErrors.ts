import type { AxiosError } from 'axios';

type AuthErrorBody = {
  code?: string;
  message?: string;
  errors?: Record<string, string[]>;
  retryAfterSeconds?: number;
};

const AUTH_MESSAGES: Record<string, string> = {
  AUTH_INVALID_CREDENTIALS:
    'Incorrect email or password. Check your credentials and try again.',
  AUTH_PASSWORD_NOT_SET:
    'This account has no password yet. Open the invitation link from your email to set a password, or ask your admin to resend the invite.',
  AUTH_ACCOUNT_INACTIVE:
    'Your account is inactive. Contact your workspace administrator.',
  AUTH_EMAIL_NOT_VERIFIED:
    'Please verify your email before signing in. Check your inbox for the verification link.',
  AUTH_ROLE_WORKSPACE_MISMATCH:
    'Your account role is not valid for this workspace. Contact your administrator.',
  AUTH_RATE_LIMITED:
    'Too many sign-in attempts. Wait a few minutes and try again.',
  AUTH_SECRET_MISSING:
    'Sign-in is temporarily unavailable (server configuration). Please contact support.',
  AUTH_SERVICE_UNAVAILABLE:
    'Sign-in is temporarily unavailable. Please try again in a moment.',
  AUTH_VALIDATION_FAILED: 'Please check the email and password fields.',
};

export const normalizeLoginCredentials = (email: string, password: string) => ({
  email: email.trim().toLowerCase(),
  password: password.replace(/^[\r\n]+/, '').replace(/[\r\n]+$/, ''),
});

export const getAuthErrorMessage = (error: unknown, fallback = 'Sign-in failed. Please try again.'): string => {
  if (!error || typeof error !== 'object' || !('response' in error)) {
    return fallback;
  }

  const axiosError = error as AxiosError<AuthErrorBody>;
  const status = axiosError.response?.status;
  const data = axiosError.response?.data;

  if (data?.code && AUTH_MESSAGES[data.code]) {
    return AUTH_MESSAGES[data.code];
  }

  if (data?.message && typeof data.message === 'string') {
    return data.message;
  }

  const fieldErrors = data?.errors;
  if (fieldErrors && typeof fieldErrors === 'object') {
    const first = Object.values(fieldErrors).flat().find(Boolean);
    if (typeof first === 'string') return first;
  }

  if (status === 429) {
    const seconds = data?.retryAfterSeconds;
    return seconds
      ? `Too many sign-in attempts. Try again in about ${seconds} seconds.`
      : AUTH_MESSAGES.AUTH_RATE_LIMITED;
  }

  if (status === 503) return AUTH_MESSAGES.AUTH_SERVICE_UNAVAILABLE;
  if (status === 401) return AUTH_MESSAGES.AUTH_INVALID_CREDENTIALS;
  if (status === 403 && data?.message) return data.message;

  return fallback;
};

export const getLoginRedirectNotice = (reason: string | null): string | null => {
  if (reason === 'session-expired') {
    return 'Your session expired. Please sign in again.';
  }
  return null;
};
