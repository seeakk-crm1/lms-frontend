import React, { useEffect } from 'react';
import { ShieldCheck, Mail, Globe, Clock, ChevronRight, Lock, FileText, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import LandingNavbar from '../../components/landing/LandingNavbar';
import LandingFooter from '../../components/landing/LandingFooter';

const COMPANY_NAME = 'Seeakk Inc.';
const WEBSITE_URL = 'https://www.seeakk.com';
const CONTACT_EMAIL = 'admin@seeakk.com';
const LAST_UPDATED = 'August 14, 2026';

const sections = [
  { id: 'introduction', number: '01', title: 'Introduction' },
  { id: 'information-collected', number: '02', title: 'Information We Collect' },
  { id: 'customer-data', number: '03', title: 'Information Provided by Customer Organizations' },
  { id: 'how-we-use', number: '04', title: 'How We Use Information' },
  { id: 'meta-integration', number: '05', title: 'Meta / Facebook Lead Ads Integration' },
  { id: 'third-party-integrations', number: '06', title: 'Third-Party Integrations' },
  { id: 'information-sharing', number: '07', title: 'How Information Is Shared' },
  { id: 'data-security', number: '08', title: 'Data Security' },
  { id: 'data-retention', number: '09', title: 'Data Retention' },
  { id: 'data-deletion', number: '10', title: 'Data Deletion' },
  { id: 'user-rights', number: '11', title: 'User Rights' },
  { id: 'cookies', number: '12', title: 'Cookies and Similar Technologies' },
  { id: 'childrens-privacy', number: '13', title: "Children's Privacy" },
  { id: 'international-processing', number: '14', title: 'International Data Processing' },
  { id: 'changes-policy', number: '15', title: 'Changes to This Privacy Policy' },
  { id: 'contact-us', number: '16', title: 'Contact Us' },
];

const PrivacyPolicyPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Privacy Policy | SEEAKK';
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-emerald-200 selection:text-emerald-900 overflow-x-hidden flex flex-col justify-between">
      <LandingNavbar />

      <main className="flex-1 pt-32 sm:pt-36 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-10">
          {/* Header Banner */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-600">Legal Notice & Transparency</span>
                  <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Privacy Policy</h1>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Last Updated: {LAST_UPDATED}</span>
              </div>
            </div>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              This Privacy Policy explains how <strong>{COMPANY_NAME}</strong> ("Seeakk", "we", "us", or "our") collects, uses, protects, and handles information when you visit <strong>{WEBSITE_URL}</strong> or utilize the Seeakk Lead Performance Dynamics Platform, B2B SaaS CRM, and sales accountability software.
            </p>
          </div>

          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Table of Contents Sticky Sidebar */}
            <aside className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm lg:sticky lg:top-28 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>Table of Contents</span>
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
              <section id="introduction" className="space-y-4 scroll-mt-32">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">01</span>
                  <h2 className="text-xl font-bold text-slate-900">Introduction</h2>
                </div>
                <p>
                  Seeakk operates a B2B SaaS platform for lead management, sales accountability, and loss of business (LOB) prevention. We are committed to maintaining data privacy, security, and operational transparency across our web platform, APIs, and client-facing workflows.
                </p>
                <p>
                  By accessing or using Seeakk, you acknowledge that you have read, understood, and agree to the practices described in this Privacy Policy. If you do not agree with any aspect of this policy, you should discontinue use of our platform and website.
                </p>
              </section>

              {/* Section 02 */}
              <section id="information-collected" className="space-y-4 scroll-mt-32">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">02</span>
                  <h2 className="text-xl font-bold text-slate-900">Information We Collect</h2>
                </div>
                <p>We collect information required to operate a secure and functional enterprise SaaS platform. This includes:</p>
                <ul className="space-y-2 list-disc list-inside pl-2 text-slate-600">
                  <li><strong>Account Information:</strong> Name, business email address, phone number, company/organization details, job title, and authentication credentials.</li>
                  <li><strong>CRM & Sales Data:</strong> Lead records, customer contacts, lead stages, lead sources, remarks, follow-up schedules, activities, and operational performance records configured by customer organizations.</li>
                  <li><strong>Technical & System Information:</strong> IP address, browser type, device information, operating system, timestamp logs, security session tokens, and request diagnostics.</li>
                </ul>
              </section>

              {/* Section 03 */}
              <section id="customer-data" className="space-y-4 scroll-mt-32">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">03</span>
                  <h2 className="text-xl font-bold text-slate-900">Information Provided by Customer Organizations</h2>
                </div>
                <p>
                  Businesses and organizations using Seeakk input and manage data regarding their own employees, sales representatives, prospects, and customers.
                </p>
                <p>
                  <strong>Customer-Controlled Data:</strong> Data uploaded or synced into a customer's isolated workspace (including sales leads, lead notes, and organizational hierarchies) is owned and controlled by the subscribing customer organization. Seeakk processes customer-controlled data strictly on behalf of the customer and in accordance with their contractual instructions.
                </p>
              </section>

              {/* Section 04 */}
              <section id="how-we-use" className="space-y-4 scroll-mt-32">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">04</span>
                  <h2 className="text-xl font-bold text-slate-900">How We Use Information</h2>
                </div>
                <p>We process collected information for legitimate operational and business purposes, including:</p>
                <ul className="space-y-2 list-disc list-inside pl-2 text-slate-600">
                  <li>Providing, operating, maintaining, and improving the Seeakk CRM platform.</li>
                  <li>Authenticating users and managing organization workspace access.</li>
                  <li>Enforcing sales accountability, follow-up reminders, and stage transition rules requested by customer organizations.</li>
                  <li>Processing authorized integrations with third-party advertising or telecommunication services.</li>
                  <li>Delivering customer support, technical assistance, and platform security monitoring.</li>
                  <li>Complying with legal obligations and enforcing our contractual agreements.</li>
                </ul>
              </section>

              {/* Section 05 */}
              <section id="meta-integration" className="space-y-4 scroll-mt-32 bg-blue-50/40 p-6 rounded-2xl border border-blue-100">
                <div className="flex items-center gap-3 border-b border-blue-100 pb-3">
                  <span className="text-xs font-mono font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-lg">05</span>
                  <h2 className="text-xl font-bold text-slate-900">Meta / Facebook Lead Ads Integration</h2>
                </div>
                <p className="text-slate-700">
                  Seeakk offers an optional integration with Meta Business tools (including Facebook Lead Ads and Instagram Lead Ads).
                </p>
                <ul className="space-y-2 list-disc list-inside pl-2 text-slate-600">
                  <li><strong>Optional Integration:</strong> Meta integration is strictly optional and must be explicitly authorized by an administrator of your organization.</li>
                  <li><strong>Authorized Data Access:</strong> When authorized via Meta OAuth 2.0, Seeakk requests access only to permissions approved by the user (including page lead forms and lead data retrieval).</li>
                  <li><strong>Data Utilization:</strong> Lead information generated via connected Meta Lead Forms (such as prospect name, phone, email, and custom form answers) is retrieved via official Meta Graph APIs solely to automatically populate customer CRM leads as requested by the workspace administrator.</li>
                  <li><strong>No Unauthorized Access:</strong> Seeakk does not request, store, or access private personal Facebook profiles or unauthorized Meta data beyond the scope required for Lead Ads synchronization.</li>
                </ul>
              </section>

              {/* Section 06 */}
              <section id="third-party-integrations" className="space-y-4 scroll-mt-32">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">06</span>
                  <h2 className="text-xl font-bold text-slate-900">Third-Party Integrations</h2>
                </div>
                <p>
                  Customer organizations may choose to connect optional third-party services to Seeakk, including Meta Lead Ads, telephony providers (e.g., Knowlarity, Plivo, Exotel), or communication channels.
                </p>
                <p>
                  Third-party services are governed by their respective privacy policies and terms of service. Seeakk is not responsible for the independent privacy practices of external third-party service providers.
                </p>
              </section>

              {/* Section 07 */}
              <section id="information-sharing" className="space-y-4 scroll-mt-32">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">07</span>
                  <h2 className="text-xl font-bold text-slate-900">How Information Is Shared</h2>
                </div>
                <p><strong>We do not sell, rent, or trade personal or customer CRM data to third parties.</strong></p>
                <p>We share information only under the following limited circumstances:</p>
                <ul className="space-y-2 list-disc list-inside pl-2 text-slate-600">
                  <li><strong>Service Providers:</strong> Cloud hosting, database infrastructure, and security vendors who process data under strict confidentiality obligations.</li>
                  <li><strong>Customer-Authorized Connections:</strong> Integrations explicitly connected by a customer organization's administrator.</li>
                  <li><strong>Legal Compliance:</strong> When required by law, legal process, subpoena, or enforceable governmental request.</li>
                  <li><strong>Business Transfers:</strong> In connection with any merger, acquisition, or sale of company assets, subject to standard confidentiality protections.</li>
                </ul>
              </section>

              {/* Section 08 */}
              <section id="data-security" className="space-y-4 scroll-mt-32">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">08</span>
                  <h2 className="text-xl font-bold text-slate-900">Data Security</h2>
                </div>
                <p>
                  We employ administrative, technical, and physical safeguards designed to protect information from unauthorized access, loss, misuse, or disclosure. Measures include database encryption at rest, secure HTTPS/TLS transport encryption, multi-tenant workspace isolation, role-based permission controls, and token encryption.
                </p>
                <p className="text-slate-500 text-xs italic">
                  While we implement reasonable safeguards, no internet transmission or electronic storage method can guarantee 100% security.
                </p>
              </section>

              {/* Section 09 */}
              <section id="data-retention" className="space-y-4 scroll-mt-32">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">09</span>
                  <h2 className="text-xl font-bold text-slate-900">Data Retention</h2>
                </div>
                <p>
                  We retain information for as long as a customer organization maintains an active subscription or workspace account with Seeakk. We may retain data as necessary to fulfill contractual commitments, satisfy legal obligations, resolve disputes, and enforce our agreements.
                </p>
              </section>

              {/* Section 10 */}
              <section id="data-deletion" className="space-y-4 scroll-mt-32">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">10</span>
                  <h2 className="text-xl font-bold text-slate-900">Data Deletion</h2>
                </div>
                <p>
                  Customer organizations or users may request data deletion or account removal by submitting a request to <strong>{CONTACT_EMAIL}</strong> or via authorized workspace administrative tools. Upon verified request, Seeakk will process data deletion in accordance with applicable contractual terms and legal retention requirements.
                </p>
              </section>

              {/* Section 11 */}
              <section id="user-rights" className="space-y-4 scroll-mt-32">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">11</span>
                  <h2 className="text-xl font-bold text-slate-900">User Rights</h2>
                </div>
                <p>Depending on your jurisdiction, you may have rights regarding your personal information, including:</p>
                <ul className="space-y-2 list-disc list-inside pl-2 text-slate-600">
                  <li>Right to access personal data held about you.</li>
                  <li>Right to request correction of inaccurate or incomplete information.</li>
                  <li>Right to request deletion of personal data.</li>
                  <li>Right to object to or restrict certain data processing activities.</li>
                </ul>
              </section>

              {/* Section 12 */}
              <section id="cookies" className="space-y-4 scroll-mt-32">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">12</span>
                  <h2 className="text-xl font-bold text-slate-900">Cookies and Similar Technologies</h2>
                </div>
                <p>
                  Seeakk uses essential session cookies, local storage, and security tokens to authenticate users, maintain active sessions, remember workspace preferences, and ensure system security.
                </p>
              </section>

              {/* Section 13 */}
              <section id="childrens-privacy" className="space-y-4 scroll-mt-32">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">13</span>
                  <h2 className="text-xl font-bold text-slate-900">Children's Privacy</h2>
                </div>
                <p>
                  Seeakk is a business-to-business sales performance platform and is not directed to individuals under the age of 18. We do not knowingly collect personal information from children.
                </p>
              </section>

              {/* Section 14 */}
              <section id="international-processing" className="space-y-4 scroll-mt-32">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">14</span>
                  <h2 className="text-xl font-bold text-slate-900">International Data Processing</h2>
                </div>
                <p>
                  Information collected through the Seeakk platform may be hosted, processed, or transferred in secure data centers operated by leading cloud hosting providers. By using the platform, you consent to the processing of data in accordance with this policy.
                </p>
              </section>

              {/* Section 15 */}
              <section id="changes-policy" className="space-y-4 scroll-mt-32">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">15</span>
                  <h2 className="text-xl font-bold text-slate-900">Changes to This Privacy Policy</h2>
                </div>
                <p>
                  We may update this Privacy Policy periodically to reflect platform enhancements, legal compliance updates, or operational changes. The updated policy will be posted on this page with an updated "Last Updated" date.
                </p>
              </section>

              {/* Section 16 */}
              <section id="contact-us" className="space-y-4 scroll-mt-32 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
                  <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-lg">16</span>
                  <h2 className="text-xl font-bold text-slate-900">Contact Us</h2>
                </div>
                <p className="text-slate-600">If you have any questions, concerns, or requests regarding this Privacy Policy, please contact us at:</p>
                <div className="space-y-2 font-semibold text-xs text-slate-800">
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
                    <span className="text-slate-400">Email:</span>
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

export default PrivacyPolicyPage;
