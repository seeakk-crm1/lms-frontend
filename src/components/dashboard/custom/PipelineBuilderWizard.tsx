import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  X,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Check,
  Filter,
  BarChart3,
  Users,
  Eye,
  Shield,
  Layers,
  Loader2,
  DollarSign,
} from 'lucide-react';
import {
  PipelineSection,
  Pipeline,
  FilterConditionInput,
  previewPipeline,
  createPipeline,
  updatePipeline,
} from '../../../services/customPipelines.api';
import { FilterBuilder } from './FilterBuilder';
import { PipelineWidgetRenderer } from './PipelineWidgetRenderer';
import { formatCurrency } from '../../../utils/currency';

interface PipelineBuilderWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  sections: PipelineSection[];
  initialSectionId?: string;
  editPipeline?: Pipeline | null;
  stages?: Array<{ id: string; name: string }>;
  substages?: Array<{ id: string; name: string; leadStageId: string }>;
  sources?: Array<{ id: string; name: string }>;
  lifecycles?: Array<{ id: string; name: string }>;
  users?: Array<{ id: string; name: string }>;
  offices?: Array<{ id: string; name: string }>;
  departments?: Array<{ id: string; name: string }>;
  dynamicFields?: Array<{ id: string; name: string; inputType: string; options?: Array<{ value: string }> }>;
}

