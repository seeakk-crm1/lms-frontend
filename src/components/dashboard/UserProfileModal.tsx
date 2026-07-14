import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, User as UserIcon, Mail, Phone, Lock, Eye, EyeOff, KeyRound, Check, Shield } from 'lucide-react';
import { toast } from 'react-hot-toast';
import useAuthStore from '../../store/useAuthStore';
import api from '../../services/api';
import { getPrimaryRoleName } from '../../utils/permissions';
import PhoneInput from '../common/PhoneInput';
import { validatePhoneStr } from '../../utils/phoneUtils';

const schema = z
  .object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters'),
    username: z.string().trim().min(3, 'Username must be at least 3 characters').optional().or(z.literal('')),
    phone: z.string().trim().superRefine((val, ctx) => {
      if (!val) return;
      const res = validatePhoneStr(val);
      if (!res.isValid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: res.message || 'Invalid phone number.',
        });
      }
    }).optional().or(z.literal('')),
    password: z.string().optional().or(z.literal('')),
    confirmPassword: z.string().optional().or(z.literal('')),
  })
  .refine(
    (data) => {
      if (data.password && data.password.length > 0) {
        return data.password.length >= 8 && data.password === data.confirmPassword;
      }
      return true;
    },
    {
      message: 'Passwords must match and be at least 8 characters long',
      path: ['confirmPassword'],
    }
  );

type FormValues = z.infer<typeof schema>;

