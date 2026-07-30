import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  ShieldCheck,
  Building2,
  Navigation,
  Clock,
  Compass,
  CheckCircle2,
  Users,
  Activity,
  Layers,
  ArrowRight,
  Eye,
  Globe,
  Radio,
  FileCheck,
  TrendingUp,
  Lock,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const mapTabs = [
  { id: 'live', label: 'Live Map View', icon: Radio },
  { id: 'timeline', label: 'Customer Visit Timeline', icon: Clock },
  { id: 'branches', label: 'Branch-Wise Field Visibility', icon: Building2 },
  { id: 'geofence', label: 'GPS Geofence Audit', icon: ShieldCheck },
];

const statisticsMetrics = [
  { value: '99.9%', label: 'Verified Location Accuracy', change: '+0.4% Vs Industry Avg' },
  { value: '250K+', label: 'Location Events Verified', change: 'Across All Workspaces' },
  { value: '50K+', label: 'Customer Visits Recorded', change: 'Audit-Trail Confirmed' },
  { value: '100%', label: 'Attendance Transparency', change: 'Zero Manual Overrides' },
];

const coreFeatureCards = [
  {
    title: 'Geo-Fenced Attendance',
    desc: 'Verify Employees Are Physically Present Within Approved Office Boundaries Before Check-In Or Check-Out.',
    icon: Compass,
    color: 'emerald',
    badge: 'Boundary Control',
  },
  {
    title: 'Live Visit Verification',
    desc: 'Confirm That Field Representatives Actually Visited Customer Locations Before Marking Follow-Ups Or Opportunities As Completed.',
    icon: CheckCircle2,
    color: 'teal',
    badge: 'Real-Time Audit',
  },
  {
    title: 'Customer Visit Timeline',
    desc: 'Every Location Event Becomes Part Of The Lead Accountability History, Providing A Complete Timeline Of Customer Engagement.',
    icon: Clock,
    color: 'blue',
    badge: 'Lead History',
  },
  {
    title: 'Interactive Location History',
    desc: 'Managers Can Review Historical Visit Locations, Timestamps, And Movement History Directly From The Platform.',
    icon: Navigation,
    color: 'indigo',
    badge: 'Playback Analytics',
  },
  {
    title: 'Office Boundary Protection',
    desc: 'Prevent Attendance Fraud Using Configurable Office Geofences And Location Validation.',
    icon: ShieldCheck,
    color: 'emerald',
    badge: 'Fraud Shield',
  },
  {
    title: 'Branch-Wise Field Visibility',
    desc: 'Regional Managers Can Instantly Understand Where Their Teams Are Operating Across All Branches And Office Locations.',
    icon: Building2,
    color: 'purple',
    badge: 'Multi-Branch',
  },
  {
    title: 'GPS Verification',
    desc: 'Validate Attendance And Field Activities Using GPS Coordinates With Configurable Accuracy Thresholds.',
    icon: Radio,
    color: 'amber',
    badge: 'High Precision',
  },
  {
    title: 'Accountability Timeline',
    desc: 'Location Events Automatically Become Part Of The Lead Accountability Chain, Making Every Important Customer Interaction Fully Auditable.',
    icon: FileCheck,
    color: 'teal',
    badge: 'Chain Of Custody',
  },
];

const businessBenefitsList = [
  'Reduce Attendance Fraud',
  'Verify Real Customer Visits',
  'Improve Field Accountability',
  'Track Branch Activity In Real Time',
  'Increase Operational Transparency',
  'Strengthen Customer Visit Verification',
  'Support Enterprise Audit Requirements',
  'Prevent False Attendance Records',
  'Improve Manager Visibility',
  'Create Complete Lead Accountability',
];

const mockMapNodes = [
  {
    id: 1,
    title: 'Calicut HQ Office',
    type: 'OFFICE',
    x: '25%',
    y: '35%',
    status: 'Verified Geofence',
    activeUsers: '14 Active Staff',
    color: 'emerald',
  },
  {
    id: 2,
    title: 'Kochi Regional Branch',
    type: 'BRANCH',
    x: '70%',
    y: '28%',
    status: 'Verified Branch',
    activeUsers: '9 Field Execs',
    color: 'teal',
  },
  {
    id: 3,
    title: 'Acme Corp — Lead #8429',
    type: 'VISIT',
    x: '45%',
    y: '58%',
    status: 'Customer Meeting Verified',
    time: '11:42 AM',
    color: 'amber',
  },
  {
    id: 4,
    title: 'Apex Systems — Lead #8430',
    type: 'VISIT',
    x: '82%',
    y: '65%',
    status: 'Check-In Confirmed',
    time: '02:15 PM',
    color: 'indigo',
  },
];

