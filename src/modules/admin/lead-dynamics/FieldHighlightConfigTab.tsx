import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Loader2, Search } from 'lucide-react';
import { useLeadDynamicsQuery } from './useLeadDynamicsQuery';
import { useFieldHighlightsQuery } from './useFieldHighlightsQuery';
import { useFieldHighlightsMutation } from './useFieldHighlightsMutation';
import { createEmptyLeadFormValues } from '../../../store/leadStore';

const FIELD_LABEL_MAP: Record<string, string> = {
  name: 'Lead Name',
  phone: 'Mobile',
  email: 'Email',
  companyName: 'Company Name',
  address: 'Address',
  assignedToId: 'Assigned To',
  sourceId: 'Lead Source',
  lifecycleId: 'Lead Life Cycle',
  stageId: 'Lead Stage',
  leadRemarks: 'Remarks',
  nextFollowUpAt: 'Next Follow-up Date',
  nextFollowUpType: 'Follow-up Type',
  followUpDescription: 'Follow-up Note',
  reasonId: 'LOB Reason',
  remarks: 'LOB Remarks',
  totalAmount: 'Total Amount',
};

const getBuiltInFields = () => {
  const emptyValues = createEmptyLeadFormValues();
  // Filter out internal/nested structures like dynamicValues
  const keys = Object.keys(emptyValues).filter(key => key !== 'dynamicValues');
  
  return keys.map(key => {
    // Map the UI state key 'leadRemarks' to the backend key 'remarks' for tracking
    // and map UI state key 'remarks' to the backend key 'lobRemarks'
    let mappedId = key;
    if (key === 'leadRemarks') mappedId = 'remarks';
    if (key === 'remarks') mappedId = 'lobRemarks';

    const label = FIELD_LABEL_MAP[key] || key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase());
      
    return { id: mappedId, name: label };
  });
};

export const FieldHighlightConfigTab: React.FC = () => {
  const { data: dynamicFieldsData, isLoading: isLoadingFields } = useLeadDynamicsQuery();
  const { data: highlightConfigs, isLoading: isLoadingConfigs } = useFieldHighlightsQuery();
  const mutation = useFieldHighlightsMutation();

  const [search, setSearch] = useState('');
  const [localState, setLocalState] = useState<Record<string, boolean>>({});

  const dynamicFields = useMemo(() => dynamicFieldsData?.data || [], [dynamicFieldsData]);

  const allFields = useMemo(() => {
    return [
      ...getBuiltInFields(),
      ...dynamicFields.map(f => ({ id: f.id, name: f.name }))
    ];
  }, [dynamicFields]);

  useEffect(() => {
    if (highlightConfigs) {
      const state: Record<string, boolean> = {};
      highlightConfigs.forEach(c => {
        state[c.fieldKey] = c.isEnabled;
      });
      setLocalState(state);
    }
  }, [highlightConfigs]);

  const filteredFields = useMemo(() => {
    return allFields.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));
  }, [allFields, search]);

  const handleToggle = (key: string) => {
    setLocalState(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = () => {
    const payload = Object.entries(localState).map(([fieldKey, isEnabled]) => ({
      fieldKey,
      isEnabled
    }));
    mutation.mutate(payload);
  };

  if (isLoadingFields || isLoadingConfigs) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col mt-6">
      <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row items-center gap-4 justify-between bg-gray-50/50">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search fields..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={mutation.isPending}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-semibold shadow-md shadow-emerald-500/20 hover:bg-emerald-600 disabled:opacity-70 transition-all"
        >
          {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Configuration
        </motion.button>
      </div>

      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFields.map(field => {
          const isEnabled = !!localState[field.id];
          return (
            <div
              key={field.id}
              onClick={() => handleToggle(field.id)}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                isEnabled 
                  ? 'border-emerald-500 bg-emerald-50' 
                  : 'border-gray-100 bg-white hover:border-emerald-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`font-semibold text-sm ${isEnabled ? 'text-emerald-700' : 'text-gray-700'}`}>
                  {field.name}
                </span>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  isEnabled ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300'
                }`}>
                  {isEnabled && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
              </div>
            </div>
          );
        })}
        {filteredFields.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 text-sm">
            No fields found matching "{search}"
          </div>
        )}
      </div>
    </div>
  );
};

export default FieldHighlightConfigTab;
