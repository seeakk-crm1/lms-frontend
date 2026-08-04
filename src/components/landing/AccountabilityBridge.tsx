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
    name: 'Lead Capture',
    owner: 'Integration & Marketing',
    desc: 'Capture leads instantly from marketing campaigns, websites, landing pages, APIs, Excel imports, manual entry, WhatsApp, or other integrated sources. Every lead enters Seeakk with complete ownership and tracking from the very first interaction.',
    icon: Sparkles,
    badge: '100% Captured',
    highlights: [
      'Import from Excel (.xlsx / .csv)',
      'Website & Landing Page Integration',
      'API & Webhook Support',
      'Manual Lead Creation',
      'WhatsApp Lead Capture',
      'Instant Assignment & Ownership'
    ]
  },
  {
    step: '02',
    name: 'Lead Life Cycle',
    owner: 'Sales Admin & Operations',
    desc: 'Configure your own business-specific lead journey using customizable Lead Life Cycles. Every lead follows a structured process from enquiry to conversion, ensuring standardized operations across every department, office, and sales team.',
    icon: GitCommit,
    badge: 'Fully Configurable',
    highlights: [
      'Unlimited Custom Life Cycles',
      'Dynamic Stage Configuration',
      'Business-Specific Workflows',
      'Department-Based Process Control',
      'Complete Journey Tracking',
      'Conversion Visibility'
    ]
  },
  {
    step: '03',
    name: 'Lead Ownership',
    owner: 'Distribution Engine',
    desc: 'Instantly assign incoming leads to the right agents or branch offices based on customizable routing rules. Lock in complete accountability with zero delays and prevent lead leakage or loss of business (LOB).',
    icon: Building2,
    badge: 'Zero Delay',
    highlights: [
      'Branch & Team Routing',
      'Rule-Based Auto-Assignment',
      'Load-Balancing & Capacity Limits',
      'Instant Notifications',
      'No-Delay Assignment',
      'Prevent Lead Leakage'
    ]
  },
  {
    step: '04',
    name: 'Smart Follow-Ups',
    owner: 'Sales Representative',
    desc: 'Never miss a potential sale with enforceably scheduled next steps. Seeakk forces a structured follow-up countdown for every active lead, keeping sales reps focused and ensuring prompt customer outreach.',
    icon: Clock,
    badge: 'Schedule Enforced',
    highlights: [
      'Response Countdown Timer',
      'Calendar Schedule Lock',
      'Interactive Contact Methods',
      'Automated Slack/Email Alerts',
      'Visual Activity Reminders',
      'Overdue Status Flagging'
    ]
  },
  {
    step: '05',
    name: 'Stage Rules',
    owner: 'System Compliance',
    desc: 'Enforce process compliance by requiring critical data inputs before a lead can transition to the next stage. Ensure sales reps capture all necessary requirements and record mandatory remarks.',
    icon: FileCheck,
    badge: 'Rule Validated',
    highlights: [
      'Mandatory Data Validation',
      'Required Remark Inputs',
      'Dynamic Custom Fields',
      'Branch-Specific Gateways',
      'Automated Stage Transitions',
      'Compliance Audit Trails'
    ]
  },
  {
    step: '06',
    name: 'Supervisor Approval',
    owner: 'Branch Supervisor',
    desc: 'Maintain operational control and resolve bottlenecks quickly. Key events, such as overdue follow-ups or exceptional stage transitions, trigger supervisor review and override approvals.',
    icon: ShieldCheck,
    badge: 'Verified',
    highlights: [
      'Supervisor Override Authorization',
      'Real-time Alert Escalations',
      'Multi-level Role Hierarchy',
      'Detailed Resolution Notes',
      'Branch-wide Activity Feeds',
      'Quick One-Click Approvals'
    ]
  },
  {
    step: '07',
    name: 'Advance Payments',
    owner: 'Finance Department',
    desc: 'Secure your bookings and revenue trails. Enable sales reps to record advance deposits, upload receipts, and note bank credentials directly in the system for immediate supervisor verification.',
    icon: DollarSign,
    badge: 'Payment Locked',
    highlights: [
      'Receipt Image Uploads',
      'Deposit Transaction Logging',
      'Automatic Payment Audits',
      'Multi-currency Support',
      'Dynamic Billing Integration',
      'Secure Ledger Tracking'
    ]
  },
  {
    step: '08',
    name: 'Target Performance',
    owner: 'Performance Engine',
    desc: 'Track and analyze team productivity against dynamic target cycles. Managers can set weekly, monthly, or quarterly quotas, while employees see real-time progress toward their targets.',
    icon: TrendingUp,
    badge: 'Target Checked',
    highlights: [
      'Weekly & Monthly Target Cycles',
      'Real-time Performance Gauges',
      'Leaderboard & Achievements',
      'Branch Comparison Reports',
      'Historical Quota Analytics',
      'Individual Goal Tracking'
    ]
  },
  {
    step: '09',
    name: 'Automatic Target Locking',
    owner: 'Compliance System',
    desc: 'Protect revenue and enforce policy. If a sales rep fails to meet targets or has overdue mandatory follow-ups, the system automatically locks access to lead records until resolving the compliance gap.',
    icon: Lock,
    badge: 'Enforced Lock',
    highlights: [
      'Automated Account Suspension',
      'Overdue Follow-up Interlock',
      'Target Threshold Gatekeeper',
      'Custom Policy Configurations',
      'Supervisor Grace Period Option',
      'System-wide Compliance Shield'
    ]
  },
  {
    step: '10',
    name: 'Revenue Registration',
    owner: 'CEO & Finance Team',
    desc: 'Get an immutable, end-to-end audit trail of your sales pipeline. Track every conversion dollar from the initial campaign click and ad spend down to the final validated bank deposit.',
    icon: CheckCircle2,
    badge: 'Full Custody',
    highlights: [
      'Campaign-to-Deposit Attribution',
      'Immutable History Logs',
      'High-level CEO Dashboard',
      'Comprehensive Financial Auditing',
      'Exportable Ledger Reports',
      'Complete Security Guardrails'
    ]
  }
];

