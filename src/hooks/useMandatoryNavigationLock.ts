import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Blocks in-app navigation while mandatory follow-up continuation is active.
 * Compatible with BrowserRouter (unlike useBlocker, which requires a data router).
 */
export const useMandatoryNavigationLock = (blocked: boolean): void => {
  const location = useLocation();
  const navigate = useNavigate();
  const frozenLocationRef = useRef<string | null>(null);

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
      navigate(frozenLocationRef.current, { replace: true });
    }
  }, [blocked, location.pathname, location.search, location.hash, navigate]);
};
