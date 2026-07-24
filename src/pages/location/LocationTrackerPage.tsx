import React, { useEffect, useMemo, useRef, useState } from 'react';
import { format, subDays } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import {
  Activity, Battery, Clock, Gauge, MapPin, Navigation, Pause, Play, RefreshCw, Route, Search, Users, Filter, X
} from 'lucide-react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import LocationMap from './components/LocationMap';
import { getLiveLocations, getLocationRoute, type LiveLocationUser, type RouteResponse } from '../../services/locationTracking.api';
import { motion, AnimatePresence } from 'framer-motion';

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

const LocationTrackerPage: React.FC = () => {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [replayIndex, setReplayIndex] = useState(0);
  const [replayPlaying, setReplayPlaying] = useState(false);
  const [replaySpeed, setReplaySpeed] = useState(1);
  const replayTimerRef = useRef<number | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOffice, setSelectedOffice] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);

  const { data: users = [], isLoading: loading, refetch: loadLive } = useQuery({
    queryKey: ['location-tracking', 'live'],
    queryFn: async () => {
      console.info('[Tracking Page] Polling started');
      const data = await getLiveLocations();
      console.info('Live locations received:', {
        Count: data.length,
        Data: data,
      });
      return data;
    },
    refetchInterval: 30000,
  });

  const { data: routeData, isLoading: routeLoading } = useQuery({
    queryKey: ['location-tracking', 'route', selectedUserId, selectedDate],
    queryFn: () => getLocationRoute({ userId: selectedUserId, date: selectedDate }),
    enabled: !!selectedUserId,
  });

  const offices = useMemo(() => {
    const set = new Set<string>();
    users.forEach((u) => { if (u.user.office) set.add(u.user.office); });
    return ['All', ...Array.from(set)].sort();
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchQuery.toLowerCase();
      const matchName = (u.user.name || '').toLowerCase().includes(q) || 
                        (u.user.role || '').toLowerCase().includes(q);
      const matchOffice = selectedOffice === 'All' || u.user.office === selectedOffice;
      return matchName && matchOffice;
    });
  }, [users, searchQuery, selectedOffice]);

  useEffect(() => {
    if (!selectedUserId && filteredUsers.length > 0) {
      setSelectedUserId(filteredUsers[0].user.id);
    }
  }, [filteredUsers, selectedUserId]);

  const selectedUser = useMemo(
    () => users.find((u) => u.user.id === selectedUserId),
    [users, selectedUserId]
  );
  
  const stats = routeData?.stats;

  // Playback Logic
  useEffect(() => {
    if (replayPlaying && routeData?.points?.length) {
      replayTimerRef.current = window.setInterval(() => {
        setReplayIndex(prev => {
          if (prev >= routeData.points.length - 1) {
            setReplayPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000 / replaySpeed);
    }
    return () => {
      if (replayTimerRef.current) clearInterval(replayTimerRef.current);
    };
  }, [replayPlaying, replaySpeed, routeData?.points?.length]);

  return (
    <DashboardLayout>
      <div className="relative h-[calc(100vh-64px)] w-full overflow-hidden bg-gray-50">
        
        {/* Fullscreen Map Background */}
        <div className="absolute inset-0 z-0">
          <LocationMap 
            latitude={selectedUser?.latitude}
            longitude={selectedUser?.longitude}
            routePoints={routeData?.points}
            stops={routeData?.stops}
            replayIndex={replayIndex}
            isReplaying={replayPlaying}
            allUsers={users}
            selectedUserId={selectedUserId}
          />
        </div>

        {/* Floating Controls Overlay */}
        <div className="pointer-events-none absolute inset-0 z-10 flex h-full w-full flex-col justify-between p-4">
          
          {/* Top Bar: Controls */}
          <div className="pointer-events-auto flex items-start justify-between gap-4">
            
            {/* Left Panel: Users & Filters */}
            <motion.div 
              initial={{ x: -300, opacity: 0 }} 
              animate={{ x: 0, opacity: 1 }}
              className={`flex w-80 flex-col gap-4 ${panelOpen ? '' : 'hidden'}`}
            >
              <div className="rounded-3xl border border-white/20 bg-white/80 p-4 shadow-xl backdrop-blur-xl">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-sm font-black uppercase tracking-widest text-gray-800">Field Workforce</h2>
                  <button onClick={() => setShowFilters(!showFilters)} className="rounded-xl bg-gray-100 p-2 text-gray-500 hover:bg-gray-200">
                    <Filter size={16} />
                  </button>
                </div>

                <AnimatePresence>
                  {showFilters && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="mb-4 overflow-hidden">
                      <div className="flex flex-col gap-3 rounded-2xl bg-gray-50 p-3">
                        <input
                          type="date"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700"
                        />
                        <select
                          value={selectedOffice}
                          onChange={(e) => setSelectedOffice(e.target.value)}
                          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700"
                        >
                          {offices.map((o) => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="relative mb-4">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-9 pr-4 text-xs font-semibold text-gray-700 outline-none transition focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                <div className="flex max-h-[calc(100vh-320px)] flex-col gap-2 overflow-y-auto pr-1">
                  {filteredUsers.map((u) => {
                    const isSelected = selectedUserId === u.user.id;
                    const statusColor = u.status === 'Moving' ? 'bg-emerald-500' : u.status === 'Offline' ? 'bg-gray-400' : 'bg-amber-500';
                    return (
                      <div
                        key={u.user.id}
                        onClick={() => setSelectedUserId(u.user.id)}
                        className={`group relative flex cursor-pointer items-center gap-3 rounded-2xl border p-3 transition ${
                          isSelected ? 'border-emerald-500 bg-emerald-50/80 shadow-md' : 'border-transparent bg-white hover:border-gray-200 hover:shadow-sm'
                        }`}
                      >
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-gray-100 bg-gray-100">
                          {u.user.avatarUrl ? (
                            <img src={u.user.avatarUrl} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center font-bold text-gray-400">{u.user.name.charAt(0)}</div>
                          )}
                          <div className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${statusColor}`}></div>
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="truncate text-xs font-bold text-gray-900">{u.user.name}</p>
                          <p className="truncate text-[10px] font-semibold text-gray-500">{updatedAgo(u.lastUpdatedAt)}</p>
                        </div>
                        {u.batteryPercentage && (
                          <div className="flex flex-col items-end text-[9px] font-bold text-gray-400">
                            <Battery size={12} className={u.batteryPercentage < 20 ? 'text-red-500' : 'text-emerald-500'} />
                            {u.batteryPercentage}%
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* Top Right: Stats Cards */}
            <div className="pointer-events-auto flex gap-3">
              <button onClick={() => setPanelOpen(!panelOpen)} className="rounded-2xl border border-white/20 bg-white/80 p-3 shadow-lg backdrop-blur-xl hover:bg-white text-gray-700">
                <Users size={20} />
              </button>
              
              <div className="hidden md:flex gap-3">
                {[
                  ['Active Today', users.filter(u => u.status !== 'Offline').length, Activity, 'text-emerald-500'],
                  ['Offline', users.filter(u => u.status === 'Offline').length, Navigation, 'text-gray-400'],
                  ['Total Distance', `${stats?.totalDistanceKm ?? 0} km`, Route, 'text-blue-500'],
                ].map(([label, value, Icon, colorClass]: any) => (
                  <div key={label} className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/80 px-4 py-2 shadow-lg backdrop-blur-xl">
                    <div className={`rounded-xl bg-gray-50 p-2 ${colorClass}`}><Icon size={16} /></div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">{label}</p>
                      <p className="text-sm font-black text-gray-900">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Bottom Bar: Timeline & Playback */}
          {selectedUserId && (
            <motion.div 
              initial={{ y: 100, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }}
              className="pointer-events-auto mx-auto w-full max-w-4xl rounded-3xl border border-white/20 bg-white/90 p-4 shadow-2xl backdrop-blur-xl"
            >
              <div className="flex items-center justify-between gap-6">
                
                {/* Playback Controls */}
                <div className="flex shrink-0 items-center gap-4 border-r border-gray-200 pr-6">
                  <button 
                    onClick={() => {
                      if (replayIndex >= (routeData?.points?.length || 0) - 1) setReplayIndex(0);
                      setReplayPlaying(!replayPlaying);
                    }}
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-md transition ${replayPlaying ? 'bg-amber-100 text-amber-600' : 'bg-emerald-500 text-white hover:bg-emerald-600'}`}
                  >
                    {replayPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                  </button>
                  <div className="flex flex-col gap-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Speed</p>
                    <div className="flex gap-1">
                      {[1, 5, 10].map(s => (
                        <button 
                          key={s} 
                          onClick={() => setReplaySpeed(s)}
                          className={`rounded-lg px-2 py-1 text-[10px] font-bold transition ${replaySpeed === s ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                        >
                          {s}x
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Scrubber / Timeline overview */}
                <div className="flex-1">
                  <div className="mb-2 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-500">
                    <span>{stats?.firstCheckIn ? format(new Date(stats.firstCheckIn), 'hh:mm a') : 'Start'}</span>
                    <span className="text-emerald-600">
                      {routeData?.points?.[replayIndex] ? format(new Date(routeData.points[replayIndex].recordedAt), 'hh:mm a') : '00:00'}
                    </span>
                    <span>{stats?.lastCheckOut ? format(new Date(stats.lastCheckOut), 'hh:mm a') : 'End'}</span>
                  </div>
                  <input 
                    type="range" 
                    min={0} 
                    max={Math.max(0, (routeData?.points?.length || 1) - 1)} 
                    value={replayIndex}
                    onChange={(e) => {
                      setReplayPlaying(false);
                      setReplayIndex(parseInt(e.target.value));
                    }}
                    className="h-2 w-full appearance-none rounded-full bg-gray-200 accent-emerald-500"
                  />
                </div>

              </div>
            </motion.div>
          )}

        </div>
      </div>
    </DashboardLayout>
  );
};

export default LocationTrackerPage;
