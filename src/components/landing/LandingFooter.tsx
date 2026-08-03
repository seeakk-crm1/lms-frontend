import React from 'react';
import { Link } from 'react-router-dom';
import BrandLogo from '../BrandLogo';
import { ShieldCheck, ArrowUpRight, Facebook, Instagram, Youtube, Linkedin } from 'lucide-react';

// Custom X (formerly Twitter) SVG Icon for precision branding
const XIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const socialLinks = [
  { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com', hoverColor: 'hover:text-blue-400 hover:border-blue-500/50' },
  { name: 'X', icon: XIcon, href: 'https://x.com', hoverColor: 'hover:text-slate-100 hover:border-slate-400/50' },
  { name: 'Facebook', icon: Facebook, href: 'https://facebook.com', hoverColor: 'hover:text-blue-500 hover:border-blue-500/50' },
  { name: 'Instagram', icon: Instagram, href: 'https://instagram.com', hoverColor: 'hover:text-pink-400 hover:border-pink-500/50' },
  { name: 'YouTube', icon: Youtube, href: 'https://youtube.com', hoverColor: 'hover:text-red-500 hover:border-red-500/50' },
];

const LandingFooter: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-gray-400 text-xs border-t border-slate-800 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-16">
          {/* Brand & Social Column */}
          <div className="col-span-2 space-y-5 pr-6">
            <a href="/" className="inline-block">
              <BrandLogo alt="Seeakk" width={130} height={36} className="filter brightness-110" />
            </a>
            <p className="text-gray-400 text-xs leading-relaxed max-w-sm font-normal">
              Seeakk Is The Enterprise Lead Accountability Platform Connecting Digital Marketing Campaigns With Company Sales Operations—Ensuring Zero Lead Leakage, Loss Of Business (LOB) Prevention, Target-Enforced Locking, And 100% Operational Transparency.
            </p>

            <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-semibold pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Seeakk Loss Of Business (LOB) Prevention V2.0</span>
            </div>

            {/* Social Media Links Bar */}
            <div className="pt-2">
              <p className="text-white font-bold uppercase tracking-wider text-[10px] mb-3">Connect With Us</p>
              <div className="flex items-center gap-2">
                {socialLinks.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Seeakk on ${item.name}`}
                    className={`p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-gray-400 ${item.hoverColor} hover:bg-slate-850 hover:scale-110 transition-all duration-300 shadow-sm flex items-center justify-center`}
                  >
                    <item.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Product Column */}
          <div>
            <p className="text-white font-bold uppercase tracking-wider text-[11px] mb-4">Platform</p>
            <ul className="space-y-2.5">
              <li><a href="#bridge" className="hover:text-white transition-colors">Chain Of Custody</a></li>
              <li><a href="#calendar" className="hover:text-white transition-colors">Operations Calendar</a></li>
              <li><a href="#showcase" className="hover:text-white transition-colors">Target Locking Engine</a></li>
              <li><a href="#showcase" className="hover:text-white transition-colors">Mandatory Follow-Up Schedule</a></li>
              <li><a href="#showcase" className="hover:text-white transition-colors">Geo-Attendance & Roster</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Excel & CSV Import</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Loss Of Business (LOB) Audit</a></li>
            </ul>
          </div>

          {/* Solutions Column */}
          <div>
            <p className="text-white font-bold uppercase tracking-wider text-[11px] mb-4">Solutions</p>
            <ul className="space-y-2.5">
              <li><a href="#pain-points" className="hover:text-white transition-colors">Lead Gen Agencies</a></li>
              <li><a href="#pain-points" className="hover:text-white transition-colors">Enterprise Sales Teams</a></li>
              <li><a href="#pain-points" className="hover:text-white transition-colors">Regional Branch Networks</a></li>
              <li><a href="#pain-points" className="hover:text-white transition-colors">Loss Of Business (LOB) Prevention</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing & Enterprise Plans</a></li>
            </ul>
          </div>

          {/* Access Column */}
          <div>
            <p className="text-white font-bold uppercase tracking-wider text-[11px] mb-4">Workspace Access</p>
            <ul className="space-y-2.5">
              <li>
                <Link to="/login" className="hover:text-white transition-colors flex items-center gap-1 text-emerald-400 font-semibold">
                  <span>Log In To Workspace</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </li>
              <li><Link to="/login" className="hover:text-white transition-colors">Activate User Account</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Request Enterprise Demo</Link></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing & Plans</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <p>© {new Date().getFullYear()} Seeakk Inc. All Rights Reserved. Enterprise Lead Performance & Loss Of Business (LOB) Prevention Platform.</p>

          <div className="flex items-center gap-6">
            <div className="flex gap-6">
              <a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#terms" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#security" className="hover:text-white transition-colors">Security & Compliance</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
