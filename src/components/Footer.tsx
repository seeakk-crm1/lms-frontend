import React from 'react';
import { Link } from 'react-router-dom';

const platformPoints = [
  'Web Based',
  'Mobile Friendly',
  'Secure Infrastructure',
  'Scalable Architecture',
  'Multi-Branch Ready',
];

const quickLinks = [
  { href: '#features', label: 'Features' },
  { href: '#accountability', label: 'Accountability' },
  { href: '#why-seeakk', label: 'Why SEEAKK' },
  { href: '#attendance', label: 'Attendance' },
  { href: '#target-locking', label: 'Targets & Locking' },
  { href: '#dashboard', label: 'Dashboard' },
  { href: '#pricing', label: 'Pricing' },
];

const resourceLinks: Array<{ label: string; to?: string; href?: string }> = [
  { to: '/login', label: 'Sign in' },
  { to: '/login', label: 'Start free trial' },
  { to: '/activate-account', label: 'Activate account' },
  { href: '#', label: 'Help center' },
];

const legalLinks = [
  { href: '#', label: 'Privacy Policy' },
  { href: '#', label: 'Terms of Service' },
];

const linkClassName =
  'text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2';

const FooterLinkList = ({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) => (
  <nav aria-labelledby={id} className="min-w-0">
    <h3 id={id} className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-4">
      {title}
    </h3>
    <ul className="space-y-2.5">{children}</ul>
  </nav>
);

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-100" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-10 border-b border-gray-100">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-4">
            <a
              href="/"
              className="inline-flex items-center gap-3 rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
              aria-label="SEEAKK home"
            >
              <img src="/logo.png" alt="" className="h-10 w-auto object-contain" aria-hidden="true" />
              <span className="text-base font-black text-gray-900">SEEAKK</span>
            </a>

            <p className="mt-3 text-sm font-bold text-emerald-600">Lead Performance Dynamics</p>

            <p className="mt-3 text-sm text-gray-600 leading-relaxed max-w-sm">
              The all-in-one lead accountability platform for sales teams and enterprises—track
              performance, control attendance, automate follow-ups, and eliminate lead leakage.
            </p>

            <p className="mt-3 text-xs font-medium text-gray-500 leading-relaxed">
              Smart Lead Control · Attendance Intelligence · Performance Accountability
            </p>

            <ul className="mt-5 flex flex-wrap gap-2" aria-label="Platform highlights">
              {platformPoints.map((item) => (
                <li key={item}>
                  <span className="inline-flex items-center rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 lg:col-start-6">
            <FooterLinkList id="footer-quick-links" title="Quick Links">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className={linkClassName}>
                    {link.label}
                  </a>
                </li>
              ))}
            </FooterLinkList>
          </div>

          {/* Resources */}
          <div className="lg:col-span-2">
            <FooterLinkList id="footer-resources" title="Resources">
              {resourceLinks.map((link) => (
                <li key={link.label}>
                  {link.href ? (
                    <a href={link.href} className={linkClassName}>
                      {link.label}
                    </a>
                  ) : (
                    <Link to={link.to!} className={linkClassName}>
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </FooterLinkList>
          </div>

          {/* Legal & Contact */}
          <div className="lg:col-span-2">
            <FooterLinkList id="footer-legal" title="Legal">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className={linkClassName}>
                    {link.label}
                  </a>
                </li>
              ))}
            </FooterLinkList>

            <div className="mt-8">
              <h3
                id="footer-contact"
                className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-4"
              >
                Contact
              </h3>
              <ul className="space-y-2.5 text-sm text-gray-600">
                <li>
                  <Link to="/login" className={`${linkClassName} inline-block`}>
                    Product access & sign in
                  </Link>
                </li>
                <li>
                  <a href="#pricing" className={`${linkClassName} inline-block`}>
                    Enterprise & sales inquiries
                  </a>
                </li>
              </ul>
              <p className="mt-3 text-xs text-gray-500 leading-relaxed">
                Existing customers: sign in to your workspace. New teams: start from pricing or your
                invite link.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-sm text-gray-500">
            <span className="sr-only">Copyright </span>© {year} SEEAKK. All rights reserved.
          </p>
          <p className="text-xs font-medium text-gray-400">
            Built for disciplined sales operations · Web & mobile ready
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
