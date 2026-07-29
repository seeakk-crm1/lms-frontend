import React from 'react';
import { motion } from 'framer-motion';
import { XCircle, CheckCircle2, ShieldCheck, Scale, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const comparisonRows = [
  {
    feature: 'Lead Custody & Retention',
    without: 'Up to 40% of leads lost or never contacted within 24 hours.',
    with: '100% timestamped custody from webhook to sales call.',
  },
  {
    feature: 'Agency & Sales Relationship',
    without: 'Constant finger-pointing over lead quality and contact attempts.',
    with: 'Immutable proof of delivery, contact SLA, and conversion audit trail.',
  },
  {
    feature: 'Follow-up Discipline',
    without: 'Forgotten reminders, fake Excel notes, Reps abandon after 1 attempt.',
    with: 'Mandatory follow-up gates & WhatsApp reminders lock screen until done.',
  },
  {
    feature: 'Staff Performance Control',
    without: 'Non-performing staff continue receiving leads without consequences.',
    with: 'Target Enforced Locks suspend system access until targets/follow-ups resolve.',
  },
  {
    feature: 'Attendance & Office Oversight',
    without: 'No verification of office presence or shift roster compliance.',
    with: 'GPS Geofencing, IP lock gates, shift rosters, & supervisor verification.',
  },
  {
    feature: 'Revenue & Advance Tracking',
    without: 'Revenue figures guessed; no proof of advance payment receipts.',
    with: 'Mandatory receipt proof upload & total revenue edit audit trail.',
  },
];

const ComparisonSection: React.FC = () => {
  return (
    <section id="comparison" className="py-24 lg:py-36 bg-gray-900 text-white relative overflow-hidden">
      {/* Glow Overlay */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-600/10 via-transparent to-transparent blur-3xl pointer-events-none" />

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
            <Scale className="w-4 h-4 text-emerald-400" />
            <span>Side-By-Side Comparison</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-6">
            Traditional CRMs vs.{' '}
            <span className="bg-gradient-to-r from-emerald-300 via-emerald-400 to-teal-200 bg-clip-text text-transparent">
              Seeakk Accountability Engine.
            </span>
          </h2>

          <p className="text-base sm:text-lg text-gray-400 leading-relaxed">
            Generic CRMs store contacts. Seeakk enforces operational discipline and bridges the accountability gap between marketing agencies and sales teams.
          </p>
        </motion.div>

        {/* Comparison Table Grid */}
        <div className="max-w-5xl mx-auto bg-gray-950 rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
          {/* Header Row */}
          <div className="grid grid-cols-12 bg-white/5 border-b border-white/10 p-5 sm:p-6 text-xs sm:text-sm font-bold">
            <div className="col-span-4 text-gray-400">Operational Capability</div>
            <div className="col-span-4 text-red-400 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>Without Seeakk (Traditional CRMs)</span>
            </div>
            <div className="col-span-4 text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>With Seeakk Accountability Engine</span>
            </div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-white/5">
            {comparisonRows.map((row, idx) => (
              <motion.div
                key={row.feature}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="grid grid-cols-12 p-5 sm:p-6 text-xs sm:text-sm items-center hover:bg-white/[0.02] transition-colors"
              >
                <div className="col-span-4 font-bold text-white pr-4">{row.feature}</div>
                <div className="col-span-4 text-gray-400 pr-4 flex items-start gap-2 bg-red-950/20 p-3 rounded-xl border border-red-500/10">
                  <span className="text-red-400 font-bold shrink-0">✕</span>
                  <span>{row.without}</span>
                </div>
                <div className="col-span-4 text-emerald-200 flex items-start gap-2 bg-emerald-950/20 p-3 rounded-xl border border-emerald-500/20">
                  <span className="text-emerald-400 font-bold shrink-0">✓</span>
                  <span>{row.with}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom CTA Banner */}
        <div className="mt-16 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-bold text-emerald-400 hover:text-emerald-300 transition-colors bg-emerald-950/60 px-6 py-3 rounded-full border border-emerald-500/30"
          >
            <span>Switch to the Accountability Platform Today</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection;
