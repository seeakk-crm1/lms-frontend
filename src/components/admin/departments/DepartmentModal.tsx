import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, Save, Loader2, Trash2 } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Department, CreateDepartmentInput } from '../../../types/department.types';
import { useDepartmentMutations } from '../../../hooks/useDepartmentMutations';
import { toast } from 'react-hot-toast';

const departmentSchema = z.object({
  name: z.string().min(2, 'Department name must be at least 2 characters').trim(),
  status: z.enum(['ACTIVE', 'INACTIVE']),
  description: z.string().optional(),
});

interface DepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  department: Department | null;
  onDelete?: (id: string, name: string) => void;
}

const DepartmentModal: React.FC<DepartmentModalProps> = ({ isOpen, onClose, department, onDelete }) => {
  const { createDepartment, updateDepartment } = useDepartmentMutations();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateDepartmentInput>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: '',
      status: 'ACTIVE',
      description: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (department) {
        reset({
          name: department.name,
          status: department.status,
          description: department.description || '',
        });
      } else {
        reset({
          name: '',
          status: 'ACTIVE',
          description: '',
        });
      }
    }
  }, [department, reset, isOpen]);

  const onSubmit = async (data: CreateDepartmentInput) => {
    try {
      if (department) {
        await updateDepartment.mutateAsync({ id: department.id, data });
      } else {
        await createDepartment.mutateAsync(data);
      }
      onClose();
    } catch (error) {
      // Errors are handled in the mutation hook
    }
  };

  const isMutating = createDepartment.isPending || updateDepartment.isPending;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900">
                    {department ? 'Edit Department' : 'New Department'}
                  </h2>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                    Organization Structure
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Department Name
                </label>
                <input
                  {...register('name')}
                  placeholder="e.g., Marketing, Engineering"
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-2xl focus:bg-white outline-none transition-all font-bold text-gray-900 ${
                    errors.name ? 'border-red-300 focus:border-red-500' : 'border-gray-50 focus:border-emerald-500'
                  }`}
                />
                {errors.name && (
                  <p className="text-[10px] text-red-500 font-bold ml-1">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  rows={3}
                  placeholder="Briefly describe the purpose of this group..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-50 rounded-2xl focus:bg-white focus:border-emerald-500 outline-none transition-all text-sm font-medium"
                />
              </div>

              <div className="flex items-center gap-4 p-4 bg-emerald-50/20 rounded-2xl border border-emerald-50/50">
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <button
                      type="button"
                      onClick={() => field.onChange(field.value === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')}
                      className={`w-14 h-7 rounded-full transition-all relative flex items-center px-1 shrink-0 ${
                        field.value === 'ACTIVE' ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30' : 'bg-gray-300'
                      }`}
                    >
                      <motion.div
                        animate={{ x: field.value === 'ACTIVE' ? 28 : 0 }}
                        className="w-5 h-5 bg-white rounded-full shadow-md shrink-0"
                      />
                    </button>
                  )}
                />
                <div className="min-w-0">
                  <p className="text-sm font-black text-gray-900 leading-none">Access Status</p>
                  <p className="text-[10px] text-gray-400 font-bold mt-1">Determine if active in organization</p>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="submit"
                  disabled={isMutating}
                  className="w-full sm:flex-1 py-3.5 bg-emerald-500 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 active:scale-95 disabled:opacity-50 transition-all"
                >
                  {isMutating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {department ? 'Update Department' : 'Create Department'}
                </button>
                
                {department && onDelete && (
                    <button
                        type="button"
                        onClick={() => onDelete(department.id, department.name)}
                        className="w-full sm:w-auto p-3.5 bg-red-50 text-red-500 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-red-100 active:scale-95 transition-all"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DepartmentModal;
