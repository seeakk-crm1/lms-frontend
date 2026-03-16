import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Save, Loader2, Info, RotateCcw, LayoutDashboard, Copy, Trash2 } from 'lucide-react';
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

interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
  onDelete?: (id: string, name: string) => void;
}

const RoleModal: React.FC<RoleModalProps> = ({ isOpen, onClose, role, onDelete }) => {
  const { setPermissions } = useRoleStore();
  const { data: permissionsData, isLoading: isLoadingPerms } = usePermissionsQuery();
  const { createRole, updateRole } = useRoleMutations();
  const [activeTab, setActiveTab] = useState<'details' | 'permissions'>('details');

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
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

  const templates = [
      { name: 'Full Admin', keys: permissionsData?.map((p: any) => p.key) || [] },
      { name: 'Manager', keys: permissionsData?.filter((p: any) => !p.key.includes('DELETE') && !p.key.includes('SYSTEM')).map((p: any) => p.key) || [] },
      { name: 'Executive', keys: permissionsData?.filter((p: any) => p.key.endsWith('_VIEW') || p.key.endsWith('_CREATE')).map((p: any) => p.key) || [] },
      { name: 'Read Only', keys: permissionsData?.filter((p: any) => p.key.endsWith('_VIEW') || p.key.endsWith('_VIEW_ALL')).map((p: any) => p.key) || [] },
  ];

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
        <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
                <Shield className="w-6 h-6" />
            </div>
            <div>
                <h2 className="text-xl font-black text-gray-900">
                    {role ? 'Edit Role Configuration' : 'Establish New Role'}
                </h2>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Access Control System</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 pt-4 flex bg-white border-b border-gray-50 gap-8">
            <button 
                onClick={() => setActiveTab('details')}
                className={`pb-3 text-sm font-bold transition-all relative ${activeTab === 'details' ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
                1. Role Identity
                {errors.name && <span className="ml-2 w-1.5 h-1.5 rounded-full bg-red-500 animate-ping absolute -top-1 -right-1" />}
                {activeTab === 'details' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 rounded-t-full" />}
            </button>
            <button 
                onClick={() => setActiveTab('permissions')}
                className={`pb-3 text-sm font-bold transition-all relative ${activeTab === 'permissions' ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
                2. Permission Matrix
                <span className={`ml-2 text-[10px] ${errors.permissions ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-emerald-100 text-emerald-600'} px-1.5 py-0.5 rounded-full transition-colors`}>
                    {selectedPermissions.length}
                </span>
                {activeTab === 'permissions' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 rounded-t-full" />}
            </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
            <div className="flex-1 overflow-y-auto p-6 scroll-smooth custom-scrollbar">
                <form id="role-form" onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-8">
                    {/* Tab: Details */}
                    {activeTab === 'details' && (
                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Role Identification Name</label>
                                <input 
                                    {...register('name')} 
                                    className={`w-full px-4 py-3 bg-gray-50 border rounded-2xl focus:bg-white outline-none transition-all font-bold text-gray-900 ${errors.name ? 'border-red-300 focus:border-red-500' : 'border-gray-50 focus:border-emerald-500'}`} 
                                    placeholder="e.g. Regional Manager" 
                                />
                                {errors.name && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.name.message}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Function Description (Optional)</label>
                                <textarea 
                                    {...register('description')} 
                                    rows={3}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-50 rounded-2xl focus:bg-white focus:border-emerald-500 outline-none transition-all text-sm font-medium" 
                                    placeholder="Define the scope and purpose of this role..."
                                />
                            </div>

                            <div className="flex items-center gap-4 p-4 bg-emerald-50/30 rounded-2xl border border-emerald-50">
                                <Controller
                                    name="status"
                                    control={control}
                                    render={({ field }) => (
                                        <button 
                                            type="button"
                                            onClick={() => field.onChange(field.value === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')}
                                            className={`w-14 h-7 rounded-full transition-all relative flex items-center px-1 ${field.value === 'ACTIVE' ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30' : 'bg-gray-300'}`}
                                        >
                                            <motion.div animate={{ x: field.value === 'ACTIVE' ? 28 : 0 }} className="w-5 h-5 bg-white rounded-full shadow-md shrink-0" />
                                        </button>
                                    )}
                                />
                                <div className="min-w-0">
                                    <p className="text-sm font-black text-gray-900 leading-none">Operational Status</p>
                                    <p className="text-[11px] text-gray-500 font-medium mt-1">Determine if this role is currently assignable to team members.</p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Tab: Permissions */}
                    {activeTab === 'permissions' && (
                        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2 text-emerald-600">
                                    <LayoutDashboard className="w-4 h-4" />
                                    <span className="text-xs font-black uppercase tracking-widest">Permission Configuration</span>
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
            <div className="hidden lg:flex w-72 bg-gray-50/50 border-l border-gray-50 flex-col p-6 space-y-6">
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Quick Templates</h3>
                    <div className="grid grid-cols-1 gap-2">
                        {templates.map(t => (
                            <button
                                key={t.name}
                                type="button"
                                onClick={() => reset({ ...watch(), permissions: t.keys })}
                                className="flex items-center justify-between p-2.5 bg-white border border-gray-100 rounded-xl hover:border-emerald-500 group transition-all"
                            >
                                <span className="text-[11px] font-bold text-gray-600 group-hover:text-emerald-600">{t.name}</span>
                                <Copy className="w-3 h-3 text-gray-300 group-hover:text-emerald-500" />
                            </button>
                        ))}
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
