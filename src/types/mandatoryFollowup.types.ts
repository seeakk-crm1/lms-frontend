import type { FollowUpType } from './followup.types';

export interface MandatoryFollowUpContinuationItem {
  leadId: string;
  leadName: string;
  customerName: string;
  stageName: string;
  lifecycleName: string;
  lifecycleRemainingDays: number | null;
  maxFollowUpDate: string | null;
  previousFollowUpDate: string | null;
  previousFollowUpType: FollowUpType | null;
  previousFollowUpNotes: string | null;
  overdueDays: number;
}

export interface MandatoryFollowUpSessionState {
  mandatoryFollowupRequired: boolean;
  mandatoryFollowupCount: number;
  items: MandatoryFollowUpContinuationItem[];
}

export interface MandatoryFollowUpContinuationResponse {
  success: boolean;
  message: string;
  data: MandatoryFollowUpSessionState;
}

export interface SaveMandatoryFollowUpContinuationInput {
  leadId: string;
  scheduledAt: string;
  type: FollowUpType;
  description?: string;
}

export interface SaveMandatoryFollowUpContinuationResponse {
  success: boolean;
  message: string;
  data: {
    followUpId: string;
    leadId: string;
    scheduledAt: string;
    session: MandatoryFollowUpSessionState;
  };
}

export interface AuthSessionState {
  mandatoryFollowupRequired: boolean;
  mandatoryFollowupCount: number;
}
