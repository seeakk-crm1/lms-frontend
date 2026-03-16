import React from 'react';
import { motion } from 'framer-motion';
import { PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
    return (
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-gradient-to-b from-emerald-50/50 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">

                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-center lg:text-left"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-600 text-sm font-semibold mb-6">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            NEW: AI-POWERED SCORING
                        </div>

                        <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-6">
                            Modern <span className="text-emerald-500 italic">Lead</span> <br />
                            Management <br />
                            Module
                        </h1>

                        <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0">
                            Stop losing leads in spreadsheets. Convert more deals faster with our AI-driven Lead Management Module designed for modern teams.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                            <Link to="/login" className="w-full sm:w-auto px-8 py-4 bg-emerald-400 hover:bg-emerald-500 text-white rounded-full font-bold text-lg transition-all shadow-xl shadow-emerald-400/30 flex items-center justify-center gap-2">
                                Get Started Free
                            </Link>
                            <Link to="/login" className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 rounded-full font-bold text-lg border border-gray-200 transition-all flex items-center justify-center gap-2">
                                <PlayCircle className="text-emerald-500" size={20} />
                                Request Demo
                            </Link>
                        </div>

                        <div className="mt-10 flex items-center justify-center lg:justify-start gap-4">
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map((i) => (
                                    <img key={i} src={`https://i.pravatar.cc/100?img=${i}`} alt="user" className="w-10 h-10 rounded-full border-2 border-white object-cover" />
                                ))}
                            </div>
                            <p className="text-sm text-gray-500 font-medium text-left">
                                Join over <strong className="text-gray-900">4,000+</strong> teams <br /> scaling revenue.
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="relative lg:ml-10 mt-16 lg:mt-0"
                    >
                        {/* The dashboard mockup background circle */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-emerald-100 to-blue-50 rounded-full blur-3xl -z-10 opacity-70"></div>

                        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 relative">
                            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
                                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                            </div>
                            <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800" alt="Dashboard Lead Management Module Mockup" className="w-full h-auto object-cover object-top max-h-[400px]" />

                            {/* Floating elements */}
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                className="absolute -left-6 top-20 bg-white p-3 rounded-xl shadow-lg border border-gray-100 flex items-center gap-3"
                            >
                                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-500 font-bold">+28%</div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Conversion</p>
                                    <p className="text-sm font-bold text-gray-900">Increased</p>
                                </div>
                            </motion.div>

                            <motion.div
                                animate={{ y: [0, 15, 0] }}
                                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                                className="absolute -right-6 bottom-20 bg-white p-3 rounded-xl shadow-lg border border-gray-100 flex items-center gap-3"
                            >
                                <div className="flex flex-col">
                                    <p className="text-xs text-gray-500 font-medium">New Lead</p>
                                    <p className="text-sm font-bold text-gray-900">Sarah Jenkins</p>
                                </div>
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                            </motion.div>

                        </div>
                    </motion.div>

                </div>

                {/* Trusted By Section (logos below hero) */}
                <div className="mt-32 pt-10 border-t border-gray-100 text-center">
                    <p className="text-sm text-gray-400 font-medium uppercase tracking-wider mb-8">Trusted by forward-thinking teams worldwide</p>
                    <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-300">
                        {['Acme Corp', 'Quantum', 'Stark Ind', 'Wayne Ent', 'Globex'].map((logo, idx) => (
                            <div key={idx} className="text-xl font-bold font-sans text-gray-800">{logo}</div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
