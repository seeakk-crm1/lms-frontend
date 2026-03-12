import React from 'react';
import { Search, Bell, Moon, Sun, Plus, Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import useAuthStore from '../../store/useAuthStore';

const DashboardHeader = ({ setMobileMenuOpen }) => {
    const { user } = useAuthStore();
    const displayName = typeof user?.name === 'string' && user.name.trim() ? user.name : 'Super Admin';
    const displayRole =
        typeof user?.role === 'string'
            ? user.role
            : typeof user?.role?.name === 'string' && user.role.name.trim()
                ? user.role.name
                : 'Administrator';

    return (
        <header className="h-16 sm:h-20 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 shrink-0 relative z-10 w-full transition-colors duration-300">
            {/* Left Section: Mobile Menu Toggle & Search */}
            <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                {/* Mobile Hamburger (hidden on large screens) */}
                <button
                    onClick={() => setMobileMenuOpen(true)}
                    className="md:hidden p-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors"
                >
                    <Menu size={20} className="sm:w-6 sm:h-6" />
                </button>

                {/* Mobile Logo */}
                <div className="md:hidden flex items-center shrink-0 py-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center pointer-events-none select-none">
                        <span className="text-white font-black text-lg">S</span>
                    </div>
                </div>

                {/* Global Search */}
                <div className="hidden sm:flex relative max-w-md w-full ml-4 md:ml-0 group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Search size={18} className="text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                    </div>
                    <input
                        type="search"
                        className="block w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-full text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 hover:border-gray-300 transition-all shadow-sm"
                        placeholder="Search leads, users, configurations..."
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <kbd className="hidden lg:inline-flex items-center gap-1 text-[10px] font-bold text-gray-400 bg-white border border-gray-200 px-2 py-1 rounded shadow-sm">
                            <span className="text-xs">⌘</span> K
                        </kbd>
                    </div>
                </div>
            </div>

            {/* Right Section: Actions & Profile */}
            <div className="flex items-center gap-2 sm:gap-3 md:gap-5 shrink-0 ml-2 sm:ml-4">

                {/* Quick Add Button */}
                <button className="hidden md:flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-full text-sm font-bold shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.23)] transition-all active:scale-95">
                    <Plus size={16} strokeWidth={3} />
                    <span>Add Lead</span>
                </button>

                {/* Quick Add - Mobile icon only */}
                <button className="md:hidden w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-emerald-500 text-white rounded-full shadow-md active:scale-95 transition-all">
                    <Plus size={18} strokeWidth={3} className="sm:hidden" />
                    <Plus size={20} strokeWidth={3} className="hidden sm:block" />
                </button>

                <div className="w-px h-8 bg-gray-200 mx-1 hidden sm:block"></div>

                {/* Notifications */}
                <button className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors relative group">
                    <Bell size={18} className="sm:hidden group-hover:animate-swing" />
                    <Bell size={20} className="hidden sm:block group-hover:animate-swing" />
                    <span className="absolute top-1.5 sm:top-2.5 right-1.5 sm:right-2.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
                </button>

                {/* User Dropdown Trigger */}
                <button className="flex items-center gap-3 pl-2 sm:pl-4 focus:outline-none group">
                    <div className="hidden sm:flex flex-col items-end">
                        <span className="text-sm font-bold text-gray-900 group-hover:text-emerald-600 transition-colors leading-tight">
                            {displayName}
                        </span>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                            {displayRole}
                        </span>
                    </div>
                    <div className="relative">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-xs sm:text-base shadow-md shadow-emerald-500/20 ring-2 ring-white group-hover:ring-emerald-100 transition-all">
                            {displayName.charAt(0).toUpperCase()}
                        </div>
                        <div className="absolute bottom-0 right-[-2px] sm:right-0 w-2.5 sm:w-3 h-2.5 sm:h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                </button>
            </div>
        </header>
    );
};

export default DashboardHeader;
