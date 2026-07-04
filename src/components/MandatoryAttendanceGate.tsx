import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { getTodayStatus } from '../services/attendance.api';
import { useAuthenticatedWorkflowEnabled } from '../hooks/useAuthenticatedWorkflowEnabled';
import { subscribeAttendanceRefresh } from '../utils/attendanceRefresh';
import { useMandatoryNavigationLock } from '../hooks/useMandatoryNavigationLock';
import { MandatoryAttendanceModal } from './MandatoryAttendanceModal';

interface Props {
  children: React.ReactNode;
}

const MandatoryAttendanceGate: React.FC<Props> = ({ children }) => {
  const enabled = useAuthenticatedWorkflowEnabled();
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadStatus = useCallback(async () => {
    if (!enabled) {
      setStatus(null);
      setLoading(false);
      return;
    }

    try {
      console.log('Background Check Started');
      setLoading(true);
      const res = await getTodayStatus();
      console.log('Attendance Status Received');
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
      (status.requiresMandatoryPopup || status.requiresMandatoryCheckoutPopup || status.isLocked),
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

  const showLoader = blocked && loading;
  const modal = blocked && !loading && status ? <MandatoryAttendanceModal status={status} onSuccess={() => void loadStatus()} /> : null;

  return (
    <>
      {children}
      {blocked && modal && typeof document !== 'undefined' ? createPortal(modal, document.body) : modal}
    </>
  );
};

export default MandatoryAttendanceGate;
