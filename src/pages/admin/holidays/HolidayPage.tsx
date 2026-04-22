import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CalendarDays,
  CalendarSync,
  CheckCircle2,
  Filter,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { eachDayOfInterval, endOfMonth, endOfWeek, format, isSameMonth, isToday, parseISO, startOfMonth, startOfWeek } from 'date-fns';
import { toast } from 'react-hot-toast';
import DashboardLayout from '../../../components/dashboard/DashboardLayout';
import SearchableSelect from '../../../components/SearchableSelect';
import {
  useCreateHolidayMutation,
  useDeleteHolidayMutation,
  useHolidayCalendarQuery,
  useHolidaysQuery,
  useSyncHolidayMutation,
  useUpdateHolidayMutation,
} from '../../../hooks/useHolidays';
import { useAllLocationsQuery } from '../../../hooks/useUsersQuery';
import useAuthStore from '../../../store/useAuthStore';
import type { HolidayPayload, HolidayRecord, HolidayStatus } from '../../../services/holidays.api';

type LocationOption = {
  id: string;
  name: string;
  type: 'COUNTRY' | 'STATE' | 'DISTRICT' | string;
  parentId?: string | null;
};

const roleKey = (role: unknown) =>
  String(typeof role === 'object' && role !== null ? (role as { name?: string }).name || '' : role || '')
    .toLowerCase()
    .trim()
    .replace(/[\s_-]+/g, '');

