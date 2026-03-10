import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Building2, Users, Globe2, Languages, Coins, CheckCircle2, ChevronRight, Loader2, Sparkles, LayoutGrid } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import api from '../services/api';

const InputWrapper = ({ label, icon: Icon, children }) => (
    <div className="mb-5">
        <label className="flex items-center gap-1.5 text-sm font-bold text-gray-700 mb-2">
            {Icon && <Icon size={16} className="text-gray-400" />}
            {label}
        </label>
        {children}
    </div>
);

const WorkspaceSetup = () => {
    const { user, updateUser } = useAuthStore();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        companyName: '',
        employeeCount: '',
        timeZone: 'GMT +5:30 India Standard Time (Asia/Kolkata)',
        language: 'English (US)',
        currencyLocale: 'India (INR)',
        loadSampleData: true
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!formData.companyName.trim() || !formData.employeeCount) {
            setError("Company Name and Employee Count are required.");
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/workspace/setup', formData);
            // Update global state without needing to relogin
            updateUser({ isOnboarded: true, workspaceId: response.data.workspace._id, role: response.data.user.role });
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || "Failed to configure workspace");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">

            {/* Top Right User Badge */}
            <div className="absolute top-6 right-6 lg:top-8 lg:right-10 bg-white rounded-full pl-2 pr-4 py-1.5 shadow-sm border border-gray-100 flex items-center gap-3 hidden sm:flex">
                <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-500 flex items-center justify-center text-emerald-600 font-bold overflow-hidden">
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-900 leading-none mb-1">{user?.name || 'User Profile'}</span>
                    <span className="text-[10px] text-gray-500 leading-none">{user?.email || 'admin@company.com'}</span>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-[1000px] bg-white rounded-[24px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col md:flex-row overflow-hidden relative z-10"
            >
                {/* Left Visual Panel */}
                <div className="md:w-[42%] bg-gradient-to-br from-[#e0fcf3] to-[#f4fefb] p-10 relative overflow-hidden flex flex-col justify-between hidden md:flex">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-12">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                <Sparkles className="text-white" size={18} />
                            </div>
                            <span className="text-xl font-extrabold text-emerald-600 tracking-tight">Seeakk</span>
                        </div>

                        <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full mb-6 italic">
                            ✦ QUICK SETUP
                        </div>

                        <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight leading-tight">
                            Hi {user?.name?.split(' ')[0] || 'User'} <span className="inline-block animate-wave">👋</span>
                        </h2>
                        <p className="text-gray-600 font-medium leading-relaxed max-w-[260px]">
                            Welcome to Seeakk. Let's get your workspace ready for peak productivity.
                        </p>
                    </div>

                    {/* Animated Decorative Floating Elements */}
                    <div className="relative h-48 mt-8 w-full">
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute bottom-8 left-16 w-32 h-36 bg-white rounded-2xl shadow-xl border border-gray-100 flex flex-col justify-end p-4 z-20"
                        >
                            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mb-auto mx-auto mt-2">
                                <LayoutGrid className="text-emerald-500" size={20} />
                            </div>
                            <div className="w-16 h-2 bg-gray-100 rounded-full mx-auto" />
                        </motion.div>

                        <motion.div
                            animate={{ y: [0, 8, 0] }}
                            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute bottom-4 left-6 w-28 h-40 bg-white/70 backdrop-blur-sm rounded-2xl shadow-md border border-gray-50 flex flex-col p-4 gap-3 z-10"
                        >
                            <div className="w-12 h-2 bg-gray-200 rounded-full" />
                            <div className="w-16 h-2 bg-gray-200 rounded-full" />
                            <div className="w-10 h-2 bg-gray-200 rounded-full" />
                            <div className="mt-auto flex gap-2">
                                <div className="w-5 h-5 bg-emerald-100 rounded-full" />
                                <div className="w-5 h-5 bg-blue-100 rounded-full" />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", delay: 0.5 }}
                            className="absolute bottom-2 -left-2 w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/40 z-30"
                        >
                            <CheckCircle2 className="text-white" size={20} />
                        </motion.div>
                    </div>
                </div>

                {/* Right Form Panel */}
                <div className="md:w-[58%] p-8 sm:p-12 pl-8 sm:pl-14 flex flex-col justify-center bg-white relative">
                    <h1 className="text-2xl font-black text-gray-900 mb-2">Configure Your Workspace</h1>
                    <p className="text-gray-500 text-sm mb-8 font-medium">Tailor your Seeakk experience by providing a few details about your team.</p>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100 flex items-start gap-2">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="w-full max-w-[460px]">
                        <InputWrapper label="Company Name" icon={Building2}>
                            <input
                                type="text"
                                name="companyName"
                                value={formData.companyName}
                                onChange={handleChange}
                                placeholder="e.g. Acme Corporation"
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-400 font-medium"
                                required
                            />
                        </InputWrapper>

                        <InputWrapper label="Employee Count" icon={Users}>
                            <select
                                name="employeeCount"
                                value={formData.employeeCount}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all appearance-none font-medium"
                                required
                            >
                                <option value="" disabled>How many people are in your team?</option>
                                <option value="1-10">1 - 10 employees</option>
                                <option value="11-50">11 - 50 employees</option>
                                <option value="51-200">51 - 200 employees</option>
                                <option value="201-500">201 - 500 employees</option>
                                <option value="500+">500+ employees</option>
                            </select>
                        </InputWrapper>

                        <InputWrapper label="Time Zone" icon={Globe2}>
                            <select
                                name="timeZone"
                                value={formData.timeZone}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all appearance-none font-medium"
                            >
                                <option value="GMT +5:30 India Standard Time (Asia/Kolkata)">(GMT +5:30) India Standard Time (Asia/Kolkata)</option>
                                <option value="GMT +0:00 Greenwich Mean Time (Europe/London)">(GMT +0:00) Greenwich Mean Time (Europe/London)</option>
                                <option value="GMT -5:00 Eastern Standard Time (America/New_York)">(GMT -5:00) Eastern Standard Time (America/New_York)</option>
                                <option value="GMT -8:00 Pacific Standard Time (America/Los_Angeles)">(GMT -8:00) Pacific Standard Time (America/Los_Angeles)</option>
                            </select>
                        </InputWrapper>

                        <div className="flex flex-col sm:flex-row gap-4 mb-2">
                            <div className="flex-1">
                                <InputWrapper label="Language" icon={Languages}>
                                    <select
                                        name="language"
                                        value={formData.language}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all appearance-none font-medium"
                                    >
                                        <option value="English (US)">English (US)</option>
                                        <option value="English (UK)">English (UK)</option>
                                        <option value="Spanish (ES)">Spanish (ES)</option>
                                        <option value="French (FR)">French (FR)</option>
                                    </select>
                                </InputWrapper>
                            </div>
                            <div className="flex-1">
                                <InputWrapper label="Currency Locale" icon={Coins}>
                                    <select
                                        name="currencyLocale"
                                        value={formData.currencyLocale}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all appearance-none font-medium"
                                    >
                                        <option value="India (INR)">India (INR)</option>
                                        <option value="United States (USD)">United States (USD)</option>
                                        <option value="Europe (EUR)">Europe (EUR)</option>
                                        <option value="United Kingdom (GBP)">United Kingdom (GBP)</option>
                                    </select>
                                </InputWrapper>
                            </div>
                        </div>

                        {/* Special Checkbox inside a bordered box */}
                        <div className="mt-8 border-2 border-emerald-100 rounded-xl p-1 relative flex items-center bg-white shadow-sm overflow-hidden">
                            <label className="flex items-center gap-3 py-3 px-4 flex-1 cursor-pointer group">
                                <div className="relative flex items-center">
                                    <input
                                        type="checkbox"
                                        name="loadSampleData"
                                        checked={formData.loadSampleData}
                                        onChange={handleChange}
                                        className="w-5 h-5 appearance-none rounded border-2 border-emerald-500 checked:bg-emerald-500 checked:border-emerald-500 transition-colors cursor-pointer"
                                    />
                                    <CheckCircle2 className={`absolute pointer-events-none w-4 h-4 text-white left-0.5 opacity-0 ${formData.loadSampleData ? 'opacity-100' : ''}`} />
                                </div>
                                <span className="text-sm font-bold text-gray-700 group-hover:text-emerald-700 transition-colors">Load sample data for exploration</span>
                            </label>

                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-bold py-3.5 px-6 rounded-lg text-sm transition-colors flex items-center gap-2 relative shadow-lg shadow-emerald-500/20"
                            >
                                {loading ? <Loader2 size={16} className="animate-spin" /> : 'Get Started'}
                                {!loading && <ChevronRight size={16} />}

                                {/* Decorator icon hanging off edge from screenshot */}
                                <div className="absolute -right-3 -top-3 w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white border-2 border-white shadow-sm rotate-12">
                                    <Sparkles size={14} />
                                </div>
                            </button>
                        </div>

                    </form>
                </div>
            </motion.div>

            {/* Footer Links */}
            <div className="mt-8 text-xs font-bold font-mono text-gray-400 flex gap-4 uppercase tracking-wider relative z-10">
                <a href="#" className="hover:text-gray-600 transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-gray-600 transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-gray-600 transition-colors">Help Center</a>
            </div>

            {/* Tailwind Wave Animation Class Injection */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes wave {
                    0% { transform: rotate( 0.0deg) }
                    10% { transform: rotate(14.0deg) }  
                    20% { transform: rotate(-8.0deg) }
                    30% { transform: rotate(14.0deg) }
                    40% { transform: rotate(-4.0deg) }
                    50% { transform: rotate(10.0deg) }
                    60% { transform: rotate( 0.0deg) }  
                    100% { transform: rotate( 0.0deg) }
                }
                .animate-wave {
                    animation: wave 2.5s infinite;
                    transform-origin: 70% 70%;
                }
            `}} />
        </div>
    );
};

export default WorkspaceSetup;
