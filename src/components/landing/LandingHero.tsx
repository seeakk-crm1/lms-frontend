import React from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Play,
  Target,
  Users,
  TrendingUp,
  Clock,
  Check,
  Shield,
  BarChart3,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const LandingHero: React.FC = () => {
  return (
    <section
      id="positioning"
      className="relative pt-28 pb-20 sm:pt-36 sm:pb-28 lg:pt-36 lg:pb-32 bg-gradient-to-b from-emerald-50/50 via-slate-50/25 to-white text-slate-900 overflow-hidden min-h-[90vh] flex flex-col justify-center"
    >
      {/* Ambient Radial Lighting & Subtle Grid Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] sm:w-[1300px] h-[550px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-200/35 via-emerald-100/15 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 right-10 w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-teal-200/25 via-transparent to-transparent blur-3xl pointer-events-none" />
      
      {/* Light Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f070_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f070_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Messaging & Hero Copy (~55% width) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="lg:col-span-7 text-center lg:text-left space-y-6"
          >
            {/* Enterprise Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100/80 border border-emerald-200/90 text-emerald-800 text-xs font-bold uppercase tracking-widest shadow-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Enterprise Lead Performance & Loss Of Business (LOB) Prevention</span>
            </div>

            {/* Core Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-[76px] font-black tracking-tight text-slate-900 leading-[1.05]">
              Every Missed Follow-Up <br className="hidden sm:inline" />
              Is a <span className="text-emerald-600">Missed Opportunity.</span>
            </h1>

            {/* Core Subtitle Description */}
            <p className="text-base sm:text-lg lg:text-[19px] text-slate-600 leading-relaxed max-w-[650px] mx-auto lg:mx-0 font-normal">
              Seeakk ensures every lead is owned, every follow-up is completed, every action is tracked, and every opportunity is converted into measurable revenue.
            </p>

            {/* Brand Value Statement */}
            <div>
              <p className="text-base sm:text-lg lg:text-[21px] font-bold text-emerald-600 tracking-tight leading-snug">
                Seeakk = The Accountability Platform That Turns Leads Into Revenue.
              </p>
            </div>

            {/* Feature Chips */}
            <div className="flex flex-wrap gap-2.5 sm:gap-3 justify-center lg:justify-start pt-2">
              {[
                '100% Lead Traceability',
                'Loss Of Business (LOB) Prevention',
                'Mandatory Follow-Up Gates',
                'Performance Target Locking',
                'Geo-Fenced Attendance',
              ].map((chip) => (
                <div
                  key={chip}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 shadow-sm hover:border-emerald-300 transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{chip}</span>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-2">
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-700 hover:from-emerald-600 hover:to-teal-800 text-white rounded-full font-bold text-base transition-all duration-300 shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-3 group active:scale-95"
              >
                <span>Deploy Seeakk Free For 30 Days</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <a
                href="#showcase"
                className="w-full sm:w-auto px-7 py-4 bg-white hover:bg-slate-50 text-slate-800 rounded-full font-bold text-base border border-slate-200 transition-all duration-300 flex items-center justify-center gap-2.5 shadow-sm hover:shadow active:scale-95"
              >
                <Play className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                <span>Interactive Platform Tour</span>
              </a>
            </div>
          </motion.div>

          {/* Right Column: Premium 3D Target & SaaS Graphics Composition (~45% width) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5 relative mt-8 lg:mt-0 flex justify-center items-center"
          >
            {/* Soft Background Radial Light Layer behind visual */}
            <div className="absolute w-[360px] h-[360px] bg-emerald-200/40 rounded-full blur-3xl pointer-events-none" />

            {/* Outer Graphics Canvas Container */}
            <div className="relative w-full max-w-[460px] aspect-square flex items-center justify-center">
              
              {/* Back Dashboard Glass Card */}
              <div className="absolute right-0 top-6 w-[82%] bg-white/90 backdrop-blur-md rounded-3xl p-5 border border-emerald-100 shadow-2xl shadow-emerald-950/10 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">Lead Conversion Rate</span>
                  </div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">
                    +42.8%
                  </span>
                </div>

                {/* Minimalist SVG Chart Line */}
                <div className="h-16 w-full flex items-end">
                  <svg className="w-full h-full text-emerald-500" viewBox="0 0 200 60" fill="none" preserveAspectRatio="none">
                    <path
                      d="M0,45 Q40,35 80,40 T160,15 T200,5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M0,45 Q40,35 80,40 T160,15 T200,5 L200,60 L0,60 Z"
                      fill="url(#emerald-grad)"
                      opacity="0.15"
                    />
                    <defs>
                      <linearGradient id="emerald-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#059669" />
                        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                {/* Team Avatars & Shield Pill */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex -space-x-2 overflow-hidden">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-emerald-700">
                      JD
                    </div>
                    <div className="w-7 h-7 rounded-full bg-teal-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-teal-700">
                      SK
                    </div>
                    <div className="w-7 h-7 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-700">
                      +4
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <Shield className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                    <span>Audit Verified</span>
                  </div>
                </div>
              </div>

              {/* 3D Bullseye Target Icon in Foreground */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute left-2 bottom-8 z-20 flex items-center justify-center"
              >
                <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 p-1 shadow-2xl shadow-emerald-600/30 flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center p-3 shadow-inner">
                    <div className="w-full h-full rounded-full bg-emerald-50 border-4 border-emerald-500 flex items-center justify-center relative">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-lg">
                        <Target className="w-10 h-10 sm:w-12 sm:h-12" />
                      </div>
                      <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-emerald-400 animate-ping" />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Floating Orbital Badge 1 - Top Right */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-0 right-4 z-30 p-2.5 rounded-full bg-white border border-slate-200 shadow-xl text-emerald-600"
              >
                <Clock className="w-5 h-5" />
              </motion.div>

              {/* Floating Orbital Badge 2 - Middle Right */}
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
                className="absolute top-24 -right-3 z-30 p-2.5 rounded-full bg-white border border-slate-200 shadow-xl text-teal-600"
              >
                <Users className="w-5 h-5" />
              </motion.div>

              {/* Floating Orbital Badge 3 - Bottom Right */}
              <motion.div
                animate={{ y: [0, -7, 0] }}
                transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
                className="absolute bottom-4 right-8 z-30 p-2.5 rounded-full bg-white border border-slate-200 shadow-xl text-emerald-700"
              >
                <BarChart3 className="w-5 h-5" />
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Metrics Bar Cards */}
        <div className="mt-16 pt-10 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">
              <Check className="w-6 h-6" />
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-black text-emerald-600 tracking-tight">100%</p>
              <p className="text-sm font-bold text-slate-900 mt-1">Lead Custody & Audit Trail</p>
              <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
                Every lead captured, tracked & verified with complete audit trail.
              </p>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-black text-emerald-600 tracking-tight">0%</p>
              <p className="text-sm font-bold text-slate-900 mt-1">Uncontacted Lead Leakage</p>
              <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
                No lead left behind. Every lead is owned & actioned.
              </p>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-black text-emerald-600 tracking-tight">4.2x</p>
              <p className="text-sm font-bold text-slate-900 mt-1">Faster Response Time</p>
              <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
                Respond faster, convert more, and close deals efficiently.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingHero;