const AccountabilityBridge: React.FC = () => {
  const [activeStageIndex, setActiveStageIndex] = useState(0);

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
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Core Product Features</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-6">
            Powerful Features That{' '}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent">
              Turn Leads Into Revenue.
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Every feature in Seeakk is built to ensure every lead is tracked, every follow-up is completed, every transition is controlled, every target is achieved, and every opportunity is converted into measurable revenue.
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
                Users With Overdue Mandatory Follow-Ups Or Unfulfilled Target Quotas Are Automatically Locked From Proceeding Until Supervisors Approve Resolution, Preventing Loss Of Business (LOB).
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

        {/* 10-Feature Horizontal Step Navigation */}
        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2 mb-10">
          {bridgeStages.map((stage, idx) => {
            const isSelected = idx === activeStageIndex;
            return (
              <button
                key={stage.step}
                type="button"
                onClick={() => setActiveStageIndex(idx)}
                className={`p-2.5 rounded-2xl text-center transition-all duration-300 border flex flex-col items-center justify-between min-h-[100px] sm:min-h-[110px] w-full ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-500/20 scale-105 font-bold'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-slate-200'
                }`}
              >
                <span className={`text-[10px] font-black ${isSelected ? 'text-white' : 'text-emerald-700'}`}>
                  {stage.step}
                </span>
                <stage.icon className={`w-5 h-5 my-1 shrink-0 ${isSelected ? 'text-white' : 'text-slate-700'}`} />
                <span className={`text-[10px] leading-tight font-semibold text-center max-w-full ${isSelected ? 'text-white' : 'text-slate-800'}`}>
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
                      Feature {activeStage.step} Of 10
                    </span>
                    <h3 className="text-2xl font-black text-slate-900">{activeStage.name}</h3>
                  </div>
                </div>

                <span className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-sm">
                  {activeStage.badge}
                </span>
              </div>

              <div className="grid md:grid-cols-12 gap-6 items-start">
                <div className="md:col-span-8 space-y-4">
                  <p className="text-base text-slate-700 leading-relaxed font-medium">{activeStage.desc}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-600 pt-2">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    <span>Designated Owner: <strong className="text-slate-900">{activeStage.owner}</strong></span>
                  </div>
                </div>

                <div className="md:col-span-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-2.5">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Feature Highlights
                  </p>
                  {activeStage.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="leading-tight">{highlight}</span>
                    </div>
                  ))}
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
