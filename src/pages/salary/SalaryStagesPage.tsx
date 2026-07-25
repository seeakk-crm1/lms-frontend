import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  Layers,
  Plus,
  Trash2,
  CheckCircle2,
  Calendar,
  User,
  Shield,
  Save,
  ArrowUp,
  ArrowDown,
  Clock,
  Sparkles,
} from 'lucide-react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { salaryApi } from '../../services/salary.api';
import { SalaryApprovalStage } from '../../types/salary.types';
import { useSupervisorsQuery } from '../../hooks/useUsersQuery';
import useAuthStore from '../../store/useAuthStore';
import { hasAnyPermission } from '../../utils/permissions';

const SalaryStagesPage: React.FC = () => {
  const currentUser = useAuthStore((state) => state.user);
  const canCreate = hasAnyPermission(currentUser, ['SALARY_STAGES_CREATE']);
  const canEdit = hasAnyPermission(currentUser, ['SALARY_STAGES_EDIT']);
  const canDelete = hasAnyPermission(currentUser, ['SALARY_STAGES_DELETE']);

  const { data: usersData } = useSupervisorsQuery();

  const [stages, setStages] = useState<SalaryApprovalStage[]>([]);
  const [salaryReleaseDay, setSalaryReleaseDay] = useState<number>(25);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modal State for New Stage
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editStageId, setEditStageId] = useState<string | null>(null);
  const [stageName, setStageName] = useState<string>('');
  const [approverUserId, setApproverUserId] = useState<string>('');
  const [designation, setDesignation] = useState<string>('');
  const [isMandatory, setIsMandatory] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSavingReleaseDay, setIsSavingReleaseDay] = useState<boolean>(false);

  const fetchStages = async () => {
    setIsLoading(true);
    try {
      const res = await salaryApi.getStages();
      setStages(res.data?.stages || []);
      setSalaryReleaseDay(res.data?.salaryReleaseDay ?? 25);
    } catch (err: any) {
      toast.error('Failed to load salary approval stages.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStages();
  }, []);

  const handleSaveReleaseSetting = async () => {
    setIsSavingReleaseDay(true);
    try {
      await salaryApi.updateReleaseSetting(salaryReleaseDay);
      toast.success('Salary release date saved.');
    } catch (err: any) {
      toast.error('Failed to update salary release date.');
    } finally {
      setIsSavingReleaseDay(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditStageId(null);
    setStageName(`Approval Level ${stages.length + 1}`);
    setApproverUserId('');
    setDesignation('');
    setIsMandatory(true);
    setShowModal(true);
  };

  const handleOpenEditModal = (st: SalaryApprovalStage) => {
    setEditStageId(st.id);
    setStageName(st.name);
    setApproverUserId(st.approverUserId);
    setDesignation(st.designation || '');
    setIsMandatory(st.isMandatory);
    setShowModal(true);
  };

  const handleSaveStage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!approverUserId) {
      toast.error('Please select an approver user.');
      return;
    }
    setIsSubmitting(true);
    try {
      if (editStageId) {
        await salaryApi.updateStage(editStageId, {
          name: stageName,
          approverUserId,
          designation,
          isMandatory,
        });
        toast.success('Approval stage updated.');
      } else {
        await salaryApi.createStage({
          name: stageName,
          order: stages.length + 1,
          approverUserId,
          designation,
          isMandatory,
        });
        toast.success('Approval stage created.');
      }
      setShowModal(false);
      fetchStages();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save approval stage.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStage = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this approval level?')) return;
    try {
      await salaryApi.deleteStage(id);
      toast.success('Approval stage deleted.');
      fetchStages();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete approval stage.');
    }
  };

  const handleMoveOrder = async (index: number, direction: 'UP' | 'DOWN') => {
    if ((direction === 'UP' && index === 0) || (direction === 'DOWN' && index === stages.length - 1)) return;
    const newStages = [...stages];
    const targetIndex = direction === 'UP' ? index - 1 : index + 1;
    const temp = newStages[index];
    newStages[index] = newStages[targetIndex];
    newStages[targetIndex] = temp;

    const reorderedPayload = newStages.map((st, idx) => ({
      id: st.id,
      order: idx + 1,
    }));

    try {
      await salaryApi.reorderStages(reorderedPayload);
      toast.success('Approval order updated.');
      fetchStages();
    } catch (err: any) {
      toast.error('Failed to reorder approval stages.');
    }
  };

  return (
    <DashboardLayout>
      <div className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8 custom-scrollbar relative">
        <div className="max-w-[1200px] mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider">Salary Management</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Approval Stages</h1>
              <p className="text-xs md:text-sm text-gray-500 font-medium">Configure dynamic multi-level approval hierarchy for salary distribution.</p>
            </div>

            {canCreate && (
              <button
                onClick={handleOpenCreateModal}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs md:text-sm shadow-lg shadow-emerald-500/20 active:scale-95 transition-all self-start md:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Approval Level</span>
              </button>
            )}
          </div>

          {/* Salary Release Date Setting Card */}
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black">Monthly Salary Release Date</h3>
                <p className="text-xs text-emerald-100 font-medium">Select the target day of the month when employee payroll is processed and released.</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 shrink-0">
              <span className="text-xs font-bold px-2">Every Month</span>
              <input
                type="number"
                min="1"
                max="31"
                value={salaryReleaseDay}
                onChange={(e) => setSalaryReleaseDay(Number(e.target.value))}
                className="w-16 px-3 py-1.5 bg-white text-gray-900 font-black rounded-xl text-center text-sm outline-none"
              />
              <button
                onClick={handleSaveReleaseSetting}
                disabled={isSavingReleaseDay}
                className="px-4 py-1.5 bg-white text-emerald-700 hover:bg-emerald-50 font-bold rounded-xl text-xs shadow-md transition-all disabled:opacity-60"
              >
                {isSavingReleaseDay ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>

          {/* Approval Stages List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                Active Approval Workflow ({stages.length} Levels Configured)
              </h3>
            </div>

            {isLoading ? (
              <div className="p-8 text-center text-gray-400 font-semibold">Loading approval stages...</div>
            ) : stages.length === 0 ? (
              <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center text-gray-400 shadow-sm">
                <Sparkles className="w-12 h-12 mx-auto mb-2 text-emerald-300" />
                <h4 className="text-base font-bold text-gray-800 mb-1">No Approval Levels Configured</h4>
                <p className="text-xs text-gray-500 max-w-sm mx-auto mb-4">Click "+ Add Approval Level" to create your multi-level HR, Finance, or Executive approval flow.</p>
                {canCreate && (
                  <button
                    onClick={handleOpenCreateModal}
                    className="px-4 py-2 bg-emerald-500 text-white font-bold text-xs rounded-xl hover:bg-emerald-600"
                  >
                    + Add Approval Level
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {stages.map((st, idx) => (
                  <motion.div
                    key={st.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border border-gray-100 p-4 md:p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 font-black flex items-center justify-center shrink-0 border border-emerald-100">
                        L{st.order}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-black text-gray-900">{st.name}</h4>
                          {st.isMandatory && (
                            <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-600 text-[10px] font-bold">Mandatory</span>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-gray-500 mt-0.5 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-gray-900 font-bold">{st.approverUser?.name || 'Unassigned'}</span>
                          {st.designation && <span className="text-gray-400">({st.designation})</span>}
                          <span className="text-gray-400">• {st.approverUser?.role?.name || 'Role'}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-auto">
                      {canEdit && (
                        <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-100 mr-2">
                          <button
                            onClick={() => handleMoveOrder(idx, 'UP')}
                            disabled={idx === 0}
                            className="p-1 text-gray-500 hover:bg-white rounded-lg disabled:opacity-30"
                            title="Move Up"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleMoveOrder(idx, 'DOWN')}
                            disabled={idx === stages.length - 1}
                            className="p-1 text-gray-500 hover:bg-white rounded-lg disabled:opacity-30"
                            title="Move Down"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      {canEdit && (
                        <button
                          onClick={() => handleOpenEditModal(st)}
                          className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-xs rounded-xl transition-all"
                        >
                          Edit
                        </button>
                      )}

                      {canDelete && (
                        <button
                          onClick={() => handleDeleteStage(st.id)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                          title="Delete Stage"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add / Edit Stage Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100"
            >
              <h3 className="text-xl font-black text-gray-900 mb-1">
                {editStageId ? 'Edit Approval Stage' : 'Add New Approval Stage'}
              </h3>
              <p className="text-xs text-gray-500 font-medium mb-4">Define approval stage name and select authorized approver user.</p>

              <form onSubmit={handleSaveStage} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Stage Name</label>
                  <input
                    type="text"
                    value={stageName}
                    onChange={(e) => setStageName(e.target.value)}
                    placeholder="e.g. HR Executive, Finance Manager, Managing Director"
                    required
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-semibold text-gray-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Approver User</label>
                  <select
                    value={approverUserId}
                    onChange={(e) => setApproverUserId(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-semibold text-gray-900"
                  >
                    <option value="">Select Approver</option>
                    {usersData?.data?.map((u: any) => (
                      <option key={u.id} value={u.id}>
                        {u.name || u.email} ({u.role?.name || 'User'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Designation (Optional)</label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. Senior HR Manager"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-semibold text-gray-900"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isMandatory"
                    checked={isMandatory}
                    onChange={(e) => setIsMandatory(e.target.checked)}
                    className="rounded border-gray-300 text-emerald-600"
                  />
                  <label htmlFor="isMandatory" className="text-xs font-bold text-gray-700 cursor-pointer">
                    Is Mandatory Approval Stage
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-emerald-500 text-white font-bold text-xs rounded-xl hover:bg-emerald-600 shadow-md shadow-emerald-500/20"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Stage'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default SalaryStagesPage;
