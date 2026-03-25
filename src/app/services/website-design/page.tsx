import Link from "next/link";
import { Layout } from "@/components/layout";
import { generateMetadata as generateSocialMetadata } from "@/lib/metadata-generator";
import { JsonLd } from "@/components/JsonLd";
import { CANONICAL } from "@/config/canonical";
import {
  buildService,
  buildWebPage,
  buildBreadcrumbList,
  buildFAQPage,
} from "@/lib/schema-generator";
import ProblemHero from "@/components/scram/ProblemHero";
import CTABlock from "@/components/scram/CTABlock";
import WhyWebsitesFail from "@/components/scram/WhyWebsitesFail";
import SpeedProofBlock from "@/components/scram/SpeedProofBlock";
import ThisIsForYouIf from "@/components/scram/ThisIsForYouIf";
import TechnicalProofItem from "@/components/scram/TechnicalProofItem";
import { STANDARD_CTA, AHREFS_PROOF } from "@/lib/proof-data";

export const metadata = generateSocialMetadata({
  pageType: 'service',
  content: {
    title: 'Website Not Bringing In Enquiries?',
    description: 'Your website looks fine but nobody contacts you? I design fast, enquiry-focused websites for Nantwich and Crewe businesses. Based in Nantwich, from £300.',
    image: '/images/services/Website Design/PXL_20240222_004124044~2.webp',
  },
  canonicalPath: '/services/website-design/',
});

const siteUrl = (path: string) => `${CANONICAL.urls.site}${path}`;

const websiteDesignSchemas = [
  buildService({
    name: 'Conversion-Focused Website Design',
    description:
      'Your website looks fine but nobody gets in touch. I redesign sites for Nantwich and Crewe trades and local services. Visitors see what to do next and do it.',
    serviceType: 'Conversion-Focused Website Design',
    url: siteUrl(CANONICAL.routes.websiteDesign),
    audience: 'Trades, local services, and SMEs in Nantwich and Crewe',
  }),
  buildWebPage({
    name: 'Website Design - Vivid Media Cheshire',
    description:
      'Your website feels like hard work. Visitors leave before they enquire. I fix the structure, speed, and messaging. Nantwich and Crewe businesses get more calls and form submissions.',
    url: siteUrl(CANONICAL.routes.websiteDesign),
  }),
  buildBreadcrumbList([
    { name: 'Home', url: siteUrl(CANONICAL.routes.home) },
    { name: 'Services', url: siteUrl(CANONICAL.routes.services) },
    { name: 'Website Design', url: siteUrl(CANONICAL.routes.websiteDesign) },
  ]),
  buildFAQPage([
    {
      question: 'Why is my website not getting enquiries?',
      answer:
        'Most websites look fine but are not built to convert. The structure hides the contact details, the page loads slowly, or the message does not speak to the visitor. I fix all three.',
    },
    {
      question: 'Do I need a full rebuild or just improvements?',
      answer:
        'It depends on the starting point. Some sites need a full rebuild. Others need the structure and speed fixing. I look at your site and tell you which one before you spend anything.',
    },
    {
      question: 'How much does a small business website cost?',
      answer:
        'Most projects fall between £500 and £1,200. One extra enquiry a month usually covers the cost within weeks.',
    },
    {
      question: 'Will this help on mobile?',
      answer:
        'Yes. Most visitors arrive on their phone. I build every site mobile-first so it loads fast and the enquiry form is easy to find on a small screen.',
    },
  ]),
  {
    '@context': 'https://schema.org',
    '@type': 'Offer',
    name: 'Website Redesign',
    description:
      'Your website looks fine but nobody calls. I rebuild it so visitors see what to do next. Faster pages, clearer messaging, more enquiries.',
    price: '500',
    priceCurrency: 'GBP',
    priceValidUntil: '2026-12-31',
    availability: 'https://schema.org/InStock',
  },
];

