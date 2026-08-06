import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { initiateCall, InitiateCallResponse } from '../services/calls.api';

export interface UseCallTrackingState {
  isModalOpen: boolean;
  isDialing: boolean;
  isInitiatorOpen: boolean;
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
  initiatorSession: {
    callSessionId: string;
    leadId: string;
    leadName: string;
    leadPhone: string;
    telUrl: string;
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
    isInitiatorOpen: false,
    activeSession: null,
    initiatorSession: null,
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
          isInitiatorOpen: false,
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
        toast.error('Lead does not have a valid phone number.');
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
          telUrl: res.telUrl,
          sourceContext,
          followUpId,
          currentStageName,
          currentSubstageName,
        };

        // Open in-app Call Initiator Modal
        setState((prev) => ({
          ...prev,
          isDialing: false,
          isInitiatorOpen: true,
          initiatorSession: sessionData,
        }));
      } catch (err: any) {
        console.error('Call initiation failed:', err);
        const msg = err.response?.data?.message || 'Failed to initiate call.';
        toast.error(msg);
        setState((prev) => ({ ...prev, isDialing: false }));
      }
    },
    [],
  );

  const launchDialer = useCallback(() => {
    if (!state.initiatorSession) return;
    const session = state.initiatorSession;

    setPendingReturnSession(session);
    setState((prev) => ({ ...prev, isInitiatorOpen: false }));

    // Trigger device dialer
    window.location.href = session.telUrl;

    // Fallback timer: Open outcome modal after 2.5 seconds if tab didn't lose focus
    setTimeout(() => {
      setState((prev) => {
        if (!prev.isModalOpen && session) {
          return {
            ...prev,
            isModalOpen: true,
            isDialing: false,
            activeSession: session,
          };
        }
        return prev;
      });
    }, 2500);
  }, [state.initiatorSession]);

  const launchDirectOutcome = useCallback(() => {
    if (!state.initiatorSession) return;
    const session = state.initiatorSession;

    setState((prev) => ({
      ...prev,
      isInitiatorOpen: false,
      isModalOpen: true,
      activeSession: session,
    }));
  }, [state.initiatorSession]);

  const closeInitiator = useCallback(() => {
    setState((prev) => ({ ...prev, isInitiatorOpen: false, initiatorSession: null }));
  }, []);

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
    launchDialer,
    launchDirectOutcome,
    closeInitiator,
    closeModal,
  };
};
