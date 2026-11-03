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
        { label: 'Defined Roles', value: totalRoles, icon: Shield, iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100/60' },
        { label: 'Active Matrix', value: activeRoles, icon: ShieldCheck, iconBg: 'bg-blue-50 text-blue-600 border-blue-100/60' },
        { label: 'Inactive Roles', value: totalRoles - activeRoles, icon: ShieldAlert, iconBg: 'bg-amber-50 text-amber-600 border-amber-100/60' },
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
        <div className="flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar relative p-3.5 sm:p-5 lg:p-6">
            {/* Background Decorator */}
            <div className="absolute top-0 right-0 w-[500px] h-[300px] bg-gradient-to-bl from-emerald-50/60 via-transparent to-transparent pointer-events-none -z-10" />

            <div className="max-w-[1560px] mx-auto space-y-3.5 sm:space-y-4">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">Administration</span>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Security & RBAC Roles</h1>
                        <p className="text-xs text-gray-500 max-w-lg mt-0.5">Configure granular access control matrices and define operational roles for your organization.</p>
                    </motion.div>

                    <motion.button
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={handleCreateRole}
                        className="inline-flex items-center justify-center gap-1.5 h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer active:scale-95 shrink-0"
                    >
                        <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                        <span>Create New Role</span>
                    </motion.button>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="p-3.5 sm:p-4 bg-white rounded-xl border border-gray-200/90 shadow-2xs flex items-center justify-between group hover:border-emerald-500/30 transition-all"
                        >
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{stat.label}</p>
                                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{stat.value}</h3>
                            </div>
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${stat.iconBg} group-hover:scale-105 transition-transform shrink-0`}>
                                <stat.icon className="w-4 h-4" />
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Table Section */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
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
