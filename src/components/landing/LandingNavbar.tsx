import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight, Sparkles } from 'lucide-react';
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
    <header className="fixed top-0 left-0 w-full z-50 transition-all duration-300 pt-3 md:pt-4 px-3 sm:px-5 lg:px-6">
      {/* Liquid Glass Capsule Floating Container */}
      <nav
        className={`w-full max-w-[1440px] mx-auto rounded-full transition-all duration-300 border backdrop-blur-2xl backdrop-saturate-200 ${
          isScrolled
            ? 'bg-white/85 border-white/90 shadow-[0_12px_40px_0_rgba(16,185,129,0.12),0_1px_3px_0_rgba(0,0,0,0.05),inset_0_1px_1px_0_rgba(255,255,255,1)] py-2 px-3 sm:px-4 lg:px-5'
            : 'bg-white/65 border-white/80 shadow-[0_8px_32px_0_rgba(16,185,129,0.08),0_1px_2px_0_rgba(0,0,0,0.04),inset_0_1px_1px_0_rgba(255,255,255,0.9)] py-2.5 px-4 sm:px-5 lg:px-6'
        }`}
      >
        <div className="flex items-center justify-between gap-2 lg:gap-3 xl:gap-5 w-full">
          {/* Brand Logo Container with Liquid Gloss Refraction */}
          <a href="/" className="flex items-center gap-3 group shrink-0">
            <div className="relative p-1 bg-gradient-to-br from-emerald-500/10 via-white/80 to-emerald-100/40 rounded-xl border border-emerald-500/20 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.9)] group-hover:border-emerald-400/40 group-hover:shadow-[0_0_12px_0_rgba(16,185,129,0.2)] transition-all">
              <BrandLogo alt="Seeakk" width={125} height={34} />
            </div>
          </a>

          {/* Inner Liquid Nav Links Track */}
          <div className="hidden lg:flex items-center justify-center flex-1 min-w-0 bg-slate-100/60 p-1 lg:p-1.5 rounded-full border border-slate-200/50 backdrop-blur-md shadow-[inset_0_1px_2px_0_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-center space-x-0.5 xl:space-x-1.5 flex-nowrap whitespace-nowrap overflow-hidden w-full">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="whitespace-nowrap shrink-0 text-slate-600 hover:text-emerald-700 hover:bg-white/95 px-2.5 lg:px-2.5 xl:px-3.5 py-1.5 rounded-full text-[12px] xl:text-xs font-bold tracking-tight transition-all duration-200 shadow-none hover:shadow-[0_2px_8px_0_rgba(0,0,0,0.04)]"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Liquid Glass Action Buttons */}
          <div className="hidden lg:flex items-center justify-end space-x-2 xl:space-x-3 shrink-0 whitespace-nowrap">
            <Link
              to="/login"
              className="whitespace-nowrap shrink-0 text-slate-700 hover:text-emerald-700 font-bold text-xs px-3 xl:px-4 py-2 rounded-full hover:bg-white/80 transition-all"
            >
              Log In
            </Link>
            <Link
              to="/login"
              className="whitespace-nowrap shrink-0 relative inline-flex items-center justify-center text-xs font-bold text-white rounded-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-600 hover:to-teal-700 px-4 xl:px-5 py-2.5 shadow-[0_4px_16px_0_rgba(16,185,129,0.35),inset_0_1px_1px_0_rgba(255,255,255,0.4)] hover:shadow-[0_6px_24px_0_rgba(16,185,129,0.45)] border border-emerald-400/40 transition-all duration-300 active:scale-95 group"
            >
              <span className="flex items-center gap-1.5 xl:gap-2 whitespace-nowrap">
                <span className="whitespace-nowrap">Start Free Trial</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </span>
            </Link>
          </div>

          {/* Mobile Liquid Menu Trigger */}
          <div className="lg:hidden flex items-center space-x-2.5">
            <Link
              to="/login"
              className="text-xs font-bold text-emerald-700 bg-emerald-50/80 hover:bg-emerald-100/90 px-3 py-1.5 rounded-full border border-emerald-200/80 shadow-sm"
            >
              Sign In
            </Link>
            <button
              type="button"
              onClick={toggleMenu}
              className="p-2 text-slate-700 hover:text-slate-900 focus:outline-none bg-white/80 hover:bg-white rounded-full border border-slate-200/80 shadow-sm transition-all"
              aria-label="Toggle Navigation"
            >
              {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer with Liquid Glass Panel */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -10 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="lg:hidden mt-3 bg-white/90 backdrop-blur-3xl border border-white/90 shadow-[0_20px_60px_0_rgba(0,0,0,0.1),inset_0_1px_1px_0_rgba(255,255,255,1)] rounded-3xl overflow-hidden p-6"
            >
              <div className="space-y-4">
                <div className="flex flex-col space-y-1">
                  {navLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={toggleMenu}
                      className="text-slate-700 hover:text-emerald-600 font-bold text-sm py-2.5 px-4 rounded-xl hover:bg-slate-100/70 transition-all flex items-center justify-between"
                    >
                      <span>{link.label}</span>
                      <Sparkles className="w-3.5 h-3.5 text-emerald-500 opacity-60" />
                    </a>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-200/60 flex flex-col gap-3">
                  <Link
                    to="/login"
                    onClick={toggleMenu}
                    className="w-full text-center text-slate-700 font-bold text-sm py-3 rounded-2xl bg-slate-100/80 border border-slate-200/80 shadow-sm"
                  >
                    Log In To Workspace
                  </Link>
                  <Link
                    to="/login"
                    onClick={toggleMenu}
                    className="w-full text-center bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-sm py-3.5 rounded-2xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
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
