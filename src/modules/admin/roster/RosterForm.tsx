import React, { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Save } from 'lucide-react';
import type { RosterEntry, RosterFormValues, RosterUser } from './types';

const rosterFormSchema = z
  .object({
    rosterType: z.enum(['HOLIDAY', 'WEEKLY_OFF', 'SHIFT', 'SPECIAL_WORKING_DAY']),
    name: z
      .string()
      .trim()
      .min(3, 'Roster name must be at least 3 characters')
      .refine((value) => /[a-zA-Z0-9]/.test(value), 'Name cannot contain only special characters'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().optional(),
    shiftSession: z.enum(['DAY', 'NIGHT']).optional(),
    shiftStartTime: z.string().optional(),
    shiftEndTime: z.string().optional(),
    assignScope: z.enum(['SINGLE', 'DEPARTMENT']),
    status: z.enum(['ACTIVE', 'INACTIVE']),
  })
  .refine((value) => value.rosterType === 'HOLIDAY' || Boolean(value.endDate), {
    message: 'End date is required for date range roster',
    path: ['endDate'],
  })
  .refine(
    (value) => value.rosterType === 'HOLIDAY' || !value.endDate || new Date(value.endDate) >= new Date(value.startDate),
    {
      message: 'End date cannot be before start date',
      path: ['endDate'],
    },
  )
  .superRefine((value, ctx) => {
    if (value.rosterType !== 'SHIFT') return;
    const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!value.shiftSession) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Shift session is required', path: ['shiftSession'] });
    }
    if (!value.shiftStartTime || !timePattern.test(value.shiftStartTime)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Valid start time is required (HH:mm)', path: ['shiftStartTime'] });
    }
    if (!value.shiftEndTime || !timePattern.test(value.shiftEndTime)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Valid end time is required (HH:mm)', path: ['shiftEndTime'] });
    }
    if (
      value.shiftStartTime &&
      value.shiftEndTime &&
      timePattern.test(value.shiftStartTime) &&
      timePattern.test(value.shiftEndTime) &&
      value.shiftStartTime >= value.shiftEndTime
    ) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'End time must be later than start time', path: ['shiftEndTime'] });
    }
  });

interface Props {
  user: RosterUser;
  defaultEntry?: RosterEntry | null;
  canDepartmentAssign: boolean;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (values: RosterFormValues) => Promise<void> | void;
}

const formatDateInput = (value?: string | null): string => {
  if (!value) return '';
  return new Date(value).toISOString().slice(0, 10);
};

