import type { FollowUp } from '../types/followup.types';

export type BulkExtendFollowUpRow = {
  id: string;
  leadId: string;
  userId: string;
  scheduledAt: string;
  description: string | null;
  extensionReasonName: string | null;
  leadName: string;
  leadPhone: string | null;
  leadEmail: string | null;
  userName: string;
};

export const resolveLeadDisplayName = (lead?: {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
} | null): string => {
  const name = lead?.name?.trim();
  if (name) return name;
  const email = lead?.email?.trim();
  if (email) return email;
  const phone = lead?.phone?.trim();
  if (phone) return phone;
  return 'Unnamed Lead';
};

export type BulkFollowUpFilterCriteria = {
  search: string;
  assigneeUserId: string;
  scheduledFrom: string;
  scheduledTo: string;
};

/** Local calendar day key (YYYY-MM-DD) for scheduled-at comparison. */
export const toScheduledLocalDayKey = (isoDate: string): string => {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const normalizeScheduledDateRange = (
  scheduledFrom: string,
  scheduledTo: string,
): { from: string; to: string } => {
  const from = scheduledFrom.trim();
  const to = scheduledTo.trim();
  if (from && to && from > to) {
    return { from: to, to: from };
  }
  return { from, to };
};

export const mapFollowUpToBulkExtendRow = (item: FollowUp): BulkExtendFollowUpRow => ({
  id: item.id,
  leadId: item.leadId,
  userId: item.userId,
  scheduledAt: item.scheduledAt,
  description: item.description,
  extensionReasonName: item.extensionReasonName ?? null,
  leadName: resolveLeadDisplayName(item.lead),
  leadPhone: item.lead?.phone?.trim() || null,
  leadEmail: item.lead?.email?.trim() || null,
  userName: item.user?.displayName || item.user?.name || item.user?.email || 'Unassigned',
});

export const matchesBulkFollowUpFilter = (
  row: BulkExtendFollowUpRow,
  criteria: BulkFollowUpFilterCriteria,
): boolean => {
  if (criteria.assigneeUserId && row.userId !== criteria.assigneeUserId) {
    return false;
  }

  const { from, to } = normalizeScheduledDateRange(criteria.scheduledFrom, criteria.scheduledTo);
  if (from || to) {
    const scheduledDay = toScheduledLocalDayKey(row.scheduledAt);
    if (!scheduledDay) {
      return false;
    }
    if (from && scheduledDay < from) {
      return false;
    }
    if (to && scheduledDay > to) {
      return false;
    }
  }

  const query = criteria.search.trim().toLowerCase();
  if (!query) {
    return true;
  }

  const haystack = [
    row.leadName,
    row.leadPhone,
    row.leadEmail,
    row.userName,
    row.description,
    row.extensionReasonName,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return haystack.includes(query);
};

export const hasActiveBulkFollowUpFilters = (criteria: BulkFollowUpFilterCriteria): boolean =>
  Boolean(
    criteria.search.trim() ||
      criteria.assigneeUserId ||
      criteria.scheduledFrom.trim() ||
      criteria.scheduledTo.trim(),
  );
