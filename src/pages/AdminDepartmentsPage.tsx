import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Plus, Users, CheckCircle, AlertCircle } from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import DepartmentsTable from '../components/admin/departments/DepartmentsTable';
import DepartmentModal from '../components/admin/departments/DepartmentModal';
import DeleteDepartmentModal from '../components/admin/departments/DeleteDepartmentModal';
import { Department } from '../types/department.types';
import { useDepartmentsQuery } from '../hooks/useDepartmentsQuery';
import { useDepartmentMutations } from '../hooks/useDepartmentMutations';

const AdminDepartmentsPage: React.FC = () => {
    
    // Modal states
    const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
    const [selectedDept, setSelectedDept] = useState<Department | null>(null);

    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string; name: string }>({
        isOpen: false,
        id: '',
        name: ''
    });

    const { data: deptResponse } = useDepartmentsQuery();
    const { deleteDepartment } = useDepartmentMutations();
    
    const totalDepts = deptResponse?.pagination?.total || 0;
    const departmentsList = deptResponse?.data || [];
    const activeDepts = departmentsList.filter((d: Department) => d.status === 'ACTIVE').length;

    const stats = [
        { label: 'Total Departments', value: totalDepts, icon: Building2, color: 'emerald' },
        { label: 'Active Groups', value: activeDepts, icon: CheckCircle, color: 'blue' },
        { label: 'Inactive Groups', value: Math.max(0, totalDepts - activeDepts), icon: AlertCircle, color: 'amber' },
    ];

    const handleCreateDept = () => {
        setSelectedDept(null);
        setIsDeptModalOpen(true);
    };

    const handleEditDept = (dept: Department) => {
        setSelectedDept(dept);
        setIsDeptModalOpen(true);
    };

    const handleDeleteRequest = (id: string, name: string) => {
        setDeleteModal({ isOpen: true, id, name });
    };

    const handleConfirmDelete = () => {
        deleteDepartment.mutate(deleteModal.id);
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
                        <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight text-center sm:text-left">Department Management</h1>
                        <p className="text-sm text-gray-500 max-w-lg mt-1 text-center sm:text-left">Organize your workforce into functional units. Departments help in structural reporting and data categorization.</p>
                    </motion.div>

                    <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={handleCreateDept}
                        className="flex items-center justify-center gap-2 px-8 py-3 bg-emerald-500 text-white rounded-2xl text-sm font-black shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-95"
                    >
                        <Plus className="w-4 h-4" strokeWidth={3} />
                        <span>Add Department</span>
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
                    <DepartmentsTable 
                        onEdit={handleEditDept} 
                        onDelete={handleDeleteRequest}
                    />
                </motion.div>
            </div>
        </div>

        <DepartmentModal 
            isOpen={isDeptModalOpen} 
            onClose={() => setIsDeptModalOpen(false)} 
            department={selectedDept} 
            onDelete={handleDeleteRequest}
        />

        <DeleteDepartmentModal 
            isOpen={deleteModal.isOpen}
            onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
            onConfirm={handleConfirmDelete}
            departmentName={deleteModal.name}
        />
    </DashboardLayout>
    );
};

export default AdminDepartmentsPage;
