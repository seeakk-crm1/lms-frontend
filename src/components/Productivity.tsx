import React from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard } from 'lucide-react';

const dashboardItems = [
  'Lead management',
  'Attendance control',
  'Follow-up tracking',
  'Revenue monitoring',
  'Team analytics',
  'Supervisor approvals',
  'Lock/unlock workflows',
];

const Productivity = () => {
  return (
    <section id="dashboard" className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-sm font-bold text-emerald-500 uppercase tracking-widest mb-3">
              Beautiful dashboard
            </p>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
              Complete business control
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-lg">
              SEEAKK gives you a centralized command center for every part of your sales and operations
              discipline.
            </p>

            <ul className="space-y-3 mb-8">
              {dashboardItems.map((item) => (
                <li key={item} className="flex items-center gap-3 text-gray-700 font-semibold">
                  <LayoutDashboard className="h-5 w-5 text-emerald-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            <p className="text-2xl font-black text-gray-900">
              One dashboard. <span className="text-emerald-500">Complete visibility.</span>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-emerald-200 rounded-3xl transform rotate-3 scale-105 blur-lg opacity-40" />
            <img
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800"
              alt="SEEAKK analytics dashboard"
              className="relative z-10 rounded-3xl shadow-2xl object-cover h-[480px] w-full"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Productivity;
