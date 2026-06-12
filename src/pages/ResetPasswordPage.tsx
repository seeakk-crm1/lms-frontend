import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Eye, EyeOff, Link2Off, LoaderCircle, Lock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useResetPasswordMutation, useResetTokenValidation } from '../hooks/usePasswordReset';
import BrandLogo from '../components/BrandLogo';

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = (searchParams.get('token') || '').trim();

  const validationQuery = useResetTokenValidation(token);
  const resetMutation = useResetPasswordMutation();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [completed, setCompleted] = useState(false);

  const errorMessage = useMemo(() => {
    if (!token) return 'This reset link is missing its token. Please use the latest link from your email.';
    return (
      (validationQuery.error as any)?.response?.data?.message ||
      'This password reset link is invalid or has expired. Please request a new one.'
    );
  }, [token, validationQuery.error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    const result = await resetMutation.mutateAsync({ token, newPassword });
    setCompleted(true);
    toast.success(result.message || 'Password updated successfully.');
  };

  const renderCard = () => {
    if (!token || validationQuery.isError) {
      return (
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
            <Link2Off size={28} />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-gray-950">Reset link not valid</h1>
          <p className="mt-3 text-sm font-semibold leading-7 text-gray-500">{errorMessage}</p>
          <Link
            to="/forgot-password"
            className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-gray-900 px-5 py-3 text-sm font-black text-white transition hover:bg-gray-800"
          >
            Request a new link
            <ArrowRight size={16} />
          </Link>
        </div>
      );
    }

    if (validationQuery.isLoading) {
      return (
        <div className="text-center">
          <LoaderCircle className="mx-auto mb-5 animate-spin text-emerald-500" size={38} />
          <h1 className="text-2xl font-black tracking-tight text-gray-950">Checking your reset link…</h1>
        </div>
      );
    }

    if (completed) {
      return (
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500">
            <CheckCircle2 size={28} />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-gray-950">Password updated</h1>
          <p className="mt-3 text-sm font-semibold leading-7 text-gray-500">
            Your password has been changed and all previous sessions were signed out. Log in with your new password.
          </p>
          <button
            onClick={() => navigate('/login', { replace: true })}
            className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-600"
          >
            Go to login
            <ArrowRight size={16} />
          </button>
        </div>
      );
    }

    return (
      <>
        <h1 className="text-2xl font-black tracking-tight text-gray-950">Choose a new password</h1>
        <p className="mt-2 text-sm font-semibold leading-7 text-gray-500">
          Resetting the password for <span className="text-gray-900">{validationQuery.data?.email}</span>.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label htmlFor="new-password" className="mb-2 block text-sm font-bold text-gray-900">
              New password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Lock size={18} className="text-gray-400" />
              </div>
              <input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                autoFocus
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-12 text-sm font-semibold text-gray-900 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 transition hover:text-gray-600"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirm-password" className="mb-2 block text-sm font-bold text-gray-900">
              Confirm new password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Lock size={18} className="text-gray-400" />
              </div>
              <input
                id="confirm-password"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat the new password"
                className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm font-semibold text-gray-900 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={resetMutation.isPending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {resetMutation.isPending ? 'Updating…' : 'Update password'}
            {!resetMutation.isPending && <ArrowRight size={16} />}
          </button>
        </form>
      </>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-[100dvh] bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.16),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(20,184,166,0.14),_transparent_28%),linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)] px-4 py-8 sm:px-6"
    >
      <div className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-md flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="w-full rounded-[32px] border border-white/70 bg-white/95 p-8 shadow-[0_30px_80px_-35px_rgba(15,23,42,0.35)]"
        >
          <div className="mb-6 flex justify-center">
            <BrandLogo />
          </div>
          {renderCard()}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ResetPasswordPage;
