import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const LandingCTA: React.FC = () => {
  return (
    <section className="py-24 lg:py-36 bg-gray-950 text-white relative overflow-hidden">
      {/* Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/20 via-emerald-950/10 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl p-10 sm:p-16 bg-gradient-to-br from-gray-900 via-gray-950 to-emerald-950/50 border border-emerald-500/30 shadow-2xl text-center relative overflow-hidden"
        >
          {/* Background Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-6">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Transform Your Sales Operations Today</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-6xl font-black text-white tracking-tight leading-tight max-w-4xl mx-auto mb-6">
            Stop Losing Revenue.{' '}
            <span className="bg-gradient-to-r from-emerald-300 via-emerald-400 to-teal-200 bg-clip-text text-transparent">
              Bridge Your Accountability Gap.
            </span>
          </h2>

          <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Join enterprise sales teams, agencies, and regional branch networks using Seeakk to track 100% of ad leads, enforce follow-up SLAs, and lock in revenue.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center mb-10">
            <Link
              to="/login"
              className="w-full sm:w-auto px-9 py-4 bg-gradient-to-r from-emerald-500 via-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-base rounded-full shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-3 group active:scale-95 transition-all"
            >
              <span>Start Your Free 30-Day Trial</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white font-semibold text-base rounded-full border border-white/10 transition-all flex items-center justify-center gap-2"
            >
              <span>Schedule Live Operations Tour</span>
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-xs text-gray-400 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>No Credit Card Required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Instant Setup in Minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>100% Web & Mobile Ready</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LandingCTA;
