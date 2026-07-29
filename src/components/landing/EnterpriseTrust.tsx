import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Building, FileKey2, Cpu, Globe2, CheckCircle2 } from 'lucide-react';

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
    desc: 'Support complex multi-regional office structures, line of business (LOB) splits, and department-wise reporting boundaries.',
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
    title: 'Real-time WebSocket Infrastructure',
    desc: 'Low-latency real-time event broadcasting for instant follow-up reminders, lead transfers, and supervisor notifications.',
  },
];

const EnterpriseTrust: React.FC = () => {
  return (
    <section className="py-24 lg:py-36 bg-gray-950 text-white relative overflow-hidden">
      {/* Radial Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-600/10 via-transparent to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-widest mb-4">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>Enterprise Infrastructure</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-6">
            Built for High-Growth Enterprises{' '}
            <span className="bg-gradient-to-r from-blue-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
              & Multi-Branch Operations.
            </span>
          </h2>

          <p className="text-base sm:text-lg text-gray-400 leading-relaxed">
            Seeakk complies with strict enterprise security, multi-office data boundaries, and audit logging standards out of the box.
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
              className="bg-gray-900/80 rounded-2xl p-6 border border-white/10 hover:border-blue-500/40 transition-all group"
            >
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 w-fit mb-4 group-hover:scale-110 transition-transform">
                <pillar.icon className="w-5 h-5" />
              </div>

              <h3 className="text-base font-bold text-white mb-2">{pillar.title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{pillar.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EnterpriseTrust;
