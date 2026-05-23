import React from 'react';
import { motion } from 'framer-motion';
import { Lock, MapPin, ShieldCheck, GitBranch } from 'lucide-react';

const points = [
  { icon: Lock, text: 'Missed targets trigger automatic locking' },
  { icon: GitBranch, text: 'Unattended follow-ups get tracked' },
  { icon: MapPin, text: 'Attendance requires office presence' },
  { icon: ShieldCheck, text: 'Supervisors control approvals' },
  { icon: GitBranch, text: 'Lead pipelines stay protected' },
];

const AccountabilityHook = () => {
  return (
    <section id="accountability" className="py-24 bg-gray-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.15),_transparent_50%)]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <p className="text-emerald-400 font-black uppercase tracking-[0.2em] text-sm mb-4">
            Powerful hook
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
            “NO PERFORMANCE = <span className="text-emerald-400">NO ACCESS</span>”
          </h2>
          <p className="text-xl text-gray-300 mb-4">SEEAKK doesn’t just manage leads.</p>
          <p className="text-lg text-gray-400 mb-12">
            It creates a complete accountability ecosystem where discipline becomes part of your daily
            operations—not an afterthought.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto mb-12">
          {points.map((item, idx) => (
            <motion.div
              key={item.text}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08 }}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
            >
              <item.icon className="h-5 w-5 shrink-0 text-emerald-400" />
              <span className="text-sm font-semibold text-gray-100 text-left">{item.text}</span>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-2xl font-bold text-white">Your business finally runs with discipline.</p>
      </div>
    </section>
  );
};

export default AccountabilityHook;
