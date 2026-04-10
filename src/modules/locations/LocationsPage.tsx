import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronRight, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import DashboardSidebar from '../../components/dashboard/DashboardSidebar';
import useAuthStore from '../../store/useAuthStore';
import type { Country, LocationLevel, LocationRecord } from '../../services/locations.api';
import {
  useConfigureLevelsMutation,
  useCountriesQuery,
  useCountryLevelsQuery,
  useCreateCountryMutation,
  useCreateLocationMutation,
  useDeleteCountryMutation,
  useDeleteLocationMutation,
  useUpdateCountryMutation,
  useUpdateLocationMutation,
} from './hooks/useLocations';
import LevelColumns from './components/LevelColumns';

const AddCountryModal = lazy(() => import('./components/AddCountryModal'));
const AddLevelModal = lazy(() => import('./components/AddLevelModal'));
const AddLocationModal = lazy(() => import('./components/AddLocationModal'));
const DeleteLocationModal = lazy(() => import('./components/DeleteLocationModal'));

const roleKey = (role: unknown) =>
  String(typeof role === 'object' && role !== null ? (role as { name?: string }).name || '' : role || '')
    .toLowerCase()
    .trim()
    .replace(/[\s_-]+/g, '');

const LocationsPage: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [, setMobileMenuOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [plannedLevelCount, setPlannedLevelCount] = useState('0');
  const [selectedCountryId, setSelectedCountryId] = useState('');
  const [selectedNodes, setSelectedNodes] = useState<Record<number, string>>({});
  const [selectedNodeMeta, setSelectedNodeMeta] = useState<Record<number, { id: string; name: string }>>({});
  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);
  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);
  const [locationModalState, setLocationModalState] = useState<{ open: boolean; level: LocationLevel | null; levelIndex: number | null }>({
    open: false,
    level: null,
    levelIndex: null,
  });
  const [editingLocation, setEditingLocation] = useState<{ id: string; name: string; isActive: boolean } | null>(null);
  const [deleteState, setDeleteState] = useState<
    | { type: 'country'; id: string; name: string }
    | { type: 'location'; id: string; name: string }
    | null
  >(null);

  const { user } = useAuthStore();
  const countriesQuery = useCountriesQuery({
    page: 1,
    limit: 100,
    search: countrySearch.trim() || undefined,
  });
  const levelsQuery = useCountryLevelsQuery(selectedCountryId || undefined);
  const createCountryMutation = useCreateCountryMutation();
  const updateCountryMutation = useUpdateCountryMutation();
  const deleteCountryMutation = useDeleteCountryMutation();
  const configureLevelsMutation = useConfigureLevelsMutation();
  const createLocationMutation = useCreateLocationMutation();
  const updateLocationMutation = useUpdateLocationMutation();
  const deleteLocationMutation = useDeleteLocationMutation();

  const canManage = ['admin', 'superadmin'].includes(roleKey(user?.role));

  const countries = countriesQuery.data?.data || [];
  const selectedCountry = useMemo(
    () => countries.find((country) => country.id === selectedCountryId) || null,
    [countries, selectedCountryId],
  );

  const levels = useMemo(
    () =>
      (levelsQuery.data?.data || [])
        .filter((level) => level.isActive)
        .sort((a, b) => a.levelOrder - b.levelOrder),
    [levelsQuery.data],
  );

  useEffect(() => {
    if (!selectedCountryId && countries.length) {
      setSelectedCountryId(countries[0].id);
    }
  }, [countries, selectedCountryId]);

  useEffect(() => {
    setSelectedNodes({});
    setSelectedNodeMeta({});
  }, [selectedCountryId]);

  useEffect(() => {
    setPlannedLevelCount(String(levels.length || 0));
  }, [levels.length, selectedCountryId]);

  const levelCount = levels.length;
  const totalVisibleLocations = Object.keys(selectedNodes).length;
  const selectedPath = useMemo(
    () =>
      levels
        .map((level, index) => {
          const node = selectedNodeMeta[index];
          if (!node) return null;
          return { label: level.levelName, value: node.name };
        })
        .filter(Boolean) as Array<{ label: string; value: string }>,
    [levels, selectedNodeMeta],
  );
  const hasLevelDraft = Number(plannedLevelCount || 0) !== levelCount;

  const handleSelectCountry = (countryId: string) => {
    setSelectedCountryId(countryId);
    setSelectedNodes({});
    setSelectedNodeMeta({});
  };

  const handleSelectNode = (levelIndex: number, location: { id: string; name: string }) => {
    setSelectedNodes((previous) => {
      const next: Record<number, string> = {};
      Object.entries(previous).forEach(([key, value]) => {
        if (Number(key) < levelIndex) next[Number(key)] = value;
      });
      next[levelIndex] = location.id;
      return next;
    });
    setSelectedNodeMeta((previous) => {
      const next: Record<number, { id: string; name: string }> = {};
      Object.entries(previous).forEach(([key, value]) => {
        if (Number(key) < levelIndex) next[Number(key)] = value;
      });
      next[levelIndex] = location;
      return next;
    });
  };

  const handleAddLocation = (level: LocationLevel, levelIndex: number) => {
    setEditingLocation(null);
    setLocationModalState({ open: true, level, levelIndex });
  };

  const handleEditLocation = (
    level: LocationLevel,
    levelIndex: number,
    location: { id: string; name: string; isActive: boolean },
  ) => {
    setEditingLocation(location);
    setLocationModalState({ open: true, level, levelIndex });
  };

  const selectedParent = useMemo(() => {
    if (locationModalState.levelIndex === null || locationModalState.levelIndex <= 0) return null;
    const parent = selectedNodeMeta[locationModalState.levelIndex - 1];
    return parent ? ({ id: parent.id, name: parent.name } as LocationRecord) : null;
  }, [locationModalState.levelIndex, selectedNodeMeta]);

  const filteredCountries = useMemo(() => {
    if (!countrySearch.trim()) return countries;
    const term = countrySearch.trim().toLowerCase();
    return countries.filter(
      (country) =>
        country.name.toLowerCase().includes(term) || (country.code || '').toLowerCase().includes(term),
    );
  }, [countries, countrySearch]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f4fbf8] font-sans text-slate-900">
      <DashboardSidebar isCollapsed={isSidebarCollapsed} toggleCollapsed={() => setIsSidebarCollapsed((value) => !value)} />

      <main className="relative flex h-full flex-1 flex-col overflow-hidden">
        <DashboardHeader setMobileMenuOpen={setMobileMenuOpen} />

        <div className="relative flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar p-4 md:p-8">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.16),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(45,212,191,0.14),_transparent_30%),linear-gradient(180deg,_#f7fffb_0%,_#eefaf5_100%)]" />

          <div className="mx-auto max-w-[1520px] space-y-6 md:space-y-8">
            <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}>
              <h1 className="max-w-3xl text-3xl font-black tracking-tight text-slate-900 md:text-4xl">Locations</h1>
            </motion.div>

            <section className="rounded-[1.6rem] border border-emerald-100/80 bg-white/80 p-5 shadow-[0_28px_80px_-42px_rgba(16,185,129,0.22)] backdrop-blur sm:p-6">
              <div className="rounded-[1.35rem] border border-emerald-100/80 bg-white/90 p-4 shadow-[0_18px_45px_-30px_rgba(16,185,129,0.18)]">
                <div className="grid gap-4 lg:grid-cols-[minmax(260px,1.2fr)_minmax(220px,1fr)_150px]">
                  <label className="space-y-2">
                    <span className="text-base font-bold text-slate-700">Select a Country:</span>
                    <select
                      value={selectedCountryId}
                      onChange={(event) => handleSelectCountry(event.target.value)}
                      className="h-14 w-full rounded-[1rem] border border-emerald-100 bg-white px-4 text-base font-semibold text-slate-900 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                    >
                      {countries.map((country) => (
                        <option key={country.id} value={country.id}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-2">
                    <span className="text-base font-bold text-slate-700">Specify the count of levels:</span>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={plannedLevelCount}
                      onChange={(event) => setPlannedLevelCount(event.target.value)}
                      disabled={!selectedCountry || !canManage}
                      className="h-14 w-full rounded-[1rem] border border-emerald-100 bg-white px-4 text-base font-semibold text-slate-900 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:text-gray-300"
                    />
                  </label>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => setIsLevelModalOpen(true)}
                      disabled={!selectedCountry || !canManage}
                      className="inline-flex h-14 w-full items-center justify-center rounded-[1rem] bg-gradient-to-r from-emerald-500 to-teal-500 px-6 text-base font-black text-white shadow-[0_24px_60px_-26px_rgba(16,185,129,0.42)] transition-all hover:scale-[1.01] hover:from-emerald-600 hover:to-teal-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6 overflow-x-auto pb-3">
                <div className="flex min-w-max items-stretch gap-3">
                  <section className="flex min-h-[460px] min-w-[260px] max-w-[280px] flex-1 flex-col rounded-[1.15rem] border border-emerald-100/80 bg-white/95 p-3 shadow-[0_18px_40px_-28px_rgba(16,185,129,0.18)]">
                    <div className="px-2 pb-3">
                      <h3 className="text-[1.65rem] font-black tracking-tight text-slate-900">Country</h3>
                      <label className="mt-3 flex items-center gap-2 rounded-[0.95rem] border border-emerald-100 bg-white px-3 py-3 text-sm font-semibold text-slate-600 focus-within:border-emerald-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-100">
                        <Search className="h-4 w-4 text-gray-400" />
                        <input
                          value={countrySearch}
                          onChange={(event) => setCountrySearch(event.target.value)}
                          placeholder="Search Country..."
                          className="w-full bg-transparent text-sm font-semibold text-gray-900 outline-none placeholder:text-gray-400"
                        />
                      </label>
                    </div>

                    <div className="flex-1 overflow-y-auto px-1 pb-3">
                      {countriesQuery.isLoading || countriesQuery.isFetching ? (
                        <div className="space-y-3">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <div key={index} className="h-14 animate-pulse rounded-2xl bg-gray-100" />
                          ))}
                        </div>
                      ) : filteredCountries.length ? (
                        <div className="space-y-3">
                          {filteredCountries.map((country) => {
                            const isSelected = country.id === selectedCountryId;

                            return (
                              <motion.div
                                key={country.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{ scale: 1.01, x: 2 }}
                                className={`flex w-full items-center justify-between rounded-[0.95rem] border px-4 py-3 transition-all ${
                                  isSelected
                                    ? 'border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 shadow-[0_14px_30px_-22px_rgba(16,185,129,0.24)]'
                                    : 'border-emerald-100/60 bg-white text-slate-700 hover:border-emerald-200 hover:bg-emerald-50/45'
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={() => handleSelectCountry(country.id)}
                                  className="min-w-0 flex-1 text-left"
                                >
                                  <div className="text-sm font-black">{country.name}</div>
                                </button>
                                <div className="ml-3 flex items-center gap-2">
                                  {canManage ? (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingCountry(country);
                                          setIsCountryModalOpen(true);
                                        }}
                                        className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600"
                                        aria-label={`Edit ${country.name}`}
                                      >
                                        <Pencil className="h-3.5 w-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setDeleteState({ type: 'country', id: country.id, name: country.name });
                                        }}
                                        className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                                        aria-label={`Delete ${country.name}`}
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    </>
                                  ) : null}
                                  <ChevronRight className={`h-4 w-4 ${isSelected ? 'text-emerald-500' : 'text-slate-300'}`} />
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="rounded-[1rem] border border-dashed border-emerald-100 bg-emerald-50/40 px-5 py-10 text-center">
                          <p className="text-sm font-black text-slate-700">No Country added</p>
                        </div>
                      )}
                    </div>

                    {canManage ? (
                      <div className="px-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCountry(null);
                            setIsCountryModalOpen(true);
                          }}
                          className="w-full rounded-[0.95rem] bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-600 transition-colors hover:bg-emerald-100"
                        >
                          + Add Country
                        </button>
                      </div>
                    ) : null}
                  </section>

                  {levels.length ? (
                    <>
                      <div className="flex items-center justify-center px-1 text-emerald-300">
                        <ArrowRight className="h-5 w-5" />
                      </div>
                      <LevelColumns
                        countryId={selectedCountryId}
                        levels={levels}
                        selectedNodes={selectedNodes}
                        onSelect={handleSelectNode}
                        onAddLocation={handleAddLocation}
                        onEditLocation={handleEditLocation}
                        onDeleteLocation={(_level, _levelIndex, location) => setDeleteState({ type: 'location', id: location.id, name: location.name })}
                        canManage={canManage}
                      />
                    </>
                  ) : (
                    <div className="flex min-h-[460px] min-w-[260px] items-center justify-center rounded-[1.15rem] border border-dashed border-emerald-100 bg-white/80 px-8 text-center">
                      <div>
                        <div className="text-lg font-black text-slate-900">No levels configured</div>
                        <p className="mt-2 text-sm font-semibold text-slate-500">Apply level structure for this country to unlock the next columns.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-4 border-t border-emerald-100/80 pt-5 md:flex-row md:items-center md:justify-between">
                <div>
                  {selectedCountry ? (
                    selectedPath.length ? (
                      <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-600">
                        <span>{selectedCountry.name}</span>
                        {selectedPath.map((item) => (
                          <React.Fragment key={`${item.label}-${item.value}`}>
                            <ArrowRight className="h-4 w-4 text-emerald-300" />
                            <span>{item.value}</span>
                          </React.Fragment>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm font-semibold text-slate-500">Start by selecting a country, then choose a location to unlock the next column.</p>
                    )
                  ) : (
                    <p className="text-sm font-semibold text-slate-500">Start by adding a Country.</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setIsLevelModalOpen(true)}
                  disabled={!selectedCountry || !canManage || !hasLevelDraft}
                  className="inline-flex items-center justify-center gap-2 rounded-[1rem] bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-3 text-base font-black text-white shadow-[0_24px_60px_-24px_rgba(16,185,129,0.36)] transition-all hover:scale-[1.01] hover:from-emerald-600 hover:to-teal-600 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Save Country
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Suspense fallback={null}>
        <AddCountryModal
          open={isCountryModalOpen}
          onClose={() => {
            setIsCountryModalOpen(false);
            setEditingCountry(null);
          }}
          onSubmit={async (payload) => {
            try {
              const country = editingCountry
                ? await updateCountryMutation.mutateAsync({ id: editingCountry.id, payload })
                : await createCountryMutation.mutateAsync(payload);
              toast.success(editingCountry ? 'Country updated successfully' : 'Country created successfully');
              setSelectedCountryId(country.id);
              setEditingCountry(null);
              setIsCountryModalOpen(false);
            } catch (error: any) {
              toast.error(error?.response?.data?.message || `Failed to ${editingCountry ? 'update' : 'create'} country`);
            }
          }}
          isSubmitting={createCountryMutation.isPending || updateCountryMutation.isPending}
          initialValues={editingCountry}
          mode={editingCountry ? 'edit' : 'create'}
        />

        <AddLevelModal
          open={isLevelModalOpen}
          country={selectedCountry}
          levels={levels}
          desiredLevelCount={Number(plannedLevelCount || 0) || undefined}
          onClose={() => setIsLevelModalOpen(false)}
          onSubmit={async (payload) => {
            try {
              await configureLevelsMutation.mutateAsync(payload);
              toast.success('Location levels saved successfully');
              setIsLevelModalOpen(false);
            } catch (error: any) {
              toast.error(error?.response?.data?.message || 'Failed to save levels');
            }
          }}
          isSubmitting={configureLevelsMutation.isPending}
        />

        <AddLocationModal
          open={locationModalState.open}
          country={selectedCountry}
          level={locationModalState.level}
          parent={selectedParent}
          onClose={() => {
            setLocationModalState({ open: false, level: null, levelIndex: null });
            setEditingLocation(null);
          }}
          onSubmit={async (payload) => {
            try {
                const created = editingLocation
                  ? await updateLocationMutation.mutateAsync({
                      id: editingLocation.id,
                      payload: {
                        name: payload.name,
                        isActive: payload.isActive,
                      },
                    })
                  : await createLocationMutation.mutateAsync(payload);
                toast.success(editingLocation ? 'Location updated successfully' : 'Location created successfully');
                if (locationModalState.levelIndex !== null) {
                  handleSelectNode(locationModalState.levelIndex, { id: created.id, name: created.name });
                }
                setLocationModalState({ open: false, level: null, levelIndex: null });
                setEditingLocation(null);
            } catch (error: any) {
              toast.error(error?.response?.data?.message || `Failed to ${editingLocation ? 'update' : 'create'} location`);
            }
          }}
          isSubmitting={createLocationMutation.isPending || updateLocationMutation.isPending}
          initialValues={editingLocation}
          mode={editingLocation ? 'edit' : 'create'}
        />

        <DeleteLocationModal
          open={Boolean(deleteState)}
          title={deleteState?.type === 'country' ? `Delete ${deleteState?.name}` : `Delete ${deleteState?.name}`}
          description={
            deleteState?.type === 'country'
              ? 'This will deactivate the country. Delete is blocked if active child locations still exist.'
              : 'This will deactivate the location. Delete is blocked if child locations still exist.'
          }
          confirmLabel={deleteState?.type === 'country' ? 'Delete Country' : 'Delete Location'}
          onClose={() => setDeleteState(null)}
          onConfirm={async () => {
            if (!deleteState) return;
            try {
              if (deleteState.type === 'country') {
                await deleteCountryMutation.mutateAsync(deleteState.id);
                if (selectedCountryId === deleteState.id) {
                  setSelectedCountryId('');
                }
              } else {
                await deleteLocationMutation.mutateAsync(deleteState.id);
              }
              toast.success(`${deleteState.type === 'country' ? 'Country' : 'Location'} deleted successfully`);
              setDeleteState(null);
            } catch (error: any) {
              toast.error(error?.response?.data?.message || `Failed to delete ${deleteState.type}`);
            }
          }}
          isSubmitting={deleteCountryMutation.isPending || deleteLocationMutation.isPending}
        />
      </Suspense>
    </div>
  );
};

export default LocationsPage;
