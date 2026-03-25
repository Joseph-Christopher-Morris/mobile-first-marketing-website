import { Metadata } from 'next';
import { Layout } from '@/components/layout';
import Link from 'next/link';
import { generateMetadata as generateSocialMetadata } from '@/lib/metadata-generator';
import { JsonLd } from '@/components/JsonLd';
import { CANONICAL } from '@/config/canonical';
import {
  buildWebPage,
  buildBreadcrumbList,
  buildOfferCatalog,
  buildPriceSpecification,
} from '@/lib/schema-generator';
import CTABlock from '@/components/scram/CTABlock';
import ProblemMirror from '@/components/scram/ProblemMirror';
import { STANDARD_CTA, AHREFS_PROOF } from '@/lib/proof-data';

export const metadata: Metadata = generateSocialMetadata({
  pageType: 'general',
  content: {
    title: 'Pricing for Nantwich and Crewe Businesses',
    description: 'Websites from £300. Google Ads from £150/month. Every price listed. Based in Nantwich, working with trades and local services across Nantwich and Crewe.',
  },
  canonicalPath: '/pricing/',
});

const siteUrl = (path: string) => `${CANONICAL.urls.site}${path}`;

const pricingSchemas = [
  buildWebPage({
    name: 'Pricing - Vivid Media Cheshire',
    description:
      'You should not have to chase someone for a price. Websites from £300, Google Ads from £150 per month. Every price listed here so Nantwich and Crewe trades and local services know the cost before picking up the phone.',
    url: siteUrl(CANONICAL.routes.pricing),
  }),
  buildBreadcrumbList([
    { name: 'Home', url: siteUrl(CANONICAL.routes.home) },
    { name: 'Pricing', url: siteUrl(CANONICAL.routes.pricing) },
  ]),
  buildPriceSpecification({
    price: '300',
    description:
      'Your business needs enquiries, not just a website. One page built to turn visitors into calls for trades and local services in Nantwich and Crewe. Starts at £300.',
  }),
  buildOfferCatalog([
    {
      name: 'Conversion Landing Page',
      description:
        'Nobody contacts you because your page is slow and confusing. One page that loads fast, shows up in local search, and turns visitors into calls.',
      price: '300',
    },
    {
      name: 'Small Business Website',
      description:
        'Your current site sits there doing nothing. A multi-page website that brings in enquiries. 5 to 7 core pages for businesses that have outgrown what they have.',
      price: '750',
    },
    {
      name: 'Content-Heavy Website',
      description:
        'Visitors get lost on big sites. 15 to 30+ pages structured so people find what they need without thinking. For businesses with multiple services, case studies, or portfolios.',
      price: '1200',
    },
    {
      name: 'Website Hosting',
      description:
        'Your site is slow and your current host does not help. I move it without downtime, back it up daily, and fix problems the same day.',
      price: '15',
    },
    {
      name: 'Google Ads Setup',
      description:
        'You are spending money on ads but the wrong people click. I set up campaigns so your budget reaches people who actually need what you sell.',
      price: '90',
    },
    {
      name: 'Google Ads Management',
      description:
        'Your ads run but you have no idea what is working. I review campaigns monthly, cut what wastes money, and send a report you can actually read.',
      price: '150',
    },
    {
      name: 'Social and Maps Management',
      description:
        'Your business disappears online between posts. I keep your social profiles and Google Maps listing active so customers find you when they search.',
      price: '250',
    },
    {
      name: 'Google Business Profile Setup',
      description:
        'People search for your type of business near Nantwich and Crewe but you do not show up. I set up your Google Business Profile so you appear in local results.',
      price: '75',
    },
    {
      name: 'GA4 Setup',
      description:
        'You have no idea where your visitors come from or what they do on your site. I set up Google Analytics 4 so you see the numbers that matter.',
      price: '75',
    },
    {
      name: 'Looker Studio Dashboard',
      description:
        'Your marketing numbers are scattered across tools you never check. One dashboard that shows what is working in plain language.',
      price: '80',
    },
    {
      name: 'Photography',
      description:
        'Stock photos make your business look like everyone else. I shoot real images of your work so customers trust what they see on your site.',
      price: '150',
    },
    {
      name: 'Maps Boost',
      description:
        'People search near you but your listing is buried or missing. I fix your Google Maps presence so you show up in Nantwich and Crewe.',
      price: '50',
    },
    {
      name: 'SEO Tune-Up',
      description:
        'Google is not ranking your site and you do not know why. I check it top to bottom and fix what is holding it back.',
      price: '100',
    },
    {
      name: 'Monthly SEO',
      description:
        'You ranked once but now you are slipping. Ongoing work to keep your site visible in local search results month after month.',
      price: '50',
    },
  ]),
];

