import React, { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Building2,
  CheckCircle2,
  Coins,
  Database,
  Globe2,
  ImagePlus,
  Languages,
  Loader2,
  ShieldAlert,
  Users,
  X,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import useAuthStore from '../../store/useAuthStore';
import useWorkspaceStore from '../../store/useWorkspaceStore';
import { updateWorkspaceProfile } from '../../services/workspace.api';
import api from '../../services/api';
import { queryClient } from '../../lib/queryClient';
import useDashboardStore from '../../store/useDashboardStore';
import { getApiErrorMessage } from '../../utils/apiValidation';
import { hasPermission } from '../../utils/permissions';
import SearchableSelect from '../SearchableSelect';

interface WorkspaceBrandModalProps {
  open: boolean;
  onClose: () => void;
}

interface WorkspaceMetaLists {
  timeZones: string[];
  languages: { code: string; label?: string; name?: string }[];
  currencies: { code: string; label?: string; name?: string }[];
}

const MAX_LOGO_FILE_BYTES = 1024 * 1024; // 1MB

const EMPLOYEE_COUNT_OPTIONS = [
  { value: '1-10', label: '1 - 10 employees' },
  { value: '11-50', label: '11 - 50 employees' },
  { value: '51-200', label: '51 - 200 employees' },
  { value: '201-500', label: '201 - 500 employees' },
  { value: '500+', label: '500+ employees' },
];

const WorkspaceBrandModal: React.FC<WorkspaceBrandModalProps> = ({ open, onClose }) => {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const workspaceStore = useWorkspaceStore();

  const canEditWorkspace = hasPermission(user, 'SYSTEM_CONFIG');

  const [metaLists, setMetaLists] = useState<WorkspaceMetaLists>({
    timeZones: [],
    languages: [],
    currencies: [],
  });
  const [isLoadingMeta, setIsLoadingMeta] = useState(false);

  // Initial reference values to calculate deltas
  const [initialFormState, setInitialFormState] = useState({
    companyName: '',
    logoUrl: null as string | null,
    employeeCount: '1-10',
    timeZone: 'UTC',
    language: 'en-US',
    currencyLocale: 'USD',
  });

  // Current working form state
  const [formData, setFormData] = useState({
    companyName: '',
    logoUrl: null as string | null,
    employeeCount: '1-10',
    timeZone: 'UTC',
    language: 'en-US',
    currencyLocale: 'USD',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch configuration metadata options (timezones, languages, currencies)
  useEffect(() => {
    if (!open) return;

    const fetchMeta = async () => {
      setIsLoadingMeta(true);
      try {
        const response = await api.get('/workspace/config-meta');
        const { lists } = response.data || {};
        if (lists) {
          setMetaLists(lists);
        }
      } catch (err) {
        console.warn('[WorkspaceSettings] Could not load config-meta options:', err);
      } finally {
        setIsLoadingMeta(false);
      }
    };

    void fetchMeta();
  }, [open]);

  // Synchronize form state with user & workspace store on open
  useEffect(() => {
    if (!open) return;

    const w = user?.workspace;
    const currentName = w?.companyName || workspaceStore.companyName || '';
    const currentLogo = w?.logoUrl || workspaceStore.logoUrl || null;
    const currentEmp = w?.employeeCount || workspaceStore.employeeCount || '1-10';
    const currentTz = w?.timeZone || workspaceStore.timeZone || 'UTC';
    const currentLang = w?.language || workspaceStore.language || 'en-US';
    const currentCur = w?.currencyLocale || workspaceStore.currencyLocale || 'USD';

    const stateObj = {
      companyName: currentName,
      logoUrl: currentLogo,
      employeeCount: currentEmp,
      timeZone: currentTz,
      language: currentLang,
      currencyLocale: currentCur,
    };

    setInitialFormState(stateObj);
    setFormData(stateObj);
  }, [open, user?.workspace, workspaceStore]);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (!open || typeof document === 'undefined') return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const workspaceInitials = useMemo(() => {
    const source = formData.companyName.trim() || 'Workspace';
    return (
      source
        .split(/\s+/)
        .filter(Boolean)
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'WS'
    );
  }, [formData.companyName]);

  const timeZoneOptions = useMemo(
    () =>
      metaLists.timeZones.map((tz) => ({
        value: tz,
        label: tz.replace(/_/g, ' '),
      })),
    [metaLists.timeZones],
  );

  const languageOptions = useMemo(
    () =>
      metaLists.languages.map((lng) => ({
        value: lng.code,
        label: lng.label || lng.name || lng.code,
      })),
    [metaLists.languages],
  );

  const currencyOptions = useMemo(
    () =>
      metaLists.currencies.map((cur) => ({
        value: cur.code,
        label: cur.label || cur.name || cur.code,
      })),
    [metaLists.currencies],
  );

  const handleLogoSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please choose a valid image file.');
      event.target.value = '';
      return;
    }

    if (file.size > MAX_LOGO_FILE_BYTES) {
      toast.error('Company logo must be 1MB or smaller.');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      setFormData((prev) => ({ ...prev, logoUrl: result || null }));
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  // Compute delta object of only modified fields
  const getModifiedPayload = () => {
    const payload: Record<string, any> = {};

    if (formData.companyName.trim() !== initialFormState.companyName.trim()) {
      payload.companyName = formData.companyName.trim();
    }
    if (formData.logoUrl !== initialFormState.logoUrl) {
      payload.logoUrl = formData.logoUrl || '';
    }
    if (formData.employeeCount !== initialFormState.employeeCount) {
      payload.employeeCount = formData.employeeCount;
    }
    if (formData.timeZone !== initialFormState.timeZone) {
      payload.timeZone = formData.timeZone;
    }
    if (formData.language !== initialFormState.language) {
      payload.language = formData.language;
    }
    if (formData.currencyLocale !== initialFormState.currencyLocale) {
      payload.currencyLocale = formData.currencyLocale;
    }

    return payload;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canEditWorkspace) {
      toast.error('You do not have permission to update workspace settings.');
      return;
    }

    if (!formData.companyName.trim()) {
      toast.error('Company name is required.');
      return;
    }

    const payload = getModifiedPayload();
    if (Object.keys(payload).length === 0) {
      toast.success('No changes to save.');
      onClose();
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await updateWorkspaceProfile(payload);

      // 1. Update active user state in auth store
      updateUser({
        workspace: {
          ...user?.workspace,
          ...response.workspace,
        },
      });

      // 2. Refresh global workspace context store (updates currency & timezone app-wide)
      useWorkspaceStore.getState().setWorkspaceConfig({
        companyName: response.workspace.companyName,
        logoUrl: response.workspace.logoUrl || null,
        employeeCount: response.workspace.employeeCount || null,
        timeZone: response.workspace.timeZone || 'UTC',
        language: response.workspace.language || 'en-US',
        currencyLocale: response.workspace.currencyLocale || 'USD',
        loadSampleData: Boolean(response.workspace.loadSampleData),
      });

      // 3. Invalidate React Query active queries so all views re-render instantly on the spot
      void queryClient.invalidateQueries();

      // 4. Trigger dashboard re-fetch so KPI cards re-format in the new currency instantly
      void useDashboardStore.getState().fetchDashboardData();

      toast.success(response.message || 'Workspace updated successfully.');
      onClose();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to save workspace settings. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const sampleDataLoaded = Boolean(user?.workspace?.loadSampleData || workspaceStore.loadSampleData);

  const modal = (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', stiffness: 360, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[32px] border border-gray-100 bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-emerald-50/60 via-white to-white px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <Building2 size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900">Workspace Settings</h2>
                  <p className="text-xs font-semibold text-gray-500">
                    Manage branding, regional preferences, and team configuration.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            {/* Read-only permission alert */}
            {!canEditWorkspace && (
              <div className="mx-6 mt-4 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-800">
                <ShieldAlert size={18} className="shrink-0 text-amber-600" />
                <span>You have view-only access. Only workspace administrators can edit settings.</span>
              </div>
            )}

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="custom-scrollbar flex-1 overflow-y-auto p-6 space-y-6">
              {/* Section 1: Workspace Branding */}
              <section className="space-y-4 rounded-2xl border border-gray-100 bg-slate-50/50 p-5">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-600">
                  <Building2 size={15} />
                  <span>Workspace Branding</span>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-700">
                      Company Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, companyName: e.target.value }))}
                      disabled={!canEditWorkspace || isSubmitting}
                      placeholder="e.g. Acme Corporation"
                      className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-60"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-700">
                      Company Logo
                    </label>
                    <div className="flex items-center gap-3">
                      {formData.logoUrl ? (
                        <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-white p-1 shadow-sm">
                          <img src={formData.logoUrl} alt="Logo preview" className="h-full w-full object-contain" />
                        </div>
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-base font-black text-white shadow-sm">
                          {workspaceInitials}
                        </div>
                      )}

                      {canEditWorkspace && (
                        <div className="flex flex-wrap items-center gap-2">
                          <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50">
                            <ImagePlus size={14} className="text-emerald-600" />
                            <span>Upload</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleLogoSelect}
                              disabled={isSubmitting}
                              className="hidden"
                            />
                          </label>
                          {formData.logoUrl && (
                            <button
                              type="button"
                              onClick={() => setFormData((prev) => ({ ...prev, logoUrl: null }))}
                              disabled={isSubmitting}
                              className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-100"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 2: Regional Settings */}
              <section className="space-y-4 rounded-2xl border border-gray-100 bg-slate-50/50 p-5">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-600">
                  <Globe2 size={15} />
                  <span>Regional Settings</span>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-2 flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-gray-700">
                      <Globe2 size={13} className="text-gray-400" />
                      Time Zone
                    </label>
                    {timeZoneOptions.length > 0 ? (
                      <SearchableSelect
                        options={timeZoneOptions}
                        value={formData.timeZone}
                        name="timeZone"
                        placeholder="Select Timezone"
                        onChange={(e) => setFormData((prev) => ({ ...prev, timeZone: e.target.value }))}
                      />
                    ) : (
                      <input
                        type="text"
                        value={formData.timeZone}
                        onChange={(e) => setFormData((prev) => ({ ...prev, timeZone: e.target.value }))}
                        disabled={!canEditWorkspace || isSubmitting}
                        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 outline-none focus:border-emerald-500"
                      />
                    )}
                  </div>

                  <div>
                    <label className="mb-2 flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-gray-700">
                      <Languages size={13} className="text-gray-400" />
                      Language
                    </label>
                    {languageOptions.length > 0 ? (
                      <SearchableSelect
                        options={languageOptions}
                        value={formData.language}
                        name="language"
                        placeholder="Select Language"
                        onChange={(e) => setFormData((prev) => ({ ...prev, language: e.target.value }))}
                      />
                    ) : (
                      <input
                        type="text"
                        value={formData.language}
                        onChange={(e) => setFormData((prev) => ({ ...prev, language: e.target.value }))}
                        disabled={!canEditWorkspace || isSubmitting}
                        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 outline-none focus:border-emerald-500"
                      />
                    )}
                  </div>

                  <div>
                    <label className="mb-2 flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-gray-700">
                      <Coins size={13} className="text-gray-400" />
                      Currency
                    </label>
                    {currencyOptions.length > 0 ? (
                      <SearchableSelect
                        options={currencyOptions}
                        value={formData.currencyLocale}
                        name="currencyLocale"
                        placeholder="Select Currency"
                        onChange={(e) => setFormData((prev) => ({ ...prev, currencyLocale: e.target.value }))}
                      />
                    ) : (
                      <input
                        type="text"
                        value={formData.currencyLocale}
                        onChange={(e) => setFormData((prev) => ({ ...prev, currencyLocale: e.target.value }))}
                        disabled={!canEditWorkspace || isSubmitting}
                        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 outline-none focus:border-emerald-500"
                      />
                    )}
                  </div>
                </div>
              </section>

              {/* Section 3: Organization */}
              <section className="space-y-4 rounded-2xl border border-gray-100 bg-slate-50/50 p-5">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-600">
                  <Users size={15} />
                  <span>Organization</span>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-700">
                    Employee Count
                  </label>
                  <select
                    value={formData.employeeCount}
                    onChange={(e) => setFormData((prev) => ({ ...prev, employeeCount: e.target.value }))}
                    disabled={!canEditWorkspace || isSubmitting}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-60"
                  >
                    {EMPLOYEE_COUNT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </section>

              {/* Section 4: Workspace Options (Read-only) */}
              <section className="space-y-3 rounded-2xl border border-gray-100 bg-slate-50/50 p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-600">
                    <Database size={15} />
                    <span>Workspace Options</span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                      sampleDataLoaded
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    <CheckCircle2 size={13} />
                    {sampleDataLoaded ? 'Sample Data Loaded' : 'Sample Data Not Loaded'}
                  </span>
                </div>
                <p className="text-xs font-semibold text-gray-500">
                  Sample data initialization is specified during workspace setup and is read-only.
                </p>
              </section>

              {/* Footer Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="rounded-2xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-gray-700 shadow-sm transition hover:bg-gray-50 active:scale-95 disabled:opacity-50"
                >
                  Cancel
                </button>

                {canEditWorkspace && (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition hover:brightness-105 active:scale-95 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save Workspace Settings</span>
                    )}
                  </button>
                )}
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modal, document.body);
};

export default WorkspaceBrandModal;
