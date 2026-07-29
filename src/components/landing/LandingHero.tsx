import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle2,
  Lock,
  UserCheck,
  Building2,
  TrendingUp,
  Clock,
  Play,
  Sparkles,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const simulatorSteps = [
  {
    id: 'step-1',
    stage: 'Agency Generation',
    actor: 'Digital Agency API',
    title: 'Lead Captured & Timestamped',
    details: 'Lead #8492 (Premium Enterprise Client) ingested instantly from Meta/Google Ad webhook.',
    status: 'Verified',
    statusColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    icon: Sparkles,
  },
  {
    id: 'step-2',
    stage: 'Automated Routing',
    actor: 'Seeakk Distribution Engine',
    title: 'Geo & LOB Office Assignment',
    details: 'Routed to Branch: Dubai Financial District. Assigned to: Rahul (Senior Advisor).',
    status: 'Assigned',
    statusColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    icon: Building2,
  },
  {
    id: 'step-3',
    stage: 'Mandatory Follow-up',
    actor: 'Assigned Sales Exec',
    title: 'Follow-up Timer Initiated',
    details: 'Strict 15-minute SLA clock running. Next follow-up locked to calendar.',
    status: 'Clock Ticking',
    statusColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    icon: Clock,
  },
  {
    id: 'step-4',
    stage: 'Supervisor Audit',
    actor: 'Branch Manager',
    title: 'Stage Rule Verification',
    details: 'Advance payment proof & mandatory stage form rules submitted & verified.',
    status: 'Audited',
    statusColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    icon: ShieldCheck,
  },
  {
    id: 'step-5',
    stage: 'Revenue Realized',
    actor: 'Executive Dashboard',
    title: 'Deal Closed & Attributed',
    details: '$45,000 Contract signed. Full agency-to-enterprise audit trail locked.',
    status: 'Converted',
    statusColor: 'bg-emerald-400 text-gray-950 font-bold border-emerald-300',
    icon: TrendingUp,
  },
];

