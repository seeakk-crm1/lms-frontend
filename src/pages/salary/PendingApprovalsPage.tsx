import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Pencil,
  History,
  Search,
  Users,
  DollarSign,
  Calendar,
  AlertCircle,
  FileText,
} from 'lucide-react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { salaryApi } from '../../services/salary.api';
import { SalaryRecord } from '../../types/salary.types';
import { getImageUrl } from '../../utils/getImageUrl';
import useAuthStore from '../../store/useAuthStore';
import { hasAnyPermission } from '../../utils/permissions';

const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;
const YEARS = [currentYear - 1, currentYear, currentYear + 1];

const PendingApprovalsPage: React.FC = () => {
  const currentUser = useAuthStore((state) => state.user);
  const canApprove = hasAnyPermission(currentUser, ['SALARY_APPROVALS_APPROVE']);
  const canReject = hasAnyPermission(currentUser, ['SALARY_APPROVALS_REJECT']);
  const canReturn = hasAnyPermission(currentUser, ['SALARY_APPROVALS_RETURN']);
  const canEditBeforeApproval = hasAnyPermission(currentUser, ['SALARY_APPROVALS_EDIT']);

  const [month, setMonth] = useState<number>(currentMonth);
  const [year, setYear] = useState<number>(currentYear);
  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [records, setRecords] = useState<SalaryRecord[]>([]);
  const [meta, setMeta] = useState<{ total: number; totalPages: number }>({ total: 0, totalPages: 1 });

  // Action Modal State
  const [actionModal, setActionModal] = useState<{
    open: boolean;
    type: 'APPROVE' | 'REJECT' | 'RETURN' | null;
    record: SalaryRecord | null;
    remarks: string;
  }>({
    open: false,
    type: null,
    record: null,
    remarks: '',
  });

  // Edit Salary Before Approval Modal State
  const [editModal, setEditModal] = useState<{
    open: boolean;
    record: SalaryRecord | null;
    bonus: string;
    deduction: string;
    advanceAmount: string;
    finalSalary: string;
    reason: string;
  }>({
    open: false,
    record: null,
    bonus: '',
    deduction: '',
    advanceAmount: '',
    finalSalary: '',
    reason: '',
  });

  // Audit History Modal State
  const [historyRecordId, setHistoryRecordId] = useState<string | null>(null);
  const [historyData, setHistoryData] = useState<any>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchPendingApprovals = async () => {
    setIsLoading(true);
    try {
      const res = await salaryApi.getPendingApprovals({
        month,
        year,
        search: search || undefined,
        page,
        limit: 20,
      });
      setRecords(res.data || []);
      setMeta(res.meta || { total: 0, totalPages: 1 });
    } catch (err: any) {
      toast.error('Failed to load pending salary approvals.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingApprovals();
  }, [month, year, page]);

  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionModal.record || !actionModal.type) return;

    if (actionModal.type === 'REJECT' && !actionModal.remarks.trim()) {
      toast.error('Remarks are mandatory when rejecting a salary record.');
      return;
    }

    setIsSubmitting(true);
    try {
      await salaryApi.processApprovalAction(
        actionModal.record.id,
        actionModal.type,
        actionModal.remarks,
      );
      toast.success(`Salary record ${actionModal.type.toLowerCase()}d successfully.`);
      setActionModal({ open: false, type: null, record: null, remarks: '' });
      fetchPendingApprovals();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to process approval action.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEditModal = (rec: SalaryRecord) => {
    setEditModal({
      open: true,
      record: rec,
      bonus: String(rec.bonus || 0),
      deduction: String(rec.deduction || 0),
      advanceAmount: String(rec.advanceAmount || 0),
      finalSalary: String(rec.finalSalary),
      reason: '',
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModal.record) return;
    if (!editModal.reason.trim()) {
      toast.error('Reason is required when editing salary amounts before approval.');
      return;
    }

    setIsSubmitting(true);
    try {
      await salaryApi.editSalaryBeforeApproval(editModal.record.id, {
        bonus: Number(editModal.bonus),
        deduction: Number(editModal.deduction),
        advanceAmount: Number(editModal.advanceAmount),
        finalSalary: Number(editModal.finalSalary),
        reason: editModal.reason.trim(),
      });
      toast.success('Salary amounts updated with audit trail.');
      setEditModal({ open: false, record: null, bonus: '', deduction: '', advanceAmount: '', finalSalary: '', reason: '' });
      fetchPendingApprovals();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to edit salary.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewHistory = async (recId: string) => {
    setHistoryRecordId(recId);
    setIsLoadingHistory(true);
    try {
      const res = await salaryApi.getSalaryHistory(recId);
      setHistoryData(res.data);
    } catch (err: any) {
      toast.error('Failed to load salary audit history.');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8 custom-scrollbar relative">
        <div className="max-w-[1400px] mx-auto space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider">Approval Inbox</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Pending Approvals</h1>
            <p className="text-xs md:text-sm text-gray-500 font-medium">Review and process salary calculations awaiting your approval stage.</p>
          </div>

          {/* Filters Bar */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
            <div className="flex items-center gap-2">
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-700"
              >
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>

              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-700"
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div className="text-xs font-bold text-gray-500">
              Showing <span className="text-gray-900 font-black">{meta.total}</span> records awaiting your decision
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-4 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Employee</th>
                    <th className="px-4 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Month / Year</th>
                    <th className="px-4 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Base Salary</th>
                    <th className="px-4 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Attendance & LOP</th>
                    <th className="px-4 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Calculated Net</th>
                    <th className="px-4 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Current Stage</th>
                    <th className="px-4 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {isLoading ? (
                    [...Array(4)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={7} className="px-6 py-4"><div className="h-8 bg-gray-100 rounded-lg"></div></td>
                      </tr>
                    ))
                  ) : records.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-16 text-center text-gray-400">
                        <Clock className="w-12 h-12 mx-auto mb-2 text-emerald-300" />
                        <p className="font-bold text-base text-gray-800">No Pending Approvals</p>
                        <p className="text-xs text-gray-400 mt-1">You have cleared all salary approval tasks for this period.</p>
                      </td>
                    </tr>
                  ) : (
                    records.map((rec) => (
                      <tr key={rec.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold shrink-0 overflow-hidden text-xs">
                              {rec.user?.profileImageUrl ? (
                                <img src={getImageUrl(rec.user.profileImageUrl)} alt={rec.user.name || ''} className="w-full h-full object-cover" />
                              ) : (
                                (rec.user?.name || 'E').charAt(0)
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900">{rec.user?.name || 'Employee'}</p>
                              <p className="text-[11px] text-gray-400 font-medium">{rec.user?.department?.name || 'Dept'} • {rec.user?.office?.name || 'Office'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-xs font-bold text-gray-700">
                          {MONTHS.find(m => m.value === rec.month)?.label} {rec.year}
                        </td>
                        <td className="px-4 py-4 text-sm font-bold text-gray-900">
                          ₹{rec.monthlySalary.toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-4 text-xs font-semibold text-gray-700">
                          <p><span className="text-emerald-600 font-bold">{rec.attendanceDays}</span> / {rec.workingDays} Days</p>
                          {rec.lopDays > 0 && <p className="text-rose-600 font-bold text-[11px]">{rec.lopDays} LOP Days</p>}
                        </td>
                        <td className="px-4 py-4 text-base font-black text-emerald-600">
                          ₹{rec.finalSalary.toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold">
                            Stage L{rec.currentStageOrder} Approval
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleViewHistory(rec.id)}
                              className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg"
                              title="Audit Timeline"
                            >
                              <History className="w-4 h-4" />
                            </button>

                            {canEditBeforeApproval && (
                              <button
                                onClick={() => handleOpenEditModal(rec)}
                                className="px-2.5 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl font-bold text-xs"
                                title="Edit Salary"
                              >
                                <Pencil className="w-3.5 h-3.5 inline mr-1" />
                                Edit
                              </button>
                            )}

                            {canReturn && (
                              <button
                                onClick={() => setActionModal({ open: true, type: 'RETURN', record: rec, remarks: '' })}
                                className="px-2.5 py-1.5 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-xl font-bold text-xs"
                              >
                                <RotateCcw className="w-3.5 h-3.5 inline mr-1" />
                                Return
                              </button>
                            )}

                            {canReject && (
                              <button
                                onClick={() => setActionModal({ open: true, type: 'REJECT', record: rec, remarks: '' })}
                                className="px-2.5 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl font-bold text-xs"
                              >
                                <XCircle className="w-3.5 h-3.5 inline mr-1" />
                                Reject
                              </button>
                            )}

                            {canApprove && (
                              <button
                                onClick={() => setActionModal({ open: true, type: 'APPROVE', record: rec, remarks: '' })}
                                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />
                                Approve
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Action Confirmation Modal (Approve / Reject / Return) */}
      <AnimatePresence>
        {actionModal.open && actionModal.record && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100"
            >
              <h3 className="text-xl font-black text-gray-900 mb-1">
                {actionModal.type === 'APPROVE' && 'Approve Salary Record'}
                {actionModal.type === 'REJECT' && 'Reject Salary Record'}
                {actionModal.type === 'RETURN' && 'Return Salary for Correction'}
              </h3>
              <p className="text-xs text-gray-500 font-medium mb-4">
                Target: <span className="font-bold text-gray-800">{actionModal.record.user?.name}</span> • Final Salary: <span className="font-bold text-emerald-600">₹{actionModal.record.finalSalary.toLocaleString('en-IN')}</span>
              </p>

              <form onSubmit={handleActionSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">
                    {actionModal.type === 'REJECT' ? 'Remarks (Mandatory)' : 'Remarks / Notes'}
                  </label>
                  <textarea
                    value={actionModal.remarks}
                    onChange={(e) => setActionModal({ ...actionModal, remarks: e.target.value })}
                    required={actionModal.type === 'REJECT'}
                    placeholder={actionModal.type === 'REJECT' ? 'Reason for rejection...' : 'Optional approval notes...'}
                    rows={3}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-semibold text-gray-900"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setActionModal({ open: false, type: null, record: null, remarks: '' })}
                    className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-5 py-2 text-white font-bold text-xs rounded-xl shadow-md ${
                      actionModal.type === 'REJECT' ? 'bg-rose-600 hover:bg-rose-700' : actionModal.type === 'RETURN' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-emerald-500 hover:bg-emerald-600'
                    }`}
                  >
                    {isSubmitting ? 'Processing...' : `Confirm ${actionModal.type}`}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Salary Before Approval Modal */}
      <AnimatePresence>
        {editModal.open && editModal.record && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100"
            >
              <h3 className="text-xl font-black text-gray-900 mb-1">Edit Salary Before Approval</h3>
              <p className="text-xs text-gray-500 font-medium mb-4">Modify salary components for {editModal.record.user?.name}. An audit history entry will be generated.</p>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Bonus (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editModal.bonus}
                      onChange={(e) => setEditModal({ ...editModal, bonus: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-semibold text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Deduction (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editModal.deduction}
                      onChange={(e) => setEditModal({ ...editModal, deduction: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-semibold text-gray-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Advance Deduction (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editModal.advanceAmount}
                      onChange={(e) => setEditModal({ ...editModal, advanceAmount: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-semibold text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Final Net Salary (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editModal.finalSalary}
                      onChange={(e) => setEditModal({ ...editModal, finalSalary: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-semibold text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Audit Reason (Mandatory)</label>
                  <textarea
                    value={editModal.reason}
                    onChange={(e) => setEditModal({ ...editModal, reason: e.target.value })}
                    required
                    placeholder="Mandatory explanation for editing salary amounts..."
                    rows={2}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-semibold text-gray-900"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setEditModal({ open: false, record: null, bonus: '', deduction: '', advanceAmount: '', finalSalary: '', reason: '' })}
                    className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 shadow-md shadow-blue-600/20"
                  >
                    {isSubmitting ? 'Saving...' : 'Save & Audit'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* History Audit Modal */}
      <AnimatePresence>
        {historyRecordId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-gray-100 max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-black text-gray-900">Audit & Approval History</h3>
                  <p className="text-xs text-gray-500 font-medium">Complete lifecycle audit trail for this salary record.</p>
                </div>
                <button
                  onClick={() => setHistoryRecordId(null)}
                  className="p-2 text-gray-400 hover:bg-gray-100 rounded-full"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1">
                {isLoadingHistory ? (
                  <p className="text-center text-sm font-semibold text-gray-400 py-8">Loading history timeline...</p>
                ) : historyData ? (
                  <>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Approvals</h4>
                    <div className="space-y-2 mb-4">
                      {historyData.approvals?.map((ap: any) => (
                        <div key={ap.id} className="p-3 bg-gray-50 rounded-2xl text-xs flex justify-between items-center">
                          <div>
                            <p className="font-bold text-gray-900">Stage L{ap.stageOrder}: {ap.action}</p>
                            <p className="text-gray-500">By {ap.approverUser?.name}</p>
                            {ap.remarks && <p className="text-gray-400 italic">"{ap.remarks}"</p>}
                          </div>
                          <span className="text-[10px] text-gray-400">{new Date(ap.createdAt).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>

                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Salary Edit & Change History</h4>
                    <div className="space-y-3 mb-5">
                      {historyData.histories && historyData.histories.length > 0 ? (
                        historyData.histories.map((h: any) => (
                          <div key={h.id} className="p-4 bg-gradient-to-br from-gray-50 to-emerald-50/30 border border-gray-100 rounded-2xl text-xs space-y-2">
                            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                              <span className="font-black text-gray-900">{h.action} {h.stageOrder ? `(Stage Level ${h.stageOrder})` : ''}</span>
                              <span className="text-[10px] text-gray-400 font-semibold">{new Date(h.createdAt).toLocaleString()}</span>
                            </div>

                            {h.previousSalary !== null && h.previousSalary !== undefined && h.updatedSalary !== null && (
                              <div className="grid grid-cols-3 gap-2 bg-white p-3 rounded-xl border border-gray-100 text-center my-2 shadow-xs">
                                <div>
                                  <p className="text-[10px] font-bold text-gray-400 uppercase">Original Salary</p>
                                  <p className="text-sm font-black text-gray-700">₹{Number(h.previousSalary).toLocaleString('en-IN')}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold text-gray-400 uppercase">Updated Salary</p>
                                  <p className="text-sm font-black text-emerald-600">₹{Number(h.updatedSalary).toLocaleString('en-IN')}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold text-gray-400 uppercase">Difference</p>
                                  <p className={`text-sm font-black ${Number(h.difference) < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                    {Number(h.difference) > 0 ? `+₹${Number(h.difference).toLocaleString('en-IN')}` : `₹${Number(h.difference || 0).toLocaleString('en-IN')}`}
                                  </p>
                                </div>
                              </div>
                            )}

                            <div className="text-gray-700 font-medium space-y-1">
                              <p>Edited By: <strong className="text-gray-900">{h.editedBy?.name || 'System'}</strong> {h.editedBy?.role?.name ? `(${h.editedBy.role.name})` : ''}</p>
                              {h.reason && <p className="text-gray-600 italic bg-white/70 p-2 rounded-lg border border-gray-100">"{h.reason}"</p>}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs font-semibold text-gray-400 italic">No manual salary adjustments recorded for this payroll cycle.</p>
                      )}
                    </div>

                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Stage Approval Log</h4>
                    <div className="space-y-2">
                      {historyData.approvals?.map((ap: any) => (
                        <div key={ap.id} className="p-3 bg-gray-50 rounded-2xl text-xs flex justify-between items-center">
                          <div>
                            <p className="font-bold text-gray-900">Stage L{ap.stageOrder}: {ap.action}</p>
                            <p className="text-gray-500">By {ap.approverUser?.name || 'Approver'}</p>
                            {ap.remarks && <p className="text-gray-400 italic">"{ap.remarks}"</p>}
                          </div>
                          <span className="text-[10px] text-gray-400">{new Date(ap.createdAt).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : null}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default PendingApprovalsPage;
