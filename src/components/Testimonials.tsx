import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const Testimonials = () => {
    const reviews = [
        {
            name: "Sarah Jenkins",
            role: "VP of Sales, TechFlow",
            text: "The automated workflows saved our team 15 hours a week! We saw a 25% lift in pipeline within 30 days.",
            avatar: "https://i.pravatar.cc/150?img=32"
        },
        {
            name: "Marcus Torres",
            role: "Customer Success Manager, GrowCorp",
            text: "Finally, a lead management module that doesn't feel like a data entry chore. The UI is incredibly intuitive and fast.",
            avatar: "https://i.pravatar.cc/150?img=11"
        },
        {
            name: "Evelyn Rodriguez",
            role: "Founder, Peak Ventures",
            text: "Our team's collaboration has never been smoother. Being able to tag reps and see notifications speeds up deal closures.",
            avatar: "https://i.pravatar.cc/150?img=47"
        }
    ];

    return (
        <section className="py-24 bg-gray-50 border-t border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-white to-transparent"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="max-w-2xl"
                    >
                        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
                            Don't just take our word for it
                        </h2>
                        <p className="text-lg text-gray-600">
                            Hear from forward-thinking sales teams who trust us to grow globally.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <button className="px-6 py-3 bg-white border border-gray-200 text-gray-900 font-bold rounded-lg shadow-sm hover:shadow-md transition-all">
                            View all customer stories
                        </button>
                    </motion.div>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {reviews.map((review, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            whileHover={{ y: -5 }}
                            className="bg-white p-8 rounded-2xl shadow-xl shadow-gray-100 border border-gray-100 flex flex-col justify-between transition-all"
                        >
                            <div>
                                <div className="flex text-amber-400 mb-6 gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={18} fill="currentColor" strokeWidth={0} />
                                    ))}
                                </div>
                                <p className="text-gray-700 text-lg leading-relaxed font-medium mb-8">
                                    "{review.text}"
                                </p>
                            </div>

                            <div className="flex items-center gap-4 pt-6 border-t border-gray-50">
                                <img src={review.avatar} alt={review.name} className="w-12 h-12 rounded-full ring-2 ring-emerald-50 object-cover" />
                                <div>
                                    <h4 className="font-bold text-gray-900">{review.name}</h4>
                                    <p className="text-sm text-gray-500 font-medium">{review.role}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
