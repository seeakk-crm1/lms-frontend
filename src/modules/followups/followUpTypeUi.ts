import type { FollowUpType } from '../../types/followup.types';

export const FOLLOW_UP_TYPE_OPTIONS: Array<{ value: FollowUpType; label: string }> = [
  { value: 'CALL', label: 'Call' },
  { value: 'MEETING', label: 'Meeting' },
  { value: 'VISIT', label: 'Visit' },
];

export const formatFollowUpTypeLabel = (type: FollowUpType | string | null | undefined): string => {
  if (!type) return 'Call';
  const upper = String(type).trim().toUpperCase();
  const match = FOLLOW_UP_TYPE_OPTIONS.find((opt) => opt.value === upper);
  return match?.label ?? 'Call';
};
