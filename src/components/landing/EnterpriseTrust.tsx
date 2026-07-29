import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Building, FileKey2, Cpu, Globe2 } from 'lucide-react';

const trustPillars = [
  {
    icon: ShieldCheck,
    title: 'Role-Based Access Control (RBAC)',
    desc: 'Fine-grained permission matrices for Super Admins, Branch Managers, Supervisors, and Sales Advisors with strict data isolation.',
  },
  {
    icon: FileKey2,
    title: 'Immutable Forensic Audit Logs',
    desc: 'Every single lead assignment, status transition, payment edit, and supervisor unlock request is cryptographically recorded.',
  },
  {
    icon: Building,
    title: 'Multi-Office Branch Hierarchy',
    desc: 'Support complex multi-regional office structures, Loss of Business (LOB) splits, and department-wise reporting boundaries.',
  },
  {
    icon: Cpu,
    title: 'PWA & Offline Queue Sync',
    desc: 'Progressive Web App (PWA) architecture allowing sales reps to capture notes offline and auto-sync upon reconnection.',
  },
  {
    icon: Lock,
    title: 'Bank-Grade Data Encryption',
    desc: 'AES-256 encrypted storage, TLS 1.3 in transit, and JWT token rotation for maximum data security.',
  },
  {
    icon: Globe2,
    title: 'Real-Time WebSocket Infrastructure',
    desc: 'Low-latency real-time event broadcasting for instant follow-up reminders, lead transfers, and supervisor notifications.',
  },
];

const EnterpriseTrust: React.FC = () => {
  return (
    <section className="py-24 lg:py-36 bg-white text-slate-900 relative overflow-hidden">
      {/* Radial Glow Overlay */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 border border-blue-200 text-blue-800 text-xs font-bold uppercase tracking-widest mb-4 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Enterprise Security & Compliance</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-6">
            Built for High-Growth Enterprises{' '}
            <span className="bg-gradient-to-r from-blue-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent">
              & Multi-Branch Operations.
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Seeakk complies with strict enterprise security, multi-office data boundaries, Loss of Business (LOB) monitoring, and forensic audit logging standards out of the box.
          </p>
        </motion.div>

        {/* Pillars Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {trustPillars.map((pillar, idx) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08 }}
              className="bg-slate-50/80 rounded-2xl p-6 border border-slate-200 hover:border-blue-500/40 hover:bg-white hover:shadow-md transition-all group"
            >
              <div className="p-3 rounded-xl bg-blue-100 text-blue-700 border border-blue-200 w-fit mb-4 group-hover:scale-110 transition-transform shadow-sm">
                <pillar.icon className="w-5 h-5" />
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-2">{pillar.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">{pillar.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EnterpriseTrust;
