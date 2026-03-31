import React, { useCallback } from 'react';
import StageRuleFormModal from './StageRuleFormModal';
import { CreateStageRuleInput, StageRule } from '../../../types/stageRule.types';
import { useUpdateStageRuleMutation } from '../../../hooks/useStageRuleMutations';

interface EditStageRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  stageRule: StageRule | null;
}

const EditStageRuleModal: React.FC<EditStageRuleModalProps> = ({ isOpen, onClose, stageRule }) => {
  const updateStageRuleMutation = useUpdateStageRuleMutation();

  const handleSubmit = useCallback(
    async (data: CreateStageRuleInput) => {
      if (!stageRule) return;
      try {
        await updateStageRuleMutation.mutateAsync({
          id: stageRule.id,
          data,
        });
        onClose();
      } catch {
        // Mutation hook handles toast
      }
    },
    [onClose, stageRule, updateStageRuleMutation],
  );

  return (
    <StageRuleFormModal
      isOpen={isOpen}
      mode="edit"
      title="Add Stage Rules"
      submitText="Update Stage Rule"
      stageRule={stageRule}
      isSubmitting={updateStageRuleMutation.isPending}
      onClose={onClose}
      onSubmit={handleSubmit}
    />
  );
};

export default React.memo(EditStageRuleModal);
