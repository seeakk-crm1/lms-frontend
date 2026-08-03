import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Save, Loader2, Info, RotateCcw, LayoutDashboard, Trash2, Copy } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Role, CreateRoleInput } from '../../../types/role.types';
import { useRoleMutations } from '../../../hooks/useRoleMutations';
import { usePermissionsQuery, useRoleDetailsQuery } from '../../../hooks/useRolesQuery';
import useRoleStore from '../../../store/useRoleStore';
import PermissionTree from './PermissionTree';
import { toast } from 'react-hot-toast';

const roleSchema = z.object({
  name: z.string().min(3, 'Role name must be at least 3 characters'),
  status: z.enum(['ACTIVE', 'INACTIVE']),
  description: z.string().optional(),
  permissions: z.array(z.string()).min(1, 'Select at least one permission'),
});

type RoleTemplateDefinition = {
  name: string;
  description: string;
  permissionStrategy: (availableKeys: Set<string>) => string[];
};

const pickExistingPermissions = (availableKeys: Set<string>, permissionKeys: string[]) =>
  permissionKeys.filter((key) => availableKeys.has(key));

const roleExamples = [
  {
    name: 'Full Admin',
    description: 'High-trust operational role with broad administrative visibility and workspace management access.',
    permissionStrategy: (availableKeys: Set<string>) => Array.from(availableKeys),
  },
  {
    name: 'Manager',
    description: 'Supervises teams, approvals, reports, office locations, and day-to-day operational monitoring.',
    permissionStrategy: (availableKeys: Set<string>) =>
      pickExistingPermissions(availableKeys, [
        'DASHBOARD_VIEW_ALL',
        'DASHBOARD_VIEW_ASSIGNED',
        'OFFICE_LOCATION_VIEW',
        'OFFICE_LOCATION_CREATE',
        'OFFICE_LOCATION_EDIT',
        'USERS_VIEW',
        'USERS_CREATE',
        'USERS_EDIT',
        'USERS_UNLOCK',
        'USERS_EXPORT',
        'ROLES_VIEW',
        'DEPARTMENTS_VIEW',
        'DEPARTMENTS_CREATE',
        'DEPARTMENTS_EDIT',
        'LEAD_SOURCES_VIEW',
        'LEAD_SOURCES_CREATE',
        'LEAD_SOURCES_EDIT',
        'LEAD_STAGES_VIEW',
        'LEAD_STAGE_RULES_VIEW',
        'TARGET_CYCLES_VIEW',
        'LEAD_DYNAMICS_VIEW',
        'LOB_REASONS_VIEW',
        'LOB_REASONS_CREATE',
        'LOB_REASONS_EDIT',
        'LOB_REASONS_DELETE',
        'LEADS_VIEW_ALL',
        'LEADS_VIEW_TEAM',
        'LEADS_CREATE',
        'LEADS_EDIT',
        'LEADS_ASSIGN',
        'LEADS_BULK_ASSIGN',
        'LEAD_APPROVAL_VIEW',
        'LEAD_APPROVAL_APPROVE',
        'LEAD_APPROVAL_DENY',
        'LEADS_APPROVE',
        'LEADS_REJECT',
        'LEADS_CLOSE',
        'LEADS_REOPEN',
        'LEADS_EXPORT',
        'LEADS_IMPORT',
        'REPORTS_VIEW',
        'REPORTS_GENERATE',
        'REPORT_LOGS_VIEW',
        'LOB_ANALYSIS_VIEW',
      ]),
  },
  {
    name: 'Executive',
    description: 'Handles assigned leads, updates workflow tasks, views own dashboard, and completes operational actions.',
    permissionStrategy: (availableKeys: Set<string>) =>
      pickExistingPermissions(availableKeys, [
        'DASHBOARD_VIEW_OWN',
        'OFFICE_LOCATION_VIEW',
        'LEADS_VIEW_OWN',
        'LEADS_VIEW_TEAM',
        'LEADS_CREATE',
        'LEADS_EDIT',
        'LEADS_ASSIGN',
        'LEAD_APPROVAL_VIEW',
        'REPORTS_VIEW',
        'LOB_ANALYSIS_VIEW',
      ]),
  },
  {
    name: 'Read Only',
    description: 'Views dashboards and records without edit, delete, or approval authority.',
    permissionStrategy: (availableKeys: Set<string>) =>
      Array.from(availableKeys).filter((key) => key.includes('_VIEW') || key.endsWith('_view')),
  },
] satisfies RoleTemplateDefinition[];

interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
  onDelete?: (id: string, name: string) => void;
}

