import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
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
  FileCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const simulatorSteps = [
  {
    id: 'step-1',
    stage: 'Lead Received & Tagged',
    actor: 'Agency / Campaign Import',
    title: 'Lead Ingested & Timestamped',
    details: 'Lead #8492 (Premium Client) Received From Marketing Ad Campaign Webhook / CSV Import.',
    status: 'Verified & Logged',
    statusColor: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: Sparkles,
  },
  {
    id: 'step-2',
    stage: 'Accountability Assignment',
    actor: 'Seeakk Distribution Engine',
    title: 'Geo & Office Assignment',
    details: 'Routed To Branch: Financial District. Assigned To: Rahul (Senior Sales Rep).',
    status: 'Assigned',
    statusColor: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Building2,
  },
  {
    id: 'step-3',
    stage: 'Mandatory Follow-Up',
    actor: 'Assigned Sales Rep',
    title: 'Follow-Up SLA Initiated',
    details: 'Strict 15-Minute SLA Clock Active. Follow-Up Locked In Calendar To Prevent Loss Of Business (LOB).',
    status: 'SLA Active',
    statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: Clock,
  },
  {
    id: 'step-4',
    stage: 'Supervisor Audit',
    actor: 'Branch Manager',
    title: 'Stage Rule Verification',
    details: 'Advance Payment Receipt & Required Dynamic Stage Rules Verified By Supervisor.',
    status: 'Audited',
    statusColor: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: ShieldCheck,
  },
  {
    id: 'step-5',
    stage: 'Revenue Realized',
    actor: 'Executive Dashboard',
    title: 'Deal Converted & Tracked',
    details: '$45,000 Contract Signed. Full Agency-To-Business Audit Trail Locked.',
    status: 'Converted',
    statusColor: 'bg-emerald-500 text-white font-bold border-emerald-600',
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
      className="relative pt-28 pb-24 lg:pt-36 lg:pb-32 bg-gradient-to-b from-emerald-50/70 via-slate-50/40 to-white text-slate-900 overflow-hidden"
    >
      {/* Soft Ambient Background Blur Circles */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-200/40 via-emerald-100/20 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-[450px] h-[450px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-teal-200/30 via-transparent to-transparent blur-3xl pointer-events-none" />

      {/* Light Grid Background Texture */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f080_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f080_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

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
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Enterprise Lead Performance & Loss Of Business (LOB) Prevention</span>
            </div>

            {/* Core Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.08] mb-6">
              Your Leads Aren't The Problem.{' '}
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent">
                The Missing Accountability Is.
              </span>
            </h1>

            {/* Core Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal">
              Seeakk Manages, Tracks, Monitors, Verifies, And Audits Leads Imported Or Received From Marketing Campaigns And Agencies. Enforcing Lead Custody, Mandatory Follow-Up SLA Clocks, And Performance-Based Locks To Prevent <strong>Loss Of Business (LOB)</strong>.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-2.5 justify-center lg:justify-start mb-10">
              {[
                '100% Lead Traceability',
                'Loss Of Business (LOB) Prevention',
                'Mandatory Follow-Up Gates',
                'Performance Target Locking',
                'Geo-Fenced Attendance',
              ].map((pill) => (
                <div
                  key={pill}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-semibold text-slate-700 shadow-sm"
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
                className="w-full sm:w-auto px-7 py-4 bg-white hover:bg-slate-50 text-slate-800 rounded-full font-bold text-base border border-gray-200 transition-all duration-300 flex items-center justify-center gap-2 shadow-sm"
              >
                <Play className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                <span>Interactive Platform Tour</span>
              </a>
            </div>

            {/* Trust Sub-bar */}
            <div className="mt-10 pt-8 border-t border-gray-200 grid grid-cols-3 gap-4 text-center lg:text-left">
              <div>
                <p className="text-2xl sm:text-3xl font-black text-emerald-600">100%</p>
                <p className="text-xs font-medium text-slate-500 mt-1">Lead Custody & Audit Trail</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-emerald-600">0%</p>
                <p className="text-xs font-medium text-slate-500 mt-1">Uncontacted Lead Leakage</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-emerald-600">4.2x</p>
                <p className="text-xs font-medium text-slate-500 mt-1">Faster SLA Follow-Up Velocity</p>
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
            {/* Outer White Shadow Card Container */}
            <div className="relative rounded-3xl p-1.5 bg-gradient-to-b from-emerald-100 via-white to-gray-100 shadow-2xl shadow-slate-950/10 border border-gray-200">
              <div className="bg-white rounded-[22px] p-6 overflow-hidden relative shadow-inner">
                {/* Simulator Header Bar */}
                <div className="flex items-center justify-between pb-4 mb-5 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Live Chain Of Custody Simulator
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                    className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 transition-colors"
                  >
                    <RefreshCw className={`w-3 h-3 ${isAutoPlaying ? 'animate-spin text-emerald-600' : ''}`} />
                    <span>{isAutoPlaying ? 'Auto Stepping' : 'Paused'}</span>
                  </button>
                </div>

                {/* Step Tabs */}
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
                            ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-500/20'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                        }`}
                      >
                        <span>0{idx + 1}</span>
                        <span className="hidden sm:inline">{step.stage}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Step Display Card */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="bg-slate-50 rounded-2xl p-5 border border-slate-200 relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200">
                          <currentStep.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-emerald-700 font-bold">
                            {currentStep.stage}
                          </p>
                          <h4 className="text-sm font-bold text-slate-900">{currentStep.title}</h4>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase border ${currentStep.statusColor}`}
                      >
                        {currentStep.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mb-4 leading-relaxed bg-white p-3 rounded-xl border border-slate-200 font-mono">
                      {currentStep.details}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-3 border-t border-slate-200">
                      <span className="flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Owner: <strong className="text-slate-900">{currentStep.actor}</strong></span>
                      </span>

                      <span className="text-emerald-700 font-bold">Audit Verified ✓</span>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Bottom Alert Pill */}
                <div className="mt-5 bg-emerald-50 rounded-xl p-3 border border-emerald-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-xs text-emerald-900 font-medium">
                      Loss Of Business (LOB) Prevention Active
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded uppercase">
                    100% Accountable
                  </span>
                </div>
              </div>
            </div>

            {/* Floating Badges */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-6 -left-6 bg-white text-slate-900 p-3 rounded-2xl border border-gray-200 shadow-xl hidden sm:flex items-center gap-3"
            >
              <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-semibold uppercase">Loss Of Business (LOB) Alert</p>
                <p className="text-xs font-bold text-emerald-700">Prevented By Seeakk</p>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute -bottom-6 -right-6 bg-white text-slate-900 p-3.5 rounded-2xl border border-gray-200 shadow-xl hidden sm:flex items-center gap-3"
            >
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-semibold uppercase">Target Enforced Lock</p>
                <p className="text-xs font-bold text-slate-900">Operational Discipline</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LandingHero;
