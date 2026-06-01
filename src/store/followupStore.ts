import { create } from 'zustand';
import type { CalendarContentFilter, FollowUp, FollowUpView } from '../types/followup.types';

interface FollowUpStoreState {
  view: FollowUpView;
  calendarContentFilter: CalendarContentFilter;
  selectedDate: string;
  selectedUser: string;
  modalOpen: boolean;
  selectedFollowUp: FollowUp | null;
  setView: (view: FollowUpView) => void;
  setCalendarContentFilter: (filter: CalendarContentFilter) => void;
  setDate: (date: string) => void;
  setUser: (userId: string) => void;
  openModal: (followUp: FollowUp) => void;
  closeModal: () => void;
}

const useFollowupStore = create<FollowUpStoreState>((set) => ({
  view: 'month',
  calendarContentFilter: 'FOLLOW_UPS',
  selectedDate: new Date().toISOString(),
  selectedUser: '',
  modalOpen: false,
  selectedFollowUp: null,
  setView: (view) => set({ view }),
  setCalendarContentFilter: (calendarContentFilter) => set({ calendarContentFilter }),
  setDate: (selectedDate) => set({ selectedDate }),
  setUser: (selectedUser) => set({ selectedUser }),
  openModal: (selectedFollowUp) => set({ selectedFollowUp, modalOpen: true }),
  closeModal: () => set({ modalOpen: false, selectedFollowUp: null }),
}));

export default useFollowupStore;
