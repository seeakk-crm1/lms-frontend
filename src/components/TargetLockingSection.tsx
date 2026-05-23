import React from 'react';
import { motion } from 'framer-motion';
import { Lock, TrendingUp, Users, CalendarRange } from 'lucide-react';

const supports = [
  'Revenue targets',
  'Lead targets',
  'Stage-wise targets',
  'Weekly goals',
  'Monthly goals',
  'Semi-annual cycles',
];

const analysis = [
  'Lead stage progress',
  'Revenue generation',
  'Target completion',
  'Attendance behavior',
];

const TargetLockingSection = () => {
  return (
    <section id="target-locking" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <p className="text-sm font-bold text-emerald-500 uppercase tracking-widest mb-3">
            Target + Locking System
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Unique feature — performance locking
          </h2>
          <p className="text-lg text-gray-600">
            When users fail to achieve targets, the system protects your pipeline by locking access until
            supervisors review and approve unlocks.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl bg-white border border-gray-100 p-8 shadow-lg"
          >
            <Lock className="h-10 w-10 text-emerald-500 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-4">When targets are incomplete</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• System automatically locks account access</li>
              <li>• Supervisors receive alerts</li>
              <li>• Unlock requires supervisor approval</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="rounded-3xl bg-white border border-gray-100 p-8 shadow-lg"
          >
            <CalendarRange className="h-10 w-10 text-emerald-500 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-4">Supports</h3>
            <ul className="space-y-2">
              {supports.map((item) => (
                <li key={item} className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="rounded-3xl bg-emerald-500 text-white p-8 shadow-xl shadow-emerald-500/20"
          >
            <TrendingUp className="h-10 w-10 text-emerald-100 mb-4" />
            <h3 className="text-lg font-bold mb-4">Smart analysis</h3>
            <p className="text-emerald-50 text-sm mb-4">System automatically checks:</p>
            <ul className="space-y-2">
              {analysis.map((item) => (
                <li key={item} className="text-sm font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TargetLockingSection;
