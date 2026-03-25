import Link from "next/link";
import { Layout } from "@/components/layout";
import { DualStickyCTA } from "@/components/DualStickyCTA";
import { generateMetadata as generateSocialMetadata } from "@/lib/metadata-generator";
import { JsonLd } from "@/components/JsonLd";
import { CANONICAL } from "@/config/canonical";
import {
  buildService,
  buildBreadcrumbList,
  buildFAQPage,
} from "@/lib/schema-generator";
import ProblemHero from "@/components/scram/ProblemHero";
import CTABlock from "@/components/scram/CTABlock";
import ProblemMirror from "@/components/scram/ProblemMirror";

export const metadata = generateSocialMetadata({
  pageType: 'service',
  content: {
    title: 'Ads Not Bringing In Leads?',
    description: 'Spending on ads but not getting leads? I run targeted campaigns for Nantwich and Crewe businesses that turn clicks into real enquiries. Based in Nantwich.',
    image: '/images/services/WhatsApp Image 2025-11-11 at 9.27.14 AM.webp',
  },
  canonicalPath: '/services/ad-campaigns/',
});

const siteUrl = (path: string) => `${CANONICAL.urls.site}${path}`;

const adCampaignsSchemas = [
  buildService({
    name: 'Google Ads Campaign Management',
    description:
      'You are spending on ads but the phone is not ringing. I set up and manage Google Ads campaigns for Nantwich and Crewe trades and local services. You see where every pound goes and what it earns.',
    serviceType: 'Google Ads Campaign Management',
    url: siteUrl(CANONICAL.routes.adCampaigns),
    audience: 'Nantwich and Crewe trades and local services spending on ads without getting enquiries',
  }),
  buildBreadcrumbList([
    { name: 'Home', url: siteUrl(CANONICAL.routes.home) },
    { name: 'Services', url: siteUrl(CANONICAL.routes.services) },
    { name: 'Ad Campaigns', url: siteUrl(CANONICAL.routes.adCampaigns) },
  ]),
  buildFAQPage([
    {
      question: 'Why are my Google Ads not getting leads?',
      answer:
        'Most local ad campaigns target broad keywords that attract clicks from people who will never buy. I target the searches your customers actually make. Every click goes to a page built to convert.',
    },
    {
      question: 'How much does Google Ads management cost?',
      answer:
        'Setup is £90 one-time. Monthly management starts from £150. No long contracts. I review your market before recommending a budget.',
    },
    {
      question: 'How do I know my ads are working?',
      answer:
        'You get clear monthly reports showing which ads brought calls and enquiries. I track every conversion so you see exactly what your money earned.',
    },
    {
      question: 'Do you manage Facebook and Instagram ads too?',
      answer:
        'I focus on Google Ads for local lead generation. If your audience is on Facebook, I can advise on targeting. The NYCC venue campaign used Facebook group promotion and generated £13,500 from £546 spend.',
    },
  ]),
];

