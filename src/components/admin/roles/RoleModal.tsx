import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Save, Loader2, Info, RotateCcw, LayoutDashboard, Trash2 } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Role, CreateRoleInput } from '../../../types/role.types';
import { useRoleMutations } from '../../../hooks/useRoleMutations';
import { usePermissionsQuery } from '../../../hooks/useRolesQuery';
import useRoleStore from '../../../store/useRoleStore';
import PermissionTree from './PermissionTree';
import { toast } from 'react-hot-toast';

const roleSchema = z.object({
  name: z.string().min(3, 'Role name must be at least 3 characters'),
  status: z.enum(['ACTIVE', 'INACTIVE']),
  description: z.string().optional(),
  permissions: z.array(z.string()).min(1, 'Select at least one permission'),
});

const roleExamples = [
  {
    name: 'Sales Manager',
    description: 'Oversees lead allocation, approvals, reporting visibility, and team-level sales activity.',
  },
  {
    name: 'Sales Executive',
    description: 'Works assigned leads, updates follow-ups, and progresses opportunities through the pipeline.',
  },
  {
    name: 'Operations Coordinator',
    description: 'Handles office workflow, roster coordination, holiday calendars, and support operations.',
  },
  {
    name: 'Reporting Analyst',
    description: 'Views dashboards, exports reports, and monitors performance data without operational edits.',
  },
];

interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
  onDelete?: (id: string, name: string) => void;
}

