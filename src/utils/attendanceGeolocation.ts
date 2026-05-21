export type CapturedAttendanceLocation = {
  latitude: number;
  longitude: number;
  gpsAccuracy: number | null;
  locationCapturedAt: string;
};

export class AttendanceGeolocationError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = 'AttendanceGeolocationError';
  }
}

const mapGeolocationError = (error: GeolocationPositionError): AttendanceGeolocationError => {
  if (error.code === error.PERMISSION_DENIED) {
    return new AttendanceGeolocationError(
      'GPS_PERMISSION_DENIED',
      'Location access is required for attendance.',
    );
  }
  if (error.code === error.POSITION_UNAVAILABLE) {
    return new AttendanceGeolocationError(
      'GPS_DISABLED',
      'Please enable location services to mark attendance.',
    );
  }
  return new AttendanceGeolocationError(
    'GPS_TIMEOUT',
    'Unable to detect your location. Please try again near a window or outdoors.',
  );
};

/**
 * Requests live GPS coordinates for office attendance validation.
 */
export const captureAttendanceLocation = (): Promise<CapturedAttendanceLocation> => {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return Promise.reject(
      new AttendanceGeolocationError(
        'GPS_UNSUPPORTED',
        'Please enable location services to mark attendance.',
      ),
    );
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          gpsAccuracy: position.coords.accuracy ?? null,
          locationCapturedAt: new Date(position.timestamp || Date.now()).toISOString(),
        });
      },
      (error) => reject(mapGeolocationError(error)),
      {
        enableHighAccuracy: true,
        timeout: 25_000,
        maximumAge: 0,
      },
    );
  });
};

/** Client-side Haversine preview (backend is source of truth). */
export const previewDistanceMeters = (
  userLat: number,
  userLon: number,
  officeLat: number,
  officeLon: number,
): number => {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6_371_000;
  const dLat = toRad(officeLat - userLat);
  const dLon = toRad(officeLon - userLon);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(userLat)) * Math.cos(toRad(officeLat)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};
