import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Target, Save, Loader2, Shield } from 'lucide-react';
import { useForm, FormProvider, SubmitHandler } from 'react-hook-form';
import { useUsersStore } from '../../store/useUsersStore';
import {
  useUserDetailQuery,
  useRolesQuery,
  useSupervisorsQuery,
  useOfficesQuery,
  useLocationTreeQuery,
  useAllLocationsQuery,
  useDepartmentsQuery,
} from '../../hooks/useUsersQuery';
import { useCreateUserMutation, useUpdateUserMutation, useAssignTargetMutation } from '../../hooks/useUserMutations';
import { DEFAULT_PHONE_COUNTRY, PHONE_COUNTRIES, type PhoneCountry } from '../../constants/phoneCountries';
import CreateUserDetailsTab from './CreateUserDetailsTab';
import CreateUserAccessTab from './CreateUserAccessTab';
import CreateUserTargetsTab from './CreateUserTargetsTab';
import type { UserFormData } from './CreateUserModal.types';
import type { Location } from '../../types/user.types';

import { toast } from 'react-hot-toast';

const findPhoneCountryByDialCode = (value?: string): PhoneCountry => {
  const trimmed = (value || '').trim();
  const sortedCountries = [...PHONE_COUNTRIES].sort((left, right) => right.dialCode.length - left.dialCode.length);
  const match = sortedCountries.find((country) => trimmed.startsWith(country.dialCode));
  return match || DEFAULT_PHONE_COUNTRY;
};

const toPhoneDigits = (value: string): string => value.replace(/\D/g, '');

