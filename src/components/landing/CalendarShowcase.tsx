import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Award,
  Zap,
  Target,
  BarChart3,
  Flame,
  Eye,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const viewTabs = [
  { id: 'month', label: 'Month View' },
  { id: 'week', label: 'Week Planner' },
  { id: 'day', label: 'Daily Agenda' },
  { id: 'timeline', label: 'Timeline View' },
];

const eventCategories = [
  { label: 'NEW / PQL / QL / SQL Created', color: 'bg-blue-500 text-white', badgeBg: 'bg-blue-50 text-blue-800 border-blue-200' },
  { label: 'Stage Follow-Up Schedules', color: 'bg-amber-500 text-white', badgeBg: 'bg-amber-50 text-amber-800 border-amber-200' },
  { label: 'Opportunity & Negotiation', color: 'bg-purple-600 text-white', badgeBg: 'bg-purple-50 text-purple-800 border-purple-200' },
  { label: 'Closed Lead Created', color: 'bg-emerald-500 text-white', badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  { label: 'LOB Created & Follow-Up', color: 'bg-rose-500 text-white', badgeBg: 'bg-rose-50 text-rose-800 border-rose-200' },
  { label: 'Closed Lead Follow-Up', color: 'bg-slate-500 text-white', badgeBg: 'bg-slate-100 text-slate-700 border-slate-200' },
];

const mockCalendarDays = [
  { day: 26, isCurrentMonth: false, events: [] },
  { day: 27, isCurrentMonth: false, events: [] },
  { day: 28, isCurrentMonth: false, events: [] },
  { day: 29, isCurrentMonth: false, events: [] },
  { day: 30, isCurrentMonth: false, events: [] },
  { day: 31, isCurrentMonth: false, events: [] },
  { day: 1, isCurrentMonth: true, events: [{ title: 'NEW Created', type: 'blue' }] },
  { day: 2, isCurrentMonth: true, events: [] },
  { day: 3, isCurrentMonth: true, events: [{ title: 'NEW Follow-Up', type: 'orange' }] },
  { day: 4, isCurrentMonth: true, events: [] },
  { day: 5, isCurrentMonth: true, events: [{ title: 'PQL Created', type: 'blue' }] },
  { day: 6, isCurrentMonth: true, events: [] },
  { day: 7, isCurrentMonth: true, events: [{ title: 'PQL Follow-Up', type: 'orange' }] },
  { day: 8, isCurrentMonth: true, events: [] },
  { day: 9, isCurrentMonth: true, events: [{ title: 'QL Created', type: 'blue' }] },
  { day: 10, isCurrentMonth: true, events: [] },
  { day: 11, isCurrentMonth: true, events: [{ title: 'QL Follow-Up', type: 'orange' }] },
  { day: 12, isCurrentMonth: true, events: [] },
  { day: 13, isCurrentMonth: true, events: [] },
  { day: 14, isCurrentMonth: true, events: [{ title: 'SQL Created', type: 'blue' }] },
  { day: 15, isCurrentMonth: true, events: [{ title: 'SQL Follow-Up', type: 'orange' }] },
  { day: 16, isCurrentMonth: true, events: [] },
  { day: 17, isCurrentMonth: true, events: [] },
  { day: 18, isCurrentMonth: true, events: [{ title: 'Opportunity Created', type: 'purple' }] },
  { day: 19, isCurrentMonth: true, events: [] },
  { day: 20, isCurrentMonth: true, events: [{ title: 'Opportunity Follow-Up', type: 'orange' }] },
  { day: 21, isCurrentMonth: true, events: [] },
  { day: 22, isCurrentMonth: true, events: [{ title: 'Proposal Follow-Up', type: 'purple' }] },
  { day: 23, isCurrentMonth: true, events: [] },
  { day: 24, isCurrentMonth: true, events: [{ title: 'Negotiation Follow-Up', type: 'purple' }] },
  { day: 25, isCurrentMonth: true, events: [] },
  { day: 26, isCurrentMonth: true, events: [{ title: 'LOB Created', type: 'red' }] },
  { day: 27, isCurrentMonth: true, events: [{ title: 'LOB Follow-Up', type: 'red' }] },
  { day: 28, isCurrentMonth: true, events: [{ title: 'Closed Created', type: 'green' }] },
  { day: 29, isCurrentMonth: true, events: [] },
  { day: 30, isCurrentMonth: true, events: [{ title: 'Closed Follow-Up', type: 'gray' }] },
];

const featureHighlights = [
  {
    icon: TimelineIcon,
    title: 'Real-Time Lead Operations',
    desc: 'Chronological Tracking Of Every Lead From Creation To Closure Across Complete Operational Lifecycle Stages.',
    color: 'emerald',
  },
  {
    icon: Clock,
    title: 'Follow-Up Timelines',
    desc: 'Automated Response Velocity Schedules Ensuring Timely Touchpoints For PQL, QL, SQL, And Opportunity Stages.',
    color: 'amber',
  },
  {
    icon: TrendingUp,
    title: 'Lead Stage Progress',
    desc: 'Full Operational Audit Visibility Into Pipeline Activities, Stage Transitions, And Loss-of-Business Logs.',
    color: 'indigo',
  },
  {
    icon: Eye,
    title: '3-Second Manager Audit',
    desc: 'Evaluate Operational CRM Calendar Activity, Sales Representative Discipline, And Follow-Up Consistency Instantly.',
    color: 'teal',
  },
  {
    icon: Award,
    title: 'Closed & LOB Lifecycle Tracking',
    desc: 'Monitor Closed Lead Conversions And Reason Logs For LOB (Loss of Business) Cases Directly On The Grid.',
    color: 'emerald',
  },
  {
    icon: Zap,
    title: 'Daily Action Agenda',
    desc: 'Prioritized Operational CRM View Giving Sales Advisors Instant Clarity On Urgent Lead Stage Progress.',
    color: 'blue',
  },
];

function TimelineIcon(props: React.SVGProps<SVGSVGElement>) {
  return <BarChart3 {...props} />;
}

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
            <span>Operational CRM Calendar</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-6">
            Real-Time Lead Operations &{' '}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent">
              Lead Lifecycle Tracking.
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            One Glance At The Operational CRM Calendar Instantly Reveals Follow-Up Timelines, Pipeline Activities, Lead Stage Progress, And Representative Discipline—From Creation To Closure.
          </p>
        </motion.div>

        {/* 3-Second Manager Evaluation Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto mb-12 bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 border border-emerald-500/30 shadow-xl relative overflow-hidden"
        >
          <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
            <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-400 shrink-0">
              <Eye className="w-8 h-8" />
            </div>
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-2 text-emerald-400 font-extrabold text-xs uppercase tracking-widest">
                <Flame className="w-4 h-4" />
                <span>3-Second Manager Operational Audit</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                Real-Time Lead Operations & Pipeline Activity Intelligence
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Operational CRM Calendar Provides Complete Lead Lifecycle Tracking. Audit Follow-Up Timelines, Lead Stage Progress, LOB Cases, And Closed Leads At A Single Glance Without Opening Multiple Static Reports.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Sales Categories Bar */}
        <div className="flex flex-wrap justify-center gap-2.5 mb-10">
          {eventCategories.map((cat) => (
            <div
              key={cat.label}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border shadow-sm ${cat.badgeBg}`}
            >
              <span className={`w-2 h-2 rounded-full ${cat.color}`} />
              <span>{cat.label}</span>
            </div>
          ))}
        </div>

        {/* Calendar Interactive Showcase Mockup Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="max-w-6xl mx-auto bg-slate-50/90 rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl relative mb-16"
        >
          {/* Header Bar */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Lead Operations Calendar — Pipeline Activities</h3>
                <p className="text-xs text-slate-500 font-medium">Real-Time Lead Operations, Follow-Up Timelines & Lead Stage Progress Synchronization</p>
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
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Live Lead Sync
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
                    className={`min-h-[68px] p-1.5 rounded-xl border flex flex-col justify-between transition-all hover:border-emerald-500/40 hover:shadow-sm ${
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
                          ev.type === 'green'
                            ? 'bg-emerald-500 text-white'
                            : ev.type === 'blue'
                            ? 'bg-blue-500 text-white'
                            : ev.type === 'orange'
                            ? 'bg-amber-500 text-white'
                            : ev.type === 'purple'
                            ? 'bg-purple-600 text-white'
                            : ev.type === 'red'
                            ? 'bg-rose-500 text-white'
                            : 'bg-slate-500 text-white'
                        }`}
                      >
                        {ev.title}
                      </motion.div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Upcoming Sales Activity Sidebar */}
            <div className="lg:col-span-4 space-y-4">
              {/* 3-Second Performance Radar Card */}
              <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-emerald-400" />
                    <span>Representative Activity Radar</span>
                  </span>
                  <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    3-Sec Audit
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                    <span className="text-[10px] text-slate-400 block font-semibold">Today's New Leads</span>
                    <span className="text-sm font-black text-blue-400">18 Leads</span>
                  </div>
                  <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                    <span className="text-[10px] text-slate-400 block font-semibold">Pending Follow-Ups</span>
                    <span className="text-sm font-black text-amber-400">24 Active</span>
                  </div>
                  <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                    <span className="text-[10px] text-slate-400 block font-semibold">PQL & QL Count</span>
                    <span className="text-sm font-black text-teal-300">14 Qualified</span>
                  </div>
                  <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                    <span className="text-[10px] text-slate-400 block font-semibold">Closed & LOB Cases</span>
                    <span className="text-sm font-black text-emerald-400">9 Processed</span>
                  </div>
                </div>
              </div>

              {/* Today's Sales Agenda */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    <span>Today's Lead Agenda</span>
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    4 Actionable
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 space-y-1">
                    <div className="flex justify-between text-xs font-bold text-amber-900">
                      <span>PQL Follow-Up</span>
                      <span className="text-[10px] bg-amber-600 text-white px-1.5 py-0.5 rounded uppercase font-semibold">
                        DUE TODAY
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-700 font-medium">Response Due Today</p>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 space-y-1">
                    <div className="flex justify-between text-xs font-bold text-blue-900">
                      <span>QL Created</span>
                      <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded uppercase font-semibold">
                        READY
                      </span>
                    </div>
                    <p className="text-[11px] text-blue-700 font-medium">Ready For Qualification</p>
                  </div>

                  <div className="bg-purple-50 p-3 rounded-xl border border-purple-200 space-y-1">
                    <div className="flex justify-between text-xs font-bold text-purple-900">
                      <span>Proposal Follow-Up</span>
                      <span className="text-[10px] bg-purple-600 text-white px-1.5 py-0.5 rounded uppercase font-semibold">
                        AWAITING
                      </span>
                    </div>
                    <p className="text-[11px] text-purple-700 font-medium">Awaiting Customer Decision</p>
                  </div>

                  <div className="bg-rose-50 p-3 rounded-xl border border-rose-200 space-y-1">
                    <div className="flex justify-between text-xs font-bold text-rose-900">
                      <span>LOB Created</span>
                      <span className="text-[10px] bg-rose-600 text-white px-1.5 py-0.5 rounded uppercase font-semibold">
                        REASON LOGGED
                      </span>
                    </div>
                    <p className="text-[11px] text-rose-700 font-medium">Reason Recorded</p>
                  </div>
                </div>
              </div>

              {/* Ecosystem Integration Banner */}
              <div className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white rounded-2xl p-5 border border-emerald-500/30 space-y-3 shadow-lg">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-widest">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Lead Operations Control</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  Real-Time Lead Operations connect seamlessly with Lead Stage Progress, Follow-Up Timelines, and Pipeline Activities.
                </p>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 pt-1"
                >
                  <span>Launch Operational CRM Calendar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Feature Highlights Grid (6 Cards) */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {featureHighlights.map((feat, idx) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08 }}
              className="bg-slate-50/80 rounded-2xl p-6 border border-slate-200 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-white border border-slate-200 text-emerald-600 w-fit group-hover:scale-110 group-hover:bg-emerald-50 transition-all shadow-sm">
                  <feat.icon className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {feat.title}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {feat.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CalendarShowcase;
