import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Battery, Clock, Navigation } from 'lucide-react';
import { getLiveLocations, getLocationRoute } from '../../services/locationTracking.api';
import { format } from 'date-fns';

const formatDuration = (seconds = 0) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

const CreateUserLocationTab: React.FC<{ userId: string }> = ({ userId }) => {
  const { data: users = [], isLoading: liveLoading } = useQuery({
    queryKey: ['location-tracking', 'live'],
    queryFn: () => getLiveLocations({ userId }),
    refetchInterval: 30000,
  });

  const { data: routeData, isLoading: routeLoading } = useQuery({
    queryKey: ['location-tracking', 'route', userId, format(new Date(), 'yyyy-MM-dd')],
    queryFn: () => getLocationRoute({ userId, date: format(new Date(), 'yyyy-MM-dd') }),
    enabled: !!userId,
  });

  const liveUser = users.find((u) => u.user.id === userId);
  const stats = routeData?.stats;

  if (liveLoading || routeLoading) {
    return <div className="flex justify-center p-8 text-gray-500">Loading location data...</div>;
  }

  const statusColor = liveUser?.status === 'Moving' ? 'text-emerald-500 bg-emerald-50' : liveUser?.status === 'Offline' ? 'text-gray-500 bg-gray-50' : 'text-amber-500 bg-amber-50';

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div>
          <h3 className="text-sm font-bold text-gray-900">Current Status</h3>
          <p className="mt-1 text-xs text-gray-500">
            {liveUser?.lastUpdatedAt ? `Updated ${format(new Date(liveUser.lastUpdatedAt), 'hh:mm a')}` : 'No recent updates'}
          </p>
        </div>
        <div className={`rounded-full px-4 py-1.5 text-sm font-bold ${statusColor}`}>
          {liveUser?.status || 'Unknown'}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="rounded-xl bg-blue-50 p-3 text-blue-500">
            <MapPin size={24} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Current Address</p>
            <p className="mt-1 font-semibold text-gray-900 line-clamp-2 text-sm">
              {liveUser?.address || (liveUser?.latitude && liveUser?.longitude ? `${liveUser.latitude.toFixed(4)}, ${liveUser.longitude.toFixed(4)}` : 'Location not available')}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="rounded-xl bg-emerald-50 p-3 text-emerald-500">
            <Navigation size={24} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Today's Distance</p>
            <p className="mt-1 text-xl font-black text-gray-900">{stats?.totalDistanceKm ?? 0} km</p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="rounded-xl bg-amber-50 p-3 text-amber-500">
            <Battery size={24} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Battery Level</p>
            <p className="mt-1 text-xl font-black text-gray-900">{liveUser?.batteryPercentage ?? '--'}%</p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="rounded-xl bg-purple-50 p-3 text-purple-500">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Moving Time</p>
            <p className="mt-1 text-xl font-black text-gray-900">{formatDuration(stats?.movingSeconds)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateUserLocationTab;
