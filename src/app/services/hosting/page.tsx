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
import SpeedProofBlock from "@/components/scram/SpeedProofBlock";
import { STANDARD_CTA } from "@/lib/proof-data";

export const metadata = generateSocialMetadata({
  pageType: 'service',
  content: {
    title: 'Slow Website Costing You Customers?',
    description: 'Your website is slow and visitors leave before they see what you offer. I fix that for Nantwich and Crewe businesses. Faster pages, lower costs, more enquiries.',
    image: '/images/services/web-hosting-and-migration/hosting-migration-card.webp',
  },
  canonicalPath: '/services/website-hosting/',
});

const siteUrl = (path: string) => `${CANONICAL.urls.site}${path}`;

const hostingSchemas = [
  buildService({
    name: 'Website Speed Improvement and Hosting Migration',
    description:
      'Your website is slow. Visitors leave before they see what you offer. I move your site to faster hosting, cut your costs, and get your pages loading in under two seconds.',
    serviceType: 'Website Speed Improvement and Hosting Migration',
    url: siteUrl(CANONICAL.routes.websiteHosting),
    audience: 'Small businesses with slow or expensive websites in Nantwich and Crewe',
  }),
  buildBreadcrumbList([
    { name: 'Home', url: siteUrl(CANONICAL.routes.home) },
    { name: 'Services', url: siteUrl(CANONICAL.routes.services) },
    { name: 'Website Hosting', url: siteUrl(CANONICAL.routes.websiteHosting) },
  ]),
  buildFAQPage([
    {
      question: 'Why is my website so slow?',
      answer:
        'Most small business websites sit on cheap shared hosting. Other sites on the same server use up the resources. Your pages take five or ten seconds to load. Visitors leave before they see anything.',
    },
    {
      question: 'Will faster hosting help enquiries?',
      answer:
        'Yes. A slow site loses visitors before they read a word. Faster pages keep people on your site long enough to pick up the phone or fill in the form.',
    },
    {
      question: 'Can you migrate my current site?',
      answer:
        'Yes. I move your site to faster hosting without you losing anything. Your content, your emails, your domain all stay the same. The site just loads faster.',
    },
    {
      question: 'Will my website go offline during migration?',
      answer:
        'No. I set up the new hosting first and test everything before switching. Your site stays live the entire time.',
    },
  ]),
];

