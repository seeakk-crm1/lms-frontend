import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Building, FileKey2 } from 'lucide-react';

const trustPillars = [
  {
    icon: ShieldCheck,
    title: 'Role-Based Access Control (RBAC)',
    desc: 'Fine-Grained Permission Matrices For Super Admins, Branch Managers, Supervisors, And Sales Advisors With Strict Data Isolation.',
  },
  {
    icon: FileKey2,
    title: 'Detailed Activity & Audit Logs',
    desc: 'Track Important Lead Assignments, Stage Changes, Approvals, Payment Edits, And Account Unlock Actions With Clear User And Timestamp History.',
  },
  {
    icon: Building,
    title: 'Multi-Office Branch Hierarchy',
    desc: 'Support Complex Multi-Regional Office Structures, Loss Of Business (LOB) Splits, And Department-Wise Reporting Boundaries.',
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
            <span>Enterprise Access & Security Boundaries</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-6">
            Built For High-Growth Enterprises{' '}
            <span className="bg-gradient-to-r from-blue-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent">
              & Multi-Branch Operations.
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-medium">
            Seeakk provides role-based access control, structured multi-office data boundaries, and detailed activity tracking to help organizations manage operational access and accountability.
          </p>
        </motion.div>

        {/* Pillars Grid - 3 Cards Balanced Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch">
          {trustPillars.map((pillar, idx) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08 }}
              className="bg-slate-50/80 rounded-2xl p-6 sm:p-8 border border-slate-200 hover:border-blue-500/40 hover:bg-white hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="p-3 rounded-xl bg-blue-100 text-blue-700 border border-blue-200 w-fit mb-4 group-hover:scale-110 transition-transform shadow-sm">
                  <pillar.icon className="w-5 h-5" />
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-2">{pillar.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">{pillar.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EnterpriseTrust;
