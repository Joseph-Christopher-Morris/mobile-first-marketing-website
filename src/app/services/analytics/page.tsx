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
    title: 'Not Sure What\'s Working?',
    description: 'Spending on marketing but not sure what brings in enquiries? I set up clear tracking for Nantwich and Crewe businesses so you see what works. Nantwich-based.',
    image: '/images/services/Google-analytics-dashboard.webp',
  },
  canonicalPath: '/services/analytics/',
});

const siteUrl = (path: string) => `${CANONICAL.urls.site}${path}`;

const analyticsSchemas = [
  buildService({
    name: 'Website and Marketing Analytics Setup',
    description:
      'You are spending on marketing but you cannot tell what brings in enquiries. I set up tracking that shows where your leads come from and what your money earns. Nantwich and Crewe businesses stop guessing and start seeing results.',
    serviceType: 'Website and Marketing Analytics Setup',
    url: siteUrl(CANONICAL.routes.analytics),
    audience: 'Nantwich and Crewe small businesses and trades spending on marketing without knowing what works',
  }),
  buildBreadcrumbList([
    { name: 'Home', url: siteUrl(CANONICAL.routes.home) },
    { name: 'Services', url: siteUrl(CANONICAL.routes.services) },
    { name: 'Analytics', url: siteUrl(CANONICAL.routes.analytics) },
  ]),
  buildFAQPage([
    {
      question: 'Why can I not tell where my enquiries come from?',
      answer:
        'Most websites have broken tracking or missing conversion events. I set up GA4 with custom events so you see exactly which marketing channels bring real enquiries.',
    },
    {
      question: 'How much does analytics setup cost?',
      answer:
        'GA4 setup is £75 one-time. Looker Studio dashboards start from £80. Monthly reports start from £40. I review your situation before recommending anything.',
    },
    {
      question: 'What is the difference between GA4 and Microsoft Clarity?',
      answer:
        'GA4 shows you what happens on your site. Clarity shows you why. I use both together so you see the full picture.',
    },
    {
      question: 'Do I need monthly reports?',
      answer:
        'If you want to know what worked each month without logging into dashboards yourself, yes. I send a short report showing leads, traffic sources, and what to do next.',
    },
  ]),
];

