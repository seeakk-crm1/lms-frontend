import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileCheck2, Clock, FileText, PhoneCall, ShieldAlert, CheckCircle2 } from 'lucide-react';
import LandingNavbar from '../../components/landing/LandingNavbar';
import LandingFooter from '../../components/landing/LandingFooter';

const COMPANY_NAME = 'Seeakk Inc.';
const WEBSITE_URL = 'https://www.seeakk.com';
const CONTACT_EMAIL = 'admin@seeakk.com';
const LAST_UPDATED = 'August 14, 2026';

const sections = [
  { id: 'acceptance', number: '01', title: 'Acceptance of Terms' },
  { id: 'description', number: '02', title: 'Description of Seeakk Platform' },
  { id: 'registration', number: '03', title: 'Account Registration & Security' },
  { id: 'organization-accounts', number: '04', title: 'Organization Accounts & Authorized Users' },
  { id: 'customer-responsibilities', number: '05', title: 'Customer Responsibilities' },
  { id: 'acceptable-use', number: '06', title: 'Acceptable Use Policy' },
  { id: 'data-ownership', number: '07', title: 'CRM & Lead Data Ownership' },
  { id: 'third-party-integrations', number: '08', title: 'Third-Party Integrations' },
  { id: 'meta-integration', number: '09', title: 'Meta / Facebook Integration' },
  { id: 'telephony-integrations', number: '10', title: 'Telephony & Call Recording Integrations' },
  { id: 'call-recording-compliance', number: '11', title: 'Call Recording Legal Compliance' },
  { id: 'subscription-billing', number: '12', title: 'Subscription, Billing & Add-ons' },
  { id: 'customer-paid-services', number: '13', title: 'Customer-Paid Third-Party Services' },
  { id: 'intellectual-property', number: '14', title: 'Intellectual Property Rights' },
  { id: 'confidentiality', number: '15', title: 'Confidentiality' },
  { id: 'service-availability', number: '16', title: 'Service Availability & SLA' },
  { id: 'data-privacy', number: '17', title: 'Data Protection & Privacy' },
  { id: 'suspension-termination', number: '18', title: 'Suspension & Termination' },
  { id: 'disclaimers', number: '19', title: 'Disclaimers of Warranties' },
  { id: 'limitation-liability', number: '20', title: 'Limitation of Liability' },
  { id: 'indemnification', number: '21', title: 'Indemnification' },
  { id: 'changes-service', number: '22', title: 'Changes to the Service' },
  { id: 'changes-terms', number: '23', title: 'Changes to the Terms' },
  { id: 'governing-law', number: '24', title: 'Governing Law' },
  { id: 'contact-info', number: '25', title: 'Contact Information' },
];

