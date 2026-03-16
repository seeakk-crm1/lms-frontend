import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, Lock, LucideIcon } from 'lucide-react';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import UsersTable from '../components/users/UsersTable';
import CreateUserModal from '../components/users/CreateUserModal';
import { useUsersQuery } from '../hooks/useUsersQuery';
import { useUsersStore } from '../store/useUsersStore';

interface StatItem {
  label: string;
  value: number;
  icon: LucideIcon;
  color: 'emerald' | 'amber' | 'blue';
}

const AdminUsersPage: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [, setMobileMenuOpen] = useState(false);
  const { openCreateModal } = useUsersStore();
  
  const { data: usersData } = useUsersQuery();
  const totalUsers = usersData?.total || 0;
  
  // Calculate stats dynamically
  const activeUsers = usersData?.users?.filter((u: any) => u.isActive).length || 0;
  const lockedUsers = usersData?.users?.filter((u: any) => u.isLocked).length || 0;
  
  const stats: StatItem[] = [
    { label: 'Total Users', value: totalUsers, icon: Users, color: 'emerald' },
    { label: 'Compliance Locks', value: lockedUsers, icon: Lock, color: 'amber' },
    { label: 'Active Agents', value: activeUsers, icon: UserCheck, color: 'blue' },
  ];

  return (
    <div className="h-screen w-full bg-gray-50 flex overflow-hidden font-sans text-gray-900 selection:bg-emerald-200 selection:text-emerald-900">
      <DashboardSidebar
        isCollapsed={isSidebarCollapsed}
        toggleCollapsed={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <DashboardHeader setMobileMenuOpen={setMobileMenuOpen} />

        <div className="flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar relative p-4 md:p-8">
           {/* Background Decorator */}
           <div className="absolute top-0 right-0 w-[800px] h-[500px] bg-gradient-to-bl from-emerald-50/80 via-transparent to-transparent pointer-events-none -z-10" />

           <div className="max-w-[1400px] mx-auto space-y-6 md:space-y-8">
             {/* Header Section */}
             <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
               <motion.div
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
               >
                 <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-600 text-[10px] font-bold uppercase tracking-wider">Administration</span>
                 </div>
                 <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Users Management</h1>
                 <p className="text-sm text-gray-500 max-w-lg mt-1">Manage your team members, roles, and performance target compliance.</p>
               </motion.div>

               <motion.button
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 onClick={() => openCreateModal()}
                 className="md:hidden flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-2xl text-sm font-bold shadow-lg shadow-emerald-500/20 active:scale-95"
               >
                 <Users className="w-4 h-4" />
                 <span>Onboard New User</span>
               </motion.button>
             </div>

             {/* Stats Row */}
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {stats.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-5 md:p-6 bg-white rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-emerald-500/30 transition-all"
                  >
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                      <h3 className="text-2xl md:text-3xl font-black text-gray-900">{stat.value}</h3>
                    </div>
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-${stat.color}-50 flex items-center justify-center text-${stat.color}-500 group-hover:scale-110 transition-transform`}>
                      <stat.icon className="w-5 h-5 md:w-6 md:h-6" />
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
      </main>
    </div>
  );
};

export default AdminUsersPage;
