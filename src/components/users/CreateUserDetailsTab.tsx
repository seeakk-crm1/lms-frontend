import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { getImageUrl } from '../../utils/getImageUrl';
import PhoneInput from '../common/PhoneInput';
import { validatePhoneStr } from '../../utils/phoneUtils';
import type { UserFormData } from './CreateUserModal.types';

import { getWorkspaceCurrencySymbol } from '../../utils/currency';

interface CreateUserDetailsTabProps {
  selectedUserId: string | null | undefined;
  detailsTabErrorCount: number;
  getFieldClassName: (hasError?: boolean) => string;
  renderFieldError: (message?: string) => React.ReactNode;
  profileImagePreviewUrl: string | null;
  handleProfileImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveProfileImage: () => void;
  isProfileImageSaving: boolean;
  profileImageInputRef: React.RefObject<HTMLInputElement | null>;
  profileImageFile: File | null;
}

const CreateUserDetailsTab: React.FC<CreateUserDetailsTabProps> = ({
  selectedUserId,
  detailsTabErrorCount,
  getFieldClassName,
  renderFieldError,
  profileImagePreviewUrl,
  handleProfileImageChange,
  handleRemoveProfileImage,
  isProfileImageSaving,
  profileImageInputRef,
  profileImageFile,
}) => {
  const {
    register,
    control,
    watch,
    formState: { errors },
  } = useFormContext<UserFormData>();

  return (
    <div className="space-y-6">
      {detailsTabErrorCount > 0 ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3">
          <p className="text-sm font-black text-rose-700">Please review the highlighted fields before continuing.</p>
          <p className="mt-1 text-xs font-semibold text-rose-600">
            We have marked the inputs that need attention and moved you to the right section automatically.
          </p>
        </div>
      ) : null}

      <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="relative h-28 w-28 shrink-0 rounded-full border-4 border-white bg-gray-50 shadow-md overflow-hidden flex items-center justify-center text-4xl font-bold text-gray-400">
            {profileImagePreviewUrl || getImageUrl(watch('profileImageUrl')) ? (
              <img
                src={profileImagePreviewUrl || getImageUrl(watch('profileImageUrl'))}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            ) : (
              (watch('name') || 'User').charAt(0).toUpperCase()
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-black text-gray-900">Profile Image</h3>
            <p className="mt-1 text-sm font-semibold text-gray-500">
              JPG, PNG, or WEBP up to 20 MB. Images are optimized automatically.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <input
                ref={profileImageInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
                onChange={handleProfileImageChange}
              />
              <button
                type="button"
                onClick={() => profileImageInputRef.current?.click()}
                disabled={isProfileImageSaving}
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-2 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-600 disabled:cursor-wait disabled:opacity-60"
              >
                <span className="h-4 w-4 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path><path d="M12 12v9"></path><path d="m16 16-4-4-4 4"></path></svg>
                </span>
                {watch('profileImageUrl') || profileImageFile ? 'Change Image' : 'Upload'}
              </button>
              {(watch('profileImageUrl') || profileImageFile) && (
                <button
                  type="button"
                  onClick={handleRemoveProfileImage}
                  disabled={isProfileImageSaving}
                  className="inline-flex items-center gap-2 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-2 text-xs font-black uppercase tracking-wider text-rose-600 transition-all hover:bg-rose-100 disabled:cursor-wait disabled:opacity-60"
                >
                  <span className="h-4 w-4 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                  </span>
                  Remove Image
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Full Name</label>
          <input
            {...register('name', {
              required: 'Enter the user’s full name.',
              validate: (value) => {
                const trimmed = value.trim();
                if (trimmed.length < 2) return 'Full name should be at least 2 characters.';
                if (!/^[a-zA-Z\s.'-]+$/.test(trimmed)) return 'Use letters and common name characters only.';
                return true;
              },
            })}
            className={getFieldClassName(Boolean(errors.name))}
            placeholder="John Doe"
          />
          {renderFieldError(errors.name?.message)}
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Username</label>
          <input
            {...register('username', {
              validate: (value) => {
                const trimmed = value.trim();
                if (!trimmed) return true;
                if (trimmed.length < 3) return 'Username should be at least 3 characters.';
                if (trimmed.length > 30) return 'Username should stay under 30 characters.';
                if (!/^[a-zA-Z0-9._-]+$/.test(trimmed)) return 'Use letters, numbers, dots, hyphens, or underscores only.';
                return true;
              },
            })}
            className={getFieldClassName(Boolean(errors.username))}
            placeholder="johndoe123"
          />
          {!errors.username ? (
            <p className="text-[11px] text-gray-400 font-semibold">Optional. Helpful when the team signs in with short handles.</p>
          ) : null}
          {renderFieldError(errors.username?.message)}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
          <input
            {...register('email', {
              required: 'Enter a work email address.',
              validate: (value) => {
                const trimmed = value.trim();
                if (!trimmed) return 'Enter a work email address.';
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return 'Enter a valid email like name@company.com.';
                return true;
              },
            })}
            className={getFieldClassName(Boolean(errors.email))}
            placeholder="john@company.com"
          />
          {renderFieldError(errors.email?.message)}
          {!selectedUserId && !errors.email ? (
            <p className="text-[11px] text-gray-400 font-semibold">
              An invitation email will be sent so the user can set their own password.
            </p>
          ) : null}
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phone</label>
          <Controller
            name="phone"
            control={control}
            rules={{
              validate: (value) => {
                if (!value) return true;
                const res = validatePhoneStr(value);
                return res.isValid ? true : (res.message || 'Invalid phone number');
              }
            }}
            render={({ field }) => (
              <div className="space-y-1.5">
                <PhoneInput
                  value={field.value || ''}
                  onChange={field.onChange}
                  error={Boolean(errors.phone)}
                />
                {!errors.phone ? (
                  <p className="text-[11px] font-semibold text-gray-400">
                    Optional. If entered, it will be stored in international format.
                  </p>
                ) : null}
                {renderFieldError(errors.phone?.message as string)}
              </div>
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Monthly Salary</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">{getWorkspaceCurrencySymbol()}</span>
            <input
              type="number"
              step="0.01"
              min="0"
              {...register('monthlySalary', {
                valueAsNumber: true,
                validate: (value) => {
                  if (value !== undefined && value !== null && (value as any) === '') return true;
                  if (value !== undefined && value !== null && Number(value) < 0) return 'Monthly salary cannot be negative.';
                  return true;
                },
              })}
              className={`${getFieldClassName(Boolean(errors.monthlySalary))} pl-8`}
              placeholder="0.00"
            />
          </div>
          <p className="text-[11px] font-semibold text-gray-400">Base monthly salary for HR payroll calculations.</p>
          {renderFieldError(errors.monthlySalary?.message)}
        </div>
      </div>

    </div>
  );
};

export default CreateUserDetailsTab;
