import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  X,
  Plus,
  Pencil,
  Trash2,
  LayoutGrid,
  Loader2,
  SlidersHorizontal,
  BarChart3,
  PieChart,
  Tag,
  Sparkles,
} from 'lucide-react';
import {
  PipelineSection,
  Pipeline,
  createPipelineSection,
  updatePipelineSection,
  deletePipelineSection,
  deletePipeline,
} from '../../../services/customPipelines.api';

const DISPLAY_TYPE_LABELS: Record<string, string> = {
  COMPACT_CARD: 'Number Card (KPI)',
  REVENUE_CARD: 'Revenue Metric Card',
  PERCENTAGE_CARD: 'Percentage Card',
  STAGE_BAR: 'Stage Distribution Bar',
  HORIZONTAL_BAR: 'Horizontal Bar Chart',
  MINI_TABLE: 'Mini Table View',
  PROGRESS_BAR: 'Progress Bar',
  STATUS_CARD: 'Status Indicator Card',
  PIE_CHART: 'Pie / Donut Chart',
};

const METRIC_TYPE_LABELS: Record<string, string> = {
  LEAD_COUNT: 'Number Of Leads',
  TOTAL_EXPECTED_REVENUE: 'Total Expected Revenue',
  TOTAL_CLOSED_REVENUE: 'Total Closed Revenue',
  AVERAGE_REVENUE: 'Average Revenue',
  CONVERSION_RATE: 'Conversion Rate %',
  LOB_COUNT: 'Loss of Business (LOB)',
  OVERDUE_FOLLOWUP_COUNT: 'Overdue Follow-Ups',
  STAGE_DISTRIBUTION: 'Leads By Stage',
};

export interface SectionManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  sections: PipelineSection[];
  onAddPipeline?: (sectionId: string) => void;
  onEditPipeline?: (pipeline: Pipeline) => void;
  onDeletePipeline?: (pipeline: Pipeline) => void;
}

