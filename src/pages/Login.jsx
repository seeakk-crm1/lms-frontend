import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, TrendingUp, Users, Calendar, Search } from 'lucide-react';

const Login = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-[100dvh] bg-white flex flex-col lg:flex-row overflow-x-hidden"
        >
            {/* Left Column - Graphic/Branding */}
            <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="hidden lg:flex w-1/2 bg-emerald-500 relative flex-col justify-between py-12 px-8 xl:px-12 overflow-hidden"
            >
                {/* Background Decorative Rings */}
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] border-[40px] border-emerald-400/30 rounded-full blur-3xl" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-emerald-600/20 rounded-full blur-3xl" />

                <div className="relative z-10">
                    <Link to="/" className="flex items-center relative h-12 w-36 overflow-hidden">
                        <img src="/logo.png" alt="Seeakk" className="absolute top-1/2 left-0 -translate-y-1/2 h-24 w-auto object-contain brightness-0 invert" />
                    </Link>
                </div>

                {/* Dashboard Graphic Rebuild */}
                <div className="relative z-10 w-full max-w-lg mx-auto transform translate-x-4 xl:translate-x-12">

                    {/* Main Glass Panel */}
                    <div className="bg-emerald-400/40 backdrop-blur-xl border border-emerald-300/50 rounded-2xl p-6 shadow-2xl relative">

                        {/* Top Bar inside glass */}
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-3 h-3 rounded-full bg-red-400"></div>
                            <div className="px-4 py-2 bg-emerald-500/50 rounded-lg flex items-center gap-2 w-48">
                                <Search size={14} className="text-emerald-100" />
                                <div className="w-24 h-1.5 bg-emerald-300/50 rounded-full"></div>
                            </div>
                        </div>

                        {/* Grid for inner cards */}
                        <div className="grid grid-cols-2 gap-4">

                            {/* Customers Card */}
                            <div className="bg-white rounded-xl p-4 shadow-sm flex flex-col gap-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-500">
                                        <Users size={16} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Customers</p>
                                        <div className="flex items-baseline gap-2">
                                            <h4 className="text-lg font-bold text-gray-900">12,842</h4>
                                            <span className="text-xs font-bold text-emerald-500">+14%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Revenue Overview Chart */}
                            <div className="bg-white rounded-xl p-4 shadow-sm row-span-2 flex flex-col">
                                <p className="text-[10px] font-bold text-gray-800 uppercase tracking-wider mb-4">Revenue Overview</p>
                                <div className="flex-grow flex items-end">
                                    <svg className="w-full h-24 overflow-visible" viewBox="0 0 100 50">
                                        <path d="M0,35 Q15,25 30,30 T50,20 T75,25 T100,5" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
                                        <path d="M0,35 Q15,25 30,30 T50,20 T75,25 T100,5 L100,50 L0,50 Z" fill="url(#gradient)" opacity="0.2" />
                                        <defs>
                                            <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                                                <stop offset="0%" stopColor="#10b981" />
                                                <stop offset="100%" stopColor="transparent" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                </div>
                                <div className="flex justify-between items-center mt-4">
                                    <span className="text-[10px] text-gray-400 font-medium">Avg. Deal Size</span>
                                    <span className="text-xs font-bold text-gray-900">$4,290</span>
                                </div>
                            </div>

                            {/* Recent Activity Card */}
                            <div className="bg-white rounded-xl p-4 shadow-sm h-[140px]">
                                <div className="flex justify-between items-center mb-4">
                                    <p className="text-[10px] font-bold text-gray-800 uppercase tracking-wider">Recent Activity</p>
                                    <span className="text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">Live</span>
                                </div>
                                <div className="space-y-3">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <img src={`https://i.pravatar.cc/100?img=${i + 10}`} className="w-6 h-6 rounded-full" />
                                            <div className="w-16 h-1.5 bg-gray-100 rounded-full"></div>
                                            <div className="ml-auto w-3 h-3 border-2 border-gray-300 rounded flex items-center justify-center">
                                                <div className="w-1 h-1 bg-emerald-500 rounded-full opacity-50"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>

                        {/* Floating External Cards */}
                        <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                            className="absolute -top-6 -right-6 bg-white p-3 rounded-xl shadow-xl flex items-center gap-3"
                        >
                            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                                <TrendingUp size={16} />
                            </div>
                            <div>
                                <p className="text-[9px] text-gray-400 font-medium">Conversion Rate</p>
                                <p className="text-sm font-bold text-gray-900">32.4%</p>
                            </div>
                        </motion.div>

                        <motion.div
                            animate={{ y: [0, 5, 0] }}
                            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                            className="absolute -bottom-8 -left-8 bg-white p-4 rounded-xl shadow-xl w-48"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <Calendar size={14} className="text-emerald-500" />
                                <p className="text-[10px] font-bold text-gray-800">Upcoming Meetings</p>
                            </div>
                            <div className="w-full h-1.5 bg-gray-100 rounded-full mb-1"></div>
                            <div className="w-2/3 h-1.5 bg-gray-100 rounded-full"></div>
                        </motion.div>

                    </div>
                </div>

                <div className="relative z-10 pt-16">
                    <div className="flex justify-end pr-10">
                        <div className="relative h-10 w-24 overflow-hidden">
                            <img src="/logo.png" alt="Seeakk" className="absolute top-1/2 left-0 -translate-y-1/2 h-20 w-auto object-contain brightness-0 invert opacity-50" />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Right Column - Login Form */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
                className="w-full lg:w-1/2 min-h-[100dvh] lg:min-h-0 flex items-center justify-center px-4 py-8 sm:p-12 relative overflow-y-auto overflow-x-hidden"
            >
                <div className="w-full max-w-md mx-auto">

                    {/* Mobile Header (Visible only on small screens) */}
                    <div className="lg:hidden flex items-center justify-between mb-8 sm:mb-10 w-full">
                        <Link to="/" className="flex items-center gap-1 sm:gap-2 text-gray-500 hover:text-[#22c55e] transition-colors font-medium text-xs sm:text-sm whitespace-nowrap">
                            <ArrowRight className="rotate-180" size={16} />
                            <span>Back home</span>
                        </Link>
                        <div className="relative h-10 w-24 sm:h-12 sm:w-32 overflow-hidden flex-shrink-0">
                            <img src="/logo.png" alt="Seeakk" className="absolute top-1/2 right-0 -translate-y-1/2 h-20 sm:h-24 w-auto object-contain object-right" />
                        </div>
                    </div>

                    <div className="mb-10 text-center sm:text-left">
                        <h1 className="text-[32px] font-extrabold text-gray-900 mb-2 tracking-tight">Welcome Back</h1>
                        <p className="text-[15px] text-gray-500 font-medium">Please enter your details to sign in to your account.</p>
                    </div>

                    <button className="w-full mb-8 flex items-center justify-center gap-3 bg-white border border-gray-100 hover:bg-gray-50 text-gray-700 font-bold py-3.5 px-4 rounded-xl transition-all shadow-sm text-sm">
                        <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Sign in with Google
                    </button>

                    <div className="flex items-center mb-8 w-full gap-2">
                        <div className="flex-grow h-px bg-gray-200"></div>
                        <span className="text-[10px] sm:text-[11px] flex-shrink-0 font-bold text-gray-400 uppercase tracking-wider sm:tracking-widest text-center">OR CONTINUE WITH EMAIL</span>
                        <div className="flex-grow h-px bg-gray-200"></div>
                    </div>

                    <form className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail size={18} className="text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    className="block w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors shadow-sm text-gray-900 font-medium placeholder-gray-400"
                                    placeholder="alex@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-bold text-gray-900">Password</label>
                                <a href="#" className="text-sm font-bold text-emerald-500 hover:text-emerald-600">Forgot password?</a>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock size={18} className="text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    className="block w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors shadow-sm text-gray-900 font-bold tracking-widest placeholder-gray-400"
                                    placeholder="........"
                                />
                            </div>
                        </div>

                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 text-emerald-500 focus:ring-emerald-500 border-gray-300 rounded cursor-pointer"
                            />
                            <label htmlFor="remember-me" className="ml-3 block text-sm font-medium text-gray-600 cursor-pointer">
                                Remember this device for 30 days
                            </label>
                        </div>

                        <div className="relative w-full">
                            <button
                                type="button"
                                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl text-base font-bold text-white bg-[#22c55e] hover:bg-[#16a34a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#22c55e] transition-all relative z-10"
                            >
                                Login to Account
                                <ArrowRight size={18} strokeWidth={2.5} />
                            </button>
                            {/* The Purple Sweeping Figma Curve specific to design photo */}
                            <svg className="absolute top-1/2 left-[98%] hidden lg:block pointer-events-none z-0" width="250" height="200" viewBox="0 0 250 200" fill="none">
                                <path d="M0 0 C 80 0, 100 200, 250 200" stroke="#c4b5fd" strokeWidth="2" fill="none" />
                            </svg>
                        </div>
                    </form>

                    <p className="mt-8 text-center text-sm font-medium text-gray-500">
                        Don't have an account yet?{' '}
                        <a href="#" className="font-bold text-[#22c55e] hover:text-[#16a34a] hover:underline">
                            Activate your account
                        </a>
                    </p>

                    {/* Bottom visual filler rects from figma */}
                    <div className="flex justify-center gap-2 mt-8 opacity-20">
                        <div className="w-8 h-2 bg-gray-300 rounded-full"></div>
                        <div className="w-8 h-2 bg-gray-300 rounded-full"></div>
                        <div className="w-8 h-2 bg-gray-300 rounded-full"></div>
                    </div>

                </div>
            </motion.div>
        </motion.div>
    );
};

export default Login;
