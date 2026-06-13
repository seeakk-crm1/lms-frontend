export interface FollowupNoteEntry {
  noteNumber: number;
  date: string;
  time: string;
  addedBy: string;
  note: string;
}

export interface FollowupExtensionEntry {
  originalDate: string;
  extendedTo: string;
  reason: string | null;
  description: string;
  extendedBy: string;
  extendedAt: string;
}

export interface FollowupTimelineEntry {
  date: string;
  time: string;
  event: string;
  detail?: string;
  reason?: string;
}

export interface FollowupDetailReportItem {
  id: string;
  leadId: string;
  leadName: string;
  assignedUser: string;
  followupType: string;
  createdDate: string;
  scheduledDate: string;
  status: string;
  notes: FollowupNoteEntry[];
  completion?: {
    note: string;
    completedAt: string;
    completedBy: string;
  };
  extensions: FollowupExtensionEntry[];
  timeline: FollowupTimelineEntry[];
}

export interface FollowupPerformanceItem {
  userId: string;
  userName: string;
  assignedFollowups: number;
  completedFollowups: number;
  extendedFollowups: number;
  missedFollowups: number;
  overdueFollowups: number;
  completionRate: number;
}

export interface FollowupLatestNoteItem {
  leadId: string;
  leadName: string;
  latestNote: string;
  latestNoteAt: string;
  addedBy: string;
}