const RoleModal: React.FC<RoleModalProps> = ({ isOpen, onClose, role, onDelete }) => {
  const { setPermissions } = useRoleStore();
  const { data: permissionsData } = usePermissionsQuery();
  const { data: fullRole, isLoading: isRoleLoading } = useRoleDetailsQuery(isOpen ? role?.id || null : null);
  const { createRole, updateRole } = useRoleMutations();
  const [activeTab, setActiveTab] = useState<'details' | 'permissions'>('details');
  const canDeleteRole = !role?.isSystemRole && (role?.usersCount ?? 0) === 0;
  const deleteTooltip = role?.isSystemRole
    ? 'System roles cannot be deleted'
    : (role?.usersCount ?? 0) > 0
      ? `Reassign ${role?.usersCount} user${role?.usersCount === 1 ? '' : 's'} before deleting`
      : 'Delete Role';

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
        permissions: fullRole?.permissions || role.permissions || [],
      });
    } else {
      reset({
        name: '',
        status: 'ACTIVE',
        description: '',
        permissions: [],
      });
    }
    if (isOpen && !fullRole) {
      setActiveTab('details');
    }
  }, [role, fullRole, reset, isOpen]);

  const onSubmit = async (data: CreateRoleInput) => {
    try {
      if (role) {
        await updateRole.mutateAsync({ id: role.id, data });
      } else {
        await createRole.mutateAsync(data);
      }
      onClose();
    } catch (error: any) {
      // Handled in mutation toasts
    }
  };

  const onInvalid = (errors: any) => {
    if (errors.permissions) {
      toast.error('Minimum one permission required (Tab 2)', { id: 'validation-error' });
    } else {
      toast.error('Please fix the errors in the Role Identity tab', { id: 'validation-error' });
    }
  };

  const applyRoleExample = (example: RoleTemplateDefinition) => {
    const availablePermissionKeys = new Set<string>((permissionsData ?? []).map((permission: any) => permission.key));
    const recommendedPermissions = example.permissionStrategy(availablePermissionKeys);

    setValue('name', example.name, { shouldDirty: true, shouldValidate: true });
    setValue('description', example.description, { shouldDirty: true, shouldValidate: true });
    setValue('permissions', recommendedPermissions, { shouldDirty: true, shouldValidate: true });
    setActiveTab('permissions');
    toast.success(`Loaded ${example.name} template. You can adjust every permission manually.`);
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
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        />
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 10 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-100"
      >
        {/* Header - Clean Light Theme */}
        <div className="p-5 md:p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 md:w-12 md:h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs shrink-0 border border-emerald-100/50">
              <Shield className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg md:text-xl font-black text-slate-900 truncate">
                {role ? 'Edit Role Configuration' : 'Create New Role'}
              </h2>
              <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-widest truncate">
                Admin Management → Roles & RBAC Matrix
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs - Light Theme */}
        <div className="px-6 pt-4 flex bg-white border-b border-slate-100 gap-6 md:gap-8 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`pb-3 text-xs md:text-sm font-bold transition-all relative shrink-0 flex items-center gap-2 ${
              activeTab === 'details' ? 'text-emerald-600 font-extrabold' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            1. Role Identity
            {errors.name && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping absolute -top-1 -right-1" />
            )}
            {activeTab === 'details' && (
              <motion.div
                layoutId="tab-underline"
                className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 rounded-t-full"
              />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('permissions')}
            className={`pb-3 text-xs md:text-sm font-bold transition-all relative shrink-0 flex items-center gap-2 ${
              activeTab === 'permissions' ? 'text-emerald-600 font-extrabold' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            2. Permissions Matrix
            <span
              className={`ml-1 text-[10px] ${
                errors.permissions
                  ? 'bg-red-100 text-red-600 animate-pulse'
                  : 'bg-emerald-100 text-emerald-700 font-bold'
              } px-2 py-0.5 rounded-full transition-colors`}
            >
              {selectedPermissions.length} selected
            </span>
            {activeTab === 'permissions' && (
              <motion.div
                layoutId="tab-underline"
                className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 rounded-t-full"
              />
            )}
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row bg-white">
          <div className="flex-1 overflow-y-auto p-5 md:p-6 scroll-smooth custom-scrollbar">
            <form id="role-form" onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
              {/* Tab 1: Details */}
              {activeTab === 'details' && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-5"
                >
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Role Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register('name')}
                      className={`w-full px-4 py-3 bg-slate-50 border rounded-2xl focus:bg-white outline-none transition-all font-bold text-slate-900 text-sm ${
                        errors.name
                          ? 'border-red-300 focus:border-red-500'
                          : 'border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10'
                      }`}
                      placeholder="e.g. Sales Manager, Regional Admin, Operations Lead"
                    />
                    {errors.name && (
                      <p className="text-[10px] text-red-500 font-bold ml-1">{errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Description & Purpose
                    </label>
                    <textarea
                      {...register('description')}
                      rows={3}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-sm font-medium text-slate-800"
                      placeholder="Specify the operational responsibilities and scope of this role..."
                    />
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                    <Controller
                      name="status"
                      control={control}
                      render={({ field }) => (
                        <button
                          type="button"
                          onClick={() => field.onChange(field.value === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')}
                          className={`w-14 h-7 rounded-full transition-all relative flex items-center px-1 shrink-0 ${
                            field.value === 'ACTIVE'
                              ? 'bg-emerald-500 shadow-md shadow-emerald-500/30'
                              : 'bg-slate-300'
                          }`}
                        >
                          <motion.div
                            animate={{ x: field.value === 'ACTIVE' ? 28 : 0 }}
                            className="w-5 h-5 bg-white rounded-full shadow-sm shrink-0"
                          />
                        </button>
                      )}
                    />
                    <div className="min-w-0">
                      <p className="text-xs md:text-sm font-black text-slate-900 leading-none">
                        Role Status ({watch('status')})
                      </p>
                      <p className="text-[11px] text-slate-500 font-medium mt-1">
                        Active roles can be assigned to users in workspace user management.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Tab 2: Permissions Tree */}
              {activeTab === 'permissions' && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-600">
                      <LayoutDashboard className="w-4 h-4 shrink-0" />
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        Permission Tree Matrix
                      </span>
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
                  {errors.permissions && (
                    <p className="text-[10px] text-red-500 font-bold">{errors.permissions.message}</p>
                  )}
                </motion.div>
              )}
            </form>
          </div>

          {/* Sidebar / Quick Templates (Desktop Only) - Light Theme */}
          <div className="hidden lg:flex w-72 bg-slate-50/70 border-l border-slate-100 flex-col p-6 space-y-6 overflow-y-auto">
            <div className="space-y-4">
              <div className="space-y-3">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Role Templates
                </h3>
                <div className="space-y-2.5">
                  {roleExamples.map((example) => {
                    const isSelected = watch('name') === example.name;
                    return (
                      <button
                        key={example.name}
                        type="button"
                        onClick={() => applyRoleExample(example)}
                        className={`flex w-full items-center justify-between rounded-2xl border px-3.5 py-3 text-left shadow-2xs transition-all active:scale-[0.99] ${
                          isSelected
                            ? 'border-emerald-300 bg-emerald-50/90 text-emerald-950 ring-1 ring-emerald-500/20'
                            : 'border-slate-200/90 bg-white hover:border-emerald-300 hover:bg-emerald-50/30'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <p className="text-xs font-black text-slate-900">{example.name}</p>
                          <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                            {example.description}
                          </p>
                        </div>
                        <Copy className="h-4 w-4 shrink-0 text-slate-400" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs space-y-2">
                <p className="text-xs font-bold text-slate-800">
                  Granular Access Control
                </p>
                <p className="text-[11px] font-medium leading-relaxed text-slate-500">
                  Select role templates to prefill configuration, then customize permissions manually in the expandable tree matrix.
                </p>
              </div>
            </div>

            <div className="flex-1" />

            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 text-emerald-600 mb-1">
                <Info className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Configuration Summary</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold">Permissions Selected</span>
                <span className="text-slate-900 font-black">{selectedPermissions.length}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold">Status</span>
                <span
                  className={`font-black ${
                    watch('status') === 'ACTIVE' ? 'text-emerald-600' : 'text-amber-600'
                  }`}
                >
                  {watch('status')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Light Theme Sticky Bar */}
        <div className="p-5 border-t border-slate-100 bg-white flex items-center justify-between gap-4 sticky bottom-0 z-20">
          <button
            type="button"
            onClick={() => {
              if (role) {
                reset({
                  name: role.name,
                  status: role.status,
                  description: role.description || '',
                  permissions: fullRole?.permissions || role.permissions || [],
                });
              } else {
                reset({ name: '', status: 'ACTIVE', description: '', permissions: [] });
              }
              toast.success('Reset form to saved values');
            }}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/70 rounded-xl transition-all active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>

          {role && onDelete && (
            <button
              type="button"
              onClick={() => {
                if (!canDeleteRole) return;
                onDelete(role.id, role.name);
                onClose();
              }}
              disabled={!canDeleteRole}
              title={deleteTooltip}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Role
            </button>
          )}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              form="role-form"
              type="submit"
              disabled={createRole.isPending || updateRole.isPending}
              className="flex items-center justify-center gap-2 px-8 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white rounded-xl text-sm font-black transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
            >
              {createRole.isPending || updateRole.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{role ? 'Update Role' : 'Save Role'}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RoleModal;
