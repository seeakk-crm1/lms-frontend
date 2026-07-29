import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight, ShieldCheck, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import BrandLogo from '../BrandLogo';

const navLinks = [
  { href: '#positioning', label: 'Positioning' },
  { href: '#bridge', label: 'Accountability Bridge' },
  { href: '#showcase', label: 'Interactive Demo' },
  { href: '#features', label: 'Capabilities' },
  { href: '#comparison', label: 'Why Seeakk' },
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
      {/* Announcement Bar */}
      <div className="bg-gradient-to-r from-gray-900 via-emerald-950 to-gray-900 text-white text-xs py-2 px-4 border-b border-emerald-500/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 mx-auto sm:mx-0">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="font-semibold text-emerald-400 uppercase tracking-widest text-[10px]">
              V2.0 Accountability Engine
            </span>
            <span className="text-gray-400 hidden md:inline">|</span>
            <span className="text-gray-300 hidden md:inline">
              Bridging the gap between Lead Gen Agencies & Enterprise Sales Teams
            </span>
          </div>
          <Link
            to="/login"
            className="hidden sm:flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
          >
            <span>See Live Operations</span>
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Main Navbar */}
      <nav
        className={`w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-gray-950/85 backdrop-blur-xl border-b border-emerald-900/30 shadow-2xl shadow-emerald-950/20 py-3'
            : 'bg-gray-950/60 backdrop-blur-md border-b border-white/5 py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <a href="/" className="flex items-center gap-3 group">
              <div className="relative p-1 bg-gradient-to-br from-emerald-500/20 to-emerald-900/40 rounded-xl border border-emerald-500/30 group-hover:border-emerald-400/60 transition-colors">
                <BrandLogo alt="Seeakk" width={130} height={36} className="filter brightness-110" />
              </div>
            </a>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-1 bg-white/5 p-1.5 rounded-full border border-white/10 backdrop-blur-lg">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-gray-300 hover:text-white hover:bg-white/10 px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-300 hover:text-white font-semibold text-xs px-4 py-2 transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/login"
                className="relative inline-flex items-center justify-center p-0.5 overflow-hidden text-xs font-bold text-white rounded-full group bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-700 group-hover:from-emerald-400 group-hover:to-emerald-600 hover:text-white shadow-lg shadow-emerald-500/25 transition-all duration-300 active:scale-95"
              >
                <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-gray-950/10 rounded-full flex items-center gap-2 group-hover:bg-opacity-0">
                  <span>Start Free Trial</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center space-x-3">
              <Link
                to="/login"
                className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-500/30"
              >
                Sign In
              </Link>
              <button
                type="button"
                onClick={toggleMenu}
                className="p-2 text-gray-300 hover:text-white focus:outline-none bg-white/5 rounded-xl border border-white/10"
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
              className="lg:hidden bg-gray-950/95 border-b border-emerald-900/40 backdrop-blur-2xl overflow-hidden"
            >
              <div className="px-6 py-6 space-y-4">
                <div className="flex flex-col space-y-2">
                  {navLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={toggleMenu}
                      className="text-gray-300 hover:text-emerald-400 font-semibold text-sm py-2 px-3 rounded-lg hover:bg-white/5 transition-all"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>

                <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
                  <Link
                    to="/login"
                    onClick={toggleMenu}
                    className="w-full text-center text-gray-300 font-semibold text-sm py-2.5 rounded-xl bg-white/5 border border-white/10"
                  >
                    Log In to Workspace
                  </Link>
                  <Link
                    to="/login"
                    onClick={toggleMenu}
                    className="w-full text-center bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold text-sm py-3 rounded-xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
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
