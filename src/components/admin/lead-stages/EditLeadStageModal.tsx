import React, { useCallback, useMemo } from 'react';
import LeadStageFormModal from './LeadStageFormModal';
import { CreateLeadStageInput, LeadStage } from '../../../types/leadStage.types';
import { useUpdateLeadStageMutation } from '../../../hooks/useLeadStageMutations';
import { useLeadStagesQuery } from '../../../hooks/useLeadStagesQuery';

interface EditLeadStageModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadStage: LeadStage | null;
}

const EditLeadStageModal: React.FC<EditLeadStageModalProps> = ({ isOpen, onClose, leadStage }) => {
  const updateLeadStage = useUpdateLeadStageMutation();
  const { data: leadStagesList } = useLeadStagesQuery();

  const resolvedLeadStage = useMemo(() => {
    if (!leadStage) return null;
    return leadStagesList?.data?.find((stage) => stage.id === leadStage.id) ?? leadStage;
  }, [leadStage, leadStagesList?.data]);

  const handleSubmit = useCallback(
    async (data: CreateLeadStageInput) => {
      if (!leadStage) return;
      try {
        await updateLeadStage.mutateAsync({ id: leadStage.id, data });
        onClose();
      } catch {
        // Mutation handles error toast.
      }
    },
    [leadStage, onClose, updateLeadStage],
  );

  return (
    <LeadStageFormModal
      isOpen={isOpen}
      mode="edit"
      title="Edit Lead Stage"
      submitText="Update Lead Stage"
      leadStage={resolvedLeadStage}
      isSubmitting={updateLeadStage.isPending}
      onClose={onClose}
      onSubmit={handleSubmit}
    />
  );
};

export default React.memo(EditLeadStageModal);

