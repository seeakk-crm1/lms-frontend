import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Country, State, City } from 'country-state-city';
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
  Office,
  OfficeFilterStatus,
} from '../../../types/admin/office/office.types';

interface Props {
  offices: Office[];
  isLoading: boolean;
  search: string;
  status: OfficeFilterStatus;
  country?: string;
  state?: string;
  district?: string;
  city?: string;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: OfficeFilterStatus) => void;
  onCountryChange: (value?: string) => void;
  onStateChange: (value?: string) => void;
  onDistrictChange: (value?: string) => void;
  onCityChange: (value?: string) => void;
  onPageChange: (value: number) => void;
  onEdit: (office: Office) => void;
  onToggleStatus: (office: Office) => void;
  onDelete: (office: Office) => void;
  onCreate: () => void;
}

const OfficeTable: React.FC<Props> = ({
  offices,
  isLoading,
  search,
  status,
  country,
  state,
  district,
  city,
  page,
  limit,
  total,
  totalPages,
  onSearchChange,
  onStatusChange,
  onCountryChange,
  onStateChange,
  onDistrictChange,
  onCityChange,
  onPageChange,
  onEdit,
  onToggleStatus,
  onDelete,
  onCreate,
}) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const countries = useMemo(() => Country.getAllCountries(), []);
  const states = useMemo(() => country ? State.getStatesOfCountry(country) : [], [country]);
  const cities = useMemo(() => country && state ? City.getCitiesOfState(country, state) : [], [country, state]);

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden flex flex-col h-full">
      {/* Filters Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col gap-4 bg-gray-50/50">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search office name or address..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={status}
              onChange={(event) => onStatusChange(event.target.value as OfficeFilterStatus)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Inactive Only</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={country || ''}
            onChange={(e) => onCountryChange(e.target.value || undefined)}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white"
          >
            <option value="">All Countries</option>
            {countries.map((c) => (
              <option key={c.isoCode} value={c.isoCode}>{c.name}</option>
            ))}
          </select>

          <select
            value={state || ''}
            onChange={(e) => onStateChange(e.target.value || undefined)}
            disabled={!country}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white disabled:opacity-50"
          >
            <option value="">All States</option>
            {states.map((s) => (
              <option key={s.isoCode} value={s.isoCode}>{s.name}</option>
            ))}
          </select>

          <select
            value={city || ''}
            onChange={(e) => onCityChange(e.target.value || undefined)}
            disabled={!state}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white disabled:opacity-50"
          >
            <option value="">All Cities</option>
            {cities.map((c) => (
              <option key={c.name} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-auto custom-scrollbar relative min-h-[400px]">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10">
            <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          </div>
        ) : null}

        <table className="w-full min-w-[800px]">
          <thead className="bg-gray-50/80 sticky top-0 z-20 backdrop-blur-md">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-left w-[40%]">
                Office Info
              </th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-left">
                Location
              </th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">
                Status
              </th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {offices.map((office) => (
              <motion.tr
                key={office.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="hover:bg-gray-50/50 transition-colors group"
              >
                <td className="px-6 py-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{office.name}</p>
                      {office.address && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {office.address}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                          Created {format(new Date(office.createdAt), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    {office.country && (
                      <span className="text-sm text-gray-700 font-semibold">
                        {Country.getCountryByCode(office.country)?.name || office.country}
                      </span>
                    )}
                    {office.state && (
                      <span className="text-xs text-gray-500">
                        {State.getStateByCodeAndCountry(office.state, office.country || '')?.name || office.state}
                      </span>
                    )}
                    {office.city && (
                      <span className="text-xs text-gray-400">
                        {office.city}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                      office.isActive
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {office.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="relative inline-block text-left">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === office.id ? null : office.id)}
                      className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {openMenuId === office.id && (
                      <>
                        <div
                          className="fixed inset-0 z-30"
                          onClick={() => setOpenMenuId(null)}
                        />
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-40 transform origin-top-right">
                          <button
                            onClick={() => {
                              onEdit(office);
                              setOpenMenuId(null);
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 font-semibold"
                          >
                            <Edit3 className="w-4 h-4" />
                            Edit Details
                          </button>
                          <button
                            onClick={() => {
                              onToggleStatus(office);
                              setOpenMenuId(null);
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 font-semibold"
                          >
                            {office.isActive ? (
                              <>
                                <ToggleRight className="w-4 h-4 text-amber-500" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <ToggleLeft className="w-4 h-4 text-emerald-500" />
                                Activate
                              </>
                            )}
                          </button>
                          <div className="h-px bg-gray-100 my-1" />
                          <button
                            onClick={() => {
                              onDelete(office);
                              setOpenMenuId(null);
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-semibold"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete Office
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}

            {offices.length === 0 && !isLoading && (
              <tr>
                <td colSpan={4} className="px-6 py-20 text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building2 className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="text-gray-900 font-bold mb-1">No Offices Found</h3>
                  <p className="text-gray-500 text-sm mb-6">
                    {search || country || state
                      ? 'No offices match your search criteria'
                      : 'Get started by adding your first office location'}
                  </p>
                  <button
                    onClick={onCreate}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 transition-all shadow-sm"
                  >
                    + Add Office Location
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 0 && (
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500 font-medium">
            Showing <span className="font-bold text-gray-900">{(page - 1) * limit + 1}</span> to{' '}
            <span className="font-bold text-gray-900">{Math.min(page * limit, total)}</span> of{' '}
            <span className="font-bold text-gray-900">{total}</span> offices
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="p-2 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .map((p, i, arr) => (
                  <React.Fragment key={p}>
                    {i > 0 && arr[i - 1] !== p - 1 && (
                      <span className="px-2 text-gray-400">...</span>
                    )}
                    <button
                      onClick={() => onPageChange(p)}
                      className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${
                        page === p
                          ? 'bg-emerald-500 text-white'
                          : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                ))}
            </div>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(OfficeTable);
