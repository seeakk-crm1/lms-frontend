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

  const currentWorkspaceName = companyName.trim() || user?.workspace?.companyName || 'Workspace';

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
          className="relative flex w-full max-w-2xl max-h-[calc(100vh-2rem)] flex-col overflow-hidden rounded-[28px] border border-white/80 bg-white shadow-[0_40px_120px_-40px_rgba(15,23,42,0.45)]"
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

            <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
              <div className="border-b border-gray-100 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.10),_transparent_38%)] px-5 py-5 sm:px-7 sm:py-6">
                <div className="pr-10">
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-emerald-500">
                    Workspace branding
                  </p>
                  <h2 className="mt-2 text-2xl font-black tracking-tight text-gray-900">
                    Edit company branding
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-gray-500">
                    Update the company name and logo used in the sidebar with a cleaner, minimal branding setup.
                  </p>
                </div>

                <div className="mt-5 rounded-[24px] border border-gray-200 bg-white/95 p-4 shadow-[0_20px_60px_-42px_rgba(15,23,42,0.22)]">
                  <div className="flex items-center gap-4">
                    {logoUrl ? (
                      <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-[20px] border border-gray-200 bg-white p-2 shadow-sm">
                        <img src={logoUrl} alt={currentWorkspaceName} className="h-full w-full object-contain" />
                      </div>
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-gradient-to-br from-emerald-500 to-emerald-600 text-xl font-black text-white shadow-sm">
                        {workspaceInitials}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-lg font-black text-gray-900">{currentWorkspaceName}</h3>
                      <p className="mt-1 text-sm font-medium text-gray-500">Company Workspace</p>
                      <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-emerald-700">
                        <ShieldCheck size={12} />
                        Live branding
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-5 custom-scrollbar sm:px-7 sm:py-6">
                <div className="grid gap-5">
                  <section className="rounded-[24px] border border-gray-200 bg-white p-5 shadow-[0_20px_60px_-42px_rgba(15,23,42,0.16)]">
                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-emerald-500">
                      Company details
                    </p>
                    <div className="mt-5 space-y-4">
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
                    </div>
                  </section>

                  <section className="rounded-[24px] border border-gray-200 bg-white p-5 shadow-[0_20px_60px_-42px_rgba(15,23,42,0.16)]">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-emerald-500">
                          Company logo
                        </p>
                        <p className="mt-2 text-sm font-medium leading-6 text-gray-500">
                          Keep the logo clean and simple for the best sidebar presentation.
                        </p>
                      </div>
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[22px] border border-gray-200 bg-gray-50">
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
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
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

                    <p className="mt-4 text-sm font-medium leading-6 text-gray-500">
                      Use PNG, JPG, or WebP up to 1MB. Transparent logos usually look best in the sidebar.
                    </p>
                  </section>

                  <section className="rounded-[24px] border border-gray-200 bg-gray-50/80 p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-emerald-600 ring-1 ring-gray-200">
                        <PencilLine className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-900">Professional branding note</p>
                        <p className="mt-2 text-sm font-medium leading-6 text-gray-600">
                          Short company names and logos with balanced padding create a much cleaner navigation layout.
                        </p>
                      </div>
                    </div>
                  </section>
                </div>
              </div>

              <div className="border-t border-gray-100 bg-white px-5 py-4 sm:px-7">
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
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-black text-white shadow-[0_12px_30px_-12px_rgba(16,185,129,0.65)] transition-all hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                    {isSubmitting ? 'Saving changes...' : 'Save company branding'}
                  </button>
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