const RosterForm: React.FC<Props> = ({ user, defaultEntry, canDepartmentAssign, isSubmitting, onCancel, onSubmit }) => {
  const isEditMode = Boolean(defaultEntry);

  const defaultValues = useMemo<RosterFormValues>(
    () => ({
      rosterType: defaultEntry?.rosterType || 'HOLIDAY',
      name: defaultEntry?.name || '',
      startDate: formatDateInput(defaultEntry?.startDate),
      endDate: formatDateInput(defaultEntry?.endDate),
      shiftSession: defaultEntry?.shiftSession || undefined,
      shiftStartTime: defaultEntry?.shiftStartTime || '',
      shiftEndTime: defaultEntry?.shiftEndTime || '',
      assignScope: 'SINGLE',
      status: defaultEntry?.status || 'ACTIVE',
    }),
    [defaultEntry],
  );

  const {
    register,
    control,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<RosterFormValues>({
    resolver: zodResolver(rosterFormSchema),
    defaultValues,
  });

  const rosterType = watch('rosterType');

  return (
    <form onSubmit={handleSubmit((values) => onSubmit(values))} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3 rounded-xl border border-gray-100 bg-gray-50">
          <p className="text-[10px] uppercase tracking-widest text-gray-400 font-black">User Name</p>
          <p className="text-sm font-black text-gray-900 mt-1">{user.name}</p>
        </div>
        <div className="p-3 rounded-xl border border-gray-100 bg-gray-50">
          <p className="text-[10px] uppercase tracking-widest text-gray-400 font-black">Department</p>
          <p className="text-sm font-black text-gray-900 mt-1">{user.department || 'Unassigned'}</p>
        </div>
        <div className="p-3 rounded-xl border border-gray-100 bg-gray-50">
          <p className="text-[10px] uppercase tracking-widest text-gray-400 font-black">Supervisor</p>
          <p className="text-sm font-black text-gray-900 mt-1">{user.supervisor || 'N/A'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] uppercase tracking-widest text-gray-400 font-black">Roster Type</label>
          <select
            {...register('rosterType')}
            className="w-full mt-1 px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="HOLIDAY">Holiday</option>
            <option value="WEEKLY_OFF">Weekly Off</option>
            <option value="SHIFT">Shift</option>
            <option value="SPECIAL_WORKING_DAY">Special Working Day</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-widest text-gray-400 font-black">Roster Name</label>
          <input
            {...register('name')}
            className="w-full mt-1 px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            placeholder="e.g. Public Holiday"
          />
          {errors.name && <p className="text-[10px] text-red-500 font-bold mt-1">{errors.name.message}</p>}
        </div>
      </div>

      {rosterType === 'SHIFT' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-[10px] uppercase tracking-widest text-gray-400 font-black">Shift Session</label>
            <select
              {...register('shiftSession')}
              className="w-full mt-1 px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="">Select session</option>
              <option value="DAY">Day Shift</option>
              <option value="NIGHT">Night Shift</option>
            </select>
            {errors.shiftSession ? <p className="text-[10px] text-red-500 font-bold mt-1">{errors.shiftSession.message}</p> : null}
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-gray-400 font-black">Shift Start Time</label>
            <input
              type="time"
              {...register('shiftStartTime')}
              className="w-full mt-1 px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
            {errors.shiftStartTime ? <p className="text-[10px] text-red-500 font-bold mt-1">{errors.shiftStartTime.message}</p> : null}
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-gray-400 font-black">Shift End Time</label>
            <input
              type="time"
              {...register('shiftEndTime')}
              className="w-full mt-1 px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
            {errors.shiftEndTime ? <p className="text-[10px] text-red-500 font-bold mt-1">{errors.shiftEndTime.message}</p> : null}
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] uppercase tracking-widest text-gray-400 font-black">
            {rosterType === 'HOLIDAY' ? 'Date' : 'Start Date'}
          </label>
          <input
            type="date"
            {...register('startDate')}
            className="w-full mt-1 px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
          {errors.startDate && <p className="text-[10px] text-red-500 font-bold mt-1">{errors.startDate.message}</p>}
        </div>

        {rosterType !== 'HOLIDAY' ? (
          <div>
            <label className="text-[10px] uppercase tracking-widest text-gray-400 font-black">End Date</label>
            <input
              type="date"
              {...register('endDate')}
              className="w-full mt-1 px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
            {errors.endDate && <p className="text-[10px] text-red-500 font-bold mt-1">{errors.endDate.message}</p>}
          </div>
        ) : (
          <div className="p-3 rounded-xl border border-emerald-100 bg-emerald-50/40 mt-6 md:mt-0">
            <p className="text-[11px] text-emerald-700 font-bold">Holiday uses a single date.</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] uppercase tracking-widest text-gray-400 font-black">Assign Scope</label>
          <Controller
            name="assignScope"
            control={control}
            render={({ field }) => (
              <div className="mt-1 flex p-1 rounded-xl border border-gray-200 bg-gray-50">
                <button
                  type="button"
                  onClick={() => field.onChange('SINGLE')}
                  disabled={isEditMode}
                  className={`flex-1 py-2 text-xs font-black rounded-lg ${
                    field.value === 'SINGLE' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500'
                  } ${isEditMode ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  Single
                </button>
                <button
                  type="button"
                  onClick={() => field.onChange('DEPARTMENT')}
                  disabled={isEditMode || !canDepartmentAssign}
                  className={`flex-1 py-2 text-xs font-black rounded-lg ${
                    field.value === 'DEPARTMENT' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500'
                  } ${isEditMode || !canDepartmentAssign ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  Department
                </button>
              </div>
            )}
          />
          {!canDepartmentAssign && !isEditMode ? (
            <p className="text-[10px] text-amber-600 font-bold mt-1">Select a department filter to enable department scope.</p>
          ) : null}
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-widest text-gray-400 font-black">Status</label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <div className="mt-1 flex p-1 rounded-xl border border-gray-200 bg-gray-50">
                <button
                  type="button"
                  onClick={() => field.onChange('ACTIVE')}
                  className={`flex-1 py-2 text-xs font-black rounded-lg ${
                    field.value === 'ACTIVE' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500'
                  }`}
                >
                  Active
                </button>
                <button
                  type="button"
                  onClick={() => field.onChange('INACTIVE')}
                  className={`flex-1 py-2 text-xs font-black rounded-lg ${
                    field.value === 'INACTIVE' ? 'bg-white text-amber-600 shadow-sm' : 'text-gray-500'
                  }`}
                >
                  Inactive
                </button>
              </div>
            )}
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="w-full sm:flex-1 py-3 rounded-xl border border-gray-200 text-sm font-black text-gray-500 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:flex-1 py-3 rounded-xl bg-emerald-500 text-white text-sm font-black hover:bg-emerald-600 inline-flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isEditMode ? 'Update Roster Entry' : 'Create Roster Entry'}
        </button>
      </div>
    </form>
  );
};

export default React.memo(RosterForm);
