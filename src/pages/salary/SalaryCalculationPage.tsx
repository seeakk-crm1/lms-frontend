import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import {
  Calculator,
  Search,
  Plus,
  Send,
  Pencil,
  Trash2,
  History,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  Building2,
  Users,
  DollarSign,
  Calendar,
  AlertCircle,
  FileSpreadsheet,
  Layers,
  ChevronDown,
  Check,
  User,
  Briefcase,
  X,
} from 'lucide-react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { salaryApi } from '../../services/salary.api';
import * as usersApi from '../../services/users.api';
import { SalaryRecord, SalaryRecordStatus } from '../../types/salary.types';
import { getImageUrl } from '../../utils/getImageUrl';
import useAuthStore from '../../store/useAuthStore';
import { hasAnyPermission } from '../../utils/permissions';
import { useOfficesQuery, useDepartmentsQuery } from '../../hooks/useUsersQuery';

interface ComboboxItem {
  id: string;
  name: string;
  subtext?: string;
  code?: string;
  avatarUrl?: string | null;
  searchString?: string;
}

interface SearchableComboboxProps {
  items: ComboboxItem[];
  value: string;
  onChange: (id: string) => void;
  placeholder: string;
  searchPlaceholder: string;
  emptyText: string;
  icon?: React.ReactNode;
}

