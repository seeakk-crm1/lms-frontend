import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, CheckCircle2, AlertTriangle, Wifi, Globe, MapPin, FileText } from 'lucide-react';
import { getTodayStatus, markAttendance } from '../services/attendance.api';
import useAuthStore from '../store/useAuthStore';
import toast from 'react-hot-toast';

interface MandatoryAttendanceModalProps {
  onSuccess?: () => void;
}

export const MandatoryAttendanceModal: React.FC<MandatoryAttendanceModalProps> = ({ onSuccess }) => {
  const { isAuthenticated, user } = useAuthStore();
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [attendanceType, setAttendanceType] = useState('PRESENT');
  const [notes, setNotes] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  
  // Simulated connection parameter fields for strict network checking
  const [wifiSsid, setWifiSsid] = useState('MISSION 2050-2G');
  const [routerIp, setRouterIp] = useState('192.168.220.1');
  const [deviceIp, setDeviceIp] = useState('192.168.220.105');
  const [subnet, setSubnet] = useState('255.255.255.0');
  const [networkPreset, setNetworkPreset] = useState('office'); // 'office', 'home', 'mobile'

  const checkStatus = async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const res = await getTodayStatus();
      if (res.success) {
        setStatus(res.data);
      }
    } catch (err) {
      console.error('Failed to get today status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, [isAuthenticated]);

  // Prevent closing on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Update mock simulation presets
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

  if (!isAuthenticated || loading || !status) return null;

  // Do not show modal if already checked in or today is holiday
  if (status.isMarked || status.isHoliday) return null;

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
        geoLocation: 'Simulated Location HQ',
        notes,
        attachmentUrl,
      });

      if (response.success) {
        toast.success(
          response.data.status === 'PENDING'
            ? 'Attendance request submitted for supervisor approval.'
            : 'Attendance marked successfully.'
        );
        setStatus({ ...status, isMarked: true });
        onSuccess?.();
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to submit attendance.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const isRestricted = status.attendanceApplyType === 'FROM_OFFICE';

  return (
    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-md flex items-center justify-center z-[9999] select-none p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100"
      >
        {/* Top Accent Header */}
        <div className="bg-emerald-600 px-8 py-6 text-white relative">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Wifi size={120} />
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 rounded-2xl">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-wide">Daily Check-in Required</h2>
              <p className="text-emerald-100 text-xs mt-1">Please log your work status before proceeding to the system.</p>
            </div>
          </div>
        </div>

        {/* Lock Screen Mode */}
        {status.isLocked ? (
          <div className="p-8 text-center flex flex-col items-center">
            <div className="p-5 bg-rose-50 text-rose-500 rounded-full mb-4">
              <ShieldAlert size={48} className="animate-bounce" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Your Account is Locked</h3>
            <p className="text-sm text-gray-500 max-w-md mt-2">
              Your account has been temporarily locked due to incomplete targets or late check-in warning compliance rules.
            </p>
            <div className="mt-6 p-4 bg-gray-50 rounded-2xl w-full border border-gray-100 text-left text-xs text-gray-600">
              <p className="font-bold text-gray-700">Next Steps:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Contact your manager/supervisor for verification.</li>
                <li>Request an administrative target lock override.</li>
              </ul>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Info Message */}
            <div className={`p-4 rounded-2xl flex items-start gap-3 border ${
              isRestricted ? 'bg-amber-50/70 border-amber-100 text-amber-800' : 'bg-emerald-50/50 border-emerald-100 text-emerald-800'
            }`}>
              <div className="mt-0.5">
                {isRestricted ? <AlertTriangle size={18} className="text-amber-500" /> : <Globe size={18} className="text-emerald-500" />}
              </div>
              <div className="text-xs">
                <p className="font-bold">Attendance Restriction: {isRestricted ? 'Office Network Only' : 'From Anywhere'}</p>
                <p className="opacity-90 mt-1">
                  {isRestricted
                    ? 'You must connect to the approved office network (SSID: MISSION 2050-2G, Router IP: 192.168.220.1) to complete check-in.'
                    : 'You can check in using any network, mobile connection, or external WiFi.'}
                </p>
              </div>
            </div>

            {/* Attendance Type Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Attendance Status</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                    className={`py-3 px-4 rounded-xl border text-sm font-semibold transition-all duration-200 text-center ${
                      attendanceType === item.value
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Network presets (For testing network restrictions) */}
            {isRestricted && (
              <div className="space-y-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Simulate Connection</label>
                  <div className="flex gap-1.5">
                    {['office', 'home', 'mobile'].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => handlePresetChange(p)}
                        className={`px-2.5 py-1 text-[10px] rounded-lg font-bold border transition-colors ${
                          networkPreset === p
                            ? 'bg-gray-900 text-white border-gray-900'
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {p.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-gray-400 block mb-1">SSID</label>
                    <input
                      type="text"
                      value={wifiSsid}
                      onChange={(e) => setWifiSsid(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5 font-mono text-[11px] focus:outline-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1">Router IP</label>
                    <input
                      type="text"
                      value={routerIp}
                      onChange={(e) => setRouterIp(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5 font-mono text-[11px] focus:outline-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1">Device IP</label>
                    <input
                      type="text"
                      value={deviceIp}
                      onChange={(e) => setDeviceIp(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5 font-mono text-[11px] focus:outline-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1">Subnet</label>
                    <input
                      type="text"
                      value={subnet}
                      onChange={(e) => setSubnet(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5 font-mono text-[11px] focus:outline-emerald-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Notes & Attachments */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Notes / Reason</label>
                <div className="relative">
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter details about your work plan today..."
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-emerald-500 text-gray-700 placeholder:text-gray-400"
                  />
                  <div className="absolute right-3 bottom-3 text-gray-300">
                    <FileText size={16} />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Attachment Link (Optional)</label>
                <div className="relative">
                  <input
                    type="url"
                    value={attachmentUrl}
                    onChange={(e) => setAttachmentUrl(e.target.value)}
                    placeholder="https://example.com/document.pdf"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-emerald-500 text-gray-700 placeholder:text-gray-400"
                  />
                  <div className="absolute right-3 top-3 text-gray-300">
                    <MapPin size={16} />
                  </div>
                </div>
              </div>
            </div>

            {/* Check-in Action Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl transition-colors duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Submitting request...</span>
                </>
              ) : (
                <span>Mark Attendance</span>
              )}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};
