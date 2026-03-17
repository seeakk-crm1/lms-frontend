import React, { useCallback } from 'react';
import LeadSourceFormModal from './LeadSourceFormModal';
import { CreateLeadSourceInput, LeadSource } from '../../../types/leadSource.types';
import { useUpdateLeadSourceMutation } from '../../../hooks/useLeadSourceMutations';

interface EditLeadSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadSource: LeadSource | null;
}

const EditLeadSourceModal: React.FC<EditLeadSourceModalProps> = ({ isOpen, onClose, leadSource }) => {
  const updateLeadSource = useUpdateLeadSourceMutation();

  const handleSubmit = useCallback(
    async (data: CreateLeadSourceInput) => {
      if (!leadSource) return;
      try {
        await updateLeadSource.mutateAsync({ id: leadSource.id, data });
        onClose();
      } catch {
        // Mutation hook already shows toast; prevent uncaught promise in console.
      }
    },
    [leadSource, onClose, updateLeadSource],
  );

  return (
    <LeadSourceFormModal
      isOpen={isOpen}
      mode="edit"
      title="Edit Lead Source"
      submitText="Update Lead Source"
      leadSource={leadSource}
      isSubmitting={updateLeadSource.isPending}
      onClose={onClose}
      onSubmit={handleSubmit}
    />
  );
};

export default React.memo(EditLeadSourceModal);
