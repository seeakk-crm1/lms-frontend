import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default leaflet icons in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom icons
const liveIcon = L.divIcon({
  className: 'custom-live-marker',
  html: `<div class="w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-[0_0_0_2px_rgba(16,185,129,0.3)] animate-pulse"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const stopIcon = L.divIcon({
  className: 'custom-stop-marker',
  html: `<div class="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-sm flex items-center justify-center"><div class="w-1.5 h-1.5 bg-white rounded-full"></div></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

// Component to dynamically recenter map
const MapRecenter = ({ lat, lng, zoom }: { lat: number; lng: number; zoom?: number }) => {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], zoom || map.getZoom(), { animate: true });
    }
  }, [lat, lng, zoom, map]);
  return null;
};

// Component to fit bounds to polyline
const FitBounds = ({ positions }: { positions: [number, number][] }) => {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [50, 50], animate: true });
    }
  }, [positions, map]);
  return null;
};

interface LocationMapProps {
  latitude?: number | null;
  longitude?: number | null;
  accuracy?: number | null;
  routePoints?: Array<{ latitude: number; longitude: number }>;
  stops?: Array<{ latitude: number; longitude: number; startedAt: string; durationSeconds: number }>;
  replayIndex?: number;
  isReplaying?: boolean;
  allUsers?: Array<any>;
  selectedUserId?: string;
}

const LocationMap: React.FC<LocationMapProps> = ({
  latitude,
  longitude,
  accuracy,
  routePoints = [],
  stops = [],
  replayIndex = 0,
  isReplaying = false,
  allUsers = [],
  selectedUserId = '',
}) => {
  const centerLat = latitude ?? 20.5937;
  const centerLng = longitude ?? 78.9629;
  
  // Format positions for Polyline
  const polylinePositions: [number, number][] = useMemo(
    () => routePoints.map((p) => [p.latitude, p.longitude]),
    [routePoints]
  );

  const activeReplayPoint = routePoints[replayIndex];
  
  const showLiveMarker = !isReplaying && latitude && longitude;
  const showReplayMarker = isReplaying && activeReplayPoint;

  return (
    <div className="relative h-full w-full bg-gray-100 z-0">
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={latitude ? 15 : 5}
        style={{ height: '100%', width: '100%', zIndex: 10 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Dynamic Bounds / Center logic */}
        {routePoints.length > 0 && !isReplaying && (
          <FitBounds positions={polylinePositions} />
        )}
        {showLiveMarker && !routePoints.length && (
          <MapRecenter lat={latitude!} lng={longitude!} zoom={15} />
        )}
        {showReplayMarker && (
           <MapRecenter lat={activeReplayPoint!.latitude} lng={activeReplayPoint!.longitude} />
        )}

        {/* Route Polyline */}
        {polylinePositions.length > 0 && (
          <Polyline positions={polylinePositions} color="#10b981" weight={4} opacity={0.7} />
        )}

        {/* Stops */}
        {stops.map((stop, i) => (
          <Marker key={i} position={[stop.latitude, stop.longitude]} icon={stopIcon}>
            <Popup>
              <div className="text-xs font-bold text-gray-700">
                <p>Stop duration: {Math.round(stop.durationSeconds / 60)} min</p>
                <p>Started: {new Date(stop.startedAt).toLocaleTimeString()}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Live Marker */}
        {showLiveMarker && (
          <>
            <Marker position={[latitude!, longitude!]} icon={liveIcon}>
               <Popup>
                  <p className="text-xs font-bold">Current Location</p>
               </Popup>
            </Marker>
            {accuracy && (
              <Circle
                center={[latitude!, longitude!]}
                radius={accuracy}
                pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.2, weight: 1 }}
              />
            )}
          </>
        )}

        {/* Replay Marker */}
        {showReplayMarker && (
          <Marker position={[activeReplayPoint!.latitude, activeReplayPoint!.longitude]} icon={liveIcon}>
              <Popup>
                 <p className="text-xs font-bold">Replay Location</p>
              </Popup>
          </Marker>
        )}
        {/* Render all other users when not replaying */}
        {!isReplaying && allUsers.map((u) => {
          if (!u.latitude || !u.longitude) return null;
          if (u.userId === selectedUserId) return null; // We already render the selected user
          
          const statusColor = u.status === 'Moving' ? 'bg-emerald-500' : u.status === 'Offline' ? 'bg-gray-400' : 'bg-amber-500';
          const icon = L.divIcon({
            className: 'custom-all-user-marker',
            html: `<div class="w-6 h-6 rounded-full border-2 border-white shadow-md bg-white overflow-hidden flex items-center justify-center">
                     ${u.user.profileImage ? `<img src="${u.user.profileImage}" class="w-full h-full object-cover" />` : `<span class="text-[8px] font-bold text-gray-500">${u.user.name.charAt(0)}</span>`}
                     <div class="absolute bottom-0 right-0 w-2 h-2 rounded-full border border-white ${statusColor}"></div>
                   </div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });

          return (
            <Marker key={u.userId} position={[u.latitude, u.longitude]} icon={icon}>
              <Popup>
                <div className="p-1">
                  <p className="font-bold text-gray-900">{u.user.name}</p>
                  <p className="text-xs text-gray-500">{u.status}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      
      {!latitude && !longitude && routePoints.length === 0 && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60 text-sm font-black text-gray-500 backdrop-blur-sm">
          No location data available.
        </div>
      )}
    </div>
  );
};

export default LocationMap;
