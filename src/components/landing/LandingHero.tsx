import React from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Play,
  Check,
  TrendingUp,
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
          
          {/* Left Column: Messaging & Hero Copy (55% width) */}
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
            <p className="text-base sm:text-lg text-slate-600 mb-5 leading-relaxed max-w-[650px] mx-auto lg:mx-0 font-normal">
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

          {/* Right Column: Hero Section Image (45% width) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-5 flex items-center justify-center mt-10 lg:mt-0 relative"
          >
            <div className="relative w-full flex items-center justify-center">
              {/* Soft Ambient Radial Glow */}
              <div className="absolute inset-0 rounded-full bg-emerald-400/20 blur-3xl pointer-events-none" />

              {/* Floating Image Wrapper */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="relative z-10 w-full flex justify-center"
              >
                <img
                  src="/herosection.PNG"
                  alt="Seeakk Lead Accountability Platform"
                  loading="eager"
                  decoding="async"
                  className="w-full max-w-[620px] lg:max-w-[680px] max-h-[560px] lg:max-h-[620px] h-auto object-contain drop-shadow-[0_25px_50px_rgba(0,0,0,0.12)]"
                />
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Trust Cards / Metrics Bar */}
        <div className="mt-16 pt-10 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow text-center sm:text-left flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0 hidden sm:flex">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-emerald-600 tracking-tight">100%</p>
              <p className="text-sm font-bold text-slate-900 mt-1">Lead Custody & Audit Trail</p>
              <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
                Every lead captured, tracked & verified with complete audit trail.
              </p>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow text-center sm:text-left flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0 hidden sm:flex">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-emerald-600 tracking-tight">0%</p>
              <p className="text-sm font-bold text-slate-900 mt-1">Uncontacted Lead Leakage</p>
              <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
                No lead left behind. Every lead is owned & actioned.
              </p>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow text-center sm:text-left flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0 hidden sm:flex">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-emerald-600 tracking-tight">4.2x</p>
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
