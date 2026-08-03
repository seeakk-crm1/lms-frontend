import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Zap,
  Lock,
  Building2,
  DollarSign,
  FileSpreadsheet,
  Clock,
  Smartphone,
  Layers,
  UserCheck,
  TrendingUp,
  MapPin,
  Calendar,
  SlidersHorizontal,
  History,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const categories = [
  { id: 'all', label: 'All Capabilities' },
  { id: 'accountability', label: 'Accountability & Locking' },
  { id: 'leads', label: 'Lead Management & LOB' },
  { id: 'office', label: 'Office & Attendance' },
  { id: 'enterprise', label: 'Enterprise & Security' },
];

const featuresList = [
  {
    category: 'leads',
    title: 'Lead Management & Distribution',
    desc: 'Manage Leads Received From Your Marketing Campaigns, Agencies, Imports, Or External Integrations With Structured Assignment, Accountability Tracking, And Loss Of Business (LOB) Monitoring.',
    icon: Zap,
    badge: 'Lead Custody',
  },
  {
    category: 'accountability',
    title: 'Target Cycles & Performance Locking',
    desc: 'Automated Target Evaluation Cycles That Lock Non-Performing Users Until Supervisor Resolution, Preventing Loss Of Business (LOB).',
    icon: Lock,
    badge: 'Core Engine',
  },
  {
    category: 'leads',
    title: 'Unified Operations Calendar',
    desc: 'One Intelligent Command Center Connecting Every Lead Follow-Up, Meeting, Site Visit, Shift Roster, Target Milestone, And Leave Schedule Across Your Enterprise.',
    icon: Calendar,
    badge: 'Operations Hub',
  },
  {
    category: 'leads',
    title: 'Mandatory Follow-Up Response Clocks',
    desc: 'Enforced Reminder Gates And WhatsApp Integrations Ensuring No Follow-Up Is Skipped Or Forgotten.',
    icon: Clock,
    badge: 'Zero Leakage',
  },
  {
    category: 'office',
    title: 'Geo-Fenced Attendance Tracking',
    desc: 'GPS Location Verification, IP Boundary Restrictions, And Office Check-In/Out Gates.',
    icon: MapPin,
    badge: 'GPS Verified',
  },
  {
    category: 'office',
    title: 'Multi-Office & Branch Isolation',
    desc: 'Hierarchical Organization Chart, Multi-Branch Data Isolation, And Supervisor Permission Scopes.',
    icon: Building2,
    badge: 'Multi-Branch',
  },
  {
    category: 'enterprise',
    title: 'Dynamic Stage Rules & Fields',
    desc: 'Custom Stage Transition Requirements Preventing Reps From Moving Leads Without Required Proof.',
    icon: SlidersHorizontal,
    badge: 'Custom Rules',
  },
  {
    category: 'enterprise',
    title: 'Advance Payment & Financial Logging',
    desc: 'Track Advance Deposits, Total Revenue Amounts, Receipt Attachments, And Change Justifications.',
    icon: DollarSign,
    badge: 'Revenue Audit',
  },
  {
    category: 'enterprise',
    title: 'Immutable Activity Audit Logs',
    desc: 'Full Forensic Timeline Recording Every Single Lead Edit, Stage Move, Assignment, And Unlock Request.',
    icon: History,
    badge: 'Audit Trail',
  },
  {
    category: 'leads',
    title: 'Excel & CSV Bulk Import/Export',
    desc: 'Seamless Import Parser Supporting Excel (.xlsx) And CSV With Intelligent Date Normalization.',
    icon: FileSpreadsheet,
    badge: 'XLSX / CSV',
  },
  {
    category: 'office',
    title: 'Employee Roster & Shift Planning',
    desc: 'Weekly Off Schedule Controls, Roster Planning, And Holiday Calendar Management.',
    icon: Calendar,
    badge: 'Roster Control',
  },
  {
    category: 'enterprise',
    title: 'Supervisor Approval Workflows',
    desc: 'Override Queues For Stage Transitions, Target Unlocks, And Special Permission Requests.',
    icon: UserCheck,
    badge: 'Approvals',
  },
  {
    category: 'office',
    title: 'Mobile PWA & Real-Time Sync',
    desc: 'Native Progressive Web App (PWA) With Offline Queued Syncing And Socket-Driven Live Updates.',
    icon: Smartphone,
    badge: 'PWA Ready',
  },
];

const FeaturesGrid: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredFeatures =
    activeCategory === 'all'
      ? featuresList
      : featuresList.filter((f) => f.category === activeCategory);

  return (
    <section id="features" className="py-24 lg:py-36 bg-white text-slate-900 relative overflow-hidden">
      {/* Background Soft Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-100/40 via-transparent to-transparent blur-3xl pointer-events-none" />

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
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>Complete Feature Suite</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-6">
            35+ Enterprise Capabilities.{' '}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent">
              One Unified Platform.
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Every Feature In Seeakk Is Engineered Around A Single Mandate: Zero Lead Leakage, Loss Of Business (LOB) Prevention, And Total Operational Accountability.
          </p>
        </motion.div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((cat) => {
            const isSelected = cat.id === activeCategory;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Grid Display */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFeatures.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="bg-slate-50/80 rounded-2xl p-6 border border-slate-200 hover:border-emerald-500/40 hover:bg-white hover:shadow-lg transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200 group-hover:scale-110 transition-transform shadow-sm">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white text-emerald-800 border border-emerald-200 shadow-sm">
                    {item.badge}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">{item.desc}</p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 group-hover:text-slate-800 transition-colors">
                <span>Enterprise Grade</span>
                <ChevronRight className="w-3.5 h-3.5 text-emerald-600 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-sm shadow-xl shadow-emerald-500/20 transition-all"
          >
            <span>Explore All 35+ Capabilities In Workspace</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
