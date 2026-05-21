import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle, Wifi, Globe, MapPin, FileText, Loader2 } from 'lucide-react';
import { markAttendance } from '../services/attendance.api';
import { dispatchAttendanceRefresh } from '../utils/attendanceRefresh';
import toast from 'react-hot-toast';

interface MandatoryAttendanceModalProps {
  status: {
    date: string;
    isLocked?: boolean;
    attendanceApplyType?: string;
    record?: any;
  };
  onSuccess?: () => void;
}

export const MandatoryAttendanceModal: React.FC<MandatoryAttendanceModalProps> = ({ status, onSuccess }) => {
  const [submitting, setSubmitting] = useState(false);

  const [attendanceType, setAttendanceType] = useState('PRESENT');
  const [notes, setNotes] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');

  const [wifiSsid, setWifiSsid] = useState('MISSION 2050-2G');
  const [routerIp, setRouterIp] = useState('192.168.220.1');
  const [deviceIp, setDeviceIp] = useState('192.168.220.105');
  const [subnet, setSubnet] = useState('255.255.255.0');
  const [networkPreset, setNetworkPreset] = useState('office');

  const handlePresetChange = (preset: string) => {
    setNetworkPreset(preset);
    if (preset === 'office') {
      setWifiSsid('MISSION 2050-2G');
      setRouterIp('192.168.220.1');
      setDeviceIp('192.168.220.105');
      setSubnet('255.255.255.0');
    } else if (preset === 'home') {
      setWifiSsid('MyHome_WiFi_5G');
      setRouterIp('192.168.1.1');
      setDeviceIp('192.168.1.15');
      setSubnet('255.255.255.0');
    } else {
      setWifiSsid('Cellular Hotspot');
      setRouterIp('172.20.10.1');
      setDeviceIp('172.20.10.4');
      setSubnet('255.255.255.240');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await markAttendance({
        attendanceType,
        checkInTime: new Date().toISOString(),
        date: status.date,
        ipAddress: deviceIp,
        networkName: wifiSsid,
        routerIp,
        subnet,
        deviceInfo: navigator.userAgent,
        geoLocation: 'Office HQ',
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
      const detailHint =
        data?.errorCode === 'OFFICE_NETWORK_VALIDATION_FAILED' && data?.details?.expectedSsid
          ? ` Expected office WiFi: ${data.details.expectedSsid}, router: ${data.details.expectedRouterIp}.`
          : '';
      toast.error((data?.message || 'Failed to submit attendance.') + detailHint);
    } finally {
      setSubmitting(false);
    }
  };

  const isRestricted = status.attendanceApplyType === 'FROM_OFFICE';

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
                    ? 'Office network validation (SSID, router IP, subnet) is required before submission.'
                    : 'You may check in from any network.'}
                </p>
                <p className="mt-2 font-mono text-[10px]">Device IP: {deviceIp}</p>
              </div>
            </div>

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

            {isRestricted && (
              <div className="space-y-3 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Network Validation</label>
                  <div className="flex gap-1.5">
                    {['office', 'home', 'mobile'].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => handlePresetChange(p)}
                        className={`rounded-lg border px-2.5 py-1 text-[10px] font-bold ${
                          networkPreset === p ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 bg-white text-gray-600'
                        }`}
                      >
                        {p.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="mb-1 block text-gray-400">SSID</label>
                    <input type="text" value={wifiSsid} onChange={(e) => setWifiSsid(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-1.5 font-mono text-[11px]" />
                  </div>
                  <div>
                    <label className="mb-1 block text-gray-400">Router IP</label>
                    <input type="text" value={routerIp} onChange={(e) => setRouterIp(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-1.5 font-mono text-[11px]" />
                  </div>
                  <div>
                    <label className="mb-1 block text-gray-400">Device IP</label>
                    <input type="text" value={deviceIp} onChange={(e) => setDeviceIp(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-1.5 font-mono text-[11px]" />
                  </div>
                  <div>
                    <label className="mb-1 block text-gray-400">Subnet</label>
                    <input type="text" value={subnet} onChange={(e) => setSubnet(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-1.5 font-mono text-[11px]" />
                  </div>
                </div>
              </div>
            )}

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
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-4 text-sm font-bold text-white shadow-md hover:bg-emerald-700 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Save &amp; Continue
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
