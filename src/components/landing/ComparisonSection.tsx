import React from 'react';
import { motion } from 'framer-motion';
import { XCircle, CheckCircle2, Scale, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const comparisonRows = [
  {
    feature: 'Lead Custody & Retention',
    without: 'Up To 40% Of Leads Lost Or Uncontacted Due To Lack Of Response Tracking.',
    with: '100% Timestamped Lead Custody From Campaign Import To Sales Contact.',
  },
  {
    feature: 'Agency & Sales Relationship',
    without: 'Constant Finger-Pointing Over Lead Quality And Contact Attempts.',
    with: 'Immutable Proof Of Delivery, Contact Response Time, And Conversion Audit Trail.',
  },
  {
    feature: 'Follow-Up Discipline',
    without: 'Forgotten Reminders, Manual Excel Notes, And Sales Representatives Abandoning Leads After A Single Attempt.',
    with: 'Mandatory Follow-Up Gates & WhatsApp Reminders Lock Screen Until Completed.',
  },
  {
    feature: 'Loss Of Business (LOB) Control',
    without: 'High Loss Of Business (LOB) Caused By Unassigned & Ignored Leads.',
    with: 'Loss Of Business (LOB) Prevention Engine Monitors Every Lost Opportunity.',
  },
  {
    feature: 'Staff Performance Control',
    without: 'Non-Performing Staff Continue Receiving Leads Without Consequences.',
    with: 'Target Enforced Locks Suspend System Access Until Targets/Follow-Ups Resolve.',
  },
  {
    feature: 'Attendance & Office Oversight',
    without: 'No Verification Of Office Presence Or Shift Roster Compliance.',
    with: 'GPS Geofencing, IP Lock Gates, Shift Rosters, & Supervisor Verification.',
  },
  {
    feature: 'Revenue & Advance Tracking',
    without: 'Revenue Figures Guessed; No Proof Of Advance Payment Receipts.',
    with: 'Mandatory Receipt Proof Upload & Total Revenue Edit Audit Trail.',
  },
];

const ComparisonSection: React.FC = () => {
  return (
    <section id="comparison" className="py-24 lg:py-36 bg-slate-50 text-slate-900 relative overflow-hidden">
      {/* Soft Glow Overlay */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-100/50 via-transparent to-transparent blur-3xl pointer-events-none" />

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
            <Scale className="w-4 h-4 text-emerald-600" />
            <span>Loss Of Business (LOB) Comparison</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-6">
            Traditional CRMs vs.{' '}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent">
              Seeakk LOB Prevention Engine.
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Generic CRMs Store Contact Details. Seeakk Enforces Operational Discipline And Stops Loss Of Business (LOB) Across Your Sales Team.
          </p>
        </motion.div>

        {/* Comparison Table Grid */}
        <div className="max-w-5xl mx-auto bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xl">
          {/* Header Row */}
          <div className="grid grid-cols-12 bg-slate-100/80 border-b border-slate-200 p-5 sm:p-6 text-xs sm:text-sm font-bold">
            <div className="col-span-4 text-slate-700">Operational Capability</div>
            <div className="col-span-4 text-red-700 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>Without Seeakk (Traditional CRMs)</span>
            </div>
            <div className="col-span-4 text-emerald-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>With Seeakk LOB Prevention Engine</span>
            </div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-slate-100">
            {comparisonRows.map((row, idx) => (
              <motion.div
                key={row.feature}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="grid grid-cols-12 p-5 sm:p-6 text-xs sm:text-sm items-center hover:bg-slate-50 transition-colors"
              >
                <div className="col-span-4 font-bold text-slate-900 pr-4">{row.feature}</div>
                <div className="col-span-4 text-slate-700 pr-4 flex items-start gap-2 bg-red-50 p-3 rounded-xl border border-red-200 text-xs">
                  <span className="text-red-600 font-bold shrink-0">✕</span>
                  <span>{row.without}</span>
                </div>
                <div className="col-span-4 text-slate-800 flex items-start gap-2 bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-xs font-semibold">
                  <span className="text-emerald-600 font-bold shrink-0">✓</span>
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
            className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 hover:text-emerald-800 transition-colors bg-emerald-50 px-6 py-3 rounded-full border border-emerald-200 shadow-sm"
          >
            <span>Stop Loss Of Business (LOB) In Your Operations Today</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection;
