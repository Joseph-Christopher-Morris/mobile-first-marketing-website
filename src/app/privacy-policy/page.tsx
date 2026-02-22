import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { buildSEO } from "@/lib/seo";

export const metadata: Metadata = buildSEO({
  intent: "Privacy Policy",
  description: "How Vivid Media Cheshire collects, uses, and protects personal data. GDPR-compliant privacy notice for website visitors and clients.",
  canonicalPath: "/privacy-policy/",
});

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header pageTitle="Privacy Policy" />
      <main className="mx-auto max-w-3xl px-6 py-12 text-slate-700">
        <h1 className="text-3xl font-extrabold tracking-tight mb-6">
          Vivid Media Cheshire Privacy Notice
        </h1>

        <p className="mb-4">
          Your personal data is important to both you and us, and it requires respectful and careful protection.
          This privacy notice informs you of our privacy practices and the choices you can make about the way
          we hold information about you as a website visitor, client, subcontractor, or collaborator.
          We are committed to complying with the GDPR (2016), UK GDPR (2021), and the Data Protection Act (2018).
          We act as both a data controller and a data processor.
        </p>

        <p className="mb-4">
          Please note that if you follow a link to another website, you are no longer covered by this notice.
          We encourage you to read the privacy notice of any website before sharing personal information with it.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-3">
          What Personal Data We Collect and Why
        </h2>

        <p className="mb-4">
          At Vivid Media Cheshire, we collect only the minimum personal information necessary to provide our services.
          This may include your name, address, telephone number, email address, signature, and bank details - only
          when relevant to legitimate interest, contractual, or legal obligations.
        </p>

        <p className="mb-4">
          We do not collect special category data and will delete any irrelevant information immediately.
          No automated decision-making or profiling takes place.
          We regularly review our data flows, inventories, and legitimate interest assessments to ensure
          GDPR compliance and privacy risk management.
        </p>

        <p className="mb-4">
          We never knowingly collect data from or about children under 13 years old.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-3">Data Security</h2>

        <p className="mb-4">
          We have implemented security measures to prevent your personal data from being lost, used, altered,
          disclosed, or accessed without authorization. Only team members with a legitimate business need
          can access your data. All processing aligns with our Data Protection Policy.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-3">
          Who We Share Your Personal Data With
        </h2>

        <p className="mb-4">
          We may share limited data with third parties to meet normal business, accountancy, or insurance needs,
          or to verify information for contractual purposes. Data processors supporting our operations are bound
          by contractual safeguards. We may also share data if legally required or in the event of a business sale.
        </p>

        <p className="mb-4">
          We do <strong>not</strong> sell personal data. Any other data sharing will occur only with your consent.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-3">Data Breaches</h2>

        <p className="mb-4">
          Procedures are in place to detect and respond to personal data breaches.
          We will notify affected individuals and supervisory authorities when legally required.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-3">Data Storage Location</h2>

        <p className="mb-4">
          Your data is stored within the UK and will not be transferred outside the EU unless appropriate safeguards
          are in place.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-3">Data Retention</h2>

        <p className="mb-4">
          We retain your personal data only as long as necessary for legal, accounting, or service reasons.
          Customer records are kept for six years after the last interaction to comply with tax law.
          After this period, all personal information is deleted.
        </p>

        <p className="mb-4">
          We may anonymize data for research or statistical use, which can then be retained indefinitely
          without identifying you.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-3">Your Rights</h2>

        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li><strong>The right to be informed:</strong> to receive clear information about how we use your data.</li>
          <li><strong>The right of access:</strong> to obtain a copy of your personal data and understand how it is processed.</li>
          <li><strong>The right to rectification:</strong> to correct inaccurate or incomplete data.</li>
          <li><strong>The right to erasure:</strong> to request deletion where there is no lawful reason to retain it.</li>
          <li><strong>The right to restrict processing:</strong> to block or limit further use of your information.</li>
          <li><strong>The right to data portability:</strong> to reuse your personal data across different services.</li>
          <li><strong>The right to object:</strong> to certain processing, such as direct marketing or legitimate interest processing.</li>
          <li><strong>The right to withdraw consent:</strong> to withdraw consent at any time for data processing or marketing.</li>
        </ul>

        <p className="mb-4">
          To exercise your rights or request access to your data, contact us at{" "}
          <a href="mailto:joe@vividmediacheshire.com" className="underline">
            joe@vividmediacheshire.com
          </a>.
          We may need to verify your identity using approved identification.
          Requests will be fulfilled within one month, or up to three months for complex cases.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-3">Cookies</h2>

        <p className="mb-4">
          Our website uses two types of cookies:
        </p>

        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li><strong>Essential cookies:</strong> These are necessary for the website to function properly and cannot be disabled. They include cookies for security, accessibility, and basic functionality.</li>
          <li><strong>Analytics cookies:</strong> These help us understand how visitors use our website so we can improve it. We use Google Analytics 4 with anonymized data collection. These cookies are only set with your explicit consent.</li>
        </ul>

        <p className="mb-4">
          When you first visit our website, you'll see a cookie consent banner where you can choose to accept or reject non-essential cookies. Your choice is stored for 180 days. You can change your preferences at any time using the "Cookie Preferences" link in our website footer.
        </p>

        <p className="mb-4">
          We do not use cookies for advertising, tracking across other websites, or identifying individuals. All analytics data is anonymized and aggregated.
        </p>

        <p className="mb-4">
          To learn more about managing cookies in your browser, visit{" "}
          <a href="https://www.aboutcookies.org" target="_blank" className="underline">
            aboutcookies.org
          </a>{" "}
          or{" "}
          <a href="https://www.allaboutcookies.org" target="_blank" className="underline">
            allaboutcookies.org
          </a>.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-3">
          Concerns, Comments and Feedback
        </h2>

        <p className="mb-4">
          If you have any concerns about your data or wish to give feedback, please contact us at{" "}
          <a href="mailto:joe@vividmediacheshire.com" className="underline">
            joe@vividmediacheshire.com
          </a>.
          If unresolved, you can contact the Information Commissioner’s Office (ICO) at{" "}
          <a href="https://ico.org.uk/concerns/" target="_blank" className="underline">
            https://ico.org.uk/concerns/
          </a>.
        </p>

        <p className="text-sm text-slate-500 mt-10">
          Last updated: {new Date().toISOString().slice(0, 10)}
        </p>
      </main>
      <Footer />
    </>
  );
}
