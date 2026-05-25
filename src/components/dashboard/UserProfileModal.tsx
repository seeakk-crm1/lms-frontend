import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, User as UserIcon, Mail, Phone, Lock, Eye, EyeOff, KeyRound, Check, Shield } from 'lucide-react';
import { toast } from 'react-hot-toast';
import useAuthStore from '../../store/useAuthStore';
import api from '../../services/api';
import { getPrimaryRoleName } from '../../utils/permissions';

const schema = z
  .object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters'),
    username: z.string().trim().min(3, 'Username must be at least 3 characters').optional().or(z.literal('')),
    phone: z.string().trim().optional().or(z.literal('')),
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

  const passwordVal = watch('password');

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
            className="flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_24px_48px_-12px_rgba(0,0,0,0.08)] h-[80vh] max-h-[620px]"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Header Area (Minimalist & Clean) */}
            <div className="relative border-b border-gray-100 bg-gradient-to-b from-gray-50/50 to-white px-8 py-8 shrink-0">
              <button
                type="button"
                onClick={handleClose}
                className="absolute right-4 top-4 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all duration-200"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-zinc-800 to-zinc-950 text-xl font-bold text-white shadow-inner">
                    {initials}
                  </div>
                  <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-gray-900 tracking-tight">{user?.name || 'User Profile'}</h2>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{user?.email}</p>
                  <div className="mt-2 inline-flex items-center gap-1 rounded-md bg-zinc-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-zinc-700 border border-zinc-200/50">
                    {getPrimaryRoleName(user)}
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={submitHandler} className="flex-1 flex flex-col overflow-hidden">
              {/* Tabs (Minimalist border-bottom layout) */}
              <div className="flex border-b border-gray-100 bg-white px-8 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTab('profile')}
                  className="relative py-4 text-xs font-bold tracking-wider uppercase transition-colors outline-none mr-6"
                  style={{ color: activeTab === 'profile' ? '#111827' : '#9ca3af' }}
                >
                  Profile
                  {activeTab === 'profile' && (
                    <motion.div
                      layoutId="activeTabUnderline"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-zinc-900"
                    />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('security')}
                  className="relative py-4 text-xs font-bold tracking-wider uppercase transition-colors outline-none"
                  style={{ color: activeTab === 'security' ? '#111827' : '#9ca3af' }}
                >
                  Security
                  {activeTab === 'security' && (
                    <motion.div
                      layoutId="activeTabUnderline"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-zinc-900"
                    />
                  )}
                </button>
              </div>

              {/* Scrollable Form Fields */}
              <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5 custom-scrollbar">
                {activeTab === 'profile' ? (
                  <div className="space-y-5">
                    {/* Name field */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        Full Name
                      </label>
                      <input
                        {...register('name')}
                        type="text"
                        placeholder="John Doe"
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-zinc-800 focus:ring-1 focus:ring-zinc-800/10"
                      />
                      {errors.name && (
                        <p className="text-[11px] font-medium text-rose-500">{errors.name.message}</p>
                      )}
                    </div>

                    {/* Username Field */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        Username
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400 text-xs font-medium">
                          @
                        </div>
                        <input
                          {...register('username')}
                          type="text"
                          placeholder="johndoe"
                          className="w-full rounded-xl border border-gray-200 bg-white pl-8 pr-4 py-2.5 text-sm font-medium text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-zinc-800 focus:ring-1 focus:ring-zinc-800/10"
                        />
                      </div>
                      {errors.username && (
                        <p className="text-[11px] font-medium text-rose-500">{errors.username.message}</p>
                      )}
                    </div>

                    {/* Phone Field */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        Phone Number
                      </label>
                      <input
                        {...register('phone')}
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-zinc-800 focus:ring-1 focus:ring-zinc-800/10"
                      />
                      {errors.phone && (
                        <p className="text-[11px] font-medium text-rose-500">{errors.phone.message}</p>
                      )}
                    </div>

                    {/* Email Field (Locked) */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        Email Address (Locked)
                      </label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full cursor-not-allowed rounded-xl border border-gray-150 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-400 outline-none"
                      />
                      <p className="text-[10px] text-gray-400 leading-normal">
                        Managed by your workspace administrator.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {/* New Password */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          {...register('password')}
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          className="w-full rounded-xl border border-gray-200 bg-white pl-4 pr-10 py-2.5 text-sm font-medium text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-zinc-800 focus:ring-1 focus:ring-zinc-800/10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-[11px] font-medium text-rose-500">{errors.password.message}</p>
                      )}
                    </div>

                    {/* Password Strength Indicator */}
                    {passwordVal && (
                      <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 space-y-3">
                        <div className="flex items-center justify-between text-[11px] font-bold text-gray-400">
                          <span>Password Strength</span>
                          <span style={{ color: passwordStrength.score > 2 ? '#10b981' : passwordStrength.score > 1 ? '#f59e0b' : '#ef4444' }}>
                            {passwordStrength.label}
                          </span>
                        </div>
                        <div className="h-1 w-full rounded-full bg-gray-100 overflow-hidden flex gap-1">
                          <div className={`h-full flex-1 transition-colors ${passwordStrength.score >= 1 ? passwordStrength.color : 'bg-gray-100'}`} />
                          <div className={`h-full flex-1 transition-colors ${passwordStrength.score >= 2 ? passwordStrength.color : 'bg-gray-100'}`} />
                          <div className={`h-full flex-1 transition-colors ${passwordStrength.score >= 3 ? passwordStrength.color : 'bg-gray-100'}`} />
                          <div className={`h-full flex-1 transition-colors ${passwordStrength.score >= 4 ? passwordStrength.color : 'bg-gray-100'}`} />
                        </div>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[10px] font-semibold text-gray-400">
                          <li className="flex items-center gap-1">
                            <Check className={`h-3 w-3 ${passwordVal.length >= 8 ? 'text-emerald-500' : 'text-gray-300'}`} />
                            Min 8 characters
                          </li>
                          <li className="flex items-center gap-1">
                            <Check className={`h-3 w-3 ${/[0-9]/.test(passwordVal) ? 'text-emerald-500' : 'text-gray-300'}`} />
                            Includes a number
                          </li>
                          <li className="flex items-center gap-1">
                            <Check className={`h-3 w-3 ${/[A-Z]/.test(passwordVal) && /[a-z]/.test(passwordVal) ? 'text-emerald-500' : 'text-gray-300'}`} />
                            Upper & lowercase
                          </li>
                          <li className="flex items-center gap-1">
                            <Check className={`h-3 w-3 ${/[^A-Za-z0-9]/.test(passwordVal) ? 'text-emerald-500' : 'text-gray-300'}`} />
                            Special character
                          </li>
                        </ul>
                      </div>
                    )}

                    {/* Confirm Password */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <input
                          {...register('confirmPassword')}
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          className="w-full rounded-xl border border-gray-200 bg-white pl-4 pr-10 py-2.5 text-sm font-medium text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-zinc-800 focus:ring-1 focus:ring-zinc-800/10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-[11px] font-medium text-rose-500">{errors.confirmPassword.message}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons (Minimalist & High-Contrast) */}
              <div className="border-t border-gray-100 bg-gray-50/30 px-8 py-4 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end shrink-0">
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-zinc-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 transition-all duration-200 active:scale-[0.98] shadow-sm"
                >
                  {isSubmitting ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default UserProfileModal;
