import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, Plus, Save, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { useLeadStagesQuery } from '../../../hooks/useLeadStagesQuery';
import { countPeriodSlots, periodSlotLabel, previewTotalTargetDays } from './targetCycleDuration';

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

type ManualPeriodRow = NonNullable<PerformanceTargetCyclePayload['periods']>[number];

const createEmptyManualPeriod = (index: number, startDate: string): ManualPeriodRow => ({
  label: `Period ${index + 1}`,
  periodIndex: index,
  targetCount: 0,
  startDate,
  endDate: startDate,
  lockingDate: startDate,
});

const reindexManualPeriods = (periods: ManualPeriodRow[]): ManualPeriodRow[] =>
  periods.map((period, index) => ({
    ...period,
    periodIndex: index,
    label: period.label?.trim() || `Period ${index + 1}`,
  }));

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

  const periodSlots = useMemo(
    () => countPeriodSlots({ targetType, startDate, numberOfMonths }),
    [numberOfMonths, startDate, targetType],
  );

  const [periodCounts, setPeriodCounts] = useState<number[]>(
    initialData?.periodCounts?.length
      ? initialData.periodCounts
      : Array.from({ length: periodSlots }, () => 0),
  );

  const [manualPeriods, setManualPeriods] = useState<ManualPeriodRow[]>(() =>
    initialData?.periods?.length
      ? reindexManualPeriods(
          initialData.periods.map((period) => ({
            ...period,
            startDate: String(period.startDate).slice(0, 10),
            endDate: String(period.endDate).slice(0, 10),
            lockingDate: String(period.lockingDate).slice(0, 10),
          })),
        )
      : [createEmptyManualPeriod(0, initialData?.startDate || format(new Date(), 'yyyy-MM-dd'))],
  );

  useEffect(() => {
    if (targetType === 'MANUAL') return;
    setPeriodCounts((prev) => {
      const next = Array.from({ length: periodSlots }, (_, index) => prev[index] ?? 0);
      return next;
    });
  }, [periodSlots, targetType]);

  const totalTargetDays = useMemo(
    () =>
      previewTotalTargetDays({
        targetType,
        startDate,
        numberOfMonths,
        manualPeriods:
          targetType === 'MANUAL'
            ? manualPeriods.map((period) => ({
                startDate: String(period.startDate),
                endDate: String(period.endDate),
              }))
            : undefined,
      }),
    [manualPeriods, numberOfMonths, startDate, targetType],
  );

  const updateManualPeriod = (index: number, patch: Partial<ManualPeriodRow>) => {
    setManualPeriods((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  };

  const addManualPeriod = () => {
    setManualPeriods((prev) =>
      reindexManualPeriods([...prev, createEmptyManualPeriod(prev.length, startDate)]),
    );
  };

  const removeManualPeriod = (index: number) => {
    setManualPeriods((prev) => {
      if (prev.length <= 1) {
        toast.error('At least one period is required for manual target cycles.');
        return prev;
      }
      return reindexManualPeriods(prev.filter((_, rowIndex) => rowIndex !== index));
    });
  };

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

    if (targetType === 'MANUAL') {
      if (manualPeriods.length === 0) {
        toast.error('Add at least one manual period.');
        return;
      }
      const invalidPeriod = manualPeriods.find(
        (period) =>
          !period.label?.trim() ||
          !period.startDate ||
          !period.lockingDate ||
          new Date(period.lockingDate) < new Date(period.startDate),
      );
      if (invalidPeriod) {
        toast.error('Each period needs a label, start date, and locking date on or after the start date.');
        return;
      }
    }

    const payload: PerformanceTargetCyclePayload = {
      name: name.trim(),
      description: description.trim() || undefined,
      targetType,
      targetMetric,
      leadStageId: targetMetric === 'LEADS' ? leadStageId || null : null,
      startDate,
      numberOfMonths: targetType === 'MANUAL' ? undefined : numberOfMonths,
      periodCounts: targetType === 'MANUAL' ? undefined : periodCounts.slice(0, periodSlots),
      periods: targetType === 'MANUAL' ? reindexManualPeriods(manualPeriods) : undefined,
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

      <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-black uppercase tracking-wider text-emerald-700">Total target days</p>
        <p className="text-lg font-black text-emerald-800">{totalTargetDays}</p>
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
                <span className="text-[10px] font-bold text-gray-500 shrink-0 w-28 truncate" title={periodSlotLabel(targetType, startDate, index)}>
                  {periodSlotLabel(targetType, startDate, index)}
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
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-black uppercase tracking-wider text-gray-500">Manual periods</p>
            <span className="text-[10px] font-semibold text-gray-400">
              {manualPeriods.length} period{manualPeriods.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="hidden md:grid md:grid-cols-[1.4fr_0.8fr_1fr_1fr_2.5rem] gap-2 px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
            <span>Label</span>
            <span>Target</span>
            <span>Start</span>
            <span>Lock date</span>
            <span />
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar pr-1">
            {manualPeriods.map((period, index) => (
              <div
                key={`manual-period-${index}-${period.periodIndex}`}
                className="grid gap-2 rounded-xl border border-gray-100 bg-white p-3 md:grid-cols-[1.4fr_0.8fr_1fr_1fr_2.5rem] md:items-center"
              >
                <input
                  placeholder="Period label"
                  required
                  value={period.label}
                  onChange={(e) => updateManualPeriod(index, { label: e.target.value })}
                  className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs focus:outline-emerald-500"
                />
                <input
                  type="number"
                  min={0}
                  required
                  value={period.targetCount}
                  onChange={(e) =>
                    updateManualPeriod(index, { targetCount: parseInt(e.target.value, 10) || 0 })
                  }
                  className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs focus:outline-emerald-500"
                  title="Target count"
                />
                <input
                  type="date"
                  required
                  value={String(period.startDate).slice(0, 10)}
                  onChange={(e) => {
                    const value = e.target.value;
                    updateManualPeriod(index, {
                      startDate: value,
                      endDate:
                        !period.endDate || new Date(period.endDate) < new Date(value)
                          ? value
                          : period.endDate,
                    });
                  }}
                  className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs focus:outline-emerald-500"
                  title="Period start date"
                />
                <input
                  type="date"
                  required
                  min={String(period.startDate).slice(0, 10)}
                  value={String(period.lockingDate).slice(0, 10)}
                  onChange={(e) => {
                    const value = e.target.value;
                    updateManualPeriod(index, { endDate: value, lockingDate: value });
                  }}
                  className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs focus:outline-emerald-500"
                  title="Locking date (period end)"
                />
                <button
                  type="button"
                  onClick={() => removeManualPeriod(index)}
                  disabled={manualPeriods.length <= 1}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-rose-100 bg-rose-50 text-rose-600 transition-colors hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label={`Delete ${period.label}`}
                  title={
                    manualPeriods.length <= 1
                      ? 'At least one period is required'
                      : 'Remove this period'
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addManualPeriod}
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-100"
          >
            <Plus className="h-3.5 w-3.5" />
            Add period
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
