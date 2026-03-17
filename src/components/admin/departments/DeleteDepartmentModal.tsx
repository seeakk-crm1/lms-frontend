import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, AlertTriangle, Building2 } from 'lucide-react';

interface DeleteDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  departmentName: string;
}

const DeleteDepartmentModal: React.FC<DeleteDepartmentModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  departmentName 
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden relative"
          >
            {/* Background pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
            
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-500">
                  <Trash2 className="w-6 h-6" />
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <h2 className="text-2xl font-black text-gray-900 tracking-tight text-center sm:text-left">
                  Delete Department?
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed font-semibold text-center sm:text-left">
                  Are you sure you want to permanently delete the <span className="text-red-600 font-black">"{departmentName}"</span> department? 
                  This will remove the organizational group from the system.
                </p>
              </div>

              <div className="mt-8 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-700 font-bold leading-normal">
                  Note: A department cannot be deleted if it still has active users assigned to it. Please reassign the users first.
                </p>
              </div>

              <div className="mt-10 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 text-sm font-black text-gray-500 hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className="flex-[2] py-4 bg-red-500 text-white rounded-2xl text-sm font-black shadow-xl shadow-red-500/20 hover:bg-red-600 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Confirm Deletion
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DeleteDepartmentModal;
