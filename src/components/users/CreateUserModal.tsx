import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Target, Save, Loader2, Shield, MapPin, Eye, EyeOff } from 'lucide-react';
import { useForm, FormProvider, Controller, SubmitHandler } from 'react-hook-form';
import { useUsersStore } from '../../store/useUsersStore';
import { useUserDetailQuery, useRolesQuery, useDepartmentsQuery, useSupervisorsQuery, useOfficesQuery, useLocationTreeQuery, useAllLocationsQuery } from '../../hooks/useUsersQuery';
import { useCreateUserMutation, useUpdateUserMutation, useAssignTargetMutation } from '../../hooks/useUserMutations';
import TargetSettings from './TargetSettings';
import LocationSelector from './LocationSelector';

import { toast } from 'react-hot-toast';

interface UserFormData {
  name: string;
  username: string;
  email: string;
  phone: string;
  password?: string;
  confirmPassword?: string;
  roleId: string;
  departmentId: string;
  supervisorId: string;
  officeId: string;
  countryId: string;
  stateId: string;
  districtId: string;
  isActive: boolean;
  assignedLocationIds: string[];
  // Target fields
  targetTypeId?: string;
  cycle?: 'MONTHLY' | 'WEEKLY' | 'QUARTERLY';
  monthlyTargetLeads?: number;
  dailyFollowupTarget?: number;
  revenueTarget?: number;
  startDate?: string;
}

