import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import BrandLogo from '../BrandLogo';

const navLinks = [
  { href: '#positioning', label: 'Positioning' },
  { href: '#bridge', label: 'Accountability Chain' },
  { href: '#showcase', label: 'Interactive Tour' },
  { href: '#calendar', label: 'Operations Calendar' },
  { href: '#features', label: 'Capabilities' },
  { href: '#comparison', label: 'LOB Prevention' },
  { href: '#pricing', label: 'Pricing' },
];

const LandingNavbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsMobileMenuOpen((open) => !open);

  return (
    <header className="fixed top-0 left-0 w-full z-50 transition-all duration-300">
      {/* Main Navbar Sitting Flush at Top */}
      <nav
        className={`w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-white/90 backdrop-blur-xl border-b border-gray-200/80 shadow-md shadow-slate-950/5 py-3'
            : 'bg-white/80 backdrop-blur-md border-b border-gray-100 py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Brand Logo */}
            <a href="/" className="flex items-center gap-3 group">
              <div className="relative p-1 bg-emerald-50 rounded-xl border border-emerald-100 group-hover:border-emerald-300 transition-colors">
                <BrandLogo alt="Seeakk" width={130} height={36} />
              </div>
            </a>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-1 bg-slate-100/80 p-1.5 rounded-full border border-slate-200/80 backdrop-blur-lg">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-slate-600 hover:text-emerald-700 hover:bg-white px-3.5 py-2 rounded-full text-xs font-semibold tracking-wide transition-all shadow-none hover:shadow-sm"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center space-x-4">
              <Link
                to="/login"
                className="text-slate-700 hover:text-emerald-700 font-bold text-xs px-4 py-2 transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/login"
                className="relative inline-flex items-center justify-center p-0.5 overflow-hidden text-xs font-bold text-white rounded-full group bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-700 hover:from-emerald-600 hover:to-teal-800 shadow-lg shadow-emerald-500/20 transition-all duration-300 active:scale-95"
              >
                <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-transparent rounded-full flex items-center gap-2">
                  <span>Start Free Trial</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center space-x-3">
              <Link
                to="/login"
                className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200"
              >
                Sign In
              </Link>
              <button
                type="button"
                onClick={toggleMenu}
                className="p-2 text-slate-700 hover:text-slate-900 focus:outline-none bg-slate-100 rounded-xl border border-slate-200"
                aria-label="Toggle Navigation"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="lg:hidden bg-white/95 border-b border-gray-200 backdrop-blur-2xl overflow-hidden shadow-xl"
            >
              <div className="px-6 py-6 space-y-4">
                <div className="flex flex-col space-y-2">
                  {navLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={toggleMenu}
                      className="text-slate-700 hover:text-emerald-600 font-semibold text-sm py-2 px-3 rounded-lg hover:bg-slate-50 transition-all"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>

                <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
                  <Link
                    to="/login"
                    onClick={toggleMenu}
                    className="w-full text-center text-slate-700 font-semibold text-sm py-2.5 rounded-xl bg-slate-100 border border-slate-200"
                  >
                    Log In to Workspace
                  </Link>
                  <Link
                    to="/login"
                    onClick={toggleMenu}
                    className="w-full text-center bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-sm py-3 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                  >
                    <span>Start Free 30-Day Trial</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
};

export default LandingNavbar;
