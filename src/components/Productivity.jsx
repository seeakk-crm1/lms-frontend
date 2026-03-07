import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ShieldCheck, Globe, Zap } from 'lucide-react';

const Productivity = () => {
    return (
        <section id="solutions" className="py-24 bg-gray-50 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-16 items-center">

                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                            Built for teams who <br />
                            care about <span className="text-emerald-500">productivity</span>
                        </h2>
                        <p className="text-lg text-gray-600 mb-10 max-w-lg">
                            Efficiency is at the core of our Lead Management System. Spend less time clicking and more time closing, thanks to an intuitive design and seamless integrations.
                        </p>

                        <div className="space-y-8">
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 mt-1">
                                    <ShieldCheck className="text-emerald-500" size={28} />
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-gray-900 mb-2">Enterprise-Grade Security</h4>
                                    <p className="text-gray-600">SOC2 Type II compliant data protection that puts your mind at ease and keeps customer info secure.</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-shrink-0 mt-1">
                                    <Globe className="text-emerald-500" size={28} />
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-gray-900 mb-2">Global Infrastructure</h4>
                                    <p className="text-gray-600">Low-latency access from anywhere in the world with localized regional hosting.</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-shrink-0 mt-1">
                                    <Zap className="text-emerald-500" size={28} />
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-gray-900 mb-2">Zero Learning Curve</h4>
                                    <p className="text-gray-600">Intuitively designed interfaces that let your team start working in minutes, not weeks.</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="relative"
                    >
                        <div className="absolute inset-0 bg-emerald-200 rounded-3xl transform rotate-3 scale-105 blur-lg opacity-40"></div>
                        <img
                            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800"
                            alt="Team analyzing data"
                            className="relative z-10 rounded-3xl shadow-2xl object-cover h-[500px] w-full"
                        />
                        {/* Small floating card */}
                        <motion.div
                            animate={{ y: [-10, 10, -10] }}
                            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                            className="absolute -bottom-10 -left-10 bg-white p-6 rounded-2xl shadow-xl z-20 hidden md:block border border-gray-100"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                                    <CheckCircle2 className="text-emerald-500" size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Weekly Goal</p>
                                    <p className="text-lg font-bold text-gray-900">100% Achieved</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
};

export default Productivity;
