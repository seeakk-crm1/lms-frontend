import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Check,
  Zap,
  ArrowRight,
  Sparkles,
  Building2,
  Cpu,
  Info,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const pricingTiers = [
  {
    id: 'basic',
    name: 'Basic',
    tagline: 'Full Operational Accountability & Core LOB Prevention Engine.',
    monthlyPrice: 499,
    annualPrice: 399,
    minUsers: 'Minimum 3 Users',
    popular: false,
    cta: 'Start With Basic',
    features: [
      'Full Lead Custody & Assignment',
      'Loss Of Business (LOB) Prevention Engine',
      'Mandatory Follow-Up Response Clocks',
      'Target Cycle & Performance Locking',
      'Multi-Office & Branch Isolation',
      'Geo-Fenced Attendance & Shift Rosters',
      'Dynamic Stage Transition Rules',
      'Advance Deposit & Receipt Audit',
      'Permanent Activity Audit Logs',
      'Standard Support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'Everything In Basic Plus Powerful Business Automation.',
    monthlyPrice: 1099,
    annualPrice: 899,
    minUsers: 'Minimum 3 Users',
    popular: true,
    badge: 'Automation Pack',
    cta: 'Start With Pro',
    features: [
      'Everything In Basic Plan',
      'Automatic Meta Lead Import',
      'Automatic WhatsApp Reports To Admins',
      'Automatic WhatsApp Messages Based On Lead Stage',
      '1 Meta Business Connection Included',
      'Monthly Automation Limits Reset',
      'Priority 24/7 Dedicated Support',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: 'Built for organizations that need multiple business integrations, higher automation limits, custom workflows, and dedicated implementation support.',
    monthlyPrice: 'Custom Pricing',
    annualPrice: 'Custom Pricing',
    minUsers: 'Custom Scope',
    popular: false,
    badge: 'Best For Large Organizations',
    cta: 'Contact Sales',
    features: [
      'Everything In Pro',
      'Multiple Meta Business Accounts',
      'Higher Automation Limits',
      'Custom Integrations',
      'Dedicated Support',
      'Custom Onboarding',
      'Custom Deployment Options',
      'Dedicated Account Manager',
      'Priority Technical Support',
      'Advanced Workspace Configuration',
    ],
  },
];

const automationLimits = [
  { label: 'Meta Connections', detail: '1 Meta Business Connection' },
  { label: 'Meta Lead Import', detail: 'Up To 1,000 Automatic Meta Lead Imports Per Month' },
  { label: 'WhatsApp Admin Reports', detail: 'Up To 500 Automatic WhatsApp Admin Reports Per Month' },
  { label: 'WhatsApp Stage Messages', detail: 'Up To 2,000 Automatic Lead Stage WhatsApp Messages Per Month' },
  { label: 'Reset Cycle', detail: 'Monthly Limits Reset Automatically' },
];

const footerNotes = [
  'Minimum Subscription: 3 Users For Basic And Pro',
  'Enterprise Pricing Is Based On Users, Offices, Integrations, And Automation Volume',
  'One Meta Business Connection Is Included In Pro',
  'Additional Meta Business Connections Are Available',
  'WhatsApp Business Charges May Apply According To Usage',
  'Automation Limits Reset Monthly',
  'Contact Sales For Enterprise Configuration',
];

const comparisonRows = [
  { feature: 'Lead Custody & Distribution', basic: true, pro: true, enterprise: true, isCategory: false },
  { feature: 'Loss Of Business (LOB) Engine', basic: true, pro: true, enterprise: true, isCategory: false },
  { feature: 'Mandatory Follow-Up Response Clocks', basic: true, pro: true, enterprise: true, isCategory: false },
  { feature: 'Target Evaluation Cycles & Performance Locking', basic: true, pro: true, enterprise: true, isCategory: false },
  { feature: 'Multi-Office & Branch Isolation', basic: true, pro: true, enterprise: true, isCategory: false },
  { feature: 'Geo-Fenced Attendance & Shift Rosters', basic: true, pro: true, enterprise: true, isCategory: false },
  { feature: 'Dynamic Stage Transition Rules', basic: true, pro: true, enterprise: true, isCategory: false },
  { feature: 'Advance Deposit & Financial Logging', basic: true, pro: true, enterprise: true, isCategory: false },
  { feature: 'Permanent Activity Audit Logs', basic: true, pro: true, enterprise: true, isCategory: false },
  { feature: 'Automatic Meta Lead Import', basic: false, pro: true, enterprise: true, isCategory: false },
  { feature: 'Automatic WhatsApp Reports To Admins', basic: false, pro: true, enterprise: true, isCategory: false },
  { feature: 'Automatic WhatsApp Messages Based On Lead Stage', basic: false, pro: true, enterprise: true, isCategory: false },
  { feature: 'Multiple Meta Business Accounts', basic: false, pro: false, enterprise: true, isCategory: false },
  { feature: 'Higher Automation Limits', basic: false, pro: false, enterprise: true, isCategory: false },
  { feature: 'Custom Integrations', basic: false, pro: false, enterprise: true, isCategory: false },
  { feature: 'Dedicated Support & Onboarding', basic: false, pro: false, enterprise: true, isCategory: false },
  { feature: 'Dedicated Account Manager', basic: false, pro: false, enterprise: true, isCategory: false },
  { feature: 'Priority Technical Support', basic: false, pro: false, enterprise: true, isCategory: false },
];

const PricingSection: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <section id="pricing" className="py-24 lg:py-36 bg-slate-50 text-slate-900 relative overflow-hidden">
      {/* Background Soft Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-100/50 via-transparent to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-widest mb-4 shadow-sm">
            <Zap className="w-4 h-4 text-emerald-600" />
            <span>Transparent Pricing & Plans</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-6">
            Invest In Accountability.{' '}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent">
              Stop Loss Of Business (LOB).
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Simple, Predictable Pricing With Zero Hidden Fees. Every Plan Includes Full Access To The Seeakk Loss Of Business (LOB) Prevention Engine.
          </p>

          {/* Billing Toggle */}
          <div className="mt-8 inline-flex items-center gap-3 p-1.5 rounded-full bg-white border border-slate-200 shadow-sm">
            <button
              type="button"
              onClick={() => setIsAnnual(false)}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                !isAnnual ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setIsAnnual(true)}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
                isAnnual ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Annual Billing</span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full uppercase font-bold">
                Save 20%
              </span>
            </button>
          </div>
        </motion.div>

        {/* Pricing Cards Grid */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16 items-stretch">
          {pricingTiers.map((tier, idx) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={`rounded-3xl p-8 bg-white border relative flex flex-col justify-between transition-all duration-300 ${
                tier.popular
                  ? 'border-emerald-500 shadow-2xl shadow-emerald-500/10 ring-2 ring-emerald-500/30 lg:scale-105 z-10'
                  : 'border-slate-200 shadow-md hover:shadow-xl'
              }`}
            >
              {tier.badge && (
                <span
                  className={`absolute -top-3.5 left-1/2 -translate-x-1/2 font-extrabold text-[10px] uppercase tracking-widest px-4 py-1 rounded-full shadow-md flex items-center gap-1.5 ${
                    tier.popular
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white'
                      : 'bg-slate-900 text-white'
                  }`}
                >
                  {tier.popular && <Sparkles className="w-3 h-3 text-emerald-200" />}
                  {tier.id === 'enterprise' && <Building2 className="w-3 h-3 text-slate-300" />}
                  <span>{tier.badge}</span>
                </span>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-2xl font-black text-slate-900">{tier.name}</h3>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {tier.minUsers}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mb-6 min-h-[48px] font-medium leading-relaxed">{tier.tagline}</p>

                <div className="mb-6 pb-6 border-b border-slate-100">
                  {typeof tier.monthlyPrice === 'number' ? (
                    <>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl sm:text-5xl font-black text-slate-900">
                          ₹{(isAnnual ? tier.annualPrice : tier.monthlyPrice).toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">/ user / month</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 font-semibold">
                        {isAnnual ? 'Billed annually per user' : 'Billed monthly per user'} • {tier.minUsers}
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl sm:text-4xl font-black text-slate-900">
                          {tier.monthlyPrice}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 font-semibold">
                        Tailored Scope & Integrations
                      </p>
                    </>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature) => {
                    const isHighlight = (tier.popular && feature.startsWith('Automatic')) || (tier.id === 'enterprise' && feature.startsWith('Everything'));
                    return (
                      <li key={feature} className="flex items-center gap-3 text-xs text-slate-700 font-medium">
                        <Check className={`w-4 h-4 shrink-0 ${isHighlight ? 'text-emerald-600 stroke-[3]' : 'text-emerald-600'}`} />
                        <span className={isHighlight ? 'font-bold text-slate-900' : ''}>{feature}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <Link
                to="/login"
                className={`w-full py-4 rounded-2xl font-bold text-xs transition-all text-center flex items-center justify-center gap-2 ${
                  tier.popular
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-lg shadow-emerald-500/20'
                    : tier.id === 'enterprise'
                      ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-md'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
                }`}
              >
                <span>{tier.cta}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Automation Limits Information Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-5xl mx-auto bg-gradient-to-r from-white via-emerald-50/40 to-white rounded-3xl border border-emerald-200 p-8 shadow-lg mb-16 relative overflow-hidden"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-emerald-100">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Automation Limits Included</h3>
                <p className="text-xs text-slate-600 font-medium">Pro plan automation quotas & monthly reset specifications</p>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Pro Plan Automation Pack</span>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-6">
            {automationLimits.map((item) => (
              <div key={item.label} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">{item.label}</span>
                  <span className="text-xs font-bold text-slate-900 leading-snug">{item.detail}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-5xl mx-auto bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xl mb-16"
        >
          <div className="bg-slate-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Detailed Capability Matrix</span>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1">Full Plan Comparison</h3>
            </div>
            <span className="text-xs font-semibold px-4 py-1.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              Compare Features Side-by-Side
            </span>
          </div>

          {/* Scrollable Container for Mobile */}
          <div className="overflow-x-auto">
            <div className="min-w-[640px]">
              {/* Table Header */}
              <div className="grid grid-cols-12 bg-slate-100/90 border-b border-slate-200 p-4 sm:p-6 text-xs sm:text-sm font-bold text-slate-800">
                <div className="col-span-5">Operational Feature</div>
                <div className="col-span-2 text-center">Basic (₹499/user/mo)</div>
                <div className="col-span-2 text-center text-emerald-700">Pro (₹1,099/user/mo)</div>
                <div className="col-span-3 text-center text-slate-900">Enterprise (Custom)</div>
              </div>

              {/* Rows */}
              <div className="divide-y divide-slate-100">
                {comparisonRows.map((row) => (
                  <div
                    key={row.feature}
                    className="grid grid-cols-12 p-4 sm:p-5 text-xs sm:text-sm items-center hover:bg-slate-50 transition-colors"
                  >
                    <div className="col-span-5 font-bold text-slate-900 flex items-center gap-2">
                      <span>{row.feature}</span>
                    </div>
                    <div className="col-span-2 flex justify-center">
                      {row.basic ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-xs bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Included</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-400 font-semibold text-xs bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                          <XCircle className="w-3 h-3 text-slate-400" />
                          <span>—</span>
                        </span>
                      )}
                    </div>
                    <div className="col-span-2 flex justify-center">
                      {row.pro ? (
                        <span className="inline-flex items-center gap-1 text-emerald-800 font-bold text-xs bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300 shadow-sm">
                          <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                          <span>Included</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-400 font-semibold text-xs bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                          <XCircle className="w-3 h-3 text-slate-400" />
                          <span>—</span>
                        </span>
                      )}
                    </div>
                    <div className="col-span-3 flex justify-center">
                      {row.enterprise ? (
                        <span className="inline-flex items-center gap-1 text-slate-900 font-bold text-xs bg-slate-100 px-3 py-1 rounded-full border border-slate-300 shadow-sm">
                          <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                          <span>Included</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer Notes Strip */}
        <div className="max-w-5xl mx-auto bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-center">
          <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 mb-4">
            <Info className="w-4 h-4 text-emerald-600" />
            <span>Subscription & Enterprise Guidelines</span>
          </div>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 text-xs font-semibold text-slate-700">
            {footerNotes.map((note) => (
              <span key={note} className="px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200">
                • {note}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
