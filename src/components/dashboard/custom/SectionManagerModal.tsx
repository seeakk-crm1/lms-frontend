import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Pencil, Trash2, LayoutGrid, Check, Loader2 } from 'lucide-react';
import {
  PipelineSection,
  createPipelineSection,
  updatePipelineSection,
  deletePipelineSection,
} from '../../../services/customPipelines.api';

interface SectionManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  sections: PipelineSection[];
}

export const SectionManagerModal: React.FC<SectionManagerModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  sections,
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
      } else {
        await createPipelineSection({
          name: name.trim(),
          description: description.trim() || undefined,
          layoutType,
          visibilityType,
        });
      }
      setIsCreating(false);
      onSuccess();
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Failed to save section');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSection = async () => {
    if (!deletingSection) return;
    try {
      setIsSubmitting(true);
      await deletePipelineSection(deletingSection.id, movePipelinesToId || undefined);
      setDeletingSection(null);
      onSuccess();
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Failed to delete section');
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
          className="relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-500 p-2.5 text-white shadow-md shadow-emerald-500/20">
                <LayoutGrid className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900">Manage Pipeline Sections</h3>
                <p className="text-xs font-semibold text-gray-500">
                  Organize your custom dashboard pipelines into custom sections and grid layouts.
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
                  This section currently contains {deletingSection.pipelines.length} pipelines. Choose how to handle contained pipelines:
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
              <div className="space-y-4 rounded-2xl border border-emerald-100 bg-emerald-50/30 p-5">
                <h4 className="text-sm font-black text-emerald-900">
                  {editingSectionId ? 'Edit Section Details' : 'Create New Section Heading'}
                </h4>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-gray-600">
                    Section Name / Heading <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Today's Sales Priorities"
                    className="mt-1.5 w-full rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 focus:border-emerald-500 focus:outline-none"
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
                    placeholder="e.g. High-priority lead follow-ups and LOB monitoring"
                    className="mt-1.5 w-full rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 focus:border-emerald-500 focus:outline-none"
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
                      className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-800 focus:outline-none"
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
                      className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-800 focus:outline-none"
                    >
                      <option value="PRIVATE">Private to Me</option>
                      <option value="SHARED">Shared</option>
                      <option value="WORKSPACE">Workspace Dashboard</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="flex-1 rounded-xl border border-gray-200 bg-white py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveSection}
                    disabled={isSubmitting || !name.trim()}
                    className="flex-1 rounded-xl bg-emerald-500 py-2.5 text-xs font-black text-white hover:bg-emerald-600 disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : 'Save Section'}
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
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-600 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
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
                  <div className="space-y-2.5">
                    {sections.map((sec) => (
                      <div
                        key={sec.id}
                        className="flex items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                      >
                        <div>
                          <h5 className="text-sm font-black text-gray-900">{sec.name}</h5>
                          <p className="text-xs font-semibold text-gray-400">
                            {sec.pipelines.length} Pipelines • Layout: {sec.layoutType}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(sec)}
                            className="rounded-xl border border-gray-200 p-2 text-gray-500 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingSection(sec)}
                            className="rounded-xl border border-gray-200 p-2 text-red-500 hover:bg-red-50 transition-colors"
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
};
