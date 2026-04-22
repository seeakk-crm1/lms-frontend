import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronDown, CheckSquare, Square, MapPin, Search } from 'lucide-react';
import { Location } from '../../types/user.types';

interface LocationSelectorProps {
  locations: Location[];
  selectedIds: string[];
  onSelect: (ids: string[]) => void;
  maxSelections?: number;
}

const LocationNode: React.FC<{ 
  location: Location; 
  selectedIds: string[]; 
  toggleSelect: (id: string) => void; 
  level?: number 
}> = ({ 
  location, 
  selectedIds, 
  toggleSelect, 
  level = 0 
}) => {
  const [isExpanded, setIsExpanded] = useState(level < 1);
  const isSelected = selectedIds.includes(location.id);
  const hasChildren = location.children && location.children.length > 0;

  return (
    <div className="select-none">
      <div 
        className={`flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-emerald-50/50 cursor-pointer transition-colors ${isSelected ? 'bg-emerald-50' : ''}`}
        style={{ paddingLeft: `${(level * 16) + 12}px` }}
        onClick={() => toggleSelect(location.id)}
      >
        <div 
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren) setIsExpanded(!isExpanded);
          }}
          className={`w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200 transition-colors ${!hasChildren ? 'opacity-0 cursor-default' : 'cursor-pointer'}`}
        >
          {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
        </div>
        
        <div className="flex-1 flex items-center gap-2">
            {isSelected ? (
                <CheckSquare className="w-4 h-4 text-emerald-500 fill-emerald-50" />
            ) : (
                <Square className="w-4 h-4 text-gray-300" />
            )}
            <span className={`text-sm ${isSelected ? 'text-emerald-700 font-bold' : 'text-gray-600 font-medium'}`}>
                {location.name}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-400 font-bold uppercase tracking-tighter">
                {location.type}
            </span>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            {location.children?.map(child => (
              <LocationNode 
                key={child.id} 
                location={child} 
                selectedIds={selectedIds} 
                toggleSelect={toggleSelect} 
                level={level + 1} 
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const LocationSelector: React.FC<LocationSelectorProps> = ({ locations, selectedIds, onSelect }) => {
  const [search, setSearch] = useState('');

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelect(selectedIds.filter(i => i !== id));
    } else {
      onSelect([...selectedIds, id]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input 
          type="text"
          placeholder="Search locations..."
          className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition-all text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="max-h-[300px] overflow-y-auto custom-scrollbar border border-gray-100 rounded-2xl bg-white p-2">
        {locations.map(loc => (
          <LocationNode key={loc.id} location={loc} selectedIds={selectedIds} toggleSelect={toggleSelect} />
        ))}
        {locations.length === 0 && (
          <div className="p-8 text-center">
            <MapPin className="w-8 h-8 text-gray-200 mx-auto mb-2" />
            <p className="text-xs text-gray-400">No locations available. Create locations in Organization Settings.</p>
          </div>
        )}
      </div>

      {selectedIds.length > 0 && (
        <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/30">
          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-2">Assigned Boundaries</p>
          <div className="flex flex-wrap gap-2">
             {selectedIds.map(id => {
                const flatFind = (list: Location[]): Location | undefined => {
                    for(const l of list) {
                        if(l.id === id) return l;
                        if(l.children) {
                            const res = flatFind(l.children);
                            if(res) return res;
                        }
                    }
                    return undefined;
                };
                const loc = flatFind(locations);
                return loc ? (
                    <div key={id} className="flex items-center gap-1.5 px-3 py-1 bg-white border border-emerald-100 rounded-lg text-xs text-emerald-700 shadow-sm">
                        <MapPin className="w-3 h-3" />
                        <span className="font-bold">{loc.name}</span>
                        <span className="text-[9px] text-emerald-400">{loc.type}</span>
                    </div>
                ) : null;
             })}
          </div>
          <p className="mt-3 text-[10px] text-emerald-600 italic leading-tight">
            User will see all children under the selected areas.
          </p>
        </div>
      )}
    </div>
  );
};

export default LocationSelector;