const LandingHero: React.FC = () => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setActiveStepIndex((prev) => (prev + 1) % simulatorSteps.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const currentStep = simulatorSteps[activeStepIndex];

  return (
    <section
      id="positioning"
      className="relative pt-36 pb-24 lg:pt-48 lg:pb-36 bg-gray-950 text-white overflow-hidden"
    >
      {/* Ambient Radial Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-600/20 via-emerald-950/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-teal-500/10 via-transparent to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-600/10 via-transparent to-transparent blur-3xl pointer-events-none" />

      {/* Grid Mesh Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293715_1px,transparent_1px),linear-gradient(to_bottom,#1f293715_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Messaging & Hero Copy */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="lg:col-span-7 text-center lg:text-left"
          >
            {/* Positioning Tag */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-md">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>The Accountability Bridge for Enterprise Sales</span>
            </div>

            {/* Core Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.08] mb-6">
              Your leads aren't the problem.{' '}
              <span className="bg-gradient-to-r from-emerald-300 via-emerald-400 to-teal-200 bg-clip-text text-transparent">
                The missing accountability is.
              </span>
            </h1>

            {/* Core Subtitle */}
            <p className="text-lg sm:text-xl text-gray-300 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal">
              Seeakk creates a bulletproof operational bridge between lead generation agencies and company
              sales teams. Enforcing true lead custody, mandatory follow-up SLA clocks, and performance-based
              locks so zero revenue slips away.
            </p>

            {/* Key Value Pill Tags */}
            <div className="flex flex-wrap gap-2.5 justify-center lg:justify-start mb-10">
              {[
                '100% Lead Auditability',
                'Mandatory Follow-up Gates',
                'Performance Target Locking',
                'Geo-Fenced Attendance',
              ].map((pill) => (
                <div
                  key={pill}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-gray-200"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{pill}</span>
                </div>
              ))}
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-500 via-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-full font-bold text-base transition-all duration-300 shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-3 group active:scale-95"
              >
                <span>Deploy Seeakk Free for 30 Days</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <a
                href="#showcase"
                className="w-full sm:w-auto px-7 py-4 bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white rounded-full font-semibold text-base border border-white/10 hover:border-white/20 transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-sm"
              >
                <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                <span>Interactive Product Tour</span>
              </a>
            </div>

            {/* Social Trust Sub-bar */}
            <div className="mt-10 pt-8 border-t border-white/10 grid grid-cols-3 gap-4 text-center lg:text-left">
              <div>
                <p className="text-2xl sm:text-3xl font-black text-emerald-400">99.8%</p>
                <p className="text-xs font-medium text-gray-400 mt-1">Lead Custody & Retention</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-emerald-400">0%</p>
                <p className="text-xs font-medium text-gray-400 mt-1">Unclaimed Lead Leakage</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-emerald-400">4.2x</p>
                <p className="text-xs font-medium text-gray-400 mt-1">Faster Follow-up Velocity</p>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Live Interactive Accountability Simulator Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="lg:col-span-5 relative mt-6 lg:mt-0"
          >
            {/* Floating Outer Glass Card Container */}
            <div className="relative rounded-3xl p-1 bg-gradient-to-b from-emerald-500/30 via-white/10 to-emerald-950/40 shadow-2xl shadow-emerald-950/60 border border-white/10 backdrop-blur-2xl">
              <div className="bg-gray-950/90 rounded-[22px] p-6 overflow-hidden relative">
                {/* Simulator Header Bar */}
                <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      Live Chain of Custody Simulator
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                    className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-400 hover:text-white px-2.5 py-1 rounded-md bg-white/5 border border-white/10 transition-colors"
                  >
                    <RefreshCw className={`w-3 h-3 ${isAutoPlaying ? 'animate-spin' : ''}`} />
                    <span>{isAutoPlaying ? 'Auto Stepping' : 'Paused'}</span>
                  </button>
                </div>

                {/* Step Selector Tabs */}
                <div className="flex gap-1.5 mb-6 overflow-x-auto pb-2 scrollbar-none">
                  {simulatorSteps.map((step, idx) => {
                    const isActive = idx === activeStepIndex;
                    return (
                      <button
                        key={step.id}
                        type="button"
                        onClick={() => {
                          setActiveStepIndex(idx);
                          setIsAutoPlaying(false);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                          isActive
                            ? 'bg-emerald-500 text-gray-950 font-bold shadow-md shadow-emerald-500/20'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200 border border-white/5'
                        }`}
                      >
                        <span>0{idx + 1}</span>
                        <span className="hidden sm:inline">{step.stage}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Active Step Dynamic Card Showcase */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="bg-gradient-to-br from-gray-900 via-gray-900/80 to-emerald-950/30 rounded-2xl p-5 border border-white/10 relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          <currentStep.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold">
                            {currentStep.stage}
                          </p>
                          <h4 className="text-sm font-bold text-white">{currentStep.title}</h4>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase border ${currentStep.statusColor}`}
                      >
                        {currentStep.status}
                      </span>
                    </div>

                    <p className="text-xs text-gray-300 mb-4 leading-relaxed bg-black/30 p-3 rounded-xl border border-white/5 font-mono">
                      {currentStep.details}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-gray-400 pt-3 border-t border-white/10">
                      <span className="flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Owner: <strong className="text-gray-200">{currentStep.actor}</strong></span>
                      </span>

                      <span className="text-emerald-400 font-bold">Audit Locked ✓</span>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Bottom Floating Alert Pill */}
                <div className="mt-5 bg-emerald-950/40 rounded-xl p-3 border border-emerald-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-xs text-gray-300">
                      Zero unassigned leads • 100% agency accountability
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded uppercase">
                    Verified
                  </span>
                </div>
              </div>
            </div>

            {/* Decorative Floating Badges */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-6 -left-6 bg-gray-900/90 text-white p-3 rounded-2xl border border-emerald-500/30 shadow-xl backdrop-blur-md hidden sm:flex items-center gap-3"
            >
              <div className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-semibold uppercase">Lead Leakage Alert</p>
                <p className="text-xs font-bold text-emerald-400">Prevented by Seeakk</p>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute -bottom-6 -right-6 bg-gray-900/90 text-white p-3.5 rounded-2xl border border-emerald-500/30 shadow-xl backdrop-blur-md hidden sm:flex items-center gap-3"
            >
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-semibold uppercase">Target Enforced Lock</p>
                <p className="text-xs font-bold text-white">Operational Discipline</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LandingHero;
