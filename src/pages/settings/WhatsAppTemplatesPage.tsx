import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Plus,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  X,
  Search,
  Tag,
  Clock,
  User as UserIcon,
  Sparkles,
  Loader2,
} from 'lucide-react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import {
  useCreateWhatsAppTemplateMutation,
  useDeleteWhatsAppTemplateMutation,
  useUpdateWhatsAppTemplateMutation,
  useWhatsAppTemplatesQuery,
} from '../../hooks/useWhatsAppTemplates';
import type {
  WhatsAppTemplate,
  WhatsAppTemplateCategory,
  WhatsAppTemplateStatus,
} from '../../types/whatsappTemplate.types';
import {
  renderWhatsAppTemplate,
  SAMPLE_PREVIEW_CONTEXT,
  WHATSAPP_TEMPLATE_VARIABLES,
} from '../../utils/renderWhatsAppTemplate';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const CATEGORIES: WhatsAppTemplateCategory[] = [
  'Follow-up',
  'Meeting',
  'Quotation',
  'Payment',
  'New Enquiry',
  'Thank You',
  'General',
  'Custom',
];

export const WhatsAppTemplatesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<WhatsAppTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<WhatsAppTemplate | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<WhatsAppTemplateCategory>('Follow-up');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<WhatsAppTemplateStatus>('ACTIVE');

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const { data: templates = [], isLoading } = useWhatsAppTemplatesQuery();
  const createMutation = useCreateWhatsAppTemplateMutation();
  const updateMutation = useUpdateWhatsAppTemplateMutation();
  const deleteMutation = useDeleteWhatsAppTemplateMutation();

  const handleOpenCreateModal = () => {
    setEditingTemplate(null);
    setName('');
    setCategory('Follow-up');
    setMessage(
      'Hi {{lead_name}},\n\nJust following up regarding your enquiry.\n\nPlease let me know a convenient time to connect.\n\nRegards,\n{{assigned_user}}',
    );
    setStatus('ACTIVE');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (tpl: WhatsAppTemplate) => {
    setEditingTemplate(tpl);
    setName(tpl.name);
    setCategory(tpl.category);
    setMessage(tpl.message);
    setStatus(tpl.status);
    setIsModalOpen(true);
  };

  const handleInsertVariable = (varCode: string) => {
    if (!textareaRef.current) {
      setMessage((prev) => prev + varCode);
      return;
    }

    const input = textareaRef.current;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const newText = message.substring(0, start) + varCode + message.substring(end);
    setMessage(newText);

    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + varCode.length, start + varCode.length);
    }, 50);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Template name is required');
      return;
    }
    if (!message.trim()) {
      toast.error('Message content is required');
      return;
    }
    if (message.length > 1000) {
      toast.error('Message content cannot exceed 1000 characters');
      return;
    }

    if (editingTemplate) {
      await updateMutation.mutateAsync({
        id: editingTemplate.id,
        payload: {
          name: name.trim(),
          category,
          message: message.trim(),
          status,
        },
      });
    } else {
      await createMutation.mutateAsync({
        name: name.trim(),
        category,
        message: message.trim(),
        status,
      });
    }
    setIsModalOpen(false);
  };

  const handleToggleStatus = async (tpl: WhatsAppTemplate) => {
    const newStatus: WhatsAppTemplateStatus = tpl.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    await updateMutation.mutateAsync({
      id: tpl.id,
      payload: { status: newStatus },
    });
  };

  const handleDelete = async (tpl: WhatsAppTemplate) => {
    if (window.confirm(`Are you sure you want to delete template "${tpl.name}"?`)) {
      await deleteMutation.mutateAsync(tpl.id);
    }
  };

  const filteredTemplates = templates.filter((tpl) => {
    const matchesSearch =
      tpl.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tpl.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || tpl.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <DashboardLayout>
      <div className="flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar relative p-4 md:p-8">
        <div className="max-w-[1400px] mx-auto w-full space-y-6 md:space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/80 pb-5">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-2xl bg-emerald-100/80 text-emerald-700 shrink-0">
                  <MessageSquare className="h-6 w-6" />
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight truncate">
                  WhatsApp Templates
                </h1>
              </div>
              <p className="mt-1.5 text-xs sm:text-sm font-semibold text-gray-500 max-w-2xl">
                Create reusable WhatsApp messages that can be attached to follow-ups and opened when the follow-up becomes due.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 hover:bg-emerald-700 transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0 self-start sm:self-center"
            >
              <Plus className="h-4 w-4" />
              Create Template
            </button>
          </div>

          {/* Filters Toolbar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm">
            <div className="relative w-full lg:w-80 shrink-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-10 pr-4 py-2.5 text-sm font-medium text-gray-800 placeholder-gray-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedCategory('ALL')}
                className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                  selectedCategory === 'ALL'
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                }`}
              >
                All Categories
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                    selectedCategory === cat
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Template List Grid */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
              <p className="text-sm font-semibold">Loading templates...</p>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-12 text-center">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-800">No templates found</h3>
              <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
                {searchTerm || selectedCategory !== 'ALL'
                  ? 'Try adjusting your search or category filter.'
                  : 'Get started by creating your first WhatsApp follow-up reminder template.'}
              </p>
              {!searchTerm && selectedCategory === 'ALL' && (
                <button
                  type="button"
                  onClick={handleOpenCreateModal}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-all"
                >
                  <Plus className="h-4 w-4" /> Create Template
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTemplates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="group flex flex-col justify-between rounded-3xl border border-gray-200/90 bg-white p-5 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all h-full"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-black text-gray-900 group-hover:text-emerald-700 transition-colors truncate">
                          {tpl.name}
                        </h3>
                        <span className="inline-flex items-center gap-1 mt-1 rounded-md bg-gray-100 px-2.5 py-0.5 text-[11px] font-bold text-gray-600">
                          <Tag className="h-3 w-3" />
                          {tpl.category}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(tpl)}
                        title="Click to toggle status"
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-black uppercase tracking-wider border transition-colors shrink-0 ${
                          tpl.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                        }`}
                      >
                        {tpl.status === 'ACTIVE' ? (
                          <>
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Active
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 text-gray-400" /> Inactive
                          </>
                        )}
                      </button>
                    </div>

                    {/* Short Message Preview */}
                    <div className="rounded-2xl bg-gray-50/80 p-3.5 border border-gray-100 mb-4">
                      <p className="text-xs text-gray-700 font-medium line-clamp-3 leading-relaxed whitespace-pre-wrap">
                        {tpl.message}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-gray-400 font-semibold">
                      <span className="flex items-center gap-1 truncate">
                        <UserIcon className="h-3 w-3 shrink-0" /> {tpl.createdBy?.name || 'System'}
                      </span>
                      <span className="flex items-center gap-1 shrink-0">
                        <Clock className="h-3 w-3" /> {format(new Date(tpl.updatedAt), 'dd MMM yyyy')}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setPreviewTemplate(tpl)}
                        className="flex items-center justify-center py-2 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                        title="Preview Template"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(tpl)}
                        className="flex items-center justify-center py-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                        title="Edit Template"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(tpl)}
                        className="flex items-center justify-center py-2 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
                        title={tpl.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      >
                        {tpl.status === 'ACTIVE' ? <XCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(tpl)}
                        className="flex items-center justify-center py-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                        title="Delete Template"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Create / Edit Form Modal */}
          <AnimatePresence>
            {isModalOpen && (
              <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm overflow-y-auto">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 8 }}
                  className="relative w-full max-w-4xl rounded-3xl bg-white shadow-2xl overflow-hidden my-8"
                >
                  {/* Modal Header */}
                  <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5 bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                      <span className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                        <MessageSquare className="h-5 w-5" />
                      </span>
                      <h2 className="text-xl font-black text-gray-900">
                        {editingTemplate ? 'Edit WhatsApp Template' : 'Create WhatsApp Template'}
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="rounded-xl border border-gray-200 p-2 text-gray-400 hover:bg-gray-50"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmitForm} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      {/* Left Column: Form Controls */}
                      <div className="lg:col-span-7 space-y-5">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                            Template Name *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Follow-up Reminder"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                              Category *
                            </label>
                            <select
                              value={category}
                              onChange={(e) => setCategory(e.target.value as WhatsAppTemplateCategory)}
                              className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm font-semibold text-gray-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            >
                              {CATEGORIES.map((cat) => (
                                <option key={cat} value={cat}>
                                  {cat}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                              Status
                            </label>
                            <select
                              value={status}
                              onChange={(e) => setStatus(e.target.value as WhatsAppTemplateStatus)}
                              className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm font-semibold text-gray-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            >
                              <option value="ACTIVE">ACTIVE</option>
                              <option value="INACTIVE">INACTIVE</option>
                            </select>
                          </div>
                        </div>

                        {/* Clickable Variable Chips */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                              Insert Variables
                            </label>
                            <span className="text-[11px] font-medium text-gray-400">
                              Click chip to insert at cursor
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {WHATSAPP_TEMPLATE_VARIABLES.map((item) => (
                              <button
                                key={item.variable}
                                type="button"
                                onClick={() => handleInsertVariable(item.variable)}
                                className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                              >
                                <Plus className="h-3 w-3" />
                                {item.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Textarea Message Editor */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                              Message *
                            </label>
                            <span
                              className={`text-xs font-bold ${
                                message.length > 1000 ? 'text-rose-600' : 'text-gray-400'
                              }`}
                            >
                              {message.length} / 1000
                            </span>
                          </div>
                          <textarea
                            ref={textareaRef}
                            required
                            rows={7}
                            maxLength={1000}
                            placeholder="Write message template here..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full rounded-2xl border border-gray-300 p-4 text-sm font-medium text-gray-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 leading-relaxed font-sans"
                          />
                        </div>
                      </div>

                      {/* Right Column: Live Preview */}
                      <div className="lg:col-span-5 flex flex-col">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                          <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                          Live WhatsApp Preview
                        </label>
                        <div className="flex-1 rounded-3xl bg-[#efeae2] p-4 border border-gray-200 flex flex-col justify-between min-h-[320px] shadow-inner relative overflow-hidden">
                          {/* Simulated WhatsApp Header */}
                          <div className="flex items-center gap-3 bg-[#075e54] text-white px-4 py-2.5 -mx-4 -mt-4 mb-4 shadow-sm">
                            <div className="h-8 w-8 rounded-full bg-emerald-200 text-emerald-900 font-bold flex items-center justify-center text-xs">
                              AK
                            </div>
                            <div>
                              <p className="text-xs font-bold leading-tight">Ahmed Khan (Sample)</p>
                              <p className="text-[10px] text-emerald-100">online</p>
                            </div>
                          </div>

                          {/* WhatsApp Bubble */}
                          <div className="max-w-[88%] self-end bg-[#dcf8c6] text-gray-900 p-3.5 rounded-2xl rounded-tr-none shadow-sm space-y-2 border border-emerald-200/50">
                            <p className="text-xs font-normal whitespace-pre-wrap leading-relaxed">
                              {renderWhatsAppTemplate(message, SAMPLE_PREVIEW_CONTEXT) || (
                                <span className="text-gray-400 italic">
                                  Your rendered message preview will appear here...
                                </span>
                              )}
                            </p>
                            <div className="text-[10px] text-emerald-800 text-right font-medium">
                              {format(new Date(), 'hh:mm a')} ✓✓
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-gray-300/40 text-[11px] text-gray-500 font-medium text-center">
                            Uses safe sample data for live preview.
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Modal Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={createMutation.isPending || updateMutation.isPending}
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 disabled:opacity-50"
                      >
                        {(createMutation.isPending || updateMutation.isPending) && (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        )}
                        {editingTemplate ? 'Save Changes' : 'Create Template'}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Readonly Preview Modal */}
          <AnimatePresence>
            {previewTemplate && (
              <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl p-6 space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div>
                      <h3 className="text-lg font-black text-gray-900">{previewTemplate.name}</h3>
                      <span className="text-xs font-bold text-emerald-600">{previewTemplate.category}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPreviewTemplate(null)}
                      className="rounded-xl border border-gray-200 p-2 text-gray-400 hover:bg-gray-50"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Raw Template</p>
                    <p className="rounded-xl bg-gray-50 p-3 text-xs font-mono text-gray-800 border border-gray-200 whitespace-pre-wrap">
                      {previewTemplate.message}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Rendered Preview (Sample Data)
                    </p>
                    <div className="rounded-2xl bg-[#efeae2] p-4 border border-gray-200">
                      <div className="max-w-[90%] ml-auto bg-[#dcf8c6] text-gray-900 p-3 rounded-2xl rounded-tr-none shadow-sm text-xs whitespace-pre-wrap leading-relaxed">
                        {renderWhatsAppTemplate(previewTemplate.message, SAMPLE_PREVIEW_CONTEXT)}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setPreviewTemplate(null)}
                      className="rounded-xl bg-gray-900 px-5 py-2 text-xs font-bold text-white"
                    >
                      Close
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default WhatsAppTemplatesPage;
