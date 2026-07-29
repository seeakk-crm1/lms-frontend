import React from 'react';
import { Link } from 'react-router-dom';
import BrandLogo from '../BrandLogo';
import { ShieldCheck, ArrowUpRight } from 'lucide-react';

const LandingFooter: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-gray-400 text-xs border-t border-slate-800 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-16">
          {/* Brand Column */}
          <div className="col-span-2 space-y-4 pr-6">
            <a href="/" className="inline-block">
              <BrandLogo alt="Seeakk" width={130} height={36} className="filter brightness-110" />
            </a>
            <p className="text-gray-400 text-xs leading-relaxed max-w-sm">
              Seeakk is the enterprise lead accountability platform connecting digital marketing campaigns with company sales operations—ensuring zero lead leakage, Loss of Business (LOB) prevention, target-enforced locking, and 100% operational transparency.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-semibold pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Seeakk Loss of Business (LOB) Prevention V2.0</span>
            </div>
          </div>

          {/* Product Column */}
          <div>
            <p className="text-white font-bold uppercase tracking-wider text-[11px] mb-4">Platform</p>
            <ul className="space-y-2.5">
              <li><a href="#bridge" className="hover:text-white transition-colors">Chain of Custody</a></li>
              <li><a href="#showcase" className="hover:text-white transition-colors">Target Locking Engine</a></li>
              <li><a href="#showcase" className="hover:text-white transition-colors">Mandatory Follow-up SLA</a></li>
              <li><a href="#showcase" className="hover:text-white transition-colors">Geo-Attendance & Roster</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Excel & CSV Import</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Loss of Business (LOB) Audit</a></li>
            </ul>
          </div>

          {/* Solutions Column */}
          <div>
            <p className="text-white font-bold uppercase tracking-wider text-[11px] mb-4">Solutions</p>
            <ul className="space-y-2.5">
              <li><a href="#pain-points" className="hover:text-white transition-colors">Lead Gen Agencies</a></li>
              <li><a href="#pain-points" className="hover:text-white transition-colors">Enterprise Sales Teams</a></li>
              <li><a href="#pain-points" className="hover:text-white transition-colors">Regional Branch Networks</a></li>
              <li><a href="#pain-points" className="hover:text-white transition-colors">Loss of Business (LOB) Prevention</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">LOB Recovery ROI Calculator</a></li>
            </ul>
          </div>

          {/* Access Column */}
          <div>
            <p className="text-white font-bold uppercase tracking-wider text-[11px] mb-4">Workspace Access</p>
            <ul className="space-y-2.5">
              <li>
                <Link to="/login" className="hover:text-white transition-colors flex items-center gap-1 text-emerald-400 font-semibold">
                  <span>Log In to Workspace</span>
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
          <p>© {new Date().getFullYear()} Seeakk Inc. All rights reserved. Enterprise Lead Performance & Loss of Business (LOB) Prevention Platform.</p>
          <div className="flex gap-6">
            <a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#security" className="hover:text-white transition-colors">Security & Compliance</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
