import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const outcomes = [
  'Improve accountability',
  'Increase conversions',
  'Reduce lead leakage',
  'Automate supervision',
  'Track employee performance',
  'Build disciplined sales operations',
];

const CTA = () => {
  return (
    <section className="py-24 bg-white relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-emerald-500 rounded-3xl p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-emerald-500/30"
        >
          <div className="absolute top-0 right-0 -m-20 w-80 h-80 bg-emerald-400 rounded-full blur-[80px] opacity-60" />
          <div className="absolute bottom-0 left-0 -m-20 w-80 h-80 bg-emerald-600 rounded-full blur-[80px] opacity-60" />

          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
              Control your team. Scale your business.
            </h2>
            <p className="text-lg text-emerald-50 mb-8">SEEAKK helps businesses:</p>

            <ul className="grid sm:grid-cols-2 gap-2 text-left max-w-lg mx-auto mb-10">
              {outcomes.map((item) => (
                <li key={item} className="flex items-center gap-2 text-emerald-50 text-sm font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-white shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-4 bg-white text-emerald-600 rounded-full font-bold text-lg hover:bg-gray-50 transition-all shadow-xl inline-flex items-center justify-center"
              >
                Start Free Today
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-4 bg-emerald-600 text-white rounded-full font-bold text-lg hover:bg-emerald-700 transition-all border border-emerald-400 inline-flex items-center justify-center"
              >
                Schedule Demo
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
