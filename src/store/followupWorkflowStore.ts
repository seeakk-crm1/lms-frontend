import { create } from 'zustand';

export type FollowupPopupSource = 'MANDATORY' | 'DASHBOARD' | 'CALENDAR' | 'REALTIME' | 'OTHER';

export interface FollowupConfirmationModalState {
  isOpen: boolean;
  type: 'COMPLETED' | 'EXTENDED';
  followUp: any;
  leadId: string;
  leadName?: string;
}

interface FollowupWorkflowState {
  isActive: boolean;
  popupSource: FollowupPopupSource | null;
  queue: any[];
  queueIndex: number;
  currentFollowup: any | null;

  isEditingFromFollowup: boolean;
  openedLeadId: string | null;
  openedLead: any | null;
  returnAfterEdit: boolean;

  confirmationModal: FollowupConfirmationModalState | null;

  // Actions
  startWorkflow: (followUps: any[], source: FollowupPopupSource, initialIndex?: number) => void;
  setCurrentFollowup: (followUp: any, source?: FollowupPopupSource) => void;
  openLeadFromFollowup: (followUp: any, source?: FollowupPopupSource) => void;
  showPostActionConfirmation: (type: 'COMPLETED' | 'EXTENDED', followUp: any) => void;
  closeConfirmationModal: (openLeadClicked?: boolean) => void;
  handleLeadSaveSuccess: () => void;
  handleLeadCancel: () => void;
  advanceQueue: () => void;
  resetWorkflow: () => void;
}

export const useFollowupWorkflowStore = create<FollowupWorkflowState>((set, get) => ({
  isActive: false,
  popupSource: null,
  queue: [],
  queueIndex: 0,
  currentFollowup: null,

  isEditingFromFollowup: false,
  openedLeadId: null,
  openedLead: null,
  returnAfterEdit: false,

  confirmationModal: null,

  startWorkflow: (followUps, source, initialIndex = 0) => {
    console.log('[Frontend] Follow-up Popup Opened', { source, count: followUps.length, initialIndex });
    const activeItem = followUps[initialIndex] || followUps[0] || null;
    set({
      isActive: true,
      popupSource: source,
      queue: followUps,
      queueIndex: initialIndex,
      currentFollowup: activeItem,
    });
  },

  setCurrentFollowup: (followUp, source) => {
    console.log('[Frontend] Follow-up Popup Opened', { source: source || get().popupSource, followUpId: followUp?.id });
    set((state) => ({
      currentFollowup: followUp,
      popupSource: source || state.popupSource || 'OTHER',
    }));
  },

  openLeadFromFollowup: (followUp, source) => {
    const leadId = followUp?.lead?.id || followUp?.leadId || followUp?.id;
    const activeSource = source || get().popupSource || 'OTHER';
    console.log('[Frontend] Open Lead Clicked', { leadId, source: activeSource });
    console.log('[Frontend] Lead Editor Opened', { leadId, isEditingFromFollowup: true });

    set({
      isEditingFromFollowup: true,
      openedLeadId: leadId,
      openedLead: followUp?.lead || { id: leadId, name: followUp?.leadName || 'Lead' },
      currentFollowup: followUp || get().currentFollowup,
      popupSource: activeSource,
      returnAfterEdit: true,
      confirmationModal: null,
    });
  },

  showPostActionConfirmation: (type, followUp) => {
    const leadId = followUp?.lead?.id || followUp?.leadId;
    const leadName = followUp?.lead?.name || followUp?.leadName || 'Lead';
    console.log('[Frontend] Post Action Confirmation Shown', { type, followUpId: followUp?.id, leadId });
    set({
      confirmationModal: {
        isOpen: true,
        type,
        followUp,
        leadId,
        leadName,
      },
    });
  },

  closeConfirmationModal: (openLeadClicked = false) => {
    const state = get();
    const modal = state.confirmationModal;
    set({ confirmationModal: null });

    if (openLeadClicked && modal) {
      state.openLeadFromFollowup(modal.followUp);
    } else {
      state.advanceQueue();
    }
  },

  handleLeadSaveSuccess: () => {
    console.log('[Frontend] Lead Saved');
    set({
      isEditingFromFollowup: false,
      openedLeadId: null,
      openedLead: null,
    });
    get().advanceQueue();
  },

  handleLeadCancel: () => {
    console.log('[Frontend] Lead Cancelled');
    console.log('[Frontend] Returned To Popup', { source: get().popupSource, queueIndex: get().queueIndex });
    set({
      isEditingFromFollowup: false,
      openedLeadId: null,
      openedLead: null,
    });
  },

  advanceQueue: () => {
    const { queue, queueIndex } = get();
    console.log('[Frontend] Queue Advanced', { currentIndex: queueIndex, total: queue.length });

    if (queue.length > 0 && queueIndex + 1 < queue.length) {
      const nextIndex = queueIndex + 1;
      set({
        queueIndex: nextIndex,
        currentFollowup: queue[nextIndex],
      });
    } else {
      set({
        queueIndex: queue.length > 0 ? queue.length : 0,
        currentFollowup: null,
      });
    }
  },

  resetWorkflow: () => {
    set({
      isActive: false,
      popupSource: null,
      queue: [],
      queueIndex: 0,
      currentFollowup: null,
      isEditingFromFollowup: false,
      openedLeadId: null,
      openedLead: null,
      returnAfterEdit: false,
      confirmationModal: null,
    });
  },
}));
