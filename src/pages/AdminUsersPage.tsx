import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, Lock, LucideIcon } from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import UsersTable from '../components/users/UsersTable';
import CreateUserModal from '../components/users/CreateUserModal';
import { useUsersQuery } from '../hooks/useUsersQuery';
import { useUsersStore } from '../store/useUsersStore';
import useAuthStore from '../store/useAuthStore';
import { hasAnyPermission } from '../utils/permissions';

interface StatItem {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
}

const AdminUsersPage: React.FC = () => {
  const { openCreateModal } = useUsersStore();
  
  const { data: usersData } = useUsersQuery();
  const totalUsers = usersData?.pagination?.total || 0;
  
  // Calculate stats dynamically
  const activeUsers = usersData?.users?.filter((u: any) => u.isActive).length || 0;
  const lockedUsers = usersData?.users?.filter((u: any) => u.isLocked).length || 0;
  
  const stats: StatItem[] = [
    { label: 'Total Users', value: totalUsers, icon: Users, color: 'emerald' },
    { label: 'Compliance Locks', value: lockedUsers, icon: Lock, color: 'amber' },
    { label: 'Active Agents', value: activeUsers, icon: UserCheck, color: 'blue' },
  ];

  const currentUser = useAuthStore((state) => state.user);
  const canCreate = hasAnyPermission(currentUser, ['USERS_CREATE']);

  return (
    <DashboardLayout>
      <div className="relative flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar p-3.5 sm:p-5 lg:p-6">
         {/* Background Decorator */}
         <div className="absolute top-0 right-0 w-[600px] h-[360px] bg-gradient-to-bl from-emerald-50/60 via-transparent to-transparent pointer-events-none -z-10" />

         <div className="max-w-[1560px] mx-auto space-y-3.5 sm:space-y-4">
           {/* Header Section */}
           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
             <motion.div
               initial={{ opacity: 0, x: -16 }}
               animate={{ opacity: 1, x: 0 }}
             >
               <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold uppercase tracking-wider">Administration</span>
               </div>
               <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Users Management</h1>
               <p className="text-xs text-gray-500 max-w-lg mt-0.5">Manage your team members, roles, and performance target compliance.</p>
             </motion.div>

             {canCreate && (
               <motion.button
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 onClick={() => openCreateModal()}
                 className="md:hidden flex items-center justify-center gap-1.5 h-9 px-3.5 bg-emerald-600 text-white rounded-lg text-xs font-bold shadow-xs active:scale-95 cursor-pointer"
               >
                 <Users className="w-3.5 h-3.5" />
                 <span>Onboard New User</span>
               </motion.button>
             )}
           </div>

           {/* Stats Row */}
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3.5">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="h-[76px] sm:h-[80px] p-3 sm:p-3.5 bg-white rounded-xl border border-gray-200/80 shadow-xs flex items-center justify-between hover:border-gray-300 transition-all"
                >
                  <div>
                    <p className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{stat.label}</p>
                    <h3 className="text-xl sm:text-2xl font-black text-gray-900 leading-none">{stat.value}</h3>
                  </div>
                  <div className={`w-9 h-9 rounded-lg bg-${stat.color}-50 flex items-center justify-center text-${stat.color}-600 border border-${stat.color}-100`}>
                    <stat.icon className="w-4 h-4" />
                  </div>
                </motion.div>
              ))}
           </div>

           {/* Table Section */}
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.3 }}
           >
             <UsersTable />
           </motion.div>
         </div>
      </div>

      <CreateUserModal />
    </DashboardLayout>
  );
};

export default AdminUsersPage;
