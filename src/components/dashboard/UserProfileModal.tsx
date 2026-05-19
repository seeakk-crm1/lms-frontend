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
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ open, onClose }) => {
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
      setActiveTab('profile');
    }
  }, [open, user, reset]);

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
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-md"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="flex w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-gray-150 bg-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] md:max-h-[85vh]"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Header / Banner Grid */}
            <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-8 text-white md:px-10 md:py-10">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-teal-400/20 blur-2xl" />
              
              <button
                type="button"
                onClick={handleClose}
                className="absolute right-4 top-4 rounded-full bg-black/10 p-2 text-white/80 hover:bg-black/20 hover:text-white transition-colors"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex flex-col items-center gap-4 sm:flex-row">
                <div className="relative">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/15 text-2xl font-black text-white shadow-lg backdrop-blur-md border border-white/20">
                    {initials}
                  </div>
                  <div className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white bg-green-500" />
                </div>
                <div className="text-center sm:text-left">
                  <h2 className="text-2xl font-extrabold tracking-tight">{user?.name || 'User Profile'}</h2>
                  <p className="text-sm font-semibold text-emerald-100 mt-0.5">{user?.email}</p>
                  <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white backdrop-blur-sm">
                    <Shield className="h-3 w-3" />
                    {getPrimaryRoleName(user)}
                  </div>
                </div>
              </div>
            </div>

            {/* Custom Tab Bar */}
            <div className="flex border-b border-gray-100 bg-gray-50/50 px-6 md:px-10">
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className="relative py-4 text-sm font-bold transition-colors outline-none mr-8"
                style={{ color: activeTab === 'profile' ? '#10b981' : '#6b7280' }}
              >
                <span className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4" />
                  Profile Details
                </span>
                {activeTab === 'profile' && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500"
                  />
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('security')}
                className="relative py-4 text-sm font-bold transition-colors outline-none"
                style={{ color: activeTab === 'security' ? '#10b981' : '#6b7280' }}
              >
                <span className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4" />
                  Change Password
                </span>
                {activeTab === 'security' && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500"
                  />
                )}
              </button>
            </div>

            {/* Form Section */}
            <form onSubmit={submitHandler} className="flex-1 overflow-y-auto p-6 md:p-10">
              {activeTab === 'profile' ? (
                <div className="space-y-6">
                  {/* Name field */}
                  <div>
                    <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-gray-400">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
                        <UserIcon className="h-4 w-4" />
                      </div>
                      <input
                        {...register('name')}
                        type="text"
                        placeholder="John Doe"
                        className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 pl-11 pr-4 py-3 text-sm font-semibold text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                      />
                    </div>
                    {errors.name && (
                      <p className="mt-2 text-xs font-bold text-rose-500">{errors.name.message}</p>
                    )}
                  </div>

                  {/* Username Field */}
                  <div>
                    <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-gray-400">
                      Username
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
                        <span className="text-sm font-bold">@</span>
                      </div>
                      <input
                        {...register('username')}
                        type="text"
                        placeholder="johndoe"
                        className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 pl-11 pr-4 py-3 text-sm font-semibold text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                      />
                    </div>
                    {errors.username && (
                      <p className="mt-2 text-xs font-bold text-rose-500">{errors.username.message}</p>
                    )}
                  </div>

                  {/* Phone Field */}
                  <div>
                    <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-gray-400">
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
                        <Phone className="h-4 w-4" />
                      </div>
                      <input
                        {...register('phone')}
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 pl-11 pr-4 py-3 text-sm font-semibold text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-2 text-xs font-bold text-rose-500">{errors.phone.message}</p>
                    )}
                  </div>

                  {/* Email Field (Locked/Readonly) */}
                  <div>
                    <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-gray-400">
                      Email Address (Locked)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
                        <Mail className="h-4 w-4" />
                      </div>
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full cursor-not-allowed rounded-2xl border border-gray-200 bg-gray-100 pl-11 pr-4 py-3 text-sm font-semibold text-gray-500 outline-none"
                      />
                    </div>
                    <p className="mt-2 text-[11px] font-semibold text-gray-400">
                      Registered email is managed by your workspace administrator.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* New Password */}
                  <div>
                    <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-gray-400">
                      New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
                        <Lock className="h-4 w-4" />
                      </div>
                      <input
                        {...register('password')}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 pl-11 pr-12 py-3 text-sm font-semibold text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-2 text-xs font-bold text-rose-500">{errors.password.message}</p>
                    )}
                  </div>

                  {/* Password Strength Indicator */}
                  {passwordVal && (
                    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                      <div className="flex items-center justify-between text-xs font-bold text-gray-500 mb-2">
                        <span>Password Strength</span>
                        <span style={{ color: passwordStrength.score > 2 ? '#10b981' : passwordStrength.score > 1 ? '#f59e0b' : '#ef4444' }}>
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden flex gap-1">
                        <div className={`h-full flex-1 transition-colors ${passwordStrength.score >= 1 ? passwordStrength.color : 'bg-gray-200'}`} />
                        <div className={`h-full flex-1 transition-colors ${passwordStrength.score >= 2 ? passwordStrength.color : 'bg-gray-200'}`} />
                        <div className={`h-full flex-1 transition-colors ${passwordStrength.score >= 3 ? passwordStrength.color : 'bg-gray-200'}`} />
                        <div className={`h-full flex-1 transition-colors ${passwordStrength.score >= 4 ? passwordStrength.color : 'bg-gray-200'}`} />
                      </div>
                      <ul className="mt-3 space-y-1 text-[11px] font-semibold text-gray-400">
                        <li className="flex items-center gap-1.5">
                          <Check className={`h-3.5 w-3.5 ${passwordVal.length >= 8 ? 'text-emerald-500' : 'text-gray-300'}`} />
                          At least 8 characters long
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className={`h-3.5 w-3.5 ${/[0-9]/.test(passwordVal) ? 'text-emerald-500' : 'text-gray-300'}`} />
                          Contains a number
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className={`h-3.5 w-3.5 ${/[A-Z]/.test(passwordVal) && /[a-z]/.test(passwordVal) ? 'text-emerald-500' : 'text-gray-300'}`} />
                          Contains both uppercase and lowercase letters
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className={`h-3.5 w-3.5 ${/[^A-Za-z0-9]/.test(passwordVal) ? 'text-emerald-500' : 'text-gray-300'}`} />
                          Contains a special character
                        </li>
                      </ul>
                    </div>
                  )}

                  {/* Confirm Password */}
                  <div>
                    <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-gray-400">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
                        <Lock className="h-4 w-4" />
                      </div>
                      <input
                        {...register('confirmPassword')}
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 pl-11 pr-12 py-3 text-sm font-semibold text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-2 text-xs font-bold text-rose-500">{errors.confirmPassword.message}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end border-t border-gray-100 pt-6">
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-2xl border border-gray-200 px-6 py-3 text-sm font-bold text-gray-600 transition-colors hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-black text-white shadow-[0_18px_40px_-18px_rgba(16,185,129,0.8)] transition-all hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.98]"
                >
                  {isSubmitting ? 'Saving Changes...' : 'Save Profile'}
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
