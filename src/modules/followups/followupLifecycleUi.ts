export const toDateTimeLocalInputValue = (iso: string | null | undefined): string => {
  if (!iso) return '';
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}T${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`;
};

export const maxDateTimeLocalFromLifecycleLimit = (
  maxExtensionDate: string | null | undefined,
  maxFollowUpDate?: string | null,
): string | undefined => {
  if (maxExtensionDate) {
    const parsed = new Date(maxExtensionDate);
    if (!Number.isNaN(parsed.getTime())) {
      return toDateTimeLocalInputValue(parsed.toISOString());
    }
  }
  if (!maxFollowUpDate) return undefined;
  const end = new Date(`${maxFollowUpDate}T23:59:59`);
  if (Number.isNaN(end.getTime())) return undefined;
  return toDateTimeLocalInputValue(end.toISOString());
};

export const lifecycleExtensionHint = (params: {
  applies: boolean;
  remainingDays?: number | null;
  maxFollowUpDate?: string | null;
  canOverride?: boolean;
}): string | null => {
  if (!params.applies) return null;
  if (params.canOverride) {
    return 'Lifecycle limits apply, but your role may override them when saving.';
  }
  if (params.remainingDays === 0) {
    return 'This lead has reached its maximum lifecycle period in the current stage. Please move the lead to the next stage.';
  }
  if (params.remainingDays != null && params.remainingDays > 0) {
    const dayLabel = params.remainingDays === 1 ? 'day' : 'days';
    const latest = params.maxFollowUpDate ? ` (latest: ${params.maxFollowUpDate})` : '';
    return `You can extend follow-up within the next ${params.remainingDays} ${dayLabel} for this stage${latest}.`;
  }
  return null;
};
