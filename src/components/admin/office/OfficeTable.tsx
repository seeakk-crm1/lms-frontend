import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Edit3,
  MoreVertical,
  Search,
  ToggleLeft,
  ToggleRight,
  Trash2,
} from 'lucide-react';
import type {
  LocationOption,
  Office,
  OfficeFilterStatus,
} from '../../../types/admin/office/office.types';

const toTitle = (value: string) =>
  value
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

interface Props {
  offices: Office[];
  locations: LocationOption[];
  isLoading: boolean;
  search: string;
  status: OfficeFilterStatus;
  countryId?: string;
  stateId?: string;
  districtId?: string;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: OfficeFilterStatus) => void;
  onCountryChange: (value?: string) => void;
  onStateChange: (value?: string) => void;
  onDistrictChange: (value?: string) => void;
  onPageChange: (value: number) => void;
  onEdit: (office: Office) => void;
  onToggleStatus: (office: Office) => void;
  onDelete: (office: Office) => void;
  onCreate: () => void;
}

const OfficeTable: React.FC<Props> = ({
  offices,
  locations,
  isLoading,
  search,
  status,
  countryId,
  stateId,
  districtId,
  page,
  limit,
  total,
  totalPages,
  onSearchChange,
  onStatusChange,
  onCountryChange,
  onStateChange,
  onDistrictChange,
  onPageChange,
  onEdit,
  onToggleStatus,
  onDelete,
  onCreate,
}) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const locationMap = useMemo(() => {
    const map = new Map<string, string>();
    locations.forEach((item) => map.set(item.id, item.name));
    return map;
  }, [locations]);

  const countries = useMemo(
    () => locations.filter((item) => item.type === 'COUNTRY'),
    [locations],
  );
  const states = useMemo(
    () => locations.filter((item) => item.type === 'STATE' && item.parentId === countryId),
    [locations, countryId],
  );
  const districts = useMemo(
    () => locations.filter((item) => item.type === 'DISTRICT' && item.parentId === stateId),
    [locations, stateId],
  );
  const stateLabel = useMemo(
    () => states[0]?.level?.levelName || toTitle(states[0]?.type || 'State'),
    [states],
  );
  const districtLabel = useMemo(
    () => districts[0]?.level?.levelName || toTitle(districts[0]?.type || 'District'),
    [districts],
  );

  const safeFrom = total === 0 ? 0 : (page - 1) * limit + 1;
  const safeTo = Math.min(page * limit, total);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
      <div className="p-3 sm:p-4 border-b border-gray-50 space-y-3">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search office by name..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2">
          <select
            value={status}
            onChange={(event) => onStatusChange(event.target.value as OfficeFilterStatus)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 outline-none text-sm font-semibold"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>

          <select
            value={countryId || ''}
            onChange={(event) => {
              const value = event.target.value || undefined;
              onCountryChange(value);
              onStateChange(undefined);
              onDistrictChange(undefined);
            }}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 outline-none text-sm font-semibold"
          >
            <option value="">All Countries</option>
            {countries.map((country) => (
              <option key={country.id} value={country.id}>
                {country.name}
              </option>
            ))}
          </select>

          <select
            value={stateId || ''}
            onChange={(event) => {
              const value = event.target.value || undefined;
              onStateChange(value);
              onDistrictChange(undefined);
            }}
            disabled={!countryId}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 outline-none text-sm font-semibold disabled:opacity-60"
          >
            <option value="">{`All ${stateLabel}`}</option>
            {states.map((state) => (
              <option key={state.id} value={state.id}>
                {state.name}
              </option>
            ))}
          </select>

          <select
            value={districtId || ''}
            onChange={(event) => onDistrictChange(event.target.value || undefined)}
            disabled={!stateId}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 outline-none text-sm font-semibold disabled:opacity-60"
          >
            <option value="">{`All ${districtLabel}`}</option>
            {districts.map((district) => (
              <option key={district.id} value={district.id}>
                {district.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1120px]">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Office Name</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Address</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Country</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">{stateLabel}</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">{districtLabel}</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Created Date</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="animate-pulse">
                  {Array.from({ length: 8 }).map((__, col) => (
                    <td key={`col-${i}-${col}`} className="px-6 py-4">
                      <div className="h-4 w-24 bg-gray-100 rounded-lg" />
                    </td>
                  ))}
                </tr>
              ))
            ) : offices.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                      <Building2 className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-medium text-sm">No office locations found</p>
                    <button
                      onClick={onCreate}
                      className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-black hover:bg-emerald-600"
                    >
                      + Add Office Location
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              offices.map((office) => (
                <motion.tr
                  key={office.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-black text-gray-900 break-words">{office.name}</td>
                  <td className="px-6 py-4 text-xs font-semibold text-gray-600 break-words">{office.address || '-'}</td>
                  <td className="px-6 py-4 text-xs font-semibold text-gray-600">{locationMap.get(office.countryId || '') || '-'}</td>
                  <td className="px-6 py-4 text-xs font-semibold text-gray-600">{locationMap.get(office.stateId || '') || '-'}</td>
                  <td className="px-6 py-4 text-xs font-semibold text-gray-600">{locationMap.get(office.districtId || '') || '-'}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        office.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {office.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[10px] text-gray-500 font-bold">
                    {format(new Date(office.createdAt), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4 text-right relative">
                    <button
                      onClick={() => setOpenMenuId((prev) => (prev === office.id ? null : office.id))}
                      className="p-2 text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {openMenuId === office.id ? (
                      <div className="absolute right-6 mt-2 w-44 rounded-xl border border-gray-100 bg-white shadow-xl z-10 overflow-hidden">
                        <button
                          onClick={() => {
                            setOpenMenuId(null);
                            onEdit(office);
                          }}
                          className="w-full px-3 py-2.5 text-left text-xs font-bold text-gray-700 hover:bg-gray-50 inline-flex items-center gap-2"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setOpenMenuId(null);
                            onToggleStatus(office);
                          }}
                          className="w-full px-3 py-2.5 text-left text-xs font-bold text-gray-700 hover:bg-gray-50 inline-flex items-center gap-2"
                        >
                          {office.isActive ? <ToggleLeft className="w-3.5 h-3.5" /> : <ToggleRight className="w-3.5 h-3.5" />}
                          {office.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => {
                            setOpenMenuId(null);
                            onDelete(office);
                          }}
                          className="w-full px-3 py-2.5 text-left text-xs font-bold text-red-600 hover:bg-red-50 inline-flex items-center gap-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    ) : null}
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="md:hidden divide-y divide-gray-50">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={`mobile-skeleton-${i}`} className="p-4 animate-pulse space-y-3">
              <div className="h-4 w-1/2 bg-gray-100 rounded-lg" />
              <div className="h-3 w-1/3 bg-gray-100 rounded-lg" />
              <div className="h-9 w-full bg-gray-100 rounded-lg" />
            </div>
          ))
        ) : offices.length === 0 ? (
          <div className="py-14 text-center px-6">
            <Building2 className="w-8 h-8 mx-auto text-gray-300" />
            <p className="text-sm font-black text-gray-700 mt-2">No office locations found</p>
            <button
              onClick={onCreate}
              className="mt-3 px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-black hover:bg-emerald-600"
            >
              + Add Office Location
            </button>
          </div>
        ) : (
          offices.map((office) => (
            <div key={office.id} className="p-4 space-y-3 hover:bg-gray-50/60 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-black text-gray-900 break-words">{office.name}</p>
                  <p className="text-xs font-semibold text-gray-500 mt-0.5 break-words">{office.address || '-'}</p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${
                    office.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {office.isActive ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>

              <div className="text-[11px] font-semibold text-gray-500 space-y-1">
                <p>Country: {locationMap.get(office.countryId || '') || '-'}</p>
                <p>{stateLabel}: {locationMap.get(office.stateId || '') || '-'}</p>
                <p>{districtLabel}: {locationMap.get(office.districtId || '') || '-'}</p>
                <p>Created: {format(new Date(office.createdAt), 'MMM dd, yyyy')}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onEdit(office)}
                  className="py-2 rounded-xl bg-blue-50 text-blue-600 text-xs font-black hover:bg-blue-100"
                >
                  Edit
                </button>
                <button
                  onClick={() => onToggleStatus(office)}
                  className="py-2 rounded-xl bg-gray-100 text-gray-700 text-xs font-black hover:bg-gray-200"
                >
                  {office.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => onDelete(office)}
                  className="col-span-2 py-2 rounded-xl bg-red-50 text-red-600 text-xs font-black hover:bg-red-100"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-3 sm:p-4 bg-gray-50/30 border-t border-gray-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mt-auto">
        <span className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-widest">
          Showing <span className="text-gray-900 font-black">{safeFrom}-{safeTo}</span> of{' '}
          <span className="text-gray-900 font-black">{total}</span> offices
        </span>
        <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2">
          <button
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
            className="p-2.5 bg-white border border-gray-100 rounded-xl disabled:opacity-30 text-gray-500 shadow-sm transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-black text-gray-600 px-2">
            {page} / {Math.max(1, totalPages)}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="p-2.5 bg-white border border-gray-100 rounded-xl disabled:opacity-30 text-gray-500 shadow-sm transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(OfficeTable);