interface UserProfileModalProps {
  open: boolean;
  onClose: () => void;
  initialTab?: 'profile' | 'security';
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ open, onClose, initialTab = 'profile' }) => {
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<{ score: number; label: string; color: string }>({
    score: 0,
    label: 'Too Weak',
    color: 'bg-red-500',
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      name: '',
      username: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const passwordVal = watch('password') || '';

  // Password strength checker
  useEffect(() => {
    if (!passwordVal) {
      setPasswordStrength({ score: 0, label: 'Too Weak', color: 'bg-red-500' });
      return;
    }

    let score = 0;
    if (passwordVal.length >= 8) score += 1;
    if (/[0-9]/.test(passwordVal)) score += 1;
    if (/[A-Z]/.test(passwordVal) && /[a-z]/.test(passwordVal)) score += 1;
    if (/[^A-Za-z0-9]/.test(passwordVal)) score += 1;

    let label = 'Weak';
    let color = 'bg-red-500';

    if (score === 3) {
      label = 'Medium';
      color = 'bg-amber-500';
    } else if (score === 4) {
      label = 'Strong';
      color = 'bg-emerald-500';
    }

    setPasswordStrength({ score, label, color });
  }, [passwordVal]);

  // Load initial values when modal opens
  useEffect(() => {
    if (open && user) {
      reset({
        name: user.name || '',
        username: user.username || '',
        phone: user.phone || '',
        password: '',
        confirmPassword: '',
      });
      setActiveTab(initialTab);
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [open, user, reset, initialTab]);

  const submitHandler = handleSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      const payload: any = {
        name: values.name.trim(),
        username: values.username?.trim() || undefined,
        phone: values.phone?.trim() || undefined,
      };

      if (values.password && values.password.length >= 8) {
        payload.password = values.password;
      }

      const response = await api.put('/auth/me', payload);
      
      // Update local state in zustand store
      if (response.data?.user) {
        updateUser(response.data.user);
      }

      toast.success(response.data?.message || 'Profile updated successfully!');
      handleClose();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update profile.');
    } finally {
      setIsSubmitting(false);
    }
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() || 'US';
  const roleLabel = getPrimaryRoleName(user);
  const activeTabMeta =
    activeTab === 'profile'
      ? {
          title: 'Profile details',
          description: 'Manage your workspace identity and contact information.',
        }
      : {
          title: 'Security settings',
          description: 'Keep your account protected with a stronger password.',
        };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-md"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30, mass: 0.9 }}
            className="relative flex h-[min(88vh,760px)] w-full max-w-3xl flex-col overflow-hidden rounded-[28px] border border-white/80 bg-white shadow-[0_40px_120px_-40px_rgba(15,23,42,0.35)]"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={handleClose}
              className="absolute right-4 top-4 z-20 rounded-full border border-white/70 bg-white/90 p-2 text-gray-400 shadow-sm backdrop-blur-sm transition-all duration-200 hover:text-gray-700 sm:right-5 sm:top-5"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>

            <form onSubmit={submitHandler} className="flex min-h-0 flex-1 flex-col">
              <div className="shrink-0 border-b border-gray-100 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.10),_transparent_40%)] px-5 py-5 sm:px-7 sm:py-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex items-center gap-4 pr-8">
                    <div className="relative shrink-0">
                      <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-gradient-to-br from-emerald-500 to-emerald-600 text-lg font-black text-white shadow-sm">
                        {initials}
                      </div>
                      <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-black uppercase tracking-[0.24em] text-emerald-500">
                        Account settings
                      </p>
                      <h2 className="mt-1 truncate text-2xl font-black tracking-tight text-gray-900">
                        {user?.name || 'User Profile'}
                      </h2>
                      <p className="mt-1 truncate text-sm font-medium text-gray-500">{user?.email}</p>
                      <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-emerald-700">
                        <Shield size={12} />
                        {roleLabel}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 lg:min-w-[260px] lg:max-w-[320px]">
                    <div>
                      <h3 className="text-xl font-black tracking-tight text-gray-900">{activeTabMeta.title}</h3>
                      <p className="mt-2 text-sm font-medium leading-6 text-gray-500">
                        {activeTabMeta.description}
                      </p>
                    </div>

                    <div className="inline-flex rounded-2xl border border-gray-200 bg-gray-50 p-1.5">
                      <button
                        type="button"
                        onClick={() => setActiveTab('profile')}
                        className={`relative inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black transition-all ${
                          activeTab === 'profile'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-900'
                        }`}
                      >
                        <UserIcon className="h-4 w-4" />
                        Profile
                        {activeTab === 'profile' ? (
                          <motion.div
                            layoutId="activeAccountTab"
                            className="absolute inset-0 -z-10 rounded-xl border border-gray-200 bg-white"
                          />
                        ) : null}
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('security')}
                        className={`relative inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black transition-all ${
                          activeTab === 'security'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-900'
                        }`}
                      >
                        <Shield className="h-4 w-4" />
                        Security
                        {activeTab === 'security' ? (
                          <motion.div
                            layoutId="activeAccountTab"
                            className="absolute inset-0 -z-10 rounded-xl border border-gray-200 bg-white"
                          />
                        ) : null}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-5 custom-scrollbar sm:px-7 sm:py-6">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_260px]"
                  >
                    {activeTab === 'profile' ? (
                      <>
                        <div className="space-y-5">
                          <section className="rounded-[24px] border border-gray-200 bg-white p-5 shadow-[0_20px_60px_-42px_rgba(15,23,42,0.16)]">
                            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-emerald-500">
                              Personal details
                            </p>
                            <div className="mt-5 grid gap-4 md:grid-cols-2">
                              <div className="space-y-2 md:col-span-2">
                                <label className="text-[11px] font-black uppercase tracking-[0.22em] text-gray-400">
                                  Full name
                                </label>
                                <div className="group flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50/70 px-4 py-3 transition-all focus-within:border-emerald-300 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(16,185,129,0.08)]">
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-gray-400 ring-1 ring-gray-200">
                                    <UserIcon className="h-4 w-4" />
                                  </div>
                                  <input
                                    {...register('name')}
                                    type="text"
                                    placeholder="John Doe"
                                    className="w-full border-0 bg-transparent p-0 text-sm font-semibold text-gray-900 outline-none placeholder:text-gray-400"
                                  />
                                </div>
                                {errors.name ? (
                                  <p className="text-[11px] font-semibold text-rose-500">{errors.name.message}</p>
                                ) : null}
                              </div>

                              <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase tracking-[0.22em] text-gray-400">
                                  Username
                                </label>
                                <div className="group flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50/70 px-4 py-3 transition-all focus-within:border-emerald-300 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(16,185,129,0.08)]">
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-gray-400 ring-1 ring-gray-200">
                                    <span className="text-sm font-black">@</span>
                                  </div>
                                  <input
                                    {...register('username')}
                                    type="text"
                                    placeholder="johndoe"
                                    className="w-full border-0 bg-transparent p-0 text-sm font-semibold text-gray-900 outline-none placeholder:text-gray-400"
                                  />
                                </div>
                                {errors.username ? (
                                  <p className="text-[11px] font-semibold text-rose-500">{errors.username.message}</p>
                                ) : null}
                              </div>

                              <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase tracking-[0.22em] text-gray-400">
                                  Phone number
                                </label>
                                <Controller
                                  name="phone"
                                  control={control}
                                  render={({ field }) => (
                                    <PhoneInput
                                      value={field.value || ''}
                                      onChange={field.onChange}
                                      error={Boolean(errors.phone)}
                                    />
                                  )}
                                />
                                {errors.phone ? (
                                  <p className="text-[11px] font-semibold text-rose-500">{errors.phone.message}</p>
                                ) : null}
                              </div>
                            </div>
                          </section>

                          <section className="rounded-[24px] border border-gray-200 bg-white p-5 shadow-[0_20px_60px_-42px_rgba(15,23,42,0.16)]">
                            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-gray-400">
                              Locked workspace identity
                            </p>
                            <div className="mt-4 space-y-2">
                              <label className="text-[11px] font-black uppercase tracking-[0.22em] text-gray-400">
                                Email address
                              </label>
                              <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-gray-400 ring-1 ring-gray-200">
                                  <Mail className="h-4 w-4" />
                                </div>
                                <input
                                  type="email"
                                  value={user?.email || ''}
                                  disabled
                                  className="w-full cursor-not-allowed border-0 bg-transparent p-0 text-sm font-semibold text-gray-400 outline-none"
                                />
                                <div className="inline-flex items-center gap-1 rounded-full bg-gray-200 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-gray-600">
                                  <Lock className="h-3 w-3" />
                                  Locked
                                </div>
                              </div>
                            </div>
                            <p className="mt-3 text-sm font-medium leading-6 text-gray-500">
                              Your email is managed by the workspace administrator to keep login identity consistent.
                            </p>
                          </section>
                        </div>

                        <div className="space-y-5">
                          <section className="rounded-[24px] border border-emerald-100 bg-emerald-50/70 p-5">
                            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-emerald-600">
                              Account summary
                            </p>
                            <div className="mt-4 space-y-4">
                              <div>
                                <p className="text-xs font-bold uppercase tracking-wide text-emerald-700/70">Display name</p>
                                <p className="mt-1 text-sm font-black text-emerald-950">{user?.name || 'Not set'}</p>
                              </div>
                              <div>
                                <p className="text-xs font-bold uppercase tracking-wide text-emerald-700/70">Role</p>
                                <p className="mt-1 text-sm font-black text-emerald-950">{roleLabel}</p>
                              </div>
                              <div>
                                <p className="text-xs font-bold uppercase tracking-wide text-emerald-700/70">Account email</p>
                                <p className="mt-1 break-all text-sm font-semibold text-emerald-950">{user?.email || 'Unavailable'}</p>
                              </div>
                            </div>
                          </section>

                          <section className="rounded-[24px] border border-gray-200 bg-gray-50/80 p-5">
                            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-gray-400">
                              Best practice
                            </p>
                            <ul className="mt-4 space-y-3 text-sm font-medium leading-6 text-gray-600">
                              <li className="flex gap-2">
                                <Check className="mt-1 h-4 w-4 shrink-0 text-emerald-500" />
                                Keep your name aligned with your official workspace record.
                              </li>
                              <li className="flex gap-2">
                                <Check className="mt-1 h-4 w-4 shrink-0 text-emerald-500" />
                                Add a valid phone number for faster internal coordination.
                              </li>
                              <li className="flex gap-2">
                                <Check className="mt-1 h-4 w-4 shrink-0 text-emerald-500" />
                                Use a clear username that teammates can recognize quickly.
                              </li>
                            </ul>
                          </section>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-5">
                          <section className="rounded-[24px] border border-gray-200 bg-white p-5 shadow-[0_20px_60px_-42px_rgba(15,23,42,0.16)]">
                            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-violet-500">
                              Password update
                            </p>
                            <div className="mt-5 space-y-4">
                              <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase tracking-[0.22em] text-gray-400">
                                  New password
                                </label>
                                <div className="group flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50/70 px-4 py-3 transition-all focus-within:border-violet-300 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(139,92,246,0.08)]">
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-gray-400 ring-1 ring-gray-200">
                                    <KeyRound className="h-4 w-4" />
                                  </div>
                                  <input
                                    {...register('password')}
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className="w-full border-0 bg-transparent p-0 text-sm font-semibold text-gray-900 outline-none placeholder:text-gray-400"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                                  >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </button>
                                </div>
                                {errors.password ? (
                                  <p className="text-[11px] font-semibold text-rose-500">{errors.password.message}</p>
                                ) : null}
                              </div>

                              <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase tracking-[0.22em] text-gray-400">
                                  Confirm password
                                </label>
                                <div className="group flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50/70 px-4 py-3 transition-all focus-within:border-violet-300 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(139,92,246,0.08)]">
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-gray-400 ring-1 ring-gray-200">
                                    <Lock className="h-4 w-4" />
                                  </div>
                                  <input
                                    {...register('confirmPassword')}
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className="w-full border-0 bg-transparent p-0 text-sm font-semibold text-gray-900 outline-none placeholder:text-gray-400"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                                  >
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </button>
                                </div>
                                {errors.confirmPassword ? (
                                  <p className="text-[11px] font-semibold text-rose-500">{errors.confirmPassword.message}</p>
                                ) : null}
                              </div>
                            </div>
                          </section>

                          <section className="rounded-[24px] border border-violet-100 bg-violet-50/60 p-5">
                            <div className="flex items-center justify-between gap-4">
                              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-violet-600">
                                Password strength
                              </p>
                              <span
                                className={`text-xs font-black uppercase tracking-wide ${
                                  passwordStrength.score > 2
                                    ? 'text-emerald-600'
                                    : passwordStrength.score > 1
                                      ? 'text-amber-500'
                                      : 'text-rose-500'
                                }`}
                              >
                                {passwordVal ? passwordStrength.label : 'Add a password'}
                              </span>
                            </div>

                            <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-white">
                              <div
                                className={`transition-all duration-300 ${
                                  passwordVal ? passwordStrength.color : 'bg-gray-200'
                                }`}
                                style={{ width: `${passwordVal ? Math.max(passwordStrength.score * 25, 8) : 18}%` }}
                              />
                            </div>

                            <ul className="mt-5 grid gap-2 text-sm font-medium text-violet-950/80 sm:grid-cols-2">
                              <li className="flex items-center gap-2">
                                <Check className={`h-4 w-4 ${passwordVal.length >= 8 ? 'text-emerald-500' : 'text-gray-300'}`} />
                                Minimum 8 characters
                              </li>
                              <li className="flex items-center gap-2">
                                <Check className={`h-4 w-4 ${/[0-9]/.test(passwordVal) ? 'text-emerald-500' : 'text-gray-300'}`} />
                                Includes a number
                              </li>
                              <li className="flex items-center gap-2">
                                <Check className={`h-4 w-4 ${/[A-Z]/.test(passwordVal) && /[a-z]/.test(passwordVal) ? 'text-emerald-500' : 'text-gray-300'}`} />
                                Upper and lowercase
                              </li>
                              <li className="flex items-center gap-2">
                                <Check className={`h-4 w-4 ${/[^A-Za-z0-9]/.test(passwordVal) ? 'text-emerald-500' : 'text-gray-300'}`} />
                                Special character
                              </li>
                            </ul>
                          </section>
                        </div>

                        <div className="space-y-5">
                          <section className="rounded-[24px] border border-gray-200 bg-gray-50/80 p-5">
                            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-gray-400">
                              Security checklist
                            </p>
                            <ul className="mt-4 space-y-3 text-sm font-medium leading-6 text-gray-600">
                              <li className="flex gap-2">
                                <Shield className="mt-1 h-4 w-4 shrink-0 text-violet-500" />
                                Avoid reusing passwords from personal apps or other work accounts.
                              </li>
                              <li className="flex gap-2">
                                <Shield className="mt-1 h-4 w-4 shrink-0 text-violet-500" />
                                Update your password immediately if you suspect account sharing or exposure.
                              </li>
                              <li className="flex gap-2">
                                <Shield className="mt-1 h-4 w-4 shrink-0 text-violet-500" />
                                Strong passwords reduce the risk of unauthorized workspace access.
                              </li>
                            </ul>
                          </section>

                          <section className="rounded-[24px] border border-violet-100 bg-violet-50/60 p-5">
                            <div className="flex items-start gap-3">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-violet-600 ring-1 ring-violet-100">
                                <KeyRound className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="text-sm font-black text-gray-900">Secure your access</p>
                                <p className="mt-2 text-sm font-medium leading-6 text-gray-600">
                                  A strong password is the simplest way to protect revenue, approvals, and lead activity tied to your account.
                                </p>
                              </div>
                            </div>
                          </section>
                        </div>
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="shrink-0 border-t border-gray-100 bg-white px-5 py-4 sm:px-7">
                <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:items-center sm:justify-end">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-600 transition-all hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-black text-white shadow-[0_12px_30px_-12px_rgba(16,185,129,0.65)] transition-all hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? 'Saving changes...' : activeTab === 'security' ? 'Update security' : 'Save profile'}
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

export default UserProfileModal;
