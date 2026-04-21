import React, { useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2, Loader2, Save, X } from 'lucide-react';
import type {
  LocationOption,
  Office,
  OfficeFormValues,
} from '../../../types/admin/office/office.types';

const toTitle = (value: string) =>
  value
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const schema = z.object({
  name: z.string().trim().min(1, 'Office name is required').max(100, 'Office name too long'),
  address: z.string().optional(),
  countryId: z.string().trim().min(1, 'Country is required'),
  stateId: z.string().trim().min(1, 'Level 1 location is required'),
  districtId: z.string().trim().min(1, 'Deepest location is required'),
  isActive: z.boolean(),
});

interface Props {
  isOpen: boolean;
  office: Office | null;
  isSubmitting: boolean;
  locations: LocationOption[];
  onClose: () => void;
  onSubmit: (payload: OfficeFormValues) => Promise<void> | void;
}

const OfficeFormModal: React.FC<Props> = ({
  isOpen,
  office,
  isSubmitting,
  locations,
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
      countryId: '',
      stateId: '',
      districtId: '',
      isActive: true,
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    reset({
      name: office?.name || '',
      address: office?.address || '',
      countryId: office?.countryId || '',
      stateId: office?.stateId || '',
      districtId: office?.districtId || '',
      isActive: office?.isActive ?? true,
    });
  }, [isOpen, office, reset]);

  const countryId = watch('countryId');
  const stateId = watch('stateId');
  const districtId = watch('districtId');

  const locationById = useMemo(
    () => new Map(locations.map((item) => [item.id, item])),
    [locations],
  );

  const countries = useMemo(
    () => locations.filter((item) => item.type === 'COUNTRY'),
    [locations],
  );

  const countryLocations = useMemo(
    () => locations.filter((item) => item.countryId === countryId),
    [locations, countryId],
  );

  const levelOrders = useMemo(
    () =>
      Array.from(
        new Set(
          countryLocations
            .map((item) => item.level?.levelOrder)
            .filter((value): value is number => Boolean(value)),
        ),
      ).sort((left, right) => left - right),
    [countryLocations],
  );

  const levelLabelByOrder = useMemo(() => {
    const result = new Map<number, string>();
    levelOrders.forEach((order) => {
      const source = countryLocations.find((item) => item.level?.levelOrder === order);
      if (source?.level?.levelName) result.set(order, source.level.levelName);
    });
    return result;
  }, [countryLocations, levelOrders]);

  const getPathFromLocation = (selectedId?: string): string[] => {
    if (!countryId || !selectedId) return [];

    const path: string[] = [];
    let current = locationById.get(selectedId);

    while (current) {
      if (current.countryId !== countryId) break;
      if (current.type !== 'COUNTRY') path.unshift(current.id);
      if (!current.parentId || current.parentId === countryId) break;
      current = locationById.get(current.parentId);
    }

    return path;
  };

  const selectedPath = useMemo(() => {
    if (!countryId) return [];
    const fromDeepest = getPathFromLocation(districtId);
    if (fromDeepest.length > 0) return fromDeepest;
    return getPathFromLocation(stateId);
  }, [countryId, districtId, stateId, locationById]);

  const levelConfigs = useMemo(() => {
    if (!countryId) return [];

    const configs: Array<{ order: number; label: string; options: LocationOption[]; value: string }> = [];
    let parentId = countryId;

    for (let index = 0; index < levelOrders.length; index += 1) {
      const order = levelOrders[index];
      const options = countryLocations.filter(
        (item) => item.level?.levelOrder === order && item.parentId === parentId,
      );
      const value = selectedPath[index] || '';

      configs.push({
        order,
        label: levelLabelByOrder.get(order) || toTitle(options[0]?.type || `Level ${order}`),
        options,
        value,
      });

      if (!value) break;
      parentId = value;
    }

    return configs;
  }, [countryId, countryLocations, levelLabelByOrder, levelOrders, selectedPath]);

  const handleCountryChange = (value: string) => {
    setValue('countryId', value, { shouldValidate: true, shouldDirty: true });
    setValue('stateId', '', { shouldValidate: true, shouldDirty: true });
    setValue('districtId', '', { shouldValidate: true, shouldDirty: true });
  };

  const handleLevelChange = (index: number, value: string) => {
    const nextPath = selectedPath.slice(0, index);
    if (value) nextPath.push(value);

    setValue('stateId', nextPath[0] || '', { shouldValidate: true, shouldDirty: true });
    setValue('districtId', nextPath.length > 0 ? nextPath[nextPath.length - 1] : '', {
      shouldValidate: true,
      shouldDirty: true,
    });
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
                  countryId: values.countryId,
                  stateId: values.stateId,
                  districtId: values.districtId,
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

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-gray-400 font-black">Country</label>
                  <motion.select
                    key={`country-${countryId}`}
                    value={countryId}
                    onChange={(event) => handleCountryChange(event.target.value)}
                    initial={{ opacity: 0.9 }}
                    animate={{ opacity: 1 }}
                    className={`w-full mt-1 px-3 py-2.5 rounded-xl border bg-gray-50 text-base sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${
                      errors.countryId ? 'border-red-200' : 'border-gray-200'
                    }`}
                  >
                    <option value="">Select country</option>
                    {countries.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </motion.select>
                  {errors.countryId ? <p className="text-[11px] text-red-600 font-bold mt-1">{errors.countryId.message}</p> : null}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {levelConfigs.map((level, index) => {
                  const fieldError = index === 0 ? errors.stateId : index === levelConfigs.length - 1 ? errors.districtId : undefined;
                  return (
                    <div key={`level-${level.order}`}>
                      <label className="text-[10px] uppercase tracking-widest text-gray-400 font-black">{level.label}</label>
                      <motion.select
                        key={`level-select-${level.order}-${countryId}`}
                        value={level.value}
                        onChange={(event) => handleLevelChange(index, event.target.value)}
                        initial={{ opacity: 0.9 }}
                        animate={{ opacity: 1 }}
                        disabled={!countryId || (index > 0 && !selectedPath[index - 1])}
                        className={`w-full mt-1 px-3 py-2.5 rounded-xl border bg-gray-50 text-base sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-60 ${
                          fieldError ? 'border-red-200' : 'border-gray-200'
                        }`}
                      >
                        <option value="">{`Select ${level.label.toLowerCase()}`}</option>
                        {level.options.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </motion.select>
                      {fieldError ? <p className="text-[11px] text-red-600 font-bold mt-1">{fieldError.message}</p> : null}
                    </div>
                  );
                })}
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

              <input type="hidden" {...register('stateId')} />
              <input type="hidden" {...register('districtId')} />

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
