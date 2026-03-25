import { Metadata } from 'next';
import { generateMetadata as generateSocialMetadata } from '@/lib/metadata-generator';
import { Layout } from '@/components/layout';
import { JsonLd } from '@/components/JsonLd';
import { CANONICAL } from '@/config/canonical';
import {
  buildService,
  buildWebPage,
  buildBreadcrumbList,
} from '@/lib/schema-generator';
import CTABlock from '@/components/scram/CTABlock';
import { STANDARD_CTA } from '@/lib/proof-data';
import FreeAuditClient from './FreeAuditClient';

export const metadata: Metadata = generateSocialMetadata({
  pageType: 'general',
  content: {
    title: 'Website Conversion Audit - Nantwich',
    description: 'I show you what is stopping people getting in touch. Short written breakdown with clear issues and simple actions. Reply within 24 hours. Free for Nantwich and Crewe businesses.',
  },
  canonicalPath: '/free-audit/',
});

const siteUrl = (path: string) => `${CANONICAL.urls.site}${path}`;

const freeAuditSchemas = [
  buildService({
    name: 'Website Conversion Audit',
    description:
      'I show you what is stopping people getting in touch. You get a short written breakdown covering what is confusing, what is missing, and what is causing drop-off. Clear issues and simple actions. Reply within 24 hours.',
    serviceType: 'Website Conversion Audit',
    url: siteUrl(CANONICAL.routes.freeAudit),
    audience: 'Trades, local services, and small businesses in Nantwich and Crewe who are not getting enquiries from their website',
  }),
  buildWebPage({
    name: 'Website Conversion Audit - Vivid Media Cheshire',
    description:
      'I show you what is stopping people getting in touch. Short written breakdown with clear issues and simple actions. Reply within 24 hours for Nantwich and Crewe businesses.',
    url: siteUrl(CANONICAL.routes.freeAudit),
  }),
  buildBreadcrumbList([
    { name: 'Home', url: siteUrl(CANONICAL.routes.home) },
    { name: 'Free Audit', url: siteUrl(CANONICAL.routes.freeAudit) },
  ]),
];

export default function FreeAuditPage() {
  return (
    <Layout pageTitle="Website Conversion Audit">
      <JsonLd schemas={freeAuditSchemas} />
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="bg-brand-black py-16 md:py-24">
          <div className="mx-auto max-w-4xl px-4 text-center text-white">
            <h1 className="mb-6 text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight">
              Website Conversion Audit
            </h1>
            <p className="mb-4 text-lg md:text-xl text-white/90">
              I&apos;ll show you what&apos;s stopping people getting in touch.
            </p>
            <p className="text-base text-white/70">
              Reply within 24 hours. Based in Nantwich.
            </p>
          </div>
        </section>

        {/* What you get */}
        <FreeAuditClient />

        {/* How it works */}
        <section className="px-6 py-12 bg-white">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-8 text-2xl font-bold text-gray-900 text-center">
              How it works
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div>
                <p className="text-lg font-bold text-brand-black">1. Send me your website</p>
                <p className="mt-2 text-fluid-base text-gray-700">
                  Fill in the form or email me your URL.
                </p>
              </div>
              <div>
                <p className="text-lg font-bold text-brand-black">2. I review it</p>
                <p className="mt-2 text-fluid-base text-gray-700">
                  I check speed, structure, and messaging. I look at what is confusing, what is missing, and what is causing drop-off.
                </p>
              </div>
              <div>
                <p className="text-lg font-bold text-brand-black">3. You get a clear breakdown</p>
                <p className="mt-2 text-fluid-base text-gray-700">
                  A short written report with what to change and what to prioritise. Within 24 hours.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What happens next */}
        <section className="px-6 py-12 bg-gray-50">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">
              After the audit
            </h2>
            <p className="text-fluid-base md:text-lg text-gray-700 mb-6">
              Some people fix things themselves. Others ask me to do it. Either way, you leave with a clear picture.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-brand-pink text-lg mt-0.5">→</span>
                <p className="text-fluid-base text-gray-700">
                  Website redesign if the structure is the problem
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-brand-pink text-lg mt-0.5">→</span>
                <p className="text-fluid-base text-gray-700">
                  Hosting migration if speed is the problem
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-brand-pink text-lg mt-0.5">→</span>
                <p className="text-fluid-base text-gray-700">
                  Ads alignment if traffic is fine but conversions are not
                </p>
              </div>
            </div>
            <p className="mt-6 text-sm text-gray-500">
              No pressure. The audit stands on its own.
            </p>
          </div>
        </section>

        {/* Trust Section */}
        <section className="bg-gray-50 px-6 py-12">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">
              You deal directly with me
            </h2>
            <p className="mb-4 text-gray-600">
              No account managers. No automated reports. I look at your site myself and tell you what I see.
            </p>
            <p className="text-sm text-gray-500">
              Based in Nantwich. Working with Nantwich and Crewe businesses.
            </p>
          </div>
        </section>

        {/* End-of-page CTA */}
        <CTABlock
          heading="Send me your website"
          body="I will show you what is stopping people getting in touch."
          primaryLabel={STANDARD_CTA.primaryLabel}
          primaryHref={STANDARD_CTA.primaryHref}
          secondaryLabel={STANDARD_CTA.secondaryLabel}
          secondaryHref={STANDARD_CTA.secondaryHref}
          variant="end-of-page"
          valueLine="Short written breakdown. Within 24 hours."
        />
      </div>
    </Layout>
  );
}
