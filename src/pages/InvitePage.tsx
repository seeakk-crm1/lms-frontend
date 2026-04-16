import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Clock3, Link2Off, LoaderCircle, ShieldAlert } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import InviteForm from '../components/InviteForm';
import { useAcceptInviteMutation, useInviteValidation } from '../hooks/useInvite';

const InvitePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = (searchParams.get('token') || '').trim();

  const validationQuery = useInviteValidation(token);
  const acceptMutation = useAcceptInviteMutation();

  const inviteDetails = validationQuery.data?.invite;
  const errorMessage = useMemo(() => {
    if (!token) return 'This invitation link is missing its token. Please use the latest link from your email.';
    return (
      validationQuery.error &&
      (validationQuery.error as any)?.response?.data?.message
    ) || 'This invitation is invalid, expired, or has already been used.';
  }, [token, validationQuery.error]);

  const handleSubmit = async ({ password }: { password: string; confirmPassword: string }) => {
    await acceptMutation.mutateAsync({ token, password });
    navigate('/login?reason=invite-accepted', { replace: true });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-[100dvh] overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.16),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(20,184,166,0.14),_transparent_28%),linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)] px-4 py-8 sm:px-6 lg:px-8"
    >
      <div className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <motion.section
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="space-y-6"
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-gray-500 shadow-sm transition hover:text-emerald-600"
            >
              <ArrowRight className="rotate-180" size={14} />
              Back to home
            </Link>

            <div className="space-y-4">
              <p className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-black uppercase tracking-[0.24em] text-emerald-600">
                Secure Invite Flow
              </p>
              <h2 className="max-w-xl text-4xl font-black tracking-tight text-gray-950 sm:text-5xl">
                Welcome to your workspace onboarding.
              </h2>
              <p className="max-w-xl text-base font-semibold leading-7 text-gray-500">
                This one-time invitation activates your account safely, sets your password, and sends you straight back into the normal login flow.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[28px] border border-white/70 bg-white/85 p-5 shadow-[0_24px_55px_-35px_rgba(15,23,42,0.35)]">
                <Clock3 className="mb-3 text-emerald-500" size={22} />
                <p className="text-xs font-black uppercase tracking-[0.22em] text-gray-400">Time-boxed</p>
                <p className="mt-2 text-sm font-semibold leading-6 text-gray-600">
                  Invite links expire after 24 hours and stop working once used.
                </p>
              </div>
              <div className="rounded-[28px] border border-white/70 bg-white/85 p-5 shadow-[0_24px_55px_-35px_rgba(15,23,42,0.35)]">
                <ShieldAlert className="mb-3 text-emerald-500" size={22} />
                <p className="text-xs font-black uppercase tracking-[0.22em] text-gray-400">Protected</p>
                <p className="mt-2 text-sm font-semibold leading-6 text-gray-600">
                  The backend stores only a hashed version of your token and activates your account only after password setup.
                </p>
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
          >
            {!token ? (
              <div className="rounded-[32px] border border-rose-100 bg-white/95 p-8 shadow-[0_30px_80px_-35px_rgba(15,23,42,0.35)]">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
                  <Link2Off size={28} />
                </div>
                <h1 className="text-3xl font-black tracking-tight text-gray-950">Invite link is incomplete</h1>
                <p className="mt-4 text-sm font-semibold leading-7 text-gray-500">{errorMessage}</p>
                <Link
                  to="/login"
                  className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-gray-900 px-5 py-3 text-sm font-black text-white transition hover:bg-gray-800"
                >
                  Go to login
                </Link>
              </div>
            ) : validationQuery.isLoading ? (
              <div className="rounded-[32px] border border-white/70 bg-white/95 p-10 text-center shadow-[0_30px_80px_-35px_rgba(15,23,42,0.35)]">
                <LoaderCircle className="mx-auto mb-5 animate-spin text-emerald-500" size={38} />
                <h1 className="text-3xl font-black tracking-tight text-gray-950">Validating your invitation</h1>
                <p className="mt-4 text-sm font-semibold text-gray-500">
                  Give me a second while I check that link and prepare the account setup form.
                </p>
              </div>
            ) : validationQuery.isError || !inviteDetails ? (
              <div className="rounded-[32px] border border-amber-100 bg-white/95 p-8 shadow-[0_30px_80px_-35px_rgba(15,23,42,0.35)]">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
                  <ShieldAlert size={28} />
                </div>
                <h1 className="text-3xl font-black tracking-tight text-gray-950">This invitation can’t be used</h1>
                <p className="mt-4 text-sm font-semibold leading-7 text-gray-500">{errorMessage}</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 rounded-2xl bg-gray-900 px-5 py-3 text-sm font-black text-white transition hover:bg-gray-800"
                  >
                    Go to login
                  </Link>
                  <Link
                    to="/"
                    className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-black text-gray-700 transition hover:border-gray-300 hover:text-gray-900"
                  >
                    Return home
                  </Link>
                </div>
              </div>
            ) : (
              <InviteForm
                email={inviteDetails.email}
                workspaceName={inviteDetails.workspace?.companyName}
                roleName={inviteDetails.role?.name}
                isSubmitting={acceptMutation.isPending}
                onSubmit={handleSubmit}
              />
            )}
          </motion.section>
        </div>
      </div>
    </motion.div>
  );
};

export default InvitePage;
