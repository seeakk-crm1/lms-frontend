import React, { useState } from 'react';
import { CheckCircle2, Clock3 } from 'lucide-react';
import DashboardSidebar from '../../components/dashboard/DashboardSidebar';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import FollowUpList from '../../components/calendar/FollowUpList';
import CompleteFollowUpModal from '../../components/calendar/CompleteFollowUpModal';
import { useCompleteFollowUpMutation, useTodayFollowUpsQuery } from '../../hooks/useFollowUps';
import useFollowupStore from '../../store/followupStore';

const TodayFollowUps: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [, setMobileMenuOpen] = useState(false);
  const { modalOpen, selectedFollowUp, openModal, closeModal } = useFollowupStore();
  const todayQuery = useTodayFollowUpsQuery();
  const completeMutation = useCompleteFollowUpMutation();

  const items = todayQuery.data?.data.items || [];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50 font-sans text-gray-900">
      <DashboardSidebar isCollapsed={isSidebarCollapsed} toggleCollapsed={() => setIsSidebarCollapsed((value) => !value)} />

      <main className="relative flex h-full flex-1 flex-col overflow-hidden">
        <DashboardHeader setMobileMenuOpen={setMobileMenuOpen} />

        <div className="custom-scrollbar relative flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8">
          <div className="mx-auto max-w-[1420px] space-y-6">
            <div className="grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
              <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-emerald-600">
                  <Clock3 className="h-3.5 w-3.5" />
                  Today&apos;s Follow-up
                </div>
                <h1 className="mt-3 text-2xl font-black text-gray-900 md:text-3xl">
                  Today&apos;s Follow-up ({items.length} Pending)
                </h1>
                <p className="mt-2 text-sm text-gray-500">Focus on due interactions and complete them with audit-safe notes.</p>
              </div>

              <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-widest text-gray-400">Pending Queue</p>
                    <h2 className="text-3xl font-black text-gray-900">{items.length}</h2>
                  </div>
                </div>
                <p className="mt-3 text-sm text-gray-500">Complete follow-ups here and they disappear from the pending list instantly.</p>
              </div>
            </div>

            <FollowUpList
              items={items}
              isLoading={todayQuery.isLoading || todayQuery.isFetching}
              emptyTitle="No pending follow-ups for today"
              emptyDescription="You’re clear for now. New due tasks will appear here automatically."
              onComplete={openModal}
            />
          </div>
        </div>
      </main>

      <CompleteFollowUpModal
        isOpen={modalOpen}
        followUp={selectedFollowUp}
        isSubmitting={completeMutation.isPending}
        onClose={closeModal}
        onSubmit={async (payload) => {
          if (!selectedFollowUp) return;
          await completeMutation.mutateAsync({ id: selectedFollowUp.id, payload });
        }}
      />
    </div>
  );
};

export default TodayFollowUps;
