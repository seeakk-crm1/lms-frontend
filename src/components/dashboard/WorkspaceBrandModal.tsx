import React, { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Building2, ImagePlus, Loader2, PencilLine, ShieldCheck, Upload, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import useAuthStore from '../../store/useAuthStore';
import { updateWorkspaceBranding } from '../../services/workspace.api';
import { getApiErrorMessage } from '../../utils/apiValidation';

interface WorkspaceBrandModalProps {
  open: boolean;
  onClose: () => void;
}

const MAX_LOGO_FILE_BYTES = 1024 * 1024;

const WorkspaceBrandModal: React.FC<WorkspaceBrandModalProps> = ({ open, onClose }) => {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);

  const [companyName, setCompanyName] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCompanyName(user?.workspace?.companyName || '');
    setLogoUrl(user?.workspace?.logoUrl || null);
  }, [open, user?.workspace?.companyName, user?.workspace?.logoUrl]);

  const workspaceInitials = useMemo(() => {
    const source = companyName.trim() || user?.workspace?.companyName || 'Workspace';
    return (
      source
        .split(/\s+/)
        .filter(Boolean)
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'WS'
    );
  }, [companyName, user?.workspace?.companyName]);

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
      setLogoUrl(result || null);
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedCompanyName = companyName.trim();
    if (!trimmedCompanyName) {
      toast.error('Company name is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await updateWorkspaceBranding({
        companyName: trimmedCompanyName,
        logoUrl: logoUrl || '',
      });

      updateUser({
        workspace: response.workspace,
      });

      toast.success(response.message || 'Company branding updated successfully.');
      onClose();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to update company branding.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30, mass: 0.9 }}
            className="relative flex w-full max-w-3xl flex-col overflow-hidden rounded-[32px] border border-white/80 bg-white shadow-[0_40px_120px_-40px_rgba(15,23,42,0.45)]"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 z-20 rounded-full border border-white/70 bg-white/90 p-2 text-gray-400 shadow-sm transition-all hover:text-gray-700"
              aria-label="Close company branding modal"
            >
              <X className="h-4 w-4" />
            </button>

            <form onSubmit={handleSubmit} className="flex min-h-0 flex-col lg:flex-row">
              <aside className="flex w-full flex-col bg-[radial-gradient(circle_at_top_left,_rgba(52,211,153,0.28),_transparent_32%),linear-gradient(160deg,#0f172a_0%,#111827_52%,#064e3b_100%)] px-6 py-6 text-white lg:w-[360px] lg:px-8 lg:py-8">
                <p className="text-[11px] font-black uppercase tracking-[0.28em] text-emerald-200/90">
                  Workspace branding
                </p>
                <h2 className="mt-3 text-2xl font-black tracking-tight">Company identity</h2>
                <p className="mt-2 max-w-xs text-sm font-medium leading-6 text-slate-300">
                  Manage how your workspace appears in the sidebar and company branding entry points.
                </p>

                <div className="mt-8 rounded-[28px] border border-white/10 bg-white/8 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-sm">
                  <div className="flex items-center gap-4">
                    {logoUrl ? (
                      <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-[22px] bg-white p-2 ring-1 ring-white/10">
                        <img src={logoUrl} alt={companyName || 'Company logo'} className="h-full w-full object-contain" />
                      </div>
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-white/10 text-xl font-black text-white ring-1 ring-white/10">
                        {workspaceInitials}
                      </div>
                    )}

                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-black text-white">
                        {companyName.trim() || user?.workspace?.companyName || 'Workspace'}
                      </h3>
                      <p className="mt-1 text-sm font-medium text-slate-300">Company Workspace</p>
                      <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-emerald-100">
                        <ShieldCheck size={12} />
                        Live branding
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-[24px] border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm">
                  <p className="font-black uppercase tracking-[0.2em] text-emerald-100">What updates here</p>
                  <p className="mt-2 font-medium leading-6 text-emerald-50/90">
                    Changes update the workspace company name and logo used in navigation branding for your current session.
                  </p>
                </div>
              </aside>

              <div className="flex flex-1 flex-col bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.10),_transparent_35%)]">
                <div className="border-b border-gray-100/80 px-5 py-5 sm:px-8 sm:py-6">
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-emerald-500">
                    Edit company
                  </p>
                  <h3 className="mt-2 text-2xl font-black tracking-tight text-gray-900">
                    Update company name and logo
                  </h3>
                  <p className="mt-2 text-sm font-medium leading-6 text-gray-500">
                    Keep your workspace identity clean and professional across the dashboard.
                  </p>
                </div>

                <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5 custom-scrollbar sm:px-8 sm:py-6">
                  <section className="rounded-[28px] border border-gray-200/80 bg-white/95 p-5 shadow-[0_20px_60px_-42px_rgba(15,23,42,0.22)] sm:p-6">
                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-emerald-500">
                      Company profile
                    </p>
                    <h4 className="mt-2 text-lg font-black text-gray-900">Core branding details</h4>

                    <div className="mt-6 space-y-4">
                      <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-[0.22em] text-gray-400">
                          Company name
                        </label>
                        <div className="group flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50/70 px-4 py-3 transition-all focus-within:border-emerald-300 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(16,185,129,0.08)]">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-gray-400 ring-1 ring-gray-200">
                            <Building2 className="h-4 w-4" />
                          </div>
                          <input
                            value={companyName}
                            onChange={(event) => setCompanyName(event.target.value)}
                            type="text"
                            placeholder="Enter your company name"
                            className="w-full border-0 bg-transparent p-0 text-sm font-semibold text-gray-900 outline-none placeholder:text-gray-400"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-[0.22em] text-gray-400">
                          Company logo
                        </label>
                        <div className="rounded-[24px] border border-dashed border-gray-200 bg-gray-50/60 p-4">
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[22px] border border-gray-200 bg-white">
                              {logoUrl ? (
                                <img
                                  src={logoUrl}
                                  alt="Company logo preview"
                                  className="h-full w-full object-contain p-2"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-600 text-lg font-black text-white">
                                  {workspaceInitials}
                                </div>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap gap-2">
                                <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-2.5 text-sm font-black text-white shadow-[0_12px_30px_-12px_rgba(16,185,129,0.65)] transition-all hover:bg-emerald-600">
                                  <Upload className="h-4 w-4" />
                                  Upload logo
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoSelect}
                                    className="hidden"
                                  />
                                </label>
                                {logoUrl ? (
                                  <button
                                    type="button"
                                    onClick={() => setLogoUrl(null)}
                                    className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-600 transition-all hover:bg-gray-50"
                                  >
                                    <X className="h-4 w-4" />
                                    Remove logo
                                  </button>
                                ) : null}
                              </div>
                              <p className="mt-3 text-sm font-medium leading-6 text-gray-500">
                                Use PNG, JPG, or WebP up to 1MB for the best result in the sidebar and workspace branding.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="rounded-[28px] border border-gray-200 bg-white p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                        <PencilLine className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-900">Professional branding note</p>
                        <p className="mt-2 text-sm font-medium leading-6 text-gray-600">
                          Keep the company name concise and upload a clean logo with transparent padding when possible for a sharper sidebar presentation.
                        </p>
                      </div>
                    </div>
                  </section>
                </div>

                <div className="border-t border-gray-100 bg-white/90 px-5 py-4 backdrop-blur-sm sm:px-8">
                  <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:items-center sm:justify-end">
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-600 transition-all hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-3 text-sm font-black text-white shadow-[0_12px_30px_-12px_rgba(16,185,129,0.65)] transition-all hover:from-emerald-600 hover:to-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                      {isSubmitting ? 'Saving changes...' : 'Save company branding'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default WorkspaceBrandModal;
