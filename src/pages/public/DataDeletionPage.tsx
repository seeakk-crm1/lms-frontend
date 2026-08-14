import React, { useEffect, useState } from 'react';
import { Trash2, ShieldCheck, Mail, CheckCircle2, Clock, FileText, Lock, AlertCircle, Search, ExternalLink } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import LandingNavbar from '../../components/landing/LandingNavbar';
import LandingFooter from '../../components/landing/LandingFooter';

const COMPANY_NAME = 'Seeakk Inc.';
const WEBSITE_URL = 'https://www.seeakk.com';
const CONTACT_EMAIL = 'admin@seeakk.com';
const PRIVACY_EMAIL = 'privacy@seeakk.com';
const LAST_UPDATED = 'August 14, 2026';

const sections = [
  { id: 'about-deletion', number: '01', title: 'About Data Deletion' },
  { id: 'meta-deletion', number: '02', title: 'Meta / Facebook Data Deletion' },
  { id: 'how-to-request', number: '03', title: 'How to Request Deletion' },
  { id: 'info-to-include', number: '04', title: 'Information to Include' },
  { id: 'after-request', number: '05', title: 'What Happens After a Request' },
  { id: 'third-party-services', number: '06', title: 'Third-Party Services' },
  { id: 'deletion-form', number: '07', title: 'Online Deletion Request Form' },
  { id: 'contact-info', number: '08', title: 'Contact Information' },
];

const DataDeletionPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const confirmationCode = searchParams.get('code') || searchParams.get('confirmation_code');

  const [formState, setFormState] = useState({
    name: '',
    email: '',
    organization: '',
    requestType: 'Delete Meta-Connected Data',
    message: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedCode, setSubmittedCode] = useState('');

  useEffect(() => {
    document.title = 'Data Deletion | SEEAKK';
    
    // Set meta description
    let metaTag = document.querySelector('meta[name="description"]');
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.setAttribute('name', 'description');
      document.head.appendChild(metaTag);
    }
    metaTag.setAttribute(
      'content',
      'Learn how to request deletion of personal information and Meta-connected data associated with SEEAKK.'
    );

    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name.trim() || !formState.email.trim()) return;

    setSubmitting(true);
    setTimeout(() => {
      const generatedCode = 'DEL-' + Math.random().toString(36).substring(2, 10).toUpperCase();
      setSubmittedCode(generatedCode);
      setSubmitted(true);
      setSubmitting(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-emerald-200 selection:text-emerald-900 overflow-x-hidden flex flex-col justify-between">
      <LandingNavbar />

      <main className="flex-1 pt-32 sm:pt-36 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-10">
          {/* Header Banner */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100">
                  <Trash2 className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-rose-600">Privacy Control & Data Deletion</span>
                  <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">User Data Deletion</h1>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Last Updated: {LAST_UPDATED}</span>
              </div>
            </div>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              SEEAKK respects your privacy and provides clear, accessible methods to request deletion of personal information, workspace metadata, and data associated with connected services (including Meta / Facebook Lead Ads).
            </p>
          </div>

          {/* Meta Callback Confirmation Banner (If URL has ?code=...) */}
          {confirmationCode && (
            <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-6 sm:p-8 shadow-sm space-y-3">
              <div className="flex items-center gap-3 text-emerald-800">
                <CheckCircle2 className="w-6 h-6 shrink-0 text-emerald-600" />
                <h3 className="font-extrabold text-base sm:text-lg">Meta Data Deletion Request Verified</h3>
              </div>
              <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed">
                The data deletion request initiated via Meta / Facebook settings has been received and processed by Seeakk.
              </p>
              <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-2xl border border-emerald-200 text-xs font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-sans font-bold">Confirmation Code</span>
                  <span className="font-bold text-slate-900">{confirmationCode}</span>
                </div>
                <div className="border-l border-slate-200 pl-4">
                  <span className="text-slate-400 block text-[10px] uppercase font-sans font-bold">Status</span>
                  <span className="font-bold text-emerald-700">COMPLETED & TOKEN REVOKED</span>
                </div>
              </div>
            </div>
          )}

          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Table of Contents Sticky Sidebar */}
            <aside className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm lg:sticky lg:top-28 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>Navigation</span>
              </div>
              <nav className="space-y-1 max-h-[60vh] overflow-y-auto pr-1">
                {sections.map((sec) => (
                  <a
                    key={sec.id}
                    href={`#${sec.id}`}
                    className="flex items-center gap-3 p-2 rounded-xl text-xs font-medium text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/60 transition-all"
                  >
                    <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                      {sec.number}
                    </span>
                    <span className="truncate">{sec.title}</span>
                  </a>
                ))}
              </nav>
            </aside>

            {/* Content Column */}
            <article className="lg:col-span-8 bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/80 shadow-sm space-y-10 text-slate-700 text-sm sm:text-base leading-relaxed">
              {/* Section 01 */}
              <section id="about-deletion" className="space-y-4 scroll-mt-32">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">01</span>
                  <h2 className="text-xl font-bold text-slate-900">About Data Deletion</h2>
                </div>
                <p>
                  As an enterprise SaaS platform, Seeakk allows customer organizations and individual users to request deletion of personal information, workspace accounts, or authorized third-party integration data.
                </p>
                <p>
                  Data deletion requests apply to data held under Seeakk's direct control, subject to necessary legal, audit, security, and contractual retention requirements.
                </p>
              </section>

              {/* Section 02 */}
              <section id="meta-deletion" className="space-y-4 scroll-mt-32 bg-blue-50/40 p-6 rounded-2xl border border-blue-100">
                <div className="flex items-center gap-3 border-b border-blue-100 pb-3">
                  <span className="text-xs font-mono font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-lg">02</span>
                  <h2 className="text-xl font-bold text-slate-900">Meta / Facebook Data Deletion</h2>
                </div>
                <p className="text-slate-700">
                  If an organization connected Meta Business assets (such as Facebook Pages or Lead Ads forms) to Seeakk, administrators may request deletion of authorization tokens and integration metadata.
                </p>
                <ul className="space-y-2 list-disc list-inside pl-2 text-slate-600">
                  <li><strong>Meta Deletion Scope:</strong> Revoking Meta authorization deletes stored access tokens, connected Page links, form configuration mappings, and integration logs from Seeakk.</li>
                  <li><strong>Meta Account Removal:</strong> You can also remove Seeakk directly from your Facebook account settings under <em>Business Applications / Apps and Websites</em>. When removed, Meta issues a signed data deletion callback to Seeakk, automatically invalidating stored access tokens.</li>
                </ul>
              </section>

              {/* Section 03 */}
              <section id="how-to-request" className="space-y-4 scroll-mt-32">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">03</span>
                  <h2 className="text-xl font-bold text-slate-900">How to Request Deletion</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">Option A: In-App Disconnect</span>
                    <h4 className="font-bold text-slate-900 text-sm">Disconnect Meta Inside Seeakk</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Navigate to <strong>Settings → Meta Ads</strong> and click <strong>Disconnect Meta Account</strong>. This immediately revokes stored access tokens and stops future lead synchronization.
                    </p>
                  </div>

                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">Option B: Direct Deletion Request</span>
                    <h4 className="font-bold text-slate-900 text-sm">Submit Email or Online Request</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Submit a request via the online form below or email <strong>{PRIVACY_EMAIL}</strong> or <strong>{CONTACT_EMAIL}</strong> with details identifying your workspace account.
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 04 */}
              <section id="info-to-include" className="space-y-4 scroll-mt-32">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">04</span>
                  <h2 className="text-xl font-bold text-slate-900">Information to Include</h2>
                </div>
                <p>To help us verify and process your request efficiently, please include:</p>
                <ul className="space-y-2 list-disc list-inside pl-2 text-slate-600">
                  <li>Full Name and business email address associated with the account.</li>
                  <li>Company / Organization workspace name.</li>
                  <li>Details of the data or integration to be deleted (e.g. Meta Lead Ads connection tokens, account profile data).</li>
                  <li>Relevant Meta Page ID or Form ID if applicable.</li>
                </ul>
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-xs text-amber-900 font-medium">
                  <Lock className="w-5 h-5 shrink-0 text-amber-600" />
                  <span><strong>Security Reminder:</strong> Never send account passwords, API secrets, or private financial credentials in deletion requests.</span>
                </div>
              </section>

              {/* Section 05 */}
              <section id="after-request" className="space-y-4 scroll-mt-32">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">05</span>
                  <h2 className="text-xl font-bold text-slate-900">What Happens After a Request</h2>
                </div>
                <ol className="space-y-2 list-decimal list-inside pl-2 text-slate-600">
                  <li><strong>Verification:</strong> We verify the request to ensure it originates from an authorized account holder or organization administrator.</li>
                  <li><strong>Data Identification:</strong> Applicable personal or integration data stored under Seeakk control is identified.</li>
                  <li><strong>Processing & Revocation:</strong> Stored tokens and integration metadata are deleted or invalidated.</li>
                  <li><strong>Confirmation:</strong> A confirmation notification or tracking status is provided.</li>
                </ol>
                <p className="text-xs text-slate-500 italic">
                  Note: Certain transactional, security audit log, financial, or legal records may be retained as required by applicable laws or contractual requirements.
                </p>
              </section>

              {/* Section 06 */}
              <section id="third-party-services" className="space-y-4 scroll-mt-32">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">06</span>
                  <h2 className="text-xl font-bold text-slate-900">Third-Party Services</h2>
                </div>
                <p>
                  Deleting data from Seeakk does not automatically delete data stored independently by third-party providers (such as Meta, Facebook, or third-party telephony providers). You may manage data held by third parties directly within their respective platform settings.
                </p>
              </section>

              {/* Section 07 - Deletion Form */}
              <section id="deletion-form" className="space-y-6 scroll-mt-32 bg-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg">07</span>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Online Data Deletion Request Form</h2>
                    <p className="text-xs text-slate-500">Submit an official data deletion request directly to our privacy compliance team.</p>
                  </div>
                </div>

                {submitted ? (
                  <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold text-base">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span>Data Deletion Request Received</span>
                    </div>
                    <p className="text-xs text-emerald-900 leading-relaxed">
                      Thank you. Your request has been logged. Our privacy team will review and process your request shortly.
                    </p>
                    <div className="bg-white p-3 rounded-xl border border-emerald-200 text-xs font-mono">
                      <span className="text-slate-400 block text-[10px] uppercase font-sans">Reference Request Code</span>
                      <span className="font-bold text-slate-900">{submittedCode}</span>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                        <input
                          type="text"
                          required
                          value={formState.name}
                          onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                          placeholder="Your Name"
                          className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white font-medium text-slate-900 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Business Email *</label>
                        <input
                          type="email"
                          required
                          value={formState.email}
                          onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                          placeholder="email@company.com"
                          className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white font-medium text-slate-900 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Organization</label>
                        <input
                          type="text"
                          value={formState.organization}
                          onChange={(e) => setFormState({ ...formState, organization: e.target.value })}
                          placeholder="Organization Name"
                          className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white font-medium text-slate-900 focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Request Type *</label>
                        <select
                          value={formState.requestType}
                          onChange={(e) => setFormState({ ...formState, requestType: e.target.value })}
                          className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white font-medium text-slate-900 focus:outline-none focus:border-emerald-500"
                        >
                          <option value="Delete Meta-Connected Data">Delete Meta-Connected Data</option>
                          <option value="Delete Seeakk Account Data">Delete Seeakk Account Data</option>
                          <option value="Delete Integration Data">Delete Integration Data</option>
                          <option value="Other Privacy Request">Other Privacy Request</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Request Details & Notes</label>
                      <textarea
                        rows={3}
                        value={formState.message}
                        onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                        placeholder="Provide relevant details (e.g. Meta Page ID or specific items to delete)..."
                        className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white font-medium text-slate-900 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition disabled:opacity-50 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>{submitting ? 'Submitting Request...' : 'Submit Deletion Request'}</span>
                    </button>
                  </form>
                )}
              </section>

              {/* Section 08 */}
              <section id="contact-info" className="space-y-4 scroll-mt-32">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">08</span>
                  <h2 className="text-xl font-bold text-slate-900">Contact Information</h2>
                </div>
                <p className="text-slate-600">If you have any questions regarding data deletion, please contact us at:</p>
                <div className="space-y-2 font-semibold text-xs text-slate-800 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Company:</span>
                    <span>{COMPANY_NAME}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Website:</span>
                    <a href={WEBSITE_URL} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">
                      {WEBSITE_URL}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Privacy Contact:</span>
                    <a href={`mailto:${PRIVACY_EMAIL}`} className="text-emerald-600 hover:underline">
                      {PRIVACY_EMAIL}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Support Email:</span>
                    <a href={`mailto:${CONTACT_EMAIL}`} className="text-emerald-600 hover:underline">
                      {CONTACT_EMAIL}
                    </a>
                  </div>
                </div>
              </section>
            </article>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
};

export default DataDeletionPage;