const TermsOfServicePage: React.FC = () => {
  useEffect(() => {
    document.title = 'Terms of Service | SEEAKK';
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
                  <FileCheck2 className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-600">Legal Agreement & Terms</span>
                  <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Terms of Service</h1>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Last Updated: {LAST_UPDATED}</span>
              </div>
            </div>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              These Terms of Service ("Terms") govern your access to and use of <strong>{WEBSITE_URL}</strong>, the Seeakk Lead Performance Dynamics Platform, B2B SaaS CRM, and sales accountability software operated by <strong>{COMPANY_NAME}</strong> ("Seeakk", "we", "us", or "our").
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
              <section id="acceptance" className="space-y-4 scroll-mt-32">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">01</span>
                  <h2 className="text-xl font-bold text-slate-900">Acceptance of Terms</h2>
                </div>
                <p>
                  By creating an account, accessing, or using the Seeakk platform, you agree to be bound by these Terms and our Privacy Policy. If you are entering into these Terms on behalf of a company or legal entity, you represent that you have the authority to bind such entity to these Terms.
                </p>
              </section>

              {/* Section 02 */}
              <section id="description" className="space-y-4 scroll-mt-32">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">02</span>
                  <h2 className="text-xl font-bold text-slate-900">Description of Seeakk Platform</h2>
                </div>
                <p>
                  Seeakk is a cloud-based B2B SaaS CRM platform engineered for lead management, sales team accountability, Loss of Business (LOB) audit prevention, mandatory follow-up scheduling, and operational performance transparency.
                </p>
              </section>

              {/* Section 03 */}
              <section id="registration" className="space-y-4 scroll-mt-32">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">03</span>
                  <h2 className="text-xl font-bold text-slate-900">Account Registration & Security</h2>
                </div>
                <p>
                  To use Seeakk, you must register for an account and provide accurate, current, and complete information. You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account.
                </p>
              </section>

              {/* Section 04 */}
              <section id="organization-accounts" className="space-y-4 scroll-mt-32">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">04</span>
                  <h2 className="text-xl font-bold text-slate-900">Organization Accounts & Authorized Users</h2>
                </div>
                <p>
                  Organization workspaces are managed by designated administrators. Administrators control user access levels, permissions, lead stage rules, and workspace configurations. The subscribing organization is responsible for ensuring all authorized users comply with these Terms.
                </p>
              </section>

              {/* Section 05 */}
              <section id="customer-responsibilities" className="space-y-4 scroll-mt-32">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">05</span>
                  <h2 className="text-xl font-bold text-slate-900">Customer Responsibilities</h2>
                </div>
                <p>
                  Customers are solely responsible for all data, content, leads, notes, and records entered or integrated into Seeakk. Customers warrant that they have obtained all required consents, authorizations, and legal rights to process and upload such data.
                </p>
              </section>

              {/* Section 06 */}
              <section id="acceptable-use" className="space-y-4 scroll-mt-32">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">06</span>
                  <h2 className="text-xl font-bold text-slate-900">Acceptable Use Policy</h2>
                </div>
                <p>You agree not to:</p>
                <ul className="space-y-2 list-disc list-inside pl-2 text-slate-600">
                  <li>Use the platform for any unlawful purpose or in violation of applicable regulations.</li>
                  <li>Reverse engineer, decompile, or attempt to extract source code from the service.</li>
                  <li>Interfere with platform infrastructure, security controls, or multi-tenant workspace boundaries.</li>
                  <li>Upload malicious software, viruses, or harmful automated scripts.</li>
                </ul>
              </section>

              {/* Section 07 */}
              <section id="data-ownership" className="space-y-4 scroll-mt-32">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">07</span>
                  <h2 className="text-xl font-bold text-slate-900">CRM & Lead Data Ownership</h2>
                </div>
                <p>
                  Customer organizations retain exclusive ownership of all lead records, sales notes, customer contacts, and operational CRM data uploaded or synchronized into their workspace. Seeakk claims no ownership rights over customer workspace data.
                </p>
              </section>

              {/* Section 08 */}
              <section id="third-party-integrations" className="space-y-4 scroll-mt-32">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">08</span>
                  <h2 className="text-xl font-bold text-slate-900">Third-Party Integrations</h2>
                </div>
                <p>
                  Seeakk may enable customer organizations to connect third-party platforms (such as Meta Lead Ads, telephony services, or communication tools). Third-party services are subject to their own provider terms and agreements.
                </p>
              </section>

              {/* Section 09 */}
              <section id="meta-integration" className="space-y-4 scroll-mt-32 bg-blue-50/40 p-6 rounded-2xl border border-blue-100">
                <div className="flex items-center gap-3 border-b border-blue-100 pb-3">
                  <span className="text-xs font-mono font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-lg">09</span>
                  <h2 className="text-xl font-bold text-slate-900">Meta / Facebook Integration</h2>
                </div>
                <p className="text-slate-700">
                  Customers connecting Meta Lead Ads via Seeakk settings agree to comply with Meta Business Terms and Policies.
                </p>
                <p className="text-slate-600">
                  Seeakk facilitates authorized Meta Graph API lead data retrieval to automatically populate customer workspace leads. Customers are responsible for configuring lead field mappings and managing their connected Facebook Business assets.
                </p>
              </section>

              {/* Section 10 & 11 - Telephony & Call Recording Compliance */}
              <section id="telephony-integrations" className="space-y-4 scroll-mt-32">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">10</span>
                  <h2 className="text-xl font-bold text-slate-900">Telephony & Call Recording Integrations</h2>
                </div>
                <p>
                  Seeakk provides optional integration adapters for provider-agnostic telephony systems (such as Knowlarity, Plivo, Exotel, or device dialers).
                </p>
                <p>
                  Telephony services depend entirely on third-party providers. Customers may be required to maintain their own independent accounts and API credentials with third-party telephony vendors.
                </p>
              </section>

              <section id="call-recording-compliance" className="space-y-4 scroll-mt-32 bg-emerald-50/40 p-6 rounded-2xl border border-emerald-100">
                <div className="flex items-center gap-3 border-b border-emerald-100 pb-3">
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg">11</span>
                  <h2 className="text-xl font-bold text-slate-900">Customer Responsibility for Call Recording Legal Compliance</h2>
                </div>
                <div className="space-y-3 text-slate-700">
                  <p>
                    <strong>Provider-Neutral Architecture:</strong> Seeakk is a software management platform and is <strong>NOT a telecommunication carrier or provider</strong>.
                  </p>
                  <p>
                    <strong>Consent & Legal Notice Responsibility:</strong> Call recording laws vary by country, state, and jurisdiction (including single-party and all-party consent requirements). Customer organizations are <strong>solely responsible for providing all required legal disclosures, warnings, and obtaining all necessary consents</strong> from call participants prior to enabling call recording functionality.
                  </p>
                  <p className="text-xs text-slate-500 italic">
                    Seeakk disclaims all liability resulting from a customer's failure to comply with applicable telecommunication or call-recording wiretap laws.
                  </p>
                </div>
              </section>

              {/* Section 12 & 13 */}
              <section id="subscription-billing" className="space-y-4 scroll-mt-32">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">12</span>
                  <h2 className="text-xl font-bold text-slate-900">Subscription, Billing & Add-ons</h2>
                </div>
                <p>
                  Access to Seeakk is provided on a subscription basis. Fees, billing cycles, user seat limits, and enterprise features are specified during subscription checkout or order agreement.
                </p>
              </section>

              <section id="customer-paid-services" className="space-y-4 scroll-mt-32">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">13</span>
                  <h2 className="text-xl font-bold text-slate-900">Customer-Paid Third-Party Services</h2>
                </div>
                <p>
                  Fees charged by third-party providers (such as Meta ad spend, telephony minutes, or SMS gateways) are separate from Seeakk subscription fees and remain the direct responsibility of the customer.
                </p>
              </section>

              {/* Section 14 */}
              <section id="intellectual-property" className="space-y-4 scroll-mt-32">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">14</span>
                  <h2 className="text-xl font-bold text-slate-900">Intellectual Property Rights</h2>
                </div>
                <p>
                  {COMPANY_NAME} and its licensors retain all rights, title, and interest in and to the Seeakk platform, software architecture, branding, designs, trademarks, and proprietary algorithms.
                </p>
              </section>

              {/* Section 15 */}
              <section id="confidentiality" className="space-y-4 scroll-mt-32">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">15</span>
                  <h2 className="text-xl font-bold text-slate-900">Confidentiality</h2>
                </div>
                <p>
                  Each party agrees to protect the other party's non-public proprietary information using reasonable care and not to disclose such information to unauthorized third parties.
                </p>
              </section>

              {/* Section 16 */}
              <section id="service-availability" className="space-y-4 scroll-mt-32">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">16</span>
                  <h2 className="text-xl font-bold text-slate-900">Service Availability & SLA</h2>
                </div>
                <p>
                  We strive to provide continuous service availability, but we do not guarantee uninterrupted operational uptime. Scheduled maintenance windows may be implemented with reasonable notice.
                </p>
              </section>

              {/* Section 17 */}
              <section id="data-privacy" className="space-y-4 scroll-mt-32">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">17</span>
                  <h2 className="text-xl font-bold text-slate-900">Data Protection & Privacy</h2>
                </div>
                <p>
                  Our collection and processing of personal data are governed by our Privacy Policy, available at{' '}
                  <Link to="/privacy-policy" className="text-emerald-600 font-semibold hover:underline">
                    {WEBSITE_URL}/privacy-policy
                  </Link>.
                </p>
              </section>

              {/* Section 18 */}
              <section id="suspension-termination" className="space-y-4 scroll-mt-32">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">18</span>
                  <h2 className="text-xl font-bold text-slate-900">Suspension & Termination</h2>
                </div>
                <p>
                  We reserve the right to suspend or terminate accounts that violate these Terms, engage in fraudulent activity, or fail to pay subscription fees when due.
                </p>
              </section>

              {/* Section 19 */}
              <section id="disclaimers" className="space-y-4 scroll-mt-32">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">19</span>
                  <h2 className="text-xl font-bold text-slate-900">Disclaimers of Warranties</h2>
                </div>
                <p>
                  THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. TO THE MAXIMUM EXTENT PERMITTED BY LAW, SEEAKK DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                </p>
              </section>

              {/* Section 20 */}
              <section id="limitation-liability" className="space-y-4 scroll-mt-32">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">20</span>
                  <h2 className="text-xl font-bold text-slate-900">Limitation of Liability</h2>
                </div>
                <p>
                  TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL SEEAKK BE LIABLE FOR ANY INDIRECT, INCIDENTAL, CONSEQUENTIAL, SPECIAL, OR PUNITIVE DAMAGES RESULTING FROM YOUR USE OF OR INABILITY TO USE THE SERVICE.
                </p>
              </section>

              {/* Section 21 */}
              <section id="indemnification" className="space-y-4 scroll-mt-32">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">21</span>
                  <h2 className="text-xl font-bold text-slate-900">Indemnification</h2>
                </div>
                <p>
                  You agree to defend, indemnify, and hold harmless Seeakk from any claims, liabilities, damages, and expenses arising out of your breach of these Terms or unauthorized use of third-party data.
                </p>
              </section>

              {/* Section 22 & 23 */}
              <section id="changes-service" className="space-y-4 scroll-mt-32">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">22</span>
                  <h2 className="text-xl font-bold text-slate-900">Changes to the Service</h2>
                </div>
                <p>We reserve the right to modify, enhance, or discontinue features of the service with reasonable notice.</p>
              </section>

              <section id="changes-terms" className="space-y-4 scroll-mt-32">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">23</span>
                  <h2 className="text-xl font-bold text-slate-900">Changes to the Terms</h2>
                </div>
                <p>We may update these Terms from time to time. Continued use of the platform following published changes constitutes acceptance of the updated Terms.</p>
              </section>

              {/* Section 24 */}
              <section id="governing-law" className="space-y-4 scroll-mt-32">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">24</span>
                  <h2 className="text-xl font-bold text-slate-900">Governing Law</h2>
                </div>
                <p>
                  These Terms shall be governed by and construed in accordance with applicable governing laws, without regard to conflict of law principles.
                </p>
              </section>

              {/* Section 25 */}
              <section id="contact-info" className="space-y-4 scroll-mt-32 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
                  <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-lg">25</span>
                  <h2 className="text-xl font-bold text-slate-900">Contact Information</h2>
                </div>
                <p className="text-slate-600">If you have any questions regarding these Terms of Service, please contact us at:</p>
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

export default TermsOfServicePage;
