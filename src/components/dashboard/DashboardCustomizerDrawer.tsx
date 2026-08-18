import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  GripVertical,
  RotateCcw,
  Check,
  Loader2,
  SlidersHorizontal,
  ChevronUp,
  ChevronDown,
  Info,
} from 'lucide-react';
import toast from 'react-hot-toast';
import type {
  DashboardPreferenceItem,
  DashboardPreferencesPayload,
} from '../../types/dashboardPreferences.types';
import {
  useUpdateDashboardPreferencesMutation,
  useResetDashboardPreferencesMutation,
} from '../../hooks/useDashboardPreferences';

export interface DashboardCustomizerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  preferencesData?: DashboardPreferencesPayload;
}

export const DashboardCustomizerDrawer: React.FC<DashboardCustomizerDrawerProps> = ({
  isOpen,
  onClose,
  preferencesData,
}) => {
  const updateMut = useUpdateDashboardPreferencesMutation();
  const resetMut = useResetDashboardPreferencesMutation();

  const [cards, setCards] = useState<DashboardPreferenceItem[]>([]);
  const [sections, setSections] = useState<DashboardPreferenceItem[]>([]);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const canRename = preferencesData?.canRename ?? false;

  useEffect(() => {
    if (preferencesData) {
      setCards(preferencesData.cards ? [...preferencesData.cards] : []);
      setSections(preferencesData.sections ? [...preferencesData.sections] : []);
    }
  }, [preferencesData, isOpen]);

  const handleToggleCard = (key: string) => {
    setCards((prev) =>
      prev.map((c) => (c.key === key ? { ...c, isVisible: !c.isVisible } : c))
    );
  };

  const handleToggleSection = (key: string) => {
    setSections((prev) =>
      prev.map((s) => (s.key === key ? { ...s, isVisible: !s.isVisible } : s))
    );
  };

  const handleRenameCard = (key: string, val: string) => {
    setCards((prev) =>
      prev.map((c) =>
        c.key === key
          ? {
              ...c,
              customTitle: val,
              displayTitle: val.trim() || c.defaultTitle,
            }
          : c
      )
    );
  };

  const handleRenameSection = (key: string, val: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.key === key
          ? {
              ...s,
              customTitle: val,
              displayTitle: val.trim() || s.defaultTitle,
            }
          : s
      )
    );
  };

  const handleMoveCard = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= cards.length) return;
    const next = [...cards];
    const temp = next[index];
    next[index] = next[targetIndex];
    next[targetIndex] = temp;
    setCards(next);
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;
    const next = [...sections];
    const temp = next[index];
    next[index] = next[targetIndex];
    next[targetIndex] = temp;
    setSections(next);
  };

  const handleSave = async () => {
    const allItems = [...cards, ...sections];
    const hasVisible = allItems.some((i) => i.isVisible);
    if (!hasVisible) {
      toast.error('At least one dashboard card or section must remain visible.');
      return;
    }

    const payloadItems = [
      ...cards.map((item, idx) => ({
        key: item.key,
        type: item.type,
        isVisible: item.isVisible,
        displayOrder: idx + 1,
        customTitle: item.customTitle?.trim() || null,
      })),
      ...sections.map((item, idx) => ({
        key: item.key,
        type: item.type,
        isVisible: item.isVisible,
        displayOrder: idx + 1,
        customTitle: item.customTitle?.trim() || null,
      })),
    ];

    try {
      await updateMut.mutateAsync({ items: payloadItems });
      onClose();
    } catch {
      // error handled in mutation
    }
  };

  const handleConfirmReset = async () => {
    try {
      await resetMut.mutateAsync();
      setIsResetConfirmOpen(false);
      onClose();
    } catch {
      // error handled in mutation
    }
  };

  if (!isOpen) return null;

  const drawerNode = (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9990] flex justify-end bg-gray-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0"
        />

        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="relative z-10 flex h-full w-full max-w-lg flex-col bg-white shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5 bg-white sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-700">
                <SlidersHorizontal className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-base font-black text-gray-900 leading-tight">Customize Dashboard</h3>
                <p className="text-xs font-semibold text-gray-500 mt-0.5">
                  Choose which cards and sections appear on your dashboard.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 p-2 text-gray-400 hover:bg-gray-50 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-7 custom-scrollbar">
            {/* Group A: Dashboard Cards */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-widest text-emerald-700">
                  Dashboard Cards ({cards.length})
                </h4>
                <span className="text-[11px] font-semibold text-gray-400">
                  {cards.filter((c) => c.isVisible).length} visible
                </span>
              </div>

              <div className="space-y-2.5">
                {cards.map((card, idx) => (
                  <div
                    key={card.key}
                    className={`flex flex-col gap-2 rounded-2xl border p-3.5 transition-all ${
                      card.isVisible
                        ? 'border-gray-200 bg-white shadow-sm'
                        : 'border-gray-100 bg-gray-50/60 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={card.isVisible}
                          onChange={() => handleToggleCard(card.key)}
                          className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                        <div>
                          <p className="text-xs font-black text-gray-900 leading-snug">
                            {card.defaultTitle}
                          </p>
                          {card.customTitle && card.customTitle !== card.defaultTitle ? (
                            <p className="text-[10px] font-semibold text-emerald-700 flex items-center gap-1 mt-0.5">
                              <Info className="h-3 w-3" /> Original: {card.defaultTitle}
                            </p>
                          ) : null}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveCard(idx, 'up')}
                          className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-30"
                          title="Move up"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === cards.length - 1}
                          onClick={() => handleMoveCard(idx, 'down')}
                          className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-30"
                          title="Move down"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {canRename && (
                      <div className="pt-1.5 border-t border-gray-100/80">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                          Display Name
                        </label>
                        <input
                          type="text"
                          value={card.customTitle ?? card.defaultTitle}
                          placeholder={card.defaultTitle}
                          onChange={(e) => handleRenameCard(card.key, e.target.value)}
                          className="w-full rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-800 focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Group B: Dashboard Sections */}
            <div className="space-y-3.5 pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-widest text-emerald-700">
                  Dashboard Sections ({sections.length})
                </h4>
                <span className="text-[11px] font-semibold text-gray-400">
                  {sections.filter((s) => s.isVisible).length} visible
                </span>
              </div>

              <div className="space-y-2.5">
                {sections.map((sec, idx) => (
                  <div
                    key={sec.key}
                    className={`flex flex-col gap-2 rounded-2xl border p-3.5 transition-all ${
                      sec.isVisible
                        ? 'border-gray-200 bg-white shadow-sm'
                        : 'border-gray-100 bg-gray-50/60 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={sec.isVisible}
                          onChange={() => handleToggleSection(sec.key)}
                          className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                        <div>
                          <p className="text-xs font-black text-gray-900 leading-snug">
                            {sec.defaultTitle}
                          </p>
                          {sec.customTitle && sec.customTitle !== sec.defaultTitle ? (
                            <p className="text-[10px] font-semibold text-emerald-700 flex items-center gap-1 mt-0.5">
                              <Info className="h-3 w-3" /> Original: {sec.defaultTitle}
                            </p>
                          ) : null}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveSection(idx, 'up')}
                          className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-30"
                          title="Move up"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === sections.length - 1}
                          onClick={() => handleMoveSection(idx, 'down')}
                          className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-30"
                          title="Move down"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {canRename && (
                      <div className="pt-1.5 border-t border-gray-100/80">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                          Display Name
                        </label>
                        <input
                          type="text"
                          value={sec.customTitle ?? sec.defaultTitle}
                          placeholder={sec.defaultTitle}
                          onChange={(e) => handleRenameSection(sec.key, e.target.value)}
                          className="w-full rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-800 focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4 bg-white sticky bottom-0 z-10">
            <button
              type="button"
              onClick={() => setIsResetConfirmOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-3.5 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5 text-gray-400" />
              Reset to Default
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={updateMut.isPending}
                onClick={handleSave}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 disabled:opacity-50 transition-all cursor-pointer"
              >
                {updateMut.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                Save Changes
              </button>
            </div>
          </div>
        </motion.div>

        {/* Reset Confirmation Modal */}
        <AnimatePresence>
          {isResetConfirmOpen && (
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsResetConfirmOpen(false)}
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 12 }}
                className="relative z-10 w-full max-w-sm overflow-hidden rounded-3xl bg-white p-6 shadow-2xl border border-gray-100 space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-amber-100 text-amber-700">
                    <RotateCcw className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-gray-900">Reset Dashboard?</h4>
                    <p className="text-xs font-semibold text-gray-500 mt-0.5">
                      Restores default visibility, order, and display names.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsResetConfirmOpen(false)}
                    className="flex-1 rounded-xl border border-gray-200 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={resetMut.isPending}
                    onClick={handleConfirmReset}
                    className="flex-1 rounded-xl bg-amber-600 py-2.5 text-xs font-black text-white hover:bg-amber-700 disabled:opacity-50 shadow-md shadow-amber-600/20 inline-flex items-center justify-center gap-1.5"
                  >
                    {resetMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Reset'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );

  return typeof document !== 'undefined' ? createPortal(drawerNode, document.body) : drawerNode;
};

export default DashboardCustomizerDrawer;
