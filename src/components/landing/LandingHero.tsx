import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight, CheckCircle2, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

const LandingHero: React.FC = () => {
  return (
    <section
      id="positioning"
      className="relative pt-28 pb-20 sm:pt-36 sm:pb-28 lg:pt-40 lg:pb-32 bg-gradient-to-b from-emerald-50/70 via-slate-50/40 to-white text-slate-900 overflow-hidden"
    >
      {/* Soft Ambient Background Blur Circles */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] sm:w-[1200px] h-[550px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-200/40 via-emerald-100/20 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 right-0 w-[450px] h-[450px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-teal-200/30 via-transparent to-transparent blur-3xl pointer-events-none" />

      {/* Light Grid Background Texture */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f080_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f080_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="flex flex-col items-center text-center"
        >
          {/* Enterprise Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100/90 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-widest mb-6 sm:mb-8 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Enterprise Lead Performance & Loss Of Business (LOB) Prevention</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-[68px] font-black tracking-tight text-slate-900 leading-[1.08] max-w-4xl mx-auto mb-6 sm:mb-8">
            Every Missed Follow-Up Is a Missed Opportunity.
          </h1>

          {/* Hero Description */}
          <p className="text-base sm:text-lg lg:text-[21px] text-slate-600 leading-relaxed sm:leading-[1.6] max-w-3xl mx-auto mb-6 sm:mb-8 font-normal">
            Seeakk ensures every lead is owned, every follow-up is completed, every action is tracked, and every opportunity is converted into measurable revenue.
          </p>

          {/* Value Statement */}
          <div className="inline-block bg-emerald-50/90 border border-emerald-200/90 rounded-2xl px-5 sm:px-7 py-3.5 sm:py-4 mb-8 sm:mb-10 shadow-sm">
            <p className="text-lg sm:text-xl lg:text-[23px] font-bold text-emerald-700 tracking-tight">
              Seeakk = The Accountability Platform That Turns Leads Into Revenue.
            </p>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap gap-2.5 sm:gap-3 justify-center max-w-3xl mx-auto mb-10 sm:mb-12">
            {[
              '100% Lead Traceability',
              'Loss Of Business (LOB) Prevention',
              'Mandatory Follow-Up Gates',
              'Performance Target Locking',
              'Geo-Fenced Attendance',
            ].map((pill) => (
              <div
                key={pill}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 shadow-sm hover:border-emerald-300 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{pill}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center w-full max-w-md sm:max-w-none mx-auto mb-14 sm:mb-16">
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

          {/* Metrics Section Cards */}
          <div className="w-full max-w-4xl border-t border-slate-200/80 pt-10 grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow text-center">
              <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-emerald-600 tracking-tight">100%</p>
              <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-2">Lead Custody & Audit Trail</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow text-center">
              <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-emerald-600 tracking-tight">0%</p>
              <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-2">Uncontacted Lead Leakage</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow text-center">
              <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-emerald-600 tracking-tight">4.2x</p>
              <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-2">Faster Response Time Velocity</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LandingHero;
