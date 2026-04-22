import React from 'react';
import { Zap, Twitter, Linkedin, Github } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-white border-t border-gray-100 pt-20 pb-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center relative h-20 md:h-24 w-64 md:w-80 overflow-hidden mb-6">
                            <img
                                src="/logo.png"
                                alt="Seeakk Logo"
                                className="absolute top-1/2 left-0 -translate-y-1/2 h-48 md:h-64 lg:h-96 w-auto object-contain"
                            />
                        </div>
                        <p className="text-gray-500 max-w-sm font-medium leading-relaxed">
                            Record-breaking lead management and intelligent automation and sales pipeline strategy.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-900 mb-6 uppercase tracking-wider text-sm">Product</h4>
                        <ul className="space-y-4 font-medium text-gray-500">
                            <li><a href="#" className="hover:text-emerald-500 transition-colors">Lead Scoring</a></li>
                            <li><a href="#" className="hover:text-emerald-500 transition-colors">Sales Pipeline</a></li>
                            <li><a href="#" className="hover:text-emerald-500 transition-colors">Integrations</a></li>
                            <li><a href="#" className="hover:text-emerald-500 transition-colors">Pricing</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-900 mb-6 uppercase tracking-wider text-sm">Company</h4>
                        <ul className="space-y-4 font-medium text-gray-500">
                            <li><a href="#" className="hover:text-emerald-500 transition-colors">About Us</a></li>
                            <li><a href="#" className="hover:text-emerald-500 transition-colors">Careers</a></li>
                            <li><a href="#" className="hover:text-emerald-500 transition-colors">Blog</a></li>
                            <li><a href="#" className="hover:text-emerald-500 transition-colors">Contact</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-900 mb-6 uppercase tracking-wider text-sm">Legal</h4>
                        <ul className="space-y-4 font-medium text-gray-500">
                            <li><a href="#" className="hover:text-emerald-500 transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-emerald-500 transition-colors">Terms of Service</a></li>
                            <li><a href="#" className="hover:text-emerald-500 transition-colors">Cookie Policy</a></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-400 text-sm font-medium">
                        &copy; {new Date().getFullYear()} Seeakk Inc. All rights reserved.
                    </p>

                    <div className="flex space-x-6 text-gray-400">
                        <a href="#" className="hover:text-emerald-500 transition-colors">
                            <Twitter size={20} />
                        </a>
                        <a href="#" className="hover:text-emerald-500 transition-colors">
                            <Linkedin size={20} />
                        </a>
                        <a href="#" className="hover:text-emerald-500 transition-colors">
                            <Github size={20} />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
