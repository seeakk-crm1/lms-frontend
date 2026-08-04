import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertOctagon,
  TrendingDown,
  Building,
  UserX,
  FileQuestion,
  Flame,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const personas = [
  {
    id: 'agency',
    role: 'Marketing Agency',
    quote: '"We Delivered 3,500 Qualified Campaign Leads Last Month. The Client Says None Converted, But They Never Even Called 60% Of Them."',
    pain: 'Agencies Get Blamed For "Poor Lead Quality" When The Client Sales Team Fails To Follow Up In Time.',
    solution: 'Seeakk Gives Agencies Permanent Proof Of Lead Delivery, Instant Assignment, And Response Time Call Compliance.',
    icon: Flame,
    color: 'bg-amber-50/80 border-amber-200 text-amber-900',
  },
  {
    id: 'ceo',
    role: 'Business Owner & CEO',
    quote: '"We Spend $40,000 Monthly On Lead Acquisition, But Revenue Stays Flat. I Have Zero Visibility Into Where The Money Goes Or How Much Is Loss Of Business (LOB)."',
    pain: 'Zero Cross-Department Transparency Means Ad Spend Is Wasted Without Sales Revenue Attribution.',
    solution: 'Seeakk Connects Ad Spend Directly To Closed Revenue, Staff Activity, And Loss Of Business (LOB) Prevention.',
    icon: TrendingDown,
    color: 'bg-red-50/80 border-red-200 text-red-900',
  },
  {
    id: 'sales-head',
    role: 'Head of Sales',
    quote: '"My Team Claims They Called Every Lead. But Without Automated Working Schedule Tracking, Follow-Ups Slip Through The Cracks Every Single Day."',
    pain: 'Manual Logging Leads To Forgotten Follow-Ups, Uncontacted Leads, And Massive Loss Of Business (LOB).',
    solution: 'Seeakk Locks Staff Out Of Non-Compliant Actions Until Mandatory Follow-Ups And Stage Rules Are Completed.',
    icon: UserX,
    color: 'bg-orange-50/80 border-orange-200 text-orange-900',
  },
  {
    id: 'branch-mgr',
    role: 'Branch & Regional Manager',
    quote: '"Managing 12 Branch Offices Across Regions Is Guesswork. I Don\'t Know Which Staff Are Actually Working Or Locked Out."',
    pain: 'Lack Of Multi-Office Oversight, Attendance Verification, And Target Locking Controls.',
    solution: 'Seeakk Provides Real-Time Geo-Attendance, Target Locking Workflows, And Office-Wise Audit Logs.',
    icon: Building,
    color: 'bg-emerald-50/80 border-emerald-200 text-emerald-900',
  },
];

const EmotionalHook: React.FC = () => {
  const [activePersonaId, setActivePersonaId] = useState('agency');

  const activePersona = personas.find((p) => p.id === activePersonaId) || personas[0];

  return (
    <section id="pain-points" className="py-24 lg:py-36 bg-slate-50 text-slate-900 relative overflow-hidden">
      {/* Soft Glow Overlays */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-100/50 via-transparent to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-100/50 via-transparent to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-100 border border-red-200 text-red-800 text-xs font-bold uppercase tracking-widest mb-4">
            <AlertOctagon className="w-4 h-4 text-red-600" />
            <span>The Disconnected Sales Operations Crisis</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-6">
            Marketing Delivered 5,000 Leads.{' '}
            <span className="text-red-600 underline decoration-red-300 underline-offset-8">
              Sales Converted Only 37.
            </span>{' '}
            Nobody Knows Why.
          </h2>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Marketing agencies blame the sales team. Sales teams blame lead quality. Business owners lose revenue while everyone looks for someone to blame.{' '}
            Without a centralized accountability platform, every uncontacted lead, missed follow-up, and delayed decision becomes permanent revenue loss. Seeakk ensures every lead has an owner, every follow-up is completed, every action is tracked, and every opportunity is converted into measurable revenue.
          </p>
        </motion.div>

        {/* Stakeholder Persona Selector Tabs */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-12">
          {personas.map((p) => {
            const isSelected = p.id === activePersonaId;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setActivePersonaId(p.id)}
                className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-300 ${
                  isSelected
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-600/20 border border-emerald-500 scale-105'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 shadow-sm'
                }`}
              >
                <p.icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-emerald-600'}`} />
                <span>{p.role}</span>
              </button>
            );
          })}
        </div>

        {/* Persona Box */}
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePersona.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className={`rounded-3xl p-8 sm:p-10 ${activePersona.color} shadow-xl relative overflow-hidden border`}
            >
              <div className="grid md:grid-cols-12 gap-8 items-center">
                {/* Quote Column */}
                <div className="md:col-span-6 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">
                    <FileQuestion className="w-4 h-4 text-slate-700" />
                    <span>Current Frustration</span>
                  </div>

                  <p className="text-lg sm:text-xl font-bold text-slate-900 italic leading-relaxed">
                    {activePersona.quote}
                  </p>

                  <div className="pt-2">
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white text-red-700 border border-red-200 shadow-sm">
                      Impact: High Loss Of Business (LOB)
                    </span>
                  </div>
                </div>

                {/* Solution Column */}
                <div className="md:col-span-6 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                  <div>
                    <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
                      Without Seeakk
                    </p>
                    <p className="text-xs text-slate-600 leading-normal">{activePersona.pain}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100">
                    <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>With Seeakk LOB Prevention Engine</span>
                    </p>
                    <p className="text-xs text-slate-700 font-medium leading-relaxed">{activePersona.solution}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Friction Stats */}
        <div className="mt-20 grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {[
            {
              metric: '71%',
              label: 'Leads Never Contacted',
              desc: 'Without Automated Response Time Follow-Up Gates, 7 Out Of 10 Ad Leads Are Never Called Within 24 Hours.',
            },
            {
              metric: '44%',
              label: 'Follow-Up Abandonment',
              desc: 'Sales Reps Give Up After A Single Call Attempt, Causing Massive Loss Of Business (LOB).',
            },
            {
              metric: '0 Audit Trail',
              label: 'Agency vs. Sales Friction',
              desc: 'Agencies Have Zero Visibility Into Whether Leads Were Actually Called Or Ignored.',
            },
            {
              metric: '100% Solved',
              label: 'Seeakk LOB Prevention',
              desc: 'Every Lead Is Assigned, Tracked, Audited, And Protected By Strict Workflow Locks.',
            },
          ].map((card, idx) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-emerald-500/40 shadow-sm hover:shadow-md transition-all group"
            >
              <p className="text-3xl font-black text-emerald-600 mb-2 group-hover:scale-105 transition-transform origin-left">
                {card.metric}
              </p>
              <h4 className="text-sm font-bold text-slate-900 mb-2">{card.label}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{card.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA Link */}
        <div className="mt-16 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 hover:text-emerald-800 transition-colors bg-emerald-50 px-6 py-3 rounded-full border border-emerald-200 shadow-sm"
          >
            <span>Bridge The Gap Between Marketing Agencies & Sales Operations</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default EmotionalHook;
