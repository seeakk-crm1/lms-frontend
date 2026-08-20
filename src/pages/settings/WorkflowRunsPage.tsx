import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowLeft, Activity, CheckCircle, XCircle, AlertCircle, Clock, 
  HelpCircle, ChevronDown, ChevronUp, Database, Calendar 
} from 'lucide-react';
import { getWorkflowRuns, getWorkflowById, WorkflowExecution } from '../../services/automation.api';

export const WorkflowRunsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [expandedRunId, setExpandedRunId] = useState<string | null>(null);

  const { data: workflow } = useQuery({
    queryKey: ['automation-workflow', id],
    queryFn: () => getWorkflowById(id!),
    enabled: !!id,
  });

  const { data: runs = [], isLoading, error } = useQuery<WorkflowExecution[]>({
    queryKey: ['workflow-runs', id],
    queryFn: () => getWorkflowRuns(id!),
    enabled: !!id,
    refetchInterval: 5000, // Poll execution state logs every 5 seconds
  });

  const toggleExpand = (runId: string) => {
    setExpandedRunId(expandedRunId === runId ? null : runId);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
          <CheckCircle className="h-3 w-3" /> Completed
        </span>;
      case 'FAILED':
        return <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800">
          <XCircle className="h-3 w-3" /> Failed
        </span>;
      case 'PARTIALLY_FAILED':
        return <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-800">
          <AlertCircle className="h-3 w-3" /> Partially Failed
        </span>;
      case 'RUNNING':
        return <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
          <Clock className="h-3 w-3 animate-spin" /> Running
        </span>;
      case 'SKIPPED':
        return <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-800">
          Skipped
        </span>;
      case 'PENDING':
        return <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
          Pending
        </span>;
      default:
        return <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-800">
          {status}
        </span>;
    }
  };

  const getStepStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="text-[10px] font-bold text-emerald-600 uppercase">Success</span>;
      case 'FAILED':
        return <span className="text-[10px] font-bold text-red-600 uppercase">Failed</span>;
      case 'WAITING':
        return <span className="text-[10px] font-bold text-amber-600 uppercase">Waiting</span>;
      case 'RUNNING':
        return <span className="text-[10px] font-bold text-blue-600 uppercase">Running</span>;
      case 'SKIPPED':
        return <span className="text-[10px] font-bold text-slate-500 uppercase">Skipped</span>;
      default:
        return <span className="text-[10px] font-bold text-slate-400 uppercase">{status}</span>;
    }
  };

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '-';
    return new Date(timeStr).toLocaleString();
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
            <h3 className="font-bold">Error loading execution runs</h3>
            <p className="text-sm">Please retry or contact support.</p>
          </div>
        ) : (
          <div className="p-6 max-w-6xl mx-auto space-y-6">
            
            {/* Header */}
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/settings/automations')}
                className="rounded-lg p-2 hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-indigo-500" />
                  Execution Runs Log
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Debug logs and execution timeline for workflow: <span className="font-semibold text-slate-700">{workflow?.name}</span>
                </p>
              </div>
            </div>

            {/* Main Runs Table List */}
            {runs.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 py-12 text-center">
                <Database className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                <h3 className="text-lg font-medium text-slate-700">No Runs Logged Yet</h3>
                <p className="text-sm text-slate-500 mt-1">
                  This workflow has not been triggered yet. Runs will appear here in real-time.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {runs.map((run) => {
                  const isExpanded = expandedRunId === run.id;

                  return (
                    <div key={run.id} className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                      
                      {/* Run Row Header Summary */}
                      <div 
                        onClick={() => toggleExpand(run.id)}
                        className="p-4 flex flex-wrap items-center justify-between gap-4 hover:bg-slate-50 transition cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-3">
                          {getStatusBadge(run.status)}
                          <div>
                            <span className="text-xs font-semibold text-slate-400 font-mono">#{run.id.slice(-8)}</span>
                            <span className="text-xs text-slate-400 mx-2">•</span>
                            <span className="text-xs text-slate-500 font-medium">Triggered: {formatTime(run.createdAt)}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs font-semibold text-slate-400">
                            {run.actionExecutions?.length || 0} step{(run.actionExecutions?.length !== 1) ? 's' : ''} executed
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-slate-400" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-slate-400" />
                          )}
                        </div>
                      </div>

                      {/* Expanded Timeline Steps Details */}
                      {isExpanded && (
                        <div className="border-t border-slate-100 bg-slate-50 p-4 space-y-4">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                            <Activity className="h-3.5 w-3.5" />
                            <span>Execution Steps Timeline</span>
                          </div>

                          {(!run.actionExecutions || run.actionExecutions.length === 0) ? (
                            <p className="text-xs text-slate-400 italic">No action steps logged for this run execution yet.</p>
                          ) : (
                            <div className="relative pl-6 border-l border-slate-200 ml-3 space-y-5">
                              {run.actionExecutions.map((step, idx) => (
                                <div key={step.id} className="relative">
                                  
                                  {/* Step Index indicator */}
                                  <span className="absolute -left-[31px] top-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-slate-200 border-2 border-white text-[9px] font-bold text-slate-600">
                                    {idx + 1}
                                  </span>

                                  <div className="flex flex-col gap-1">
                                    <div className="flex flex-wrap items-center justify-between gap-4">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                                          Action Position {step.position}
                                        </span>
                                        {getStepStatusBadge(step.status)}
                                      </div>
                                      <div className="flex gap-2">
                                        <span className="text-[10px] text-slate-400">
                                          Scheduled: {formatTime(step.scheduledAt)}
                                        </span>
                                      </div>
                                    </div>

                                    {step.error && (
                                      <div className="text-xs text-red-600 bg-red-50/50 p-2 rounded mt-1.5 font-mono max-w-xl">
                                        Error: {step.error}
                                      </div>
                                    )}

                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default WorkflowRunsPage;