export default function PricingPage() {
  return (
    <Layout pageTitle="Pricing">
      <JsonLd schemas={pricingSchemas} />
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="bg-gray-50 py-16 md:py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight mb-4">
              Most websites do not need a small tweak. They need fixing.
            </h1>
            <p className="text-xl md:text-2xl text-slate-700 mb-4 max-w-3xl mx-auto font-medium">
              Most projects fall between £300 and £1,200. Every price is listed here.
            </p>
            <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
              Based in Nantwich. I work with trades and local services across Nantwich and Crewe.
            </p>
            <Link
              href="/contact/"
              className="inline-flex items-center justify-center px-8 py-3 rounded-lg text-base md:text-lg font-semibold bg-brand-pink text-white shadow-lg hover:bg-brand-pink2 transition-colors min-w-[44px] min-h-[44px]"
            >
              Send me your website
            </Link>
          </div>
        </section>

        {/* ProblemMirror */}
        <div className="max-w-3xl mx-auto px-4">
          <ProblemMirror
            statement="I do not want to waste time talking to someone only to find out it costs too much"
            followUp="Every price is on this page. Read it first. Then decide."
          />
        </div>

        {/* Who this is for / NOT for */}
        <section className="py-12 md:py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Who this is for</h2>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>Trades and local services in Nantwich and Crewe that need more enquiries</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>Small businesses with a website that is not bringing in work</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>Business owners who want to deal directly with the person doing the work</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>Anyone who wants to see the price before picking up the phone</span>
                  </li>
                </ul>
              </div>
              <div className="bg-red-50 rounded-2xl p-6 border border-red-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Who this is NOT for</h2>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">✗</span>
                    <span>Large enterprise websites needing a full development team</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">✗</span>
                    <span>Businesses looking for agency-scale teams with account managers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">✗</span>
                    <span>E-commerce platforms with thousands of products</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">✗</span>
                    <span>Projects that need 24/7 on-call support from a large team</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Website Design & Hosting — Core Services */}
        <section className="py-12 md:py-16 bg-gray-50 border-t-4 border-brand-pink">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-2">
              <span className="inline-block text-sm font-semibold text-brand-pink uppercase tracking-wide">Core services</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Website Design and Hosting</h2>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Conversion Landing Page, from £300</h3>
                <p className="text-lg text-gray-700 mb-4">
                  One page. Built to turn visitors into calls and enquiries.
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Loads fast on phones. People stay longer.</li>
                  <li>Shows up when people search in your area</li>
                  <li>One clear action on the page. Visitors know what to do.</li>
                </ul>
                <p className="text-sm text-gray-600 mt-4 font-medium">
                  For trades and local services in Nantwich and Crewe that need enquiries from Google or Google Ads.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Small Business Website, from £750</h3>
                <p className="text-lg text-gray-700 mb-4">
                  A multi-page website that brings in enquiries instead of sitting there.
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>5 to 7 core pages</li>
                  <li>Looks like your business, not a template</li>
                  <li>You can update it yourself</li>
                </ul>
                <p className="text-sm text-gray-600 mt-4 font-medium">
                  For small businesses that have outgrown their current site.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Content-Heavy Website, from £1,200</h3>
                <p className="text-lg text-gray-700 mb-4">
                  For businesses with multiple services, case studies, or portfolios.
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>15 to 30+ pages</li>
                  <li>Visitors find what they need without thinking</li>
                  <li>Built so Google understands every page</li>
                </ul>
                <p className="text-sm text-gray-600 mt-4 font-medium">
                  For agencies, event companies, and businesses using content to grow.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Website Hosting, £15/month or £120/year</h3>
                <p className="text-lg text-gray-700 mb-4">
                  Fast hosting with same-day support from me directly.
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Your site moves without going offline</li>
                  <li>Automatic backups every day</li>
                  <li>I monitor it around the clock</li>
                </ul>
              </div>
            </div>

            <div className="mt-8 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
              <p className="text-gray-700 italic">
                Prices depend on structure and complexity. £300 applies to single-page landing pages only.
              </p>
            </div>

            <p className="mt-4 text-sm text-slate-500">
              {AHREFS_PROOF.copySnippets.veryShort}
            </p>
          </div>
        </section>

        {/* Google Ads Campaigns */}
        <section className="py-12 md:py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Google Ads Campaigns</h2>

            <div className="space-y-6">
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Google Ads Setup, £90 one-time</h3>
                <p className="text-lg text-gray-700 mb-4">
                  I set up your campaigns so your ad spend reaches the right people from day one.
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>More clicks from the people you actually want</li>
                  <li>Every pound of ad spend tracked and reported</li>
                  <li>No long contracts</li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Google Ads Management, from £150/month</h3>
                <p className="text-lg text-gray-700 mb-4">
                  I review your campaigns every month and cut what is not working.
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Regular performance reviews</li>
                  <li>Budget adjusted to what converts</li>
                  <li>Clear monthly report you can actually read</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Social Media & Google Maps */}
        <section className="py-12 md:py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Social Media and Google Maps</h2>

            <div className="space-y-6">
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Social and Maps Management, from £250/month</h3>
                <p className="text-lg text-gray-700 mb-4">
                  I keep your business visible on social platforms and Google Maps.
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Regular content posted for you</li>
                  <li>Google Business Profile kept up to date</li>
                  <li>Reviews managed and responded to</li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Google Business Profile Setup, £75 one-time</h3>
                <p className="text-lg text-gray-700">
                  I set up your Google Business Profile so you show up in local searches across Nantwich and Crewe.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Data Analytics */}
        <section className="py-12 md:py-16 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Data Analytics and Insights</h2>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-3">GA4 Setup, £75 one-time</h3>
                <p className="text-lg text-gray-700">
                  I set up Google Analytics 4 so you can see where visitors come from and what they do.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Looker Studio Dashboard, from £80 one-time</h3>
                <p className="text-lg text-gray-700">
                  A dashboard that shows your numbers in plain language. No guessing.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Monthly Analytics Reports</h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Basic: £40/month</li>
                  <li>Standard: £75/month</li>
                  <li>Premium: £120/month</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Photography */}
        <section className="py-12 md:py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Photography</h2>

            <div className="space-y-6">
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Photography, from £150 per project</h3>
                <p className="text-lg text-gray-700 mb-4">
                  Real images of your work. Customers trust what they can see.
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Shot and edited by me</li>
                  <li>Ready to use on your website and social media</li>
                  <li>Delivered within five working days</li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Travel, £0.45 per mile</h3>
                <p className="text-lg text-gray-700">
                  Standard mileage rate for travel to your location across Nantwich and Crewe.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Local SEO Add-Ons */}
        <section className="py-12 md:py-16 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Local SEO Add-Ons</h2>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Maps Boost, £50 one-time</h3>
                <p className="text-lg text-gray-700">
                  I fix your Google Maps listing so you show up when people search near Nantwich and Crewe.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-3">SEO Tune-Up, £100 one-time</h3>
                <p className="text-lg text-gray-700">
                  I check your site top to bottom and fix what is stopping Google from ranking it.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Monthly SEO, £50/month</h3>
                <p className="text-lg text-gray-700">
                  Ongoing work to keep your site visible in local search results.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* End-of-page CTA */}
        <CTABlock
          heading="Send me your website. I will tell you what it needs."
          body="Describe your project. I send a clear price the same day."
          primaryLabel={STANDARD_CTA.primaryLabel}
          primaryHref={STANDARD_CTA.primaryHref}
          secondaryLabel={STANDARD_CTA.secondaryLabel}
          secondaryHref={STANDARD_CTA.secondaryHref}
          variant="end-of-page"
        />
      </div>
    </Layout>
  );
}
