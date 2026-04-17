import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, ShieldCheck, ShieldAlert, Plus } from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import RolesTable from '../components/admin/roles/RolesTable';
import RoleModal from '../components/admin/roles/RoleModal';
import DeleteConfirmModal from '../components/admin/roles/DeleteConfirmModal';
import { Role } from '../types/role.types';
import { useRolesQuery } from '../hooks/useRolesQuery';
import { useRoleMutations } from '../hooks/useRoleMutations';

const AdminRolesPage: React.FC = () => {
    
    // Modal states
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);

    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string; name: string }>({
        isOpen: false,
        id: '',
        name: ''
    });

    const { data: rolesResponse } = useRolesQuery();
    const { deleteRole } = useRoleMutations();
    const totalRoles = rolesResponse?.pagination?.total || 0;
    const activeRoles = rolesResponse?.data?.filter((r: any) => r.status === 'ACTIVE').length || 0;

    const stats = [
        { label: 'Defined Roles', value: totalRoles, icon: Shield, color: 'emerald' },
        { label: 'Active Matrix', value: activeRoles, icon: ShieldCheck, color: 'blue' },
        { label: 'Inactive Roles', value: totalRoles - activeRoles, icon: ShieldAlert, color: 'amber' },
    ];

    const handleCreateRole = () => {
        setSelectedRole(null);
        setIsRoleModalOpen(true);
    };

    const handleEditRole = (role: Role) => {
        setSelectedRole(role);
        setIsRoleModalOpen(true);
    };

    const handleManagePermissions = (role: Role) => {
        setSelectedRole(role);
        setIsRoleModalOpen(true);
    };

    const handleDeleteRequest = (id: string, name: string) => {
        setDeleteModal({ isOpen: true, id, name });
    };

    const handleConfirmDelete = () => {
        deleteRole.mutate(deleteModal.id);
        setDeleteModal({ ...deleteModal, isOpen: false });
    };

    return (
    <DashboardLayout>
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
                        <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Security & RBAC Roles</h1>
                        <p className="text-sm text-gray-500 max-w-lg mt-1">Configure granular access control matrices and define operational roles for your organization.</p>
                    </motion.div>

                    <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={handleCreateRole}
                        className="flex items-center justify-center gap-2 px-8 py-3 bg-emerald-500 text-white rounded-2xl text-sm font-black shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-95"
                    >
                        <Plus className="w-4 h-4" strokeWidth={3} />
                        <span>Create New Role</span>
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
                            <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 flex items-center justify-center text-${stat.color}-500 group-hover:scale-110 transition-transform`}>
                                <stat.icon className="w-6 h-6" />
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
                    <RolesTable 
                        onEdit={handleEditRole} 
                        onManagePermissions={handleManagePermissions} 
                        onDelete={handleDeleteRequest}
                    />
                </motion.div>
            </div>
        </div>

        <RoleModal 
            isOpen={isRoleModalOpen} 
            onClose={() => setIsRoleModalOpen(false)} 
            role={selectedRole} 
            onDelete={handleDeleteRequest}
        />

        <DeleteConfirmModal 
            isOpen={deleteModal.isOpen}
            onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
            onConfirm={handleConfirmDelete}
            roleName={deleteModal.name}
        />
    </DashboardLayout>
    );
};

export default AdminRolesPage;
