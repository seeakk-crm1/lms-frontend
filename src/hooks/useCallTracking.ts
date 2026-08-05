import { useCallback, useEffect, useState } from 'react';
import { initiateCall, InitiateCallResponse } from '../services/calls.api';

export interface UseCallTrackingState {
  isModalOpen: boolean;
  isDialing: boolean;
  activeSession: {
    callSessionId: string;
    leadId: string;
    leadName: string;
    leadPhone: string;
    sourceContext: string;
    followUpId?: string;
    currentStageName?: string;
    currentSubstageName?: string;
  } | null;
}

export const useCallTracking = () => {
  const [state, setState] = useState<UseCallTrackingState>({
    isModalOpen: false,
    isDialing: false,
    activeSession: null,
  });

  const [pendingReturnSession, setPendingReturnSession] = useState<any | null>(null);

  // Return to tab listener
  useEffect(() => {
    const handleReturnToTab = () => {
      if (document.visibilityState === 'visible' && pendingReturnSession) {
        setState((prev) => ({
          ...prev,
          isModalOpen: true,
          isDialing: false,
          activeSession: pendingReturnSession,
        }));
        setPendingReturnSession(null);
      }
    };

    document.addEventListener('visibilitychange', handleReturnToTab);
    window.addEventListener('focus', handleReturnToTab);

    return () => {
      document.removeEventListener('visibilitychange', handleReturnToTab);
      window.removeEventListener('focus', handleReturnToTab);
    };
  }, [pendingReturnSession]);

  const startCall = useCallback(
    async (
      leadId: string,
      leadName: string,
      leadPhone: string,
      sourceContext: 'ALL_LEADS' | 'LEAD_DETAILS' | 'FOLLOW_UP_POPUP' = 'ALL_LEADS',
      followUpId?: string,
      currentStageName?: string,
      currentSubstageName?: string,
    ) => {
      if (!leadPhone || !leadPhone.trim()) {
        alert('Lead does not have a phone number.');
        return;
      }

      setState((prev) => ({ ...prev, isDialing: true }));

      try {
        const res: InitiateCallResponse = await initiateCall(leadId, sourceContext, followUpId);

        const sessionData = {
          callSessionId: res.callSessionId,
          leadId,
          leadName,
          leadPhone: res.phone,
          sourceContext,
          followUpId,
          currentStageName,
          currentSubstageName,
        };

        // Set pending session for return listener
        setPendingReturnSession(sessionData);

        // Open dialer
        window.location.href = res.telUrl;

        // Fallback timer: Open outcome modal after 2.5 seconds if tab didn't lose focus
        setTimeout(() => {
          setState((prev) => {
            if (!prev.isModalOpen && pendingReturnSession) {
              return {
                ...prev,
                isModalOpen: true,
                isDialing: false,
                activeSession: sessionData,
              };
            }
            return prev;
          });
        }, 2500);
      } catch (err: any) {
        console.error('Call initiation failed:', err);
        const msg = err.response?.data?.message || 'Failed to initiate call.';
        alert(msg);
        setState((prev) => ({ ...prev, isDialing: false }));
      }
    },
    [pendingReturnSession],
  );

  const closeModal = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isModalOpen: false,
      activeSession: null,
    }));
    setPendingReturnSession(null);
  }, []);

  return {
    ...state,
    startCall,
    closeModal,
  };
};
