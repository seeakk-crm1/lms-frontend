import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, TrendingUp, Users, Calendar, Search } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { GoogleLogin } from '@react-oauth/google';
import useAuthStore from '../store/useAuthStore';
import api from '../services/api';

const Login = () => {
    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');

    const loginMutation = useMutation({
        mutationFn: async (credentials) => {
            const response = await api.post('/auth/login', credentials);
            return response.data;
        },
        onSuccess: (data) => {
            setAuth(data.user, data.accessToken, data.refreshToken);
            if (!data.user.isOnboarded) {
                navigate('/workspace/setup');
            } else {
                navigate('/dashboard');
            }
        },
        onError: (error) => {
            setLoginError(error.response?.data?.message || 'Login failed. Please try again.');
        }
    });

    const handleLogin = (e) => {
        e.preventDefault();
        setLoginError('');
        loginMutation.mutate({ email, password });
    };

    const googleLoginMutation = useMutation({
        mutationFn: async (token) => {
            const response = await api.post('/auth/google', { token });
            return response.data;
        },
        onSuccess: (data) => {
            setAuth(data.user, data.accessToken, data.refreshToken);
            if (!data.user.isOnboarded) {
                navigate('/workspace/setup');
            } else {
                navigate('/dashboard');
            }
        },
        onError: (error) => {
            setLoginError(error.response?.data?.message || 'Google login failed. Please try again.');
        }
    });

    const handleGoogleSuccess = (credentialResponse) => {
        setLoginError('');
        googleLoginMutation.mutate(credentialResponse.credential);
    };

    const handleGoogleError = () => {
        setLoginError('Google Login failed completely.');
    };
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

                    <div className="w-full mb-8 flex justify-center">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleError}
                            size="large"
                            text="signin_with"
                            theme="outline"
                            shape="rectangular"
                        />
                    </div>

                    <div className="flex items-center mb-8 w-full gap-2">
                        <div className="flex-grow h-px bg-gray-200"></div>
                        <span className="text-[10px] sm:text-[11px] flex-shrink-0 font-bold text-gray-400 uppercase tracking-wider sm:tracking-widest text-center">OR CONTINUE WITH EMAIL</span>
                        <div className="flex-grow h-px bg-gray-200"></div>
                    </div>

                    {loginError && (
                        <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-medium">
                            {loginError}
                        </div>
                    )}
                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail size={18} className="text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
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
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
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
                                type="submit"
                                disabled={loginMutation.isPending}
                                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl text-base font-bold text-white bg-[#22c55e] hover:bg-[#16a34a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#22c55e] transition-all relative z-10 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loginMutation.isPending ? 'Logging in...' : 'Login to Account'}
                                {!loginMutation.isPending && <ArrowRight size={18} strokeWidth={2.5} />}
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
