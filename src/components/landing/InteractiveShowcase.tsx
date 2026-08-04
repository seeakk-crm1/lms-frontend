import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock,
  CalendarCheck,
  MapPin,
  BarChart3,
  CheckCircle,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Building2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const showcaseTabs = [
  {
    id: 'target-locking',
    label: 'Target Locking Engine',
    icon: Lock,
    headline: 'Automatic Account Locking When Staff Miss Their Targets',
    desc: 'When Sales Representatives Fail To Meet Target Cycles Or Accumulate Overdue Mandatory Follow-Ups, Seeakk Automatically Locks Account Actions Until Supervisors Review And Unlock Them, Preventing Loss Of Business (LOB).',
    previewType: 'lock',
  },
  {
    id: 'followups',
    label: 'Smart Response Rules',
    icon: CalendarCheck,
    headline: 'Zero Lead Abandonment With Mandatory Follow-Up Gates',
    desc: 'Mandatory Follow-Up Reminders Enforce Strict Response Clocks. Reps Cannot Browse Away Or Skip Scheduling Without Completing Active Lead Follow-Up Notes.',
    previewType: 'followup',
  },
  {
    id: 'attendance',
    label: 'Geo-Attendance & Roster',
    icon: MapPin,
    headline: 'Office Geofenced Attendance & Shift Roster Control',
    desc: 'Verify Field And Office Staff Attendance With GPS Geofencing, Office IP Locks, Shift Rosters, And Supervisor Approval Gates.',
    previewType: 'attendance',
  },
  {
    id: 'analytics',
    label: 'Loss Of Business (LOB) Analytics',
    icon: BarChart3,
    headline: 'Real-Time Branch Performance & Loss Of Business (LOB) Tracking',
    desc: 'Compare Branch Performance, Loss Of Business (LOB) Conversion Velocity, Employee Attendance, And Revenue Totals From An Executive Dashboard.',
    previewType: 'analytics',
  },
];

const InteractiveShowcase: React.FC = () => {
  const [activeTabId, setActiveTabId] = useState('target-locking');

  const activeTab = showcaseTabs.find((t) => t.id === activeTabId) || showcaseTabs[0];

  return (
    <section id="showcase" className="py-24 lg:py-36 bg-slate-50 text-slate-900 relative overflow-hidden">
      {/* Background Glow Overlays */}
      <div className="absolute top-1/3 left-0 w-[450px] h-[450px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-100/50 via-transparent to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-0 w-[450px] h-[450px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-teal-100/50 via-transparent to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-widest mb-4 shadow-sm">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Interactive Operational Tour</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-6">
            See How Seeakk Enforces{' '}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent">
              Daily Discipline.
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Experience The Core Workflow Engines That Eliminate Loss Of Business (LOB), Automate Target Accountability, And Give Leadership 100% Control.
          </p>
        </motion.div>

        {/* Tab Selection Navigation */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {showcaseTabs.map((tab) => {
            const isSelected = tab.id === activeTabId;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTabId(tab.id)}
                className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-300 ${
                  isSelected
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-500/20 border border-emerald-500 scale-105'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 shadow-sm'
                }`}
              >
                <tab.icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-emerald-600'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Live Interactive Preview Box */}
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200 shadow-2xl relative overflow-hidden"
            >
              {/* Top Meta Bar */}
              <div className="mb-8 pb-6 border-b border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">
                    Engine Module
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{activeTab.headline}</h3>
                </div>

                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold transition-all shadow-sm"
                >
                  <span>Launch Module</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Preview UI Mockup */}
              <div className="grid lg:grid-cols-12 gap-8 items-center">
                {/* Left Description */}
                <div className="lg:col-span-5 space-y-4">
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">{activeTab.desc}</p>

                  <div className="space-y-2.5 pt-2">
                    {[
                      'Automated Real-Time Background Evaluation',
                      'Role-Based Supervisor Override Workflow',
                      'Loss Of Business (LOB) Prevention Tracking',
                    ].map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-xs text-slate-700 font-semibold">
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Interactive Mockup */}
                <div className="lg:col-span-7 bg-slate-50 rounded-2xl p-5 border border-slate-200 relative overflow-hidden shadow-inner">
                  {/* Mockup Window Header */}
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 font-semibold">
                      seeakk.app / operational-control
                    </span>
                  </div>

                  {/* Render Mockup Content */}
                  {activeTab.previewType === 'lock' && (
                    <div className="space-y-3">
                      <div className="bg-red-50 p-4 rounded-xl border border-red-200 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-red-100 text-red-700 border border-red-200">
                            <Lock className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900">Staff Rep: Rahul Sharma</p>
                            <p className="text-[11px] text-red-700 font-semibold">Status: Enforced System Lock (3 Overdue Follow-Ups)</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-red-600 text-white uppercase shadow-sm">
                          Locked
                        </span>
                      </div>

                      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2 shadow-sm">
                        <p className="text-xs font-bold text-slate-800">Supervisor Unlock Request</p>
                        <p className="text-[11px] text-slate-600 font-mono">
                          Justification: "Target Extended By Regional Director. Follow-Up Calls Completed."
                        </p>
                        <div className="flex gap-2 pt-2">
                          <button className="px-3 py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-lg shadow-sm">
                            Approve Unlock
                          </button>
                          <button className="px-3 py-1.5 bg-slate-100 text-slate-700 font-semibold text-xs rounded-lg border border-slate-200">
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab.previewType === 'followup' && (
                    <div className="space-y-3">
                      <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200">
                            <Clock className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900">Lead: AcroTech Enterprise</p>
                            <p className="text-[11px] text-emerald-800 font-semibold">Response Time: 14 Mins Remaining</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-emerald-600 text-white uppercase shadow-sm">
                          Active Gate
                        </span>
                      </div>

                      <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between text-xs shadow-sm">
                        <span className="text-slate-700 font-semibold">WhatsApp Direct Contact Action:</span>
                        <span className="text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                          Template Message Ready →
                        </span>
                      </div>
                    </div>
                  )}

                  {activeTab.previewType === 'attendance' && (
                    <div className="space-y-3">
                      <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700 border border-blue-200">
                            <MapPin className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900">Office Geofence: HQ Building</p>
                            <p className="text-[11px] text-blue-800 font-semibold">Location Status: Verified (12m Accuracy)</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-blue-600 text-white uppercase shadow-sm">
                          Checked In
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                          <p className="text-[10px] text-slate-500 font-semibold">Shift Started</p>
                          <p className="font-bold text-slate-900 mt-0.5">09:00 AM Verified</p>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                          <p className="text-[10px] text-slate-500 font-semibold">Roster Status</p>
                          <p className="font-bold text-emerald-700 mt-0.5">On Schedule</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab.previewType === 'analytics' && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm text-center">
                          <p className="text-[10px] text-slate-500 font-semibold">Tracked Leads</p>
                          <p className="text-lg font-black text-slate-900 mt-0.5">14,820</p>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm text-center">
                          <p className="text-[10px] text-slate-500 font-semibold">LOB Prevention</p>
                          <p className="text-lg font-black text-emerald-600 mt-0.5">99.8%</p>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm text-center">
                          <p className="text-[10px] text-slate-500 font-semibold">Closed Revenue</p>
                          <p className="text-lg font-black text-teal-700 mt-0.5">$1.4M</p>
                        </div>
                      </div>

                      <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-xs flex items-center justify-between shadow-sm">
                        <span className="text-slate-800 font-semibold">Loss Of Business (LOB) Reduction:</span>
                        <span className="text-emerald-700 font-bold">-84% Lost Prospects</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default InteractiveShowcase;
