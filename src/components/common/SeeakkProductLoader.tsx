import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, ShieldCheck, Clock, Zap, CheckCircle2 } from 'lucide-react';
import BrandLogo from '../BrandLogo';

const loadingStatuses = [
  { text: 'Initializing Lead Custody Engine', icon: Target },
  { text: 'Enforcing Follow-Up Response Clocks', icon: Clock },
  { text: 'Verifying LOB Prevention Rules', icon: ShieldCheck },
  { text: 'Securing Workspace & Audit Logs', icon: Zap },
];

interface SeeakkProductLoaderProps {
  message?: string;
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SeeakkProductLoader: React.FC<SeeakkProductLoaderProps> = ({
  message,
  fullScreen = true,
  size = 'md',
  className = '',
}) => {
  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % loadingStatuses.length);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  const currentStatus = loadingStatuses[statusIndex];
  const CurrentStatusIcon = currentStatus.icon;

  const content = (
    <div className={`flex flex-col items-center justify-center p-6 text-center select-none ${className}`}>
      
      {/* Brand Logo Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <BrandLogo width={160} height={52} className="mx-auto" imgClassName="object-center" />
      </motion.div>

      {/* Main Animated Lead Control Radar Node */}
      <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center mb-8">
        
        {/* Outer Pulsating Ambient Glow */}
        <motion.div
          animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400/30 via-teal-400/20 to-emerald-500/30 blur-2xl"
        />

        {/* Outer Expanding Radar Wave 1 */}
        <motion.div
          animate={{ scale: [0.8, 1.4], opacity: [0.8, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut' }}
          className="absolute inset-0 rounded-full border-2 border-emerald-400/60"
        />

        {/* Outer Expanding Radar Wave 2 (Staggered) */}
        <motion.div
          animate={{ scale: [0.8, 1.4], opacity: [0.8, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut', delay: 1.2 }}
          className="absolute inset-0 rounded-full border-2 border-teal-400/60"
        />

        {/* Rotating Radar Line Sweep */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-2 rounded-full border border-emerald-200/50 flex items-center justify-center"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-emerald-500 shadow-md shadow-emerald-500/80" />
        </motion.div>

        {/* Orbiting Lead Nodes */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full flex items-center justify-center"
        >
          <div className="absolute top-1 left-4 w-3 h-3 rounded-full bg-teal-500 shadow-lg shadow-teal-500/60 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-white" />
          </div>
          <div className="absolute bottom-2 right-4 w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/60" />
        </motion.div>

        {/* Central Core Circle (3D Glass Bullseye) */}
        <motion.div
          animate={{ scale: [0.96, 1.04, 0.96] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 p-0.5 shadow-xl shadow-emerald-600/30 flex items-center justify-center z-10"
        >
          <div className="w-full h-full rounded-full bg-white p-2 flex items-center justify-center shadow-inner">
            <div className="w-full h-full rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center relative overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={statusIndex}
                  initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.5, rotate: 20 }}
                  transition={{ duration: 0.3 }}
                  className="text-emerald-600"
                >
                  <CurrentStatusIcon className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-600" />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Dynamic Status Pill */}
      <div className="min-h-[36px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={statusIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50/90 border border-emerald-200/90 text-emerald-800 text-xs sm:text-sm font-bold shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{message || currentStatus.text}</span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Sub-indicator */}
      <p className="mt-3 text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
        Lead Performance Dynamics • Seeakk Platform
      </p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-white/95 backdrop-blur-md">
        {content}
      </div>
    );
  }

  return content;
};

export default SeeakkProductLoader;
