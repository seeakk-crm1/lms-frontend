import React, { useMemo, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { addMonths, format, startOfMonth } from 'date-fns';
import { useLeadStagesQuery } from '../../../hooks/useLeadStagesQuery';

export type PerformanceTargetCyclePayload = {
  name: string;
  description?: string;
  targetType: 'WEEKLY' | 'MONTHLY' | 'SEMI_ANNUAL' | 'MANUAL';
  targetMetric: 'LEADS' | 'REVENUE';
  leadStageId?: string | null;
  startDate: string;
  endDate?: string | null;
  numberOfMonths?: number;
  periodCounts?: number[];
  periods?: Array<{
    label: string;
    periodIndex: number;
    targetCount: number;
    startDate: string;
    endDate: string;
    lockingDate: string;
  }>;
  status: 'ACTIVE' | 'INACTIVE';
  lockingEnabled: boolean;
};

interface Props {
  initialData?: Partial<PerformanceTargetCyclePayload> & { id?: string };
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (payload: PerformanceTargetCyclePayload) => Promise<void> | void;
}

const MONTH_LABELS = Array.from({ length: 12 }, (_, i) =>
  format(addMonths(startOfMonth(new Date()), i), 'MMMM yyyy'),
);

const PerformanceTargetCycleForm: React.FC<Props> = ({ initialData, isSubmitting, onCancel, onSubmit }) => {
  const { data: stagesData } = useLeadStagesQuery();
  const nonLobStages = useMemo(() => {
    const rows = stagesData?.data || stagesData?.stages || [];
    return rows.filter((stage: { isLOB?: boolean }) => !stage.isLOB);
  }, [stagesData]);

  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [targetType, setTargetType] = useState<PerformanceTargetCyclePayload['targetType']>(
    initialData?.targetType || 'MONTHLY',
  );
  const [targetMetric, setTargetMetric] = useState<PerformanceTargetCyclePayload['targetMetric']>(
    initialData?.targetMetric || 'LEADS',
  );
  const [leadStageId, setLeadStageId] = useState(initialData?.leadStageId || '');
  const [startDate, setStartDate] = useState(
    initialData?.startDate || format(new Date(), 'yyyy-MM-dd'),
  );
  const [numberOfMonths, setNumberOfMonths] = useState(initialData?.numberOfMonths || 6);
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>(initialData?.status || 'ACTIVE');
  const [lockingEnabled, setLockingEnabled] = useState(initialData?.lockingEnabled !== false);

  const periodSlots = useMemo(() => {
    if (targetType === 'SEMI_ANNUAL') return 6;
    if (targetType === 'WEEKLY') return numberOfMonths * 4;
    if (targetType === 'MONTHLY') return numberOfMonths;
    return 0;
  }, [numberOfMonths, targetType]);

  const [periodCounts, setPeriodCounts] = useState<number[]>(
    initialData?.periodCounts || Array.from({ length: periodSlots }, () => 0),
  );

  const [manualPeriods, setManualPeriods] = useState(
    initialData?.periods?.length
      ? initialData.periods
      : [
          {
            label: 'Period 1',
            periodIndex: 0,
            targetCount: 0,
            startDate: startDate,
            endDate: startDate,
            lockingDate: startDate,
          },
        ],
  );

  const handlePeriodCountChange = (index: number, value: number) => {
    setPeriodCounts((prev) => {
      const next = [...prev];
      while (next.length < periodSlots) next.push(0);
      next[index] = value;
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: PerformanceTargetCyclePayload = {
      name: name.trim(),
      description: description.trim() || undefined,
      targetType,
      targetMetric,
      leadStageId: targetMetric === 'LEADS' ? leadStageId || null : null,
      startDate,
      numberOfMonths: targetType === 'MANUAL' ? undefined : numberOfMonths,
      periodCounts: targetType === 'MANUAL' ? undefined : periodCounts.slice(0, periodSlots),
      periods: targetType === 'MANUAL' ? manualPeriods : undefined,
      status,
      lockingEnabled,
    };
    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-600">Target Cycle Name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-emerald-500"
            placeholder="e.g. Q2 Sales Targets"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-600">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'INACTIVE')}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-emerald-500"
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-bold text-gray-600">Description</label>
        <textarea
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-emerald-500"
          placeholder="Optional notes for admins"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-600">Target Type</label>
          <select
            value={targetType}
            onChange={(e) => setTargetType(e.target.value as PerformanceTargetCyclePayload['targetType'])}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-emerald-500"
          >
            <option value="WEEKLY">Weekly</option>
            <option value="MONTHLY">Monthly</option>
            <option value="SEMI_ANNUAL">Semi Annual</option>
            <option value="MANUAL">Manual</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-600">Start Date</label>
          <input
            type="date"
            required
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-emerald-500"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4 space-y-3">
        <p className="text-xs font-black uppercase tracking-wider text-gray-500">Target Metric</p>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
            <input
              type="radio"
              checked={targetMetric === 'LEADS'}
              onChange={() => setTargetMetric('LEADS')}
              className="text-emerald-500"
            />
            Leads
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
            <input
              type="radio"
              checked={targetMetric === 'REVENUE'}
              onChange={() => setTargetMetric('REVENUE')}
              className="text-emerald-500"
            />
            Revenue
          </label>
        </div>
        {targetMetric === 'LEADS' ? (
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-600">Lead Stage</label>
            <select
              required
              value={leadStageId}
              onChange={(e) => setLeadStageId(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-emerald-500"
            >
              <option value="">Select stage</option>
              {nonLobStages.map((stage: { id: string; name: string }) => (
                <option key={stage.id} value={stage.id}>
                  {stage.name}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-gray-500">LOB-enabled stages are excluded.</p>
          </div>
        ) : null}
      </div>

      {targetType !== 'MANUAL' ? (
        <div className="space-y-3">
          {targetType === 'MONTHLY' || targetType === 'WEEKLY' ? (
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600">Number of Months</label>
              <input
                type="number"
                min={1}
                max={24}
                value={numberOfMonths}
                onChange={(e) => setNumberOfMonths(parseInt(e.target.value, 10) || 1)}
                className="w-full max-w-[160px] rounded-xl border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
          ) : null}

          <p className="text-xs font-black uppercase tracking-wider text-gray-500">
            {targetType === 'WEEKLY' ? 'Weekly targets per month' : targetType === 'SEMI_ANNUAL' ? 'Semi-annual months' : 'Monthly targets'}
          </p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 max-h-64 overflow-y-auto custom-scrollbar pr-1">
            {Array.from({ length: periodSlots }).map((_, index) => (
              <div key={index} className="flex items-center gap-2 rounded-xl border border-gray-100 bg-white px-3 py-2">
                <span className="text-[10px] font-bold text-gray-500 shrink-0 w-24 truncate">
                  {targetType === 'WEEKLY'
                    ? `${MONTH_LABELS[Math.floor(index / 4) % 12]?.slice(0, 3) || 'M'} W${(index % 4) + 1}`
                    : targetType === 'SEMI_ANNUAL'
                      ? `Month ${index + 1}`
                      : MONTH_LABELS[index % 12] || `Month ${index + 1}`}
                </span>
                <input
                  type="number"
                  min={0}
                  value={periodCounts[index] ?? 0}
                  onChange={(e) => handlePeriodCountChange(index, parseInt(e.target.value, 10) || 0)}
                  className="w-full rounded-lg border border-gray-200 px-2 py-1 text-xs font-bold text-right"
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs font-black uppercase tracking-wider text-gray-500">Manual periods</p>
          {manualPeriods.map((period, index) => (
            <div key={index} className="grid gap-2 rounded-xl border border-gray-100 p-3 md:grid-cols-4">
              <input
                placeholder="Label"
                value={period.label}
                onChange={(e) => {
                  const next = [...manualPeriods];
                  next[index] = { ...next[index], label: e.target.value };
                  setManualPeriods(next);
                }}
                className="rounded-lg border border-gray-200 px-2 py-1 text-xs"
              />
              <input
                type="number"
                min={0}
                value={period.targetCount}
                onChange={(e) => {
                  const next = [...manualPeriods];
                  next[index] = { ...next[index], targetCount: parseInt(e.target.value, 10) || 0 };
                  setManualPeriods(next);
                }}
                className="rounded-lg border border-gray-200 px-2 py-1 text-xs"
              />
              <input
                type="date"
                value={period.startDate?.slice(0, 10)}
                onChange={(e) => {
                  const next = [...manualPeriods];
                  next[index] = { ...next[index], startDate: e.target.value };
                  setManualPeriods(next);
                }}
                className="rounded-lg border border-gray-200 px-2 py-1 text-xs"
              />
              <input
                type="date"
                value={period.lockingDate?.slice(0, 10)}
                onChange={(e) => {
                  const next = [...manualPeriods];
                  next[index] = {
                    ...next[index],
                    endDate: e.target.value,
                    lockingDate: e.target.value,
                  };
                  setManualPeriods(next);
                }}
                className="rounded-lg border border-gray-200 px-2 py-1 text-xs"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setManualPeriods([
                ...manualPeriods,
                {
                  label: `Period ${manualPeriods.length + 1}`,
                  periodIndex: manualPeriods.length,
                  targetCount: 0,
                  startDate,
                  endDate: startDate,
                  lockingDate: startDate,
                },
              ])
            }
            className="text-xs font-bold text-emerald-600"
          >
            + Add period
          </button>
        </div>
      )}

      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        <input
          type="checkbox"
          checked={lockingEnabled}
          onChange={(e) => setLockingEnabled(e.target.checked)}
          className="rounded text-emerald-500"
        />
        Enable automatic locking when targets are incomplete
      </label>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-600"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save cycle
        </button>
      </div>
    </form>
  );
};

export default PerformanceTargetCycleForm;
