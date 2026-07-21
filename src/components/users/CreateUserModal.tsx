import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Target, Save, Loader2, Shield, MapPin } from 'lucide-react';
import { useForm, FormProvider, SubmitHandler } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { useUsersStore } from '../../store/useUsersStore';
import * as usersApi from '../../services/users.api';
import {
  useUserDetailQuery,
  useRolesQuery,
  useSupervisorsQuery,
  useOfficesQuery,
  useDepartmentsQuery,
} from '../../hooks/useUsersQuery';
import { useCreateInviteUserMutation, useUpdateUserMutation } from '../../hooks/useUserMutations';
import { assignUserTargetCycleAdmin } from '../../services/target.api';
import CreateUserDetailsTab from './CreateUserDetailsTab';
import CreateUserAccessTab from './CreateUserAccessTab';
import CreateUserTargetsTab from './CreateUserTargetsTab';
import CreateUserLocationTab from './CreateUserLocationTab';
import type { UserFormData } from './CreateUserModal.types';

import { toast } from 'react-hot-toast';

type CreateUserPayload = {
  name: string;
  username?: string;
  email: string;
  phone?: string;
  roleId?: string;
  departmentId?: string;
  supervisorId?: string;
  officeId?: string;
  profileImageUrl?: string;
};

const normalizeTargetCycleId = (value?: string | null): string | null =>
  value?.trim() ? value.trim() : null;

