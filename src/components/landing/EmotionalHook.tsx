import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertOctagon,
  HelpCircle,
  TrendingDown,
  Building,
  UserX,
  FileQuestion,
  ShieldAlert,
  Flame,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const personas = [
  {
    id: 'agency',
    role: 'Lead Generation Agency',
    quote: '"We delivered 3,500 verified leads last month. The client says none converted, but they never even called 60% of them."',
    pain: 'Agencies get blamed for "bad quality" when the client sales team fails to follow up in time.',
    solution: 'Seeakk gives agencies immutable proof of lead delivery, instant assignment, and SLA call compliance.',
    icon: Flame,
    color: 'from-amber-500/20 to-amber-950/40 border-amber-500/30 text-amber-400',
  },
  {
    id: 'ceo',
    role: 'Business Owner & CEO',
    quote: '"We spend $40,000 monthly on lead acquisition, but revenue stays flat. I have zero visibility into where the money goes."',
    pain: 'Zero cross-department transparency means marketing ad spend is wasted without sales revenue attribution.',
    solution: 'Seeakk connects agency ad spend directly to closed revenue, staff activity, and branch profitability.',
    icon: TrendingDown,
    color: 'from-red-500/20 to-red-950/40 border-red-500/30 text-red-400',
  },
  {
    id: 'sales-head',
    role: 'Head of Sales',
    quote: '"My team claims they called every lead. But without automated tracking, follow-ups slip through the cracks every single day."',
    pain: 'Manual Excel logging leads to forgotten follow-ups, fake status updates, and uncontacted leads.',
    solution: 'Seeakk locks staff out of non-compliant actions until mandatory follow-ups and stage rules are completed.',
    icon: UserX,
    color: 'from-orange-500/20 to-orange-950/40 border-orange-500/30 text-orange-400',
  },
  {
    id: 'branch-mgr',
    role: 'Branch & Regional Manager',
    quote: '"Managing 12 branch offices across regions is guesswork. I don\'t know which staff are actually working or locked out."',
    pain: 'Lack of multi-office oversight, attendance verification, and target locking controls.',
    solution: 'Seeakk provides real-time geo-attendance, target locking workflows, and office-wise audit logs.',
    icon: Building,
    color: 'from-emerald-500/20 to-emerald-950/40 border-emerald-500/30 text-emerald-400',
  },
];

const EmotionalHook: React.FC = () => {
  const [activePersonaId, setActivePersonaId] = useState('agency');

  const activePersona = personas.find((p) => p.id === activePersonaId) || personas[0];

  return (
    <section id="pain-points" className="py-24 lg:py-36 bg-gray-900 text-white relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-950/20 via-transparent to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-950/20 via-transparent to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-widest mb-4">
            <AlertOctagon className="w-4 h-4 text-red-400" />
            <span>The Disconnected Lead Reality</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-6">
            Marketing generated 5,000 leads.{' '}
            <span className="text-red-400 underline decoration-red-500/40 underline-offset-8">
              Sales converted only 37.
            </span>{' '}
            Nobody knows why.
          </h2>

          <p className="text-base sm:text-lg text-gray-400 leading-relaxed">
            Agencies blame sales. Sales blames lead quality. Executives bleed cash. Without a centralized
            accountability bridge, every lead becomes a lost revenue opportunity.
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
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25 border border-emerald-400/40 scale-105'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
              >
                <p.icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-emerald-400'}`} />
                <span>{p.role}</span>
              </button>
            );
          })}
        </div>

        {/* Interactive Persona Storytelling Box */}
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePersona.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className={`rounded-3xl p-8 sm:p-10 bg-gradient-to-br ${activePersona.color} backdrop-blur-xl shadow-2xl relative overflow-hidden border`}
            >
              <div className="grid md:grid-cols-12 gap-8 items-center">
                {/* Quote Column */}
                <div className="md:col-span-6 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                    <FileQuestion className="w-4 h-4 text-emerald-400" />
                    <span>Current Frustration</span>
                  </div>

                  <p className="text-lg sm:text-xl font-bold text-white italic leading-relaxed">
                    {activePersona.quote}
                  </p>

                  <div className="pt-2">
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-black/40 text-red-300 border border-red-500/30">
                      Issue: Disconnected Accountability
                    </span>
                  </div>
                </div>

                {/* Solution Column */}
                <div className="md:col-span-6 bg-black/50 rounded-2xl p-6 border border-white/10 space-y-4">
                  <div>
                    <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1">
                      Without Seeakk
                    </p>
                    <p className="text-xs text-gray-300 leading-normal">{activePersona.pain}</p>
                  </div>

                  <div className="pt-3 border-t border-white/10">
                    <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>With Seeakk Accountability Engine</span>
                    </p>
                    <p className="text-xs text-emerald-200 leading-relaxed">{activePersona.solution}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Operational Friction Stats */}
        <div className="mt-20 grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {[
            {
              metric: '71%',
              label: 'Leads Never Contacted',
              desc: 'In traditional sales setups, 7 out of 10 ad leads are never called within 24 hours.',
            },
            {
              metric: '44%',
              label: 'Sales Follow-up Abandonment',
              desc: 'Sales reps give up after a single attempt, causing massive revenue leakage.',
            },
            {
              metric: '0 Audit Trail',
              label: 'Agency vs. Sales Friction',
              desc: 'Agencies have zero visibility into whether leads were actually called or ignored.',
            },
            {
              metric: '100% Solved',
              label: 'Seeakk Operational Control',
              desc: 'Every lead is assigned, tracked, audited, and enforced by strict workflow locks.',
            },
          ].map((card, idx) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-emerald-500/40 transition-all group"
            >
              <p className="text-3xl font-black text-emerald-400 mb-2 group-hover:scale-105 transition-transform origin-left">
                {card.metric}
              </p>
              <h4 className="text-sm font-bold text-white mb-2">{card.label}</h4>
              <p className="text-xs text-gray-400 leading-relaxed">{card.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA Bridge Link */}
        <div className="mt-16 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-bold text-emerald-400 hover:text-emerald-300 transition-colors bg-emerald-950/60 px-6 py-3 rounded-full border border-emerald-500/30"
          >
            <span>Bridge the Gap Between Your Agency & Sales Operations</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default EmotionalHook;
