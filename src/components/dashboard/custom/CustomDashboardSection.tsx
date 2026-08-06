import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Plus, MoreHorizontal, Pencil, Trash2, LayoutGrid } from 'lucide-react';
import type { PipelineSection, Pipeline } from '../../../services/customPipelines.api';
import { CustomPipelineCard } from './CustomPipelineCard';

interface CustomDashboardSectionProps {
  section: PipelineSection;
  onAddPipeline?: (sectionId: string) => void;
  onEditSection?: (section: PipelineSection) => void;
  onDeleteSection?: (section: PipelineSection) => void;
  onEditPipeline?: (pipeline: Pipeline) => void;
  onDuplicatePipeline?: (pipeline: Pipeline) => void;
  onDeletePipeline?: (pipeline: Pipeline) => void;
  onPipelineClick?: (pipeline: Pipeline) => void;
  canManage?: boolean;
}

export const CustomDashboardSection: React.FC<CustomDashboardSectionProps> = ({
  section,
  onAddPipeline,
  onEditSection,
  onDeleteSection,
  onEditPipeline,
  onDuplicatePipeline,
  onDeletePipeline,
  onPipelineClick,
  canManage = true,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showSectionMenu, setShowSectionMenu] = useState(false);

  const getLayoutGridClass = (layoutType: string) => {
    switch (layoutType) {
      case 'FULL':
        return 'grid-cols-1';
      case 'TWO_COL':
        return 'grid-cols-1 md:grid-cols-2';
      case 'THREE_COL':
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      case 'FOUR_COL':
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
      case 'AUTO':
      default:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
    }
  };

  return (
    <div className="rounded-3xl border border-gray-200/90 bg-white/80 p-6 shadow-sm backdrop-blur-sm transition-all hover:border-gray-300">
      {/* Section Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="rounded-xl p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            {isCollapsed ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-gray-900">{section.name}</h3>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-black text-emerald-600 border border-emerald-100">
                {section.pipelines.length} {section.pipelines.length === 1 ? 'Pipeline' : 'Pipelines'}
              </span>
            </div>
            {section.description && (
              <p className="mt-0.5 text-xs font-semibold text-gray-500">{section.description}</p>
            )}
          </div>
        </div>

        {canManage && (
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {onAddPipeline && (
              <button
                type="button"
                onClick={() => onAddPipeline(section.id)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 border border-emerald-100 hover:bg-emerald-100 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Pipeline
              </button>
            )}

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowSectionMenu(!showSectionMenu)}
                className="rounded-xl border border-gray-200 p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-700 transition-colors"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>

              <AnimatePresence>
                {showSectionMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowSectionMenu(false)} />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -5 }}
                      className="absolute right-0 top-10 z-20 w-48 rounded-2xl border border-gray-100 bg-white p-1.5 shadow-xl"
                    >
                      {onEditSection && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowSectionMenu(false);
                            onEditSection(section);
                          }}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5 text-emerald-500" />
                          Edit Section Details
                        </button>
                      )}
                      {onDeleteSection && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowSectionMenu(false);
                            onDeleteSection(section);
                          }}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete Section
                        </button>
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>

      {/* Pipelines Grid */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="pt-5"
          >
            {section.pipelines.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center bg-gray-50/50">
                <p className="text-xs font-bold text-gray-600">No pipelines added under this section</p>
                {onAddPipeline && (
                  <button
                    type="button"
                    onClick={() => onAddPipeline(section.id)}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-600 transition-all"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Create First Pipeline
                  </button>
                )}
              </div>
            ) : (
              <div className={`grid gap-4 ${getLayoutGridClass(section.layoutType)}`}>
                {section.pipelines.map((pipeline) => (
                  <CustomPipelineCard
                    key={pipeline.id}
                    pipeline={pipeline}
                    onEdit={onEditPipeline}
                    onDuplicate={onDuplicatePipeline}
                    onDelete={onDeletePipeline}
                    onClick={onPipelineClick}
                    canManage={canManage}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
