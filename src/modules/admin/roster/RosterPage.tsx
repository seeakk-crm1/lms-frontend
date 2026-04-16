import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarClock, CalendarDays, Users } from 'lucide-react';
import DashboardLayout from '../../../components/dashboard/DashboardLayout';
import { useDepartmentsQuery, useSupervisorsQuery } from '../../../hooks/useUsersQuery';
import RosterFilters from './RosterFilters';
import RosterModal from './RosterModal';
import RosterTable from './RosterTable';
import { useRosterStore } from './roster.store';
import { useRosterEntriesQuery, useRosterUsersQuery } from './useRosterQuery';
import type { RosterUser } from './types';

const RosterPage: React.FC = () => {
  const [showFilters, setShowFilters] = useState(false);

  const {
    search,
    filters,
    pagination,
    selectedUser,
    editingEntry,
    modalState,
    setSearch,
    setFilters,
    setPagination,
    setUser,
    setEditingEntry,
    setRosterEntries,
    openModal,
    closeModal,
  } = useRosterStore();

  const [searchDraft, setSearchDraft] = useState(search);

  const {
    data: usersResp,
    isLoading: isUsersLoading,
    isFetching: isUsersFetching,
    isError: isUsersError,
    error: usersError,
    refetch: refetchUsers,
  } = useRosterUsersQuery();
  const { data: departmentsResp } = useDepartmentsQuery();
  const { data: supervisorsResp } = useSupervisorsQuery();
  const { data: entriesResp, isLoading: isEntriesLoading, isFetching: isEntriesFetching } = useRosterEntriesQuery(
    selectedUser?.id || null,
    modalState.isRosterModalOpen,
  );

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchDraft.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchDraft, setSearch]);

  useEffect(() => {
    if (!usersResp) return;
    setPagination({
      total: usersResp.pagination?.total || 0,
      totalPages: usersResp.pagination?.totalPages || 1,
    });
  }, [usersResp, setPagination]);

  useEffect(() => {
    setRosterEntries(entriesResp?.data || []);
  }, [entriesResp, setRosterEntries]);

  const users = usersResp?.data || [];
  const entries = entriesResp?.data || [];
  const totalUsers = usersResp?.pagination?.total || 0;

  const departmentOptions = useMemo(() => {
    const raw = Array.isArray(departmentsResp) ? departmentsResp : [];
    return raw
      .filter((item: any) => item?.id && item?.name)
      .map((item: any) => ({ id: item.id as string, name: item.name as string }));
  }, [departmentsResp]);

  const supervisorOptions = useMemo(() => {
    const raw = Array.isArray(supervisorsResp) ? supervisorsResp : [];
    return raw
      .filter((item: any) => item?.id && (item?.name || item?.email))
      .map((item: any) => ({ id: item.id as string, name: (item.name || item.email) as string }));
  }, [supervisorsResp]);

  const stats = useMemo(
    () => [
      { label: 'Total Users', value: totalUsers, icon: Users, color: 'emerald' },
      { label: 'Filtered Users', value: users.length, icon: CalendarDays, color: 'blue' },
      { label: 'Selected User Entries', value: entries.length, icon: CalendarClock, color: 'amber' },
    ],
    [entries.length, totalUsers, users.length],
  );

  const handleOpenRoster = useCallback(
    (user: RosterUser) => {
      setUser(user);
      openModal('isRosterModalOpen');
      closeModal('isFormModalOpen');
    },
    [closeModal, openModal, setUser],
  );

  const handleCloseRoster = useCallback(() => {
    closeModal('isFormModalOpen');
    closeModal('isRosterModalOpen');
  }, [closeModal]);

  const handleOpenCreateForm = useCallback(() => {
    setEditingEntry(null);
    openModal('isFormModalOpen');
  }, [openModal, setEditingEntry]);

  const handleEditEntry = useCallback(
    (entry: any) => {
      setEditingEntry(entry);
      openModal('isFormModalOpen');
    },
    [openModal, setEditingEntry],
  );

  const handleCloseForm = useCallback(() => {
    closeModal('isFormModalOpen');
  }, [closeModal]);

  return (
    <DashboardLayout>
        <div className="flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar relative p-4 md:p-8">
          <div className="absolute top-0 right-0 w-[850px] h-[520px] bg-gradient-to-bl from-emerald-50/80 via-transparent to-transparent pointer-events-none -z-10" />

          <div className="max-w-[1450px] mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-600 text-[10px] font-bold uppercase tracking-wider">
                    Admin
                  </span>
                </div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight">Roster Sheet</h1>
                <p className="text-sm text-gray-500 mt-1">Manage user roster and scheduling.</p>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5 flex items-center justify-between"
                >
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">{item.label}</p>
                    <h3 className="text-3xl font-black text-gray-900 mt-1">{item.value}</h3>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      item.color === 'emerald'
                        ? 'bg-emerald-50 text-emerald-600'
                        : item.color === 'blue'
                          ? 'bg-blue-50 text-blue-600'
                          : 'bg-amber-50 text-amber-600'
                    }`}
                  >
                    <item.icon className="w-6 h-6" />
                  </div>
                </motion.div>
              ))}
            </div>

            <RosterFilters
              search={searchDraft}
              showFilters={showFilters}
              departmentId={filters.departmentId}
              supervisorId={filters.supervisorId}
              status={filters.status}
              departments={departmentOptions}
              supervisors={supervisorOptions}
              onSearchChange={setSearchDraft}
              onToggleFilters={() => setShowFilters((value) => !value)}
              onDepartmentChange={(value) => setFilters({ departmentId: value })}
              onSupervisorChange={(value) => setFilters({ supervisorId: value })}
              onStatusChange={(value) => setFilters({ status: value })}
            />

            {isUsersError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                <p className="text-sm font-black text-red-700">Failed to load roster users</p>
                <p className="text-xs text-red-600 mt-1">{(usersError as Error)?.message || 'Unknown error'}</p>
                <button
                  onClick={() => refetchUsers()}
                  className="mt-3 px-3 py-2 rounded-xl bg-red-600 text-white text-xs font-black hover:bg-red-700"
                >
                  Retry
                </button>
              </div>
            ) : (
              <RosterTable
                users={users}
                isLoading={isUsersLoading || isUsersFetching}
                page={pagination.page}
                limit={pagination.limit}
                total={totalUsers}
                totalPages={usersResp?.pagination?.totalPages || 1}
                onPageChange={(value) => setPagination({ page: value })}
                onOpenRoster={handleOpenRoster}
              />
            )}
          </div>
        </div>

      <RosterModal
        isOpen={modalState.isRosterModalOpen}
        isFormOpen={modalState.isFormModalOpen}
        user={selectedUser}
        entries={entries}
        isLoading={isEntriesLoading || isEntriesFetching}
        editingEntry={editingEntry}
        departmentId={filters.departmentId}
        onClose={handleCloseRoster}
        onOpenCreate={handleOpenCreateForm}
        onCloseForm={handleCloseForm}
        onEdit={handleEditEntry}
      />
    </DashboardLayout>
  );
};

export default RosterPage;
