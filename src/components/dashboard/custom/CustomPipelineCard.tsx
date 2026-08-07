import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MoreVertical,
  Pencil,
  Copy,
  Trash2,
  RefreshCw,
  ExternalLink,
  DollarSign,
  TrendingUp,
  Users,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import type { Pipeline } from '../../../services/customPipelines.api';
import { PipelineWidgetRenderer } from './PipelineWidgetRenderer';
import { formatCurrency } from '../../../utils/currency';

interface CustomPipelineCardProps {
  pipeline: Pipeline;
  onEdit?: (pipeline: Pipeline) => void;
  onDuplicate?: (pipeline: Pipeline) => void;
  onDelete?: (pipeline: Pipeline) => void;
  onClick?: (pipeline: Pipeline) => void;
  canManage?: boolean;
}

export const CustomPipelineCard: React.FC<CustomPipelineCardProps> = ({
  pipeline,
  onEdit,
  onDuplicate,
  onDelete,
  onClick,
  canManage = true,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const metrics = pipeline.metrics || {
    count: 0,
    totalExpectedRevenue: 0,
    totalClosedRevenue: 0,
    averageRevenue: 0,
    secondaryMetric: 0,
    stageBreakdown: [],
    lastRefreshedAt: new Date().toISOString(),
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick(pipeline);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      onClick={handleCardClick}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm transition-all hover:border-emerald-500/40 hover:shadow-md"
    >
      {/* Top Bar: Title & Action Menu */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="truncate text-sm font-black text-gray-900 group-hover:text-emerald-600 transition-colors">
              {pipeline.name}
            </h4>
            {pipeline.visibilityType === 'SHARED' && (
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[9px] font-extrabold uppercase text-blue-600">
                Shared
              </span>
            )}
            {pipeline.visibilityType === 'WORKSPACE' && (
              <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[9px] font-extrabold uppercase text-purple-600">
                Workspace
              </span>
            )}
          </div>
          {pipeline.description && (
            <p className="mt-0.5 truncate text-xs font-semibold text-gray-400">{pipeline.description}</p>
          )}
        </div>

        {canManage && (
          <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              className="rounded-xl p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            <AnimatePresence>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -5 }}
                    className="absolute right-0 top-8 z-20 w-44 rounded-2xl border border-gray-100 bg-white p-1.5 shadow-xl"
                  >
                    {onEdit && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowMenu(false);
                          onEdit(pipeline);
                        }}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5 text-emerald-500" />
                        Edit Pipeline
                      </button>
                    )}
                    {onDuplicate && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowMenu(false);
                          onDuplicate(pipeline);
                        }}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        <Copy className="h-3.5 w-3.5 text-blue-500" />
                        Duplicate
                      </button>
                    )}
                    {onDelete && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowMenu(false);
                          onDelete(pipeline);
                        }}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete Pipeline
                      </button>
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Main Metric Display Body */}
      <div className="mt-4">
        <PipelineWidgetRenderer
          displayType={pipeline.displayType}
          metricType={pipeline.metricType}
          metrics={metrics}
          name={pipeline.name}
        />
      </div>

      {/* Footer info & CTA link */}
      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-[11px] font-bold text-gray-400">
        <span>{pipeline.filtersJson?.length || 0} Filters Applied</span>
        <span className="flex items-center gap-1 text-emerald-600 group-hover:translate-x-0.5 transition-transform">
          View Leads
          <ChevronRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </motion.div>
  );
};
