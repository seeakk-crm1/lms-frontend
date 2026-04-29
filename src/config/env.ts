const requireEnv = (key: string): string => {
  const value = (import.meta.env as Record<string, string | undefined>)[key];
  if (!value && import.meta.env.PROD) {
    console.error(`Missing required env var: ${key}`);
  }
  return value || '';
};

export const ENV = {
  API_URL: requireEnv('VITE_API_URL') || 'http://localhost:5000/api',
  BACKEND_URL: requireEnv('VITE_BACKEND_URL') || 'http://localhost:5000',
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
};
