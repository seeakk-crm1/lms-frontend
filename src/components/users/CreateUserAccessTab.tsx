import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import LocationSelector from './LocationSelector';
import type { UserFormData } from './CreateUserModal.types';

interface CreateUserAccessTabProps {
  safeRoles: Array<{ value: string; label: string }>;
  safeDepartments: Array<{ value: string; label: string }>;
  supervisorsData: any;
  officesData: any;
  locationTreeData: any;
  accessTabErrorCount: number;
  getSelectClassName: (hasError?: boolean) => string;
  renderFieldError: (message?: string) => React.ReactNode;
}

const CreateUserAccessTab: React.FC<CreateUserAccessTabProps> = ({
  safeRoles,
  safeDepartments,
  supervisorsData,
  officesData,
  locationTreeData,
  accessTabErrorCount,
  getSelectClassName,
  renderFieldError,
}) => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<UserFormData>();

  return (
    <div className="space-y-6">
      {accessTabErrorCount > 0 ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3">
          <p className="text-sm font-black text-rose-700">Access settings need a quick review.</p>
          <p className="mt-1 text-xs font-semibold text-rose-600">
            Please fix the highlighted fields so the user gets the correct permissions and visibility scope.
          </p>
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Role</label>
          <select {...register('roleId')} className={getSelectClassName(Boolean(errors.roleId))}>
            <option value="">Select Role</option>
            {safeRoles.map((r: any) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          {renderFieldError(errors.roleId?.message)}
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Department</label>
          <select {...register('departmentId')} className={getSelectClassName(Boolean(errors.departmentId))}>
            <option value="">Select Department</option>
            {safeDepartments.map((d: any) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
          {renderFieldError(errors.departmentId?.message)}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Supervisor</label>
          <select {...register('supervisorId')} className={getSelectClassName(Boolean(errors.supervisorId))}>
            <option value="">Select Supervisor</option>
            {supervisorsData?.supervisors?.map((s: any) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.email})
              </option>
            ))}
          </select>
          {renderFieldError(errors.supervisorId?.message)}
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Reporting Office</label>
          <select {...register('officeId')} className={getSelectClassName(Boolean(errors.officeId))}>
            <option value="">Select Office</option>
            {officesData?.offices?.map((o: any) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
          {renderFieldError(errors.officeId?.message)}
        </div>
      </div>

      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
        <Controller
          name="isActive"
          control={control}
          render={({ field }) => (
            <button
              type="button"
              onClick={() => field.onChange(!field.value)}
              className={`w-12 h-6 rounded-full transition-colors relative ${field.value ? 'bg-emerald-500' : 'bg-gray-300'}`}
            >
              <motion.div animate={{ x: field.value ? 24 : 4 }} className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
            </button>
          )}
        />
        <div>
          <p className="text-sm font-bold text-gray-700">Account Active</p>
          <p className="text-[10px] text-gray-500">Enable or disable user access immediately</p>
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Assigned Visibility Boundary
        </label>
        <Controller
          name="assignedLocationIds"
          control={control}
          render={({ field }) => (
            <LocationSelector locations={locationTreeData?.tree || []} selectedIds={field.value} onSelect={field.onChange} />
          )}
        />
      </div>
    </div>
  );
};

export default CreateUserAccessTab;
