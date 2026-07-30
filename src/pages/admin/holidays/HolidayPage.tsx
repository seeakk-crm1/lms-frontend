import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Building,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
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
  useUpdateHolidayMutation,
} from '../../../hooks/useHolidays';
import { useOfficesQuery } from '../../../hooks/useUsersQuery';
import useAuthStore from '../../../store/useAuthStore';
import type { HolidayPayload, HolidayRecord, HolidayStatus } from '../../../services/holidays.api';
import WeeklyOffPanel from './WeeklyOffPanel';

type HolidayListSection = 'holidays' | 'weekly-off';

interface OfficeOption {
  id: string;
  name: string;
  code?: string;
  isActive?: boolean;
}

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

const normalizeHolidayColor = (value?: string | null) => {
  if (typeof value !== 'string') {
    return '#fda4af';
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return '#fda4af';
  }

  const normalized = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
  return /^#[0-9a-fA-F]{6}$/.test(normalized) ? normalized.toLowerCase() : '#fda4af';
};

const hexToRgba = (hex: string | undefined | null, alpha: number) => {
  const normalized = normalizeHolidayColor(hex).replace('#', '');
  if (normalized.length !== 6) {
    return `rgba(253, 164, 175, ${alpha})`;
  }

  const bigint = Number.parseInt(normalized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const OfficeBadges: React.FC<{ offices?: Array<{ id: string; name: string }> }> = ({ offices }) => {
  const [showAll, setShowAll] = useState(false);

  if (!offices || offices.length === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-black">
        <Building className="w-3.5 h-3.5 text-slate-500" />
        All Offices
      </span>
    );
  }

  const displayed = offices.slice(0, 2);
  const remaining = offices.slice(2);

  return (
    <div className="relative inline-flex items-center flex-wrap gap-1.5">
      {displayed.map((o) => (
        <span
          key={o.id}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold"
        >
          <Building className="w-3.5 h-3.5 text-emerald-600" />
          {o.name}
        </span>
      ))}
      {remaining.length > 0 && (
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            onMouseEnter={() => setShowAll(true)}
            onMouseLeave={() => setShowAll(false)}
            className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100 border border-gray-200 text-gray-600 text-xs font-bold hover:bg-gray-200 transition"
          >
            +{remaining.length} More
          </button>
          {showAll && (
            <div className="absolute left-0 top-full mt-1 z-30 min-w-[200px] p-2 bg-white rounded-2xl shadow-xl border border-gray-100 space-y-1">
              <p className="text-[10px] font-black uppercase text-gray-400 px-2 py-1 tracking-wider">Assigned Offices</p>
              {offices.map((o) => (
                <div key={o.id} className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-bold text-gray-800 rounded-xl hover:bg-gray-50">
                  <Building className="w-3.5 h-3.5 text-emerald-600" />
                  {o.name}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const OfficeMultiSelect: React.FC<{
  offices: OfficeOption[];
  selectedOfficeIds: string[];
  onChange: (ids: string[]) => void;
  error?: string;
}> = ({ offices, selectedOfficeIds, onChange, error }) => {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const activeOffices = useMemo(
    () => offices.filter((o) => o.isActive !== false),
    [offices]
  );

  const filteredOffices = useMemo(() => {
    if (!search.trim()) return activeOffices;
    const term = search.toLowerCase().trim();
    return activeOffices.filter(
      (o) =>
        o.name.toLowerCase().includes(term) ||
        (o.code && o.code.toLowerCase().includes(term))
    );
  }, [activeOffices, search]);

  const selectedOffices = useMemo(
    () => activeOffices.filter((o) => selectedOfficeIds.includes(o.id)),
    [activeOffices, selectedOfficeIds]
  );

  const isAllSelected = activeOffices.length > 0 && selectedOfficeIds.length === activeOffices.length;

  const toggleOffice = (id: string) => {
    if (selectedOfficeIds.includes(id)) {
      onChange(selectedOfficeIds.filter((item) => item !== id));
    } else {
      onChange([...selectedOfficeIds, id]);
    }
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      onChange([]);
    } else {
      onChange(activeOffices.map((o) => o.id));
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-black uppercase tracking-widest text-gray-400">
          Applicable Offices <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-[11px] font-black uppercase tracking-wider text-emerald-600 hover:underline"
          >
            {isAllSelected ? 'Deselect All' : 'Select All'}
          </button>
          {selectedOfficeIds.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-[11px] font-black uppercase tracking-wider text-gray-400 hover:text-gray-600"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {selectedOffices.length > 0 && (
        <div className="flex flex-wrap gap-1.5 p-2 bg-emerald-50/50 rounded-2xl border border-emerald-100 max-h-28 overflow-y-auto custom-scrollbar">
          {selectedOffices.map((office) => (
            <span
              key={office.id}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-emerald-200 text-xs font-bold text-emerald-900 shadow-sm"
            >
              <Building className="w-3.5 h-3.5 text-emerald-600" />
              <span>{office.name}</span>
              {office.code && <span className="text-[10px] opacity-60">({office.code})</span>}
              <button
                type="button"
                onClick={() => toggleOffice(office.id)}
                className="p-0.5 rounded-full hover:bg-emerald-100 text-emerald-600 transition"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setIsOpen(true)}
            placeholder={
              selectedOfficeIds.length === 0
                ? "Search & select offices..."
                : `${selectedOfficeIds.length} of ${activeOffices.length} offices selected`
            }
            className="w-full pl-9 pr-10 py-3 rounded-2xl border border-gray-200 bg-white text-sm font-semibold text-gray-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            <div className="absolute left-0 right-0 top-full mt-1.5 z-20 max-h-60 overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-xl custom-scrollbar p-1.5 space-y-1">
              {filteredOffices.length === 0 ? (
                <div className="p-4 text-center text-xs font-semibold text-gray-500">
                  No offices found matching "{search}"
                </div>
              ) : (
                filteredOffices.map((office) => {
                  const isChecked = selectedOfficeIds.includes(office.id);
                  return (
                    <label
                      key={office.id}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-colors ${
                        isChecked ? 'bg-emerald-50 text-emerald-900' : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleOffice(office.id)}
                          className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>{office.name}</span>
                      </div>
                      {office.code && (
                        <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">
                          {office.code}
                        </span>
                      )}
                    </label>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>
      {error && <p className="text-xs font-bold text-red-500">{error}</p>}
    </div>
  );
};

const HolidayFormModal: React.FC<{
  open: boolean;
  initialValue: HolidayRecord | null;
  offices: OfficeOption[];
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: HolidayPayload) => Promise<void>;
}> = ({ open, initialValue, offices, isSubmitting, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [holidayDate, setHolidayDate] = useState('');
  const [selectedOfficeIds, setSelectedOfficeIds] = useState<string[]>([]);
  const [color, setColor] = useState('#fda4af');
  const [status, setStatus] = useState<HolidayStatus>('ACTIVE');
  const [isRecurring, setIsRecurring] = useState(false);
  const [officeError, setOfficeError] = useState('');

  useEffect(() => {
    if (!open) return;
    setName(initialValue?.name || '');
    setHolidayDate(initialValue?.holidayDate ? format(parseISO(initialValue.holidayDate), 'yyyy-MM-dd') : '');
    setSelectedOfficeIds(initialValue?.offices ? initialValue.offices.map((o) => o.id) : []);
    setColor(normalizeHolidayColor(initialValue?.color));
    setStatus(initialValue?.status || 'ACTIVE');
    setIsRecurring(initialValue?.isRecurring || false);
    setOfficeError('');
  }, [initialValue, open]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Holiday name is required.');
      return;
    }
    if (!holidayDate) {
      toast.error('Holiday date is required.');
      return;
    }
    if (selectedOfficeIds.length === 0) {
      setOfficeError('At least one office must be selected.');
      toast.error('At least one office must be selected.');
      return;
    }

    setOfficeError('');
    await onSubmit({
      name: name.trim(),
      holidayDate,
      color,
      officeIds: selectedOfficeIds,
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
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar rounded-t-3xl border border-gray-100 bg-white shadow-2xl sm:rounded-3xl"
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div>
                <h2 className="text-xl font-black text-gray-900">{initialValue ? 'Edit Holiday' : 'Add Holiday'}</h2>
                <p className="mt-1 text-sm font-semibold text-gray-500">
                  Configure office-specific holiday coverage for company calendars.
                </p>
              </div>
              <button type="button" onClick={onClose} className="rounded-xl border border-gray-200 p-2 text-gray-400 hover:bg-gray-50" aria-label="Close holiday modal">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-5 p-5 md:grid-cols-2">
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

              {/* Office Selector */}
              <div className="md:col-span-2">
                <OfficeMultiSelect
                  offices={offices}
                  selectedOfficeIds={selectedOfficeIds}
                  onChange={(ids) => {
                    setSelectedOfficeIds(ids);
                    if (ids.length > 0) setOfficeError('');
                  }}
                  error={officeError}
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
                      className="h-10 w-10 rounded-xl border border-gray-200 bg-transparent cursor-pointer"
                      aria-label="Holiday color picker"
                    />
                    <input
                      value={color}
                      onChange={(event) => setColor(event.target.value)}
                      className="min-w-[140px] flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                      aria-label="Holiday color hex code"
                    />
                    <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2">
                      <span className="h-4 w-4 rounded-full border border-white shadow-sm" style={{ backgroundColor: normalizeHolidayColor(color) }} />
                      <span className="text-xs font-black uppercase tracking-[0.18em] text-gray-500">Preview</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {HOLIDAY_COLOR_PRESETS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setColor(preset)}
                        className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-105 ${normalizeHolidayColor(color) === preset.toLowerCase() ? 'border-gray-900 ring-2 ring-emerald-500/30' : 'border-white'}`}
                        style={{ backgroundColor: preset }}
                        aria-label={`Select ${preset} as holiday color`}
                        title={preset}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
                <button
                  type="button"
                  onClick={() => setIsRecurring((value) => !value)}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${isRecurring ? 'bg-emerald-500' : 'bg-gray-300'}`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${isRecurring ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
                <div>
                  <p className="text-sm font-black text-gray-900">Recurring Holiday</p>
                  <p className="text-xs font-semibold text-gray-500">Use yearly recurrence for annual public holidays.</p>
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
  const [section, setSection] = useState<HolidayListSection>('holidays');
  const [view, setView] = useState<'CALENDAR' | 'LIST'>('CALENDAR');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'' | HolidayStatus>('');
  const [selectedCalendarOfficeIds, setSelectedCalendarOfficeIds] = useState<string[]>([]);
  const [isOfficeFilterOpen, setIsOfficeFilterOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => format(new Date(), 'yyyy-MM'));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState<HolidayRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<HolidayRecord | null>(null);

  const { user } = useAuthStore();
  const holidaysQuery = useHolidaysQuery();
  const calendarQuery = useHolidayCalendarQuery(currentMonth, selectedCalendarOfficeIds);
  const createMutation = useCreateHolidayMutation();
  const updateMutation = useUpdateHolidayMutation();
  const deleteMutation = useDeleteHolidayMutation();
  const officesQuery = useOfficesQuery();

  const canManage = ['admin', 'superadmin'].includes(roleKey(user?.role));

  const officeList: OfficeOption[] = useMemo(() => {
    const raw = officesQuery.data?.offices || officesQuery.data?.data?.offices || officesQuery.data?.data || [];
    return Array.isArray(raw) ? raw : [];
  }, [officesQuery.data]);

  const holidays = holidaysQuery.data || [];

  const filteredRows = useMemo(() => {
    return holidays.filter((item) => {
      const matchesSearch = !search || item.name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = !status || item.status === status;
      const matchesOffice =
        selectedCalendarOfficeIds.length === 0 ||
        !item.offices ||
        item.offices.length === 0 ||
        item.offices.some((o) => selectedCalendarOfficeIds.includes(o.id));
      return matchesSearch && matchesStatus && matchesOffice;
    });
  }, [holidays, search, status, selectedCalendarOfficeIds]);

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
    const map = new Map<string, Array<{ title: string; source: string; color: string; type: string }>>();
    (calendarQuery.data || []).forEach((item) => {
      const existing = map.get(item.date) || [];
      const color =
        item.type === 'WEEKLY_OFF' ? item.color : normalizeHolidayColor(item.color);
      existing.push({ title: item.title, source: item.source, color, type: item.type });
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
              <h1 className="text-3xl font-black tracking-tight text-gray-900 md:text-4xl">Holiday List</h1>
              <p className="mt-2 max-w-3xl text-sm font-semibold text-gray-500">
                {section === 'holidays'
                  ? 'Manage office-specific holidays used in calendar planning and SLA working-day calculations.'
                  : 'Configure global weekly-off days and calendar colour for non-working days across the platform.'}
              </p>
            </div>

            {section === 'holidays' && canManage ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
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
              </div>
            ) : null}
          </div>

          <div className="inline-flex w-full flex-col gap-2 rounded-[1.75rem] border border-gray-100 bg-white p-2 shadow-sm sm:w-auto sm:flex-row">
            <button
              type="button"
              onClick={() => setSection('holidays')}
              className={`rounded-2xl px-5 py-3 text-sm font-black transition-colors ${
                section === 'holidays' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Holidays
            </button>
            <button
              type="button"
              onClick={() => setSection('weekly-off')}
              className={`rounded-2xl px-5 py-3 text-sm font-black transition-colors ${
                section === 'weekly-off'
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Weekly-Off
            </button>
          </div>

          {section === 'weekly-off' ? (
            <WeeklyOffPanel />
          ) : (
            <>
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

                  <div className="sm:min-w-[200px]">
                    <SearchableSelect
                      options={statusOptions.map((item) => ({ value: item.value, label: item.label }))}
                      value={status}
                      onChange={(event) => setStatus((event.target.value as '' | HolidayStatus) || '')}
                      placeholder="Filter status"
                      name="status"
                    />
                  </div>

                  {/* Office Filter for Calendar / List */}
                  <div className="relative sm:min-w-[240px]">
                    <button
                      type="button"
                      onClick={() => setIsOfficeFilterOpen(!isOfficeFilterOpen)}
                      className="w-full flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-900 shadow-sm hover:border-gray-300"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Building className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="truncate">
                          {selectedCalendarOfficeIds.length === 0
                            ? 'All Offices'
                            : `${selectedCalendarOfficeIds.length} Office${selectedCalendarOfficeIds.length > 1 ? 's' : ''}`}
                        </span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${isOfficeFilterOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isOfficeFilterOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsOfficeFilterOpen(false)} />
                        <div className="absolute left-0 right-0 top-full mt-1.5 z-20 max-h-64 overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-xl custom-scrollbar p-2 space-y-1">
                          <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-100">
                            <span className="text-[10px] font-black uppercase text-gray-400">Office Filter</span>
                            {selectedCalendarOfficeIds.length > 0 && (
                              <button
                                type="button"
                                onClick={() => setSelectedCalendarOfficeIds([])}
                                className="text-[11px] font-bold text-emerald-600 hover:underline"
                              >
                                Reset to All
                              </button>
                            )}
                          </div>

                          <label
                            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition ${
                              selectedCalendarOfficeIds.length === 0 ? 'bg-emerald-50 text-emerald-900' : 'hover:bg-gray-50 text-gray-700'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={selectedCalendarOfficeIds.length === 0}
                              onChange={() => setSelectedCalendarOfficeIds([])}
                              className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <span>All Offices</span>
                          </label>

                          {officesQuery.isError ? (
                            <div className="p-3 text-center text-xs font-semibold text-red-500 space-y-1">
                              <p>Unable to load offices.</p>
                              <button
                                type="button"
                                onClick={() => officesQuery.refetch()}
                                className="text-emerald-600 underline font-bold"
                              >
                                Retry
                              </button>
                            </div>
                          ) : (
                            officeList.map((office: any) => {
                              const isChecked = selectedCalendarOfficeIds.includes(office.id);
                              return (
                                <label
                                  key={office.id}
                                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition ${
                                    isChecked ? 'bg-emerald-50 text-emerald-900' : 'hover:bg-gray-50 text-gray-700'
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => {
                                        if (isChecked) {
                                          setSelectedCalendarOfficeIds(selectedCalendarOfficeIds.filter((id) => id !== office.id));
                                        } else {
                                          setSelectedCalendarOfficeIds([...selectedCalendarOfficeIds, office.id]);
                                        }
                                      }}
                                      className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                    />
                                    <span>{office.name}</span>
                                  </div>
                                  {office.code && (
                                    <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                                      {office.code}
                                    </span>
                                  )}
                                </label>
                              );
                            })
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-600 shadow-sm">
                    <Filter className="h-4 w-4 text-gray-400" />
                    <span>{search || status || selectedCalendarOfficeIds.length > 0 ? 'Filters applied' : 'No filters applied'}</span>
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
                                        color: normalizeHolidayColor(item.color),
                                      }}
                                    >
                                      {item.title}
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-xs font-semibold text-gray-300">No events</div>
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
                                      color: normalizeHolidayColor(item.color),
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
                        <p className="mt-1 text-sm font-semibold text-gray-500">Search, review, edit, and retire office holiday records.</p>
                      </div>
                      <div className="w-fit rounded-2xl bg-gray-50 px-4 py-3 text-sm font-black text-gray-600">{filteredRows.length} records</div>
                    </div>

                    <div className="hidden overflow-hidden rounded-[1.75rem] border border-gray-100 md:block">
                      <div className="overflow-x-auto">
                        <table className="min-w-[960px] w-full text-left">
                          <thead className="bg-gray-50">
                            <tr className="text-[11px] font-black uppercase tracking-[0.26em] text-gray-400">
                              <th className="px-5 py-4">Holiday</th>
                              <th className="px-5 py-4">Date</th>
                              <th className="px-5 py-4">Applicable Offices</th>
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
                                  {Array.from({ length: 7 }).map((__, column) => (
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
                                      <span className="h-3.5 w-3.5 rounded-full border border-white shadow-sm" style={{ backgroundColor: normalizeHolidayColor(item.color) }} />
                                      <span className="font-black text-gray-900">{item.name}</span>
                                    </div>
                                  </td>
                                  <td className="px-5 py-4">{format(parseISO(item.holidayDate), 'dd MMM yyyy')}</td>
                                  <td className="px-5 py-4">
                                    <OfficeBadges offices={item.offices} />
                                  </td>
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
                                <td colSpan={7} className="px-5 py-16 text-center">
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
                          <div key={item.id} className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm space-y-3">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="flex items-center gap-3">
                                  <span className="h-3.5 w-3.5 rounded-full border border-white shadow-sm" style={{ backgroundColor: normalizeHolidayColor(item.color) }} />
                                  <h3 className="text-lg font-black text-gray-900">{item.name}</h3>
                                </div>
                                <p className="mt-1 text-sm font-semibold text-gray-500">{format(parseISO(item.holidayDate), 'dd MMM yyyy')}</p>
                              </div>
                              <span className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] ${item.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                                {item.status}
                              </span>
                            </div>

                            <div className="py-2 border-t border-b border-gray-50">
                              <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider mb-1.5">Applicable Offices</p>
                              <OfficeBadges offices={item.offices} />
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div className="rounded-2xl bg-gray-50 px-3 py-3">
                                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">Source</p>
                                <p className="mt-1 font-bold text-gray-700">{item.source}</p>
                              </div>
                              <div className="rounded-2xl bg-gray-50 px-3 py-3">
                                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">Recurring</p>
                                <p className="mt-1 font-bold text-gray-700">{item.isRecurring ? 'Yes' : 'No'}</p>
                              </div>
                            </div>

                            {canManage && (
                              <div className="flex gap-2 pt-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedHoliday(item);
                                    setIsModalOpen(true);
                                  }}
                                  className="flex-1 rounded-xl border border-gray-200 py-2.5 text-xs font-black text-gray-600 hover:bg-gray-50 text-center"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteTarget(item)}
                                  className="px-4 rounded-xl border border-red-100 bg-red-50 py-2.5 text-xs font-black text-red-600 hover:bg-red-100"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="rounded-3xl border border-gray-100 bg-white p-8 text-center">
                          <p className="text-xl font-black text-gray-900">No holidays found</p>
                          <p className="text-xs font-semibold text-gray-500 mt-1">Try changing filters or add a new holiday.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </section>
            </>
          )}

          {/* Form Modal */}
          <HolidayFormModal
            open={isModalOpen}
            initialValue={selectedHoliday}
            offices={officeList}
            isSubmitting={createMutation.isPending || updateMutation.isPending}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedHoliday(null);
            }}
            onSubmit={handleSave}
          />

          {/* Delete Confirmation Modal */}
          <AnimatePresence>
            {deleteTarget ? (
              <div className="fixed inset-0 z-[170] flex items-center justify-center p-4">
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setDeleteTarget(null)}
                  className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative w-full max-w-md rounded-3xl border border-gray-100 bg-white p-6 shadow-2xl space-y-4"
                >
                  <h3 className="text-xl font-black text-gray-900">Retire Holiday</h3>
                  <p className="text-sm font-semibold text-gray-500">
                    Are you sure you want to retire <span className="font-black text-gray-900">"{deleteTarget.name}"</span>?
                    This will set its status to INACTIVE.
                  </p>
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(null)}
                      className="flex-1 rounded-2xl border border-gray-200 py-3 text-sm font-black text-gray-500 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={deleteMutation.isPending}
                      className="flex-1 rounded-2xl bg-red-600 py-3 text-sm font-black text-white hover:bg-red-700 disabled:opacity-70"
                    >
                      {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Retire Holiday'}
                    </button>
                  </div>
                </motion.div>
              </div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default HolidayPage;
