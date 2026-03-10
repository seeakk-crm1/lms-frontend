import React from 'react';
import { motion } from 'framer-motion';
import useAuthStore from '../store/useAuthStore';
import { LogOut, Home, Settings, User, Activity, TrendingUp, Laptop, Smartphone, CheckCircle, Clock, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    const currentDeviceId = localStorage.getItem('deviceId');

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
                <div className="h-16 flex items-center px-6 border-b border-gray-100">
                    <div className="relative h-8 w-24 overflow-hidden">
                        <img src="/logo.png" alt="Seeakk" className="absolute top-1/2 left-0 -translate-y-1/2 h-8 w-auto object-contain" />
                    </div>
                </div>

                <nav className="flex-1 py-6 px-4 space-y-2">
                    <a href="#" className="flex items-center gap-3 px-3 py-2 text-emerald-600 bg-emerald-50 rounded-lg font-medium">
                        <Home size={20} />
                        Dashboard
                    </a>
                    <a href="#" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg font-medium transition-colors">
                        <Activity size={20} />
                        Analytics
                    </a>
                    <a href="#" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg font-medium transition-colors">
                        <User size={20} />
                        Customers
                    </a>
                    <a href="#" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg font-medium transition-colors">
                        <Settings size={20} />
                        Settings
                    </a>
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-2 w-full px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-bold transition-colors"
                    >
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sm:px-10 shrink-0">
                    <h1 className="text-xl font-bold text-gray-800">Overview</h1>

                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-gray-900">{user?.name || 'User Profile'}</p>
                            <p className="text-xs text-gray-500">{user?.email || 'admin@seeakk.com'}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center border-2 border-emerald-500 text-emerald-600 font-bold overflow-hidden shadow-sm">
                            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                    </div>
                </header>

                {/* Content Scrollable Area */}
                <div className="flex-1 overflow-auto p-6 sm:p-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="max-w-5xl mx-auto"
                    >
                        <div className="mb-8">
                            <h2 className="text-2xl font-extrabold text-gray-900">Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋</h2>
                            <p className="text-gray-500 mt-1">Here is what's happening with your projects today.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            {/* Stat Card 1 */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Total Revenue</p>
                                <h3 className="text-3xl font-extrabold text-gray-900">$24,590</h3>
                                <p className="text-sm font-bold text-emerald-500 mt-2 flex items-center gap-1">
                                    <TrendingUp size={14} /> +12.5% this month
                                </p>
                            </div>

                            {/* Stat Card 2 */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Active Users</p>
                                <h3 className="text-3xl font-extrabold text-gray-900">1,245</h3>
                                <p className="text-sm font-bold text-emerald-500 mt-2 flex items-center gap-1">
                                    <TrendingUp size={14} /> +3.2% this week
                                </p>
                            </div>

                            {/* Stat Card 3 */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">New Signups</p>
                                <h3 className="text-3xl font-extrabold text-gray-900">382</h3>
                                <p className="text-sm font-bold text-red-500 mt-2 flex items-center gap-1">
                                    <TrendingUp size={14} className="rotate-180" /> -1.4% this week
                                </p>
                            </div>
                        </div>

                        {/* Active Sessions Tracking Area */}
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-xl font-extrabold text-gray-900">Active Sessions</h3>
                                    <p className="text-sm text-gray-500 mt-1">Manage and track the devices currently logged into your account.</p>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                {user?.devices && user.devices.length > 0 ? (
                                    <ul className="divide-y divide-gray-100">
                                        {[...user.devices]
                                            .sort((a, b) => new Date(b.lastActive) - new Date(a.lastActive))
                                            .map((device) => {
                                                const isCurrent = device.deviceId === currentDeviceId;
                                                const isMobile = device.deviceType?.toLowerCase() === 'mobile';

                                                return (
                                                    <li key={device._id || device.deviceId} className="p-6 sm:px-8 hover:bg-gray-50 transition-colors flex items-start gap-4 sm:gap-6">
                                                        <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${isCurrent ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'} `}>
                                                            {isMobile ? <Smartphone size={24} /> : <Laptop size={24} />}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                                                                <div className="flex items-center gap-2">
                                                                    <h4 className="text-base font-bold text-gray-900 truncate">
                                                                        {device.os || 'Unknown OS'}
                                                                    </h4>
                                                                    {isCurrent && (
                                                                        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full">
                                                                            <CheckCircle size={10} /> This Device
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-1 text-xs font-bold text-gray-400 sm:min-w-[120px] sm:justify-end">
                                                                    <Clock size={12} />
                                                                    <span>{new Date(device.lastActive).toLocaleString()}</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 mt-2 text-sm text-gray-500">
                                                                <div className="flex items-center gap-1.5 shrink-0">
                                                                    <Globe size={14} className="text-gray-400" />
                                                                    <span className="font-medium text-gray-700">{device.browser || 'Unknown Browser'}</span>
                                                                </div>
                                                                <div className="h-1 w-1 bg-gray-300 rounded-full hidden sm:block shrink-0"></div>
                                                                <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400">
                                                                    {device.ipAddress}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </li>
                                                );
                                            })}
                                    </ul>
                                ) : (
                                    <div className="p-12 text-center flex flex-col items-center">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                            <Activity size={24} className="text-gray-400" />
                                        </div>
                                        <h4 className="text-lg font-bold text-gray-900">No sessions tracked yet</h4>
                                        <p className="text-sm text-gray-500 mt-1">Please completely log out and log back in to activate tracking.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
