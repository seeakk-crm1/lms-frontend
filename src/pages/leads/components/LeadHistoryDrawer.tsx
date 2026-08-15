import React, { useEffect, useState } from 'react';
import { 
  X, Search, Download, Clock, User as UserIcon, Activity, 
  DollarSign, RefreshCw, FileText, CheckCircle, XCircle 
} from 'lucide-react';
import api from '../../../services/api';
import { TimelineEvent } from '../../../types/lead.types';

interface LeadHistoryDrawerProps {
  isOpen: boolean;
  leadId: string | null;
  onClose: () => void;
}

const getEventIcon = (eventType: string) => {
  switch (eventType) {
    case 'SUBSTAGE_CHANGE': return <RefreshCw className="w-5 h-5 text-emerald-500" />;
    case 'CONNECTION_STATUS_CHANGE': return <Activity className="w-5 h-5 text-blue-500" />;
    case 'PRIORITY_CHANGE': return <Activity className="w-5 h-5 text-amber-500" />;
    case 'FOLLOWUP_EXTENDED': return <Clock className="w-5 h-5 text-purple-500" />;
    case 'ACTIVITY': return <Activity className="w-5 h-5 text-blue-500" />;
    case 'STAGE_CHANGE': return <RefreshCw className="w-5 h-5 text-indigo-500" />;
    case 'AMOUNT_CHANGE': return <DollarSign className="w-5 h-5 text-green-500" />;
    case 'PAYMENT': return <FileText className="w-5 h-5 text-orange-500" />;
    case 'PAYMENT_APPROVAL': return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'PAYMENT_REJECTION': return <XCircle className="w-5 h-5 text-red-500" />;
    case 'LOB': return <XCircle className="w-5 h-5 text-gray-500" />;
    case 'AUDIT': return <Clock className="w-5 h-5 text-gray-400" />;
    default: return <Clock className="w-5 h-5 text-gray-400" />;
  }
};

