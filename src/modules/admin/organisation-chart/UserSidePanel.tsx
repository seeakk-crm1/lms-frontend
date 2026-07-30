import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Phone, Shield, Building2, User, Clock, Users, Briefcase } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';
import { useOrganisationChartStore } from './organisationChart.store';
import { formatPhoneWithFlag } from '../../../utils/phoneUtils';

interface UserDetails {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
  role: string | null;
  department: string | null;
  supervisor: { name: string; id: string } | null;
  subordinates: { id: string; name: string; email: string; role: { name: string }; isActive: boolean }[];
  permissionsCount: number;
  openLeadsCount: number;
  todayAttendance: string;
}

const fetchUserDetails = async (userId: string): Promise<UserDetails> => {
  console.log('[Organisation Chart] User Card Clicked');
  console.log('[Organisation Chart] Selected User ID:', userId);
  console.log('[Organisation Chart] Calling Details API:', `/admin/organisation-chart/${userId}/details`);
  
  const response = await api.get(`/admin/organisation-chart/${userId}/details`);
  
  console.log('[Organisation Chart] API Response Received');
  return response.data.data;
};

const UserSidePanel: React.FC = () => {
  const { selectedNode, setSelectedNode } = useOrganisationChartStore();

  const { data: user, isLoading, isError } = useQuery({
    queryKey: ['organisation-user-details', selectedNode],
    queryFn: () => fetchUserDetails(selectedNode!),
    enabled: !!selectedNode && !selectedNode.startsWith('dept-') && !selectedNode.startsWith('root-'),
  });

  const isOpen = !!selectedNode;
  const isDepartmentOrWorkspace = selectedNode?.startsWith('dept-') || selectedNode?.startsWith('root-');

  if (isOpen) {
    console.log('[Organisation Chart] Rendering Details Drawer:', selectedNode);
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedNode(null)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
          />
          <motion.div
            initial={{ x: '100%', boxShadow: '0 0 0 rgba(0,0,0,0)' }}
            animate={{ x: 0, boxShadow: '-10px 0 30px rgba(0,0,0,0.1)' }}
            exit={{ x: '100%', boxShadow: '0 0 0 rgba(0,0,0,0)' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 flex flex-col shadow-2xl border-l border-gray-200"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg font-black text-gray-900 tracking-tight">Details</h2>
              <button
                onClick={() => setSelectedNode(null)}
                className="p-2 rounded-full hover:bg-gray-200 transition-colors text-gray-500 hover:text-gray-900"
                aria-label="Close panel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              {isDepartmentOrWorkspace ? (
                <div className="text-center py-20 text-gray-500">
                  <Building2 className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-lg font-bold">Group Selected</p>
                  <p className="text-sm mt-1">Select an individual user to view their complete details.</p>
                </div>
              ) : isLoading ? (
                <div className="space-y-6 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-2xl" />
                    <div className="space-y-2 flex-1">
                      <div className="h-5 bg-gray-200 rounded w-1/2" />
                      <div className="h-3 bg-gray-200 rounded w-1/3" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-20 bg-gray-100 rounded-xl" />
                    <div className="h-20 bg-gray-100 rounded-xl" />
                  </div>
                </div>
              ) : isError ? (
                <div className="text-center py-20 text-red-500">
                  <p className="text-lg font-bold">Failed to load user</p>
                  <p className="text-sm mt-1 text-red-400">Please try again later.</p>
                </div>
              ) : user ? (
                <div className="space-y-8">
                  {/* Header Profile */}
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 shrink-0 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white font-black flex items-center justify-center shadow-lg text-2xl">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-gray-900">{user.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${user.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                          {user.isActive ? 'Active User' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="bg-gray-50 rounded-2xl p-4 space-y-3 border border-gray-100">
                    <div className="flex items-center gap-3 text-sm font-semibold text-gray-600">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <a href={`mailto:${user.email}`} className="hover:text-emerald-600 truncate">{user.email}</a>
                    </div>
                    {user.phone && (
                      <div className="flex items-center gap-3 text-sm font-semibold text-gray-600">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <a href={`tel:${user.phone}`} className="hover:text-emerald-600">{formatPhoneWithFlag(user.phone)}</a>
                      </div>
                    )}
                  </div>

                  {/* Roles and Department */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
                      <div className="flex items-center gap-1.5 text-xs font-black text-gray-400 uppercase tracking-wider mb-1">
                        <Shield className="w-3.5 h-3.5" />
                        Role
                      </div>
                      <p className="text-sm font-bold text-gray-900 truncate">{user.role || 'Unassigned'}</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
                      <div className="flex items-center gap-1.5 text-xs font-black text-gray-400 uppercase tracking-wider mb-1">
                        <Building2 className="w-3.5 h-3.5" />
                        Department
                      </div>
                      <p className="text-sm font-bold text-gray-900 truncate">{user.department || 'Unassigned'}</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
                      <div className="flex items-center gap-1.5 text-xs font-black text-gray-400 uppercase tracking-wider mb-1">
                        <User className="w-3.5 h-3.5" />
                        Supervisor
                      </div>
                      <p className="text-sm font-bold text-gray-900 truncate">{user.supervisor?.name || 'Top Level'}</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
                      <div className="flex items-center gap-1.5 text-xs font-black text-gray-400 uppercase tracking-wider mb-1">
                        <Clock className="w-3.5 h-3.5" />
                        Today's Status
                      </div>
                      <p className="text-sm font-bold text-gray-900 truncate">{user.todayAttendance.replace(/_/g, ' ')}</p>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-4">
                      <p className="text-2xl font-black text-indigo-700">{user.permissionsCount}</p>
                      <p className="text-xs font-bold text-indigo-600/80 uppercase tracking-wider mt-0.5">Permissions</p>
                    </div>
                    <div className="bg-gradient-to-br from-rose-50 to-orange-50 border border-rose-100 rounded-xl p-4">
                      <p className="text-2xl font-black text-rose-700">{user.openLeadsCount}</p>
                      <p className="text-xs font-bold text-rose-600/80 uppercase tracking-wider mt-0.5">Open Leads</p>
                    </div>
                  </div>

                  {/* Subordinates List */}
                  {user.subordinates && user.subordinates.length > 0 && (
                    <div className="space-y-3 pt-4 border-t border-gray-100">
                      <h4 className="text-sm font-black text-gray-900 flex items-center gap-2">
                        <Users className="w-4 h-4 text-emerald-600" />
                        Direct Reports ({user.subordinates.length})
                      </h4>
                      <div className="space-y-2">
                        {user.subordinates.map((sub) => (
                          <div
                            key={sub.id}
                            onClick={() => setSelectedNode(sub.id)}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-colors cursor-pointer group"
                          >
                            <div className="h-8 w-8 rounded-lg bg-gray-100 text-gray-600 font-bold flex items-center justify-center text-xs group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors">
                              {sub.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-gray-900 truncate">{sub.name}</p>
                              <p className="text-xs font-semibold text-gray-500 truncate">{sub.role?.name || 'No Role'}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-8 pb-4 text-center">
                    <p className="text-xs font-semibold text-gray-400">
                      Member since {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default UserSidePanel;
