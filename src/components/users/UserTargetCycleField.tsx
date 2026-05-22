import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Target } from 'lucide-react';
import api from '../../services/api';

const fetchTargetCycleOptions = async () => {
  try {
    const response = await api.get('/admin/target-cycles', { params: { limit: 100, status: 'ACTIVE' } });
    return response.data?.data || [];
  } catch {
    const fallback = await api.get('/master/target-cycles', { params: { limit: 100, status: 'ACTIVE' } });
    return fallback.data?.data || [];
  }
};

interface Props {
  value: string;
  onChange: (value: string) => void;
}

const UserTargetCycleField: React.FC<Props> = ({ value, onChange }) => {
  const { data: cycles = [], isLoading } = useQuery({
    queryKey: ['target-cycle-options'],
    queryFn: fetchTargetCycleOptions,
    staleTime: 60_000,
  });

  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-5 space-y-3">
      <div className="flex items-center gap-2">
        <Target className="h-4 w-4 text-emerald-500" />
        <h4 className="text-sm font-black text-gray-900">Assigned Target Cycle</h4>
      </div>
      <p className="text-xs text-gray-500">
        Select a reusable target cycle from Master Configuration. Performance tracking and account locking run automatically.
      </p>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={isLoading}
        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-800 focus:outline-emerald-500"
      >
        <option value="">No target cycle (optional)</option>
        {cycles.map((cycle: { id: string; name: string; targetMetric?: string; targetType?: string }) => (
          <option key={cycle.id} value={cycle.id}>
            {cycle.name}
            {cycle.targetMetric ? ` · ${cycle.targetMetric}` : ''}
            {cycle.targetType ? ` · ${cycle.targetType}` : ''}
          </option>
        ))}
      </select>
    </div>
  );
};

export default UserTargetCycleField;
