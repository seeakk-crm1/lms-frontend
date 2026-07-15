import React, { useEffect, useMemo, useRef, useState } from 'react';
import { format, subDays } from 'date-fns';
import {
  Activity,
  Battery,
  Clock,
  Download,
  Gauge,
  MapPin,
  Navigation,
  Pause,
  Play,
  RefreshCw,
  Route,
  Users,
} from 'lucide-react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { connectRealtime } from '../../services/realtime';
import {
  exportLocationRoute,
  getLiveLocations,
  getLocationRoute,
  type LiveLocationUser,
  type RouteResponse,
} from '../../services/locationTracking.api';

const statusClass = (status?: string) => {
  if (status === 'Moving') return 'bg-emerald-50 text-emerald-700 border-emerald-100';
  if (status === 'Stopped') return 'bg-amber-50 text-amber-700 border-amber-100';
  return 'bg-gray-50 text-gray-500 border-gray-100';
};

const formatDuration = (seconds = 0) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

const updatedAgo = (value?: string | null) => {
  if (!value) return 'No update yet';
  const seconds = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return `Updated ${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `Updated ${minutes}m ago`;
  return `Last seen ${format(new Date(value), 'hh:mm a')}`;
};

const mapUrl = (lat?: number | null, lng?: number | null) => {
  const latitude = lat ?? 20.5937;
  const longitude = lng ?? 78.9629;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.02}%2C${latitude - 0.02}%2C${longitude + 0.02}%2C${latitude + 0.02}&layer=mapnik&marker=${latitude}%2C${longitude}`;
};

