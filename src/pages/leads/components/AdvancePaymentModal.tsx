import React, { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { requestAdvancePayment } from '../../../services/leads.api';

interface AdvancePaymentModalProps {
  isOpen: boolean;
  leadId?: string;
  onClose: () => void;
  onSuccess: (newAdvance: any) => void;
  mode: 'create' | 'edit';
  currentUser?: { name?: string; displayName?: string } | null;
}

const inputClassName =
  'w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10';

const AdvancePaymentModal: React.FC<AdvancePaymentModalProps> = ({
  isOpen,
  leadId,
  onClose,
  onSuccess,
  mode,
  currentUser,
}) => {
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [advancePaymentDate, setAdvancePaymentDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [advanceRemarks, setAdvanceRemarks] = useState('');
  const [advanceProofUrl, setAdvanceProofUrl] = useState('');
  const [isSubmittingAdvance, setIsSubmittingAdvance] = useState(false);

  const handleProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        toast.error('File size must be less than 1MB');
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAdvanceProofUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAdvancePayment = async () => {
    console.log('[Diagnostic] Submit Request clicked');
    if (!advanceAmount || Number(advanceAmount) <= 0) {
      toast.error('Advance amount must be greater than zero.');
      return;
    }
    if (!advancePaymentDate) {
      toast.error('Payment date is required.');
      return;
    }

    if (mode === 'create') {
      const newAdv = {
        amount: Number(advanceAmount),
        paymentDate: new Date(advancePaymentDate).toISOString(),
        remarks: advanceRemarks.trim(),
        proofUrl: advanceProofUrl || null,
        status: 'PENDING',
        requestedBy: { name: currentUser?.displayName || currentUser?.name || 'You' },
        createdAt: new Date().toISOString(),
      };
      console.log('[Diagnostic] Request submitted');
      toast.success('Advance payment added locally.');
      console.log('[Diagnostic] Success notification displayed');
      onSuccess(newAdv);
      onClose();
      return;
    }

    if (!leadId) return;
    setIsSubmittingAdvance(true);
    try {
      await requestAdvancePayment(leadId, {
        amount: Number(advanceAmount),
        paymentDate: new Date(advancePaymentDate).toISOString(),
        remarks: advanceRemarks.trim(),
        proofUrl: advanceProofUrl || undefined,
      });
      console.log('[Diagnostic] Request submitted');
      toast.success('Advance payment approval requested successfully.');
      console.log('[Diagnostic] Success notification displayed');
      onSuccess({});
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || 'Failed to request advance payment.');
    } finally {
      setIsSubmittingAdvance(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <h3 className="text-lg font-black text-gray-900 mb-4">Request Advance Payment</h3>
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-black text-gray-900">Amount <span className="text-red-500">*</span></label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={advanceAmount}
              onChange={(e) => setAdvanceAmount(e.target.value)}
              className={inputClassName}
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-black text-gray-900">Payment Date <span className="text-red-500">*</span></label>
            <input
              type="date"
              value={advancePaymentDate}
              onChange={(e) => setAdvancePaymentDate(e.target.value)}
              className={inputClassName}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-black text-gray-900">Remarks</label>
            <textarea
              value={advanceRemarks}
              onChange={(e) => setAdvanceRemarks(e.target.value)}
              className={`${inputClassName} resize-none`}
              rows={2}
              placeholder="e.g. Check clearance details or cash reference"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-black text-gray-900">Upload Receipt Proof (Max 1MB)</label>
            <input
              type="file"
              accept="image/png, image/jpeg, image/jpg, image/webp"
              onChange={handleProofChange}
              className="w-full text-xs font-semibold text-gray-500 file:mr-4 file:rounded-xl file:border-0 file:bg-emerald-50 file:px-4 file:py-2 file:text-xs file:font-black file:text-emerald-700 file:transition-colors hover:file:bg-emerald-100"
            />
            {advanceProofUrl && (
              <div className="mt-2 relative inline-block">
                <img src={advanceProofUrl} alt="Preview" className="h-20 w-20 rounded-xl object-cover border border-gray-100" />
                <button
                  type="button"
                  onClick={() => setAdvanceProofUrl('')}
                  className="absolute -top-1.5 -right-1.5 rounded-full bg-red-100 p-0.5 text-red-600 hover:bg-red-200"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-gray-200 px-4 py-2.5 text-sm font-black text-gray-500 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmittingAdvance || !advanceAmount || Number(advanceAmount) <= 0}
            onClick={handleSaveAdvancePayment}
            className="rounded-2xl bg-emerald-500 px-5 py-2.5 text-sm font-black text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            {isSubmittingAdvance ? 'Submitting…' : 'Submit Request'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvancePaymentModal;
