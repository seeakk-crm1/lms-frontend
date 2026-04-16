import React, { useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Lock, ShieldCheck } from 'lucide-react';

interface InviteFormProps {
  email: string;
  workspaceName?: string | null;
  roleName?: string | null;
  isSubmitting?: boolean;
  onSubmit: (payload: { password: string; confirmPassword: string }) => void;
}

const inputClassName =
  'w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10';

const InviteForm: React.FC<InviteFormProps> = ({
  email,
  workspaceName,
  roleName,
  isSubmitting = false,
  onSubmit,
}) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [touched, setTouched] = useState<{ password: boolean; confirmPassword: boolean }>({
    password: false,
    confirmPassword: false,
  });

  const errors = useMemo(() => {
    const nextErrors: { password?: string; confirmPassword?: string } = {};

    if (touched.password && password.trim().length < 8) {
      nextErrors.password = 'Password must be at least 8 characters.';
    }

    if (touched.confirmPassword && confirmPassword !== password) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }

    return nextErrors;
  }, [confirmPassword, password, touched.confirmPassword, touched.password]);

  const isValid = password.trim().length >= 8 && confirmPassword === password;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setTouched({ password: true, confirmPassword: true });

    if (!isValid || isSubmitting) return;

    onSubmit({ password, confirmPassword });
  };

  return (
    <div className="rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-[0_30px_80px_-35px_rgba(15,23,42,0.35)] backdrop-blur sm:p-8">
      <div className="mb-8 flex items-start gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
          <ShieldCheck size={28} />
        </div>
        <div className="space-y-2">
          <p className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-emerald-600">
            Invite Activation
          </p>
          <h1 className="text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">Set your password</h1>
          <p className="max-w-xl text-sm font-semibold leading-6 text-gray-500 sm:text-base">
            Finish your account setup for {workspaceName || 'your workspace'} and unlock your role-based dashboard.
          </p>
        </div>
      </div>

      <div className="mb-6 grid gap-3 rounded-3xl border border-emerald-100 bg-emerald-50/70 p-4 sm:grid-cols-2">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-600">Invited email</p>
          <p className="mt-2 text-sm font-bold text-gray-900">{email}</p>
        </div>
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-600">Assigned role</p>
          <p className="mt-2 text-sm font-bold text-gray-900">{roleName || 'Workspace Member'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-[0.22em] text-gray-400">Password</label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              onBlur={() => setTouched((current) => ({ ...current, password: true }))}
              className={`${inputClassName} pl-11`}
              placeholder="Create a strong password"
              autoComplete="new-password"
            />
          </div>
          {errors.password ? (
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-rose-500">
              <AlertCircle size={16} />
              {errors.password}
            </p>
          ) : (
            <p className="text-xs font-semibold text-gray-400">Use at least 8 characters.</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-[0.22em] text-gray-400">Confirm password</label>
          <div className="relative">
            <CheckCircle2 className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              onBlur={() => setTouched((current) => ({ ...current, confirmPassword: true }))}
              className={`${inputClassName} pl-11`}
              placeholder="Re-enter your password"
              autoComplete="new-password"
            />
          </div>
          {errors.confirmPassword ? (
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-rose-500">
              <AlertCircle size={16} />
              {errors.confirmPassword}
            </p>
          ) : (
            <p className="text-xs font-semibold text-gray-400">Passwords must match exactly.</p>
          )}
        </div>

        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="inline-flex w-full items-center justify-center rounded-2xl bg-emerald-500 px-5 py-3.5 text-sm font-black text-white shadow-[0_24px_50px_-24px_rgba(16,185,129,1)] transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
        >
          {isSubmitting ? 'Activating account...' : 'Activate Account'}
        </button>
      </form>
    </div>
  );
};

export default InviteForm;