const LiveLocationIntelligence: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('live');

  return (
    <section className="py-24 bg-gradient-to-b from-white via-slate-50/50 to-white relative overflow-hidden">
      {/* Background Decorative Glow Blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-tr from-emerald-500/10 via-teal-500/5 to-emerald-400/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-4xl mx-auto space-y-5">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-black uppercase tracking-widest shadow-xs"
          >
            <Radio size={14} className="text-emerald-600 animate-pulse" />
            <span>Live Location Intelligence</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight"
          >
            Know Where Business Happens
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg sm:text-xl font-extrabold text-emerald-700 max-w-3xl mx-auto"
          >
            Real-Time Location Verification That Builds Accountability Across Every Branch, Every Visit, And Every Lead.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl mx-auto font-medium"
          >
            Seeakk Securely Records Location Events During Approved Business Activities Such As Check-Ins, Check-Outs, Customer Visits, Follow-Ups, And Field Operations. Managers Gain Instant Visibility Into Field Performance While Maintaining Complete Operational Transparency Across Every Office And Branch.
          </motion.p>
        </div>

        {/* Dynamic Interactive SaaS Map Illustration Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl p-6 sm:p-8 lg:p-10 relative overflow-hidden"
        >
          {/* Top Bar Navigation Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="text-xs font-bold text-slate-400 ml-2 uppercase tracking-wider">
                Seeakk Location Intelligence Engine v2.4
              </span>
            </div>

            {/* Interactive Tab Controls */}
            <div className="flex flex-wrap items-center gap-2 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700">
              {mapTabs.map((tab) => {
                const IconComponent = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      isActive
                        ? 'bg-emerald-500 text-slate-950 shadow-md scale-105'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                    }`}
                  >
                    <IconComponent size={14} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Map Visual Grid */}
          <div className="relative h-[440px] sm:h-[480px] w-full bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center">
            {/* Map Grid Pattern Background */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage:
                  'radial-gradient(#10b981 1px, transparent 1px), linear-gradient(to right, #1e293b 1px, transparent 1px), linear-gradient(to bottom, #1e293b 1px, transparent 1px)',
                backgroundSize: '32px 32px, 64px 64px, 64px 64px',
              }}
            />

            {/* Simulated Animated Connecting Route Lines (SVG) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <defs>
                <linearGradient id="lineGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.2" />
                </linearGradient>
                <linearGradient id="lineGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.2" />
                </linearGradient>
              </defs>

              {/* Route Line 1: Calicut HQ to Acme Corp */}
              <motion.path
                d="M 250 160 Q 350 200 450 270"
                fill="none"
                stroke="url(#lineGrad1)"
                strokeWidth="3"
                strokeDasharray="6 6"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              />

              {/* Route Line 2: Kochi Branch to Apex Systems */}
              <motion.path
                d="M 700 130 Q 760 220 820 300"
                fill="none"
                stroke="url(#lineGrad2)"
                strokeWidth="3"
                strokeDasharray="6 6"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
              />
            </svg>

            {/* Circular Geofence Zones */}
            <div className="absolute top-[25%] left-[20%] w-48 h-48 rounded-full border-2 border-emerald-500/30 bg-emerald-500/5 animate-pulse pointer-events-none flex items-center justify-center">
              <span className="text-[10px] font-mono text-emerald-400/70 font-bold uppercase tracking-wider">
                Geofence Radius: 150m
              </span>
            </div>

            <div className="absolute top-[18%] right-[22%] w-40 h-40 rounded-full border-2 border-teal-500/30 bg-teal-500/5 animate-pulse pointer-events-none flex items-center justify-center">
              <span className="text-[10px] font-mono text-teal-400/70 font-bold uppercase tracking-wider">
                Branch Radius: 100m
              </span>
            </div>

            {/* Map Node Pins */}
            {mockMapNodes.map((node) => (
              <motion.div
                key={node.id}
                style={{ left: node.x, top: node.y }}
                whileHover={{ scale: 1.15 }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
              >
                {/* Pulsing Beacon */}
                <div
                  className={`w-6 h-6 rounded-full bg-${node.color}-500/30 animate-ping absolute inset-0`}
                />

                {/* Node Icon Circle */}
                <div
                  className={`w-10 h-10 rounded-2xl bg-slate-900 border-2 border-${node.color}-400 text-${node.color}-400 flex items-center justify-center shadow-lg relative group-hover:bg-${node.color}-500 group-hover:text-slate-950 transition-all`}
                >
                  {node.type === 'OFFICE' && <Building2 size={18} />}
                  {node.type === 'BRANCH' && <Globe size={18} />}
                  {node.type === 'VISIT' && <MapPin size={18} />}
                </div>

                {/* Tooltip Card on Hover / Active */}
                <div className="absolute top-12 left-1/2 -translate-x-1/2 w-48 bg-slate-900/95 border border-slate-700 backdrop-blur-md rounded-2xl p-3 shadow-2xl opacity-90 group-hover:opacity-100 transition-all pointer-events-none z-30">
                  <div className="text-xs font-black text-white truncate">{node.title}</div>
                  <div className="text-[10px] font-bold text-emerald-400 mt-0.5">{node.status}</div>
                  <div className="text-[10px] text-slate-400 mt-1 font-mono">{node.activeUsers || node.time}</div>
                </div>
              </motion.div>
            ))}

            {/* Floating Live Information Cards (Overlay Visual Badges) */}
            {/* Floating Card 1: GPS Verified Check-In */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: [0, -6, 0], opacity: 1 }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-6 left-6 z-30 bg-slate-900/90 border border-emerald-500/40 backdrop-blur-xl p-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-xs max-w-xs"
            >
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 size={18} />
              </div>
              <div>
                <div className="font-black text-emerald-400 flex items-center gap-1.5">
                  <span>✓ GPS Verified</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
                    Live
                  </span>
                </div>
                <div className="font-bold text-slate-200 mt-0.5">Office Check-In Successful</div>
                <div className="text-[10px] font-mono text-slate-400">Accuracy: 5 m • Calicut HQ</div>
              </div>
            </motion.div>

            {/* Floating Card 2: Customer Visit Verified */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: [0, 6, 0], opacity: 1 }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="absolute top-6 right-6 z-30 bg-slate-900/90 border border-amber-500/40 backdrop-blur-xl p-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-xs max-w-xs"
            >
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <MapPin size={18} />
              </div>
              <div>
                <div className="font-black text-amber-400">Customer Visit Verified</div>
                <div className="font-bold text-slate-200 mt-0.5">Lead #8429 — Acme Corp</div>
                <div className="text-[10px] font-mono text-slate-400">Visited: 11:42 AM • On Site</div>
              </div>
            </motion.div>

            {/* Floating Card 3: Branch Performance Today */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: [0, -8, 0], opacity: 1 }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute bottom-6 left-6 z-30 bg-slate-900/90 border border-teal-500/40 backdrop-blur-xl p-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-xs"
            >
              <div className="p-2.5 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
                <Building2 size={18} />
              </div>
              <div>
                <div className="font-black text-teal-400">Branch Performance</div>
                <div className="font-bold text-slate-200 mt-0.5">Today's Total Field Output</div>
                <div className="text-[10px] font-mono text-slate-300">27 Customer Visits Confirmed</div>
              </div>
            </motion.div>

            {/* Floating Card 4: Live Team Status */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: [0, 8, 0], opacity: 1 }}
              transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
              className="absolute bottom-6 right-6 z-30 bg-slate-900/90 border border-indigo-500/40 backdrop-blur-xl p-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-xs"
            >
              <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Users size={18} />
              </div>
              <div>
                <div className="font-black text-indigo-400">Live Team Status</div>
                <div className="font-bold text-slate-200 mt-0.5">18 Active Field Users</div>
                <div className="text-[10px] font-mono text-slate-400">3 Customer Meetings In Progress</div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Statistics Bar Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {statisticsMetrics.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all text-center group"
            >
              <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight group-hover:text-emerald-600 transition-colors block">
                {stat.value}
              </span>
              <span className="text-xs font-black text-slate-800 mt-2 block">{stat.label}</span>
              <span className="text-[10px] font-bold text-emerald-600 mt-1 block uppercase tracking-wider">
                {stat.change}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Core 8 Feature Cards Grid */}
        <div className="space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Enterprise Field Location Capabilities
            </h3>
            <p className="text-xs sm:text-sm font-bold text-slate-500">
              Built Specifically For Operations Leaders, Regional Managers, And Compliance Directors.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreFeatureCards.map((feat, idx) => {
              const IconComp = feat.icon;
              return (
                <motion.div
                  key={feat.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                  whileHover={{ y: -4 }}
                  className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <IconComp size={20} />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        {feat.badge}
                      </span>
                    </div>

                    <h4 className="text-base font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {feat.title}
                    </h4>

                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Business Value & Key Benefits Grid */}
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden border border-slate-800">
          <div className="relative z-10 space-y-8">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">
                Measurable Business ROI
              </span>
              <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                Key Operational Benefits For Field Enterprises
              </h3>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {businessBenefitsList.map((benefit, i) => (
                <div
                  key={benefit}
                  className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/60 flex items-center gap-3 text-xs font-bold text-slate-200 hover:border-emerald-500/50 hover:bg-slate-800 transition-all"
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">
                    <CheckCircle2 size={12} />
                  </div>
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Privacy Messaging Banner */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-emerald-50/80 border border-emerald-200 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6 shadow-sm"
        >
          <div className="p-4 rounded-2xl bg-white text-emerald-600 shadow-md border border-emerald-100 shrink-0">
            <Lock size={28} />
          </div>

          <div className="space-y-1 text-center md:text-left">
            <div className="text-xs font-black text-emerald-800 uppercase tracking-widest">
              Responsible Enterprise Governance & Privacy Assurance
            </div>
            <p className="text-xs sm:text-sm font-bold text-slate-700 leading-relaxed">
              "Location Data Is Captured Only During Approved Business Activities And According To Workspace Configuration. Seeakk Is Built For Accountability, Operational Transparency, And Business Verification."
            </p>
          </div>

          <Link
            to="/login"
            className="shrink-0 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 whitespace-nowrap"
          >
            <span>Explore Location Verification</span>
            <ArrowRight size={14} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default LiveLocationIntelligence;
