import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  FileText,
  Edit3,
  X,
  ArrowLeft,
  Search,
  Check,
  Tag,
  AlertTriangle,
  ExternalLink,
  Send,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/useAuthStore';
import { hasAnyPermission } from '../../utils/permission.util';
import { useRecordWhatsAppOpenedMutation, useWhatsAppTemplatesQuery } from '../../hooks/useWhatsAppTemplates';
import type { WhatsAppTemplate } from '../../types/whatsappTemplate.types';
import { renderWhatsAppTemplate } from '../../utils/renderWhatsAppTemplate';
import { normalizePhoneForWhatsApp, buildWhatsAppUrl, openWhatsAppChat } from '../../utils/whatsapp';

export type WhatsAppComposerMode = 'CHOICE' | 'SELECT_TEMPLATE' | 'PREVIEW_TEMPLATE' | 'DIRECT_MESSAGE';

export interface WhatsAppMessageComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  phone?: string | null;
  lead?: any;
  followup?: any;
  source?: string;
  audit?: any;
}

export const WhatsAppMessageComposerModal: React.FC<WhatsAppMessageComposerModalProps> = ({
  isOpen,
  onClose,
  phone,
  lead,
  followup,
  source = 'Lead List',
  audit,
}) => {
  const { user } = useAuthStore();
  const recordOpenedMut = useRecordWhatsAppOpenedMutation();

  const [mode, setMode] = useState<WhatsAppComposerMode>('CHOICE');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null);
  const [renderedMessage, setRenderedMessage] = useState('');
  const [directMessage, setDirectMessage] = useState('');

  const canManageTemplates = hasAnyPermission(user?.permissions || [], [
    'WHATSAPP_TEMPLATES_CREATE',
    'SYSTEM_CONFIG',
    'manage_followup_settings',
  ]);

  const { data: templates = [], isLoading: isLoadingTemplates } = useWhatsAppTemplatesQuery('ACTIVE', isOpen);

  const rawPhone = phone || lead?.phone || lead?.leadPhone || followup?.leadPhone || null;
  const leadName = lead?.name || lead?.leadName || followup?.leadName || audit?.entityName || 'Lead';
  const companyName = lead?.companyName || lead?.leadCompanyName || followup?.leadCompanyName || '';
  const assignedUserName = lead?.assignedTo?.displayName || lead?.assignedUserName || followup?.assignedUserName || user?.displayName || user?.name || '';
  const leadStageName = lead?.stage?.name || lead?.leadStage?.name || followup?.leadStage?.name || '';

  const normalizedPhone = useMemo(() => normalizePhoneForWhatsApp(rawPhone), [rawPhone]);
  const hasValidPhone = Boolean(normalizedPhone);

  const followupContext = useMemo(() => {
    const scheduledAtRaw = followup?.scheduledAt || lead?.nextFollowUpDate || lead?.scheduledAt;
    if (!scheduledAtRaw) {
      return { followupDate: '', followupTime: '' };
    }
    try {
      const dt = new Date(scheduledAtRaw);
      if (Number.isNaN(dt.getTime())) {
        return { followupDate: '', followupTime: '' };
      }
      return {
        followupDate: format(dt, 'dd MMM yyyy'),
        followupTime: format(dt, 'hh:mm a'),
      };
    } catch {
      return { followupDate: '', followupTime: '' };
    }
  }, [followup, lead]);

  const renderContext = useMemo(
    () => ({
      leadName,
      mobile: rawPhone || '',
      assignedUser: assignedUserName,
      companyName,
      followupDate: followupContext.followupDate,
      followupTime: followupContext.followupTime,
      leadStage: leadStageName,
    }),
    [leadName, rawPhone, assignedUserName, companyName, followupContext, leadStageName]
  );

  const handleSelectTemplate = (tpl: WhatsAppTemplate) => {
    setSelectedTemplate(tpl);
    const compiled = renderWhatsAppTemplate(tpl.message, renderContext, { emptyFallback: '' });
    setRenderedMessage(compiled);
    setMode('PREVIEW_TEMPLATE');
  };

  const handleReset = () => {
    setMode('CHOICE');
    setSearchTerm('');
    setSelectedTemplate(null);
    setRenderedMessage('');
    setDirectMessage('');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleOpenWhatsApp = (messageText: string, isTemplateMode: boolean) => {
    if (!hasValidPhone) {
      toast.error('Unable to open WhatsApp. Please update the lead\'s mobile number.');
      return;
    }
    if (!messageText.trim()) {
      toast.error('Please enter a message before opening WhatsApp.');
      return;
    }

    const opened = openWhatsAppChat(rawPhone, { message: messageText.trim() });
    if (!opened) {
      toast.error('Failed to open WhatsApp window.');
      return;
    }

    // Fire audit logging
    const leadId = lead?.id || followup?.leadId || audit?.entityId;
    const followUpId = followup?.id;

    recordOpenedMut.mutate({
      leadId,
      followUpId,
      mode: isTemplateMode ? 'TEMPLATE' : 'DIRECT',
      templateName: isTemplateMode ? selectedTemplate?.name || 'Template' : undefined,
      source,
    });

    handleClose();
  };

  const filteredTemplates = useMemo(() => {
    if (!searchTerm.trim()) return templates;
    const term = searchTerm.toLowerCase();
    return templates.filter(
      (t) => t.name.toLowerCase().includes(term) || t.category.toLowerCase().includes(term)
    );
  }, [templates, searchTerm]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-white sticky top-0 z-10">
            <div className="flex items-center gap-3">
              {mode !== 'CHOICE' ? (
                <button
                  type="button"
                  onClick={() => {
                    if (mode === 'PREVIEW_TEMPLATE') setMode('SELECT_TEMPLATE');
                    else setMode('CHOICE');
                  }}
                  className="rounded-xl border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
              ) : (
                <span className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                  <MessageSquare className="h-5 w-5" />
                </span>
              )}
              <div>
                <h3 className="text-base font-black text-gray-900 leading-tight">
                  {mode === 'CHOICE' && 'Send WhatsApp Message'}
                  {mode === 'SELECT_TEMPLATE' && 'Select WhatsApp Template'}
                  {mode === 'PREVIEW_TEMPLATE' && 'WhatsApp Message Preview'}
                  {mode === 'DIRECT_MESSAGE' && 'Direct WhatsApp Message'}
                </h3>
                <p className="text-xs font-semibold text-gray-500">
                  {leadName} {rawPhone ? `• ${rawPhone}` : ''}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl border border-gray-200 p-2 text-gray-400 hover:bg-gray-50 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Invalid Phone Warning Banner */}
          {!hasValidPhone && (
            <div className="bg-amber-50 px-6 py-3 border-b border-amber-200 flex items-center gap-2.5 text-amber-800 text-xs font-bold">
              <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
              <span>WhatsApp number unavailable. Please update lead's mobile number.</span>
            </div>
          )}

          {/* Body Content by Mode */}
          <div className="p-6 overflow-y-auto flex-1 space-y-5">
            {/* MODE 1: CHOICE */}
            {mode === 'CHOICE' && (
              <div className="space-y-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  How would you like to continue?
                </p>

                <div className="grid grid-cols-1 gap-3.5">
                  <button
                    type="button"
                    onClick={() => setMode('SELECT_TEMPLATE')}
                    className="group flex items-start gap-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 text-left hover:bg-emerald-50 hover:border-emerald-300 transition-all shadow-sm"
                  >
                    <span className="p-3 rounded-xl bg-emerald-500 text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                      <Sparkles className="h-5 w-5" />
                    </span>
                    <div className="flex-1">
                      <h4 className="text-sm font-black text-gray-900 group-hover:text-emerald-800">
                        Use Template
                      </h4>
                      <p className="text-xs font-medium text-gray-600 mt-0.5 leading-relaxed">
                        Choose a saved WhatsApp template and personalize it automatically with lead details.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode('DIRECT_MESSAGE')}
                    className="group flex items-start gap-4 rounded-2xl border border-gray-200 bg-white p-4 text-left hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                  >
                    <span className="p-3 rounded-xl bg-gray-900 text-white shadow-md group-hover:scale-105 transition-transform">
                      <Edit3 className="h-5 w-5" />
                    </span>
                    <div className="flex-1">
                      <h4 className="text-sm font-black text-gray-900">Write Message</h4>
                      <p className="text-xs font-medium text-gray-600 mt-0.5 leading-relaxed">
                        Write a message directly to the lead without using a saved template.
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* MODE 2: SELECT TEMPLATE */}
            {mode === 'SELECT_TEMPLATE' && (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search templates by name or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 pl-10 pr-4 py-2.5 text-xs font-semibold text-gray-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                {isLoadingTemplates ? (
                  <div className="flex flex-col items-center justify-center py-10 text-gray-400 space-y-2">
                    <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                    <p className="text-xs font-semibold">Loading active templates...</p>
                  </div>
                ) : filteredTemplates.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50/50 p-8 text-center space-y-3">
                    <MessageSquare className="h-10 w-10 text-gray-300 mx-auto" />
                    <div>
                      <p className="text-xs font-bold text-gray-800">
                        {searchTerm ? 'No templates match your search.' : 'No active WhatsApp templates available.'}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-1">
                        You can write a direct message instead.
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setMode('DIRECT_MESSAGE')}
                        className="rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
                      >
                        Write Direct Message
                      </button>
                      {canManageTemplates && (
                        <Link
                          to="/settings/whatsapp-templates"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-xl border border-gray-300 bg-white px-3.5 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50 inline-flex items-center gap-1"
                        >
                          Manage Templates <ExternalLink className="h-3 w-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                    {filteredTemplates.map((tpl) => (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => handleSelectTemplate(tpl)}
                        className="w-full group flex flex-col rounded-2xl border border-gray-200 bg-white p-3.5 text-left hover:border-emerald-500 hover:bg-emerald-50/30 transition-all shadow-sm"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-black text-gray-900 group-hover:text-emerald-700">
                            {tpl.name}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                            <Tag className="h-2.5 w-2.5" />
                            {tpl.category}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed whitespace-pre-wrap">
                          {tpl.message}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* MODE 3: PREVIEW TEMPLATE */}
            {mode === 'PREVIEW_TEMPLATE' && selectedTemplate && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs border-b border-gray-100 pb-2">
                  <span className="font-bold text-gray-500 uppercase tracking-wider">Template:</span>
                  <span className="font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    {selectedTemplate.name} ({selectedTemplate.category})
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Rendered Message (Editable Preview)
                    </label>
                    <span className="text-[11px] font-medium text-gray-400">
                      Edits apply to this chat only
                    </span>
                  </div>
                  <div className="rounded-2xl bg-[#efeae2] p-3.5 border border-gray-200 shadow-inner">
                    <div className="bg-[#dcf8c6] text-gray-900 p-3 rounded-2xl rounded-tr-none shadow-sm border border-emerald-200/60">
                      <textarea
                        rows={6}
                        value={renderedMessage}
                        onChange={(e) => setRenderedMessage(e.target.value)}
                        className="w-full bg-transparent text-xs font-medium text-gray-900 border-none outline-none resize-y leading-relaxed font-sans focus:ring-0 p-0"
                      />
                      <div className="text-[10px] text-emerald-800 text-right font-semibold mt-1">
                        {format(new Date(), 'hh:mm a')} ✓✓
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MODE 4: DIRECT MESSAGE */}
            {mode === 'DIRECT_MESSAGE' && (
              <div className="space-y-3.5">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Message Content *
                    </label>
                    <span
                      className={`text-xs font-bold ${
                        directMessage.length > 1000 ? 'text-rose-600' : 'text-gray-400'
                      }`}
                    >
                      {directMessage.length} / 1000
                    </span>
                  </div>
                  <textarea
                    rows={7}
                    maxLength={1000}
                    placeholder="Type your message here..."
                    value={directMessage}
                    onChange={(e) => setDirectMessage(e.target.value)}
                    className="w-full rounded-2xl border border-gray-300 p-3.5 text-xs font-semibold text-gray-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 leading-relaxed"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4 bg-white sticky bottom-0 z-10">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>

            {mode === 'PREVIEW_TEMPLATE' && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMode('SELECT_TEMPLATE')}
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={!hasValidPhone || !renderedMessage.trim() || recordOpenedMut.isPending}
                  onClick={() => handleOpenWhatsApp(renderedMessage, true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {recordOpenedMut.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Open WhatsApp
                </button>
              </div>
            )}

            {mode === 'DIRECT_MESSAGE' && (
              <button
                type="button"
                disabled={!hasValidPhone || !directMessage.trim() || recordOpenedMut.isPending}
                onClick={() => handleOpenWhatsApp(directMessage, false)}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {recordOpenedMut.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Open WhatsApp
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default WhatsAppMessageComposerModal;