const normalizePhoneDigitsForCountry = (value: string, country: PhoneCountry): string => {
  let digits = toPhoneDigits(value);
  const dialCodeDigits = country.dialCode.replace('+', '');

  if (digits.startsWith(dialCodeDigits)) {
    digits = digits.slice(dialCodeDigits.length);
  }

  if (country.iso === 'IN' && digits.length > 10 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  return digits.slice(0, country.maxDigits);
};

const toE164PhoneNumber = (digits: string, country: PhoneCountry): string =>
  digits ? `${country.dialCode}${digits}` : '';

const formatPhoneInputValue = (value: string, country: PhoneCountry): string => {
  const digits = normalizePhoneDigitsForCountry(value, country);
  return country.format(digits);
};

const getPhoneValidationMessage = (value: string, country: PhoneCountry): string | true => {
  const trimmed = value.trim();
  if (!trimmed) return true;

  const digits = normalizePhoneDigitsForCountry(trimmed, country);
  if (!digits) return 'Enter a phone number.';
  if (digits.length < country.minDigits) {
    return `Enter a valid ${country.name} phone number.`;
  }
  if (digits.length > country.maxDigits) {
    return `Phone number is too long for ${country.name}.`;
  }

  return true;
};

const formatLocationLabel = (value?: string | null) => {
  const normalized = (value || '').trim();
  if (!normalized) return 'Location';

  return normalized
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

const getAddressPathFromLocation = (
  countryId: string,
  leafId: string,
  locationById: Map<string, Location>,
) => {
  const path: string[] = [];
  let cursorId: string | undefined = leafId;
  const visited = new Set<string>();

  while (cursorId) {
    if (visited.has(cursorId)) break;
    visited.add(cursorId);

    const location = locationById.get(cursorId);
    if (!location) break;
    if (location.id === countryId) break;

    path.push(location.id);
    cursorId = location.parentId;
  }

  return path.reverse();
};

type CreateUserPayload = {
  name: string;
  username?: string;
  email: string;
  phone?: string;
  password?: string;
  roleId?: string;
  departmentId?: string;
  supervisorId?: string;
  officeId?: string;
  countryId?: string;
  stateId?: string;
  districtId?: string;
  assignedLocationIds?: string[];
};

const CreateUserModal: React.FC = () => {
  const { isCreateModalOpen, selectedUserId, closeCreateModal } = useUsersStore();
  const [activeTab, setActiveTab] = useState<'details' | 'access' | 'targets'>('details');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedPhoneCountry, setSelectedPhoneCountry] = useState<PhoneCountry>(DEFAULT_PHONE_COUNTRY);
  
  const { data: userDetail } = useUserDetailQuery(selectedUserId);
  const { data: rolesData } = useRolesQuery();
  const { data: deptsData } = useDepartmentsQuery();
  const { data: supervisorsData } = useSupervisorsQuery();
  const { data: officesData } = useOfficesQuery();
  const { data: locationTreeData } = useLocationTreeQuery();
  const { data: allLocationsData } = useAllLocationsQuery();

  const createUser = useCreateUserMutation();
  const updateUser = useUpdateUserMutation();
  const assignTarget = useAssignTargetMutation();
  const isMutationPending = createUser.isPending || updateUser.isPending || assignTarget.isPending;

  const methods = useForm<UserFormData>({
    defaultValues: {
      name: '',
      username: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      roleId: '',
      departmentId: '',
      supervisorId: '',
      officeId: '',
      countryId: '',
      stateId: '',
      districtId: '',
      isActive: true,
      assignedLocationIds: [],
      // Target defaults
      targetTypeId: '',
      cycle: 'MONTHLY',
      monthlyTargetLeads: 0,
      dailyFollowupTarget: 0,
      revenueTarget: 0,
      startDate: new Date().toISOString().split('T')[0],
    }
  });

  const { reset, handleSubmit, watch, setFocus, setValue, clearErrors, formState: { isSubmitting, errors } } = methods;
  const countryId = watch('countryId');
  const stateId = watch('stateId');
  const districtId = watch('districtId');

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

  const detailsTabErrorCount = ['name', 'username', 'email', 'phone', 'password', 'confirmPassword', 'countryId', 'stateId', 'districtId'].filter(
    (key) => Boolean(errors[key as keyof typeof errors]),
  ).length;
  const accessTabErrorCount = ['roleId', 'departmentId', 'supervisorId', 'officeId', 'assignedLocationIds'].filter(
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
    password: toOptional(data.password),
    roleId: toOptional(data.roleId),
    departmentId: toOptional(data.departmentId),
    supervisorId: toOptional(data.supervisorId),
    officeId: toOptional(data.officeId),
    countryId: toOptional(data.countryId),
    stateId: toOptional(data.stateId),
    districtId: toOptional(data.districtId),
    assignedLocationIds: (data.assignedLocationIds || []).filter(Boolean),
  });

  useEffect(() => {
    if (userDetail?.user) {
      const u = userDetail.user;
      setSelectedPhoneCountry(findPhoneCountryByDialCode(u.phone || ''));
      reset({
        name: u.name || '',
        username: u.username || '',
        email: u.email,
        phone: u.phone || '',
        roleId: typeof u.role === 'string' ? u.role : u.role?.id || '',
        departmentId: u.department?.id || '',
        supervisorId: u.supervisor?.id || '',
        officeId: u.office?.id || '',
        countryId: u.country?.id || '',
        stateId: u.state?.id || '',
        districtId: u.district?.id || '',
        isActive: u.isActive,
        assignedLocationIds: u.assignedLocations?.map((l: any) => l.location.id) || [],
      });
    } else if (isCreateModalOpen && !selectedUserId) {
        setSelectedPhoneCountry(DEFAULT_PHONE_COUNTRY);
        reset({
            name: '',
            username: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: '',
            roleId: '',
            departmentId: '',
            supervisorId: '',
            officeId: '',
            countryId: '',
            stateId: '',
            districtId: '',
            isActive: true,
            assignedLocationIds: [],
        });
    }
  }, [userDetail, reset, isCreateModalOpen, selectedUserId]);

  useEffect(() => {
    if (!isCreateModalOpen || selectedUserId) return;
    setSelectedPhoneCountry(DEFAULT_PHONE_COUNTRY);
  }, [isCreateModalOpen, selectedUserId]);

  useEffect(() => {
    if (!countryId) {
      setValue('stateId', '');
      setValue('districtId', '');
      clearErrors(['stateId', 'districtId']);
    }
  }, [clearErrors, countryId, setValue]);

  useEffect(() => {
    if (!stateId) {
      setValue('districtId', '');
      clearErrors('districtId');
    }
  }, [clearErrors, setValue, stateId]);

  const onSubmit: SubmitHandler<UserFormData> = async (data) => {
    if (isMutationPending) return;
    const toastId = toast.loading(selectedUserId ? 'Updating profile...' : 'Creating account...');
    try {
      if (selectedUserId) {
        await updateUser.mutateAsync({ id: selectedUserId, payload: data });
        if (data.targetTypeId) {
          try {
            await assignTarget.mutateAsync({ userId: selectedUserId, payload: data });
          } catch (targetError: any) {
            toast.error(
              targetError?.response?.data?.message || 'User updated, but target assignment failed.',
              { id: toastId },
            );
            closeCreateModal();
            return;
          }
        }
        toast.success('User updated successfully!', { id: toastId });
      } else {
        const payload = toCreatePayload(data);
        const newUserResponse = await createUser.mutateAsync(payload);
        const newUserId = newUserResponse?.user?.id;
        if (data.targetTypeId && newUserId) {
          try {
            await assignTarget.mutateAsync({ userId: newUserId, payload: data });
          } catch (targetError: any) {
            toast.error(
              targetError?.response?.data?.message || 'User created, but target assignment failed.',
              { id: toastId },
            );
            closeCreateModal();
            return;
          }
        }
        toast.success('User onboarded successfully!', { id: toastId });
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
      'password',
      'confirmPassword',
      'countryId',
      'stateId',
      'districtId',
    ];
    const accessFields: Array<keyof UserFormData> = [
      'roleId',
      'departmentId',
      'supervisorId',
      'officeId',
      'isActive',
      'assignedLocationIds',
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

  const allLocations = (allLocationsData?.locations || []) as Location[];
  const locationById = useMemo(
    () => new Map(allLocations.map((location) => [location.id, location])),
    [allLocations],
  );

  const countryOptions = useMemo(
    () =>
      allLocations
        .filter((location) => location.type === 'COUNTRY')
        .map((location) => ({ id: location.id, name: location.name })),
    [allLocations],
  );

  const addressSelectionPath = useMemo(() => {
    if (!countryId) return [];

    if (districtId) {
      const derivedPath = getAddressPathFromLocation(countryId, districtId, locationById);
      if (derivedPath.length > 0) return derivedPath;
    }

    if (stateId) {
      const derivedPath = getAddressPathFromLocation(countryId, stateId, locationById);
      if (derivedPath.length > 0) return derivedPath;
      return [stateId];
    }

    return [];
  }, [countryId, districtId, locationById, stateId]);

  const addressLevels = useMemo(() => {
    if (!countryId) return [];

    const levels: Array<{
      key: string;
      label: string;
      selectedId: string;
      options: Array<{ id: string; name: string }>;
      helperText?: string;
    }> = [];

    let parentId = countryId;
    let levelIndex = 0;

    while (parentId) {
      const childOptions = allLocations.filter((location) => location.parentId === parentId);
      if (childOptions.length === 0) break;

      const selectedId = addressSelectionPath[levelIndex] || '';
      const levelLabel =
        childOptions[0]?.level?.levelName ||
        formatLocationLabel(childOptions[0]?.type) ||
        `Level ${levelIndex + 1}`;

      levels.push({
        key: `${parentId}-${levelIndex}`,
        label: levelLabel,
        selectedId,
        options: childOptions.map((location) => ({
          id: location.id,
          name: location.name,
        })),
        helperText:
          !selectedId && levelIndex > 0
            ? `Choose the previous ${levels[levelIndex - 1]?.label.toLowerCase()} first to unlock this level.`
            : undefined,
      });

      if (!selectedId) break;

      parentId = selectedId;
      levelIndex += 1;
    }

    return levels;
  }, [addressSelectionPath, allLocations, countryId]);

  const handleCountryChange = (nextCountryId: string) => {
    setValue('countryId', nextCountryId, { shouldDirty: true, shouldValidate: true });
    setValue('stateId', '', { shouldDirty: true, shouldValidate: true });
    setValue('districtId', '', { shouldDirty: true, shouldValidate: true });
    clearErrors(['countryId', 'stateId', 'districtId']);
  };

  const handleAddressLevelChange = (levelIndex: number, nextLocationId: string) => {
    const nextPath = addressSelectionPath.slice(0, levelIndex);

    if (nextLocationId) {
      nextPath.push(nextLocationId);
    }

    setValue('stateId', nextPath[0] || '', { shouldDirty: true, shouldValidate: true });
    setValue('districtId', nextPath.length >= 2 ? nextPath[nextPath.length - 1] : '', {
      shouldDirty: true,
      shouldValidate: true,
    });
    clearErrors(['stateId', 'districtId']);
  };

  const departments = Array.isArray(deptsData) ? deptsData : deptsData?.departments || [];
  const safeRoles = (rolesData?.roles || []).map((role: any) => ({
    value: role?.id || role?.name || '',
    label: role?.name || role?.id || 'Unknown Role',
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
            <p className="text-sm text-gray-500">Configure credentials, location boundaries and targets</p>
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
                  countryOptions={countryOptions}
                  countryId={countryId}
                  addressLevels={addressLevels}
                  onCountryChange={handleCountryChange}
                  onAddressLevelChange={handleAddressLevelChange}
                  selectedUserId={selectedUserId}
                  selectedPhoneCountry={selectedPhoneCountry}
                  setSelectedPhoneCountry={setSelectedPhoneCountry}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                  detailsTabErrorCount={detailsTabErrorCount}
                  getFieldClassName={getFieldClassName}
                  getSelectClassName={getSelectClassName}
                  renderFieldError={renderFieldError}
                  normalizePhoneDigitsForCountry={normalizePhoneDigitsForCountry}
                  toE164PhoneNumber={toE164PhoneNumber}
                  formatPhoneInputValue={formatPhoneInputValue}
                  getPhoneValidationMessage={getPhoneValidationMessage}
                />
              </div>

              {/* Tab: Access */}
              <div style={{ display: activeTab === 'access' ? 'block' : 'none' }} className="space-y-6">
                <CreateUserAccessTab
                  safeRoles={safeRoles}
                  safeDepartments={safeDepartments}
                  supervisorsData={supervisorsData}
                  officesData={officesData}
                  locationTreeData={locationTreeData}
                  accessTabErrorCount={accessTabErrorCount}
                  getSelectClassName={getSelectClassName}
                  renderFieldError={renderFieldError}
                />
              </div>

              {/* Tab: Targets */}
              <div style={{ display: activeTab === 'targets' ? 'block' : 'none' }}>
                <CreateUserTargetsTab />
              </div>
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
