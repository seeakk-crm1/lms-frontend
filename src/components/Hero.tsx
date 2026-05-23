import React from 'react';
import { motion } from 'framer-motion';
import { PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const benefits = [
  'Real-time lead tracking',
  'Team accountability',
  'Attendance control',
  'Performance-based locking',
  'Automated follow-up workflows',
  'Supervisor approval systems',
  'Revenue & target monitoring',
];

const Hero = () => {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-gradient-to-b from-emerald-50/50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center lg:text-left"
          >
            <p className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-4">
              SEEAKK — Lead Performance Dynamics
            </p>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.08] mb-6">
              STOP LOSING LEADS.{' '}
              <span className="text-emerald-500">START CONTROLLING PERFORMANCE.</span>
            </h1>

            <p className="text-lg text-gray-600 mb-6 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              The all-in-one lead accountability platform that tracks performance, controls attendance,
              automates follow-ups, locks inactive users, and ensures zero lead leakage.
            </p>

            <p className="text-sm font-semibold text-gray-500 mb-4">
              Built for modern sales teams, field staff, institutions, and enterprises that want:
            </p>

            <ul className="grid sm:grid-cols-2 gap-x-4 gap-y-2 mb-8 text-left max-w-xl mx-auto lg:mx-0">
              {benefits.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-bold text-lg transition-all shadow-xl shadow-emerald-500/30 flex items-center justify-center"
              >
                Start Free for 30 Days
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 rounded-full font-bold text-lg border border-gray-200 transition-all flex items-center justify-center gap-2"
              >
                <PlayCircle className="text-emerald-500" size={20} />
                Book Live Demo
              </Link>
            </div>

            <p className="mt-6 text-sm text-gray-500 font-medium">
              No credit card required • Setup in minutes • Web & Mobile Ready
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative lg:ml-10 mt-16 lg:mt-0"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-emerald-100 to-blue-50 rounded-full blur-3xl -z-10 opacity-70" />

            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 relative">
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <img
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800"
                alt="SEEAKK dashboard preview"
                className="w-full h-auto object-cover object-top max-h-[400px]"
              />

              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                className="absolute -left-6 top-20 bg-white p-3 rounded-xl shadow-lg border border-gray-100"
              >
                <p className="text-xs text-gray-500 font-medium">Target cycle</p>
                <p className="text-sm font-bold text-emerald-600">On track</p>
              </motion.div>

              <motion.div
                animate={{ y: [0, 15, 0] }}
                transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut', delay: 1 }}
                className="absolute -right-6 bottom-20 bg-white p-3 rounded-xl shadow-lg border border-gray-100"
              >
                <p className="text-xs text-gray-500 font-medium">Follow-up due</p>
                <p className="text-sm font-bold text-gray-900">WhatsApp ready</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
