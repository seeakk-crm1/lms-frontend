import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Mail, MailCheck } from 'lucide-react';
import { useForgotPasswordMutation } from '../hooks/usePasswordReset';
import BrandLogo from '../components/BrandLogo';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const forgotMutation = useForgotPasswordMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    await forgotMutation.mutateAsync(trimmed);
    setSubmittedEmail(trimmed);
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

          {submittedEmail ? (
            <div className="text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500">
                <MailCheck size={28} />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-gray-950">Check your email</h1>
              <p className="mt-3 text-sm font-semibold leading-7 text-gray-500">
                If an account exists for <span className="text-gray-900">{submittedEmail}</span>, we sent a password
                reset link. The link expires in 30 minutes and can only be used once.
              </p>
              <p className="mt-3 text-sm font-semibold leading-7 text-gray-500">
                Didn&apos;t get it? Check your spam folder, or try again in a few minutes.
              </p>
              <Link
                to="/login"
                className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-gray-900 px-5 py-3 text-sm font-black text-white transition hover:bg-gray-800"
              >
                Back to login
                <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-black tracking-tight text-gray-950">Forgot your password?</h1>
              <p className="mt-2 text-sm font-semibold leading-7 text-gray-500">
                Enter the email linked to your account and we&apos;ll send you a secure link to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div>
                  <label htmlFor="forgot-email" className="mb-2 block text-sm font-bold text-gray-900">
                    Email
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <Mail size={18} className="text-gray-400" />
                    </div>
                    <input
                      id="forgot-email"
                      type="email"
                      required
                      autoFocus
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@example.com"
                      className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm font-semibold text-gray-900 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={forgotMutation.isPending}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {forgotMutation.isPending ? 'Sending…' : 'Send reset link'}
                  {!forgotMutation.isPending && <ArrowRight size={16} />}
                </button>
              </form>

              <p className="mt-6 text-center text-sm font-semibold text-gray-500">
                Remembered it?{' '}
                <Link to="/login" className="font-bold text-emerald-500 hover:text-emerald-600">
                  Back to login
                </Link>
              </p>
            </>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ForgotPasswordPage;
