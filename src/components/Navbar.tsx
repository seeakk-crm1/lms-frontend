import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Zap, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <motion.nav
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    <div className="flex items-center relative h-20 w-48 lg:w-56 overflow-hidden">
                        <img
                            src="/logo.png"
                            alt="Seeakk Logo"
                            className="absolute top-1/2 left-0 -translate-y-1/2 h-48 md:h-64 lg:h-96 w-auto object-contain"
                        />
                    </div>

                    <div className="hidden md:flex items-center space-x-8">
                        <a href="#features" className="text-gray-600 hover:text-emerald-500 font-medium text-sm transition-colors">Features</a>
                        <a href="#solutions" className="text-gray-600 hover:text-emerald-500 font-medium text-sm transition-colors">Solutions</a>
                        <a href="#pricing" className="text-gray-600 hover:text-emerald-500 font-medium text-sm transition-colors">Pricing</a>
                        <a href="#resources" className="text-gray-600 hover:text-emerald-500 font-medium text-sm transition-colors">Resources</a>
                    </div>

                    <div className="hidden md:flex items-center space-x-4">
                        <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium text-sm">Log in</Link>
                        <Link to="/login" className="bg-emerald-400 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-lg shadow-emerald-400/30">
                            Get Started
                        </Link>
                    </div>

                    <div className="md:hidden flex items-center">
                        <button
                            onClick={toggleMenu}
                            className="text-gray-600 hover:text-gray-900 focus:outline-none"
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="md:hidden bg-white border-b border-gray-100 overflow-hidden shadow-xl"
                    >
                        <div className="px-6 py-4 space-y-4">
                            <a href="#features" onClick={toggleMenu} className="block text-gray-600 hover:text-emerald-500 font-medium text-base">Features</a>
                            <a href="#solutions" onClick={toggleMenu} className="block text-gray-600 hover:text-emerald-500 font-medium text-base">Solutions</a>
                            <a href="#pricing" onClick={toggleMenu} className="block text-gray-600 hover:text-emerald-500 font-medium text-base">Pricing</a>
                            <a href="#resources" onClick={toggleMenu} className="block text-gray-600 hover:text-emerald-500 font-medium text-base">Resources</a>
                            <div className="pt-6 mt-4 border-t border-gray-100 flex flex-col gap-3">
                                <Link to="/login" onClick={toggleMenu} className="block text-gray-600 hover:text-gray-900 font-medium text-base text-center py-2">Log in</Link>
                                <Link to="/login" onClick={toggleMenu} className="w-full text-center bg-emerald-400 hover:bg-emerald-500 text-white px-5 py-3 rounded-full text-sm font-semibold transition-all shadow-lg shadow-emerald-400/30">
                                    Get Started
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
};

export default Navbar;
