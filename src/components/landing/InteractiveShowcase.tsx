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
  User,
  Building2,
  ChevronRight,
  TrendingUp,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const showcaseTabs = [
  {
    id: 'target-locking',
    label: 'Target Locking Engine',
    icon: Lock,
    headline: 'Automatic Staff Locking when Targets or Follow-ups Miss SLA',
    desc: 'When sales representatives fail to meet weekly target cycles or accumulate overdue mandatory follow-ups, Seeakk automatically locks CRM actions until supervisors review and unlock them.',
    previewType: 'lock',
  },
  {
    id: 'followups',
    label: 'Smart Follow-up SLA',
    icon: CalendarCheck,
    headline: 'Zero Lead Abandonment with Mandatory Follow-up Gates',
    desc: 'Mandatory follow-up reminders enforce strict response clocks. Reps cannot browse away or skip scheduling without completing active lead follow-up notes.',
    previewType: 'followup',
  },
  {
    id: 'attendance',
    label: 'Geo-Attendance & Roster',
    icon: MapPin,
    headline: 'Office Geofenced Attendance & Shift Roster Control',
    desc: 'Verify field and office staff attendance with GPS geofencing, office IP locks, shift rosters, and supervisor approval gates.',
    previewType: 'attendance',
  },
  {
    id: 'analytics',
    label: 'Multi-Office Analytics',
    icon: BarChart3,
    headline: 'Real-time Branch Performance & LOB Revenue Visibility',
    desc: 'Compare branch performance, line of business conversion velocity, employee attendance, and revenue totals from an executive dashboard.',
    previewType: 'analytics',
  },
];

