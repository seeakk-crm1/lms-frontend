import React, { useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2, Loader2, Save, X } from 'lucide-react';
import { Country, State, City } from 'country-state-city';
import type {
  Office,
  OfficeFormValues,
} from '../../../types/admin/office/office.types';

const schema = z.object({
  name: z.string().trim().min(1, 'Office name is required').max(100, 'Office name too long'),
  address: z.string().optional(),
  country: z.string().trim().optional(),
  state: z.string().trim().optional(),
  district: z.string().trim().optional(),
  city: z.string().trim().optional(),
  isActive: z.boolean(),
});

interface Props {
  isOpen: boolean;
  office: Office | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: OfficeFormValues) => Promise<void> | void;
}

const OfficeFormModal: React.FC<Props> = ({
  isOpen,
  office,
  isSubmitting,
  onClose,
  onSubmit,
}) => {
  const {
    control,
    register,
    setValue,
    watch,
    reset,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<OfficeFormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      address: '',
      country: '',
      state: '',
      district: '',
      city: '',
      isActive: true,
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    reset({
      name: office?.name || '',
      address: office?.address || '',
      country: office?.country || '',
      state: office?.state || '',
      district: office?.district || '',
      city: office?.city || '',
      isActive: office?.isActive ?? true,
    });
  }, [isOpen, office, reset]);

  const selectedCountryCode = watch('country');
  const selectedStateCode = watch('state');

  const countries = useMemo(() => Country.getAllCountries(), []);
  const states = useMemo(() => selectedCountryCode ? State.getStatesOfCountry(selectedCountryCode) : [], [selectedCountryCode]);
  const cities = useMemo(() => selectedCountryCode && selectedStateCode ? City.getCitiesOfState(selectedCountryCode, selectedStateCode) : [], [selectedCountryCode, selectedStateCode]);

  const handleCountryChange = (value: string) => {
    setValue('country', value, { shouldValidate: true, shouldDirty: true });
    setValue('state', '', { shouldValidate: true, shouldDirty: true });
    setValue('city', '', { shouldValidate: true, shouldDirty: true });
  };

  const handleStateChange = (value: string) => {
    setValue('state', value, { shouldValidate: true, shouldDirty: true });
    setValue('city', '', { shouldValidate: true, shouldDirty: true });
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            aria-label="Close modal overlay"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-4xl rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl border border-gray-100 overflow-hidden h-[95vh] sm:max-h-[92vh] sm:h-auto flex flex-col"
          >
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-gray-900">
                    {office ? 'Edit Office Location' : 'Add Office Location'}
                  </h2>
                  <p className="text-xs text-gray-500 font-semibold mt-1">
                    Configure office hierarchy and status.
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-black text-gray-500 hover:bg-gray-50 shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit(async (values) => {
                await onSubmit({
                  name: values.name.trim(),
                  address: values.address?.trim(),
                  country: values.country,
                  state: values.state,
                  district: values.district,
                  city: values.city,
                  isActive: values.isActive,
                });
              })}
              className="p-4 sm:p-6 space-y-5 overflow-y-auto custom-scrollbar"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-gray-400 font-black">Office Name</label>
                  <input
                    {...register('name')}
                    placeholder="Main Branch"
                    className={`w-full mt-1 px-3 py-2.5 rounded-xl border bg-gray-50 text-base sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${
                      errors.name ? 'border-red-200' : 'border-gray-200'
                    }`}
                  />
                  {errors.name ? <p className="text-[11px] text-red-600 font-bold mt-1">{errors.name.message}</p> : null}
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest text-gray-400 font-black">Address</label>
                  <input
                    {...register('address')}
                    placeholder="Street / Landmark"
                    className="w-full mt-1 px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-base sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-gray-400 font-black">Country</label>
                  <motion.select
                    value={selectedCountryCode}
                    onChange={(event) => handleCountryChange(event.target.value)}
                    initial={{ opacity: 0.9 }}
                    animate={{ opacity: 1 }}
                    className={`w-full mt-1 px-3 py-2.5 rounded-xl border bg-gray-50 text-base sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${
                      errors.country ? 'border-red-200' : 'border-gray-200'
                    }`}
                  >
                    <option value="">Select country</option>
                    {countries.map((item) => (
                      <option key={item.isoCode} value={item.isoCode}>
                        {item.name}
                      </option>
                    ))}
                  </motion.select>
                  {errors.country ? <p className="text-[11px] text-red-600 font-bold mt-1">{errors.country.message}</p> : null}
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest text-gray-400 font-black">State</label>
                  <motion.select
                    value={selectedStateCode}
                    onChange={(event) => handleStateChange(event.target.value)}
                    initial={{ opacity: 0.9 }}
                    animate={{ opacity: 1 }}
                    disabled={!selectedCountryCode}
                    className={`w-full mt-1 px-3 py-2.5 rounded-xl border bg-gray-50 text-base sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-60 ${
                      errors.state ? 'border-red-200' : 'border-gray-200'
                    }`}
                  >
                    <option value="">Select state</option>
                    {states.map((item) => (
                      <option key={item.isoCode} value={item.isoCode}>
                        {item.name}
                      </option>
                    ))}
                  </motion.select>
                  {errors.state ? <p className="text-[11px] text-red-600 font-bold mt-1">{errors.state.message}</p> : null}
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest text-gray-400 font-black">City</label>
                  <motion.select
                    {...register('city')}
                    initial={{ opacity: 0.9 }}
                    animate={{ opacity: 1 }}
                    disabled={!selectedStateCode}
                    className={`w-full mt-1 px-3 py-2.5 rounded-xl border bg-gray-50 text-base sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-60 ${
                      errors.city ? 'border-red-200' : 'border-gray-200'
                    }`}
                  >
                    <option value="">Select city</option>
                    {cities.map((item) => (
                      <option key={item.name} value={item.name}>
                        {item.name}
                      </option>
                    ))}
                  </motion.select>
                  {errors.city ? <p className="text-[11px] text-red-600 font-bold mt-1">{errors.city.message}</p> : null}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-gray-400 font-black">Status</label>
                  <div className="mt-1 p-1 rounded-xl border border-gray-200 bg-gray-50 flex gap-1">
                    <Controller
                      control={control}
                      name="isActive"
                      render={({ field }) => (
                        <>
                          <button
                            type="button"
                            onClick={() => field.onChange(true)}
                            className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${
                              field.value ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500'
                            }`}
                          >
                            Active
                          </button>
                          <button
                            type="button"
                            onClick={() => field.onChange(false)}
                            className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${
                              !field.value ? 'bg-white text-amber-600 shadow-sm' : 'text-gray-500'
                            }`}
                          >
                            Inactive
                          </button>
                        </>
                      )}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-1 flex flex-col sm:flex-row gap-3 sticky bottom-0 bg-white pb-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:flex-1 py-3 rounded-xl border border-gray-200 text-sm font-black text-gray-500 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ y: -1, boxShadow: '0 10px 20px -12px rgba(16, 185, 129, 0.55)' }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={isSubmitting || !isValid}
                  className="w-full sm:flex-1 py-3 rounded-xl bg-emerald-500 text-white text-sm font-black hover:bg-emerald-600 inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {office ? 'Update Office' : 'Create Office'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
};

export default React.memo(OfficeFormModal);
