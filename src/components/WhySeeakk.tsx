import React from 'react';
import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';

const problems = [
  'Leads in Excel sheets',
  'No accountability',
  'No attendance discipline',
  'Follow-ups get missed',
  'Revenue tracking confusion',
  'Staff leaves → leads disappear',
  'No supervisor control',
];

const solutions = [
  'Complete lead ownership',
  'Automated performance tracking',
  'Attendance enforcement',
  'Supervisor approval workflow',
  'Auto locking system',
  'Real-time analytics',
  'Zero lead leakage',
  'Structured growth system',
];

const WhySeeakk = () => {
  return (
    <section id="why-seeakk" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">Why SEEAKK is different</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Traditional CRMs store data. SEEAKK enforces accountability and protects every lead you earn.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-red-100 bg-white p-8 shadow-lg"
          >
            <h3 className="text-xl font-black text-gray-900 mb-6">Traditional CRM Problems</h3>
            <ul className="space-y-3">
              {problems.map((item) => (
                <li key={item} className="flex items-start gap-3 text-gray-600">
                  <X className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
                  <span className="font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-emerald-200 bg-emerald-50/50 p-8 shadow-lg"
          >
            <h3 className="text-xl font-black text-gray-900 mb-6">SEEAKK Solution</h3>
            <ul className="space-y-3">
              {solutions.map((item) => (
                <li key={item} className="flex items-start gap-3 text-gray-700">
                  <Check className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" strokeWidth={3} />
                  <span className="font-semibold">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default WhySeeakk;
