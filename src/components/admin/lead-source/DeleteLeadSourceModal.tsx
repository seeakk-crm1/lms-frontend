import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Radio, Trash2, X } from 'lucide-react';

interface DeleteLeadSourceModalProps {
  isOpen: boolean;
  sourceName: string;
  isDeleting?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteLeadSourceModal: React.FC<DeleteLeadSourceModalProps> = ({
  isOpen,
  sourceName,
  isDeleting = false,
  onClose,
  onConfirm,
}) => {
  return (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md overflow-hidden rounded-[32px] bg-white shadow-2xl"
          >
            <div className="absolute right-0 top-0 h-32 w-32 -mr-16 -mt-16 rounded-full bg-red-50 opacity-50 blur-3xl" />

            <div className="p-6 sm:p-8">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                  <Radio className="h-6 w-6" />
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isDeleting}
                  className="rounded-xl p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Close delete lead source modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3">
                <h2 className="text-2xl font-black tracking-tight text-gray-900">
                  Delete Lead Source?
                </h2>
                <p className="text-sm font-semibold leading-relaxed text-gray-500">
                  This will permanently remove the lead source{' '}
                  <span className="font-black text-red-600">"{sourceName}"</span> from master configuration.
                </p>
              </div>

              <div className="mt-8 flex gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-4">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                <p className="text-[11px] font-bold leading-normal text-amber-700">
                  Used lead sources cannot be deleted. If this source is already linked to any lead, the system will block deletion to protect historical data.
                </p>
              </div>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isDeleting}
                  className="flex-1 py-3 text-sm font-black text-gray-500 transition-colors hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={isDeleting}
                  className="flex-[2] rounded-2xl bg-red-500 py-4 text-sm font-black text-white shadow-xl shadow-red-500/20 transition-all active:scale-95 hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  {isDeleting ? 'Deleting...' : 'Confirm Deletion'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
};

export default DeleteLeadSourceModal;