export const PipelineBuilderWizard: React.FC<PipelineBuilderWizardProps> = ({
  isOpen,
  onClose,
  onSuccess,
  sections,
  initialSectionId,
  editPipeline,
  stages = [],
  substages = [],
  sources = [],
  lifecycles = [],
  users = [],
  offices = [],
  departments = [],
  dynamicFields = [],
}) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState<{
    metrics?: any;
    sampleLeads?: any[];
    appliedFiltersCount?: number;
  }>({});

  // Form State
  const [sectionId, setSectionId] = useState(initialSectionId || sections[0]?.id || '');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [metricType, setMetricType] = useState<string>('LEAD_COUNT');
  const [displayType, setDisplayType] = useState<string>('COMPACT_CARD');
  const [filtersJson, setFiltersJson] = useState<FilterConditionInput[]>([]);
  const [filterLogic, setFilterLogic] = useState<'AND' | 'OR'>('AND');
  const [visibilityType, setVisibilityType] = useState<string>('PRIVATE');
  const [clickAction, setClickAction] = useState<string>('OPEN_LEADS');

  useEffect(() => {
    if (editPipeline) {
      setSectionId(editPipeline.sectionId);
      setName(editPipeline.name);
      setDescription(editPipeline.description || '');
      setMetricType(editPipeline.metricType);
      setDisplayType(editPipeline.displayType);
      setFiltersJson(editPipeline.filtersJson || []);
      setFilterLogic(editPipeline.filterLogic || 'AND');
      setVisibilityType(editPipeline.visibilityType);
      setClickAction(editPipeline.clickAction || 'OPEN_LEADS');
    } else {
      const defaultSec = initialSectionId || (sections && sections.length > 0 ? sections[0].id : '');
      setSectionId(defaultSec);
      setName('');
      setDescription('');
      setMetricType('LEAD_COUNT');
      setDisplayType('COMPACT_CARD');
      setFiltersJson([]);
      setFilterLogic('AND');
      setVisibilityType('PRIVATE');
      setClickAction('OPEN_LEADS');
    }
    setStep(1);
  }, [editPipeline, initialSectionId, sections, isOpen]);

  // Ensure sectionId is set when sections load asynchronously
  useEffect(() => {
    if (!sectionId && sections && sections.length > 0) {
      setSectionId(sections[0].id);
    }
  }, [sections, sectionId]);

  // Live preview fetch with 300ms debounce on Step 4 or when filters change
  useEffect(() => {
    if (!isOpen || step !== 4) return;

    console.log('[Dashboard Customization] Filter Changed', {
      metricType,
      filterLogic,
      filtersCount: filtersJson.length,
      filtersJson,
    });

    const timer = setTimeout(() => {
      fetchPreview();
    }, 300);

    return () => clearTimeout(timer);
  }, [step, isOpen, filtersJson, filterLogic, metricType]);

  const fetchPreview = async () => {
    try {
      setIsPreviewLoading(true);
      console.log('[Dashboard Customization] Preview Request Started', {
        metricType,
        filterLogic,
        filtersJson,
      });

      const data = await previewPipeline({
        filtersJson,
        filterLogic,
        metricType,
      });

      console.log('[Dashboard Customization] Preview Response Received', data);
      setPreviewData(data);
    } catch (err) {
      console.error('[Dashboard Customization] Failed to load live preview', err);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      if (editPipeline) {
        await updatePipeline(editPipeline.id, {
          sectionId,
          name: name.trim(),
          description: description.trim() || undefined,
          metricType,
          displayType,
          filtersJson,
          filterLogic,
          visibilityType,
          clickAction,
        });
        toast.success('Pipeline updated successfully!');
      } else {
        await createPipeline({
          sectionId,
          name: name.trim(),
          description: description.trim() || undefined,
          metricType,
          displayType,
          filtersJson,
          filterLogic,
          visibilityType,
          clickAction,
        });
        toast.success('Pipeline created successfully!');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to save custom pipeline');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10300] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative flex h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-500 p-2.5 text-white shadow-md shadow-emerald-500/20">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900">
                  {editPipeline ? 'Edit Custom Pipeline' : 'Create Custom Pipeline'}
                </h3>
                <p className="text-xs font-semibold text-gray-500">
                  Build custom lead views, metrics, and filters for your Dashboard.
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

          {/* Stepper Navigation Bar */}
          <div className="flex border-b border-gray-100 bg-gray-50/70 px-6 py-3 overflow-x-auto">
            {[
              { id: 1, label: 'Section & Details' },
              { id: 2, label: 'Metric & Display' },
              { id: 3, label: 'Filters' },
              { id: 4, label: 'Live Preview' },
              { id: 5, label: 'Visibility' },
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setStep(s.id)}
                className={`flex shrink-0 items-center gap-2 px-3 py-1.5 text-xs font-bold transition-all ${
                  step === s.id
                    ? 'rounded-xl bg-white text-emerald-600 shadow-sm border border-emerald-100'
                    : step > s.id
                    ? 'text-emerald-700'
                    : 'text-gray-400'
                }`}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black ${
                    step === s.id
                      ? 'bg-emerald-500 text-white'
                      : step > s.id
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step > s.id ? <Check className="h-3 w-3" /> : s.id}
                </span>
                {s.label}
              </button>
            ))}
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-gray-600 mb-2">
                    Dashboard Section <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={sectionId || (sections && sections.length > 0 ? sections[0].id : '')}
                    onChange={(e) => setSectionId(e.target.value)}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-800 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
                  >
                    {sections.length === 0 ? (
                      <option value="">Default Dashboard Section</option>
                    ) : (
                      sections.map((sec) => (
                        <option key={sec.id} value={sec.id}>
                          {sec.name} ({sec.layoutType})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-gray-600">
                    Widget / Pipeline Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Qualified Leads This Month"
                    className="mt-1.5 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-800 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
                  />
                  <p className="mt-1 text-[11px] font-semibold text-gray-400">
                    Give this dashboard item a simple name so you can identify it later.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-gray-600">
                    Description / Subheading (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide context or explanation for this pipeline view..."
                    className="mt-1.5 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-800 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                {/* 1. Metric Selection with Category Badges */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <label className="block text-xs font-black uppercase tracking-wider text-gray-700">
                      1. What Do You Want To Measure? (Metric)
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                      { id: 'LEAD_COUNT', label: 'Number Of Leads', category: 'Leads', desc: 'Total matching leads count' },
                      { id: 'TOTAL_EXPECTED_REVENUE', label: 'Total Revenue', category: 'Sales & Revenue', desc: 'Sum of expected revenue (₹)' },
                      { id: 'TOTAL_CLOSED_REVENUE', label: 'Closed Revenue', category: 'Sales & Revenue', desc: 'Sum of won revenue (₹)' },
                      { id: 'AVERAGE_REVENUE', label: 'Average Revenue', category: 'Sales & Revenue', desc: 'Average revenue per lead' },
                      { id: 'CONVERSION_RATE', label: 'Conversion Rate %', category: 'Sales & Revenue', desc: 'Won leads ratio %' },
                      { id: 'LOB_COUNT', label: 'Loss of Business (LOB)', category: 'Leads', desc: 'Count of LOB leads' },
                      { id: 'OVERDUE_FOLLOWUP_COUNT', label: 'Overdue Follow-Ups', category: 'Follow-Ups', desc: 'Pending overdue follow-ups' },
                      { id: 'STAGE_DISTRIBUTION', label: 'Leads By Stage', category: 'Stages', desc: 'Lead counts by pipeline stage' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setMetricType(m.id)}
                        className={`p-4 text-left rounded-2xl border transition-all ${
                          metricType === m.id
                            ? 'border-emerald-500 bg-emerald-50/50 shadow-md ring-2 ring-emerald-500/20'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-100/60 px-2 py-0.5 rounded-md">
                            {m.category}
                          </span>
                        </div>
                        <p className="text-xs font-black text-gray-900">{m.label}</p>
                        <p className="mt-1 text-[11px] font-semibold text-gray-500">{m.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Visual Display Card Selector with Smart Recommendations */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-3">
                    2. How Do You Want To See It? (Display Card Style)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                      {
                        id: 'COMPACT_CARD',
                        label: 'Number Card',
                        desc: 'Best for: Total Leads, Follow-Ups',
                        recommendedFor: ['LEAD_COUNT', 'LOB_COUNT', 'OVERDUE_FOLLOWUP_COUNT'],
                      },
                      {
                        id: 'REVENUE_CARD',
                        label: 'Revenue Metric Card',
                        desc: 'Best for: Expected & Closed Revenue',
                        recommendedFor: ['TOTAL_EXPECTED_REVENUE', 'TOTAL_CLOSED_REVENUE', 'AVERAGE_REVENUE'],
                      },
                      {
                        id: 'PERCENTAGE_CARD',
                        label: 'Percentage Card',
                        desc: 'Best for: Conversion Rate %',
                        recommendedFor: ['CONVERSION_RATE'],
                      },
                      {
                        id: 'STAGE_BAR',
                        label: 'Stage Distribution Bar',
                        desc: 'Best for: Lead Stage Breakdown',
                        recommendedFor: ['STAGE_DISTRIBUTION'],
                      },
                      {
                        id: 'HORIZONTAL_BAR',
                        label: 'Horizontal Bar Chart',
                        desc: 'Best for: User & Branch Comparisons',
                        recommendedFor: ['LEAD_COUNT', 'STAGE_DISTRIBUTION'],
                      },
                      {
                        id: 'MINI_TABLE',
                        label: 'Mini Table View',
                        desc: 'Best for: Detailed Breakdown & Lists',
                        recommendedFor: ['STAGE_DISTRIBUTION', 'TOTAL_EXPECTED_REVENUE'],
                      },
                      {
                        id: 'PROGRESS_BAR',
                        label: 'Progress Bar',
                        desc: 'Best for: Target Tracking & Goals',
                        recommendedFor: ['CONVERSION_RATE', 'TOTAL_CLOSED_REVENUE'],
                      },
                      {
                        id: 'STATUS_CARD',
                        label: 'Status Indicator Card',
                        desc: 'Best for: Overdue & Priority Status',
                        recommendedFor: ['OVERDUE_FOLLOWUP_COUNT', 'LOB_COUNT'],
                      },
                    ].map((d) => {
                      const isRecommended = d.recommendedFor.includes(metricType);
                      return (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => setDisplayType(d.id)}
                          className={`p-3.5 text-left rounded-2xl border transition-all relative ${
                            displayType === d.id
                              ? 'border-emerald-500 bg-emerald-500 text-white shadow-md'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          {isRecommended && (
                            <span className={`absolute top-2.5 right-2.5 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              displayType === d.id ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              ⭐ Recommended
                            </span>
                          )}
                          <p className="text-xs font-black">{d.label}</p>
                          <p className={`mt-1 text-[10px] font-semibold ${displayType === d.id ? 'text-emerald-100' : 'text-gray-400'}`}>
                            {d.desc}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <FilterBuilder
                conditions={filtersJson}
                filterLogic={filterLogic}
                onChange={(conds, logic) => {
                  setFiltersJson(conds);
                  setFilterLogic(logic);
                }}
                stages={stages}
                substages={substages}
                sources={sources}
                lifecycles={lifecycles}
                users={users}
                offices={offices}
                departments={departments}
                dynamicFields={dynamicFields}
              />
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <div>
                    <h4 className="text-sm font-black text-gray-900">Live Pipeline Preview</h4>
                    <p className="text-xs font-semibold text-gray-500">
                      Real-time calculations based on your selected metric and applied filter conditions.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={fetchPreview}
                    disabled={isPreviewLoading}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Loader2 className={`h-3.5 w-3.5 ${isPreviewLoading ? 'animate-spin' : ''}`} />
                    Refresh Preview
                  </button>
                </div>

                {isPreviewLoading ? (
                  <div className="py-12 text-center text-gray-400">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-emerald-500" />
                    <p className="mt-2 text-xs font-bold">Evaluating filter conditions & computing metrics...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Exact Visual Widget Card Preview */}
                    <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-white to-emerald-50/20 p-6 shadow-sm">
                      <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-sm font-black text-gray-900">
                            {name || 'Widget Live Preview'}
                          </span>
                        </div>
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-800">
                          {displayType.replace('_', ' ')}
                        </span>
                      </div>

                      {/* Exact Visual Widget Card Preview via Shared Renderer */}
                      <PipelineWidgetRenderer
                        displayType={displayType}
                        metricType={metricType}
                        metrics={previewData.metrics || {
                          count: 0,
                          totalExpectedRevenue: 0,
                          totalClosedRevenue: 0,
                          averageRevenue: 0,
                          secondaryMetric: 0,
                          stageBreakdown: [],
                        }}
                        name={name || 'Widget Live Preview'}
                      />
                    </div>

                    {/* Metric Cards Summary */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
                        <p className="text-[10px] font-black uppercase tracking-wider text-emerald-700">Matching Leads</p>
                        <p className="mt-1 text-2xl font-black text-emerald-900">{previewData.metrics?.count || 0}</p>
                      </div>
                      <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
                        <p className="text-[10px] font-black uppercase tracking-wider text-blue-700">Expected Revenue</p>
                        <p className="mt-1 text-2xl font-black text-blue-900">
                          {formatCurrency(previewData.metrics?.totalExpectedRevenue || 0)}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-purple-100 bg-purple-50/50 p-4">
                        <p className="text-[10px] font-black uppercase tracking-wider text-purple-700">Applied Filters</p>
                        <p className="mt-1 text-2xl font-black text-purple-900">{filtersJson.length} Conditions</p>
                      </div>
                    </div>

                    {/* Sample Matching Leads Table */}
                    <div>
                      <h5 className="mb-2 text-xs font-black uppercase tracking-wider text-gray-500">Sample Matching Leads</h5>
                      {previewData.sampleLeads && previewData.sampleLeads.length > 0 ? (
                        <div className="overflow-x-auto rounded-2xl border border-gray-200">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-gray-50 font-black uppercase tracking-wider text-gray-500">
                              <tr>
                                <th className="px-4 py-3">Lead Name</th>
                                <th className="px-4 py-3">Stage</th>
                                <th className="px-4 py-3">Assigned User</th>
                                <th className="px-4 py-3">Expected Revenue</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
                              {previewData.sampleLeads.map((lead) => (
                                <tr key={lead.id} className="hover:bg-gray-50/50">
                                  <td className="px-4 py-3 font-bold text-gray-900">{lead.name}</td>
                                  <td className="px-4 py-3">{lead.stage?.name || '—'}</td>
                                  <td className="px-4 py-3">{lead.assignedTo?.name || '—'}</td>
                                  <td className="px-4 py-3">{formatCurrency(lead.expectedRevenue || 0)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-center text-xs font-semibold text-gray-400">
                          No leads match the selected filter criteria.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 5 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-gray-600 mb-3">
                    Visibility & Sharing Controls
                  </label>
                  <div className="space-y-3">
                    {[
                      { id: 'PRIVATE', label: 'Private to Me', desc: 'Only you can view and monitor this custom pipeline.' },
                      { id: 'SHARED', label: 'Shared with Selected Roles / Users', desc: 'Visible to specific team members based on sharing rules.' },
                      { id: 'WORKSPACE', label: 'Workspace Dashboard', desc: 'Visible to all users across the entire workspace.' },
                    ].map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setVisibilityType(v.id)}
                        className={`w-full p-4 text-left rounded-2xl border transition-all ${
                          visibilityType === v.id
                            ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <p className="text-xs font-black text-gray-900">{v.label}</p>
                        <p className="mt-1 text-[11px] font-semibold text-gray-500">{v.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 px-6 py-4">
            <button
              type="button"
              disabled={step === 1}
              onClick={() => setStep(step - 1)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            {step < 5 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                disabled={!name.trim() && step === 1}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-black text-white shadow-md hover:bg-emerald-600 disabled:opacity-50 transition-all"
              >
                Next Step
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || !name.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-2.5 text-xs font-black text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 disabled:opacity-50 transition-all"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {editPipeline ? 'Save Changes' : 'Create Pipeline'}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
