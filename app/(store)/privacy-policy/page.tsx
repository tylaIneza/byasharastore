import { Metadata } from "next";
import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy — BYASHARA STORE",
  description: "Privacy Policy for BYASHARA STORE, compliant with Rwandan data protection law (Law No. 058/2021).",
};

const LAST_UPDATED = "24 May 2026";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Back link */}
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#2563EB] transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#2563EB]/10 flex items-center justify-center flex-shrink-0">
            <Shield className="w-6 h-6 text-[#2563EB]" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">Privacy Policy</h1>
            <p className="text-sm text-slate-500 mt-1">Last updated: {LAST_UPDATED}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm prose-custom space-y-8 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">

          {/* Legal basis */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl text-xs text-blue-700 dark:text-blue-300">
            This Privacy Policy is prepared in compliance with the <strong>Law No. 058/2021 of 13/09/2021 on Personal Data Protection and Privacy in Rwanda</strong> and the <strong>Law No. 013/2022 of 20/04/2022 governing Electronic Commerce in Rwanda</strong>, regulated by the Rwanda Utilities Regulatory Authority (RURA).
          </div>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">1. Who We Are</h2>
            <p>
              <strong>BYASHARA STORE</strong> (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is a wholesale electronics supplier registered and operating in Rwanda. Our principal place of business is at Nyabugogo, Kigali, Rwanda. We also operate a branch in Rubavu, Western Province.
            </p>
            <p className="mt-2">
              For questions about this policy or your personal data, contact our Data Protection Officer at: <a href="mailto:info@byashara.rw" className="text-[#2563EB] hover:underline">info@byashara.rw</a> or <strong>+250 782 545 277</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">2. Personal Data We Collect</h2>
            <p>In accordance with Article 12 of Law No. 058/2021, we collect only the personal data necessary for legitimate business purposes. This includes:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Identity data:</strong> Full name</li>
              <li><strong>Contact data:</strong> Phone number, email address (optional)</li>
              <li><strong>Delivery data:</strong> Country, city, delivery address</li>
              <li><strong>Transaction data:</strong> Order details, purchase history, payment method</li>
              <li><strong>Technical data:</strong> IP address, browser type, pages visited (via server logs)</li>
              <li><strong>Usage data:</strong> Product views, search queries, engagement activity</li>
            </ul>
            <p className="mt-2">We do <strong>not</strong> collect sensitive personal data as defined under Article 5 of Law No. 058/2021 (racial origin, health data, biometric data, etc.).</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">3. Legal Basis for Processing</h2>
            <p>We process your personal data under the following lawful bases as provided in Law No. 058/2021:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Contractual necessity:</strong> Processing required to fulfil your order and arrange delivery.</li>
              <li><strong>Consent:</strong> Where you voluntarily provide your email for communications.</li>
              <li><strong>Legitimate interests:</strong> Fraud prevention, site security, improving our services.</li>
              <li><strong>Legal obligation:</strong> Compliance with Rwandan tax law (RRA requirements) and accounting obligations.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">4. How We Use Your Data</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Process and fulfil your orders and arrange delivery</li>
              <li>Send order confirmation and status updates via SMS or email</li>
              <li>Calculate and apply the correct delivery fee based on your location</li>
              <li>Respond to customer service enquiries</li>
              <li>Comply with tax and accounting obligations under Rwandan law</li>
              <li>Detect and prevent fraud or abuse of our platform</li>
              <li>Improve our website and product offerings (aggregated analytics only)</li>
            </ul>
            <p className="mt-2">We do <strong>not</strong> sell, rent, or trade your personal data to any third party for marketing purposes.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">5. Sharing of Personal Data</h2>
            <p>We may share your data with the following parties only to the extent necessary:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Delivery partners:</strong> To arrange and complete delivery of your order.</li>
              <li><strong>Payment processors:</strong> Mobile money operators (MTN MoMo, Airtel Money) for payment verification.</li>
              <li><strong>Rwanda Revenue Authority (RRA):</strong> As required by tax law for business reporting.</li>
              <li><strong>Legal authorities:</strong> Where required by Rwandan law or court order.</li>
            </ul>
            <p className="mt-2">Any third party receiving your data is bound by confidentiality obligations consistent with Law No. 058/2021.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">6. Cross-Border Data Transfers</h2>
            <p>
              BYASHARA STORE operates in Rwanda and Eastern DRC. Where your order involves delivery to the Democratic Republic of Congo, your delivery information (name, city, address, phone) may be shared with our logistics partners operating in that territory. Such transfers are made solely for order fulfilment purposes and under appropriate contractual safeguards.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">7. Data Retention</h2>
            <p>We retain personal data for as long as necessary to fulfil the purposes outlined in this policy:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Order records:</strong> 7 years (required by Rwandan tax and accounting law)</li>
              <li><strong>Customer accounts:</strong> For the duration of the business relationship + 3 years</li>
              <li><strong>Technical logs:</strong> 90 days</li>
              <li><strong>Marketing consents:</strong> Until withdrawn</li>
            </ul>
            <p className="mt-2">After these periods, data is securely deleted or anonymised.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">8. Your Rights Under Rwandan Law</h2>
            <p>Pursuant to Articles 19–26 of Law No. 058/2021, you have the following rights:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Right of access:</strong> Request a copy of the personal data we hold about you.</li>
              <li><strong>Right to rectification:</strong> Request correction of inaccurate or incomplete data.</li>
              <li><strong>Right to erasure:</strong> Request deletion of your data where there is no lawful basis for continued processing.</li>
              <li><strong>Right to restriction:</strong> Request that we limit how we use your data in certain circumstances.</li>
              <li><strong>Right to data portability:</strong> Receive your data in a structured, machine-readable format.</li>
              <li><strong>Right to object:</strong> Object to processing based on legitimate interests.</li>
              <li><strong>Right to withdraw consent:</strong> Withdraw consent at any time where processing is based on consent.</li>
            </ul>
            <p className="mt-2">To exercise any of these rights, contact us at <a href="mailto:info@byashara.rw" className="text-[#2563EB] hover:underline">info@byashara.rw</a>. We will respond within <strong>30 days</strong> as required by law.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">9. Data Security</h2>
            <p>
              We implement appropriate technical and organisational measures to protect your personal data against unauthorised access, disclosure, alteration, or destruction, in accordance with Article 29 of Law No. 058/2021. These measures include SSL/TLS encryption for all data transmission, access controls, and regular security reviews. However, no internet-based system is completely secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">10. Cookies and Tracking</h2>
            <p>
              Our website uses essential cookies and local storage to maintain your shopping cart and language preferences. We do not use third-party advertising or tracking cookies. The data stored locally on your device (cart contents, language choice) does not leave your browser unless you submit an order.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">11. Children&apos;s Privacy</h2>
            <p>
              Our services are intended for business buyers (B2B wholesale) and are not directed at persons under the age of 18. We do not knowingly collect personal data from minors. If you believe we have inadvertently collected data from a minor, contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">12. Supervisory Authority</h2>
            <p>
              If you believe your data protection rights have been violated, you have the right to lodge a complaint with the <strong>Rwanda Utilities Regulatory Authority (RURA)</strong>, which oversees data protection enforcement in Rwanda.
            </p>
            <p className="mt-1">Website: <span className="text-[#2563EB]">www.rura.rw</span> · Tel: +250 252 584 562</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">13. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. The revised version will be posted on this page with an updated &quot;Last updated&quot; date. We encourage you to review this policy periodically. Continued use of our platform after any changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">14. Contact Us</h2>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 space-y-1 text-sm">
              <p><strong className="text-slate-900 dark:text-white">BYASHARA STORE</strong></p>
              <p>Nyabugogo, Kigali, Rwanda</p>
              <p>Email: <a href="mailto:info@byashara.rw" className="text-[#2563EB] hover:underline">info@byashara.rw</a></p>
              <p>Phone: +250 782 545 277</p>
            </div>
          </section>

        </div>

        <div className="mt-6 flex gap-4 text-sm">
          <Link href="/terms-of-service" className="text-[#2563EB] hover:underline">Terms of Service →</Link>
          <Link href="/" className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">← Back to Store</Link>
        </div>

      </div>
    </div>
  );
}