const SearchableCombobox: React.FC<SearchableComboboxProps> = ({
  items,
  value,
  onChange,
  placeholder,
  searchPlaceholder,
  emptyText,
  icon,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedItem = items.find((item) => item.id === value);

  const filteredItems = items.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const nameMatch = item.name.toLowerCase().includes(q);
    const subtextMatch = item.subtext ? item.subtext.toLowerCase().includes(q) : false;
    const codeMatch = item.code ? item.code.toLowerCase().includes(q) : false;
    const customMatch = item.searchString ? item.searchString.toLowerCase().includes(q) : false;
    return nameMatch || subtextMatch || codeMatch || customMatch;
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3.5 py-2.5 bg-gray-50 border ${
          isOpen ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-white' : 'border-gray-200'
        } rounded-xl text-left flex items-center justify-between gap-2 transition-all hover:bg-white`}
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          {selectedItem?.avatarUrl ? (
            <img
              src={getImageUrl(selectedItem.avatarUrl)}
              alt={selectedItem.name}
              className="w-6 h-6 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="text-gray-400 shrink-0">{icon || <User className="w-4 h-4" />}</div>
          )}
          <div className="truncate">
            {selectedItem ? (
              <span className="text-sm font-bold text-gray-900 block truncate">
                {selectedItem.name}
                {selectedItem.subtext && (
                  <span className="text-xs font-normal text-gray-500 ml-1.5">
                    ({selectedItem.subtext})
                  </span>
                )}
              </span>
            ) : (
              <span className="text-sm font-medium text-gray-400">{placeholder}</span>
            )}
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden max-h-64 flex flex-col"
          >
            <div className="p-2 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-400 shrink-0 ml-1" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full bg-transparent border-none text-xs font-semibold text-gray-900 focus:outline-none placeholder:text-gray-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-full"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-1 divide-y divide-gray-50">
              {filteredItems.length === 0 ? (
                <div className="py-6 text-center text-xs text-gray-400 font-medium">
                  {emptyText}
                </div>
              ) : (
                filteredItems.map((item) => {
                  const isSelected = item.id === value;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onChange(item.id);
                        setIsOpen(false);
                        setSearchQuery('');
                      }}
                      className={`w-full px-3 py-2.5 text-left rounded-xl flex items-center justify-between gap-3 transition-colors ${
                        isSelected ? 'bg-emerald-50 text-emerald-900 font-bold' : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        {item.avatarUrl ? (
                          <img
                            src={getImageUrl(item.avatarUrl)}
                            alt={item.name}
                            className="w-7 h-7 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-xs shrink-0">
                            {item.name.charAt(0)}
                          </div>
                        )}
                        <div className="truncate">
                          <p className="text-xs font-bold text-gray-900 truncate">
                            {item.name}
                            {item.code && (
                              <span className="ml-1.5 px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 text-[10px] font-mono">
                                {item.code}
                              </span>
                            )}
                          </p>
                          {item.subtext && (
                            <p className="text-[11px] text-gray-400 font-medium truncate mt-0.5">
                              {item.subtext}
                            </p>
                          )}
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;
const YEARS = [currentYear - 1, currentYear, currentYear + 1];

const SalaryCalculationPage: React.FC = () => {
  const currentUser = useAuthStore((state) => state.user);
  const canGenerate = hasAnyPermission(currentUser, ['SALARY_CALCULATION_GENERATE']);
  const canEdit = hasAnyPermission(currentUser, ['SALARY_CALCULATION_EDIT']);
  const canDelete = hasAnyPermission(currentUser, ['SALARY_CALCULATION_DELETE']);

  const { data: officesData } = useOfficesQuery();
  const { data: deptsData } = useDepartmentsQuery();
  const { data: usersData } = useQuery({
    queryKey: ['all-active-users-salary'],
    queryFn: () => usersApi.getUsers({ limit: 1000 }),
    staleTime: 60_000,
  });

  const userList = Array.isArray((usersData as any)?.users)
    ? (usersData as any).users
    : Array.isArray(usersData)
    ? usersData
    : [];
  const activeUsers = userList.filter((u: any) => u.isActive !== false && u.deletedAt == null);

  const userComboboxItems: ComboboxItem[] = activeUsers.map((u: any) => ({
    id: u.id,
    name: u.name || 'Unnamed Employee',
    code: u.employeeCode || u.username || undefined,
    subtext: [u.department?.name, u.office?.name || u.officeLocation?.name].filter(Boolean).join(' • '),
    avatarUrl: u.profileImageUrl,
    searchString: `${u.name || ''} ${u.employeeCode || ''} ${u.username || ''} ${u.email || ''}`,
  }));

  const officeList = Array.isArray((officesData as any)?.offices)
    ? (officesData as any).offices
    : Array.isArray((officesData as any)?.data)
    ? (officesData as any).data
    : Array.isArray(officesData)
    ? officesData
    : [];
  const activeOffices = officeList.filter((o: any) => o.isActive !== false);

  const officeComboboxItems: ComboboxItem[] = activeOffices.map((o: any) => ({
    id: o.id,
    name: o.name,
    subtext: o.city || o.state || o.location || undefined,
    searchString: `${o.name} ${o.city || ''} ${o.code || ''}`,
  }));

  const deptList = Array.isArray((deptsData as any)?.departments)
    ? (deptsData as any).departments
    : Array.isArray((deptsData as any)?.data)
    ? (deptsData as any).data
    : Array.isArray(deptsData)
    ? deptsData
    : [];
  const activeDepts = deptList.filter((d: any) => d.isActive !== false);

  const deptComboboxItems: ComboboxItem[] = activeDepts.map((d: any) => ({
    id: d.id,
    name: d.name,
    subtext: d.description || undefined,
    searchString: `${d.name} ${d.description || ''}`,
  }));

  const [month, setMonth] = useState<number>(currentMonth);
  const [year, setYear] = useState<number>(currentYear);
  const [departmentId, setDepartmentId] = useState<string>('');
  const [officeId, setOfficeId] = useState<string>('');
  const [status, setStatus] = useState<SalaryRecordStatus | ''>('');
  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [records, setRecords] = useState<SalaryRecord[]>([]);
  const [meta, setMeta] = useState<{ total: number; totalPages: number }>({ total: 0, totalPages: 1 });

  // Modal States
  const [showGenerateModal, setShowGenerateModal] = useState<boolean>(false);
  const [genScope, setGenScope] = useState<'SINGLE' | 'DEPARTMENT' | 'OFFICE' | 'COMPANY'>('COMPANY');
  const [genTargetId, setGenTargetId] = useState<string>('');
  const [genMonth, setGenMonth] = useState<number>(currentMonth);
  const [genYear, setGenYear] = useState<number>(currentYear);
  const [genWorkingDays, setGenWorkingDays] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Edit Calculation Modal
  const [editRecord, setEditRecord] = useState<SalaryRecord | null>(null);
  const [editBonus, setEditBonus] = useState<string>('');
  const [editDeduction, setEditDeduction] = useState<string>('');
  const [editAdvance, setEditAdvance] = useState<string>('');
  const [editRemarks, setEditRemarks] = useState<string>('');
  const [isSavingEdit, setIsSavingEdit] = useState<boolean>(false);

  // History Modal
  const [historyRecordId, setHistoryRecordId] = useState<string | null>(null);
  const [historyData, setHistoryData] = useState<any>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);

  // Selection for bulk submission
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSubmittingApproval, setIsSubmittingApproval] = useState<boolean>(false);

  const fetchCalculations = async () => {
    setIsLoading(true);
    try {
      const res = await salaryApi.getCalculations({
        month,
        year,
        departmentId: departmentId || undefined,
        officeId: officeId || undefined,
        status: status || undefined,
        search: search || undefined,
        page,
        limit: 20,
      });
      setRecords(res.data || []);
      setMeta(res.meta || { total: 0, totalPages: 1 });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to fetch salary calculations.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCalculations();
  }, [month, year, departmentId, officeId, status, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCalculations();
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (genScope === 'SINGLE' && !genTargetId) {
      toast.error('Please select an employee.');
      return;
    }
    if (genScope === 'DEPARTMENT' && !genTargetId) {
      toast.error('Please select a department.');
      return;
    }
    if (genScope === 'OFFICE' && !genTargetId) {
      toast.error('Please select an office.');
      return;
    }

    setIsGenerating(true);
    try {
      const res = await salaryApi.generateSalary({
        month: genMonth,
        year: genYear,
        scope: genScope,
        targetId: genScope !== 'COMPANY' ? genTargetId : undefined,
        userId: genScope === 'SINGLE' ? genTargetId : undefined,
        departmentId: genScope === 'DEPARTMENT' ? genTargetId : undefined,
        officeId: genScope === 'OFFICE' ? genTargetId : undefined,
        workingDays: genWorkingDays ? Number(genWorkingDays) : undefined,
      });
      toast.success(res.message || 'Salary calculations generated successfully.');
      setShowGenerateModal(false);
      fetchCalculations();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to generate salary calculations.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBulkSubmit = async () => {
    const draftIds = records.filter(r => (r.status === 'DRAFT' || r.status === 'RETURNED') && (selectedIds.length === 0 || selectedIds.includes(r.id))).map(r => r.id);
    if (draftIds.length === 0) {
      toast.error('No DRAFT or RETURNED records available to submit for approval.');
      return;
    }
    setIsSubmittingApproval(true);
    try {
      const res = await salaryApi.submitForApproval(draftIds);
      toast.success(res.message || `Submitted ${res.data?.submittedCount} records for approval.`);
      setSelectedIds([]);
      fetchCalculations();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to submit salary records.');
    } finally {
      setIsSubmittingApproval(false);
    }
  };

  const handleOpenEdit = (rec: SalaryRecord) => {
    setEditRecord(rec);
    setEditBonus(String(rec.bonus || 0));
    setEditDeduction(String(rec.deduction || 0));
    setEditAdvance(String(rec.advanceAmount || 0));
    setEditRemarks(rec.remarks || '');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRecord) return;
    setIsSavingEdit(true);
    try {
      await salaryApi.updateCalculation(editRecord.id, {
        bonus: Number(editBonus),
        deduction: Number(editDeduction),
        advanceAmount: Number(editAdvance),
        remarks: editRemarks,
      });
      toast.success('Salary calculation updated.');
      setEditRecord(null);
      fetchCalculations();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update salary calculation.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this draft salary calculation?')) return;
    try {
      await salaryApi.deleteCalculation(id);
      toast.success('Salary record deleted.');
      fetchCalculations();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete salary calculation.');
    }
  };

  const handleViewHistory = async (recId: string) => {
    setHistoryRecordId(recId);
    setIsLoadingHistory(true);
    try {
      const res = await salaryApi.getSalaryHistory(recId);
      setHistoryData(res.data);
    } catch (err: any) {
      toast.error('Failed to load salary audit history.');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Stats
  const totalNet = records.reduce((sum, r) => sum + r.finalSalary, 0);
  const totalBase = records.reduce((sum, r) => sum + r.monthlySalary, 0);
  const totalLop = records.reduce((sum, r) => sum + r.lopDays, 0);

  const getStatusBadge = (st: SalaryRecordStatus) => {
    switch (st) {
      case 'APPROVED':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold"><CheckCircle2 className="w-3.5 h-3.5" /> Finalized</span>;
      case 'PENDING_APPROVAL':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-bold"><Clock className="w-3.5 h-3.5" /> Pending Approval</span>;
      case 'REJECTED':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-bold"><XCircle className="w-3.5 h-3.5" /> Rejected</span>;
      case 'RETURNED':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 text-purple-600 text-xs font-bold"><RotateCcw className="w-3.5 h-3.5" /> Returned for Correction</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-bold"><Layers className="w-3.5 h-3.5" /> Draft</span>;
    }
  };

  return (
    <DashboardLayout>
      <div className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8 custom-scrollbar relative">
        <div className="max-w-[1400px] mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider">Payroll & HRMS</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Salary Calculation</h1>
              <p className="text-xs md:text-sm text-gray-500 font-medium">Generate, review, and adjust monthly employee salaries using attendance records.</p>
            </div>

            <div className="flex items-center gap-3">
              {canGenerate && (
                <>
                  <button
                    onClick={() => setShowGenerateModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs md:text-sm shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Generate Salary</span>
                  </button>

                  <button
                    onClick={handleBulkSubmit}
                    disabled={isSubmittingApproval}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs md:text-sm shadow-lg shadow-blue-600/20 active:scale-95 transition-all disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit for Approval</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                ₹
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Net Payable</p>
                <h3 className="text-xl font-black text-gray-900">₹{totalNet.toLocaleString('en-IN')}</h3>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Calculated Staff</p>
                <h3 className="text-xl font-black text-gray-900">{meta.total} Employees</h3>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                ₹
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Gross Base Salary</p>
                <h3 className="text-xl font-black text-gray-900">₹{totalBase.toLocaleString('en-IN')}</h3>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total LOP Days</p>
                <h3 className="text-xl font-black text-gray-900">{totalLop} Days</h3>
              </div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
            <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search employee name, email..."
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs sm:text-sm font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <button type="submit" className="px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800">
                Search
              </button>
            </form>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-700"
              >
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>

              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-700"
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>

              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-700"
              >
                <option value="">All Departments</option>
                {deptsData?.data?.map((d: any) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>

              <select
                value={officeId}
                onChange={(e) => setOfficeId(e.target.value)}
                className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-700"
              >
                <option value="">All Offices</option>
                {officesData?.data?.map((o: any) => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-700"
              >
                <option value="">All Statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="PENDING_APPROVAL">Pending Approval</option>
                <option value="APPROVED">Finalized</option>
                <option value="REJECTED">Rejected</option>
                <option value="RETURNED">Returned</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-4 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider w-10">
                      <input
                        type="checkbox"
                        checked={selectedIds.length > 0 && selectedIds.length === records.length}
                        onChange={(e) => setSelectedIds(e.target.checked ? records.map(r => r.id) : [])}
                        className="rounded border-gray-300 text-emerald-600"
                      />
                    </th>
                    <th className="px-4 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Employee</th>
                    <th className="px-4 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Month / Year</th>
                    <th className="px-4 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Monthly Base</th>
                    <th className="px-4 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Attendance</th>
                    <th className="px-4 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Bonus / Deduction</th>
                    <th className="px-4 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Final Salary</th>
                    <th className="px-4 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {isLoading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={9} className="px-6 py-4"><div className="h-8 bg-gray-100 rounded-lg"></div></td>
                      </tr>
                    ))
                  ) : records.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-16 text-center text-gray-400">
                        <Calculator className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p className="font-semibold text-sm">No salary calculations found for this selection.</p>
                        <p className="text-xs text-gray-400 mt-1">Click "Generate Salary" to calculate payroll records.</p>
                      </td>
                    </tr>
                  ) : (
                    records.map((rec) => (
                      <tr key={rec.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(rec.id)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedIds([...selectedIds, rec.id]);
                              else setSelectedIds(selectedIds.filter(id => id !== rec.id));
                            }}
                            className="rounded border-gray-300 text-emerald-600"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold shrink-0 overflow-hidden text-xs">
                              {rec.user?.profileImageUrl ? (
                                <img src={getImageUrl(rec.user.profileImageUrl)} alt={rec.user.name || ''} className="w-full h-full object-cover" />
                              ) : (
                                (rec.user?.name || 'E').charAt(0)
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900">{rec.user?.name || 'Employee'}</p>
                              <p className="text-[11px] text-gray-400 font-medium">{rec.user?.department?.name || 'General'} • {rec.user?.office?.name || 'Main'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-xs font-bold text-gray-700">
                          {MONTHS.find(m => m.value === rec.month)?.label} {rec.year}
                        </td>
                        <td className="px-4 py-4 text-sm font-bold text-gray-900">
                          ₹{rec.monthlySalary.toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-xs font-semibold text-gray-700 space-y-0.5">
                            <p><span className="text-emerald-600 font-bold">{rec.attendanceDays}</span> Present / {rec.workingDays} Days</p>
                            {rec.lopDays > 0 && <p className="text-rose-600 text-[11px] font-bold">{rec.lopDays} LOP Days</p>}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-xs font-semibold text-gray-700 space-y-0.5">
                            {rec.bonus > 0 && <p className="text-emerald-600">+₹{rec.bonus} Bonus</p>}
                            {rec.deduction > 0 && <p className="text-rose-600">-₹{rec.deduction} Deduct</p>}
                            {rec.advanceAmount > 0 && <p className="text-amber-600">-₹{rec.advanceAmount} Advance</p>}
                            {rec.bonus === 0 && rec.deduction === 0 && rec.advanceAmount === 0 && <p className="text-gray-400">None</p>}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-base font-black text-emerald-600">
                          ₹{rec.finalSalary.toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-4">
                          {getStatusBadge(rec.status)}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleViewHistory(rec.id)}
                              className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg"
                              title="Audit History"
                            >
                              <History className="w-4 h-4" />
                            </button>
                            {canEdit && (rec.status === 'DRAFT' || rec.status === 'RETURNED') && (
                              <button
                                onClick={() => handleOpenEdit(rec)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                                title="Edit Adjustments"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                            )}
                            {canDelete && rec.status !== 'APPROVED' && (
                              <button
                                onClick={() => handleDelete(rec.id)}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                                title="Delete Record"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Generate Modal */}
      <AnimatePresence>
        {showGenerateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100"
            >
              <h3 className="text-xl font-black text-gray-900 mb-1">Generate Salary Records</h3>
              <p className="text-xs text-gray-500 font-medium mb-4">Select target scope, month, and year to process attendance payroll.</p>

              <form onSubmit={handleGenerate} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Scope</label>
                  <select
                    value={genScope}
                    onChange={(e) => {
                      setGenScope(e.target.value as any);
                      setGenTargetId('');
                    }}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="COMPANY">Entire Company</option>
                    <option value="DEPARTMENT">Entire Department</option>
                    <option value="OFFICE">Entire Office</option>
                    <option value="SINGLE">Single Employee</option>
                  </select>
                </div>

                {genScope === 'DEPARTMENT' && (
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Department</label>
                    <SearchableCombobox
                      items={deptComboboxItems}
                      value={genTargetId}
                      onChange={(id) => setGenTargetId(id)}
                      placeholder="Select Department..."
                      searchPlaceholder="Search department name..."
                      emptyText="No active departments found"
                      icon={<Briefcase className="w-4 h-4 text-emerald-600" />}
                    />
                  </div>
                )}

                {genScope === 'OFFICE' && (
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Office Location</label>
                    <SearchableCombobox
                      items={officeComboboxItems}
                      value={genTargetId}
                      onChange={(id) => setGenTargetId(id)}
                      placeholder="Select Office..."
                      searchPlaceholder="Search office location..."
                      emptyText="No active offices found"
                      icon={<Building2 className="w-4 h-4 text-emerald-600" />}
                    />
                  </div>
                )}

                {genScope === 'SINGLE' && (
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Employee</label>
                    <SearchableCombobox
                      items={userComboboxItems}
                      value={genTargetId}
                      onChange={(id) => setGenTargetId(id)}
                      placeholder="Select Employee..."
                      searchPlaceholder="Search by name, employee code, email..."
                      emptyText="No active employees found"
                      icon={<User className="w-4 h-4 text-emerald-600" />}
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Month</label>
                    <select
                      value={genMonth}
                      onChange={(e) => setGenMonth(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-semibold text-gray-900"
                    >
                      {MONTHS.map(m => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Year</label>
                    <select
                      value={genYear}
                      onChange={(e) => setGenYear(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-semibold text-gray-900"
                    >
                      {YEARS.map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Working Days Override (Optional)</label>
                  <input
                    type="number"
                    value={genWorkingDays}
                    onChange={(e) => setGenWorkingDays(e.target.value)}
                    placeholder="Auto-calculated default (e.g. 26)"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-semibold text-gray-900"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowGenerateModal(false)}
                    className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isGenerating}
                    className="px-5 py-2 bg-emerald-500 text-white font-bold text-xs rounded-xl hover:bg-emerald-600 shadow-md shadow-emerald-500/20"
                  >
                    {isGenerating ? 'Generating...' : 'Calculate Salaries'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Calculation Modal */}
      <AnimatePresence>
        {editRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100"
            >
              <h3 className="text-xl font-black text-gray-900 mb-1">Adjust Salary Calculation</h3>
              <p className="text-xs text-gray-500 font-medium mb-4">Edit bonus, deduction, or advance payment for {editRecord.user?.name}.</p>

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Bonus Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editBonus}
                    onChange={(e) => setEditBonus(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-semibold text-gray-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Other Deductions (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editDeduction}
                    onChange={(e) => setEditDeduction(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-semibold text-gray-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Advance Payment Deduction (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editAdvance}
                    onChange={(e) => setEditAdvance(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-semibold text-gray-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Remarks / Notes</label>
                  <textarea
                    value={editRemarks}
                    onChange={(e) => setEditRemarks(e.target.value)}
                    placeholder="Reason for adjustment..."
                    rows={2}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-semibold text-gray-900"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setEditRecord(null)}
                    className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingEdit}
                    className="px-5 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 shadow-md shadow-blue-600/20"
                  >
                    {isSavingEdit ? 'Saving...' : 'Save Adjustments'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* History Audit Modal */}
      <AnimatePresence>
        {historyRecordId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-gray-100 max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-black text-gray-900">Audit & Approval History</h3>
                  <p className="text-xs text-gray-500 font-medium">Complete lifecycle audit trail for this salary record.</p>
                </div>
                <button
                  onClick={() => setHistoryRecordId(null)}
                  className="p-2 text-gray-400 hover:bg-gray-100 rounded-full"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1">
                {isLoadingHistory ? (
                  <p className="text-center text-sm font-semibold text-gray-400 py-8">Loading history timeline...</p>
                ) : historyData ? (
                  <>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Audit Timeline</h4>
                    <div className="space-y-3">
                      {historyData.histories?.map((h: any) => (
                        <div key={h.id} className="p-3 bg-gray-50 border border-gray-100 rounded-2xl text-xs space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-gray-900">{h.action}</span>
                            <span className="text-[10px] text-gray-400 font-medium">{new Date(h.createdAt).toLocaleString()}</span>
                          </div>
                          <p className="text-gray-600">By <span className="font-bold">{h.editedBy?.name || 'System'}</span></p>
                          {h.reason && <p className="text-gray-500 italic">"{h.reason}"</p>}
                        </div>
                      ))}
                    </div>
                  </>
                ) : null}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default SalaryCalculationPage;
