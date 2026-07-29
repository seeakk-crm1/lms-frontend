import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, ShieldCheck, Building2, ArrowRight, Calculator } from 'lucide-react';
import { Link } from 'react-router-dom';

const pricingTiers = [
  {
    name: 'Growth',
    tagline: 'Ideal for growing sales teams & boutique agencies.',
    monthlyPrice: 49,
    annualPrice: 39,
    popular: false,
    features: [
      'Up to 10 Sales Advisors',
      'Full Lead Custody & Assignment',
      'Mandatory Follow-up SLA Clocks',
      'WhatsApp Direct Integration',
      'Target Cycle Tracking',
      'Single Office Location',
      'Standard Support',
    ],
  },
  {
    name: 'Scale Enterprise',
    tagline: 'For multi-branch teams requiring target locking & audit control.',
    monthlyPrice: 129,
    annualPrice: 99,
    popular: true,
    features: [
      'Up to 50 Sales Advisors & Staff',
      'Automated Target Enforced Locking',
      'Multi-Office & Branch Isolation',
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
    tagline: 'Custom deployment for enterprise networks & agency partners.',
    monthlyPrice: 'Custom',
    annualPrice: 'Custom',
    popular: false,
    features: [
      'Unlimited Users & Offices',
      'Dedicated Instance / On-Premise option',
      'Custom ERP & CRM Webhooks',
      'White-label Agency Portal',
      'SLA & Uptime Guarantees',
      'Dedicated Success Manager',
      'Custom Staff Training',
    ],
  },
];

const PricingSection: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(true);
  const [leadVolume, setLeadVolume] = useState(1000);
  const [avgDealValue, setAvgDealValue] = useState(2500);

  // ROI Calculator Math: 15% estimated lead leakage saved by Seeakk * 3% conversion * avgDealValue
  const estimatedRecoveredRevenue = Math.round(leadVolume * 0.15 * 0.04 * avgDealValue);

  return (
    <section id="pricing" className="py-24 lg:py-36 bg-gray-900 text-white relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-600/10 via-transparent to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>Transparent Pricing & ROI</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-6">
            Invest in Accountability.{' '}
            <span className="bg-gradient-to-r from-emerald-300 via-emerald-400 to-teal-200 bg-clip-text text-transparent">
              Stop Bleeding Revenue.
            </span>
          </h2>

          <p className="text-base sm:text-lg text-gray-400 leading-relaxed">
            Simple, predictable pricing with zero hidden fees. Every plan includes full access to the Seeakk lead custody engine.
          </p>

          {/* Billing Toggle */}
          <div className="mt-8 inline-flex items-center gap-3 p-1.5 rounded-full bg-gray-950 border border-white/10">
            <button
              type="button"
              onClick={() => setIsAnnual(false)}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                !isAnnual ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setIsAnnual(true)}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
                isAnnual ? 'bg-emerald-500 text-gray-950 shadow-md shadow-emerald-500/20' : 'text-gray-400 hover:text-white'
              }`}
            >
              <span>Annual Billing</span>
              <span className="bg-emerald-950 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full uppercase font-bold">
                Save 20%
              </span>
            </button>
          </div>
        </motion.div>

        {/* Pricing Cards Grid */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-20">
          {pricingTiers.map((tier, idx) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={`rounded-3xl p-8 bg-gray-950 border relative flex flex-col justify-between transition-all duration-300 ${
                tier.popular
                  ? 'border-emerald-500/60 shadow-2xl shadow-emerald-500/20 scale-105 bg-gradient-to-b from-gray-950 via-gray-950 to-emerald-950/30'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              {tier.popular && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-400 to-teal-500 text-gray-950 font-extrabold text-[10px] uppercase tracking-widest px-4 py-1 rounded-full shadow-lg">
                  Most Popular for Enterprises
                </span>
              )}

              <div>
                <h3 className="text-xl font-black text-white mb-2">{tier.name}</h3>
                <p className="text-xs text-gray-400 mb-6 min-h-[36px]">{tier.tagline}</p>

                <div className="mb-6 pb-6 border-b border-white/10">
                  <span className="text-4xl font-black text-white">
                    {typeof tier.monthlyPrice === 'number'
                      ? `$${isAnnual ? tier.annualPrice : tier.monthlyPrice}`
                      : tier.monthlyPrice}
                  </span>
                  {typeof tier.monthlyPrice === 'number' && (
                    <span className="text-xs text-gray-400 ml-2">/ month</span>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-xs text-gray-300">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                to="/login"
                className={`w-full py-3.5 rounded-2xl font-bold text-xs transition-all text-center flex items-center justify-center gap-2 ${
                  tier.popular
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-gray-950 shadow-lg shadow-emerald-500/25'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <span>Deploy {tier.name}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Embedded ROI Revenue Recovery Calculator */}
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-gray-950 via-gray-900 to-emerald-950/40 rounded-3xl p-8 sm:p-10 border border-emerald-500/30 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Seeakk Revenue Recovery Calculator</h3>
              <p className="text-xs text-gray-400">Estimate monthly revenue recovered by stopping lead leakage</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center pt-4">
            {/* Controls */}
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-gray-300">Monthly Ad Lead Volume:</span>
                  <span className="text-emerald-400 font-bold">{leadVolume.toLocaleString()} Leads</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="10000"
                  step="100"
                  value={leadVolume}
                  onChange={(e) => setLeadVolume(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-gray-300">Average Deal / Contract Value:</span>
                  <span className="text-emerald-400 font-bold">${avgDealValue.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="20000"
                  step="500"
                  value={avgDealValue}
                  onChange={(e) => setAvgDealValue(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Calculated Output Box */}
            <div className="bg-black/50 p-6 rounded-2xl border border-emerald-500/30 text-center space-y-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Estimated Monthly Recovered Revenue
              </p>
              <p className="text-3xl sm:text-4xl font-black text-emerald-400">
                +${estimatedRecoveredRevenue.toLocaleString()}
              </p>
              <p className="text-[11px] text-gray-400 pt-1">
                Based on recovering 15% lost leads & enforcing SLA follow-up velocity.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
