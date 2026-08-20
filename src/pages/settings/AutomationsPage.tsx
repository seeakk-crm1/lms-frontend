import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { 
  Plus, Play, ToggleLeft, ToggleRight, Trash2, Edit3, 
  Settings2, Activity, Zap, HelpCircle 
} from 'lucide-react';
import { 
  getWorkflows, 
  toggleWorkflowStatus, 
  deleteWorkflow, 
  AutomationWorkflow 
} from '../../services/automation.api';
import toast from 'react-hot-toast';

export const AutomationsPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: workflows = [], isLoading, error } = useQuery<AutomationWorkflow[]>({
    queryKey: ['automation-workflows'],
    queryFn: getWorkflows,
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => 
      toggleWorkflowStatus(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-workflows'] });
      toast.success('Workflow status updated successfully');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update status');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteWorkflow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-workflows'] });
      toast.success('Workflow deleted successfully');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to delete workflow');
    }
  });

  const handleToggle = (id: string, currentStatus: boolean) => {
    toggleMutation.mutate({ id, active: !currentStatus });
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the workflow "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const getTriggerLabel = (triggerType: string) => {
    switch (triggerType) {
      case 'lead.created':
        return 'Lead Created';
      case 'lead.updated':
        return 'Lead Updated';
      case 'lead.stage_changed':
        return 'Lead Stage Changed';
      case 'lead.assigned':
        return 'Lead Assigned/Reassigned';
      case 'followup.created':
        return 'Follow-Up Created';
      case 'followup.completed':
        return 'Follow-Up Completed';
      default:
        return triggerType;
    }
  };

  return (
    <DashboardLayout>
      <div className="flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar relative p-4 md:p-8">
        {isLoading ? (
          <div className="flex h-96 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="rounded-xl bg-red-50 p-6 text-red-700">
            <h3 className="font-bold">Error loading workflows</h3>
            <p className="text-sm">Please make sure you have the required permissions.</p>
          </div>
        ) : (
          <div className="p-6">
            {/* Header */}
            <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  <Zap className="h-6 w-6 text-indigo-500" />
                  Workflow Automations
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  Build event-driven rules to automate lead assignment, follow-ups, and notifications.
                </p>
              </div>

              <button
                onClick={() => navigate('/settings/automations/create')}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
              >
                <Plus className="h-4 w-4" />
                Create Workflow
              </button>
            </div>

            {/* Stats Quick Grid */}
            <div className="grid gap-4 sm:grid-cols-3 mb-6">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Workflows</div>
                <div className="mt-2 text-2xl font-bold text-slate-800">{workflows.length}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Workflows</div>
                <div className="mt-2 text-2xl font-bold text-emerald-600">
                  {workflows.filter(w => w.active).length}
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Executions</div>
                <div className="mt-2 text-2xl font-bold text-slate-800">
                  {workflows.reduce((acc, curr) => acc + (curr._count?.executions || 0), 0)}
                </div>
              </div>
            </div>

            {/* Main List */}
            {workflows.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 py-12 px-4 text-center">
                <Zap className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                <h3 className="text-lg font-medium text-slate-700">No Automations Configured</h3>
                <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                  Get started by creating your first workflow to automate lead handoffs, triggers, and calendar schedules.
                </p>
                <button
                  onClick={() => navigate('/settings/automations/create')}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
                >
                  <Plus className="h-4 w-4" />
                  Create Your First Workflow
                </button>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        <th className="px-6 py-4">Workflow Name / Details</th>
                        <th className="px-6 py-4">Trigger Event</th>
                        <th className="px-6 py-4">Steps / Actions</th>
                        <th className="px-6 py-4">Runs</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
                      {workflows.map((flow) => (
                        <tr key={flow.id} className="hover:bg-slate-50 transition">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-slate-900">{flow.name}</div>
                            {flow.description && (
                              <div className="text-xs text-slate-500 mt-1 max-w-sm truncate">{flow.description}</div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
                              {getTriggerLabel(flow.triggerType)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-medium text-indigo-600">
                              {flow.actions?.length || 0} step{flow.actions?.length !== 1 ? 's' : ''}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => navigate(`/settings/automations/runs/${flow.id}`)}
                              className="inline-flex items-center gap-1 text-slate-500 hover:text-indigo-600 transition"
                            >
                              <Activity className="h-4 w-4" />
                              <span className="font-semibold">{flow._count?.executions || 0}</span>
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleToggle(flow.id, flow.active)}
                              className="transition focus:outline-none"
                            >
                              {flow.active ? (
                                <ToggleRight className="h-8 w-8 text-indigo-600" />
                              ) : (
                                <ToggleLeft className="h-8 w-8 text-slate-400" />
                              )}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => navigate(`/settings/automations/edit/${flow.id}`)}
                                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                                title="Edit Workflow"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(flow.id, flow.name)}
                                className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                                title="Delete Workflow"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AutomationsPage;
