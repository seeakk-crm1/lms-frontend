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
    role: 'Lead Generation Agency',
    quote: '"We delivered 3,500 qualified campaign leads last month. The client says none converted, but they never even called 60% of them."',
    pain: 'Agencies get blamed for "poor lead quality" when the client sales team fails to follow up in time.',
    solution: 'Seeakk gives agencies immutable proof of lead delivery, instant assignment, and SLA call compliance.',
    icon: Flame,
    color: 'bg-amber-50/80 border-amber-200 text-amber-900',
  },
  {
    id: 'ceo',
    role: 'Business Owner & CEO',
    quote: '"We spend $40,000 monthly on lead acquisition, but revenue stays flat. I have zero visibility into where the money goes or how much is Loss of Business (LOB)."',
    pain: 'Zero cross-department transparency means ad spend is wasted without sales revenue attribution.',
    solution: 'Seeakk connects ad spend directly to closed revenue, staff activity, and Loss of Business (LOB) prevention.',
    icon: TrendingDown,
    color: 'bg-red-50/80 border-red-200 text-red-900',
  },
  {
    id: 'sales-head',
    role: 'Head of Sales',
    quote: '"My team claims they called every lead. But without automated SLA tracking, follow-ups slip through the cracks every single day."',
    pain: 'Manual logging leads to forgotten follow-ups, uncontacted leads, and massive Loss of Business (LOB).',
    solution: 'Seeakk locks staff out of non-compliant actions until mandatory follow-ups and stage rules are completed.',
    icon: UserX,
    color: 'bg-orange-50/80 border-orange-200 text-orange-900',
  },
  {
    id: 'branch-mgr',
    role: 'Branch & Regional Manager',
    quote: '"Managing 12 branch offices across regions is guesswork. I don\'t know which staff are actually working or locked out."',
    pain: 'Lack of multi-office oversight, attendance verification, and target locking controls.',
    solution: 'Seeakk provides real-time geo-attendance, target locking workflows, and office-wise audit logs.',
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
            Marketing delivered 5,000 leads.{' '}
            <span className="text-red-600 underline decoration-red-300 underline-offset-8">
              Sales converted only 37.
            </span>{' '}
            Nobody knows why.
          </h2>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Agencies blame sales. Sales blames lead quality. Executives bleed cash from <strong>Loss of Business (LOB)</strong>. Without a centralized accountability bridge, every uncontacted lead becomes a permanent revenue loss.
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
                      Impact: High Loss of Business (LOB)
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
              desc: 'Without automated follow-up SLA gates, 7 out of 10 ad leads are never called within 24 hours.',
            },
            {
              metric: '44%',
              label: 'Follow-up Abandonment',
              desc: 'Sales reps give up after a single call attempt, causing massive Loss of Business (LOB).',
            },
            {
              metric: '0 Audit Trail',
              label: 'Agency vs. Sales Friction',
              desc: 'Agencies have zero visibility into whether leads were actually called or ignored.',
            },
            {
              metric: '100% Solved',
              label: 'Seeakk LOB Prevention',
              desc: 'Every lead is assigned, tracked, audited, and protected by strict workflow locks.',
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
            <span>Bridge the Gap Between Marketing Agencies & Sales Operations</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default EmotionalHook;
