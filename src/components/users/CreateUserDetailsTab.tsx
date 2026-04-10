import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Controller, useFormContext } from 'react-hook-form';
import { DEFAULT_PHONE_COUNTRY, getPhoneFlag, PHONE_COUNTRIES, type PhoneCountry } from '../../constants/phoneCountries';
import type { UserFormData } from './CreateUserModal.types';

interface CreateUserDetailsTabProps {
  countries: any[];
  states: any[];
  districts: any[];
  selectedUserId: string | null | undefined;
  selectedPhoneCountry: PhoneCountry;
  setSelectedPhoneCountry: React.Dispatch<React.SetStateAction<PhoneCountry>>;
  showPassword: boolean;
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
  detailsTabErrorCount: number;
  getFieldClassName: (hasError?: boolean) => string;
  getSelectClassName: (hasError?: boolean) => string;
  renderFieldError: (message?: string) => React.ReactNode;
  normalizePhoneDigitsForCountry: (value: string, country: PhoneCountry) => string;
  toE164PhoneNumber: (digits: string, country: PhoneCountry) => string;
  formatPhoneInputValue: (value: string, country: PhoneCountry) => string;
  getPhoneValidationMessage: (value: string, country: PhoneCountry) => string | true;
}

const CreateUserDetailsTab: React.FC<CreateUserDetailsTabProps> = ({
  countries,
  states,
  districts,
  selectedUserId,
  selectedPhoneCountry,
  setSelectedPhoneCountry,
  showPassword,
  setShowPassword,
  detailsTabErrorCount,
  getFieldClassName,
  getSelectClassName,
  renderFieldError,
  normalizePhoneDigitsForCountry,
  toE164PhoneNumber,
  formatPhoneInputValue,
  getPhoneValidationMessage,
}) => {
  const {
    register,
    control,
    watch,
    formState: { errors },
  } = useFormContext<UserFormData>();

  const password = watch('password');
  const countryId = watch('countryId');
  const stateId = watch('stateId');

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
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phone</label>
          <Controller
            name="phone"
            control={control}
            rules={{
              validate: (value) => getPhoneValidationMessage(value, selectedPhoneCountry),
            }}
            render={({ field }) => {
              const displayValue = formatPhoneInputValue(field.value || '', selectedPhoneCountry);
              const validationState = getPhoneValidationMessage(field.value || '', selectedPhoneCountry);
              const hasPhoneValue = Boolean((field.value || '').trim());
              const isPhoneValid = hasPhoneValue && validationState === true;

              return (
                <div className="space-y-1.5">
                  <div className={`flex min-w-0 flex-col sm:flex-row rounded-xl ${Boolean(errors.phone) ? 'ring-2 ring-rose-500/10' : ''}`}>
                    <select
                      value={selectedPhoneCountry.iso}
                      onChange={(event) => {
                        const nextCountry =
                          PHONE_COUNTRIES.find((country) => country.iso === event.target.value) || DEFAULT_PHONE_COUNTRY;
                        const currentDigits = normalizePhoneDigitsForCountry(field.value || '', selectedPhoneCountry);
                        setSelectedPhoneCountry(nextCountry);
                        field.onChange(toE164PhoneNumber(currentDigits, nextCountry));
                      }}
                      className={`w-full shrink-0 rounded-t-xl sm:w-[128px] sm:rounded-l-xl sm:rounded-tr-none border-b-0 sm:border-b sm:border-r-0 px-3 py-2.5 text-sm font-semibold outline-none transition-all ${
                        errors.phone
                          ? 'border border-rose-300 bg-rose-50 text-rose-900'
                          : 'border border-gray-100 bg-gray-50 text-gray-900'
                      }`}
                      aria-label="Phone country code"
                    >
                      {PHONE_COUNTRIES.map((country) => (
                        <option key={country.iso} value={country.iso}>
                          {getPhoneFlag(country.iso)} {country.dialCode}
                        </option>
                      ))}
                    </select>
                    <input
                      value={displayValue}
                      onChange={(event) => {
                        const nextDigits = normalizePhoneDigitsForCountry(event.target.value, selectedPhoneCountry);
                        field.onChange(toE164PhoneNumber(nextDigits, selectedPhoneCountry));
                      }}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                      inputMode="tel"
                      autoComplete="tel"
                      className={`${getFieldClassName(Boolean(errors.phone))} w-full rounded-b-xl sm:rounded-r-xl sm:rounded-bl-none border-t-0 sm:border-t sm:border-l-0 min-w-0 flex-1`}
                      placeholder={`Enter phone number (${selectedPhoneCountry.placeholder})`}
                      aria-invalid={Boolean(errors.phone)}
                    />
                  </div>
                  {!errors.phone ? (
                    <p className={`text-[11px] font-semibold ${isPhoneValid ? 'text-emerald-600' : 'text-gray-400'}`}>
                      {hasPhoneValue
                        ? isPhoneValid
                          ? `Saved as ${field.value}`
                          : `We’ll save this as ${selectedPhoneCountry.dialCode}… once it’s complete.`
                        : 'Optional. If entered, it will be stored in international format.'}
                    </p>
                  ) : null}
                  {renderFieldError(errors.phone?.message)}
                </div>
              );
            }}
          />
        </div>
      </div>

      {!selectedUserId && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5 relative">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              {...register('password', {
                required: !selectedUserId ? 'Create a password for the new user.' : false,
                validate: (value) => {
                  const trimmed = (value || '').trim();
                  if (!trimmed && selectedUserId) return true;
                  if (trimmed.length < 8) return 'Password should be at least 8 characters.';
                  if (!/[A-Z]/.test(trimmed)) return 'Include at least one uppercase letter.';
                  if (!/[a-z]/.test(trimmed)) return 'Include at least one lowercase letter.';
                  if (!/[0-9]/.test(trimmed)) return 'Include at least one number.';
                  return true;
                },
              })}
              className={getFieldClassName(Boolean(errors.password))}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-gray-400">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            {!errors.password ? (
              <p className="text-[11px] text-gray-400 font-semibold">Use 8+ characters with uppercase, lowercase, and a number.</p>
            ) : null}
            {renderFieldError(errors.password?.message)}
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Confirm Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              {...register('confirmPassword', {
                validate: (val) => {
                  if (!password && !val) return true;
                  if (!val) return 'Confirm the password so we know it was typed correctly.';
                  return val === password || 'Passwords do not match yet.';
                },
              })}
              className={getFieldClassName(Boolean(errors.confirmPassword))}
            />
            {renderFieldError(errors.confirmPassword?.message)}
          </div>
        </div>
      )}

      <div className="h-px bg-gray-100 my-2" />
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Permanent Address</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase">Country</label>
          <select {...register('countryId')} className={getSelectClassName(Boolean(errors.countryId))}>
            <option value="">Select Country</option>
            {countries.map((l: any) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
          {renderFieldError(errors.countryId?.message)}
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase">State</label>
          <select
            {...register('stateId', {
              validate: (value) => {
                if (!value) return true;
                return countryId ? true : 'Select a country before choosing a state.';
              },
            })}
            className={getSelectClassName(Boolean(errors.stateId))}
            disabled={!countryId}
          >
            <option value="">Select State</option>
            {states.map((l: any) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
          {!countryId && !errors.stateId ? (
            <p className="text-[11px] text-gray-400 font-semibold">Choose a country first to unlock states.</p>
          ) : null}
          {renderFieldError(errors.stateId?.message)}
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase">District</label>
          <select
            {...register('districtId', {
              validate: (value) => {
                if (!value) return true;
                return stateId ? true : 'Select a state before choosing a district.';
              },
            })}
            className={getSelectClassName(Boolean(errors.districtId))}
            disabled={!stateId}
          >
            <option value="">Select District</option>
            {districts.map((l: any) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
          {!stateId && !errors.districtId ? (
            <p className="text-[11px] text-gray-400 font-semibold">Choose a state first to unlock districts.</p>
          ) : null}
          {renderFieldError(errors.districtId?.message)}
        </div>
      </div>
    </div>
  );
};

export default CreateUserDetailsTab;
