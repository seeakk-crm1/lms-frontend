import React, { useCallback } from 'react';
import LeadStageFormModal from './LeadStageFormModal';
import { CreateLeadStageInput } from '../../../types/leadStage.types';
import { useCreateLeadStageMutation } from '../../../hooks/useLeadStageMutations';

interface CreateLeadStageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateLeadStageModal: React.FC<CreateLeadStageModalProps> = ({ isOpen, onClose }) => {
  const createLeadStage = useCreateLeadStageMutation();

  const handleSubmit = useCallback(
    async (data: CreateLeadStageInput) => {
      try {
        await createLeadStage.mutateAsync(data);
        onClose();
      } catch {
        // Mutation handles error toast.
      }
    },
    [createLeadStage, onClose],
  );

  return (
    <LeadStageFormModal
      isOpen={isOpen}
      mode="create"
      title="Add Lead Stage"
      submitText="Create Lead Stage"
      isSubmitting={createLeadStage.isPending}
      onClose={onClose}
      onSubmit={handleSubmit}
    />
  );
};

export default React.memo(CreateLeadStageModal);

