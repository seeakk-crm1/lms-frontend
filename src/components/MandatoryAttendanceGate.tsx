import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import useAuthStore from '../store/useAuthStore';
import { getTodayStatus } from '../services/attendance.api';
import { subscribeAttendanceRefresh } from '../utils/attendanceRefresh';
import { useMandatoryNavigationLock } from '../hooks/useMandatoryNavigationLock';
import { MandatoryAttendanceModal } from './MandatoryAttendanceModal';

interface Props {
  children: React.ReactNode;
}

const MandatoryAttendanceGate: React.FC<Props> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const enabled = Boolean(isAuthenticated && user?.isOnboarded);

  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadStatus = useCallback(async () => {
    if (!enabled) {
      setStatus(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await getTodayStatus();
      if (res.success) {
        setStatus(res.data);
      }
    } catch {
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  useEffect(() => subscribeAttendanceRefresh(() => void loadStatus()), [loadStatus]);

  const blocked = Boolean(
    enabled &&
    status &&
    !status.isHoliday &&
    !status.isWeeklyOff &&
    (status.requiresMandatoryPopup || status.isLocked),
  );

  useMandatoryNavigationLock(blocked);

  useEffect(() => {
    if (!blocked) return undefined;

    const blockKeys = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    const blockBackButton = () => {
      window.history.pushState(null, '', window.location.href);
    };

    document.addEventListener('keydown', blockKeys, true);
    window.addEventListener('popstate', blockBackButton);
    window.history.pushState(null, '', window.location.href);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', blockKeys, true);
      window.removeEventListener('popstate', blockBackButton);
      document.body.style.overflow = previousOverflow;
    };
  }, [blocked]);

  if (!enabled) {
    return <>{children}</>;
  }

  if (blocked) {
    const showLoader = loading;
    const modal =
      !loading && status ? (
        <MandatoryAttendanceModal
          status={status}
          onSuccess={() => void loadStatus()}
        />
      ) : null;

    return (
      <>
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-slate-950/70 backdrop-blur-md">
          {showLoader ? (
            <div className="flex flex-col items-center gap-3 text-white">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-emerald-400" />
              <p className="text-sm font-bold tracking-wide">Checking attendance requirements…</p>
            </div>
          ) : null}
        </div>
        {modal && typeof document !== 'undefined' ? createPortal(modal, document.body) : modal}
      </>
    );
  }

  return <>{children}</>;
};

export default MandatoryAttendanceGate;
