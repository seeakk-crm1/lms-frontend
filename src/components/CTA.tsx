import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const CTA = () => {
    return (
        <section className="py-24 bg-white relative">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="bg-emerald-500 rounded-3xl p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-emerald-500/30"
                >
                    {/* Background decorative elements */}
                    <div className="absolute top-0 right-0 -m-20 w-80 h-80 bg-emerald-400 rounded-full blur-[80px] opacity-60"></div>
                    <div className="absolute bottom-0 left-0 -m-20 w-80 h-80 bg-emerald-600 rounded-full blur-[80px] opacity-60"></div>

                    <div className="relative z-10 max-w-3xl mx-auto">
                        <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
                            Ready to transform your sales pipeline?
                        </h2>
                        <p className="text-xl text-emerald-50 mb-10">
                            Join 20,000+ companies closing more deals with Seeakk. Start your 14-day free trial today.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link to="/login" className="w-full sm:w-auto px-8 py-4 bg-white text-emerald-600 rounded-full font-bold text-lg hover:bg-gray-50 transition-all shadow-xl shadow-white/10 hover:-translate-y-1 inline-flex items-center justify-center">
                                Get Started Free
                            </Link>
                            <Link to="/login" className="w-full sm:w-auto px-8 py-4 bg-emerald-600 text-white rounded-full font-bold text-lg hover:bg-emerald-700 transition-all border border-emerald-400 hover:-translate-y-1 inline-flex items-center justify-center">
                                Request Demo
                            </Link>
                        </div>

                        <p className="mt-8 text-emerald-100 text-sm font-medium">
                            No credit card required. Cancel anytime.
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default CTA;