const RoleModal: React.FC<RoleModalProps> = ({ isOpen, onClose, role, onDelete }) => {
  const { setPermissions } = useRoleStore();
  const { data: permissionsData } = usePermissionsQuery();
  const { createRole, updateRole } = useRoleMutations();
  const [activeTab, setActiveTab] = useState<'details' | 'permissions'>('details');

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateRoleInput>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: '',
      status: 'ACTIVE',
      description: '',
      permissions: [],
    },
  });

  const selectedPermissions = watch('permissions');

  useEffect(() => {
    if (permissionsData) {
      setPermissions(permissionsData);
    }
  }, [permissionsData, setPermissions]);

  useEffect(() => {
    if (role) {
      reset({
        name: role.name,
        status: role.status,
        description: role.description || '',
        permissions: role.permissions || [],
      });
    } else {
      reset({
        name: '',
        status: 'ACTIVE',
        description: '',
        permissions: [],
      });
    }
    setActiveTab('details');
  }, [role, reset, isOpen]);

  const onSubmit = async (data: CreateRoleInput) => {
    try {
      if (role) {
        await updateRole.mutateAsync({ id: role.id, data });
      } else {
        await createRole.mutateAsync(data);
      }
      onClose();
    } catch (error: any) {
      // Mutations already handle their own error toasts if configured, 
      // but we handled them previously. React Query handles this.
    }
  };

  const onInvalid = (errors: any) => {
    if (errors.permissions) {
      toast.error('Minimum one permission required (Tab 2)', { id: 'validation-error' });
    } else {
      toast.error('Please fix the errors in the Details tab', { id: 'validation-error' });
    }
  };

  const applyRoleExample = (example: (typeof roleExamples)[number]) => {
    setValue('name', example.name, { shouldDirty: true, shouldValidate: true });
    setValue('description', example.description, { shouldDirty: true, shouldValidate: true });
    toast.success(`Loaded ${example.name} as a starter example`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
        />
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm shrink-0">
                <Shield className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div className="min-w-0">
                <h2 className="text-base md:text-xl font-black text-gray-900 truncate">
                    {role ? 'Edit Role' : 'Create Role'}
                </h2>
                <p className="text-[9px] md:text-xs text-gray-400 font-bold uppercase tracking-widest truncate">Access Control System</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-4 md:px-6 pt-4 flex bg-white border-b border-gray-50 gap-4 md:gap-8 overflow-x-auto no-scrollbar">
            <button 
                onClick={() => setActiveTab('details')}
                className={`pb-3 text-xs md:text-sm font-bold transition-all relative shrink-0 ${activeTab === 'details' ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
                1. Role Identity
                {errors.name && <span className="ml-2 w-1.5 h-1.5 rounded-full bg-red-500 animate-ping absolute -top-1 -right-1" />}
                {activeTab === 'details' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 rounded-t-full" />}
            </button>
            <button 
                onClick={() => setActiveTab('permissions')}
                className={`pb-3 text-xs md:text-sm font-bold transition-all relative shrink-0 ${activeTab === 'permissions' ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
                2. Permissions
                <span className={`ml-2 text-[9px] md:text-[10px] ${errors.permissions ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-emerald-100 text-emerald-600'} px-1.5 py-0.5 rounded-full transition-colors`}>
                    {selectedPermissions.length}
                </span>
                {activeTab === 'permissions' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 rounded-t-full" />}
            </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
            <div className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth custom-scrollbar">
                <form id="role-form" onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6 md:space-y-8">
                    {/* Tab: Details */}
                    {activeTab === 'details' && (
                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-5 md:space-y-6">
                            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 px-4 py-3">
                                <p className="text-sm font-black text-emerald-800">Create clear, workable business roles.</p>
                                <p className="mt-1 text-xs font-semibold leading-5 text-emerald-700/80">
                                    Use the examples below to understand common role types, then assign the exact permissions manually for your workspace.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Starter Examples</p>
                                        <p className="mt-1 text-xs font-semibold text-gray-500">
                                            These help with role naming and description only. Permissions are still selected manually.
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {roleExamples.map((example) => (
                                        <button
                                            key={example.name}
                                            type="button"
                                            onClick={() => applyRoleExample(example)}
                                            className="rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-sm transition-all hover:border-emerald-300 hover:bg-emerald-50/40 active:scale-[0.99]"
                                        >
                                            <p className="text-sm font-black text-gray-900">{example.name}</p>
                                            <p className="mt-1 text-xs font-medium leading-5 text-gray-500">
                                                {example.description}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Role Name</label>
                                <input 
                                    {...register('name')} 
                                    className={`w-full px-4 py-3 bg-gray-50 border rounded-2xl focus:bg-white outline-none transition-all font-bold text-gray-900 ${errors.name ? 'border-red-300 focus:border-red-500' : 'border-gray-50 focus:border-emerald-500'}`} 
                                    placeholder="e.g. Regional Manager" 
                                />
                                {errors.name && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.name.message}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</label>
                                <textarea 
                                    {...register('description')} 
                                    rows={3}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-50 rounded-2xl focus:bg-white focus:border-emerald-500 outline-none transition-all text-sm font-medium" 
                                    placeholder="Define the scope of this role..."
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
                                            className={`w-12 h-6 md:w-14 md:h-7 rounded-full transition-all relative flex items-center px-1 shrink-0 ${field.value === 'ACTIVE' ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30' : 'bg-gray-300'}`}
                                        >
                                            <motion.div animate={{ x: field.value === 'ACTIVE' ? (window.innerWidth < 768 ? 24 : 28) : 0 }} className="w-4 h-4 md:w-5 md:h-5 bg-white rounded-full shadow-md shrink-0" />
                                        </button>
                                    )}
                                />
                                <div className="min-w-0">
                                    <p className="text-xs md:text-sm font-black text-gray-900 leading-none">Status</p>
                                    <p className="text-[10px] md:text-[11px] text-gray-400 font-bold mt-1">Role isActive</p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Tab: Permissions */}
                    {activeTab === 'permissions' && (
                        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                            <div className="rounded-2xl border border-gray-100 bg-gray-50/70 px-4 py-3">
                                <p className="text-sm font-black text-gray-800">Assign permissions intentionally.</p>
                                <p className="mt-1 text-xs font-semibold leading-5 text-gray-500">
                                    The starter examples do not auto-assign permissions. Choose only the permissions this role should truly have so the access matrix stays clean and auditable.
                                </p>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-emerald-600">
                                    <LayoutDashboard className="w-4 h-4 shrink-0" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Access Matrix</span>
                                </div>
                            </div>
                            
                            <Controller
                                name="permissions"
                                control={control}
                                render={({ field }) => (
                                    <PermissionTree 
                                        selectedPermissions={field.value} 
                                        onChange={field.onChange} 
                                    />
                                )}
                            />
                            {errors.permissions && <p className="text-[10px] text-red-500 font-bold">{errors.permissions.message}</p>}
                        </motion.div>
                    )}
                </form>
            </div>

            {/* Sidebar / Summary Panel (Desktop Only) */}
            <div className="hidden lg:flex w-72 bg-gray-50/50 border-l border-gray-50 flex-col p-6 space-y-6 overflow-y-auto">
                <div className="space-y-3">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Role Guidance</h3>
                    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                        <p className="text-xs font-bold text-gray-700">
                            Use examples for understanding, then configure access precisely.
                        </p>
                        <p className="mt-2 text-[11px] font-medium leading-5 text-gray-500">
                            The old preset permission roles are still removed, but this screen now gives practical example role types so users can understand what to create without introducing dummy access matrices.
                        </p>
                        <ul className="mt-3 space-y-2 text-[11px] font-semibold text-gray-500">
                            <li>Pick a starter example if you want help with role naming.</li>
                            <li>Assign only the permissions needed for that responsibility.</li>
                            <li>Keep sensitive actions like delete, settings, and approvals tightly scoped.</li>
                        </ul>
                    </div>
                </div>

                <div className="flex-1" />

                <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-3">
                    <div className="flex items-center gap-2 text-emerald-600 mb-2">
                        <Info className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Summary</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400 font-bold">Total Access</span>
                        <span className="text-gray-900 font-black">{selectedPermissions.length}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400 font-bold">Status</span>
                        <span className={`font-black ${watch('status') === 'ACTIVE' ? 'text-emerald-500' : 'text-amber-500'}`}>
                            {watch('status')}
                        </span>
                    </div>
                </div>
            </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-50 bg-white flex items-center justify-between gap-4 sticky bottom-0 z-20">
          <button 
            type="button" 
            onClick={() => {
                if(role) {
                    reset({
                        name: role.name,
                        status: role.status,
                        description: role.description || '',
                        permissions: role.permissions || [],
                    });
                } else {
                    reset({ name: '', status: 'ACTIVE', description: '', permissions: [] });
                }
                toast.success('Changes reset to last save');
            }}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-gray-500 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Changes
          </button>

          {role && onDelete && (
            <button 
              type="button" 
              onClick={() => {
                onDelete(role.id, role.name);
                onClose();
              }}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Role
            </button>
          )}

          <div className="flex items-center gap-3">
              <button 
                type="button" 
                onClick={onClose} 
                className="px-6 py-2.5 text-xs font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                form="role-form"
                type="submit"
                disabled={createRole.isPending || updateRole.isPending}
                className="flex items-center justify-center gap-2 px-10 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white rounded-2xl text-sm font-black transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
              >
                {createRole.isPending || updateRole.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{role ? 'Update Configuration' : 'Establish Role'}</span>
              </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RoleModal;
