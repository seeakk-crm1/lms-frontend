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
  search: string,
  assigneeUserId: string,
): boolean => {
  if (assigneeUserId && row.userId !== assigneeUserId) {
    return false;
  }

  const query = search.trim().toLowerCase();
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
