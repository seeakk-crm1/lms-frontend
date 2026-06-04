import { useLocation } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { shouldRunAuthenticatedWorkflow } from '../utils/publicRoutes';

/** True only for logged-in, onboarded users on non-public app routes. */
export const useAuthenticatedWorkflowEnabled = (): boolean => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isOnboarded = useAuthStore((state) => state.user?.isOnboarded);
  const { pathname } = useLocation();

  return shouldRunAuthenticatedWorkflow(isAuthenticated, isOnboarded, pathname);
};
