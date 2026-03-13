import React from 'react';
import { useFormContext } from 'react-hook-form';
import { 
  Target, 
  Layers, 
  Calendar, 
  TrendingUp, 
  UserPlus, 
  AlertCircle 
} from 'lucide-react';
import { useTargetTypesQuery } from '../../hooks/useUsersQuery';

const TargetSettings = () => {
  const { register, formState: { errors } } = useFormContext();
  const { data: typesData } = useTargetTypesQuery();
  const targetTypes = typesData?.data?.types || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Target Type */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3 h-3" />
            Target Type
          </label>
          <select
            {...register('targetTypeId', { required: 'Target type is required' })}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all text-sm appearance-none"
          >
            <option value="">Select Target Type</option>
            {targetTypes.map((type: any) => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
          {errors.targetTypeId && (
            <span className="text-[10px] text-red-500 font-bold">{errors.targetTypeId.message as string}</span>
          )}
        </div>

        {/* Cycle */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3 h-3" />
            Evaluation Cycle
          </label>
          <select
            {...register('cycle')}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all text-sm appearance-none"
          >
            <option value="MONTHLY">Monthly</option>
            <option value="QUARTERLY">Quarterly</option>
            <option value="YEARLY">Yearly</option>
            <option value="CUSTOM">Custom</option>
          </select>
        </div>
      </div>

      <div className="h-px bg-gray-100 my-2" />

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5 p-4 rounded-xl bg-blue-50/50 border border-blue-100/30">
          <label className="text-[10px] font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
            <UserPlus className="w-3 h-3" />
            Monthly Lead Target
          </label>
          <input
            type="number"
            {...register('monthlyTargetLeads', { valueAsNumber: true })}
            className="w-full bg-transparent border-b border-blue-200 focus:border-blue-500 outline-none transition-all py-1 text-lg font-bold text-blue-900"
            placeholder="0"
          />
          <p className="text-[9px] text-blue-400">Total leads to generate per month</p>
        </div>

        <div className="space-y-1.5 p-4 rounded-xl bg-orange-50/50 border border-orange-100/30">
          <label className="text-[10px] font-bold text-orange-600 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-3 h-3" />
            Daily Followups
          </label>
          <input
            type="number"
            {...register('dailyFollowupTarget', { valueAsNumber: true })}
            className="w-full bg-transparent border-b border-orange-200 focus:border-orange-500 outline-none transition-all py-1 text-lg font-bold text-orange-900"
            placeholder="0"
          />
          <p className="text-[9px] text-orange-400">Minimum daily follow-up calls</p>
        </div>

        <div className="space-y-1.5 p-4 rounded-xl bg-emerald-50/50 border border-emerald-100/30">
          <label className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
            <Target className="w-3 h-3" />
            Revenue Target
          </label>
          <input
            type="number"
            {...register('revenueTarget', { valueAsNumber: true })}
            className="w-full bg-transparent border-b border-emerald-200 focus:border-emerald-500 outline-none transition-all py-1 text-lg font-bold text-emerald-900"
            placeholder="0"
          />
           <p className="text-[9px] text-emerald-400">Revenue goal per cycle</p>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 flex gap-3">
        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
        <p className="text-xs text-amber-700 leading-relaxed">
          <span className="font-bold">Compliance Rules:</span> Missing daily follow-ups 3 times results in a <span className="font-bold text-amber-900 underline">lock</span>. Missing monthly targets results in an <span className="font-bold text-amber-900 underline">immediate lock</span>.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Start Date</label>
          <input
            type="date"
            {...register('startDate', { required: 'Start date is required' })}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition-all text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">End Date (Optional)</label>
          <input
            type="date"
            {...register('endDate')}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition-all text-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default TargetSettings;