const CreateUserModal: React.FC = () => {
  const { isCreateModalOpen, selectedUserId, closeCreateModal } = useUsersStore();
  const [activeTab, setActiveTab] = useState<'details' | 'access' | 'targets'>('details');
  const [showPassword, setShowPassword] = useState(false);
  
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

  const { reset, handleSubmit, control, watch, formState: { isSubmitting, errors } } = methods;
  const password = watch('password');

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
        supervisorId: u.supervisor?.id || '',
        officeId: u.office?.id || '',
        countryId: u.country?.id || '',
        stateId: u.state?.id || '',
        districtId: u.district?.id || '',
        isActive: u.isActive,
        assignedLocationIds: u.assignedLocations?.map((l: any) => l.location.id) || [],
      });
    } else if (isCreateModalOpen && !selectedUserId) {
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

  const onSubmit: SubmitHandler<UserFormData> = async (data) => {
    const toastId = toast.loading(selectedUserId ? 'Updating profile...' : 'Creating account...');
    try {
      if (selectedUserId) {
        await updateUser.mutateAsync({ id: selectedUserId, payload: data });
        if (data.targetTypeId) {
          await assignTarget.mutateAsync({ userId: selectedUserId, payload: data });
        }
        toast.success('User updated successfully!', { id: toastId });
      } else {
        const newUserResponse = await createUser.mutateAsync(data);
        const newUserId = newUserResponse?.user?.id;
        if (data.targetTypeId && newUserId) {
          await assignTarget.mutateAsync({ userId: newUserId, payload: data });
        }
        toast.success('User onboarded successfully!', { id: toastId });
      }
      closeCreateModal();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Something went wrong', { id: toastId });
    }
  };

  const countries = allLocationsData?.locations?.filter((l: any) => l.type === 'COUNTRY') || [];
  const states = allLocationsData?.locations?.filter((l: any) => l.type === 'STATE') || [];
  const districts = allLocationsData?.locations?.filter((l: any) => l.type === 'DISTRICT') || [];

  if (!isCreateModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
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
        <div className="flex bg-gray-50/50 p-1 mx-4 sm:mx-6 mt-4 rounded-2xl border border-gray-100 shrink-0">
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
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 custom-scrollbar">
          <FormProvider {...methods}>
            <form id="user-form" onSubmit={handleSubmit(onSubmit)}>
              {/* Tab: Details */}
              <div style={{ display: activeTab === 'details' ? 'block' : 'none' }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Full Name</label>
                    <input {...methods.register('name', { required: 'Full name is required' })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition-all text-sm" placeholder="John Doe" />
                    {errors.name && <p className="text-[10px] text-red-500 font-bold">{errors.name.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Username</label>
                    <input {...methods.register('username')} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition-all text-sm" placeholder="johndoe123" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
                    <input {...methods.register('email', { required: 'Email is required' })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition-all text-sm" placeholder="john@company.com" />
                    {errors.email && <p className="text-[10px] text-red-500 font-bold">{errors.email.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phone</label>
                    <input {...methods.register('phone')} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition-all text-sm" placeholder="+1 (555) 000-0000" />
                  </div>
                </div>

                {!selectedUserId && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5 relative">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
                      <input 
                        type={showPassword ? 'text' : 'password'}
                        {...methods.register('password', { required: !selectedUserId ? 'Password is required' : false })} 
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition-all text-sm" 
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-gray-400">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      {errors.password && <p className="text-[10px] text-red-500 font-bold">{errors.password.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Confirm Password</label>
                      <input 
                        type={showPassword ? 'text' : 'password'}
                        {...methods.register('confirmPassword', { 
                          validate: (val) => val === password || 'Passwords do not match'
                        })} 
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition-all text-sm" 
                      />
                      {errors.confirmPassword && <p className="text-[10px] text-red-500 font-bold">{errors.confirmPassword.message}</p>}
                    </div>
                  </div>
                )}

                <div className="h-px bg-gray-100 my-2" />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Permanent Address</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Country</label>
                    <select {...methods.register('countryId')} className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-xs">
                        <option value="">Select Country</option>
                        {countries.map((l: any) => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">State</label>
                    <select {...methods.register('stateId')} className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-xs">
                        <option value="">Select State</option>
                        {states.map((l: any) => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">District</label>
                    <select {...methods.register('districtId')} className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-xs">
                        <option value="">Select District</option>
                        {districts.map((l: any) => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Tab: Access */}
              <div style={{ display: activeTab === 'access' ? 'block' : 'none' }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Role</label>
                    <select {...methods.register('roleId')} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm">
                      <option value="">Select Role</option>
                      {rolesData?.roles?.map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Department</label>
                    <select {...methods.register('departmentId')} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm">
                      <option value="">Select Department</option>
                      {deptsData?.departments?.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Supervisor</label>
                    <select {...methods.register('supervisorId')} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm">
                      <option value="">Select Supervisor</option>
                      {supervisorsData?.supervisors?.map((s: any) => <option key={s.id} value={s.id}>{s.name} ({s.email})</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Reporting Office</label>
                    <select {...methods.register('officeId')} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm">
                      <option value="">Select Office</option>
                      {officesData?.offices?.map((o: any) => <option key={o.id} value={o.id}>{o.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <Controller
                        name="isActive"
                        control={control}
                        render={({ field }) => (
                            <button 
                                type="button"
                                onClick={() => field.onChange(!field.value)}
                                className={`w-12 h-6 rounded-full transition-colors relative ${field.value ? 'bg-emerald-500' : 'bg-gray-300'}`}
                            >
                                <motion.div animate={{ x: field.value ? 24 : 4 }} className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                            </button>
                        )}
                    />
                    <div>
                        <p className="text-sm font-bold text-gray-700">Account Active</p>
                        <p className="text-[10px] text-gray-500">Enable or disable user access immediately</p>
                    </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Assigned Visibility Boundary
                  </label>
                  <Controller
                    name="assignedLocationIds"
                    control={control}
                    render={({ field }) => (
                      <LocationSelector 
                        locations={locationTreeData?.tree || []} 
                        selectedIds={field.value} 
                        onSelect={field.onChange} 
                      />
                    )}
                  />
                </div>
              </div>

              {/* Tab: Targets */}
              <div style={{ display: activeTab === 'targets' ? 'block' : 'none' }}>
                <TargetSettings />
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
            form="user-form"
            type="submit"
            disabled={isSubmitting}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-10 py-2.5 bg-[#0085FF] hover:bg-[#0070d6] disabled:bg-blue-300 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{selectedUserId ? 'Save Profile' : 'Create User'}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateUserModal;
