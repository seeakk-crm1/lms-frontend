import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/useAuthStore';
import { getTodayStatus } from '../../services/attendance.api';
import { pushLocationPoints, startLocationSession, type LocationPointPayload } from '../../services/locationTracking.api';

const FIELD_TRACKING_TERMS = ['field sales', 'sales executive', 'marketing executive', 'field staff'];
const CACHE_KEY = 'seeakk_location_queue';
const TRACK_INTERVAL_MS = 30_000;
const MIN_DISTANCE_METERS = 20;

const getRoleName = (user: any): string => {
  if (!user) return '';
  if (typeof user.role === 'string') return user.role;
  return [user.role?.name, user.designation, user.department?.name].filter(Boolean).join(' ');
};

const isFieldUser = (user: any): boolean =>
  FIELD_TRACKING_TERMS.some((term) => getRoleName(user).toLowerCase().includes(term));

const distanceMeters = (left: LocationPointPayload, right: LocationPointPayload): number => {
  const radians = (value: number) => (value * Math.PI) / 180;
  const radius = 6371000;
  const dLat = radians(right.latitude - left.latitude);
  const dLon = radians(right.longitude - left.longitude);
  const lat1 = radians(left.latitude);
  const lat2 = radians(right.latitude);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return 2 * radius * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const readQueue = (): LocationPointPayload[] => {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '[]');
  } catch {
    return [];
  }
};

const writeQueue = (items: LocationPointPayload[]) => {
  localStorage.setItem(CACHE_KEY, JSON.stringify(items.slice(-500)));
};

const toPoint = (position: GeolocationPosition): LocationPointPayload => ({
  latitude: position.coords.latitude,
  longitude: position.coords.longitude,
  accuracy: position.coords.accuracy ?? null,
  speed: position.coords.speed ?? null,
  heading: position.coords.heading ?? null,
  recordedAt: new Date(position.timestamp || Date.now()).toISOString(),
  deviceType: /Mobi|Android|iPhone/i.test(navigator.userAgent) ? 'mobile-web' : 'web',
  source: 'web',
});

const LocationTrackingClient = () => {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const sessionIdRef = useRef<string | undefined>();
  const attendanceRecordIdRef = useRef<string | undefined>();
  const lastPointRef = useRef<LocationPointPayload | null>(null);
  const deniedToastShownRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !user || !isFieldUser(user) || !('geolocation' in navigator)) return;

    let cancelled = false;
    let intervalId: number | undefined;

    const upload = async (point?: LocationPointPayload) => {
      const queued = readQueue();
      const points = [...queued, ...(point ? [point] : [])];
      if (points.length === 0) return;

      try {
        const response = await pushLocationPoints({
          sessionId: sessionIdRef.current,
          attendanceRecordId: attendanceRecordIdRef.current,
          points,
        });
        sessionIdRef.current = response?.data?.sessionId || sessionIdRef.current;
        writeQueue([]);
      } catch {
        writeQueue(points);
      }
    };

    const captureAndUpload = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const point = toPoint(position);
          const last = lastPointRef.current;
          if (last && distanceMeters(last, point) < MIN_DISTANCE_METERS) {
            return;
          }
          lastPointRef.current = point;
          void upload(point);
        },
        (error) => {
          if (!deniedToastShownRef.current && error.code === error.PERMISSION_DENIED) {
            deniedToastShownRef.current = true;
            toast.error('Location access is required for field attendance.');
          }
        },
        { enableHighAccuracy: true, maximumAge: 15_000, timeout: 20_000 },
      );
    };

    const bootstrap = async () => {
      try {
        const status = await getTodayStatus();
        if (cancelled) return;
        const data = status?.data;
        const record = data?.record;
        const checkedIn = Boolean(record?.checkInTime && !data?.checkoutCompleted && !record?.checkOutTime);
        if (!checkedIn) return;
        attendanceRecordIdRef.current = record?.id;
        const started = await startLocationSession({
          attendanceRecordId: record?.id,
          deviceType: /Mobi|Android|iPhone/i.test(navigator.userAgent) ? 'mobile-web' : 'web',
        });
        sessionIdRef.current = started?.data?.id || started?.data?.sessionId;
        await upload();
        captureAndUpload();
        intervalId = window.setInterval(captureAndUpload, TRACK_INTERVAL_MS);
      } catch {
        // Tracking is best-effort and must not block the app shell.
      }
    };

    void bootstrap();

    const onOnline = () => {
      void upload();
    };
    window.addEventListener('online', onOnline);

    return () => {
      cancelled = true;
      if (intervalId) window.clearInterval(intervalId);
      window.removeEventListener('online', onOnline);
    };
  }, [isAuthenticated, user]);

  return null;
};

export default LocationTrackingClient;
