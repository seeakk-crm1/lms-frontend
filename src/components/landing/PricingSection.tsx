import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const pricingTiers = [
  {
    name: 'Growth',
    tagline: 'Ideal For Growing Sales Teams & Boutique Agencies.',
    monthlyPrice: 49,
    annualPrice: 39,
    popular: false,
    features: [
      'Up to 10 Sales Advisors',
      'Full Lead Custody & Assignment',
      'Loss Of Business (LOB) Prevention',
      'Mandatory Follow-Up Response Clocks',
      'WhatsApp Direct Integration',
      'Target Cycle Tracking',
      'Single Office Location',
      'Standard Support',
    ],
  },
  {
    name: 'Scale Enterprise',
    tagline: 'For Multi-Branch Teams Requiring Target Locking & LOB Audit Control.',
    monthlyPrice: 129,
    annualPrice: 99,
    popular: true,
    features: [
      'Up to 50 Sales Advisors & Staff',
      'Automated Target Enforced Locking',
      'Multi-Office & Branch Isolation',
      'Loss Of Business (LOB) Analytics',
      'Geo-Fenced Attendance & Rosters',
      'Dynamic Stage Rules & Proofs',
      'Advance Payment & Receipt Logging',
      'Supervisor Approval Queue',
      'Immutable Audit Logs & Export',
      '24/7 Priority Support',
    ],
  },
  {
    name: 'Custom Corporate',
    tagline: 'Custom Deployment For Enterprise Networks & Agency Partners.',
    monthlyPrice: 'Custom',
    annualPrice: 'Custom',
    popular: false,
    features: [
      'Unlimited Users & Offices',
      'Dedicated Instance / On-Premise Option',
      'Custom ERP & CRM Webhooks',
      'Loss Of Business (LOB) Custom Reports',
      'White-Label Agency Portal',
      'Service & Uptime Guarantees',
      'Dedicated Success Manager',
      'Custom Staff Training',
    ],
  },
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
        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {pricingTiers.map((tier, idx) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={`rounded-3xl p-8 bg-white border relative flex flex-col justify-between transition-all duration-300 ${
                tier.popular
                  ? 'border-emerald-500 shadow-2xl shadow-emerald-500/10 scale-105 ring-2 ring-emerald-500/30'
                  : 'border-slate-200 shadow-md hover:shadow-xl'
              }`}
            >
              {tier.popular && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-extrabold text-[10px] uppercase tracking-widest px-4 py-1 rounded-full shadow-md">
                  Most Popular for Enterprises
                </span>
              )}

              <div>
                <h3 className="text-xl font-black text-slate-900 mb-2">{tier.name}</h3>
                <p className="text-xs text-slate-600 mb-6 min-h-[36px] font-medium">{tier.tagline}</p>

                <div className="mb-6 pb-6 border-b border-slate-100">
                  <span className="text-4xl font-black text-slate-900">
                    {typeof tier.monthlyPrice === 'number'
                      ? `$${isAnnual ? tier.annualPrice : tier.monthlyPrice}`
                      : tier.monthlyPrice}
                  </span>
                  {typeof tier.monthlyPrice === 'number' && (
                    <span className="text-xs text-slate-500 ml-2 font-medium">/ month</span>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-xs text-slate-700 font-medium">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                to="/login"
                className={`w-full py-3.5 rounded-2xl font-bold text-xs transition-all text-center flex items-center justify-center gap-2 ${
                  tier.popular
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
                }`}
              >
                <span>Deploy {tier.name}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
