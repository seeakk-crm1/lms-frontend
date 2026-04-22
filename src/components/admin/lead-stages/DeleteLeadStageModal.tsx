import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Loader2, X } from 'lucide-react';

interface DeleteLeadStageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  stageName: string;
  isDeleting: boolean;
}

const DeleteLeadStageModal: React.FC<DeleteLeadStageModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  stageName,
  isDeleting,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-3 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 pt-6 pb-4 flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-500">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="px-8 pb-8 text-center sm:text-left">
              <h3 className="text-xl font-black text-gray-900 tracking-tight">Delete lead stage?</h3>
              <p className="mt-3 text-sm font-semibold text-gray-500 leading-relaxed">
                Are you sure you want to delete <span className="text-gray-900 font-bold">"{stageName}"</span>? 
                This action cannot be undone and may affect leads currently in this stage.
              </p>
            </div>

            {/* Footer */}
            <div className="px-6 py-5 bg-gray-50/50 flex flex-col sm:flex-row gap-3">
              <button
                onClick={onClose}
                disabled={isDeleting}
                className="flex-1 px-6 py-3 rounded-2xl border border-gray-200 text-sm font-black text-gray-500 hover:bg-white hover:border-gray-300 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={isDeleting}
                className="flex-[1.5] px-8 py-3 rounded-2xl bg-red-500 text-white text-sm font-black shadow-lg shadow-red-500/25 hover:bg-red-600 transition-all active:scale-95 disabled:opacity-70 inline-flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Stage</span>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default React.memo(DeleteLeadStageModal);
