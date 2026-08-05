import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Edit2,
  Plus,
  Shield,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import {
  createSubstage,
  deleteSubstage,
  fetchGroupedSubstages,
  GroupedSubstages,
  LeadSubstage,
  toggleSubstageStatus,
  updateSubstage,
} from '../../services/substages.api';

export const SubstageManager: React.FC = () => {
  const [groups, setGroups] = useState<GroupedSubstages[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubstage, setEditingSubstage] = useState<LeadSubstage | null>(null);
  const [targetStageId, setTargetStageId] = useState<string>('');

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [connectionRestriction, setConnectionRestriction] = useState<'CONNECTED' | 'NOT_CONNECTED' | ''>('');
  const [outcomeCategory, setOutcomeCategory] = useState<'POSITIVE' | 'FOLLOW_UP' | 'NEGATIVE' | 'NEUTRAL' | ''>('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchGroupedSubstages();
      setGroups(data);
    } catch (err: any) {
      console.error('Failed to load substages:', err);
      setError('Failed to load substages.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = (stageId: string) => {
    setEditingSubstage(null);
    setTargetStageId(stageId);
    setName('');
    setDescription('');
    setSortOrder(0);
    setConnectionRestriction('');
    setOutcomeCategory('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (substage: LeadSubstage) => {
    setEditingSubstage(substage);
    setTargetStageId(substage.leadStageId);
    setName(substage.name);
    setDescription(substage.description || '');
    setSortOrder(substage.sortOrder || 0);
    setConnectionRestriction(substage.connectionStatusRestriction || '');
    setOutcomeCategory(substage.outcomeCategory || '');
    setIsModalOpen(true);
  };

  const handleToggle = async (id: string) => {
    try {
      await toggleSubstageStatus(id);
      loadData();
    } catch (err) {
      alert('Failed to update substage status.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this substage?')) return;
    try {
      await deleteSubstage(id);
      loadData();
    } catch (err) {
      alert('Failed to delete substage.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || undefined,
        sortOrder,
        connectionStatusRestriction: connectionRestriction ? (connectionRestriction as any) : null,
        outcomeCategory: outcomeCategory ? (outcomeCategory as any) : null,
      };

      if (editingSubstage) {
        await updateSubstage(editingSubstage.id, payload);
      } else {
        await createSubstage({
          ...payload,
          leadStageId: targetStageId,
        });
      }

      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 text-white shadow-xl flex items-center justify-between border border-emerald-900/40">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Tag className="w-4 h-4" />
            <span>Master Configuration</span>
          </div>
          <h2 className="text-xl font-black text-white tracking-wide">Lead Substages & Call Outcome Mapping</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Configure detailed substages under main lead pipeline stages. Substages inherit stage colors and map call connection outcomes directly to workflow steps.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500 text-sm">Loading lead stages and substages...</div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">{error}</div>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <div
              key={group.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-800"
            >
              {/* Group Header */}
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between dark:bg-slate-800/50 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <span
                    className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: group.color || '#10b981' }}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">{group.name}</h3>
                      {group.isApprovalRequired && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                          Approval Required
                        </span>
                      )}
                      {group.isLOB && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300">
                          LOB Stage
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500">{group.substages.length} substages configured</span>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenCreate(group.id)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-sm shadow-emerald-600/20"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Substage</span>
                </button>
              </div>

              {/* Substage List */}
              {group.substages.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 italic">
                  No substages configured under this stage yet. Click "Add Substage" above.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {group.substages.map((sub) => (
                    <div
                      key={sub.id}
                      className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50/60 transition dark:hover:bg-slate-800/30"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-slate-400 w-6">#{sub.sortOrder}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900 dark:text-white">{sub.name}</span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                sub.status === 'ACTIVE'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                              }`}
                            >
                              {sub.status}
                            </span>

                            {sub.connectionStatusRestriction && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                                {sub.connectionStatusRestriction} ONLY
                              </span>
                            )}

                            {sub.outcomeCategory && (
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  sub.outcomeCategory === 'POSITIVE'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : sub.outcomeCategory === 'NEGATIVE'
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                }`}
                              >
                                {sub.outcomeCategory}
                              </span>
                            )}
                          </div>
                          {sub.description && (
                            <p className="text-xs text-slate-500 mt-0.5 max-w-md">{sub.description}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggle(sub.id)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200 transition dark:text-slate-400 dark:hover:bg-slate-800"
                        >
                          {sub.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleOpenEdit(sub)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(sub.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal for Create/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingSubstage ? 'Edit Substage' : 'Create New Substage'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs text-slate-800 dark:text-slate-100">
              <div>
                <label className="block font-bold text-slate-600 mb-1">Substage Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Price Quoted, Technical Review..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description of this substage..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Sort Order</label>
                  <input
                    type="number"
                    min={0}
                    value={sortOrder}
                    onChange={(e) => setSortOrder(parseInt(e.target.value || '0', 10))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">Connection Restriction</label>
                  <select
                    value={connectionRestriction}
                    onChange={(e) => setConnectionRestriction(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  >
                    <option value="">Both Connected / Not</option>
                    <option value="CONNECTED">Connected ONLY</option>
                    <option value="NOT_CONNECTED">Not Connected ONLY</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Outcome Category</label>
                <select
                  value={outcomeCategory}
                  onChange={(e) => setOutcomeCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                >
                  <option value="">None / General</option>
                  <option value="POSITIVE">Positive Outcome</option>
                  <option value="FOLLOW_UP">Follow-Up Required</option>
                  <option value="NEGATIVE">Negative Outcome</option>
                  <option value="NEUTRAL">Neutral / Information</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-bold text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/20"
                >
                  {submitting ? 'Saving...' : 'Save Substage'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
