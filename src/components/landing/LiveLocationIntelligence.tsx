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
  ArrowRight,
  Eye,
  Radio,
  FileCheck,
  Lock,
  Plus,
  Minus,
  Maximize2,
  User,
  Car,
  Layers,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const mapTabs = [
  { id: 'live', label: 'Live User Map', icon: Radio },
  { id: 'timeline', label: 'User Travel Timeline', icon: Clock },
  { id: 'team', label: 'Team Location View', icon: Users },
  { id: 'verification', label: 'Location Verification', icon: ShieldCheck },
];

const liveStatusCards = [
  { label: 'Live Users', value: '8 Active', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
  { label: 'Customer Visits', value: '3 In Progress', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  { label: 'Travelling', value: '4 Users', color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200' },
  { label: 'Location Verified', value: '97%', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
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

const mockUserMarkers = [
  {
    id: 'u1',
    name: 'Rahul Sharma',
    avatar: 'RS',
    avatarBg: 'bg-amber-500',
    status: 'On Customer Visit',
    subtext: 'Acme Corporation • Arrived 11:42 AM',
    time: 'Updated 2 Mins Ago',
    speed: 'Location Verified',
    x: '38%',
    y: '56%',
    color: 'amber',
  },
  {
    id: 'u2',
    name: 'Aisha Khan',
    avatar: 'AK',
    avatarBg: 'bg-blue-600',
    status: 'Travelling To Lead Location',
    subtext: 'En Route to Apex Systems',
    time: '12.4 km/h',
    speed: '12.4 km/h',
    x: '64%',
    y: '34%',
    color: 'blue',
  },
  {
    id: 'u3',
    name: 'Mohammed Nifras',
    avatar: 'MN',
    avatarBg: 'bg-emerald-600',
    status: 'Visit Completed',
    subtext: 'Duration: 36 Mins • Logged',
    time: 'Updated 5 Mins Ago',
    speed: 'Verified Visit',
    x: '22%',
    y: '28%',
    color: 'emerald',
  },
  {
    id: 'u4',
    name: 'Vinod Thomas',
    avatar: 'VT',
    avatarBg: 'bg-indigo-600',
    status: 'Office Check-In Verified',
    subtext: 'HQ Office • Accuracy 8m',
    time: 'Updated 1 Min Ago',
    speed: 'Accuracy: 8m',
    x: '82%',
    y: '68%',
    color: 'indigo',
  },
];

const mockCustomerPins = [
  {
    id: 'c1',
    title: 'Acme Corporation',
    leadTag: 'Lead #8429',
    status: 'Customer Visit Location',
    arrival: 'Verified Arrival 11:42 AM',
    x: '46%',
    y: '60%',
  },
  {
    id: 'c2',
    title: 'Apex Systems',
    leadTag: 'Lead #8430',
    status: 'Scheduled Visit Destination',
    arrival: 'ETA 02:35 PM',
    x: '76%',
    y: '24%',
  },
];

const LiveLocationIntelligence: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('live');
  const [mapStyleMode, setMapStyleMode] = useState<'map' | 'satellite'>('map');
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 15, 140));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 15, 85));
  const handleRecenter = () => setZoomLevel(100);

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
            <span>SEEAKK LIVE USER LOCATION TRACKING</span>
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
          className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl p-5 sm:p-7 lg:p-9 relative overflow-hidden"
        >
          {/* Top Bar Navigation & Main Section Label */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-800 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="text-xs font-black text-slate-300 ml-2 uppercase tracking-wider">
                SEEAKK LIVE USER LOCATION TRACKING
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

          {/* Operational Status Overview Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {liveStatusCards.map((card) => (
              <div
                key={card.label}
                className={`p-3 rounded-2xl border flex items-center justify-between shadow-sm ${card.bg}`}
              >
                <div>
                  <span className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider block">
                    {card.label}
                  </span>
                  <span className={`text-sm font-black ${card.color}`}>{card.value}</span>
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            ))}
          </div>

          {/* Interactive Light Google Maps-Style Map Canvas */}
          <div
            className={`relative h-[480px] sm:h-[520px] w-full rounded-2xl border overflow-hidden flex items-center justify-center transition-all duration-500 ${
              mapStyleMode === 'map'
                ? 'bg-[#f8fafc] border-slate-200 shadow-inner'
                : 'bg-slate-950 border-slate-800'
            }`}
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center center' }}
          >
            {/* VECTOR MAP GRAPHICS ENGINE */}
            {mapStyleMode === 'map' ? (
              <div className="absolute inset-0 pointer-events-none">
                {/* Green Park Areas */}
                <svg className="absolute inset-0 w-full h-full">
                  <path d="M 40 80 Q 120 40 220 100 T 180 260 Z" fill="#dcfce7" opacity="0.7" />
                  <path d="M 680 280 Q 780 220 890 320 T 790 480 Z" fill="#dcfce7" opacity="0.7" />
                  <path d="M 420 380 Q 520 340 600 420 T 480 500 Z" fill="#dcfce7" opacity="0.6" />

                  {/* Water River Body */}
                  <path
                    d="M -20 320 C 150 280, 250 420, 420 310 C 580 200, 720 340, 1020 260 L 1020 540 L -20 540 Z"
                    fill="#dbeafe"
                    opacity="0.85"
                  />
                  <text x="240" y="440" fill="#93c5fd" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
                    Vanguard River Basin
                  </text>
                </svg>

                {/* Road Network Grid (Main Highways + Secondary Streets) */}
                <svg className="absolute inset-0 w-full h-full">
                  {/* Minor Street Grid Lines */}
                  <g stroke="#e2e8f0" strokeWidth="2">
                    <line x1="0" y1="120" x2="1000" y2="120" />
                    <line x1="0" y1="240" x2="1000" y2="240" />
                    <line x1="0" y1="380" x2="1000" y2="380" />
                    <line x1="160" y1="0" x2="160" y2="600" />
                    <line x1="340" y1="0" x2="340" y2="600" />
                    <line x1="560" y1="0" x2="560" y2="600" />
                    <line x1="780" y1="0" x2="780" y2="600" />
                  </g>

                  {/* Major White City Roads with Grey Borders */}
                  <g fill="none" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M 0 180 C 300 180, 450 120, 1000 120" />
                    <path d="M 0 450 C 350 450, 600 360, 1000 360" />
                    <path d="M 240 0 C 240 250, 420 350, 420 600" />
                    <path d="M 720 0 C 720 300, 840 450, 840 600" />
                  </g>

                  {/* Yellow Primary Arterial Highway (Google Maps Yellow Style) */}
                  <path
                    d="M 50 40 C 250 140, 500 220, 950 480"
                    fill="none"
                    stroke="#fde68a"
                    strokeWidth="10"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 50 40 C 250 140, 500 220, 950 480"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="1"
                    strokeDasharray="8 8"
                  />
                </svg>

                {/* Road Labels & Area Labels */}
                <div className="absolute inset-0 pointer-events-none">
                  <span className="absolute top-[8%] left-[8%] text-[10px] font-black uppercase tracking-widest text-slate-400 bg-white/80 px-2 py-0.5 rounded border border-slate-200">
                    NORTH INDUSTRIAL ZONE
                  </span>
                  <span className="absolute top-[18%] right-[12%] text-[10px] font-black uppercase tracking-widest text-slate-400 bg-white/80 px-2 py-0.5 rounded border border-slate-200">
                    FINANCIAL TECH PARK
                  </span>
                  <span className="absolute bottom-[22%] left-[14%] text-[10px] font-black uppercase tracking-widest text-slate-400 bg-white/80 px-2 py-0.5 rounded border border-slate-200">
                    CENTRAL BUSINESS DISTRICT
                  </span>

                  {/* Road Street Labels */}
                  <span className="absolute top-[31%] left-[28%] text-[9px] font-bold text-slate-500 -rotate-6">
                    Grand Trunk Expressway
                  </span>
                  <span className="absolute top-[28%] right-[32%] text-[9px] font-bold text-slate-500 rotate-12">
                    Cyber Highway
                  </span>
                  <span className="absolute bottom-[36%] left-[45%] text-[9px] font-bold text-slate-500">
                    MG Road Arterial
                  </span>
                </div>
              </div>
            ) : (
              /* Satellite Dark Mode Grid Fallback */
              <div
                className="absolute inset-0 opacity-30 pointer-events-none"
                style={{
                  backgroundImage:
                    'radial-gradient(#10b981 1px, transparent 1px), linear-gradient(to right, #1e293b 1px, transparent 1px), linear-gradient(to bottom, #1e293b 1px, transparent 1px)',
                  backgroundSize: '32px 32px, 64px 64px, 64px 64px',
                }}
              />
            )}

            {/* REALISTIC ROAD-FOLLOWING ROUTE LINES (SVG Overlay) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
              <defs>
                <marker id="arrowGreen" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" />
                </marker>
                <marker id="arrowBlue" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
                </marker>
              </defs>

              {/* ROUTE 1: Completed Route (Mohammed Nifras -> Rahul Sharma -> Acme Corp) */}
              {/* Solid Green Road-Following Path */}
              <motion.path
                d="M 220 170 Q 280 240 380 300 L 460 320"
                fill="none"
                stroke="#10b981"
                strokeWidth="4"
                strokeLinecap="round"
                markerEnd="url(#arrowGreen)"
              />

              {/* ROUTE 2: Active En-Route (Aisha Khan -> Apex Systems Customer Pin) */}
              {/* Completed Segment (Solid Green) */}
              <motion.path
                d="M 520 120 Q 580 140 640 180"
                fill="none"
                stroke="#10b981"
                strokeWidth="4"
                strokeLinecap="round"
              />

              {/* Remaining Segment (Dashed Blue Line) */}
              <motion.path
                d="M 640 180 C 700 220 730 160 760 130"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="4"
                strokeDasharray="7 7"
                strokeLinecap="round"
                markerEnd="url(#arrowBlue)"
                initial={{ strokeDashoffset: 40 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              />
            </svg>

            {/* CUSTOMER DESTINATION PINS */}
            {mockCustomerPins.map((pin) => (
              <motion.div
                key={pin.id}
                style={{ left: pin.x, top: pin.y }}
                whileHover={{ scale: 1.15 }}
                className="absolute -translate-x-1/2 -translate-y-full z-20 cursor-pointer group"
              >
                <div className="flex flex-col items-center">
                  <div className="bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-md mb-1 flex items-center gap-1 border border-rose-400 whitespace-nowrap">
                    <MapPin size={10} />
                    <span>{pin.title}</span>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-rose-600 border-2 border-white text-white flex items-center justify-center shadow-lg relative">
                    <Building2 size={14} />
                    <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping absolute inset-0" />
                  </div>
                  <div className="w-1 h-2 bg-rose-700 rounded-b" />
                </div>

                {/* Customer Pin Detail Card */}
                <div className="absolute top-12 left-1/2 -translate-x-1/2 w-48 bg-white border border-slate-200 rounded-2xl p-3 shadow-xl opacity-90 group-hover:opacity-100 transition-all pointer-events-none z-30 text-slate-900">
                  <div className="text-xs font-black text-rose-700 flex items-center gap-1">
                    <MapPin size={12} />
                    <span>{pin.title}</span>
                  </div>
                  <div className="text-[10px] font-bold text-slate-500">{pin.leadTag}</div>
                  <div className="text-[10px] font-bold text-emerald-600 mt-1">{pin.status}</div>
                  <div className="text-[9px] text-slate-400 font-mono mt-0.5">{pin.arrival}</div>
                </div>
              </motion.div>
            ))}

            {/* USER AVATAR MARKERS (Rahul Sharma, Aisha Khan, Mohammed Nifras, Vinod Thomas) */}
            {mockUserMarkers.map((userNode) => (
              <motion.div
                key={userNode.id}
                style={{ left: userNode.x, top: userNode.y }}
                whileHover={{ scale: 1.12 }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-30 cursor-pointer group"
              >
                {/* Active Outer Pulse Ring */}
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 animate-ping absolute inset-0 -m-1" />

                {/* User Avatar Circle Marker */}
                <div className="flex items-center gap-2 bg-white border-2 border-emerald-500 rounded-full p-1 shadow-lg relative group-hover:border-emerald-600 transition-all">
                  <div className={`w-8 h-8 rounded-full ${userNode.avatarBg} text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs`}>
                    {userNode.avatar}
                  </div>
                  <div className="pr-2.5 hidden sm:block">
                    <div className="text-[11px] font-black text-slate-900 leading-tight whitespace-nowrap">
                      {userNode.name}
                    </div>
                    <div className="text-[9px] font-bold text-emerald-600 leading-tight flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{userNode.status}</span>
                    </div>
                  </div>
                </div>

                {/* Detailed Hover User Card */}
                <div className="absolute top-12 left-1/2 -translate-x-1/2 w-52 bg-white border border-slate-200 rounded-2xl p-3 shadow-2xl opacity-95 group-hover:opacity-100 transition-all pointer-events-none z-40 text-slate-900">
                  <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
                    <div className={`w-6 h-6 rounded-full ${userNode.avatarBg} text-white text-[10px] font-black flex items-center justify-center`}>
                      {userNode.avatar}
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900">{userNode.name}</div>
                      <div className="text-[9px] font-bold text-emerald-600">{userNode.status}</div>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-600 font-medium mt-1.5">{userNode.subtext}</div>
                  <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono mt-1 pt-1 border-t border-slate-100">
                    <span>{userNode.time}</span>
                    <span className="font-bold text-slate-600">{userNode.speed}</span>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* REALISTIC MAP INTERACTIVE CONTROLS (Zoom In, Zoom Out, Recenter, Map/Sat Toggle) */}
            <div className="absolute bottom-5 right-5 z-40 flex flex-col items-center gap-1.5 bg-white/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200 shadow-xl">
              <button
                type="button"
                onClick={handleZoomIn}
                title="Zoom In"
                className="p-2 text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
              >
                <Plus size={16} />
              </button>
              <button
                type="button"
                onClick={handleZoomOut}
                title="Zoom Out"
                className="p-2 text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
              >
                <Minus size={16} />
              </button>
              <button
                type="button"
                onClick={handleRecenter}
                title="Recenter Map"
                className="p-2 text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
              >
                <Navigation size={16} />
              </button>
              <div className="w-full h-px bg-slate-200 my-0.5" />
              <button
                type="button"
                onClick={() => setMapStyleMode(mapStyleMode === 'map' ? 'satellite' : 'map')}
                title="Toggle Map / Satellite View"
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  mapStyleMode === 'satellite'
                    ? 'bg-slate-900 text-emerald-400'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Layers size={16} />
              </button>
            </div>

            {/* FLOATING REALISTIC USER ACTIVITY CARDS OVERLAY (Responsive Bottom Grid) */}
            <div className="absolute bottom-5 left-5 z-30 hidden lg:flex items-center gap-3 max-w-2xl overflow-x-auto pb-1">
              {/* Card 1: Rahul Sharma */}
              <div className="bg-white/95 border border-slate-200 backdrop-blur-md p-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs text-slate-900 shrink-0">
                <div className="w-7 h-7 rounded-full bg-amber-500 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                  RS
                </div>
                <div>
                  <div className="font-black text-slate-900 text-[11px]">Rahul Sharma</div>
                  <div className="text-[10px] font-bold text-amber-700">Customer Visit In Progress</div>
                  <div className="text-[9px] text-slate-500 font-mono">Acme Corp • Arrived 11:42 AM</div>
                </div>
              </div>

              {/* Card 2: Aisha Khan */}
              <div className="bg-white/95 border border-slate-200 backdrop-blur-md p-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs text-slate-900 shrink-0">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                  AK
                </div>
                <div>
                  <div className="font-black text-slate-900 text-[11px]">Aisha Khan</div>
                  <div className="text-[10px] font-bold text-blue-700">Travelling To Customer</div>
                  <div className="text-[9px] text-slate-500 font-mono">Rem: 3.8 km • ETA 02:35 PM</div>
                </div>
              </div>

              {/* Card 3: Mohammed Nifras */}
              <div className="bg-white/95 border border-slate-200 backdrop-blur-md p-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs text-slate-900 shrink-0">
                <div className="w-7 h-7 rounded-full bg-teal-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                  MN
                </div>
                <div>
                  <div className="font-black text-slate-900 text-[11px]">Mohammed Nifras</div>
                  <div className="text-[10px] font-bold text-teal-700">Visit Completed (36m)</div>
                  <div className="text-[9px] text-slate-500 font-mono">Location Verified</div>
                </div>
              </div>
            </div>
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