export default function HostingPage() {
  return (
    <Layout>
      <JsonLd schemas={hostingSchemas} />
      <DualStickyCTA />
      <div className="min-h-screen bg-white">

        {/* Hero — Req 15.1: "Your website is slow. People leave." */}
        <ProblemHero
          heading="Your website is slow."
          subline="People leave."
          ctaLabel={STANDARD_CTA.primaryLabel}
          ctaHref={STANDARD_CTA.primaryHref}
        />

        {/* Reader recognition trigger */}
        <section className="pt-8 pb-4 px-4">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-fluid-base md:text-lg font-medium text-gray-800">
              If your website gets visitors but no enquiries, this is why.
            </p>
          </div>
        </section>

        {/* Three outcome-led blocks — Req 15.3 */}
        <section className="py-12 md:py-16 px-4">
          <div className="mx-auto max-w-3xl space-y-10">

            {/* Outcome 1: People stop leaving */}
            <div>
              <h2 className="text-fluid-2xl md:text-3xl font-bold text-brand-black">
                People stop leaving before the page loads
              </h2>
              <p className="mt-4 text-fluid-base md:text-lg text-gray-700 leading-relaxed">
                A slow website loses visitors before they read a word. I move your site to faster hosting so pages load in under two seconds. People stay. They see your offer. They are more likely to get in touch.
              </p>
            </div>

            {/* Outcome 2: Easier to trust */}
            <div>
              <h2 className="text-fluid-2xl md:text-3xl font-bold text-brand-black">
                Your website becomes easier to trust
              </h2>
              <p className="mt-4 text-fluid-base md:text-lg text-gray-700 leading-relaxed">
                A fast site feels professional. Visitors trust it more. Search engines rank it higher. The same content performs better when it loads quickly.
              </p>
            </div>

            {/* Outcome 3: No tech management */}
            <div>
              <h2 className="text-fluid-2xl md:text-3xl font-bold text-brand-black">
                You do not have to manage the technical side
              </h2>
              <p className="mt-4 text-fluid-base md:text-lg text-gray-700 leading-relaxed">
                I handle the migration, the setup, and the ongoing hosting. No support tickets. No server dashboards. If something breaks, I fix it.
              </p>
            </div>

          </div>
        </section>

        {/* Speed proof — Req 15.4: keep performance before/after, simplified intro */}
        <SpeedProofBlock
          variant="compact"
          sourceAttribution="Data from my own website rebuild and hosting migration"
        />

        {/* How It Works — Req 15.5: clean 3-column grid, 3 steps, short copy */}
        <section className="py-12 md:py-16 px-4 bg-gray-50">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-fluid-2xl md:text-3xl font-bold text-brand-black text-center">
              How it works
            </h2>
            <div className="mt-10 grid gap-8 md:grid-cols-3">
              <div>
                <p className="text-lg font-bold text-brand-black">1. Send me your website</p>
                <p className="mt-2 text-fluid-base text-gray-700">
                  I check your current hosting, load times, and what is slowing things down.
                </p>
              </div>
              <div>
                <p className="text-lg font-bold text-brand-black">2. I move your site</p>
                <p className="mt-2 text-fluid-base text-gray-700">
                  I migrate everything to faster hosting. Your content, emails, and domain stay the same. Nothing goes offline.
                </p>
              </div>
              <div>
                <p className="text-lg font-bold text-brand-black">3. Your site loads faster</p>
                <p className="mt-2 text-fluid-base text-gray-700">
                  Pages open in under two seconds. Visitors stay longer. More of them enquire.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ section — visible on page, matches FAQPage schema */}
        <section className="py-12 md:py-16 px-4">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-fluid-2xl md:text-3xl font-bold text-brand-black">
              Common questions about slow websites
            </h2>
            <div className="mt-8 space-y-6">
              <div>
                <h3 className="text-fluid-base md:text-lg font-semibold text-brand-black">
                  Why is my website so slow?
                </h3>
                <p className="mt-2 text-fluid-base md:text-lg text-gray-700 leading-relaxed">
                  Most small business websites sit on cheap shared hosting. Other sites on the same server use up the resources. Your pages take five or ten seconds to load. Visitors leave before they see anything.
                </p>
              </div>
              <div>
                <h3 className="text-fluid-base md:text-lg font-semibold text-brand-black">
                  Will faster hosting help enquiries?
                </h3>
                <p className="mt-2 text-fluid-base md:text-lg text-gray-700 leading-relaxed">
                  Yes. A slow site loses visitors before they read a word. Faster pages keep people on your site long enough to pick up the phone or fill in the form.
                </p>
              </div>
              <div>
                <h3 className="text-fluid-base md:text-lg font-semibold text-brand-black">
                  Can you migrate my current site?
                </h3>
                <p className="mt-2 text-fluid-base md:text-lg text-gray-700 leading-relaxed">
                  Yes. I move your site to faster hosting without you losing anything. Your content, your emails, your domain all stay the same. The site just loads faster.
                </p>
              </div>
              <div>
                <h3 className="text-fluid-base md:text-lg font-semibold text-brand-black">
                  Will my website go offline during migration?
                </h3>
                <p className="mt-2 text-fluid-base md:text-lg text-gray-700 leading-relaxed">
                  No. I set up the new hosting first and test everything before switching. Your site stays live the entire time.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Cross-link to Website Design — Req 15.7: connect speed to enquiry generation */}
        <section className="py-12 md:py-16 px-4 bg-gray-50">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-fluid-2xl md:text-3xl font-bold text-brand-black">
              Speed is the foundation. Structure turns visitors into enquiries.
            </h2>
            <p className="mt-4 text-fluid-base md:text-lg text-gray-700 leading-relaxed">
              Fast hosting gets your site loading quickly. If the site itself is not built to convert visitors into enquiries, speed alone will not fix the problem.
            </p>
            <div className="mt-8">
              <Link
                href="/services/website-design/"
                className="block rounded-lg bg-white p-6 shadow-sm hover:shadow-md transition-shadow max-w-sm"
              >
                <h3 className="text-lg font-semibold text-brand-black">Website Design</h3>
                <p className="mt-2 text-sm text-gray-700">
                  Your website looks fine but nobody calls. I fix the structure so visitors see what to do next.
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
              Your website stays fast and stable.
            </p>
            <p className="mt-2 text-fluid-2xl md:text-3xl font-bold text-brand-black leading-tight">
              Easy to trust.
            </p>
          </div>
        </section>

        {/* End-of-page CTA */}
        <CTABlock
          heading="Send me your website. I will tell you what is slowing it down."
          body="I check your hosting, tell you what to fix, and handle the migration if you want me to."
          primaryLabel={STANDARD_CTA.primaryLabel}
          primaryHref={STANDARD_CTA.primaryHref}
          secondaryLabel={STANDARD_CTA.secondaryLabel}
          secondaryHref={STANDARD_CTA.secondaryHref}
          variant="end-of-page"
          valueLine="I'll tell you what's stopping people getting in touch. This is a quick website audit."
        />
      </div>
    </Layout>
  );
}