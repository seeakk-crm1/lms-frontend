import { ENV } from '../config/env';

export const getImageUrl = (url: string | null | undefined): string | undefined => {
  if (!url) return undefined;
  
  // If it's already an absolute URL, return as is
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }

  // If it's a relative API route starting with /api, remove /api since ENV.API_URL includes it
  if (url.startsWith('/api/')) {
    return `${ENV.API_URL}${url.replace('/api', '')}`;
  }
  
  // If it's a known backend route (leads, admin/users), it just needs the API URL prepended
  if (url.startsWith('/leads/') || url.startsWith('/admin/users/') || url.startsWith('/users/')) {
    return `${ENV.API_URL}${url}`;
  }

  // Otherwise, assume it's a Wasabi storage key that needs to go through the upload proxy
  const cleanKey = url.startsWith('/') ? url.slice(1) : url;
  return `${ENV.API_URL}/upload/${encodeURIComponent(cleanKey)}`;
};
