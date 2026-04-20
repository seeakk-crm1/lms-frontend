export type FollowUpView = 'month' | 'week' | 'day' | 'list';
export type FollowUpType = 'CALL' | 'VISIT' | 'MEETING';
export type FollowUpStatus = 'PENDING' | 'COMPLETED' | 'MISSED';

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
  };
  userId: string;
  workspaceId: string;
  type: FollowUpType;
  description: string | null;
  completionDescription: string | null;
  status: FollowUpStatus;
  scheduledAt: string;
  completedAt: string | null;
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
  userId: string;
  type: FollowUpType;
  description: string | null;
  scheduledAt: string;
  minutesUntil: number;
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
  images: string[];
}

export interface SnoozeFollowUpInput {
  scheduledAt: string;
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
