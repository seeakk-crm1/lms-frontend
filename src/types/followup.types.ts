export type FollowUpView = 'month' | 'week' | 'day' | 'list';
export type CalendarContentFilter = 'FOLLOW_UPS' | 'LEADS' | 'ALL';

export const calendarShowsFollowUps = (filter: CalendarContentFilter): boolean =>
  filter === 'FOLLOW_UPS' || filter === 'ALL';

export const calendarShowsLeads = (filter: CalendarContentFilter): boolean =>
  filter === 'LEADS' || filter === 'ALL';

export const isFollowUpCalendarDetailType = (type: string): boolean =>
  type === 'TOTAL_FOLLOWUPS' || type === 'STAGE_FOLLOWUPS';
export type FollowUpType = 'CALL' | 'VISIT' | 'MEETING';
export type FollowUpStatus = 'PENDING' | 'COMPLETED' | 'MISSED';

export type CalendarOverdueStatus =
  | 'ON_TIME'
  | 'OVERDUE'
  | 'LATE_COMPLETED'
  | 'LATE_EXTENDED'
  | 'OVERDUE_EXTENDED';

export interface FollowUpUser {
  id: string;
  name?: string | null;
  username?: string | null;
  email: string;
  displayName: string;
}

export interface FollowUpImage {
  id: string;
  url: string;
  createdAt: string;
}

export interface FollowUp {
  id: string;
  leadId: string;
  lead: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    profileImage?: string | null;
    stage?: {
      name: string;
      color: string;
    } | null;
    assignedToId?: string | null;
    assignedTo?: FollowUpUser | null;
  };
  assignedUserName?: string;
  officeName?: string | null;
  priority?: string | null;
  userId: string;
  workspaceId: string;
  type: FollowUpType;
  description: string | null;
  completionDescription: string | null;
  status: FollowUpStatus;
  scheduledAt: string;
  completedAt: string | null;
  recentDescription?: string | null;
  previousFollowupDate?: string | null;
  newFollowupDate?: string | null;
  snoozedBy?: string | null;
  snoozedAt?: string | null;
  reminderActionType?: string | null;
  extensionReasonId?: string | null;
  extensionReasonName?: string | null;
  activityLogs?: any[];
  isOverdue?: boolean;
  overdueAt?: string | null;
  completedAfterOverdue?: boolean;
  extendedAfterOverdue?: boolean;
  overdueStatus?: CalendarOverdueStatus;
  createdAt: string;
  updatedAt: string;
  user: FollowUpUser;
  images: FollowUpImage[];
}

export interface CalendarGroup {
  date: string;
  items: FollowUp[];
}

export interface CalendarResponse {
  success: boolean;
  message: string;
  data: {
    timeZone: string;
    view: FollowUpView;
    items?: FollowUp[];
    groups?: CalendarGroup[];
  };
}

export interface AdvancedCalendarSummaryResponse {
  success: boolean;
  message: string;
  data: {
    timeZone: string;
    summary: Array<{
      date: string;
      leadsCreated: number;
      leadsCreatedByStage: Array<{ stageId: string; count: number; name: string; shortForm?: string; color: string }>;
      totalFollowUps: number;
      stageTransitions: Array<{ stageId: string; count: number; name: string; shortForm?: string; color: string }>;
      stageFollowUps: Array<{
        stageId: string;
        count: number;
        name: string;
        shortForm?: string;
        color: string;
        overdueExtendedCount?: number;
        overdueHistoryCount?: number;
      }>;
    }>;
    analytics?: {
      stageFollowUpCounts: Array<{ stageId: string; count: number; name: string; color: string }>;
      stageLeadCreationCounts: Array<{ stageId: string; count: number; name: string; color: string }>;
      overdueFollowUpCounts: number;
      followUpDelayAnalytics?: { overdueExtendedTotal: number };
    };
  };
}

export interface OverdueMandatoryFollowUpItem {
  id: string;
  leadId: string;
  leadName: string;
  customerName: string;
  leadStage: { id: string; name: string; color: string } | null;
  scheduledAt: string;
  status: string;
  type: FollowUpType;
  description: string | null;
  overdueStatus: 'OVERDUE';
  assignedUserName: string;
  followUpNotes: string | null;
}

export interface OverdueMandatoryFollowUpResponse {
  success: boolean;
  message: string;
  data: {
    overdueFollowupRequired: boolean;
    overdueFollowupCount: number;
    items: OverdueMandatoryFollowUpItem[];
  };
}

export interface AdvancedCalendarDetailsResponse {
  success: boolean;
  message: string;
  items: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TodayFollowUpsResponse {
  success: boolean;
  message: string;
  data: {
    timeZone: string;
    items: FollowUp[];
  };
}

export interface FollowUpReminderItem {
  id: string;
  leadId: string;
  leadName: string;
  leadEmail?: string | null;
  leadCompanyName?: string | null;
  leadProfileImage?: string | null;
  leadPhone?: string | null;
  leadStage?: {
    name: string;
    color: string;
  } | null;
  assignedUserName: string;
  officeName?: string | null;
  userId: string;
  type: FollowUpType;
  description: string | null;
  latestFollowupNote?: string | null;
  scheduledAt: string;
  originalScheduledDate?: string | null;
  extendedDate?: string | null;
  minutesUntil: number;
  priority?: string | null;
  status: FollowUpStatus;
  user: FollowUpUser;
}

export interface FollowUpReminderAlertsResponse {
  success: boolean;
  message: string;
  data: {
    timeZone: string;
    generatedAt: string;
    window: {
      start: string;
      end: string;
      minutesAhead: number;
      includePastMinutes: number;
    };
    items: FollowUpReminderItem[];
  };
}

export interface FollowUpHistoryResponse {
  success: boolean;
  message: string;
  data: FollowUp[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateFollowUpInput {
  leadId: string;
  type: FollowUpType;
  scheduledAt: string;
  description?: string;
}

export interface CompleteFollowUpInput {
  description: string;
  images?: string[];
}

export interface SnoozeFollowUpInput {
  scheduledAt: string;
  recentDescription?: string;
  extensionReasonId?: string;
  reminderActionType: 'SNOOZE' | 'REMIND_LATER';
}

export interface LifecycleExtensionLimit {
  applies: boolean;
  leadId?: string;
  stageId?: string | null;
  stageName?: string | null;
  lifecycleName?: string | null;
  configuredTransitionDays?: number;
  daysConsumed?: number;
  remainingDays?: number;
  maxExtensionDate?: string;
  stageEnteredAt?: string | null;
  stageExpiresAt?: string | null;
  canOverride?: boolean;
}

export interface LifecycleExtensionLimitResponse {
  success: boolean;
  message: string;
  data: LifecycleExtensionLimit;
}

export interface CalendarQueryParams {
  view: FollowUpView;
  startDate: string;
  endDate: string;
  userId?: string;
}

export interface FollowUpUserOption {
  id: string;
  label: string;
}

export interface FollowUpLeadOption {
  id: string;
  label: string;
  subtitle?: string;
}
