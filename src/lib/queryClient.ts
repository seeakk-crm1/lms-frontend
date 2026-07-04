import { QueryClient } from '@tanstack/react-query';

/**
 * Defaults reduce duplicate refetches and background churn while keeping data fresh enough for CRM use.
 * Per-query overrides (e.g. `staleTime: 0`) remain valid where needed.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: true,
      retry: (failureCount, error: any) => {
        if (!error?.response && error?.message === 'Network Error') return false;
        return failureCount < 1;
      },
    },
    mutations: {
      retry: 0,
    },
  },
});
