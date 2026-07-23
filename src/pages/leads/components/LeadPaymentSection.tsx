import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../../../services/api';
const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val);
};
import type { LeadListItem } from '../../../types/lead.types';
import { UploadCloud, FileText, CheckCircle, XCircle, Clock, Check, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import useAuthStore from '../../../store/useAuthStore';
import { hasPermission } from '../../../utils/permission.util';

interface LeadPaymentSectionProps {
  leadId?: string;
  totalAmount: number | '';
  onTotalAmountChange: (value: number | '') => void;
  paymentReason?: string;
  onPaymentReasonChange: (value: string) => void;
}

const inputClassName =
  'w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10';

export const LeadPaymentSection: React.FC<LeadPaymentSectionProps> = ({
  leadId,
  totalAmount,
  onTotalAmountChange,
  paymentReason,
  onPaymentReasonChange,
}) => {
  const queryClient = useQueryClient();
  const [showAdvanceForm, setShowAdvanceForm] = useState(false);
  const [advanceAmount, setAdvanceAmount] = useState<number | ''>('');
  const [advanceDate, setAdvanceDate] = useState('');
  const [advanceRemarks, setAdvanceRemarks] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);

  const user = useAuthStore((state) => state.user);
  const canApprove = hasPermission(user?.permissions || [], 'LEAD_APPROVAL_APPROVE');

  const { data: advances = [], isLoading } = useQuery({
    queryKey: ['leadAdvances', leadId],
    queryFn: async () => {
      if (!leadId) return [];
      const res = await axios.get(`/leads/${leadId}/advances`);
      return res.data.data;
    },
    enabled: !!leadId,
  });

  const createAdvanceMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await axios.post(`/leads/${leadId}/advances`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Advance payment submitted for approval');
      queryClient.invalidateQueries({ queryKey: ['leadAdvances', leadId] });
      setShowAdvanceForm(false);
      setAdvanceAmount('');
      setAdvanceDate('');
      setAdvanceRemarks('');
      setProofFile(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to submit advance payment');
    },
  });

  const approveAdvanceMutation = useMutation({
    mutationFn: async ({ advanceId, checkNumber }: { advanceId: string; checkNumber: string }) => {
      const response = await axios.post(`/payments/leads/${leadId}/advances/${advanceId}/approve`, { checkNumber });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Advance payment approved successfully');
      queryClient.invalidateQueries({ queryKey: ['leadAdvances', leadId] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to approve advance');
    },
  });

  const rejectAdvanceMutation = useMutation({
    mutationFn: async ({ advanceId, reason }: { advanceId: string; reason: string }) => {
      const response = await axios.post(`/payments/leads/${leadId}/advances/${advanceId}/reject`, { reason });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Advance payment rejected successfully');
      queryClient.invalidateQueries({ queryKey: ['leadAdvances', leadId] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to reject advance');
    },
  });

  const sumApproved = advances
    .filter((a: any) => a.status === 'APPROVED')
    .reduce((sum: number, a: any) => sum + Number(a.amount), 0);

  const balance = totalAmount ? Number(totalAmount) - sumApproved : 0;

  const handleAddAdvance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!advanceAmount || !advanceDate || !proofFile) {
      toast.error('Please fill all required fields and upload proof');
      return;
    }
    const formData = new FormData();
    formData.append('amount', advanceAmount.toString());
    formData.append('paymentDate', advanceDate);
    formData.append('remarks', advanceRemarks);
    formData.append('proofImage', proofFile);
    createAdvanceMutation.mutate(formData);
  };

  return (
    <section className="rounded-3xl border border-blue-100 bg-blue-50/70 p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-gray-900">Payment Information</h3>
          <p className="text-sm font-semibold text-gray-500">
            Track total contract value, advances, and remaining balance.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <div>
          <label className="mb-2 block text-sm font-black text-gray-900">Total Amount</label>
          <input
            type="number"
            value={totalAmount}
            onChange={(e) => onTotalAmountChange(e.target.value === '' ? '' : Number(e.target.value))}
            className={inputClassName}
            placeholder="0.00"
            min="0"
          />
        </div>
        {leadId && (
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-black text-gray-900">Reason for Total Amount Edit (Optional)</label>
            <input
              type="text"
              value={paymentReason || ''}
              onChange={(e) => onPaymentReasonChange(e.target.value)}
              className={inputClassName}
              placeholder="E.g., Client requested additional features"
            />
          </div>
        )}
      </div>

      {leadId && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex gap-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Total Paid</p>
                <p className="text-lg font-black text-emerald-600">{formatCurrency(sumApproved)}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Balance Amount</p>
                <p className={`text-lg font-black ${balance > 0 ? 'text-rose-600' : 'text-gray-900'}`}>
                  {formatCurrency(balance)}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowAdvanceForm(!showAdvanceForm)}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
            >
              {showAdvanceForm ? 'Cancel Advance' : 'Record Advance'}
            </button>
          </div>

          {showAdvanceForm && (
            <div className="mb-6 rounded-2xl bg-gray-50 p-4 border border-gray-200">
              <h4 className="mb-3 text-sm font-black text-gray-900">New Advance Payment</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold text-gray-700">Amount <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    value={advanceAmount}
                    onChange={(e) => setAdvanceAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className={inputClassName}
                    min="1"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-gray-700">Payment Date <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    value={advanceDate}
                    onChange={(e) => setAdvanceDate(e.target.value)}
                    className={inputClassName}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-gray-700">Remarks</label>
                  <input
                    type="text"
                    value={advanceRemarks}
                    onChange={(e) => setAdvanceRemarks(e.target.value)}
                    className={inputClassName}
                    placeholder="Reference #, bank, etc."
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-gray-700">Proof Image (Max 1MB) <span className="text-red-500">*</span></label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/jpeg, image/png, image/webp"
                      onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                      className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleAddAdvance}
                  disabled={createAdvanceMutation.isPending}
                  className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {createAdvanceMutation.isPending ? 'Submitting...' : 'Submit for Approval'}
                </button>
              </div>
            </div>
          )}

          {isLoading ? (
            <p className="text-sm text-gray-500">Loading advances...</p>
          ) : advances.length > 0 ? (
            <div className="space-y-3">
              <h4 className="text-sm font-black text-gray-900">Payment History</h4>
              {advances.map((adv: any) => (
                <div key={adv.id} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      adv.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-600' :
                      adv.status === 'REJECTED' ? 'bg-rose-100 text-rose-600' :
                      'bg-amber-100 text-amber-600'
                    }`}>
                      {adv.status === 'APPROVED' && <CheckCircle size={20} />}
                      {adv.status === 'REJECTED' && <XCircle size={20} />}
                      {adv.status === 'PENDING' && <Clock size={20} />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{formatCurrency(Number(adv.amount))}</p>
                      <p className="text-xs font-semibold text-gray-500">
                        {new Date(adv.paymentDate).toLocaleDateString()} &middot; {adv.status}
                      </p>
                    </div>
                  </div>
                  {adv.proofUrl && (
                    <a
                      href={`${import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '')}${adv.proofUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-xs font-bold text-blue-600 hover:bg-blue-50 border border-gray-200"
                    >
                      <FileText size={14} /> View Proof
                    </a>
                  )}
                  {adv.status === 'PENDING' && canApprove && (
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => {
                          const checkNumber = window.prompt('Enter Check Number to approve:');
                          if (checkNumber) {
                            approveAdvanceMutation.mutate({ advanceId: adv.id, checkNumber });
                          }
                        }}
                        disabled={approveAdvanceMutation.isPending}
                        className="rounded bg-emerald-100 p-1 text-emerald-600 hover:bg-emerald-200"
                        title="Approve"
                      >
                        <Check size={18} />
                      </button>
                      <button
                        onClick={() => {
                          const reason = window.prompt('Enter Rejection Reason:');
                          if (reason) {
                            rejectAdvanceMutation.mutate({ advanceId: adv.id, reason });
                          }
                        }}
                        disabled={rejectAdvanceMutation.isPending}
                        className="rounded bg-rose-100 p-1 text-rose-600 hover:bg-rose-200"
                        title="Reject"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm font-semibold text-gray-500">No advance payments recorded yet.</p>
          )}
        </div>
      )}
    </section>
  );
};
