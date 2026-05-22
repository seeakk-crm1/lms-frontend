import type { CSSProperties } from 'react';

export const DEFAULT_STAGE_COLOR = '#10b981';

/** Badge style for lead stage chips — uses live `leadStage.color` from API/meta. */
export const stageBadgeStyle = (color?: string | null): CSSProperties =>
  color
    ? { backgroundColor: `${color}18`, color }
    : { backgroundColor: '#f3f4f6', color: '#6b7280' };

export const normalizeStageHexColor = (value: string): string => {
  const trimmed = value.trim();
  if (/^#([0-9A-Fa-f]{6})$/.test(trimmed)) return trimmed;
  return DEFAULT_STAGE_COLOR;
};
