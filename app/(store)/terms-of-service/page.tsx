import { Metadata } from "next";
import Link from "next/link";
import { FileText, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service — NEWGEN STORE",
  description: "Terms of Service for NEWGEN STORE, governed by Rwandan law.",
};

const LAST_UPDATED = "24 May 2026";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Back link */}
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#2563EB] transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#FF6B00]/10 flex items-center justify-center flex-shrink-0">
            <FileText className="w-6 h-6 text-[#FF6B00]" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">Terms of Service</h1>
            <p className="text-sm text-slate-500 mt-1">Last updated: {LAST_UPDATED}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm space-y-8 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">

          {/* Legal basis */}
          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 rounded-xl text-xs text-orange-700 dark:text-orange-300">
            These Terms of Service are governed by the <strong>Law No. 013/2022 of 20/04/2022 governing Electronic Commerce in Rwanda</strong>, the <strong>Law No. 11/2022 relating to Consumer Protection in Rwanda</strong>, and the <strong>Law No. 024/2016 relating to Electronic Transactions</strong>.
          </div>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">1. Parties and Agreement</h2>
            <p>
              These Terms of Service (&quot;Terms&quot;) constitute a legally binding agreement between <strong>NEWGEN STORE</strong> (&quot;we&quot;, &quot;us&quot;, &quot;Seller&quot;), a wholesale electronics business registered and operating in Rwanda, and you (&quot;Buyer&quot;, &quot;Customer&quot;) who accesses or places an order through our website.
            </p>
            <p className="mt-2">
              By placing an order or using our platform, you confirm that you have read, understood, and agree to be bound by these Terms. If you do not agree, you must not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">2. Nature of Business — Wholesale Only</h2>
            <p>
              NEWGEN STORE operates exclusively as a <strong>wholesale supplier</strong>. Our products are intended for resale, business use, or bulk purchasing by retailers, traders, and business operators. By placing an order, you confirm that you are purchasing for business purposes and not primarily for personal consumption.
            </p>
            <p className="mt-2">
              Minimum order quantities (MOQ) apply to all products as displayed on each product listing. Orders below the stated MOQ may be refused or subject to a retail surcharge.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">3. Order Placement and Acceptance</h2>
            <p>In accordance with Article 16 of Law No. 013/2022, an order is accepted only when:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>You submit a complete order through our website with accurate contact and delivery information;</li>
              <li>We send you a written confirmation (SMS or email) with your order number;</li>
              <li>Stock availability has been verified by our team.</li>
            </ul>
            <p className="mt-2">
              We reserve the right to refuse or cancel any order at our discretion, including where stock is unavailable, where the order appears fraudulent, or where delivery to the specified location is not feasible. In such cases, any payment already received will be refunded in full.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">4. Pricing and Currency</h2>
            <p>
              All prices on our platform are displayed in <strong>Rwandan Francs (RWF)</strong> unless otherwise stated. Prices are exclusive of a flat delivery fee of <strong>1,000 RWF</strong>. Orders totalling 500,000 RWF or more qualify for free delivery.
            </p>
            <p className="mt-2">
              Prices are subject to change without prior notice. The price applicable to your order is the price displayed at the time of order submission. We comply with the pricing transparency requirements of the Rwanda Standards Board (RSB) and the Rwanda Revenue Authority (RRA).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">5. Payment Terms</h2>
            <p>We accept the following payment methods:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>MTN Mobile Money (MoMo)</li>
              <li>Airtel Money</li>
              <li>Bank transfer (for large orders, by prior arrangement)</li>
              <li>Cash on delivery (for Kigali deliveries only, subject to availability)</li>
            </ul>
            <p className="mt-2">
              Payment must be completed before dispatch of goods unless a credit arrangement has been agreed in writing. All electronic payments are processed in compliance with the National Bank of Rwanda (BNB) payment system regulations.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">6. Delivery</h2>
            <p>We deliver across Rwanda and Eastern DRC (Goma, Bukavu and surrounding areas). Delivery timelines are indicative:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Kigali:</strong> Same day or next business day</li>
              <li><strong>Other Rwanda provinces:</strong> 1–3 business days</li>
              <li><strong>Goma / Bukavu (DRC):</strong> 2–5 business days</li>
            </ul>
            <p className="mt-2">
              Risk of loss or damage to goods transfers to the Buyer upon delivery. We are not liable for delays caused by force majeure events including natural disasters, border closures, strikes, or government actions. Delivery timelines are estimates and not guaranteed.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">7. Inspection and Acceptance of Goods</h2>
            <p>
              Upon delivery, the Buyer must inspect goods immediately. Any visible damage, shortfall in quantity, or wrong items must be reported to us <strong>within 24 hours of delivery</strong> by contacting +250 782 545 277 or <a href="mailto:info@newgen.com" className="text-[#2563EB] hover:underline">info@newgen.com</a>.
            </p>
            <p className="mt-2">Failure to report within 24 hours constitutes acceptance of the goods as delivered.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">8. Returns and Refunds</h2>
            <p>
              In accordance with the <strong>Law No. 11/2022 on Consumer Protection</strong>, the following return conditions apply:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>
                <strong>Defective or wrong goods:</strong> We accept returns within <strong>7 days</strong> of delivery for items that are defective, damaged in transit, or incorrectly supplied. We will replace the item or issue a full refund.
              </li>
              <li>
                <strong>Change of mind:</strong> We do not accept change-of-mind returns on wholesale orders. Goods must be returned in original, unopened, undamaged condition if a return is agreed in writing by our management.
              </li>
              <li>
                <strong>Refund processing:</strong> Approved refunds will be processed within <strong>5–10 business days</strong> to the original payment method.
              </li>
            </ul>
            <p className="mt-2">
              Items that have been opened, used, altered, or damaged by the Buyer are not eligible for return.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">9. Product Authenticity and Warranties</h2>
            <p>
              All products listed on NEWGEN STORE are sourced from verified suppliers and are 100% authentic. Where manufacturer warranties apply, these pass directly to the Buyer. NEWGEN STORE does not provide independent warranties beyond those offered by manufacturers unless expressly stated.
            </p>
            <p className="mt-2">
              We comply with the Rwanda Standards Board (RSB) standards for electronics importation and quality verification.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">10. Intellectual Property</h2>
            <p>
              All content on this website — including but not limited to product images, descriptions, logos, and design — is the property of NEWGEN STORE or used under licence. You may not reproduce, distribute, or use any content from this website for commercial purposes without our prior written consent, in accordance with Rwandan intellectual property law.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">11. Prohibited Use</h2>
            <p>You agree not to use our platform to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Place fraudulent orders or provide false information;</li>
              <li>Resell goods in violation of any export control or customs laws;</li>
              <li>Conduct any activity that violates Rwandan law, including the Law No. 010/2009 relating to Cybercrime;</li>
              <li>Attempt to gain unauthorised access to our systems or data.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">12. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by Rwandan law, NEWGEN STORE is not liable for:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Indirect, incidental, or consequential losses arising from the use of our products or services;</li>
              <li>Loss of profit or business opportunity;</li>
              <li>Delays or failures in delivery caused by events beyond our reasonable control;</li>
              <li>Damage to goods after delivery and acceptance by the Buyer.</li>
            </ul>
            <p className="mt-2">
              Our total liability in connection with any order shall not exceed the value of that order.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">13. Tax Compliance</h2>
            <p>
              NEWGEN STORE is registered with the <strong>Rwanda Revenue Authority (RRA)</strong> and complies with all applicable tax obligations including VAT (where applicable) and corporate income tax. Buyers are responsible for compliance with their own import duties, taxes, and customs obligations for orders delivered outside Rwanda.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">14. Dispute Resolution</h2>
            <p>
              In the event of a dispute arising from these Terms or any order:
            </p>
            <ol className="list-decimal pl-5 mt-2 space-y-1">
              <li><strong>Negotiation:</strong> The parties shall first attempt to resolve the dispute amicably within 14 days of written notice.</li>
              <li><strong>Mediation:</strong> If unresolved, either party may refer the dispute to mediation through the Rwanda Arbitration Centre (RAC).</li>
              <li><strong>Courts:</strong> If mediation fails, disputes shall be submitted to the exclusive jurisdiction of the competent courts of Rwanda, specifically the Commercial Court of Rwanda.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">15. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the <strong>Republic of Rwanda</strong>. The United Nations Convention on Contracts for the International Sale of Goods (CISG) is expressly excluded.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">16. Amendments</h2>
            <p>
              We reserve the right to modify these Terms at any time. Updated Terms will be posted on this page with a revised &quot;Last updated&quot; date. Continued use of our platform after the posting of changes constitutes your acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">17. Contact</h2>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 space-y-1 text-sm">
              <p><strong className="text-slate-900 dark:text-white">NEWGEN STORE</strong></p>
              <p>Nyabugogo, Kigali, Rwanda</p>
              <p>Email: <a href="mailto:info@newgen.com" className="text-[#2563EB] hover:underline">info@newgen.com</a></p>
              <p>Phone: +250 782 545 277</p>
            </div>
          </section>

        </div>

        <div className="mt-6 flex gap-4 text-sm">
          <Link href="/privacy-policy" className="text-[#2563EB] hover:underline">Privacy Policy →</Link>
          <Link href="/" className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">← Back to Store</Link>
        </div>

      </div>
    </div>
  );
}
