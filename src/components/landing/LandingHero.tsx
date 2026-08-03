import React from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Lock,
  Building2,
  TrendingUp,
  Clock,
  Play,
  Target,
  Users,
  BarChart3,
  Check,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const LandingHero: React.FC = () => {
  return (
    <section
      id="positioning"
      className="relative pt-28 pb-20 sm:pt-36 sm:pb-28 lg:pt-36 lg:pb-32 bg-gradient-to-b from-emerald-50/60 via-slate-50/30 to-white text-slate-900 overflow-hidden"
    >
      {/* Soft Ambient Background Blur Circles */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] sm:w-[1200px] h-[500px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-200/35 via-emerald-100/15 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-[450px] h-[450px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-teal-200/25 via-transparent to-transparent blur-3xl pointer-events-none" />

      {/* Light Grid Background Texture */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f080_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f080_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Messaging & Hero Copy */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="lg:col-span-7 text-center lg:text-left"
          >
            {/* Enterprise Tag */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-widest mb-6 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Enterprise Lead Performance & Loss Of Business (LOB) Prevention</span>
            </div>

            {/* Core Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.08] mb-6">
              Every Missed Follow-Up <br className="hidden sm:inline" />
              Is a{' '}
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent">
                Missed Opportunity.
              </span>
            </h1>

            {/* Core Subtitle Description */}
            <p className="text-base sm:text-lg text-slate-600 mb-5 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal">
              Seeakk ensures every lead is owned, every follow-up is completed, every action is tracked, and every opportunity is converted into measurable revenue.
            </p>

            {/* Value Statement */}
            <div className="mb-8">
              <p className="text-base sm:text-lg lg:text-xl font-extrabold text-emerald-700 leading-snug tracking-tight">
                Seeakk = The Accountability Platform That Turns Leads Into Revenue.
              </p>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-2.5 justify-center lg:justify-start mb-8">
              {[
                '100% Lead Traceability',
                'Loss Of Business (LOB) Prevention',
                'Mandatory Follow-Up Gates',
                'Performance Target Locking',
                'Geo-Fenced Attendance',
              ].map((pill) => (
                <div
                  key={pill}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-semibold text-slate-700 shadow-sm hover:border-emerald-300 transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{pill}</span>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-700 hover:from-emerald-600 hover:to-teal-800 text-white rounded-full font-bold text-base transition-all duration-300 shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 group active:scale-95"
              >
                <span>Deploy Seeakk Free For 30 Days</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <a
                href="#showcase"
                className="w-full sm:w-auto px-7 py-4 bg-white hover:bg-slate-50 text-slate-800 rounded-full font-bold text-base border border-gray-200 transition-all duration-300 flex items-center justify-center gap-2 shadow-sm active:scale-95"
              >
                <Play className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                <span>Interactive Platform Tour</span>
              </a>
            </div>
          </motion.div>

          {/* Right Column: Premium SaaS Dashboard & Accountability Visual Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5 relative mt-8 lg:mt-0"
          >
            {/* Outer Container Card */}
            <div className="relative rounded-3xl p-2 bg-gradient-to-b from-emerald-100 via-white to-slate-100 shadow-2xl shadow-slate-950/10 border border-slate-200/90">
              <div className="bg-white rounded-[22px] p-6 overflow-hidden relative shadow-inner space-y-5">
                
                {/* Header Mockup */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                        Lead Accountability Control
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium">Real-Time Lead Journey & Audit</p>
                    </div>
                  </div>

                  <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                    100% Accountable
                  </span>
                </div>

                {/* Dashboard Lead Activity Stream */}
                <div className="space-y-3">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-emerald-600" />
                        <span>AcroTech Enterprise ($45,000)</span>
                      </div>
                      <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded font-bold uppercase">
                        Converted
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 font-medium">
                      Assigned: Rahul (Financial District Branch) • Follow-Up Completed
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                      <span>Audit Status: Verified ✓</span>
                      <span className="text-emerald-700 font-bold">100% Custody Maintained</span>
                    </div>
                  </div>

                  <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-950">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-emerald-600" />
                        <span>Metro Global Follow-Up Timer</span>
                      </div>
                      <span className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded font-bold uppercase">
                        14m Remaining
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-800 font-medium">
                      Response Clock Active • Lead Locked in Schedule
                    </p>
                  </div>
                </div>

                {/* Performance Analytics Widget */}
                <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 text-white p-4 rounded-2xl border border-slate-800 flex items-center justify-between shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-300 font-medium">Conversion Velocity</p>
                      <p className="text-sm font-black text-white">+42.8% Conversion Increase</p>
                    </div>
                  </div>
                  <BarChart3 className="w-6 h-6 text-emerald-400 opacity-80" />
                </div>
              </div>
            </div>

            {/* Floating Badge 1 - Top Left */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-5 -left-5 bg-white text-slate-900 p-3 rounded-2xl border border-slate-200 shadow-xl hidden sm:flex items-center gap-3"
            >
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200">
                <Check className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-semibold uppercase">Zero Lead Leakage</p>
                <p className="text-xs font-bold text-emerald-700">100% Follow-Up Verified</p>
              </div>
            </motion.div>

            {/* Floating Badge 2 - Bottom Right */}
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute -bottom-5 -right-5 bg-white text-slate-900 p-3.5 rounded-2xl border border-slate-200 shadow-xl hidden sm:flex items-center gap-3"
            >
              <div className="p-2 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
                <Lock className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-semibold uppercase">Target Enforced Lock</p>
                <p className="text-xs font-bold text-slate-900">Operational Discipline</p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom Trust Cards / Metrics Bar */}
        <div className="mt-16 pt-10 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow text-center sm:text-left">
            <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-emerald-600 tracking-tight">100%</p>
            <p className="text-sm font-bold text-slate-900 mt-2">Lead Custody & Audit Trail</p>
            <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
              Every lead captured, tracked & verified with complete audit trail.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow text-center sm:text-left">
            <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-emerald-600 tracking-tight">0%</p>
            <p className="text-sm font-bold text-slate-900 mt-2">Uncontacted Lead Leakage</p>
            <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
              No lead left behind. Every lead is owned & actioned.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow text-center sm:text-left">
            <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-emerald-600 tracking-tight">4.2x</p>
            <p className="text-sm font-bold text-slate-900 mt-2">Faster Response Time</p>
            <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
              Respond faster, convert more, and close deals efficiently.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingHero;
