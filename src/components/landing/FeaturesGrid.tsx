import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Zap,
  Lock,
  Building2,
  Users,
  DollarSign,
  FileSpreadsheet,
  Clock,
  Smartphone,
  Layers,
  FileText,
  UserCheck,
  TrendingUp,
  MapPin,
  Calendar,
  SlidersHorizontal,
  BellRing,
  PieChart,
  History,
  Workflow,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const categories = [
  { id: 'all', label: 'All Capabilities' },
  { id: 'accountability', label: 'Accountability & Locking' },
  { id: 'leads', label: 'Lead & Follow-up' },
  { id: 'office', label: 'Office & Attendance' },
  { id: 'enterprise', label: 'Enterprise & Security' },
];

const featuresList = [
  {
    category: 'leads',
    title: 'Lead Management & Distribution',
    desc: 'Instant lead capture from Meta, Google, & Webhooks with automated round-robin and LOB routing.',
    icon: Zap,
    badge: 'Automated',
  },
  {
    category: 'accountability',
    title: 'Target Cycles & Performance Locking',
    desc: 'Automated target evaluation cycles that lock non-performing users until supervisor resolution.',
    icon: Lock,
    badge: 'Core Engine',
  },
  {
    category: 'leads',
    title: 'Mandatory Follow-up SLA Clocks',
    desc: 'Enforced reminder gates and WhatsApp integrations ensuring no follow-up is skipped.',
    icon: Clock,
    badge: 'Zero Leakage',
  },
  {
    category: 'office',
    title: 'Geo-Fenced Attendance Tracking',
    desc: 'GPS location verification, IP boundary restrictions, and office check-in/out gates.',
    icon: MapPin,
    badge: 'GPS Verified',
  },
  {
    category: 'office',
    title: 'Multi-Office & Branch Isolation',
    desc: 'Hierarchical organization chart, multi-branch data isolation, and supervisor permission scopes.',
    icon: Building2,
    badge: 'Multi-Branch',
  },
  {
    category: 'enterprise',
    title: 'Dynamic Stage Rules & Fields',
    desc: 'Custom stage transition requirements preventing reps from moving leads without required proof.',
    icon: SlidersHorizontal,
    badge: 'Custom Rules',
  },
  {
    category: 'enterprise',
    title: 'Advance Payment & Financial Logging',
    desc: 'Track advance deposits, total revenue amounts, receipt attachments, and change justifications.',
    icon: DollarSign,
    badge: 'Revenue Audit',
  },
  {
    category: 'enterprise',
    title: 'Immutable Activity Audit Logs',
    desc: 'Full forensic timeline recording every single lead edit, stage move, assignment, and unlock request.',
    icon: History,
    badge: 'Audit Trail',
  },
  {
    category: 'leads',
    title: 'Excel & CSV Bulk Import/Export',
    desc: 'Seamless import parser supporting Excel (.xlsx) and CSV with intelligent date normalization.',
    icon: FileSpreadsheet,
    badge: 'XLSX / CSV',
  },
  {
    category: 'office',
    title: 'Employee Roster & Shift Planning',
    desc: 'Weekly off schedule controls, roster planning, and holiday calendar management.',
    icon: Calendar,
    badge: 'Roster Control',
  },
  {
    category: 'enterprise',
    title: 'Supervisor Approval Workflows',
    desc: 'Override queues for stage transitions, target unlocks, and special permission requests.',
    icon: UserCheck,
    badge: 'Approvals',
  },
  {
    category: 'office',
    title: 'Mobile PWA & Real-time Sync',
    desc: 'Native progressive web app (PWA) with offline queued syncing and socket-driven live updates.',
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
    <section id="features" className="py-24 lg:py-36 bg-gray-950 text-white relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-600/10 via-transparent to-transparent blur-3xl pointer-events-none" />

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
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Complete Feature Suite</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-6">
            35+ Enterprise Capabilities.{' '}
            <span className="bg-gradient-to-r from-emerald-300 via-emerald-400 to-teal-200 bg-clip-text text-transparent">
              One Unified Engine.
            </span>
          </h2>

          <p className="text-base sm:text-lg text-gray-400 leading-relaxed">
            Every feature in Seeakk is engineered around a single mandate: zero lead leakage, total operational accountability, and measurable revenue growth.
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
                    ? 'bg-emerald-500 text-gray-950 shadow-lg shadow-emerald-500/20'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
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
              className="bg-gray-900/80 rounded-2xl p-6 border border-white/10 hover:border-emerald-500/40 hover:bg-gray-900 transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/5 text-emerald-300 border border-white/10">
                    {item.badge}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
              </div>

              <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-500 group-hover:text-gray-300 transition-colors">
                <span>Enterprise Grade</span>
                <ChevronRight className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm shadow-xl shadow-emerald-500/25 transition-all"
          >
            <span>Explore All 35+ Features in Action</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
