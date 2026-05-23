import React from 'react';

const platformPoints = ['Web Based', 'Mobile Friendly', 'Secure Infrastructure', 'Scalable Architecture', 'Multi-Branch Ready'];

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div>
            <div className="flex items-center relative h-20 md:h-24 w-64 overflow-hidden mb-6">
              <img
                src="/logo.png"
                alt="SEEAKK Logo"
                className="absolute top-1/2 left-0 -translate-y-1/2 h-48 w-auto object-contain"
              />
            </div>
            <p className="text-lg font-black text-gray-900 mb-2">SEEAKK — Lead Performance Dynamics</p>
            <p className="text-gray-500 max-w-md font-medium leading-relaxed">
              Smart Lead Control • Attendance Intelligence • Performance Accountability
            </p>
          </div>

          <div className="flex flex-wrap gap-3 content-start">
            {platformPoints.map((item) => (
              <span
                key={item}
                className="inline-flex items-center rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm font-medium">© SEEAKK. All rights reserved.</p>
          <div className="flex flex-wrap gap-6 text-sm font-medium text-gray-500">
            <a href="#features" className="hover:text-emerald-500 transition-colors">
              Features
            </a>
            <a href="#pricing" className="hover:text-emerald-500 transition-colors">
              Pricing
            </a>
            <a href="/login" className="hover:text-emerald-500 transition-colors">
              Sign in
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
