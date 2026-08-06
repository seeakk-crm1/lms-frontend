import api from './api';

export interface InitiateCallResponse {
  success: boolean;
  callSessionId: string;
  leadId: string;
  leadName: string;
  phone: string;
  cleanPhone: string;
  telUrl: string;
  initiatedAt: string;
}

export interface CallSession {
  id: string;
  workspaceId: string;
  leadId: string;
  initiatedById: string;
  phoneNumberSnapshot: string;
  sourceContext: string;
  followUpId?: string;
  initiatedAt: string;
  localCallDate: string;
  status: string;
  lead?: {
    id: string;
    name: string;
    phone: string;
    stage?: { id: string; name: string; color: string };
    substage?: { id: string; name: string };
  };
}

export interface SaveCallOutcomePayload {
  callSessionId: string;
  connectionStatus: 'CONNECTED' | 'NOT_CONNECTED';
  substageId?: string | null;
  targetStageId?: string | null;
  outcomeNotes?: string;
  callPriority?: 'HIGH' | 'MEDIUM' | 'LOW';
  followUpRequired?: boolean;
  nextFollowUpDate?: string;
  nextFollowUpTime?: string;
  followUpType?: string;
  followUpDescription?: string;
  stageRuleValues?: Array<{ ruleId: string; value: string }>;
  reasonId?: string;
  lobReasonId?: string;
  lobRemarks?: string;
  lobExitReason?: string;
  lobReturnReasonId?: string;
  lobReturnRemarks?: string;
}

export interface SaveCallOutcomeResponse {
  success: boolean;
  outcomeId: string;
  callSessionId: string;
  connectionStatus: 'CONNECTED' | 'NOT_CONNECTED';
  substageName?: string | null;
  targetStageName?: string | null;
  isStageChanged: boolean;
  isApprovalTriggered: boolean;
  createdFollowUpId?: string | null;
  message: string;
}

export interface CallSummaryMetrics {
  totalCalls: number;
  uniqueCalls: number;
  connectedCalls: number;
  notConnectedCalls: number;
  connectionRate: number;
  positiveOutcomes: number;
  negativeOutcomes: number;
  followUpsCreated: number;
  leadsMoved: number;
}

export interface UserCallSummaryRow {
  userId: string;
  userName: string;
  userEmail: string;
  officeName: string;
  departmentName: string;
  totalAttempts: number;
  uniqueCalls: number;
  connectedCalls: number;
  notConnectedCalls: number;
  connectionRate: number;
  positiveOutcomes: number;
  negativeOutcomes: number;
  followUpsCreated: number;
  leadsMoved: number;
}

export interface CallSummaryReportData {
  metrics: CallSummaryMetrics;
  userSummaryList: UserCallSummaryRow[];
  maxValues: {
    totalAttempts: number;
    uniqueCalls: number;
    connectedCalls: number;
    notConnectedCalls: number;
    followUpsCreated: number;
    leadsMoved: number;
  };
}

export const initiateCall = async (
  leadId: string,
  sourceContext: 'ALL_LEADS' | 'LEAD_DETAILS' | 'FOLLOW_UP_POPUP' = 'ALL_LEADS',
  followUpId?: string,
): Promise<InitiateCallResponse> => {
  const res = await api.post<InitiateCallResponse>(`/leads/${leadId}/calls/initiate`, {
    sourceContext,
    followUpId,
  });
  return res.data;
};

export const getActiveCallSession = async (leadId: string): Promise<CallSession | null> => {
  const res = await api.get<{ success: boolean; session: CallSession | null }>(`/leads/${leadId}/calls/active`);
  return res.data.session;
};

export const saveCallOutcome = async (
  leadId: string,
  payload: SaveCallOutcomePayload,
): Promise<SaveCallOutcomeResponse> => {
  const res = await api.post<SaveCallOutcomeResponse>(`/leads/${leadId}/calls/outcome`, payload);
  return res.data;
};

export const fetchCallSummaryReport = async (params: Record<string, any>): Promise<CallSummaryReportData> => {
  const res = await api.get<{ success: boolean; data: CallSummaryReportData }>('/reports/calls/summary', { params });
  return res.data.data;
};

export const fetchCallDetailedReport = async (params: Record<string, any>) => {
  const res = await api.get<{ success: boolean; data: any }>('/reports/calls/detailed', { params });
  return res.data.data;
};

export const exportCallReport = async (payload: { format: 'xlsx' | 'csv'; filters?: Record<string, any> }) => {
  const response = await api.post('/reports/calls/export', payload, {
    responseType: 'blob',
  });
  return response.data;
};
