import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Vivid Auto Photography",
  description:
    "Our commitment to privacy, data collection practices, and how we protect your information.",
  alternates: { canonical: "/privacy-policy" },
  robots: { index: true, follow: true },
};

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-extrabold tracking-tight mb-6">
        Privacy Policy
      </h1>

      <p className="mb-4 text-slate-700">
        This Privacy Policy explains what information we collect, how we use it,
        and the choices you have. By using this website, you agree to this
        policy.
      </p>

      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">Information We Collect</h2>
        <ul className="list-disc pl-6">
          <li>Contact details you provide (e.g., name, email, phone).</li>
          <li>Usage data collected via analytics to improve the website.</li>
          <li>Content you submit through forms.</li>
        </ul>
      </section>

      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">How We Use Information</h2>
        <ul className="list-disc pl-6">
          <li>To respond to enquiries and deliver requested services.</li>
          <li>To improve site performance, content, and user experience.</li>
          <li>To maintain security and prevent abuse.</li>
        </ul>
      </section>

      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">Cookies & Analytics</h2>
        <p className="text-slate-700">
          We may use cookies and analytics tools to understand site usage and
          improve our services. You can manage cookies in your browser settings.
        </p>
      </section>

      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">Data Sharing</h2>
        <p className="text-slate-700">
          We do not sell your personal information. We may share data with
          service providers who help us operate the website, subject to
          appropriate safeguards.
        </p>
      </section>

      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">Your Choices</h2>
        <ul className="list-disc pl-6">
          <li>Request access, correction, or deletion of your data.</li>
          <li>Opt out of non-essential analytics where offered.</li>
          <li>Contact us with privacy requests at <a className="underline" href="mailto:joe@vividauto.photography">joe@vividauto.photography</a>.</li>
        </ul>
      </section>

      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">Contact</h2>
        <p className="text-slate-700">
          Vivid Auto Photography — Johannesburg, South Africa. For any privacy
          questions, email <a className="underline" href="mailto:joe@vividauto.photography">joe@vividauto.photography</a>.
        </p>
      </section>

      <p className="text-sm text-slate-500">
        Last updated: {new Date().toISOString().slice(0, 10)}
      </p>
    </main>
  );
}
