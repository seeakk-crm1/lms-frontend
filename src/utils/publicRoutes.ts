/** Marketing/auth pages where user workflow gates and session checks must not run. */
export const isPublicMarketingRoute = (pathname: string): boolean => {
  const normalized = (pathname || '/').replace(/\/+$/, '') || '/';

  if (normalized === '/') return true;
  if (normalized === '/login' || normalized.startsWith('/login/')) return true;
  if (normalized.startsWith('/invite')) return true;
  if (normalized === '/activate-account') return true;
  if (normalized === '/forgot-password') return true;
  if (normalized === '/reset-password') return true;

  return false;
};

export const shouldRunAuthenticatedWorkflow = (
  isAuthenticated: boolean,
  isOnboarded: boolean | undefined,
  pathname: string,
): boolean => Boolean(isAuthenticated && isOnboarded && !isPublicMarketingRoute(pathname));
