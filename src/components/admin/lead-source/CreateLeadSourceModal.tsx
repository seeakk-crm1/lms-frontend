import React, { useCallback } from 'react';
import LeadSourceFormModal from './LeadSourceFormModal';
import { CreateLeadSourceInput } from '../../../types/leadSource.types';
import { useCreateLeadSourceMutation } from '../../../hooks/useLeadSourceMutations';

interface CreateLeadSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateLeadSourceModal: React.FC<CreateLeadSourceModalProps> = ({ isOpen, onClose }) => {
  const createLeadSource = useCreateLeadSourceMutation();

  const handleSubmit = useCallback(
    async (data: CreateLeadSourceInput) => {
      try {
        await createLeadSource.mutateAsync(data);
        onClose();
      } catch {
        // Mutation hook already shows toast; prevent uncaught promise in console.
      }
    },
    [createLeadSource, onClose],
  );

  return (
    <LeadSourceFormModal
      isOpen={isOpen}
      mode="create"
      title="Create Lead Source"
      submitText="Create Lead Source"
      isSubmitting={createLeadSource.isPending}
      onClose={onClose}
      onSubmit={handleSubmit}
    />
  );
};

export default React.memo(CreateLeadSourceModal);