export const SectionManagerModal: React.FC<SectionManagerModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  sections,
  onAddPipeline,
  onEditPipeline,
  onDeletePipeline,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Section Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [layoutType, setLayoutType] = useState<string>('AUTO');
  const [visibilityType, setVisibilityType] = useState<string>('PRIVATE');

  // Delete Section Confirmation State
  const [deletingSection, setDeletingSection] = useState<PipelineSection | null>(null);
  const [movePipelinesToId, setMovePipelinesToId] = useState<string>('');

  const currentSection = sections.find((s) => s.id === editingSectionId);
  const currentPipelines = currentSection?.pipelines || [];

  const startCreate = () => {
    setEditingSectionId(null);
    setName('');
    setDescription('');
    setLayoutType('AUTO');
    setVisibilityType('PRIVATE');
    setIsCreating(true);
  };

  const startEdit = (sec: PipelineSection) => {
    setEditingSectionId(sec.id);
    setName(sec.name);
    setDescription(sec.description || '');
    setLayoutType(sec.layoutType);
    setVisibilityType(sec.visibilityType);
    setIsCreating(true);
  };

  const handleSaveSection = async () => {
    if (!name.trim()) return;
    try {
      setIsSubmitting(true);
      if (editingSectionId) {
        await updatePipelineSection(editingSectionId, {
          name: name.trim(),
          description: description.trim() || undefined,
          layoutType,
          visibilityType,
        });
        toast.success('Section details saved!');
      } else {
        const created = await createPipelineSection({
          name: name.trim(),
          description: description.trim() || undefined,
          layoutType,
          visibilityType,
        });
        toast.success('New section created successfully!');
        setEditingSectionId(created.id);
      }
      onSuccess();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to save section');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSection = async () => {
    if (!deletingSection) return;
    try {
      setIsSubmitting(true);
      await deletePipelineSection(deletingSection.id, movePipelinesToId || undefined);
      toast.success('Section deleted successfully!');
      setDeletingSection(null);
      onSuccess();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to delete section');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSinglePipeline = async (pipeline: Pipeline) => {
    if (onDeletePipeline) {
      onDeletePipeline(pipeline);
    } else {
      try {
        await deletePipeline(pipeline.id);
        toast.success(`Widget "${pipeline.name}" deleted.`);
        onSuccess();
      } catch (err: any) {
        toast.error(err?.response?.data?.error || 'Failed to delete widget');
      }
    }
  };

  if (!isOpen) return null;

  const modalNode = (
    <AnimatePresence>
      <div
        onClick={(e) => {
          e.stopPropagation();
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        className="fixed inset-0 z-[10300] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm"
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-white sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-500 p-2.5 text-white shadow-md shadow-emerald-500/20">
                <LayoutGrid className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900">
                  {isCreating ? (editingSectionId ? 'Edit Section & Widgets' : 'Create New Section') : 'Manage Pipeline Sections'}
                </h3>
                <p className="text-xs font-semibold text-gray-500">
                  Configure custom dashboard sections, grid layouts, widget visualizations, and filter rules.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-700 transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {deletingSection ? (
              <div className="space-y-4 rounded-2xl border border-red-100 bg-red-50/40 p-5">
                <h4 className="text-sm font-black text-red-900">
                  Delete Section &ldquo;{deletingSection.name}&rdquo;?
                </h4>
                <p className="text-xs font-semibold text-red-700">
                  This section currently contains {deletingSection.pipelines.length} pipelines/widgets. Choose how to handle contained pipelines:
                </p>

                {deletingSection.pipelines.length > 0 && (
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-red-900 mb-1.5">
                      Move Pipelines to Another Section:
                    </label>
                    <select
                      value={movePipelinesToId}
                      onChange={(e) => setMovePipelinesToId(e.target.value)}
                      className="w-full rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-gray-800 focus:outline-none"
                    >
                      <option value="">-- Delete Contained Pipelines Too --</option>
                      {sections
                        .filter((s) => s.id !== deletingSection.id)
                        .map((s) => (
                          <option key={s.id} value={s.id}>
                            Move to {s.name}
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setDeletingSection(null)}
                    className="flex-1 rounded-xl border border-gray-200 bg-white py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteSection}
                    disabled={isSubmitting}
                    className="flex-1 rounded-xl bg-red-600 py-2.5 text-xs font-black text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : 'Confirm Delete'}
                  </button>
                </div>
              </div>
            ) : isCreating ? (
              <div className="space-y-6">
                {/* Section Details Form */}
                <div className="space-y-4 rounded-2xl border border-emerald-100 bg-emerald-50/30 p-5">
                  <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-emerald-900 flex items-center gap-2">
                      <LayoutGrid className="h-4 w-4 text-emerald-600" />
                      Section Details & Layout
                    </h4>
                    {editingSectionId && (
                      <span className="text-[10px] font-black text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full border border-emerald-200">
                        {currentPipelines.length} Widgets
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-gray-600">
                      Section Name / Heading <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Digital Marketing Performance"
                      className="mt-1.5 w-full rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 focus:border-emerald-500 focus:outline-none shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-gray-600">
                      Description (Optional)
                    </label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="e.g. Marketing pipeline performance, conversion rates, and lead sources"
                      className="mt-1.5 w-full rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 focus:border-emerald-500 focus:outline-none shadow-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-gray-600">
                        Grid Layout
                      </label>
                      <select
                        value={layoutType}
                        onChange={(e) => setLayoutType(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-800 focus:outline-none shadow-sm"
                      >
                        <option value="AUTO">Auto Responsive Grid</option>
                        <option value="FULL">Full Width (1 Column)</option>
                        <option value="TWO_COL">2 Columns</option>
                        <option value="THREE_COL">3 Columns</option>
                        <option value="FOUR_COL">4 Columns</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-gray-600">
                        Visibility
                      </label>
                      <select
                        value={visibilityType}
                        onChange={(e) => setVisibilityType(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-800 focus:outline-none shadow-sm"
                      >
                        <option value="PRIVATE">Private to Me</option>
                        <option value="SHARED">Shared</option>
                        <option value="WORKSPACE">Workspace Dashboard</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-end pt-1">
                    <button
                      type="button"
                      onClick={handleSaveSection}
                      disabled={isSubmitting || !name.trim()}
                      className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-black text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm"
                    >
                      {isSubmitting ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : 'Save Section Details'}
                    </button>
                  </div>
                </div>

                {/* Section Widgets & Pipelines Configurator */}
                {editingSectionId && (
                  <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-gray-900 flex items-center gap-2">
                          <SlidersHorizontal className="h-4 w-4 text-emerald-600" />
                          Section Widgets & Pipelines ({currentPipelines.length})
                        </h4>
                        <p className="text-[11px] font-semibold text-gray-500 mt-0.5">
                          Add, edit, or configure KPI cards, pie charts, bar charts, line charts, tables, and funnels for this section.
                        </p>
                      </div>

                      {onAddPipeline && (
                        <button
                          type="button"
                          onClick={() => onAddPipeline(editingSectionId)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-black text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-600 transition-all cursor-pointer"
                        >
                          <Plus className="h-4 w-4" />
                          Add Widget / Pipeline
                        </button>
                      )}
                    </div>

                    {currentPipelines.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-8 text-center space-y-2">
                        <BarChart3 className="h-8 w-8 text-gray-300 mx-auto" />
                        <p className="text-xs font-bold text-gray-700">No widgets or pipelines added to this section yet</p>
                        <p className="text-[11px] font-medium text-gray-500 max-w-sm mx-auto">
                          Click below to configure your first KPI card, pie/donut chart, bar chart, line chart, or conversion funnel.
                        </p>
                        {onAddPipeline && (
                          <button
                            type="button"
                            onClick={() => onAddPipeline(editingSectionId)}
                            className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700"
                          >
                            <Plus className="h-4 w-4" />
                            Add First Widget
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {currentPipelines.map((pipe, index) => {
                          const displayLabel = DISPLAY_TYPE_LABELS[pipe.displayType] || pipe.displayType;
                          const metricLabel = METRIC_TYPE_LABELS[pipe.metricType] || pipe.metricType;
                          const filtersCount = pipe.filtersJson?.length || 0;

                          return (
                            <div
                              key={pipe.id}
                              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-gray-50/40 p-4 hover:bg-emerald-50/30 hover:border-emerald-200 transition-all shadow-sm"
                            >
                              <div className="flex items-start gap-3">
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-gray-200 text-[10px] font-black text-gray-700 mt-0.5">
                                  {index + 1}
                                </span>
                                <div>
                                  <h5 className="text-xs font-black text-gray-900">{pipe.name}</h5>
                                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100/70 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200/50">
                                      <PieChart className="h-2.5 w-2.5" />
                                      {displayLabel}
                                    </span>
                                    <span className="inline-flex items-center gap-1 rounded-md bg-blue-100/70 px-2 py-0.5 text-[10px] font-bold text-blue-800 border border-blue-200/50">
                                      <Tag className="h-2.5 w-2.5" />
                                      {metricLabel}
                                    </span>
                                    {filtersCount > 0 && (
                                      <span className="inline-flex items-center gap-1 rounded-md bg-purple-100/70 px-2 py-0.5 text-[10px] font-bold text-purple-800 border border-purple-200/50">
                                        {filtersCount} {filtersCount === 1 ? 'Filter' : 'Filters'} ({pipe.filterLogic || 'AND'})
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 self-end sm:self-center">
                                {onEditPipeline && (
                                  <button
                                    type="button"
                                    onClick={() => onEditPipeline(pipe)}
                                    className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors shadow-sm"
                                  >
                                    <Pencil className="h-3.5 w-3.5 text-emerald-600" />
                                    Edit Widget
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSinglePipeline(pipe)}
                                  className="rounded-xl border border-gray-200 bg-white p-1.5 text-red-500 hover:bg-red-50 transition-colors shadow-sm"
                                  title="Delete widget"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50"
                  >
                    Back to Sections List
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-500">
                    Existing Pipeline Sections ({sections.length})
                  </h4>
                  <button
                    type="button"
                    onClick={startCreate}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-600 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    New Section
                  </button>
                </div>

                {sections.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center bg-gray-50/50">
                    <p className="text-xs font-bold text-gray-600">No custom sections created yet</p>
                    <button
                      type="button"
                      onClick={startCreate}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-white"
                    >
                      Create First Section
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sections.map((sec) => (
                      <div
                        key={sec.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:border-gray-300 transition-all"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="text-sm font-black text-gray-900">{sec.name}</h5>
                            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-black text-emerald-700 border border-emerald-100">
                              {sec.pipelines.length} {sec.pipelines.length === 1 ? 'Widget' : 'Widgets'}
                            </span>
                          </div>
                          {sec.description && (
                            <p className="text-xs font-semibold text-gray-500 mt-0.5">{sec.description}</p>
                          )}
                          <p className="text-[11px] font-semibold text-gray-400 mt-1">
                            Grid Layout: {sec.layoutType} • Visibility: {sec.visibilityType}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {onAddPipeline && (
                            <button
                              type="button"
                              onClick={() => onAddPipeline(sec.id)}
                              className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 border border-emerald-100 hover:bg-emerald-100 transition-colors"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              Add Widget
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => startEdit(sec)}
                            className="inline-flex items-center gap-1 rounded-xl border border-gray-200 p-2 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                            title="Edit Section & Widgets"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingSection(sec)}
                            className="rounded-xl border border-gray-200 p-2 text-red-500 hover:bg-red-50 transition-colors"
                            title="Delete Section"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return typeof document !== 'undefined' ? createPortal(modalNode, document.body) : modalNode;
};

export default SectionManagerModal;
