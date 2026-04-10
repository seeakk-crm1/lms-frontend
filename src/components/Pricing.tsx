import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const Pricing = () => {
    const plans = [
        {
            name: "Starter",
            desc: "Perfect for small teams and solopreneurs.",
            price: "$29",
            period: "/ mo",
            features: ["Up to 10 users", "Basic analytics", "Lead management", "Email integration", "Standard support"],
            highlight: false,
            btnText: "Start Free Trial"
        },
        {
            name: "Professional",
            desc: "The sweet spot for growing sales teams.",
            price: "$79",
            period: "/ mo",
            features: ["Unlimited users", "Advanced forecasting", "Team collaboration tools", "API access", "Priority support", "Custom branding"],
            highlight: true,
            btnText: "Get Professional",
            tag: "MOST POPULAR"
        },
        {
            name: "Enterprise",
            desc: "Custom solutions for large organizations.",
            price: "$199",
            period: "/ mo",
            features: ["Everything in Pro", "Single Sign-On (SSO)", "Dedicated account manager", "Unlimited data retention", "Custom contracts", "24/7 phone support"],
            highlight: false,
            btnText: "Contact Sales"
        }
    ];

    return (
        <section id="pricing" className="py-24 bg-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-50 rounded-full blur-[100px] opacity-60 -z-10 translate-x-1/2 -translate-y-1/2"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
                            Plans for every stage of growth
                        </h2>
                        <p className="text-lg text-gray-600">
                            Simple, transparent pricing. No hidden fees. Switch or cancel anytime.
                        </p>
                    </motion.div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
                    {plans.map((plan, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            className={`relative bg-white rounded-3xl p-8 border ${plan.highlight
                                    ? 'border-emerald-500 shadow-2xl shadow-emerald-500/20 transform lg:-translate-y-4'
                                    : 'border-gray-200 shadow-xl shadow-gray-100/50'
                                } flex flex-col h-full z-10`}
                        >
                            {plan.highlight && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-white px-4 py-1 rounded-full text-xs font-bold tracking-wider">
                                    {plan.tag}
                                </div>
                            )}

                            <div className="mb-6">
                                <h3 className="text-2xl font-bold text-gray-900 mb-2 uppercase tracking-wide text-center">{plan.name}</h3>
                                <p className="text-gray-500 text-sm text-center min-h-[40px]">{plan.desc}</p>
                            </div>

                            <div className="mb-8 text-center border-b border-gray-100 pb-8">
                                <span className="text-5xl font-extrabold text-gray-900">{plan.price}</span>
                                <span className="text-lg font-medium text-gray-500">{plan.period}</span>
                            </div>

                            <ul className="space-y-4 mb-8 flex-grow">
                                {plan.features.map((feature, fIdx) => (
                                    <li key={fIdx} className="flex items-start gap-3">
                                        <div className={`mt-1 flex-shrink-0 ${plan.highlight ? 'text-emerald-500' : 'text-gray-400'}`}>
                                            <Check size={18} strokeWidth={3} />
                                        </div>
                                        <span className="text-gray-600 font-medium">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button className={`w-full py-4 rounded-xl font-bold transition-all ${plan.highlight
                                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                                    : 'bg-gray-50 hover:bg-gray-100 text-gray-900 border border-gray-200'
                                }`}>
                                {plan.btnText}
                            </button>

                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Pricing;