const LeadHistoryDrawer: React.FC<LeadHistoryDrawerProps> = ({ isOpen, leadId, onClose }) => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  useEffect(() => {
    if (isOpen && leadId) {
      fetchHistory();
    }
  }, [isOpen, leadId]);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/leads/${leadId}/history`);
      if (response.data && response.data.data) {
        setEvents(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch lead history', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    let matchesSearch = (event.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                        (event.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    if (searchQuery && event.changes) {
      const changesMatch = event.changes.some(c => 
        String(c.fieldKey).toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(c.oldValue || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(c.newValue || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (changesMatch) matchesSearch = true;
    }

    let matchesFilter = filterType === 'ALL';
    if (!matchesFilter) {
      if (filterType === 'Remarks') {
        matchesFilter = event.eventType === 'FIELD_UPDATE' && event.changes?.some(c => c.fieldKey === 'remarks') || false;
      } else if (filterType === 'Assignment Changes') {
        matchesFilter = event.eventType === 'FIELD_UPDATE' && event.changes?.some(c => c.fieldKey === 'assignedToId') || false;
      } else if (filterType === 'Follow-up Changes') {
        matchesFilter = event.eventType === 'FOLLOWUP_EXTENDED' || Boolean(event.eventType === 'FIELD_UPDATE' && event.changes?.some(c => c.fieldKey === 'nextFollowUpAt'));
      } else if (filterType === 'Substage Changes') {
        matchesFilter = event.eventType === 'SUBSTAGE_CHANGE';
      } else if (filterType === 'Connection Status') {
        matchesFilter = event.eventType === 'CONNECTION_STATUS_CHANGE';
      } else if (filterType === 'Priority Changes') {
        matchesFilter = event.eventType === 'PRIORITY_CHANGE';
      } else if (filterType === 'Dynamic Fields') {
        matchesFilter = event.eventType === 'FIELD_UPDATE' && event.changes?.some(c => c.fieldKey.length > 20) || false;
      } else if (filterType === 'PAYMENT') {
        matchesFilter = ['PAYMENT', 'PAYMENT_APPROVAL', 'PAYMENT_REJECTION', 'AMOUNT_CHANGE'].includes(event.eventType);
      } else {
        matchesFilter = event.eventType === filterType;
      }
    }
    return matchesSearch && matchesFilter;
  });

  const handleExportCSV = () => {
    if (events.length === 0) return;
    
    const headers = ['Date', 'Time', 'Field', 'Previous Value', 'New Value', 'Changed By', 'Reason', 'Event Type'];
    
    const rows: string[] = [];
    rows.push(headers.join(','));

    events.forEach(e => {
      const dt = new Date(e.timestamp);
      const dateStr = dt.toLocaleDateString();
      const timeStr = dt.toLocaleTimeString();
      const userStr = e.user?.name || 'System';
      const eventTypeStr = e.eventType;
      const reasonStr = ((e as any).reason || e.description || '').replace(/"/g, '""');

      if (e.changes && e.changes.length > 0) {
        e.changes.forEach(change => {
          const fieldStr = String(change.fieldKey).replace(/"/g, '""');
          const oldStr = String(change.oldValue || 'None').replace(/"/g, '""');
          const newStr = String(change.newValue || 'None').replace(/"/g, '""');
          rows.push(`"${dateStr}","${timeStr}","${fieldStr}","${oldStr}","${newStr}","${userStr}","${reasonStr}","${eventTypeStr}"`);
        });
      } else {
        let fieldStr = '';
        let oldStr = '';
        let newStr = '';
        
        if (e.eventType === 'STAGE_CHANGE') {
          fieldStr = 'Stage';
          oldStr = e.metadata?.fromStageId || 'None';
          newStr = e.metadata?.toStageId || 'None';
        } else if (e.eventType === 'AMOUNT_CHANGE') {
          fieldStr = 'Total Amount';
          oldStr = e.metadata?.oldAmount || '0';
          newStr = e.metadata?.newAmount || '0';
        }
        
        rows.push(`"${dateStr}","${timeStr}","${fieldStr}","${oldStr}","${newStr}","${userStr}","${reasonStr}","${eventTypeStr}"`);
      }
    });

    const csvContent = rows.join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `lead_history_${leadId}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10200]" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white shadow-2xl z-[10200] flex flex-col transform transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Lead History</h2>
            <p className="text-sm text-gray-500 mt-1">Complete audit timeline of all events</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="py-2 pl-3 pr-8 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="ALL">All Events</option>
            <option value="FIELD_UPDATE">Field Updates</option>
            <option value="STAGE_CHANGE">Stage Changes</option>
            <option value="Substage Changes">Substage Changes</option>
            <option value="Connection Status">Connection Status</option>
            <option value="Priority Changes">Priority Changes</option>
            <option value="Follow-up Changes">Follow-up Extension</option>
            <option value="PAYMENT">Payment Changes</option>
            <option value="Assignment Changes">Assignment Changes</option>
            <option value="Remarks">Remarks</option>
            <option value="Dynamic Fields">Dynamic Fields</option>
            <option value="AUDIT">Audit Logs</option>
          </select>
          <button
            onClick={handleExportCSV}
            disabled={events.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* Timeline Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Clock className="w-12 h-12 text-gray-300 mb-4" />
              <p className="text-lg font-medium text-gray-900">No history found</p>
              <p className="text-sm">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="relative border-l-2 border-gray-100 ml-3 space-y-8 pb-8">
              {filteredEvents.map((event) => (
                <div key={event.id} className="relative pl-8 group">
                  {/* Timeline Dot */}
                  <div className="absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-white border-2 border-gray-100 flex items-center justify-center shadow-sm group-hover:border-blue-100 transition-colors">
                    <div className="bg-white rounded-full p-[2px]">
                      {getEventIcon(event.eventType)}
                    </div>
                  </div>

                  {/* Content Card */}
                  <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900">{event.title}</h4>
                      <span className="text-xs text-gray-400 whitespace-nowrap bg-gray-50 px-2 py-1 rounded-full">
                        {new Date(event.timestamp).toLocaleString()}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{event.description}</p>
                    
                    {event.changes && event.changes.length > 0 && (
                      <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 mb-3 space-y-2">
                        {event.changes.map((change, idx) => (
                          <div key={idx} className="text-sm flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                            <span className="font-medium text-gray-700 min-w-[120px]">
                              {String(change.fieldKey).includes(' ')
                                ? String(change.fieldKey)
                                : String(change.fieldKey).replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                            </span>
                            <div className="flex items-center flex-1 gap-2 flex-wrap">
                              <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded text-xs truncate max-w-[200px]" title={String(change.oldValue || 'None')}>
                                {String(change.oldValue || 'None')}
                              </span>
                              <span className="text-gray-400">→</span>
                              <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded text-xs truncate max-w-[200px]" title={String(change.newValue || 'None')}>
                                {String(change.newValue || 'None')}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {(event as any).metadata?.recordingUrl && (
                      <div className="my-3 p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Call Recording ({(event as any).metadata.provider || 'Knowlarity'})</span>
                          </span>
                          {(event as any).metadata.duration ? (
                            <span className="font-mono text-[11px] text-slate-500">
                              {Math.floor((event as any).metadata.duration / 60)}m {(event as any).metadata.duration % 60}s
                            </span>
                          ) : null}
                        </div>
                        <audio
                          controls
                          controlsList="nodownload"
                          src={(event as any).metadata.recordingUrl}
                          className="w-full h-8 rounded-lg outline-none"
                        />
                      </div>
                    )}

                    {(event as any).reason && (
                      <div className="mb-3 rounded-lg border border-amber-100 bg-amber-50/80 p-2.5 text-xs font-semibold text-gray-700">
                        <span className="font-bold text-amber-800">Reason: </span>
                        {(event as any).reason}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                      <div className="flex items-center text-xs text-gray-500">
                        <UserIcon className="w-3 h-3 mr-1" />
                        {event.user?.name || 'System'}
                      </div>
                      <span className="text-[10px] font-medium px-2 py-1 bg-gray-100 text-gray-500 rounded-md uppercase tracking-wider">
                        {event.eventType.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default LeadHistoryDrawer;
