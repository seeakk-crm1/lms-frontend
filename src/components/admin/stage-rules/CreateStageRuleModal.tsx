import React, { useCallback } from 'react';
import StageRuleFormModal from './StageRuleFormModal';
import { CreateStageRuleInput } from '../../../types/stageRule.types';
import { useCreateStageRuleMutation } from '../../../hooks/useStageRuleMutations';

interface CreateStageRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateStageRuleModal: React.FC<CreateStageRuleModalProps> = ({ isOpen, onClose }) => {
  const createStageRuleMutation = useCreateStageRuleMutation();

  const handleSubmit = useCallback(
    async (data: CreateStageRuleInput) => {
      try {
        await createStageRuleMutation.mutateAsync(data);
        onClose();
      } catch {
        // Mutation hook handles toast
      }
    },
    [createStageRuleMutation, onClose],
  );

  return (
    <StageRuleFormModal
      isOpen={isOpen}
      mode="create"
      title="Add Stage Rules"
      submitText="Create Stage Rule"
      isSubmitting={createStageRuleMutation.isPending}
      onClose={onClose}
      onSubmit={handleSubmit}
    />
  );
};

export default React.memo(CreateStageRuleModal);
