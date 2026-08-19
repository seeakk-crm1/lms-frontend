import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 p-6 text-red-700">
        <h3 className="font-bold">Error loading execution runs</h3>
        <p className="text-sm">Please retry or contact support.</p>
      </div>
    );
  }

  return (
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
            const duration = run.completedAt 
              ? `${Math.round((new Date(run.completedAt).getTime() - new Date(run.startedAt).getTime()) / 1000)}s`
              : '-';

            return (
              <div 
                key={run.id} 
                className={`overflow-hidden rounded-xl border transition ${
                  isExpanded ? 'border-indigo-200 shadow-md' : 'border-slate-200 bg-white hover:shadow-sm'
                }`}
              >
                {/* Header Row */}
                <div 
                  onClick={() => toggleExpand(run.id)}
                  className="flex flex-wrap items-center justify-between gap-4 p-4 cursor-pointer hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      ID: {run.id.slice(-6).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-800">
                        Record Target: {run.recordType} ({run.recordId.slice(-6).toUpperCase()})
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Triggered at: {formatTime(run.createdAt)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                      <div className="text-xs text-slate-400">Duration</div>
                      <div className="text-sm font-semibold text-slate-700">{duration}</div>
                    </div>
                    {getStatusBadge(run.status)}
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Steps Details */}
                {isExpanded && (
                  <div className="bg-slate-50 border-t border-slate-100 p-4 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Execution Step Timeline
                    </h4>

                    {run.error && (
                      <div className="rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-100 mb-3">
                        <span className="font-semibold">Execution Error:</span> {run.error}
                      </div>
                    )}

                    {!run.actionExecutions || run.actionExecutions.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No action steps executed in this run.</p>
                    ) : (
                      <div className="space-y-3 pl-2 border-l border-indigo-100 relative ml-2">
                        {run.actionExecutions.map((step, sIdx) => (
                          <div key={step.id} className="relative pl-6">
                            
                            {/* Bullet icon */}
                            <div className="absolute left-[-5px] top-1.5 h-2.5 w-2.5 rounded-full bg-indigo-500 border border-white"></div>
                            
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                              <div>
                                <span className="text-xs font-semibold text-slate-800">
                                  Step {sIdx + 1}: Action Position {step.position}
                                </span>
                                <span className="text-xs text-slate-400 font-mono ml-2">
                                  [ID: {step.id.slice(-6).toUpperCase()}]
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                {getStepStatusBadge(step.status)}
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
  );
};

export default WorkflowRunsPage;
