import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  Users,
  MapPin,
  Building2,
  Bell,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  ArrowRight,
  ShieldCheck,
  Video,
  FileCheck,
  AlertCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const viewTabs = [
  { id: 'month', label: 'Month View' },
  { id: 'week', label: 'Week Planner' },
  { id: 'day', label: 'Daily Agenda' },
  { id: 'timeline', label: 'Timeline View' },
];

const eventCategories = [
  { label: 'Mandatory Follow-ups', color: 'bg-emerald-500 text-white', badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  { label: 'Client Meetings & Demos', color: 'bg-blue-500 text-white', badgeBg: 'bg-blue-50 text-blue-800 border-blue-200' },
  { label: 'Customer Site Visits', color: 'bg-amber-500 text-white', badgeBg: 'bg-amber-50 text-amber-800 border-amber-200' },
  { label: 'Target Cycle Milestones', color: 'bg-purple-500 text-white', badgeBg: 'bg-purple-50 text-purple-800 border-purple-200' },
  { label: 'Attendance & Shifts', color: 'bg-indigo-500 text-white', badgeBg: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
];

const mockCalendarDays = [
  { day: 26, isCurrentMonth: false, events: [] },
  { day: 27, isCurrentMonth: false, events: [] },
  { day: 28, isCurrentMonth: false, events: [] },
  { day: 29, isCurrentMonth: false, events: [] },
  { day: 30, isCurrentMonth: false, events: [] },
  { day: 31, isCurrentMonth: false, events: [] },
  { day: 1, isCurrentMonth: true, events: [{ title: 'Monthly Target Start', cat: 'Target Cycle Milestones', type: 'purple' }] },
  { day: 2, isCurrentMonth: true, events: [] },
  { day: 3, isCurrentMonth: true, events: [{ title: 'AcroTech SLA Follow-up', cat: 'Mandatory Follow-ups', type: 'emerald' }] },
  { day: 4, isCurrentMonth: true, events: [] },
  { day: 5, isCurrentMonth: true, events: [{ title: 'Site Inspection - HQ', cat: 'Customer Site Visits', type: 'amber' }] },
  { day: 6, isCurrentMonth: true, events: [] },
  { day: 7, isCurrentMonth: true, events: [] },
  { day: 8, isCurrentMonth: true, events: [] },
  { day: 9, isCurrentMonth: true, events: [{ title: 'Enterprise Product Demo', cat: 'Client Meetings & Demos', type: 'blue' }] },
  { day: 10, isCurrentMonth: true, events: [] },
  { day: 11, isCurrentMonth: true, events: [{ title: 'Shift Roster - Morning', cat: 'Attendance & Shifts', type: 'indigo' }] },
  { day: 12, isCurrentMonth: true, events: [] },
  { day: 13, isCurrentMonth: true, events: [] },
  { day: 14, isCurrentMonth: true, events: [{ title: 'Advance Payment Due', cat: 'Mandatory Follow-ups', type: 'emerald' }] },
  { day: 15, isCurrentMonth: true, events: [{ title: 'Mid-Month Review', cat: 'Target Cycle Milestones', type: 'purple' }] },
  { day: 16, isCurrentMonth: true, events: [] },
  { day: 17, isCurrentMonth: true, events: [] },
  { day: 18, isCurrentMonth: true, events: [{ title: 'Financial Audit Meeting', cat: 'Client Meetings & Demos', type: 'blue' }] },
  { day: 19, isCurrentMonth: true, events: [] },
  { day: 20, isCurrentMonth: true, events: [{ title: 'Branch Site Visit', cat: 'Customer Site Visits', type: 'amber' }] },
  { day: 21, isCurrentMonth: true, events: [] },
  { day: 22, isCurrentMonth: true, events: [] },
  { day: 23, isCurrentMonth: true, events: [] },
  { day: 24, isCurrentMonth: true, events: [{ title: 'Mandatory SLA Deadline', cat: 'Mandatory Follow-ups', type: 'emerald' }] },
  { day: 25, isCurrentMonth: true, events: [] },
  { day: 26, isCurrentMonth: true, events: [{ title: 'Roster Shift Check-in', cat: 'Attendance & Shifts', type: 'indigo' }] },
  { day: 27, isCurrentMonth: true, events: [] },
  { day: 28, isCurrentMonth: true, events: [{ title: 'Cycle Lock Evaluation', cat: 'Target Cycle Milestones', type: 'purple' }] },
  { day: 29, isCurrentMonth: true, events: [] },
  { day: 30, isCurrentMonth: true, events: [] },
];

const CalendarShowcase: React.FC = () => {
  const [activeTabId, setActiveTabId] = useState('month');

  return (
    <section id="calendar" className="py-24 lg:py-36 bg-white text-slate-900 relative overflow-hidden">
      {/* Background Soft Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-100/50 via-transparent to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-widest mb-4 shadow-sm">
            <CalendarIcon className="w-4 h-4 text-emerald-600" />
            <span>Unified Operations Calendar</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-6">
            One Intelligent Command Center for{' '}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent">
              Every Operational Event.
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Unify lead follow-ups, client meetings, site visits, shift rosters, target milestones, and leave schedules in a single enterprise operations calendar.
          </p>
        </motion.div>

        {/* Categories Bar */}
        <div className="flex flex-wrap justify-center gap-2.5 mb-10">
          {eventCategories.map((cat) => (
            <div
              key={cat.label}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border shadow-sm ${cat.badgeBg}`}
            >
              <span className={`w-2 h-2 rounded-full ${cat.color}`} />
              <span>{cat.label}</span>
            </div>
          ))}
        </div>

        {/* Calendar Interactive Dashboard Mockup Card */}
        <div className="max-w-6xl mx-auto bg-slate-50/90 rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl relative">
          {/* Header Bar */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Operations Calendar — October 2026</h3>
                <p className="text-xs text-slate-500 font-medium">Enterprise Synchronization & SLA Follow-up Engine</p>
              </div>
            </div>

            {/* View Mode Tabs */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
              {viewTabs.map((tab) => {
                const isSelected = tab.id === activeTabId;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTabId(tab.id)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Calendar Showcase Grid & Sidebar Container */}
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Grid / Agenda Mockup */}
            <div className="lg:col-span-8 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              {/* Calendar Month Navigation Header */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">October 2026</span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Live Sync
                  </span>
                </div>
                <div className="flex items-center gap-1 text-slate-500">
                  <button className="p-1 hover:bg-slate-100 rounded-md border border-slate-200">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button className="p-1 hover:bg-slate-100 rounded-md border border-slate-200">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Day Name Header */}
              <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
                <div>Sun</div>
              </div>

              {/* Calendar Grid Cells */}
              <div className="grid grid-cols-7 gap-1.5 text-xs">
                {mockCalendarDays.map((cell, idx) => (
                  <div
                    key={idx}
                    className={`min-h-[64px] p-1.5 rounded-xl border flex flex-col justify-between transition-all hover:border-emerald-500/40 hover:shadow-sm ${
                      cell.isCurrentMonth
                        ? 'bg-slate-50/50 border-slate-200 text-slate-800'
                        : 'bg-slate-100/40 border-slate-100 text-slate-400'
                    }`}
                  >
                    <span className="font-bold text-[11px] leading-none">{cell.day}</span>
                    {cell.events.map((ev, eIdx) => (
                      <motion.div
                        key={eIdx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded leading-tight truncate ${
                          ev.type === 'emerald'
                            ? 'bg-emerald-500 text-white'
                            : ev.type === 'blue'
                            ? 'bg-blue-500 text-white'
                            : ev.type === 'amber'
                            ? 'bg-amber-500 text-white'
                            : ev.type === 'indigo'
                            ? 'bg-indigo-500 text-white'
                            : 'bg-purple-500 text-white'
                        }`}
                      >
                        {ev.title}
                      </motion.div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Upcoming Operational Events Sidebar */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    <span>Today's Active Schedule</span>
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    3 Due
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 space-y-1">
                    <div className="flex justify-between text-xs font-bold text-emerald-900">
                      <span>AcroTech Enterprise Call</span>
                      <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded uppercase">
                        SLA Due
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-700">Assigned: Rahul (15m SLA timer active)</p>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 space-y-1">
                    <div className="flex justify-between text-xs font-bold text-blue-900">
                      <span>Product Demo — Apex Group</span>
                      <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded uppercase">
                        02:30 PM
                      </span>
                    </div>
                    <p className="text-[11px] text-blue-700">Location: Virtual Conference Room</p>
                  </div>

                  <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 space-y-1">
                    <div className="flex justify-between text-xs font-bold text-amber-900">
                      <span>Client Site Inspection</span>
                      <span className="text-[10px] bg-amber-600 text-white px-1.5 py-0.5 rounded uppercase">
                        04:00 PM
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-700">Location: Financial District Office</p>
                  </div>
                </div>
              </div>

              {/* Ecosystem Integration Banner */}
              <div className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white rounded-2xl p-5 border border-emerald-500/30 space-y-3 shadow-lg">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-widest">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Full Ecosystem Sync</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  Connects seamlessly with Leads, SLA Follow-ups, Geo-Attendance, Target Cycles, Shift Rosters, and Approvals.
                </p>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 pt-1"
                >
                  <span>Launch Operations Calendar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CalendarShowcase;
