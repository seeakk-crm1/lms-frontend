import React from 'react';
import { ArrowRight } from 'lucide-react';
import type { LocationLevel } from '../../../services/locations.api';
import LocationColumn from './LocationColumn';

interface LevelColumnsProps {
  countryId?: string;
  levels: LocationLevel[];
  selectedNodes: Record<number, string>;
  onSelect: (levelIndex: number, location: { id: string; name: string }) => void;
  onAddLocation: (level: LocationLevel, levelIndex: number) => void;
  onEditLocation?: (level: LocationLevel, levelIndex: number, location: { id: string; name: string; isActive: boolean }) => void;
  onDeleteLocation?: (level: LocationLevel, levelIndex: number, location: { id: string; name: string }) => void;
  canManage?: boolean;
}

const LevelColumns: React.FC<LevelColumnsProps> = ({
  countryId,
  levels,
  selectedNodes,
  onSelect,
  onAddLocation,
  onEditLocation,
  onDeleteLocation,
  canManage,
}) => {
  if (!levels.length) {
    return (
      <div className="rounded-[2rem] border border-dashed border-emerald-100 bg-white px-8 py-16 text-center shadow-[0_24px_70px_-34px_rgba(16,185,129,0.12)]">
        <div className="text-2xl font-black text-gray-900">No location levels configured</div>
        <p className="mt-3 text-sm font-semibold text-gray-500">
          Configure the dynamic levels for this country first, then the hierarchy columns will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex min-w-max items-stretch gap-3">
        {levels.map((level, index) => (
          <React.Fragment key={level.id}>
            <LocationColumn
              level={level}
              countryId={countryId}
              parentId={index === 0 ? undefined : selectedNodes[index - 1]}
              selectedId={selectedNodes[index]}
              parentSelected={index === 0 ? true : Boolean(selectedNodes[index - 1])}
              onSelect={(location) => onSelect(index, location)}
              onAdd={() => onAddLocation(level, index)}
              onEdit={(location) => onEditLocation?.(level, index, location)}
              onDelete={(location) => onDeleteLocation?.(level, index, location)}
              canManage={canManage}
            />
            {index < levels.length - 1 ? (
              <div className="flex items-center justify-center px-1 text-emerald-300">
                <ArrowRight className="h-5 w-5" />
              </div>
            ) : null}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default LevelColumns;
