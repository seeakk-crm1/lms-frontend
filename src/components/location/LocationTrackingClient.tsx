import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import { getTodayStatus } from '../../services/attendance.api';
import { pushLocationPoints, startLocationSession, type LocationPointPayload } from '../../services/locationTracking.api';
import { idbGetQueue, idbSavePoints, idbClearQueue } from '../../utils/indexedDB';

const FIELD_TRACKING_TERMS = [
  'field',
  'sales',
  'executive',
  'bde',
  'marketing',
  'staff',
  'admin',
  'manager',
  'superadmin',
  'head',
  'officer',
  'representative',
  'intern',
];
const TRACK_INTERVAL_MS = 30_000;
const MIN_DISTANCE_METERS = 20;

const getRoleName = (user: any): string => {
  if (!user) return '';
  if (typeof user.role === 'string') return user.role;
  return [user.role?.name, user.designation, user.department?.name].filter(Boolean).join(' ');
};

const isFieldUser = (user: any): boolean => {
  if (!user) return false;
  const roleName = getRoleName(user).toLowerCase();
  if (!roleName || roleName.trim().length === 0) return true;
  return FIELD_TRACKING_TERMS.some((term) => roleName.includes(term));
};

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
  const sessionIdRef = useRef<string | undefined>(undefined);
  const attendanceRecordIdRef = useRef<string | undefined>(undefined);
  const lastPointRef = useRef<LocationPointPayload | null>(null);
  const isUploadingRef = useRef(false);

  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const permissionRequestedRef = useRef(false);

  useEffect(() => {
    const hasToken = Boolean(localStorage.getItem('accessToken'));
    if (!isAuthenticated || !user || !hasToken || !isFieldUser(user) || !('geolocation' in navigator)) {
      return;
    }

    if (navigator.permissions?.query) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then((status) => {
          if (status.state === 'prompt' && !permissionRequestedRef.current) {
            setShowPermissionDialog(true);
          } else if (status.state === 'granted') {
            startEngine();
          } else if (status.state === 'denied') {
            toast.error('Location tracking is blocked in your browser permissions.');
          }
        })
        .catch(() => startEngine());
    } else {
      startEngine();
    }
  }, [isAuthenticated, user]);

  const startEngine = () => {
    setShowPermissionDialog(false);
    permissionRequestedRef.current = true;
    let cancelled = false;
    let intervalId: number | undefined;

    const upload = async (point?: LocationPointPayload) => {
      if (isUploadingRef.current) return;

      const hasToken = Boolean(localStorage.getItem('accessToken'));
      if (!hasToken) {
        console.warn('[Location Tracking] Aborting upload: No access token available.');
        return;
      }

      isUploadingRef.current = true;

      try {
        const queued = await idbGetQueue();
        const points = [...queued, ...(point ? [point] : [])];
        if (points.length === 0) return;
        const response = await pushLocationPoints({
          sessionId: sessionIdRef.current,
          attendanceRecordId: attendanceRecordIdRef.current,
          points,
        });

        sessionIdRef.current = response?.data?.sessionId || sessionIdRef.current;
        await idbClearQueue();
      } catch (err: any) {
        const statusCode = err?.response?.status;
        console.warn(`[Location Tracking] Response Received -> Status Code: ${statusCode || 'Error'}`);

        if (statusCode === 401) {
          console.error('[Location Tracking] Authentication failed (401 Unauthorized). Stopping location tracking retry loop.');
          if (intervalId) window.clearInterval(intervalId);
        } else if (statusCode === 403) {
          toast.error('You do not have permission to access Location Tracking.');
          await idbClearQueue();
          sessionIdRef.current = undefined;
          attendanceRecordIdRef.current = undefined;
          if (intervalId) window.clearInterval(intervalId);
        } else if (statusCode === 423) {
          console.warn('[Location Tracking] 423 Received -> Handled: Overdue follow-up lock active.');
          await idbClearQueue();
          sessionIdRef.current = undefined;
          attendanceRecordIdRef.current = undefined;
        } else if (statusCode === 409 || statusCode === 404 || statusCode === 400) {
          await idbClearQueue();
          sessionIdRef.current = undefined;
          attendanceRecordIdRef.current = undefined;
        } else if (point) {
          await idbSavePoints([point]);
        }
      } finally {
        isUploadingRef.current = false;
      }
    };

    const captureAndUpload = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const point = toPoint(position);
          const last = lastPointRef.current;

          let shouldUpload = true;
          if (last) {
            const dist = distanceMeters(last, point);
            const timeDiff = Math.abs(new Date(point.recordedAt).getTime() - new Date(last.recordedAt).getTime());
            if (dist < MIN_DISTANCE_METERS && timeDiff < 60_000) {
              shouldUpload = false;
            }
          }

          if (shouldUpload) {
            lastPointRef.current = point;
            void upload(point);
          }
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            toast.error('Location tracking is required for field attendance. Please enable GPS.');
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
        if (!checkedIn) {
          return;
        }

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
        // tracking is best-effort
      }
    };

    void bootstrap();

    const onOnline = () => { void upload(); };
    window.addEventListener('online', onOnline);

    return () => {
      cancelled = true;
      if (intervalId) window.clearInterval(intervalId);
      window.removeEventListener('online', onOnline);
    };
  };

  return (
    <AnimatePresence>
      {showPermissionDialog && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl"
          >
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <MapPin size={28} />
            </div>
            <h3 className="mb-2 text-xl font-bold text-gray-900">Enable Location Tracking</h3>
            <p className="mb-6 text-sm leading-relaxed text-gray-500">
              Seeakk requires location access to monitor field activity and automatically generate your travel routes while you work.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPermissionDialog(false)}
                className="flex-1 rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-200"
              >
                Block
              </button>
              <button
                onClick={() => {
                  startEngine();
                  // Trigger browser prompt
                  navigator.geolocation.getCurrentPosition(() => {}, () => {});
                }}
                className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Allow
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LocationTrackingClient;