export default function AnalyticsServicesPage() {
  return (
    <Layout>
      <JsonLd schemas={analyticsSchemas} />
      <DualStickyCTA />
      <div className="min-h-screen bg-white">

        {/* ProblemHero */}
        <ProblemHero
          heading="Not sure what's working?"
          subline="You are spending on marketing. You cannot tell what brings in enquiries."
          ctaLabel="Send me your website"
          ctaHref="/contact/"
          proofText="Found £2,400 in wasted ad spend for a Nantwich business"
          imageSrc="/images/services/Google-analytics-dashboard.webp"
          imageAlt="Analytics dashboard showing clear business performance metrics"
        />

        {/* ProblemMirror */}
        <div className="max-w-3xl mx-auto px-4">
          <ProblemMirror
            statement="I am spending money on marketing but I have no idea what actually brings in enquiries."
            followUp="Most websites have broken tracking or missing conversion events. The dashboards show numbers but none of them answer the question that matters. I fix that."
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
                  GA4 and Clarity setup for a Nantwich venue
                </h3>
                <p className="mt-3 text-fluid-base md:text-lg text-gray-700 leading-relaxed">
                  I set up GA4 with custom conversion events and Microsoft Clarity for the NYCC website. The data showed 40% of visitors left the booking page before completing an enquiry.
                </p>
                <p className="mt-2 text-fluid-base md:text-lg text-gray-700 leading-relaxed">
                  I restructured the page layout based on Clarity heatmaps. Booking enquiries increased by 35% over the following quarter.
                </p>
                <p className="mt-2 text-sm text-gray-500 italic">
                  Results depend on your site structure, traffic, and visitor behaviour. Your numbers will differ.
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 p-6 md:p-8">
                <h3 className="text-fluid-base md:text-lg font-semibold text-brand-black">
                  Ad spend audit for a Nantwich and Crewe trades business
                </h3>
                <p className="mt-3 text-fluid-base md:text-lg text-gray-700 leading-relaxed">
                  I audited the Google Ads tracking for a local trades business. I found £2,400 in annual spend going to keywords that never converted.
                </p>
                <p className="mt-2 text-fluid-base md:text-lg text-gray-700 leading-relaxed">
                  I fixed the conversion tracking and paused the underperforming campaigns. The business redirected budget to keywords that brought in phone calls.
                </p>
                <p className="mt-2 text-sm text-gray-500 italic">
                  Wasted spend varies by industry and campaign setup. I review your specific situation before recommending changes.
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
              When you have a question about your tracking, you talk to the person who set it up. I reply the same day during business hours.
            </p>
            <p className="mt-4 text-fluid-base md:text-lg text-gray-700 leading-relaxed">
              Based in Nantwich, working with businesses across Nantwich and Crewe.
            </p>
          </div>
        </section>

        {/* Why businesses fly blind */}
        <section className="py-12 md:py-16 px-4">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-fluid-2xl md:text-3xl font-bold text-brand-black">
              Why Nantwich and Crewe businesses fly blind without proper tracking
            </h2>
            <p className="mt-4 text-fluid-base md:text-lg text-gray-700 leading-relaxed">
              Most local businesses have Google Analytics installed but never look at it. Or they look at it and the numbers mean nothing.
            </p>
            <p className="mt-4 text-fluid-base md:text-lg text-gray-700 leading-relaxed">
              Marketing decisions end up based on gut feeling. Ad spend goes to campaigns that do not convert. There is no way to tell which enquiries came from where.
            </p>
            <p className="mt-4 text-fluid-base md:text-lg text-gray-700 leading-relaxed">
              I set up tracking that answers the questions you care about. Where do my enquiries come from? What is my cost per lead? Which channels deserve more budget?
            </p>
          </div>
        </section>

        {/* What I set up */}
        <section className="py-12 md:py-16 px-4">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-fluid-2xl md:text-3xl font-bold text-brand-black">
              What I set up for you
            </h2>
            <div className="mt-8 space-y-6">
              <div className="rounded-lg bg-gray-50 p-6">
                <h3 className="text-lg font-semibold text-brand-black">GA4 with custom conversion tracking</h3>
                <p className="mt-2 text-fluid-base text-gray-700">
                  I install Google Analytics 4 properly. I set up custom events for form submissions, phone clicks, and key page visits. You see which marketing channels bring real enquiries.
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 p-6">
                <h3 className="text-lg font-semibold text-brand-black">Microsoft Clarity behaviour insights</h3>
                <p className="mt-2 text-fluid-base text-gray-700">
                  GA4 shows what happens on your site. Clarity shows why. I use heatmaps and session recordings to find where visitors get stuck or leave. Then I fix it.
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 p-6">
                <h3 className="text-lg font-semibold text-brand-black">Looker Studio dashboards</h3>
                <p className="mt-2 text-fluid-base text-gray-700">
                  I build dashboards that show your key numbers in one place. Leads, traffic sources, cost per enquiry. You check it whenever you want.
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 p-6">
                <h3 className="text-lg font-semibold text-brand-black">Monthly performance reports</h3>
                <p className="mt-2 text-fluid-base text-gray-700">
                  I send you a short report each month. What worked, what did not, and what to do next. The numbers that matter for your business.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-12 md:py-16 px-4">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-fluid-2xl md:text-3xl font-bold text-brand-black">
              Analytics pricing
            </h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              <div className="rounded-lg bg-gray-50 p-6 md:p-8">
                <h3 className="text-lg font-semibold text-brand-black">GA4 Setup</h3>
                <p className="mt-2 text-2xl font-bold text-brand-pink">£75 <span className="text-base font-normal text-gray-600">one-time</span></p>
                <p className="mt-3 text-fluid-base text-gray-700">
                  Full GA4 setup with custom events and conversion tracking. You see where your enquiries come from.
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 p-6 md:p-8">
                <h3 className="text-lg font-semibold text-brand-black">Looker Studio Dashboard</h3>
                <p className="mt-2 text-2xl font-bold text-brand-pink">from £80 <span className="text-base font-normal text-gray-600">one-time</span></p>
                <p className="mt-3 text-fluid-base text-gray-700">
                  Your key numbers in one place. Leads, traffic, and cost per enquiry. No spreadsheets.
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 p-6 md:p-8">
                <h3 className="text-lg font-semibold text-brand-black">Monthly Reports</h3>
                <p className="mt-2 text-2xl font-bold text-brand-pink">from £40 <span className="text-base font-normal text-gray-600">per month</span></p>
                <p className="mt-3 text-fluid-base text-gray-700">
                  A short monthly report showing what worked and what to change. Basic £40, Standard £75, Premium £120.
                </p>
              </div>
            </div>
            <div className="mt-6 rounded-lg border border-gray-200 p-6">
              <p className="text-fluid-base text-gray-700">
                <span className="font-semibold">Who this is for:</span> Small businesses and trades in Nantwich and Crewe that spend money on marketing but cannot tell what is working.
              </p>
              <p className="mt-3 text-fluid-base text-gray-700">
                <span className="font-semibold">Who this is NOT for:</span> Large enterprises needing data warehousing or a full analytics team. I work directly with you on focused, practical tracking.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ section — visible on page, matches FAQPage schema */}
        <section className="py-12 md:py-16 px-4 bg-gray-50">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-fluid-2xl md:text-3xl font-bold text-brand-black">
              Common questions about analytics
            </h2>
            <div className="mt-8 space-y-6">
              <div>
                <h3 className="text-fluid-base md:text-lg font-semibold text-brand-black">
                  Why can I not tell where my enquiries come from?
                </h3>
                <p className="mt-2 text-fluid-base md:text-lg text-gray-700 leading-relaxed">
                  Most websites have broken tracking or missing conversion events. I set up GA4 with custom events so you see exactly which marketing channels bring real enquiries.
                </p>
              </div>
              <div>
                <h3 className="text-fluid-base md:text-lg font-semibold text-brand-black">
                  How much does analytics setup cost?
                </h3>
                <p className="mt-2 text-fluid-base md:text-lg text-gray-700 leading-relaxed">
                  GA4 setup is £75 one-time. Looker Studio dashboards start from £80. Monthly reports start from £40. I review your situation before recommending anything.
                </p>
              </div>
              <div>
                <h3 className="text-fluid-base md:text-lg font-semibold text-brand-black">
                  What is the difference between GA4 and Microsoft Clarity?
                </h3>
                <p className="mt-2 text-fluid-base md:text-lg text-gray-700 leading-relaxed">
                  GA4 shows you what happens on your site. Clarity shows you why. I use both together so you see the full picture.
                </p>
              </div>
              <div>
                <h3 className="text-fluid-base md:text-lg font-semibold text-brand-black">
                  Do I need monthly reports?
                </h3>
                <p className="mt-2 text-fluid-base md:text-lg text-gray-700 leading-relaxed">
                  If you want to know what worked each month without logging into dashboards yourself, yes. I send a short report showing leads, traffic sources, and what to do next.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Cross-links */}
        <section className="py-12 md:py-16 px-4 bg-gray-50">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-fluid-2xl md:text-3xl font-bold text-brand-black">
              Tracking works harder with the right website and ads
            </h2>
            <p className="mt-4 text-fluid-base md:text-lg text-gray-700 leading-relaxed">
              Tracking is only useful if your website converts visitors and your ads reach the right people. I also fix websites that lose visitors and run ad campaigns that bring in real leads.
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
                href="/services/ad-campaigns/"
                className="block rounded-lg bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold text-brand-black">Ad Campaigns</h3>
                <p className="mt-2 text-sm text-gray-700">
                  Ads not bringing in leads? I fix the targeting and the landing page so clicks turn into calls.
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
          heading="Send me your website. I will show you what is not working."
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
