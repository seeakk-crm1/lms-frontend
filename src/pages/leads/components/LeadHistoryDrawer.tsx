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
    const matchesSearch = (event.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (event.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'ALL' || event.eventType === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleExportCSV = () => {
    if (events.length === 0) return;
    
    const headers = ['Date', 'Event Type', 'Title', 'Description', 'User'];
    const csvContent = [
      headers.join(','),
      ...events.map(e => {
        return [
          `"${new Date(e.timestamp).toLocaleString()}"`,
          `"${e.eventType}"`,
          `"${e.title.replace(/"/g, '""')}"`,
          `"${e.description.replace(/"/g, '""')}"`,
          `"${e.user?.name || 'System'}"`
        ].join(',');
      })
    ].join('\n');

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
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white shadow-2xl z-[101] flex flex-col transform transition-transform duration-300 ease-in-out">
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
            <option value="STAGE_CHANGE">Stage Changes</option>
            <option value="PAYMENT">Payments</option>
            <option value="AMOUNT_CHANGE">Amount Changes</option>
            <option value="ACTIVITY">Activities</option>
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
