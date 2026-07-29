import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  GitCommit,
  CheckCircle2,
  Lock,
  UserCheck,
  Building2,
  TrendingUp,
  Clock,
  Sparkles,
  FileCheck,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const bridgeStages = [
  {
    step: '01',
    name: 'Lead Ingested',
    owner: 'Agency / Campaign Import',
    desc: 'Lead data received from marketing ad campaign webhooks, APIs, or Excel (.xlsx / CSV) bulk imports.',
    icon: Sparkles,
    badge: '100% Ingested',
  },
  {
    step: '02',
    name: 'Accountability Routing',
    owner: 'Seeakk Distribution Engine',
    desc: 'Structured assignment based on Office Branch, Loss of Business (LOB) prevention rules, user availability, and load balancing.',
    icon: Building2,
    badge: 'Zero Delay',
  },
  {
    step: '03',
    name: 'Mandatory Follow-up',
    owner: 'Assigned Sales Advisor',
    desc: 'Strict SLA countdown clock. Next follow-up date and contact method locked in the calendar.',
    icon: Clock,
    badge: 'SLA Enforced',
  },
  {
    step: '04',
    name: 'Stage Transition Rules',
    owner: 'Sales & System',
    desc: 'Stage cannot be changed without satisfying required dynamic stage rule fields and mandatory remark inputs.',
    icon: FileCheck,
    badge: 'Rule Validated',
  },
  {
    step: '05',
    name: 'Supervisor Audit',
    owner: 'Branch Supervisor',
    desc: 'Overdue follow-ups or special stage transitions require supervisor override approvals.',
    icon: ShieldCheck,
    badge: 'Verified',
  },
  {
    step: '06',
    name: 'Advance Payment',
    owner: 'Finance & Sales',
    desc: 'Advance deposits, receipt proof uploads, and total revenue recorded with audit justification.',
    icon: DollarSign,
    badge: 'Payment Locked',
  },
  {
    step: '07',
    name: 'Target Cycle Evaluation',
    owner: 'Performance Engine',
    desc: 'System continuously evaluates staff performance against assigned weekly/monthly target cycles.',
    icon: TrendingUp,
    badge: 'Target Checked',
  },
  {
    step: '08',
    name: 'Target Enforced Lock',
    owner: 'Compliance System',
    desc: 'Failing mandatory targets or accumulating overdue follow-ups locks system access until unlocked.',
    icon: Lock,
    badge: 'Enforced Lock',
  },
  {
    step: '09',
    name: 'Executive Revenue Trail',
    owner: 'CEO & Enterprise Board',
    desc: 'Complete immutable audit history from ad-dollar spend to bank account deposit.',
    icon: CheckCircle2,
    badge: 'Full Custody',
  },
];

const AccountabilityBridge: React.FC = () => {
  const [activeStageIndex, setActiveStageIndex] = useState(2);

  const activeStage = bridgeStages[activeStageIndex];

  return (
    <section id="bridge" className="py-24 lg:py-36 bg-white text-slate-900 relative overflow-hidden">
      {/* Background Soft Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-100/40 via-transparent to-transparent blur-3xl pointer-events-none" />

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
            <GitCommit className="w-4 h-4 text-emerald-600" />
            <span>The 9-Stage Chain of Custody</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-6">
            The Accountability Chain:{' '}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent">
              From Ad Lead to Closed Revenue.
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Seeakk replaces loose manual processes with a rigid 9-stage chain of custody. Every single lead action is timestamped, audited, and protected by Loss of Business (LOB) prevention gates.
          </p>
        </motion.div>

        {/* Operational Discipline Policy Callout Banner */}
        <div className="max-w-4xl mx-auto mb-16 bg-gradient-to-r from-red-50 via-slate-50 to-emerald-50 rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-lg text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-red-100 text-red-700 border border-red-200 shrink-0 shadow-sm">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-red-700 uppercase tracking-widest">
                Core Operational Policy
              </p>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                "No Performance = No System Access"
              </h3>
              <p className="text-xs text-slate-600 mt-1 max-w-xl">
                Users with overdue mandatory follow-ups or unfulfilled target quotas are automatically locked from proceeding until supervisors approve resolution, preventing Loss of Business (LOB).
              </p>
            </div>
          </div>

          <Link
            to="/login"
            className="shrink-0 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-full transition-all shadow-md shadow-emerald-500/20 whitespace-nowrap"
          >
            Explore Locking Engine
          </Link>
        </div>

        {/* 9-Stage Chain Horizontal Step Navigation */}
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2 mb-10">
          {bridgeStages.map((stage, idx) => {
            const isSelected = idx === activeStageIndex;
            return (
              <button
                key={stage.step}
                type="button"
                onClick={() => setActiveStageIndex(idx)}
                className={`p-3 rounded-2xl text-center transition-all duration-300 border flex flex-col items-center justify-between min-h-[90px] ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-500/20 scale-105 font-bold'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-slate-200'
                }`}
              >
                <span className={`text-[10px] font-black ${isSelected ? 'text-white' : 'text-emerald-700'}`}>
                  {stage.step}
                </span>
                <stage.icon className={`w-5 h-5 my-1 ${isSelected ? 'text-white' : 'text-slate-700'}`} />
                <span className={`text-[10px] font-semibold truncate max-w-full ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                  {stage.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Stage Detailed Card */}
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStage.step}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3 }}
              className="bg-slate-50 rounded-3xl p-8 border border-gray-200 shadow-xl relative overflow-hidden"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 mb-6 border-b border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm">
                    <activeStage.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-mono text-emerald-700 uppercase tracking-widest font-bold">
                      Stage {activeStage.step} of 09
                    </span>
                    <h3 className="text-2xl font-black text-slate-900">{activeStage.name}</h3>
                  </div>
                </div>

                <span className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-sm">
                  {activeStage.badge}
                </span>
              </div>

              <div className="grid md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-8 space-y-4">
                  <p className="text-base text-slate-700 leading-relaxed font-medium">{activeStage.desc}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-600 pt-2">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    <span>Designated Owner: <strong className="text-slate-900">{activeStage.owner}</strong></span>
                  </div>
                </div>

                <div className="md:col-span-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-2">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Chain Integrity Status
                  </p>
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Immutable Audit Logged</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-600">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>Role Permissions Enforced</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default AccountabilityBridge;
