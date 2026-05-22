import React from 'react';
import { useFormContext } from 'react-hook-form';
import UserTargetCycleField from './UserTargetCycleField';
import type { UserFormData } from './CreateUserModal.types';

const CreateUserTargetsTab: React.FC = () => {
  const { watch, setValue } = useFormContext<UserFormData>();
  const assignedTargetCycleId = watch('assignedTargetCycleId') || '';

  return (
    <UserTargetCycleField
      value={assignedTargetCycleId}
      onChange={(value) => setValue('assignedTargetCycleId', value, { shouldDirty: true })}
    />
  );
};

export default CreateUserTargetsTab;
