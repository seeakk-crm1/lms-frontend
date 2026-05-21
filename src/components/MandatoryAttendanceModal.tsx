import React, { useState, useEffect, useCallback } from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle, Globe, MapPin, Loader2 } from 'lucide-react';
import { markAttendance } from '../services/attendance.api';
import { dispatchAttendanceRefresh } from '../utils/attendanceRefresh';
import {
  AttendanceGeolocationError,
  captureAttendanceLocation,
  previewDistanceMeters,
  type CapturedAttendanceLocation,
} from '../utils/attendanceGeolocation';
import toast from 'react-hot-toast';

interface OfficeLocationProfile {
  id: string;
  officeName: string;
  branch?: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
}

interface MandatoryAttendanceModalProps {
  status: {
    date: string;
    isLocked?: boolean;
    attendanceApplyType?: string;
    record?: any;
    assignedOfficeLocation?: OfficeLocationProfile | null;
    officeLocations?: OfficeLocationProfile[];
  };
  onSuccess?: () => void;
}

export const MandatoryAttendanceModal: React.FC<MandatoryAttendanceModalProps> = ({ status, onSuccess }) => {
  const [submitting, setSubmitting] = useState(false);
  const [locating, setLocating] = useState(false);
  const [attendanceType, setAttendanceType] = useState('PRESENT');
  const [notes, setNotes] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [liveLocation, setLiveLocation] = useState<CapturedAttendanceLocation | null>(null);
  const [distanceMeters, setDistanceMeters] = useState<number | null>(null);

  const office = status.assignedOfficeLocation || status.officeLocations?.[0] || null;
  const isRestricted = status.attendanceApplyType === 'FROM_OFFICE';
  const needsGps = isRestricted && !['WORK_FROM_HOME', 'LEAVE'].includes(attendanceType);

  const refreshLocationPreview = useCallback(async () => {
    if (!needsGps || !office) {
      setLiveLocation(null);
      setDistanceMeters(null);
      return;
    }
    setLocating(true);
    try {
      const captured = await captureAttendanceLocation();
      setLiveLocation(captured);
      setDistanceMeters(
        previewDistanceMeters(
          captured.latitude,
          captured.longitude,
          office.latitude,
          office.longitude,
        ),
      );
    } catch (err) {
      setLiveLocation(null);
      setDistanceMeters(null);
      if (err instanceof AttendanceGeolocationError) {
        toast.error(err.message);
      }
    } finally {
      setLocating(false);
    }
  }, [needsGps, office]);

  useEffect(() => {
    void refreshLocationPreview();
  }, [refreshLocationPreview]);

  const withinRadius =
    distanceMeters != null && office ? distanceMeters <= office.radiusMeters : !needsGps;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let locationPayload: Partial<CapturedAttendanceLocation> = {};
      if (needsGps) {
        const captured = liveLocation ?? (await captureAttendanceLocation());
        locationPayload = captured;
        if (office) {
          const dist = previewDistanceMeters(
            captured.latitude,
            captured.longitude,
            office.latitude,
            office.longitude,
          );
          if (dist > office.radiusMeters) {
            toast.error('You can only mark attendance from office location.');
            return;
          }
        }
      }

      const response = await markAttendance({
        attendanceType,
        checkInTime: new Date().toISOString(),
        date: status.date,
        latitude: locationPayload.latitude,
        longitude: locationPayload.longitude,
        gpsAccuracy: locationPayload.gpsAccuracy,
        locationCapturedAt: locationPayload.locationCapturedAt,
        clientChannel: 'web',
        deviceInfo: navigator.userAgent,
        notes,
        attachmentUrl,
      });

      if (response.success) {
        toast.success(
          response.data?.approvalStatus === 'PENDING'
            ? 'Attendance submitted for supervisor approval.'
            : 'Attendance marked successfully.',
        );
        dispatchAttendanceRefresh({ action: 'submitted' });
        onSuccess?.();
      }
    } catch (err: any) {
      const data = err.response?.data;
      toast.error(data?.message || 'Failed to submit attendance.', { duration: 6000 });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 select-none"
      role="dialog"
      aria-modal="true"
      onMouseDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
    >
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" aria-hidden onMouseDown={(e) => e.preventDefault()} />

      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-white/80 bg-white shadow-2xl">
        <div className="relative bg-emerald-600 px-8 py-6 text-white">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/10 p-3">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-wide">Daily Check-in Required</h2>
              <p className="mt-1 text-xs text-emerald-100">
                Submit attendance before using the application. {new Date().toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {status.isLocked ? (
          <div className="flex flex-col items-center p-8 text-center">
            <div className="mb-4 rounded-full bg-rose-50 p-5 text-rose-500">
              <ShieldAlert size={48} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Your Account is Locked</h3>
            <p className="mt-2 max-w-md text-sm text-gray-500">
              Contact your supervisor to unlock your account before marking attendance.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 p-8">
            <div
              className={`flex items-start gap-3 rounded-2xl border p-4 ${
                isRestricted ? 'border-amber-100 bg-amber-50 text-amber-800' : 'border-emerald-100 bg-emerald-50 text-emerald-800'
              }`}
            >
              {isRestricted ? <AlertTriangle size={18} className="mt-0.5 text-amber-500" /> : <Globe size={18} className="mt-0.5 text-emerald-500" />}
              <div className="text-xs">
                <p className="font-bold">Attendance Apply Type: {isRestricted ? 'From Office' : 'From Anywhere'}</p>
                <p className="mt-1 opacity-90">
                  {isRestricted
                    ? 'You must be within your assigned office branch radius to submit attendance.'
                    : 'You may check in from any location.'}
                </p>
              </div>
            </div>

            {needsGps && office && (
              <div className="space-y-3 rounded-2xl border border-gray-100 bg-gray-50 p-4 text-xs">
                <div className="flex items-center justify-between">
                  <label className="font-bold uppercase tracking-wider text-gray-500">Office Location</label>
                  <button
                    type="button"
                    onClick={() => void refreshLocationPreview()}
                    className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-[10px] font-bold text-gray-700"
                  >
                    Refresh GPS
                  </button>
                </div>
                <p className="font-semibold text-gray-800">
                  {office.officeName}
                  {office.branch ? ` · ${office.branch}` : ''}
                </p>
                <p className="font-mono text-[10px] text-gray-500">
                  Office: {office.latitude.toFixed(5)}, {office.longitude.toFixed(5)} · Radius {office.radiusMeters}m
                </p>
                {locating ? (
                  <p className="flex items-center gap-2 text-gray-500">
                    <Loader2 className="h-3 w-3 animate-spin" /> Detecting your location…
                  </p>
                ) : liveLocation ? (
                  <>
                    <p className="font-mono text-[10px] text-gray-600">
                      You: {liveLocation.latitude.toFixed(5)}, {liveLocation.longitude.toFixed(5)}
                      {liveLocation.gpsAccuracy != null ? ` · ±${Math.round(liveLocation.gpsAccuracy)}m` : ''}
                    </p>
                    <p
                      className={`font-bold ${withinRadius ? 'text-emerald-700' : 'text-rose-600'}`}
                    >
                      Distance: {distanceMeters != null ? `${Math.round(distanceMeters)} m` : '—'} —{' '}
                      {withinRadius ? 'Inside office radius' : 'Outside office radius'}
                    </p>
                  </>
                ) : (
                  <p className="text-rose-600">Location not detected. Enable GPS and refresh.</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">Attendance Type</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  { value: 'PRESENT', label: 'Present' },
                  { value: 'HALF_DAY', label: 'Half Day' },
                  { value: 'WORK_FROM_HOME', label: 'WFH' },
                  { value: 'LEAVE', label: 'Leave' },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setAttendanceType(item.value)}
                    className={`rounded-xl border py-3 px-2 text-sm font-semibold transition-all ${
                      attendanceType === item.value
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">Notes</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Work plan or reason..."
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:outline-emerald-500"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">Attachment (optional)</label>
              <input
                type="url"
                value={attachmentUrl}
                onChange={(e) => setAttachmentUrl(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm focus:outline-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || locating || (needsGps && !withinRadius)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-4 text-sm font-bold text-white shadow-md hover:bg-emerald-700 disabled:opacity-50"
            >
              {submitting || locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
              Save &amp; Continue
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
