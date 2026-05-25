import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import BrandLogo from './BrandLogo';

const navLinks = [
  { href: '#features', label: 'Features' },
  { href: '#attendance', label: 'Attendance' },
  { href: '#target-locking', label: 'Targets' },
  { href: '#pricing', label: 'Pricing' },
];

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMenu = () => setIsMobileMenuOpen((open) => !open);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <a href="/" className="flex items-center">
            <BrandLogo alt="SEEAKK Logo" />
          </a>

          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-gray-600 hover:text-emerald-500 font-medium text-sm transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium text-sm">
              Log in
            </Link>
            <Link
              to="/login"
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-lg shadow-emerald-500/30"
            >
              Start Free
            </Link>
          </div>

          <div className="md:hidden flex items-center">
            <button
              type="button"
              onClick={toggleMenu}
              className="text-gray-600 hover:text-gray-900 focus:outline-none"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

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
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={toggleMenu}
                  className="block text-gray-600 hover:text-emerald-500 font-medium text-base"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-6 mt-4 border-t border-gray-100 flex flex-col gap-3">
                <Link
                  to="/login"
                  onClick={toggleMenu}
                  className="block text-gray-600 hover:text-gray-900 font-medium text-base text-center py-2"
                >
                  Log in
                </Link>
                <Link
                  to="/login"
                  onClick={toggleMenu}
                  className="w-full text-center bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-3 rounded-full text-sm font-semibold transition-all"
                >
                  Start Free for 30 Days
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