const statusOptions: Array<{ value: '' | HolidayStatus; label: string }> = [
  { value: '', label: 'All Statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
];

const HOLIDAY_COLOR_PRESETS = ['#fda4af', '#fb7185', '#f97316', '#f59e0b', '#34d399', '#10b981', '#38bdf8', '#6366f1', '#a78bfa', '#f472b6'];

const hexToRgba = (hex: string, alpha: number) => {
  const normalized = hex.replace('#', '');
  if (normalized.length !== 6) {
    return `rgba(253, 164, 175, ${alpha})`;
  }

  const bigint = Number.parseInt(normalized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const HolidayFormModal: React.FC<{
  open: boolean;
  initialValue: HolidayRecord | null;
  locations: LocationOption[];
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: HolidayPayload) => Promise<void>;
}> = ({ open, initialValue, locations, isSubmitting, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [holidayDate, setHolidayDate] = useState('');
  const [countryId, setCountryId] = useState('');
  const [stateId, setStateId] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [color, setColor] = useState('#fda4af');
  const [status, setStatus] = useState<HolidayStatus>('ACTIVE');
  const [isRecurring, setIsRecurring] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(initialValue?.name || '');
    setHolidayDate(initialValue?.holidayDate ? format(parseISO(initialValue.holidayDate), 'yyyy-MM-dd') : '');
    setCountryId(initialValue?.countryId || '');
    setStateId(initialValue?.stateId || '');
    setDistrictId(initialValue?.districtId || '');
    setColor(initialValue?.color || '#fda4af');
    setStatus(initialValue?.status || 'ACTIVE');
    setIsRecurring(initialValue?.isRecurring || false);
  }, [initialValue, open]);

  useEffect(() => {
    if (!countryId) {
      setStateId('');
      setDistrictId('');
    }
  }, [countryId]);

  useEffect(() => {
    if (!stateId) {
      setDistrictId('');
    }
  }, [stateId]);

  const countries = useMemo(() => locations.filter((item) => item.type === 'COUNTRY'), [locations]);
  const states = useMemo(
    () => locations.filter((item) => item.type === 'STATE' && (!countryId || item.parentId === countryId)),
    [locations, countryId],
  );
  const districts = useMemo(
    () => locations.filter((item) => item.type === 'DISTRICT' && (!stateId || item.parentId === stateId)),
    [locations, stateId],
  );

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Holiday name is required.');
      return;
    }
    if (!holidayDate) {
      toast.error('Holiday date is required.');
      return;
    }

    await onSubmit({
      name: name.trim(),
      holidayDate,
      color,
      countryId: countryId || undefined,
      stateId: stateId || undefined,
      districtId: districtId || undefined,
      isRecurring,
      status,
    });
  };

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[160] flex items-end justify-center p-0 sm:items-center sm:p-4">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            className="relative w-full max-w-2xl rounded-t-3xl border border-gray-100 bg-white shadow-2xl sm:rounded-3xl"
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div>
                <h2 className="text-xl font-black text-gray-900">{initialValue ? 'Edit Holiday' : 'Add Holiday'}</h2>
                <p className="mt-1 text-sm font-semibold text-gray-500">
                  Configure holiday coverage for global or regional SLA calendars.
                </p>
              </div>
              <button type="button" onClick={onClose} className="rounded-xl border border-gray-200 p-2 text-gray-400" aria-label="Close holiday modal">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-4 p-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-gray-400">Holiday Name</label>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Enter holiday name"
                  className="mt-1.5 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-gray-400">Holiday Date</label>
                <input
                  type="date"
                  value={holidayDate}
                  onChange={(event) => setHolidayDate(event.target.value)}
                  className="mt-1.5 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-gray-400">Status</label>
                <SearchableSelect
                  options={[
                    { value: 'ACTIVE', label: 'Active' },
                    { value: 'INACTIVE', label: 'Inactive' },
                  ]}
                  value={status}
                  onChange={(event) => setStatus(event.target.value as HolidayStatus)}
                  placeholder="Select status"
                  name="status"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-gray-400">Holiday Color</label>
                <div className="mt-1.5 space-y-3 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      type="color"
                      value={color}
                      onChange={(event) => setColor(event.target.value)}
                      className="h-10 w-10 rounded-xl border border-gray-200 bg-transparent"
                      aria-label="Holiday color picker"
                    />
                    <input
                      value={color}
                      onChange={(event) => setColor(event.target.value)}
                      className="min-w-[140px] flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                      aria-label="Holiday color hex code"
                    />
                    <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2">
                      <span className="h-4 w-4 rounded-full border border-white shadow-sm" style={{ backgroundColor: color }} />
                      <span className="text-xs font-black uppercase tracking-[0.18em] text-gray-500">Preview</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {HOLIDAY_COLOR_PRESETS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setColor(preset)}
                        className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-105 ${color.toLowerCase() === preset.toLowerCase() ? 'border-gray-900' : 'border-white'}`}
                        style={{ backgroundColor: preset }}
                        aria-label={`Select ${preset} as holiday color`}
                        title={preset}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-gray-400">Country</label>
                <SearchableSelect
                  options={countries.map((item) => ({ value: item.id, label: item.name }))}
                  value={countryId}
                  onChange={(event) => setCountryId(event.target.value)}
                  placeholder="Select country"
                  name="countryId"
                />
              </div>

              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-gray-400">State</label>
                <SearchableSelect
                  options={states.map((item) => ({ value: item.id, label: item.name }))}
                  value={stateId}
                  onChange={(event) => setStateId(event.target.value)}
                  placeholder={countryId ? 'Select state' : 'Select country first'}
                  name="stateId"
                />
              </div>

              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-gray-400">District</label>
                <SearchableSelect
                  options={districts.map((item) => ({ value: item.id, label: item.name }))}
                  value={districtId}
                  onChange={(event) => setDistrictId(event.target.value)}
                  placeholder={stateId ? 'Select district' : 'Select state first'}
                  name="districtId"
                />
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
                <button
                  type="button"
                  onClick={() => setIsRecurring((value) => !value)}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${isRecurring ? 'bg-emerald-500' : 'bg-gray-300'}`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${isRecurring ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
                <div>
                  <p className="text-sm font-black text-gray-900">Recurring Holiday</p>
                  <p className="text-xs font-semibold text-gray-500">Use yearly recurrence for recurring public holidays.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row">
              <button type="button" onClick={onClose} className="w-full rounded-2xl border border-gray-200 py-3 text-sm font-black text-gray-500 hover:bg-gray-50 sm:flex-1">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3 text-sm font-black text-white hover:bg-emerald-600 disabled:opacity-70 sm:flex-1"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {initialValue ? 'Save Changes' : 'Add Holiday'}
              </button>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
};