const LocationTrackerPage: React.FC = () => {
  const [users, setUsers] = useState<LiveLocationUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [routeData, setRouteData] = useState<RouteResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [routeLoading, setRouteLoading] = useState(false);
  const [replayIndex, setReplayIndex] = useState(0);
  const [replayPlaying, setReplayPlaying] = useState(false);
  const [replaySpeed, setReplaySpeed] = useState(1);
  const replayTimerRef = useRef<number | null>(null);

  const selectedUser = useMemo(
    () => users.find((item) => item.user.id === selectedUserId) || users[0] || null,
    [selectedUserId, users],
  );

  const selectedRoutePoint = routeData?.points?.[replayIndex] || routeData?.points?.[routeData.points.length - 1];
  const mapLatitude = selectedRoutePoint?.latitude ?? selectedUser?.latitude;
  const mapLongitude = selectedRoutePoint?.longitude ?? selectedUser?.longitude;

  const loadLive = async () => {
    const data = await getLiveLocations();
    setUsers(data);
    setSelectedUserId((current) => current || data[0]?.user.id || '');
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadLive()
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    const socket = connectRealtime();
    const onLocationUpdate = () => {
      void loadLive();
    };
    socket?.on('location_updated', onLocationUpdate);
    socket?.on('location_session_started', onLocationUpdate);
    socket?.on('location_session_stopped', onLocationUpdate);

    return () => {
      cancelled = true;
      socket?.off('location_updated', onLocationUpdate);
      socket?.off('location_session_started', onLocationUpdate);
      socket?.off('location_session_stopped', onLocationUpdate);
    };
  }, []);

  useEffect(() => {
    if (!selectedUser?.user.id) return;
    setRouteLoading(true);
    setReplayIndex(0);
    getLocationRoute({ userId: selectedUser.user.id, date: selectedDate })
      .then(setRouteData)
      .catch(() => setRouteData(null))
      .finally(() => setRouteLoading(false));
  }, [selectedDate, selectedUser?.user.id]);

  useEffect(() => {
    if (!replayPlaying || !routeData?.points?.length) return;
    replayTimerRef.current = window.setInterval(() => {
      setReplayIndex((current) => {
        if (current >= routeData.points.length - 1) {
          setReplayPlaying(false);
          return current;
        }
        return current + 1;
      });
    }, Math.max(250, 1000 / replaySpeed));

    return () => {
      if (replayTimerRef.current) window.clearInterval(replayTimerRef.current);
    };
  }, [replayPlaying, replaySpeed, routeData?.points?.length]);

  const stats = routeData?.stats;
  const liveCounts = {
    active: users.filter((item) => item.trackingStatus === 'ACTIVE').length,
    moving: users.filter((item) => item.status === 'Moving').length,
    stopped: users.filter((item) => item.status === 'Stopped').length,
    offline: users.filter((item) => item.status === 'Offline').length,
  };

  const handleExport = async () => {
    if (!selectedUser?.user.id) return;
    const blob = await exportLocationRoute({ userId: selectedUser.user.id, date: selectedDate });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `route-${selectedUser.user.name || selectedUser.user.id}-${selectedDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className="custom-scrollbar flex-1 overflow-auto bg-slate-50 p-4 md:p-6">
        <div className="mx-auto max-w-[1500px] space-y-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.25em] text-emerald-600">Management</p>
              <h1 className="mt-1 text-3xl font-black text-gray-950">Location Tracker</h1>
              <p className="mt-1 text-sm font-semibold text-gray-500">Live field staff movement, routes, stops, and daily travel statistics.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setSelectedDate(format(new Date(), 'yyyy-MM-dd'))} className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-black text-gray-700">Today</button>
              <button onClick={() => setSelectedDate(format(subDays(new Date(), 1), 'yyyy-MM-dd'))} className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-black text-gray-700">Yesterday</button>
              <input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700" />
              <button onClick={() => void loadLive()} className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-black text-white">
                <RefreshCw className="h-4 w-4" /> Refresh
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {[
              ['Active', liveCounts.active, Users],
              ['Moving', liveCounts.moving, Navigation],
              ['Stopped', liveCounts.stopped, Activity],
              ['Offline', liveCounts.offline, Clock],
              ["Today's KM", stats?.totalDistanceKm ?? 0, Route],
            ].map(([label, value, Icon]: any) => (
              <div key={label} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <Icon className="h-5 w-5 text-emerald-500" />
                <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</p>
                <p className="text-2xl font-black text-gray-950">{value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-5 xl:grid-cols-[340px_1fr]">
            <aside className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
              <div className="mb-3 flex items-center justify-between px-2">
                <p className="text-xs font-black uppercase tracking-widest text-gray-400">Live Users</p>
                <span className="rounded-full bg-gray-100 px-2 py-1 text-[10px] font-black text-gray-500">{users.length}</span>
              </div>
              <div className="custom-scrollbar max-h-[680px] space-y-2 overflow-auto">
                {loading ? (
                  <div className="p-6 text-center text-sm font-bold text-gray-400">Loading live locations...</div>
                ) : users.length === 0 ? (
                  <div className="p-6 text-center text-sm font-bold text-gray-400">No field users available.</div>
                ) : (
                  users.map((item) => (
                    <button
                      key={item.user.id}
                      onClick={() => setSelectedUserId(item.user.id)}
                      className={`w-full rounded-xl border p-3 text-left transition ${
                        selectedUser?.user.id === item.user.id ? 'border-emerald-200 bg-emerald-50/70' : 'border-gray-100 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-sm font-black text-white">
                          {(item.user.name || item.user.email || '?').slice(0, 1).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-black text-gray-900">{item.user.name || item.user.email}</p>
                          <p className="truncate text-xs font-semibold text-gray-500">{updatedAgo(item.lastUpdatedAt)}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <span className={`rounded-full border px-2 py-1 text-[10px] font-black ${statusClass(item.status)}`}>{item.status}</span>
                        <span className="text-[10px] font-black text-gray-400">{Number((item.speed || 0) * 3.6).toFixed(1)} km/h</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </aside>

            <main className="space-y-5">
              <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-gray-100 p-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-lg font-black text-gray-950">{selectedUser?.user.name || 'Select a user'}</p>
                    <p className="text-sm font-semibold text-gray-500">{selectedUser?.user.role || 'Field staff'} · {selectedUser?.user.office || 'No office assigned'}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button disabled={!routeData?.points?.length} onClick={() => setReplayPlaying((value) => !value)} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-black text-white disabled:opacity-40">
                      {replayPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      Replay Route
                    </button>
                    {[1, 2, 4].map((speed) => (
                      <button key={speed} onClick={() => setReplaySpeed(speed)} className={`rounded-xl border px-3 py-2 text-xs font-black ${replaySpeed === speed ? 'border-emerald-500 text-emerald-600' : 'border-gray-200 text-gray-500'}`}>{speed}x</button>
                    ))}
                    <button onClick={handleExport} disabled={!selectedUser} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-black text-gray-700 disabled:opacity-40">
                      <Download className="h-4 w-4" /> Export
                    </button>
                  </div>
                </div>
                <div className="relative h-[440px] bg-gray-100">
                  <iframe title="Live location map" src={mapUrl(mapLatitude, mapLongitude)} className="h-full w-full border-0" loading="lazy" />
                  {!mapLatitude || !mapLongitude ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 text-sm font-black text-gray-500">
                      Waiting for live GPS update.
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-4">
                {[
                  ['Distance', `${stats?.totalDistanceKm ?? 0} km`, Route],
                  ['Moving Time', formatDuration(stats?.movingSeconds), Clock],
                  ['Stops', stats?.numberOfStops ?? 0, MapPin],
                  ['Avg Speed', `${stats?.averageSpeedKmh ?? 0} km/h`, Gauge],
                ].map(([label, value, Icon]: any) => (
                  <div key={label} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                    <Icon className="h-5 w-5 text-emerald-500" />
                    <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</p>
                    <p className="text-xl font-black text-gray-950">{value}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                  <h2 className="text-sm font-black uppercase tracking-widest text-gray-500">Travel Timeline</h2>
                  <div className="mt-4 max-h-80 space-y-3 overflow-auto">
                    {routeLoading ? (
                      <p className="text-sm font-bold text-gray-400">Loading route...</p>
                    ) : routeData?.points?.length ? (
                      routeData.points.filter((_, index) => index % Math.max(1, Math.floor(routeData.points.length / 12)) === 0).map((point, index) => (
                        <div key={`${point.recordedAt}-${index}`} className="flex gap-3 border-l-2 border-emerald-100 pl-3">
                          <span className="text-xs font-black text-emerald-600">{format(new Date(point.recordedAt), 'hh:mm a')}</span>
                          <p className="text-xs font-semibold text-gray-600">Location update · {point.latitude.toFixed(5)}, {point.longitude.toFixed(5)}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm font-bold text-gray-400">No route points for this date.</p>
                    )}
                  </div>
                </section>

                <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                  <h2 className="text-sm font-black uppercase tracking-widest text-gray-500">Visited Stops</h2>
                  <div className="mt-4 max-h-80 space-y-3 overflow-auto">
                    {routeData?.stops?.length ? routeData.stops.map((stop, index) => (
                      <div key={`${stop.startedAt}-${index}`} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                        <p className="text-sm font-black text-gray-900">Unknown Location</p>
                        <p className="mt-1 text-xs font-semibold text-gray-500">{format(new Date(stop.startedAt), 'hh:mm a')} · {formatDuration(stop.durationSeconds)}</p>
                        <p className="mt-1 text-[11px] font-bold text-gray-400">{stop.latitude.toFixed(5)}, {stop.longitude.toFixed(5)}</p>
                      </div>
                    )) : (
                      <p className="text-sm font-bold text-gray-400">No 5+ minute stops detected.</p>
                    )}
                  </div>
                </section>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-gray-500">
                  <span className="inline-flex items-center gap-1"><Battery className="h-4 w-4" /> Battery {selectedUser?.batteryPercentage ?? 'N/A'}%</span>
                  <span>Accuracy {selectedUser?.accuracy ? `${Math.round(selectedUser.accuracy)}m` : 'N/A'}</span>
                  <span>Max Speed {stats?.maxSpeedKmh ?? 0} km/h</span>
                  <span>Check-In {stats?.firstCheckIn ? format(new Date(stats.firstCheckIn), 'hh:mm a') : 'N/A'}</span>
                  <span>Check-Out {stats?.lastCheckOut ? format(new Date(stats.lastCheckOut), 'hh:mm a') : 'N/A'}</span>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LocationTrackerPage;
