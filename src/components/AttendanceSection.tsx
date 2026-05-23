import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Globe2, MapPinned } from 'lucide-react';

const attendanceFeatures = [
  'GPS-based office validation',
  '100 meter branch radius control',
  'Mandatory daily check-in popup',
  'Supervisor approval workflow',
  'Attendance analytics',
  'Late tracking',
  'Pending approvals',
  'Attendance history',
  'Role-based permissions',
];

const AttendanceSection = () => {
  return (
    <section id="attendance" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-sm font-bold text-emerald-500 uppercase tracking-widest mb-3">
              Attendance + Accountability
            </p>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
              Smart attendance control
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              SEEAKK introduces enterprise-grade attendance intelligence so field teams and office staff
              follow the same rules—with supervisor oversight built in.
            </p>

            <ul className="grid sm:grid-cols-2 gap-3 mb-10">
              {attendanceFeatures.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm font-medium text-gray-600">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="space-y-4">
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5 flex gap-4">
                <Globe2 className="h-8 w-8 shrink-0 text-emerald-500" />
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">From Anywhere</h4>
                  <p className="text-sm text-gray-600">
                    Perfect for sales teams, field executives, and remote workers who need flexible check-in.
                  </p>
                </div>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5 flex gap-4">
                <Building2 className="h-8 w-8 shrink-0 text-emerald-600" />
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Office Only</h4>
                  <p className="text-sm text-gray-600">
                    Perfect for accounts, back-office staff, and office employees. Check-in only inside the
                    configured office radius.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute inset-0 bg-emerald-100 rounded-3xl blur-2xl opacity-40 scale-105" />
            <div className="relative rounded-3xl border border-gray-100 bg-white p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <MapPinned className="h-10 w-10 text-emerald-500" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Office radius</p>
                  <p className="text-lg font-black text-gray-900">100 meters validated</p>
                </div>
              </div>
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center border border-emerald-200/50">
                <div className="text-center p-6">
                  <div className="w-24 h-24 mx-auto rounded-full border-4 border-emerald-500/30 flex items-center justify-center mb-4">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <p className="text-sm font-bold text-emerald-700">GPS check-in active</p>
                  <p className="text-xs text-gray-500 mt-1">Within office boundary</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AttendanceSection;