const HolidayPage: React.FC = () => {
  const [view, setView] = useState<'CALENDAR' | 'LIST'>('CALENDAR');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'' | HolidayStatus>('');
  const [currentMonth, setCurrentMonth] = useState(() => format(new Date(), 'yyyy-MM'));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState<HolidayRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<HolidayRecord | null>(null);

  const { user } = useAuthStore();
  const holidaysQuery = useHolidaysQuery();
  const calendarQuery = useHolidayCalendarQuery(currentMonth);
  const createMutation = useCreateHolidayMutation();
  const updateMutation = useUpdateHolidayMutation();
  const deleteMutation = useDeleteHolidayMutation();
  const syncMutation = useSyncHolidayMutation();
  const { data: allLocationsData } = useAllLocationsQuery();

  const canManage = ['admin', 'superadmin'].includes(roleKey(user?.role));
  const locations: LocationOption[] = useMemo(() => allLocationsData?.locations || [], [allLocationsData]);
  const holidays = holidaysQuery.data || [];

  const filteredRows = useMemo(() => {
    return holidays.filter((item) => {
      const matchesSearch = !search || item.name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = !status || item.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [holidays, search, status]);

  const holidayCounts = useMemo(
    () => ({
      total: holidays.length,
      active: holidays.filter((item) => item.status === 'ACTIVE').length,
      recurring: holidays.filter((item) => item.isRecurring).length,
    }),
    [holidays],
  );

  const calendarDays = useMemo(() => {
    const date = parseISO(`${currentMonth}-01`);
    return eachDayOfInterval({
      start: startOfWeek(startOfMonth(date), { weekStartsOn: 0 }),
      end: endOfWeek(endOfMonth(date), { weekStartsOn: 0 }),
    });
  }, [currentMonth]);

  const calendarItemsByDate = useMemo(() => {
    const map = new Map<string, Array<{ title: string; source: string }>>();
    (calendarQuery.data || []).forEach((item) => {
      const existing = map.get(item.date) || [];
      existing.push({ title: item.title, source: item.source });
      map.set(item.date, existing);
    });
    return map;
  }, [calendarQuery.data]);

  const handleSave = async (payload: HolidayPayload) => {
    try {
      if (selectedHoliday?.id) {
        await updateMutation.mutateAsync({ id: selectedHoliday.id, payload });
        toast.success('Holiday updated successfully.');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('Holiday created successfully.');
      }
      setIsModalOpen(false);
      setSelectedHoliday(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save holiday.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success('Holiday deleted successfully.');
      setDeleteTarget(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to delete holiday.');
    }
  };

  const monthLabel = useMemo(() => format(parseISO(`${currentMonth}-01`), 'MMMM yyyy'), [currentMonth]);

  return (
    <DashboardLayout>
        <div className="custom-scrollbar relative flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8">
          <div className="pointer-events-none absolute right-0 top-0 -z-10 h-[420px] w-[720px] bg-gradient-to-bl from-emerald-50/80 via-transparent to-transparent" />

          <div className="mx-auto max-w-[1480px] space-y-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.26em] text-emerald-600">
                  <CalendarDays className="h-3.5 w-3.5" />
                  <span>SaaS Configuration</span>
                </div>
                <h1 className="text-3xl font-black tracking-tight text-gray-900 md:text-4xl">Holiday Management</h1>
                <p className="mt-2 max-w-3xl text-sm font-semibold text-gray-500">
                  Manage workspace holidays used in calendar planning and SLA working-day calculations.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await syncMutation.mutateAsync();
                      toast.success('Google holiday sync completed.');
                    } catch (error: any) {
                      toast.error(error?.response?.data?.message || 'Google sync failed.');
                    }
                  }}
                  disabled={syncMutation.isPending}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-black text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-70 sm:w-auto"
                >
                  {syncMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarSync className="h-4 w-4" />}
                  Google Sync
                </button>

                {canManage ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedHoliday(null);
                      setIsModalOpen(true);
                    }}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-black text-white shadow-[0_18px_40px_-18px_rgba(16,185,129,0.8)] hover:bg-emerald-600 sm:w-auto"
                  >
                    <Plus className="h-4 w-4" />
                    Add Holiday
                  </button>
                ) : null}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {[
                { label: 'Configured Holidays', value: holidayCounts.total, icon: CalendarDays },
                { label: 'Active Holidays', value: holidayCounts.active, icon: CheckCircle2 },
                { label: 'Recurring Rules', value: holidayCounts.recurring, icon: RefreshCw },
              ].map((card) => (
                <div key={card.label} className="rounded-[2rem] border border-white/70 bg-white p-6 shadow-[0_30px_90px_-40px_rgba(15,23,42,0.18)]">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <card.icon className="h-6 w-6" />
                  </div>
                  <p className="text-[11px] font-black uppercase tracking-[0.26em] text-gray-400">{card.label}</p>
                  <p className="mt-3 text-4xl font-black text-gray-900">{card.value}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="grid gap-3 sm:grid-cols-2 xl:flex xl:flex-wrap xl:items-center">
                <label className="relative sm:col-span-2 xl:min-w-[260px]">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search holidays"
                    className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm font-semibold text-gray-900 shadow-sm outline-none placeholder:text-gray-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  />
                </label>

                <div className="sm:min-w-[220px]">
                  <SearchableSelect
                    options={statusOptions.map((item) => ({ value: item.value, label: item.label }))}
                    value={status}
                    onChange={(event) => setStatus((event.target.value as '' | HolidayStatus) || '')}
                    placeholder="Filter status"
                    name="status"
                  />
                </div>

                <div className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-600 shadow-sm">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <span>{search || status ? 'Filters applied' : 'No filters applied'}</span>
                </div>
              </div>

              <div className="inline-flex w-full rounded-2xl border border-gray-200 bg-white p-1 shadow-sm sm:w-auto">
                {[
                  { value: 'CALENDAR', label: 'Calendar' },
                  { value: 'LIST', label: 'List' },
                ].map((tab) => (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setView(tab.value as 'CALENDAR' | 'LIST')}
                    className={`flex-1 rounded-2xl px-5 py-2.5 text-sm font-black transition-all sm:flex-none ${view === tab.value ? 'bg-emerald-50 text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <section className="rounded-[2rem] border border-white/70 bg-white p-4 shadow-[0_30px_90px_-40px_rgba(15,23,42,0.18)] sm:p-6">
              {view === 'CALENDAR' ? (
                <div className="space-y-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-2xl font-black text-gray-900">{monthLabel}</h2>
                      <p className="mt-1 text-sm font-semibold text-gray-500">Holiday coverage for the selected month.</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center sm:gap-3">
                      <button
                        type="button"
                        onClick={() => setCurrentMonth(format(new Date(parseISO(`${currentMonth}-01`).setMonth(parseISO(`${currentMonth}-01`).getMonth() - 1)), 'yyyy-MM'))}
                        className="rounded-2xl border border-gray-200 px-4 py-2 text-sm font-black text-gray-600 hover:bg-gray-50"
                      >
                        Prev
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentMonth(format(new Date(), 'yyyy-MM'))}
                        className="rounded-2xl border border-gray-200 px-4 py-2 text-sm font-black text-gray-600 hover:bg-gray-50"
                      >
                        Today
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentMonth(format(new Date(parseISO(`${currentMonth}-01`).setMonth(parseISO(`${currentMonth}-01`).getMonth() + 1)), 'yyyy-MM'))}
                        className="rounded-2xl border border-gray-200 px-4 py-2 text-sm font-black text-gray-600 hover:bg-gray-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>

                  <div className="hidden md:block">
                    <div className="grid grid-cols-7 gap-3 text-center text-[11px] font-black uppercase tracking-[0.26em] text-gray-400">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <div key={day} className="py-2">{day}</div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-3">
                      {calendarDays.map((day) => {
                        const key = format(day, 'yyyy-MM-dd');
                        const items = calendarItemsByDate.get(key) || [];
                        return (
                          <div
                            key={key}
                            className={`min-h-[120px] rounded-3xl border p-3 ${isSameMonth(day, parseISO(`${currentMonth}-01`)) ? 'border-gray-100 bg-gray-50/60' : 'border-transparent bg-gray-50/20 opacity-60'}`}
                          >
                            <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-black ${isToday(day) ? 'bg-emerald-500 text-white' : 'text-gray-700'}`}>
                              {format(day, 'd')}
                            </div>
                            <div className="space-y-2">
                              {items.length ? (
                                items.slice(0, 3).map((item, index) => (
                                  <div
                                    key={`${key}-${index}`}
                                    className="rounded-2xl border px-3 py-2 text-xs font-black"
                                    style={{
                                      backgroundColor: hexToRgba(item.color, 0.14),
                                      borderColor: hexToRgba(item.color, 0.28),
                                      color: item.color,
                                    }}
                                  >
                                    {item.title}
                                  </div>
                                ))
                              ) : (
                                <div className="text-xs font-semibold text-gray-300">No holiday</div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-3 md:hidden">
                    {calendarDays.map((day) => {
                      if (!isSameMonth(day, parseISO(`${currentMonth}-01`))) return null;
                      const key = format(day, 'yyyy-MM-dd');
                      const items = calendarItemsByDate.get(key) || [];
                      return (
                        <div key={key} className="rounded-3xl border border-gray-100 bg-gray-50/60 p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-black ${isToday(day) ? 'bg-emerald-500 text-white' : 'bg-white text-gray-700 border border-gray-200'}`}>
                                {format(day, 'd')}
                              </div>
                              <div>
                                <p className="text-sm font-black text-gray-900">{format(day, 'EEEE')}</p>
                                <p className="text-xs font-semibold text-gray-500">{format(day, 'dd MMM yyyy')}</p>
                              </div>
                            </div>
                            <span className="rounded-full bg-white px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-gray-500">
                              {items.length} items
                            </span>
                          </div>
                          <div className="mt-3 space-y-2">
                            {items.length ? (
                              items.map((item, index) => (
                                <div
                                  key={`${key}-${index}`}
                                  className="rounded-2xl border px-3 py-2 text-xs font-black"
                                  style={{
                                    backgroundColor: hexToRgba(item.color, 0.14),
                                    borderColor: hexToRgba(item.color, 0.28),
                                    color: item.color,
                                  }}
                                >
                                  {item.title}
                                </div>
                              ))
                            ) : (
                              <div className="rounded-2xl border border-dashed border-gray-200 px-3 py-3 text-xs font-semibold text-gray-400">
                                No holiday
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-2xl font-black text-gray-900">Holiday List</h2>
                      <p className="mt-1 text-sm font-semibold text-gray-500">Search, review, edit, and retire holiday records.</p>
                    </div>
                    <div className="w-fit rounded-2xl bg-gray-50 px-4 py-3 text-sm font-black text-gray-600">{filteredRows.length} records</div>
                  </div>

                  <div className="hidden overflow-hidden rounded-[1.75rem] border border-gray-100 md:block">
                    <div className="overflow-x-auto">
                      <table className="min-w-[920px] w-full text-left">
                        <thead className="bg-gray-50">
                          <tr className="text-[11px] font-black uppercase tracking-[0.26em] text-gray-400">
                            <th className="px-5 py-4">Holiday</th>
                            <th className="px-5 py-4">Date</th>
                            <th className="px-5 py-4">Source</th>
                            <th className="px-5 py-4">Status</th>
                            <th className="px-5 py-4">Recurring</th>
                            <th className="px-5 py-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {holidaysQuery.isLoading ? (
                            Array.from({ length: 6 }).map((_, index) => (
                              <tr key={`holiday-skeleton-${index}`} className="animate-pulse border-t border-gray-100">
                                {Array.from({ length: 6 }).map((__, column) => (
                                  <td key={`holiday-skeleton-${index}-${column}`} className="px-5 py-4">
                                    <div className="h-4 rounded-full bg-gray-100" />
                                  </td>
                                ))}
                              </tr>
                            ))
                          ) : filteredRows.length ? (
                            filteredRows.map((item) => (
                              <tr key={item.id} className="border-t border-gray-100 text-sm font-semibold text-gray-700 transition-colors hover:bg-emerald-50/40">
                                <td className="px-5 py-4">
                                  <div className="flex items-center gap-3">
                                    <span className="h-3.5 w-3.5 rounded-full border border-white shadow-sm" style={{ backgroundColor: item.color }} />
                                    <span className="font-black text-gray-900">{item.name}</span>
                                  </div>
                                </td>
                                <td className="px-5 py-4">{format(parseISO(item.holidayDate), 'dd MMM yyyy')}</td>
                                <td className="px-5 py-4">{item.source}</td>
                                <td className="px-5 py-4">
                                  <span className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.18em] ${item.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                                    {item.status}
                                  </span>
                                </td>
                                <td className="px-5 py-4">{item.isRecurring ? 'Yes' : 'No'}</td>
                                <td className="px-5 py-4">
                                  <div className="flex items-center justify-end gap-2">
                                    {canManage ? (
                                      <>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setSelectedHoliday(item);
                                            setIsModalOpen(true);
                                          }}
                                          className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-black text-gray-600 hover:bg-gray-50"
                                        >
                                          Edit
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setDeleteTarget(item)}
                                          className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-black text-red-600 hover:bg-red-100"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </button>
                                      </>
                                    ) : (
                                      <span className="text-xs font-black uppercase tracking-[0.18em] text-gray-400">View Only</span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={6} className="px-5 py-16 text-center">
                                <div className="mx-auto max-w-md space-y-3">
                                  <p className="text-2xl font-black text-gray-900">No holidays found</p>
                                  <p className="text-sm font-semibold text-gray-500">
                                    Try changing the filters or add the first holiday for this workspace.
                                  </p>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="space-y-3 md:hidden">
                    {holidaysQuery.isLoading ? (
                      Array.from({ length: 4 }).map((_, index) => (
                        <div key={`holiday-mobile-skeleton-${index}`} className="animate-pulse rounded-3xl border border-gray-100 bg-white p-5">
                          <div className="h-5 w-1/2 rounded-full bg-gray-100" />
                          <div className="mt-3 h-4 w-1/3 rounded-full bg-gray-100" />
                          <div className="mt-5 flex gap-2">
                            <div className="h-9 flex-1 rounded-2xl bg-gray-100" />
                            <div className="h-9 w-20 rounded-2xl bg-gray-100" />
                          </div>
                        </div>
                      ))
                    ) : filteredRows.length ? (
                      filteredRows.map((item) => (
                        <div key={item.id} className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-3">
                                <span className="h-3.5 w-3.5 rounded-full border border-white shadow-sm" style={{ backgroundColor: item.color }} />
                                <h3 className="text-lg font-black text-gray-900">{item.name}</h3>
                              </div>
                              <p className="mt-1 text-sm font-semibold text-gray-500">{format(parseISO(item.holidayDate), 'dd MMM yyyy')}</p>
                            </div>
                            <span className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] ${item.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                              {item.status}
                            </span>
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                            <div className="rounded-2xl bg-gray-50 px-3 py-3">
                              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">Source</p>
                              <p className="mt-1 font-bold text-gray-700">{item.source}</p>
                            </div>
                            <div className="rounded-2xl bg-gray-50 px-3 py-3">
                              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">Recurring</p>
                              <p className="mt-1 font-bold text-gray-700">{item.isRecurring ? 'Yes' : 'No'}</p>
                            </div>
                          </div>

                          <div className="mt-4 flex gap-2">
                            {canManage ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedHoliday(item);
                                    setIsModalOpen(true);
                                  }}
                                  className="flex-1 rounded-2xl border border-gray-200 px-4 py-3 text-sm font-black text-gray-600 hover:bg-gray-50"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteTarget(item)}
                                  className="inline-flex items-center justify-center rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-black text-red-600 hover:bg-red-100"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </>
                            ) : (
                              <div className="rounded-2xl bg-gray-50 px-4 py-3 text-sm font-black text-gray-400">
                                View Only
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-3xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center">
                        <p className="text-2xl font-black text-gray-900">No holidays found</p>
                        <p className="mt-3 text-sm font-semibold text-gray-500">
                          Try changing the filters or add the first holiday for this workspace.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>

      <HolidayFormModal
        open={isModalOpen}
        initialValue={selectedHoliday}
        locations={locations}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedHoliday(null);
        }}
        onSubmit={handleSave}
      />

      <AnimatePresence>
        {deleteTarget ? (
          <div className="fixed inset-0 z-[170] flex items-end justify-center p-0 sm:items-center sm:p-4">
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteTarget(null)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className="relative w-full max-w-lg rounded-t-3xl border border-gray-100 bg-white shadow-2xl sm:rounded-3xl"
            >
              <div className="border-b border-gray-100 px-5 py-4">
                <h3 className="text-xl font-black text-gray-900">Delete Holiday</h3>
                <p className="mt-1 text-sm font-semibold text-gray-500">
                  This will deactivate <span className="font-black text-gray-700">{deleteTarget.name}</span> from the holiday calendar.
                </p>
              </div>
              <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row">
                <button type="button" onClick={() => setDeleteTarget(null)} className="w-full rounded-2xl border border-gray-200 py-3 text-sm font-black text-gray-500 hover:bg-gray-50 sm:flex-1">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-red-500 py-3 text-sm font-black text-white hover:bg-red-600 disabled:opacity-70 sm:flex-1"
                >
                  {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  Delete Holiday
                </button>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default HolidayPage;
