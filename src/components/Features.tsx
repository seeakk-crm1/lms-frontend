import React from 'react';
import { motion } from 'framer-motion';
import { Users, BarChart3, Mail, Workflow } from 'lucide-react';

const Features = () => {
    const cards = [
        {
            icon: <Users className="text-emerald-500" size={28} />,
            title: "Lead Management",
            desc: "Capture leads and quickly move them through the sales pipe with automated assignments."
        },
        {
            icon: <Workflow className="text-emerald-500" size={28} />,
            title: "Team Collaboration",
            desc: "Share notes, tag team members, and stay synced on every deal in real-time."
        },
        {
            icon: <BarChart3 className="text-emerald-500" size={28} />,
            title: "Sales Analytics",
            desc: "Get deep insights into pipeline health, rep performance, and revenue impact."
        },
        {
            icon: <Mail className="text-emerald-500" size={28} />,
            title: "Automated Follow-ups",
            desc: "Put your outreach on autopilot with intelligent email sequences and reminders."
        }
    ];

    return (
        <section id="features" className="py-24 bg-white relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="text-center max-w-3xl mx-auto mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-sm font-bold text-emerald-500 uppercase tracking-widest mb-3">Our Core Features</h2>
                        <h3 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
                            Everything you need to <span className="text-emerald-500">scale</span> your sales
                        </h3>
                        <p className="text-lg text-gray-600">
                            We've built the tools that forward-thinking teams use daily to manage complexity without the headache.
                        </p>
                    </motion.div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {cards.map((card, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            whileHover={{ y: -5 }}
                            className="bg-white p-8 rounded-2xl border border-gray-100 shadow-xl shadow-gray-100/50 hover:shadow-2xl hover:shadow-emerald-100/50 transition-all group"
                        >
                            <div className="w-14 h-14 rounded-xl bg-emerald-50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-100 transition-transform">
                                {card.icon}
                            </div>
                            <h4 className="text-xl font-bold text-gray-900 mb-3">{card.title}</h4>
                            <p className="text-gray-600 leading-relaxed">
                                {card.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>

            </div>
        </section>
    );
};

export default Features;
