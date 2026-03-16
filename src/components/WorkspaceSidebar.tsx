import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, LayoutGrid } from 'lucide-react';
import { User } from '../types/user.types';

interface WorkspaceSidebarProps {
    user: User | null;
}

const WorkspaceSidebar: React.FC<WorkspaceSidebarProps> = ({ user }) => {
    const firstName =
        user?.name && typeof user.name === 'string' && user.name.trim()
            ? user.name.split(' ')[0]
            : 'User';
    return (
        <div className="md:w-[42%] bg-gradient-to-br from-[#e0fcf3] to-[#f4fefb] p-10 relative overflow-hidden flex flex-col justify-between hidden md:flex">
            <div className="relative z-10">
                <div className="relative h-12 w-40 mb-10 overflow-hidden">
                    <img src="/logo.png" alt="Seeakk" className="absolute top-1/2 left-0 -translate-y-1/2 h-28 w-auto object-contain object-left" />
                </div>

                <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full mb-6 italic">
                    ✦ QUICK SETUP
                </div>

                <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight leading-tight">
                    Hi {firstName} <span className="inline-block animate-wave">👋</span>
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
    );
};

export default WorkspaceSidebar;
