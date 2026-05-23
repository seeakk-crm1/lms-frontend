import React from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  CalendarClock,
  GitBranch,
  Lock,
  MapPin,
  MessageCircle,
  Shield,
  Target,
} from 'lucide-react';

const features = [
  {
    icon: GitBranch,
    title: 'Lead Lifecycle Tracking',
    desc: 'Track every lead from New → Qualified → Follow-up → Closed → Revenue in one structured pipeline.',
  },
  {
    icon: Lock,
    title: 'Performance Locking System',
    desc: 'Incomplete targets auto-lock users, alert supervisors, and require approval to unlock access.',
  },
  {
    icon: MapPin,
    title: 'Smart Attendance Management',
    desc: 'GPS office attendance, 100m radius validation, supervisor approvals, history, and geo-restricted check-ins.',
  },
  {
    icon: Target,
    title: 'Target Cycle Engine',
    desc: 'Weekly, monthly, semi-annual, and manual targets for revenue, lead conversion, and stage-based goals.',
  },
  {
    icon: CalendarClock,
    title: 'Follow-Up Intelligence',
    desc: 'Never miss a follow-up with calendar tracking, reminder automation, and WhatsApp quick actions.',
  },
  {
    icon: Shield,
    title: 'Role-Based Access Control',
    desc: 'Advanced permissions for supervisors, managers, admins, teams, and branches.',
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp Integration',
    desc: 'Open WhatsApp instantly from leads list, user list, follow-up details, and calendar events.',
  },
  {
    icon: BarChart3,
    title: 'Real-Time Dashboard Analytics',
    desc: 'Live insights for leads, revenue, attendance, targets, closures, approvals, and user performance.',
  },
];

const Features = () => {
  return (
    <section id="features" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-sm font-bold text-emerald-500 uppercase tracking-widest mb-3">Core Features</h2>
            <h3 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Everything your sales operation needs
            </h3>
            <p className="text-lg text-gray-600">
              SEEAKK combines lead control, attendance intelligence, and performance accountability in one platform.
            </p>
          </motion.div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((card, idx) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.06 }}
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-lg shadow-gray-100/50 hover:shadow-xl hover:shadow-emerald-100/40 transition-all group h-full flex flex-col"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-colors">
                <card.icon className="text-emerald-500" size={24} />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">{card.title}</h4>
              <p className="text-sm text-gray-600 leading-relaxed flex-1">{card.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