const CreateUserModal: React.FC = () => {
  const { isCreateModalOpen, selectedUserId, closeCreateModal } = useUsersStore();
  const [activeTab, setActiveTab] = useState<'details' | 'access' | 'targets' | 'location'>('details');
  const initialTargetCycleIdRef = useRef<string | null>(null);
  
  const { data: userDetail } = useUserDetailQuery(selectedUserId);
  const { data: rolesData } = useRolesQuery();
  const { data: deptsData } = useDepartmentsQuery();
  const { data: supervisorsData } = useSupervisorsQuery();
  const { data: officesData } = useOfficesQuery();

  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreviewUrl, setProfileImagePreviewUrl] = useState<string | null>(null);
  const [isProfileImageSaving, setIsProfileImageSaving] = useState(false);
  const profileImageInputRef = useRef<HTMLInputElement>(null);

  const handleProfileImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, WEBP).');
      event.target.value = '';
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    if (profileImagePreviewUrl) URL.revokeObjectURL(profileImagePreviewUrl);
    setProfileImagePreviewUrl(objectUrl);
    setProfileImageFile(file);

    if (!selectedUserId) return;

    setIsProfileImageSaving(true);
    try {
      const response = await usersApi.uploadUserProfileImage(selectedUserId, file);
      if (response?.data) {
        queryClient.invalidateQueries({ queryKey: ['users'] });
        queryClient.invalidateQueries({ queryKey: ['user', selectedUserId] });
      }
      toast.success('Profile image updated.');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Could not save profile image.');
    } finally {
      setIsProfileImageSaving(false);
      event.target.value = '';
    }
  };

  const handleRemoveProfileImage = async () => {
    setProfileImageFile(null);
    if (profileImagePreviewUrl) {
      URL.revokeObjectURL(profileImagePreviewUrl);
      setProfileImagePreviewUrl(null);
    }

    if (!selectedUserId) return;

    setIsProfileImageSaving(true);
    try {
      await usersApi.removeUserProfileImage(selectedUserId);
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', selectedUserId] });
      toast.success('Profile image removed.');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Could not remove profile image.');
    } finally {
      setIsProfileImageSaving(false);
    }
  };

  const queryClient = useQueryClient();
  const createInviteUser = useCreateInviteUserMutation();
  const updateUser = useUpdateUserMutation();
  const isMutationPending = createInviteUser.isPending || updateUser.isPending;

  const methods = useForm<UserFormData>({
    defaultValues: {
      name: '',
      username: '',
      email: '',
      phone: '',
      roleId: '',
      departmentId: '',
      supervisorId: '',
      officeId: '',
      isActive: true,
      assignedTargetCycleId: '',
      profileImageUrl: '',
    }
  });

  const { reset, handleSubmit, setFocus, formState: { isSubmitting, errors } } = methods;

  const getFieldClassName = (hasError?: boolean) =>
    `w-full px-4 py-2.5 rounded-xl outline-none transition-all text-sm ${
      hasError
        ? 'bg-rose-50 border border-rose-300 text-rose-900 placeholder:text-rose-300 focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10'
        : 'bg-gray-50 border border-gray-100 text-gray-900 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10'
    }`;

  const getSelectClassName = (hasError?: boolean) =>
    `w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all ${
      hasError
        ? 'bg-rose-50 border border-rose-300 text-rose-900 focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10'
        : 'bg-gray-50 border border-gray-100 text-gray-900 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10'
    }`;

  const renderFieldError = (message?: string) =>
    message ? <p className="text-[11px] text-rose-500 font-bold leading-relaxed">{message}</p> : null;

  const detailsTabErrorCount = ['name', 'username', 'email', 'phone'].filter(
    (key) => Boolean(errors[key as keyof typeof errors]),
  ).length;
  const accessTabErrorCount = ['roleId', 'departmentId', 'supervisorId', 'officeId'].filter(
    (key) => Boolean(errors[key as keyof typeof errors]),
  ).length;

  const toOptional = (value?: string) => {
    const next = (value || '').trim();
    return next ? next : undefined;
  };

  const toCreatePayload = (data: UserFormData): CreateUserPayload => ({
    name: data.name.trim(),
    email: data.email.trim(),
    username: toOptional(data.username),
    phone: toOptional(data.phone),
    roleId: toOptional(data.roleId),
    departmentId: toOptional(data.departmentId),
    supervisorId: toOptional(data.supervisorId),
    officeId: toOptional(data.officeId),
    profileImageUrl: toOptional(data.profileImageUrl),
  });

  const toUpdatePayload = (data: UserFormData): Record<string, unknown> => {
    const nextTargetCycleId = normalizeTargetCycleId(data.assignedTargetCycleId);
    const targetCycleChanged = nextTargetCycleId !== initialTargetCycleIdRef.current;

    return {
      name: data.name.trim(),
      username: toOptional(data.username),
      phone: toOptional(data.phone),
      roleId: toOptional(data.roleId),
      departmentId: toOptional(data.departmentId),
      supervisorId: data.supervisorId.trim() ? data.supervisorId.trim() : null,
      officeId: toOptional(data.officeId),
      isActive: data.isActive,
      profileImageUrl: toOptional(data.profileImageUrl),
      ...(targetCycleChanged ? { assignedTargetCycleId: nextTargetCycleId } : {}),
    };
  };

  const toCreatePayloadWithTargetCycle = (data: UserFormData): CreateUserPayload & {
    assignedTargetCycleId?: string | null;
  } => ({
    ...toCreatePayload(data),
    assignedTargetCycleId: normalizeTargetCycleId(data.assignedTargetCycleId),
  });

  useEffect(() => {
    if (userDetail?.user) {
      const u = userDetail.user;
      reset({
        name: u.name || '',
        username: u.username || '',
        email: u.email,
        phone: u.phone || '',
        roleId: typeof u.role === 'string' ? u.role : u.role?.id || '',
        departmentId: u.department?.id || '',
        supervisorId:
          typeof u.supervisor === 'string'
            ? u.supervisor
            : u.supervisor?.id || '',
        officeId: u.office?.id || '',
        isActive: u.isActive,
        assignedTargetCycleId: u.assignedTargetCycleId || u.assignedTargetCycle?.id || '',
        profileImageUrl: u.profileImageUrl || '',
      });
      initialTargetCycleIdRef.current = normalizeTargetCycleId(
        u.assignedTargetCycleId || u.assignedTargetCycle?.id || null,
      );
    } else if (isCreateModalOpen && !selectedUserId) {
        initialTargetCycleIdRef.current = null;
        reset({
            name: '',
            username: '',
            email: '',
            phone: '',
            roleId: '',
            departmentId: '',
            supervisorId: '',
            officeId: '',
            isActive: true,
            assignedTargetCycleId: '',
            profileImageUrl: '',
        });
    }
  }, [userDetail, reset, isCreateModalOpen, selectedUserId]);

  const onSubmit: SubmitHandler<UserFormData> = async (data) => {
    if (isMutationPending) return;
    const toastId = toast.loading(selectedUserId ? 'Updating profile...' : 'Creating account...');
    try {
      if (selectedUserId) {
        await updateUser.mutateAsync({ id: selectedUserId, payload: toUpdatePayload(data) });
        initialTargetCycleIdRef.current = normalizeTargetCycleId(data.assignedTargetCycleId);
        toast.success('User updated successfully!', { id: toastId });
      } else {
        const payload = toCreatePayloadWithTargetCycle(data);

        if (!payload.roleId) {
          toast.error('Assign a role before sending an email invitation.', { id: toastId });
          return;
        }

        const inviteResponse = await createInviteUser.mutateAsync(payload);
        const newUserId = inviteResponse?.user?.id;
        const inviteTargetCycleId = normalizeTargetCycleId(data.assignedTargetCycleId);
        if (inviteTargetCycleId && newUserId) {
          try {
            await assignUserTargetCycleAdmin(newUserId, inviteTargetCycleId);
          } catch (targetError: any) {
            toast.error(
              targetError?.response?.data?.message || 'Invite sent, but target cycle assignment failed.',
              { id: toastId },
            );
            closeCreateModal();
            return;
          }
        }
        
        if (newUserId && profileImageFile) {
          try {
            await usersApi.uploadUserProfileImage(newUserId, profileImageFile);
          } catch (imageError: any) {
            toast.error(imageError?.response?.data?.message || 'Account created, but profile image upload failed.', { duration: 5000 });
          }
        }
        
        toast.dismiss(toastId);
      }
      closeCreateModal();
    } catch (error: any) {
      const details = error?.response?.data?.errors;
      const firstFieldError =
        details && typeof details === 'object'
          ? Object.values(details).flat().find(Boolean)
          : null;
      const isAuthError = error?.response?.status === 401;
      const isConflictError = error?.response?.status === 409;
      toast.error(
        (isAuthError
          ? 'Session expired. Please login again.'
          : isConflictError
            ? error?.response?.data?.message || 'Email or username already exists.'
          : (firstFieldError as string) || error?.response?.data?.message) || 'Something went wrong',
        { id: toastId },
      );
    }
  };

  const onInvalid = (formErrors: typeof errors) => {
    const firstErrorField = Object.keys(formErrors)[0] as keyof UserFormData | undefined;
    if (!firstErrorField) return;

    const detailFields: Array<keyof UserFormData> = [
      'name',
      'username',
      'email',
      'phone',
    ];
    const accessFields: Array<keyof UserFormData> = [
      'roleId',
      'departmentId',
      'supervisorId',
      'officeId',
      'isActive',
    ];

    if (detailFields.includes(firstErrorField)) {
      setActiveTab('details');
    } else if (accessFields.includes(firstErrorField)) {
      setActiveTab('access');
    } else {
      setActiveTab('targets');
    }

    const message = (formErrors[firstErrorField]?.message as string) || 'Please fill required fields.';
    setTimeout(() => setFocus(firstErrorField), 0);
    toast.error(message);
  };

  const submitForm = handleSubmit(onSubmit, onInvalid);

  const departments = Array.isArray(deptsData) ? deptsData : deptsData?.departments || [];
  const safeRoles = (rolesData?.roles || []).map((role: any) => ({
    value: role?.id || role?.name || '',
    label:
      role?.status === 'INACTIVE'
        ? `${role?.name || role?.id || 'Unknown Role'} (Inactive)`
        : role?.name || role?.id || 'Unknown Role',
  })).filter((role: { value: string }) => Boolean(role.value));
  const safeDepartments = (departments || []).map((department: any) => ({
    value: department?.id || department?.name || '',
    label: department?.name || department?.id || 'Unknown Department',
  })).filter((department: { value: string }) => Boolean(department.value));

  if (!isCreateModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4">
      <AnimatePresence>
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCreateModal}
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
        />
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-2xl bg-white rounded-[28px] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] sm:max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {selectedUserId ? 'Modify User Profile' : 'Onboard New User'}
            </h2>
            <p className="text-sm text-gray-500">Configure profile, access control, and targets</p>
          </div>
          <button onClick={closeCreateModal} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-50/50 p-1 mx-4 sm:mx-6 mt-4 rounded-2xl border border-gray-100 shrink-0 overflow-x-auto">
          {[
            { id: 'details', label: 'Details', fullLabel: 'Personal Details', icon: User },
            { id: 'access', label: 'Access', fullLabel: 'Access Control', icon: Shield },
            { id: 'targets', label: 'Targets', fullLabel: 'Target Settings', icon: Target },
            ...(selectedUserId ? [{ id: 'location', label: 'Location', fullLabel: 'Live Location', icon: MapPin }] : []),
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2 sm:py-2.5 text-[10px] sm:text-xs font-bold rounded-xl transition-all ${activeTab === tab.id ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <tab.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{tab.fullLabel}</span>
              <span className="sm:hidden">{tab.label}</span>
              {tab.id === 'details' && detailsTabErrorCount > 0 ? (
                <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] font-black text-rose-600">
                  {detailsTabErrorCount}
                </span>
              ) : null}
              {tab.id === 'access' && accessTabErrorCount > 0 ? (
                <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] font-black text-rose-600">
                  {accessTabErrorCount}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 custom-scrollbar">
          <FormProvider {...methods}>
            <form id="user-form" onSubmit={submitForm}>
              {/* Tab: Details */}
              <div style={{ display: activeTab === 'details' ? 'block' : 'none' }} className="space-y-6">
                <CreateUserDetailsTab
                  selectedUserId={selectedUserId}
                  detailsTabErrorCount={detailsTabErrorCount}
                  getFieldClassName={getFieldClassName}
                  renderFieldError={renderFieldError}
                  profileImagePreviewUrl={profileImagePreviewUrl}
                  handleProfileImageChange={handleProfileImageChange}
                  handleRemoveProfileImage={handleRemoveProfileImage}
                  isProfileImageSaving={isProfileImageSaving}
                  profileImageInputRef={profileImageInputRef}
                  profileImageFile={profileImageFile}
                />
              </div>

              {/* Tab: Access */}
              <div style={{ display: activeTab === 'access' ? 'block' : 'none' }} className="space-y-6">
                <CreateUserAccessTab
                  safeRoles={safeRoles}
                  safeDepartments={safeDepartments}
                  supervisorsData={supervisorsData}
                  officesData={officesData}
                  accessTabErrorCount={accessTabErrorCount}
                  getSelectClassName={getSelectClassName}
                  renderFieldError={renderFieldError}
                />
              </div>

              {/* Tab: Targets */}
              <div style={{ display: activeTab === 'targets' ? 'block' : 'none' }}>
                <CreateUserTargetsTab />
              </div>

              {/* Tab: Location */}
              {activeTab === 'location' && selectedUserId && (
                <div className="space-y-6">
                  <CreateUserLocationTab userId={selectedUserId} />
                </div>
              )}
            </form>
          </FormProvider>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-gray-50 bg-gray-50/50 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 z-20">
          <button 
            type="button" 
            onClick={closeCreateModal} 
            className="flex-1 sm:flex-none px-8 py-2.5 text-sm font-bold bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-xl transition-all shadow-lg shadow-purple-500/20 active:scale-95"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submitForm}
            disabled={isSubmitting || isMutationPending}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-10 py-2.5 bg-[#0085FF] hover:bg-[#0070d6] disabled:bg-blue-300 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95"
          >
            {isSubmitting || isMutationPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{selectedUserId ? 'Save Profile' : 'Create User'}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateUserModal;
