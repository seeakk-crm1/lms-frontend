import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ClipboardList, Loader2, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { StageRule } from '../../../types/stageRule.types';

export interface StageRuleValueEntry {
  ruleId: string;
  value: string;
}

interface StageRulesTransitionModalProps {
  isOpen: boolean;
  rules: StageRule[];
  isSubmitting?: boolean;
  onClose: () => void;
  onConfirm: (values: StageRuleValueEntry[]) => void;
}

const inputClass =
  'w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10';

const StageRulesTransitionModal: React.FC<StageRulesTransitionModalProps> = ({
  isOpen,
  rules,
  isSubmitting = false,
  onClose,
  onConfirm,
}) => {
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      console.log('[Diagnostic] Portal Mounted');
      console.log('[Diagnostic] Popup Opened', { popup: 'StageRulesTransitionModal' });
      return () => {
        console.log('[Diagnostic] Popup Closed', { popup: 'StageRulesTransitionModal' });
        console.log('[Diagnostic] Portal Unmounted');
      };
    }
  }, [isOpen]);
  const [touched, setTouched] = useState(false);

  const sortedRules = useMemo(
    () => [...rules].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name)),
    [rules],
  );

  useEffect(() => {
    if (!isOpen) return;
    const next: Record<string, string> = {};
    sortedRules.forEach((rule) => {
      next[rule.id] = '';
    });
    setValues(next);
    setTouched(false);
  }, [isOpen, sortedRules]);

  const setRuleValue = useCallback((ruleId: string, value: string) => {
    setValues((current) => ({ ...current, [ruleId]: value }));
  }, []);

  const missingRequired = useMemo(() => {
    if (!touched) return [];
    return sortedRules.filter((rule) => {
      if (!rule.required) return false;
      const raw = values[rule.id];
      return raw === undefined || raw === null || String(raw).trim() === '';
    });
  }, [sortedRules, touched, values]);

  const handleSubmit = useCallback(() => {
    setTouched(true);
    const nextMissing = sortedRules.filter((rule) => {
      if (!rule.required) return false;
      const raw = values[rule.id];
      return raw === undefined || raw === null || String(raw).trim() === '';
    });
    if (nextMissing.length > 0) return;

    for (const rule of sortedRules) {
      const raw = values[rule.id];
      const v = typeof raw === 'string' ? raw.trim() : '';
      if (!v) continue;
      const opts = rule.options || [];
      if ((rule.inputType === 'RADIO' || rule.inputType === 'SELECT') && opts.length > 0 && !opts.includes(v)) {
        toast.error(`Choose a valid option for “${rule.name}”.`);
        return;
      }
    }

    const payload: StageRuleValueEntry[] = sortedRules.map((rule) => ({
      ruleId: rule.id,
      value: typeof values[rule.id] === 'string' ? values[rule.id].trim() : '',
    }));
    onConfirm(payload);
  }, [onConfirm, sortedRules, values]);

  const modalNode = (
    <AnimatePresence>
      {isOpen ? (
      <div className="fixed inset-0 z-[10300] flex items-end justify-center bg-gray-900/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-[28px] bg-white shadow-2xl sm:rounded-[28px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="stage-rules-transition-title"
        >
          <div className="flex items-start justify-between gap-3 border-b border-gray-100 p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <ClipboardList className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Stage transition</p>
                <h2 id="stage-rules-transition-title" className="text-lg font-black text-gray-900 sm:text-xl">
                  Additional information required
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 sm:p-6">
            <div className="space-y-4">
              {sortedRules.map((rule) => {
                const isRequired = rule.required;
                const opts = rule.options || [];

                return (
                  <div key={rule.id} className="space-y-2">
                    <label className="block text-sm font-black text-gray-900">
                      {rule.name}
                      {isRequired ? <span className="ml-1 text-red-500">*</span> : null}
                    </label>

                    {rule.inputType === 'TEXT' ? (
                      <input
                        type="text"
                        value={values[rule.id] ?? ''}
                        onChange={(e) => setRuleValue(rule.id, e.target.value)}
                        className={inputClass}
                        placeholder="Enter text..."
                      />
                    ) : null}

                    {rule.inputType === 'TEXTAREA' ? (
                      <textarea
                        rows={3}
                        value={values[rule.id] ?? ''}
                        onChange={(e) => setRuleValue(rule.id, e.target.value)}
                        className={`${inputClass} resize-none`}
                        placeholder="Enter details..."
                      />
                    ) : null}

                    {rule.inputType === 'SELECT' ? (
                      <select
                        value={values[rule.id] ?? ''}
                        onChange={(e) => setRuleValue(rule.id, e.target.value)}
                        className={inputClass}
                      >
                        <option value="">-- Select option --</option>
                        {opts.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : null}

                    {rule.inputType === 'RADIO' ? (
                      <div className="flex flex-wrap gap-3 pt-1">
                        {opts.map((opt) => {
                          const checked = (values[rule.id] ?? '') === opt;
                          return (
                            <label
                              key={opt}
                              className={`flex cursor-pointer items-center gap-2 rounded-2xl border px-4 py-2.5 text-xs font-bold transition-all ${
                                checked
                                  ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                                  : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`rule-${rule.id}`}
                                value={opt}
                                checked={checked}
                                onChange={() => setRuleValue(rule.id, opt)}
                                className="sr-only"
                              />
                              <span
                                className={`h-3.5 w-3.5 rounded-full border ${
                                  checked ? 'border-emerald-600 bg-emerald-600' : 'border-gray-300 bg-white'
                                }`}
                              />
                              {opt}
                            </label>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-gray-100 p-5 sm:p-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-2xl border border-gray-200 px-5 py-3 text-sm font-black text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-black text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 disabled:opacity-60"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Continue
            </button>
          </div>
        </motion.div>
      </div>
      ) : null}
    </AnimatePresence>
  );

  return typeof document !== 'undefined' ? createPortal(modalNode, document.body) : modalNode;
};

export default memo(StageRulesTransitionModal);