const InteractiveShowcase: React.FC = () => {
  const [activeTabId, setActiveTabId] = useState('target-locking');

  const activeTab = showcaseTabs.find((t) => t.id === activeTabId) || showcaseTabs[0];

  return (
    <section id="showcase" className="py-24 lg:py-36 bg-gray-900 text-white relative overflow-hidden">
      {/* Ambient background blur circles */}
      <div className="absolute top-1/3 left-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-teal-500/10 via-transparent to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Interactive Operational Tour</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-6">
            See How Seeakk Enforces{' '}
            <span className="bg-gradient-to-r from-emerald-300 via-emerald-400 to-teal-200 bg-clip-text text-transparent">
              Daily Discipline.
            </span>
          </h2>

          <p className="text-base sm:text-lg text-gray-400 leading-relaxed">
            Experience the core workflow engines that eliminate lead leakage, automate target accountability, and give leadership 100% control.
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
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-500/25 border border-emerald-400/40 scale-105'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
              >
                <tab.icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-emerald-400'}`} />
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
              className="bg-gray-950 rounded-3xl p-6 sm:p-10 border border-white/10 shadow-2xl relative overflow-hidden"
            >
              {/* Top Meta Info Bar */}
              <div className="mb-8 pb-6 border-b border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                    Engine Module
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white mt-1">{activeTab.headline}</h3>
                </div>

                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 text-xs font-bold transition-all"
                >
                  <span>Launch Module</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Dynamic Preview UI Mockup */}
              <div className="grid lg:grid-cols-12 gap-8 items-center">
                {/* Left Description Column */}
                <div className="lg:col-span-5 space-y-4">
                  <p className="text-sm text-gray-300 leading-relaxed">{activeTab.desc}</p>

                  <div className="space-y-2.5 pt-2">
                    {[
                      'Automated real-time background evaluation',
                      'Role-based supervisor override workflow',
                      'Complete immutable activity audit logs',
                    ].map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-xs text-gray-400">
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Interactive Mockup Container */}
                <div className="lg:col-span-7 bg-gray-900 rounded-2xl p-5 border border-white/10 relative overflow-hidden">
                  {/* Mockup Top Window Header */}
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                    </div>
                    <span className="text-[10px] font-mono text-gray-500">
                      seeakk.app / operational-control
                    </span>
                  </div>

                  {/* Render Mockup Content based on Preview Type */}
                  {activeTab.previewType === 'lock' && (
                    <div className="space-y-3">
                      <div className="bg-red-950/40 p-4 rounded-xl border border-red-500/30 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
                            <Lock className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white">Staff Member: Rahul Sharma</p>
                            <p className="text-[11px] text-red-300">Status: Enforced System Lock (3 Overdue Follow-ups)</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-red-500 text-gray-950 uppercase">
                          Locked
                        </span>
                      </div>

                      <div className="bg-gray-950 p-4 rounded-xl border border-white/10 space-y-2">
                        <p className="text-xs font-semibold text-gray-300">Supervisor Unlock Request</p>
                        <p className="text-[11px] text-gray-400">
                          Justification: "Target extended by Regional Director. Follow-up calls completed."
                        </p>
                        <div className="flex gap-2 pt-2">
                          <button className="px-3 py-1.5 bg-emerald-500 text-gray-950 font-bold text-xs rounded-lg">
                            Approve Unlock
                          </button>
                          <button className="px-3 py-1.5 bg-white/5 text-gray-300 font-semibold text-xs rounded-lg border border-white/10">
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab.previewType === 'followup' && (
                    <div className="space-y-3">
                      <div className="bg-emerald-950/40 p-4 rounded-xl border border-emerald-500/30 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            <Clock className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white">Lead: AcroTech Enterprise</p>
                            <p className="text-[11px] text-emerald-300">Follow-up SLA: 14 Mins Remaining</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-emerald-500 text-gray-950 uppercase">
                          Active Gate
                        </span>
                      </div>

                      <div className="bg-gray-950 p-4 rounded-xl border border-white/10 flex items-center justify-between text-xs">
                        <span className="text-gray-300 font-medium">WhatsApp Direct Action:</span>
                        <span className="text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                          Template Message Ready →
                        </span>
                      </div>
                    </div>
                  )}

                  {activeTab.previewType === 'attendance' && (
                    <div className="space-y-3">
                      <div className="bg-blue-950/40 p-4 rounded-xl border border-blue-500/30 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                            <MapPin className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white">Office Geofence: HQ Building</p>
                            <p className="text-[11px] text-blue-300">Location Status: Verified (12m Accuracy)</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-blue-500 text-white uppercase">
                          Checked In
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-gray-950 p-3 rounded-xl border border-white/10">
                          <p className="text-[10px] text-gray-400">Shift Started</p>
                          <p className="font-bold text-white mt-0.5">09:00 AM Verified</p>
                        </div>
                        <div className="bg-gray-950 p-3 rounded-xl border border-white/10">
                          <p className="text-[10px] text-gray-400">Roster Status</p>
                          <p className="font-bold text-emerald-400 mt-0.5">On Schedule</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab.previewType === 'analytics' && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-gray-950 p-3 rounded-xl border border-white/10 text-center">
                          <p className="text-[10px] text-gray-400">Total Leads</p>
                          <p className="text-lg font-black text-white mt-0.5">14,820</p>
                        </div>
                        <div className="bg-gray-950 p-3 rounded-xl border border-white/10 text-center">
                          <p className="text-[10px] text-gray-400">Recovery Rate</p>
                          <p className="text-lg font-black text-emerald-400 mt-0.5">99.8%</p>
                        </div>
                        <div className="bg-gray-950 p-3 rounded-xl border border-white/10 text-center">
                          <p className="text-[10px] text-gray-400">Closed Revenue</p>
                          <p className="text-lg font-black text-teal-300 mt-0.5">$1.4M</p>
                        </div>
                      </div>

                      <div className="bg-emerald-950/20 p-3 rounded-xl border border-emerald-500/20 text-xs flex items-center justify-between">
                        <span className="text-gray-300">Line of Business: Financial Services</span>
                        <span className="text-emerald-400 font-bold">+34% vs Last Month</span>
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
