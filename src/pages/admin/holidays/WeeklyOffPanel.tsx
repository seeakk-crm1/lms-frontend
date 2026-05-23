import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useUpdateWeeklyOffSettingsMutation, useWeeklyOffSettingsQuery } from '../../../hooks/useHolidays';

const WEEKDAY_OPTIONS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
] as const;

const WEEKLY_OFF_COLOR_PRESETS = ['#cbd5e1', '#94a3b8', '#a5b4fc', '#c4b5fd', '#fbcfe8', '#fde68a', '#bbf7d0', '#bae6fd'];

const normalizeWeeklyOffColor = (value: string) => {
  const trimmed = value.trim();
  const normalized = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
  return /^#[0-9a-fA-F]{6}$/.test(normalized) ? normalized.toLowerCase() : '#cbd5e1';
};

const WeeklyOffPanel: React.FC = () => {
  const settingsQuery = useWeeklyOffSettingsQuery();
  const updateMutation = useUpdateWeeklyOffSettingsMutation();

  const [selectedDays, setSelectedDays] = useState<number[]>([0]);
  const [color, setColor] = useState('#cbd5e1');

  useEffect(() => {
    if (!settingsQuery.data) return;
    setSelectedDays(settingsQuery.data.weeklyOffDays?.length ? settingsQuery.data.weeklyOffDays : [0]);
    setColor(normalizeWeeklyOffColor(settingsQuery.data.weeklyOffColor || '#cbd5e1'));
  }, [settingsQuery.data]);

  const selectedDayLabels = useMemo(
    () =>
      WEEKDAY_OPTIONS.filter((day) => selectedDays.includes(day.value))
        .map((day) => day.label)
        .join(', '),
    [selectedDays],
  );

  const toggleDay = (dayValue: number) => {
    setSelectedDays((current) => {
      if (current.includes(dayValue)) {
        const next = current.filter((value) => value !== dayValue);
        return next.length ? next : current;
      }
      return [...current, dayValue].sort((a, b) => a - b);
    });
  };

  const handleSave = async () => {
    if (!selectedDays.length) {
      toast.error('Select at least one weekly-off day.');
      return;
    }

    try {
      await updateMutation.mutateAsync({
        weeklyOffDays: selectedDays,
        weeklyOffColor: normalizeWeeklyOffColor(color),
      });
      toast.success('Weekly-off settings saved.');
    } catch (error: any) {
      const status = error?.response?.status;
      const message = error?.response?.data?.message || 'Failed to save weekly-off settings.';
      if (status === 404) {
        toast.error('Weekly-off API is unavailable. Redeploy the backend with the latest release.');
        return;
      }
      toast.error(message);
    }
  };

  if (settingsQuery.isLoading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-[2rem] border border-white/70 bg-white p-10 shadow-[0_30px_90px_-40px_rgba(15,23,42,0.18)]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (settingsQuery.isError) {
    const message =
      (settingsQuery.error as any)?.response?.data?.message ||
      (settingsQuery.error as Error)?.message ||
      'Unable to load weekly-off settings.';
    return (
      <div className="rounded-[2rem] border border-rose-100 bg-rose-50 p-6 text-sm font-semibold text-rose-700">
        <p className="font-black">Weekly-off settings could not be loaded.</p>
        <p className="mt-2">{message}</p>
        <p className="mt-2 text-xs text-rose-600">
          If this persists, redeploy the backend and ensure database migrations have run.
        </p>
        <button
          type="button"
          onClick={() => settingsQuery.refetch()}
          className="mt-4 rounded-2xl bg-white px-4 py-2 text-xs font-black text-rose-700 border border-rose-200 hover:bg-rose-100"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] border border-white/70 bg-white p-6 shadow-[0_30px_90px_-40px_rgba(15,23,42,0.18)] md:p-8">
      <div className="max-w-3xl space-y-8">
        <div>
          <h2 className="text-xl font-black text-gray-900">Weekly-Off Days</h2>
          <p className="mt-2 text-sm font-semibold text-gray-500">
            Select non-working days for the entire workspace. These apply to attendance, targets, calendars, and
            follow-up scheduling.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {WEEKDAY_OPTIONS.map((day) => {
            const checked = selectedDays.includes(day.value);
            return (
              <label
                key={day.value}
                className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition-colors ${
                  checked ? 'border-emerald-200 bg-emerald-50' : 'border-gray-200 bg-gray-50/60 hover:bg-white'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleDay(day.value)}
                  className="h-4 w-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
                />
                <span className="text-sm font-black text-gray-800">{day.label}</span>
              </label>
            );
          })}
        </div>

        <div>
          <label className="text-[11px] font-black uppercase tracking-widest text-gray-400">Choose Weekly-Off Colour</label>
          <p className="mt-2 text-sm font-semibold text-gray-500">
            Used to highlight weekly-off days across calendars. Holiday colours remain managed per holiday.
          </p>

          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
            <input
              type="color"
              value={normalizeWeeklyOffColor(color)}
              onChange={(event) => setColor(event.target.value)}
              className="h-12 w-16 cursor-pointer rounded-xl border border-gray-200 bg-white"
              aria-label="Weekly-off color picker"
            />
            <input
              type="text"
              value={color}
              onChange={(event) => setColor(event.target.value)}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-700 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-100 sm:max-w-[180px]"
              aria-label="Weekly-off color hex code"
            />
            <span
              className="inline-flex h-10 w-10 rounded-full border border-gray-200"
              style={{ backgroundColor: normalizeWeeklyOffColor(color) }}
              aria-hidden="true"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {WEEKLY_OFF_COLOR_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setColor(preset)}
                className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-105 ${
                  normalizeWeeklyOffColor(color) === preset ? 'border-gray-900' : 'border-white'
                }`}
                style={{ backgroundColor: preset }}
                aria-label={`Select ${preset} as weekly-off color`}
              />
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-gray-50/80 px-4 py-3 text-sm font-semibold text-gray-600">
          Active weekly-offs: <span className="font-black text-gray-900">{selectedDayLabels || 'None'}</span>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-black text-white shadow-[0_18px_40px_-18px_rgba(16,185,129,0.8)] hover:bg-emerald-600 disabled:opacity-70"
        >
          {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Weekly-Off Settings
        </button>
      </div>
    </div>
  );
};

export default WeeklyOffPanel;