export default function AdCampaignsPage() {
  return (
    <Layout>
      <JsonLd schemas={adCampaignsSchemas} />
      <DualStickyCTA />
      <div className="min-h-screen bg-white">

        {/* ProblemHero */}
        <ProblemHero
          heading="Ads not bringing in leads?"
          subline="You are paying for clicks. Nobody is calling."
          ctaLabel="Send me your website"
          ctaHref="/contact/"
          proofText="£13,500 from a £546 campaign for a Nantwich venue"
        />

        {/* ProblemMirror */}
        <div className="max-w-3xl mx-auto px-4">
          <ProblemMirror
            statement="I have spent money on ads before and got nothing back. Just clicks and no calls."
            followUp="Most ad campaigns fail because they target the wrong people. The clicks look good in a dashboard but nobody picks up the phone. I fix both the targeting and the landing page."
          />
        </div>

        {/* What I tested and what worked */}
        <section className="py-12 md:py-16 px-4">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-fluid-2xl md:text-3xl font-bold text-brand-black">
              What I tested and what worked
            </h2>
            <div className="mt-8 space-y-8">
              <div className="rounded-lg bg-gray-50 p-6 md:p-8">
                <h3 className="text-fluid-base md:text-lg font-semibold text-brand-black">
                  NYCC venue bookings from Facebook promotion
                </h3>
                <p className="mt-3 text-fluid-base md:text-lg text-gray-700 leading-relaxed">
                  I promoted Nantwich Youth and Community Centre venue pages through local Facebook groups. Four direct booking leads came in from £546 spend. That generated £13,500 in venue hire revenue.
                </p>
                <p className="mt-2 text-fluid-base md:text-lg text-gray-700 leading-relaxed">
                  NYCC venue page bookings increased by 35% during the campaign.
                </p>
                <p className="mt-2 text-sm text-gray-500 italic">
                  Results depend on your audience, offer, and landing page. Your numbers will differ.
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 p-6 md:p-8">
                <h3 className="text-fluid-base md:text-lg font-semibold text-brand-black">
                  Google Ads for a Nantwich and Crewe trades business
                </h3>
                <p className="mt-3 text-fluid-base md:text-lg text-gray-700 leading-relaxed">
                  I set up a Google Ads campaign targeting local search terms. Within the first month, the campaign delivered a steady flow of phone enquiries. Cost per lead was well below the industry average.
                </p>
                <p className="mt-2 text-fluid-base md:text-lg text-gray-700 leading-relaxed">
                  The business owner could track exactly which calls came from ads.
                </p>
                <p className="mt-2 text-sm text-gray-500 italic">
                  Cost per lead varies by industry and location. I review your market before recommending a budget.
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
              No account managers. No call centres. No waiting a week for a reply.
            </p>
            <p className="mt-4 text-fluid-base md:text-lg text-gray-700 leading-relaxed">
              When you have a question about your ads, you talk to the person who set them up. I reply the same day during business hours.
            </p>
            <p className="mt-4 text-fluid-base md:text-lg text-gray-700 leading-relaxed">
              Based in Nantwich, working with businesses across Nantwich and Crewe.
            </p>
          </div>
        </section>

        {/* Why ads fail locally */}
        <section className="py-12 md:py-16 px-4">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-fluid-2xl md:text-3xl font-bold text-brand-black">
              Why Nantwich and Crewe businesses waste money on ads
            </h2>
            <p className="mt-4 text-fluid-base md:text-lg text-gray-700 leading-relaxed">
              Most local businesses pick broad keywords and hope for the best. The result is clicks from people who were never going to buy. The budget drains fast. There is no way to tell what worked.
            </p>
            <p className="mt-4 text-fluid-base md:text-lg text-gray-700 leading-relaxed">
              I build campaigns around the searches your customers actually make. Every click goes to a page built to convert. You get clear reports showing what your money earned.
            </p>
          </div>
        </section>

        {/* Pricing section */}
        <section className="py-12 md:py-16 px-4">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-fluid-2xl md:text-3xl font-bold text-brand-black">
              Ad campaign pricing
            </h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div className="rounded-lg bg-gray-50 p-6 md:p-8">
                <h3 className="text-lg font-semibold text-brand-black">Google Ads Setup</h3>
                <p className="mt-2 text-2xl font-bold text-brand-pink">£90 <span className="text-base font-normal text-gray-600">one-time</span></p>
                <p className="mt-3 text-fluid-base text-gray-700">
                  Campaign structure, keyword research, ad copy, and conversion tracking. Ready to run from day one.
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 p-6 md:p-8">
                <h3 className="text-lg font-semibold text-brand-black">Monthly Management</h3>
                <p className="mt-2 text-2xl font-bold text-brand-pink">from £150 <span className="text-base font-normal text-gray-600">per month</span></p>
                <p className="mt-3 text-fluid-base text-gray-700">
                  I review performance, adjust targeting, and send you a monthly report showing what your ads earned.
                </p>
              </div>
            </div>
            <p className="mt-6 text-fluid-base text-gray-600">
              No long contracts. I fit everything to your budget.
            </p>
            <div className="mt-6 rounded-lg border border-gray-200 p-6">
              <p className="text-fluid-base text-gray-700">
                <span className="font-semibold">Who this is for:</span> Trades, local services, and small businesses in Nantwich and Crewe that want more phone calls from people ready to buy.
              </p>
              <p className="mt-3 text-fluid-base text-gray-700">
                <span className="font-semibold">Who this is not for:</span> Large businesses running national campaigns. I work directly with you on focused, local campaigns.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ section — visible on page, matches FAQPage schema */}
        <section className="py-12 md:py-16 px-4 bg-gray-50">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-fluid-2xl md:text-3xl font-bold text-brand-black">
              Common questions about Google Ads
            </h2>
            <div className="mt-8 space-y-6">
              <div>
                <h3 className="text-fluid-base md:text-lg font-semibold text-brand-black">
                  Why are my Google Ads not getting leads?
                </h3>
                <p className="mt-2 text-fluid-base md:text-lg text-gray-700 leading-relaxed">
                  Most local ad campaigns target broad keywords that attract clicks from people who will never buy. I target the searches your customers actually make. Every click goes to a page built to convert.
                </p>
              </div>
              <div>
                <h3 className="text-fluid-base md:text-lg font-semibold text-brand-black">
                  How much does Google Ads management cost?
                </h3>
                <p className="mt-2 text-fluid-base md:text-lg text-gray-700 leading-relaxed">
                  Setup is £90 one-time. Monthly management starts from £150. No long contracts. I review your market before recommending a budget.
                </p>
              </div>
              <div>
                <h3 className="text-fluid-base md:text-lg font-semibold text-brand-black">
                  How do I know my ads are working?
                </h3>
                <p className="mt-2 text-fluid-base md:text-lg text-gray-700 leading-relaxed">
                  You get clear monthly reports showing which ads brought calls and enquiries. I track every conversion so you see exactly what your money earned.
                </p>
              </div>
              <div>
                <h3 className="text-fluid-base md:text-lg font-semibold text-brand-black">
                  Do you manage Facebook and Instagram ads too?
                </h3>
                <p className="mt-2 text-fluid-base md:text-lg text-gray-700 leading-relaxed">
                  I focus on Google Ads for local lead generation. If your audience is on Facebook, I can advise on targeting. The NYCC venue campaign used Facebook group promotion and generated £13,500 from £546 spend.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Cross-links */}
        <section className="py-12 md:py-16 px-4 bg-gray-50">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-fluid-2xl md:text-3xl font-bold text-brand-black">
              Ads work harder with the right website
            </h2>
            <p className="mt-4 text-fluid-base md:text-lg text-gray-700 leading-relaxed">
              Sending ad traffic to a slow or unclear website wastes your budget. I also fix websites that lose visitors and set up tracking so you see what drives results.
            </p>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <Link
                href="/services/website-design/"
                className="block rounded-lg bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold text-brand-black">Website Design</h3>
                <p className="mt-2 text-sm text-gray-700">
                  Your website looks fine but nobody calls. I fix the structure so visitors see what to do next.
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
                  See where your visitors come from and which campaigns bring the most enquiries.
                </p>
                <span className="mt-3 inline-block text-brand-pink font-semibold text-sm">
                  Learn more →
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* End-of-page CTA */}
        <CTABlock
          heading="Send me your ad account. I will tell you what is not working."
          primaryLabel="Send me your website"
          primaryHref="/contact/"
          secondaryLabel="Email me directly"
          secondaryHref={`mailto:${CANONICAL.contact.email}`}
          variant="end-of-page"
        />
      </div>
    </Layout>
  );
}
