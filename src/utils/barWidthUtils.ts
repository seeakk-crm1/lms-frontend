/**
 * Helper to calculate in-cell graph bar widths relative to that user's Total Calls denominator.
 *
 * barPercentage = totalCalls > 0 ? Math.min(100, Math.max(0, (value / totalCalls) * 100)) : 0
 */
export const getCallMetricBarWidth = (value: number, totalCalls: number): number => {
  if (!totalCalls || totalCalls <= 0 || !value || value <= 0) return 0;
  return Math.min(100, Math.max(0, Number(((value / totalCalls) * 100).toFixed(1))));
};