export default function WebsiteDesignPage() {
  return (
    <Layout>
      <JsonLd schemas={websiteDesignSchemas} />
      <div className="min-h-screen bg-white">
        {/* ProblemHero */}
        <ProblemHero
          heading="Your website is not broken."
          subline="It feels like hard work."
          ctaLabel="Let me take a look"
          ctaHref="/contact/"
        />

        {/* WhyWebsitesFail */}
        <WhyWebsitesFail showSolutionCTA={false} />

        {/* Reader recognition trigger */}
        <section className="pt-8 pb-4 px-4">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-fluid-base md:text-lg font-medium text-gray-800">
              If your website gets visitors but no enquiries, this is why.
            </p>
          </div>
        </section>

        {/* Speed Proof — compact variant for service page */}
        <SpeedProofBlock
          variant="compact"
          sourceAttribution="Data from my own website rebuild and hosting migration"
        />

        {/* Technical SEO proof — supporting item below speed proof */}
        <section className="pb-10 px-4">
          <div className="mx-auto max-w-3xl">
            <TechnicalProofItem
              heading="Technical SEO health"
              metric={`${AHREFS_PROOF.healthScoreBefore} → ${AHREFS_PROOF.healthScoreAfter}`}
              description={AHREFS_PROOF.copySnippets.short}
            />
          </div>
        </section>

        {/* ThisIsForYouIf — stronger decision language */}
        <ThisIsForYouIf
          conditions={[
            "Your website gets visits but no enquiries",
            "People ask basic questions instead of using the site",
            "Your site looks fine but does not move people to act",
          ]}
        />

        {/* Not a fit for everyone */}
        <section className="pb-12 md:pb-16 px-4">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-fluid-2xl md:text-3xl font-bold text-brand-black">
              Not a fit for everyone
            </h2>
            <ul className="mt-6 space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-gray-400 text-xl mt-0.5">✗</span>
                <p className="text-fluid-base md:text-lg text-gray-700">
                  Large enterprise sites needing a full dev team.
                </p>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-gray-400 text-xl mt-0.5">✗</span>
                <p className="text-fluid-base md:text-lg text-gray-700">
                  Agency-scale teams with account managers.
                </p>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-gray-400 text-xl mt-0.5">✗</span>
                <p className="text-fluid-base md:text-lg text-gray-700">
                  E-commerce with thousands of products.
                </p>
              </li>
            </ul>
          </div>
        </section>

        {/* Proof of real work — named examples */}
        <section className="py-12 md:py-16 px-4">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-fluid-2xl md:text-3xl font-bold text-brand-black">
              Real projects. Real results.
            </h2>
            <div className="mt-8 space-y-8">
              <div className="rounded-lg bg-gray-50 p-6 md:p-8">
                <h3 className="text-fluid-base md:text-lg font-semibold text-brand-black">
                  Vivid Media Cheshire site rebuild
                </h3>
                <p className="mt-3 text-fluid-base md:text-lg text-gray-700 leading-relaxed">
                  I rebuilt my own site from scratch. Load time dropped from 14 seconds to under 2. Performance score went from 56 to 99. Pages that took forever now open instantly on mobile.
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 p-6 md:p-8">
                <h3 className="text-fluid-base md:text-lg font-semibold text-brand-black">
                  NYCC booking and information restructure
                </h3>
                <p className="mt-3 text-fluid-base md:text-lg text-gray-700 leading-relaxed">
                  I restructured the booking pages and information layout. Admin time dropped by 8 hours a year. Fewer confused enquiries. Visitors found what they needed without calling to ask.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Personal service reassurance */}
        <section className="py-12 md:py-16 px-4">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-fluid-2xl md:text-3xl font-bold text-brand-black">
              You deal directly with me
            </h2>
            <p className="mt-4 text-fluid-base md:text-lg text-gray-700 leading-relaxed">
              No account managers. No support tickets. No waiting in a queue.
            </p>
            <p className="mt-4 text-fluid-base md:text-lg text-gray-700 leading-relaxed">
              When you hire me, you talk to me. I design, build, and maintain your website. I explain everything in straightforward language.
            </p>
            <p className="mt-4 text-fluid-base md:text-lg text-gray-700 leading-relaxed">
              Based in Nantwich. Working with Nantwich and Crewe businesses. You get a direct line to the person doing the work.
            </p>
          </div>
        </section>

        {/* Location-specific section */}
        <section className="py-12 md:py-16 px-4">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-fluid-2xl md:text-3xl font-bold text-brand-black">
              Why Nantwich and Crewe businesses lose enquiries online
            </h2>
            <p className="mt-4 text-fluid-base md:text-lg text-gray-700 leading-relaxed">
              Most businesses in Nantwich and Crewe rely on word of mouth and local search. A slow website that buries your contact details loses those visitors to competitors.
            </p>
            <p className="mt-4 text-fluid-base md:text-lg text-gray-700 leading-relaxed">
              I put your phone number and enquiry form where visitors expect them. Pages load in under two seconds. The message speaks to the problems your customers face. People leave less. Enquiries go up.
            </p>
          </div>
        </section>

        {/* Cross-links to related services */}
        <section className="py-12 md:py-16 px-4 bg-gray-50">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-fluid-2xl md:text-3xl font-bold text-brand-black">
              Services that work alongside your website
            </h2>
            <p className="mt-4 text-fluid-base md:text-lg text-gray-700 leading-relaxed">
              A fast website is the foundation. These services build on it.
            </p>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              <Link
                href="/services/website-hosting/"
                className="block rounded-lg bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold text-brand-black">Hosting</h3>
                <p className="mt-2 text-sm text-gray-700">
                  Slow site costing you customers? I fix hosting so your site loads faster and costs less.
                </p>
                <span className="mt-3 inline-block text-brand-pink font-semibold text-sm">
                  Learn more →
                </span>
              </Link>
              <Link
                href="/services/ad-campaigns/"
                className="block rounded-lg bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold text-brand-black">Ad Campaigns</h3>
                <p className="mt-2 text-sm text-gray-700">
                  Once your site converts, Google Ads bring targeted visitors ready to enquire.
                </p>
                <span className="mt-3 inline-block text-brand-pink font-semibold text-sm">
                  Learn more →
                </span>
              </Link>
              <Link
                href="/services/analytics/"
                className="block rounded-lg bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold text-brand-black">Analytics</h3>
                <p className="mt-2 text-sm text-gray-700">
                  See where your enquiries come from and which pages drive the most leads.
                </p>
                <span className="mt-3 inline-block text-brand-pink font-semibold text-sm">
                  Learn more →
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* Objection neutralisation */}
        <section className="pb-6 px-4">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-fluid-base md:text-lg text-gray-700">
              Most websites don&apos;t fail because they look bad. They fail because no one made the next step obvious.
            </p>
          </div>
        </section>

        {/* Transformation statement */}
        <section className="py-12 md:py-16 px-4">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-fluid-2xl md:text-3xl font-bold text-brand-black leading-tight">
              Your website becomes something people act on.
            </p>
            <p className="mt-2 text-fluid-2xl md:text-3xl font-bold text-brand-black leading-tight">
              Not just read.
            </p>
          </div>
        </section>

        {/* End-of-page CTA */}
        <CTABlock
          heading="Send me your website. I will tell you what is not working."
          primaryLabel={STANDARD_CTA.primaryLabel}
          primaryHref={STANDARD_CTA.primaryHref}
          secondaryLabel={STANDARD_CTA.secondaryLabel}
          secondaryHref={STANDARD_CTA.secondaryHref}
          variant="end-of-page"
          valueLine="I'll tell you what's stopping people getting in touch. This is a quick website audit."
          urgencyLine="Most people miss this on their own."
        />
      </div>
    </Layout>
  );
}
