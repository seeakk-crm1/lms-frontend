import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

/**
 * Blocks in-app navigation, browser back button, and page unload while mandatory follow-up is active.
 * Compatible with BrowserRouter.
 */
export const useMandatoryNavigationLock = (blocked: boolean): void => {
  const location = useLocation();
  const navigate = useNavigate();
  const frozenLocationRef = useRef<string | null>(null);
  const toastCooldownRef = useRef<number>(0);

  // In-App Router Lock & Toast Warning
  useEffect(() => {
    if (!blocked) {
      frozenLocationRef.current = null;
      return;
    }

    const current = `${location.pathname}${location.search}${location.hash}`;

    if (frozenLocationRef.current === null) {
      frozenLocationRef.current = current;
      return;
    }

    if (frozenLocationRef.current !== current) {
      const now = Date.now();
      if (now - toastCooldownRef.current > 3000) {
        toast.error('You must complete or extend this mandatory follow-up before leaving.', {
          id: 'mandatory-nav-lock',
        });
        toastCooldownRef.current = now;
      }
      navigate(frozenLocationRef.current, { replace: true });
    }
  }, [blocked, location.pathname, location.search, location.hash, navigate]);

  // Browser Back Button & Page Reload / Tab Close Safety Warning
  useEffect(() => {
    if (!blocked) return undefined;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      const message = 'This mandatory follow-up is not completed. Your progress may be lost.';
      event.preventDefault();
      event.returnValue = message;
      return message;
    };

    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault();
      const now = Date.now();
      if (now - toastCooldownRef.current > 3000) {
        toast.error('You must complete or extend this mandatory follow-up before leaving.', {
          id: 'mandatory-popstate-lock',
        });
        toastCooldownRef.current = now;
      }
      window.history.pushState(null, '', window.location.href);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    window.history.pushState(null, '', window.location.href);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [blocked]);
};
