import { Metadata } from 'next';
import { Layout } from '@/components/layout';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Pricing | Vivid Media Cheshire',
  description:
    'Transparent pricing for websites, ads, analytics, and photography. Affordable packages for Cheshire small businesses.',
  keywords: [
    'website design Cheshire',
    'digital marketing Cheshire',
    'Google Ads management Nantwich',
    'AWS website hosting UK',
    'affordable marketing services Cheshire',
    'local SEO packages',
  ],
  alternates: { canonical: '/pricing' },
};

export default function PricingPage() {
  return (
    <Layout pageTitle="Pricing">
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
              Simple, transparent pricing. No jargon or hidden fees.
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              All services are built around clear results, affordability, and performance.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center bg-pink-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-pink-700 transition-colors"
            >
              Get My Free Quote →
            </Link>
          </div>
        </section>

        {/* Google Ads Campaigns */}
        <section className="py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">💡 Google Ads Campaigns</h2>

            <div className="space-y-6">
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Google Ads Setup – £20 one-time</h3>
                <p className="text-lg text-gray-700 mb-4">
                  Get your campaigns professionally set up, tracked, and optimised from the start.
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Improved click-through rates</li>
                  <li>Ad spend tracked and reported</li>
                  <li>No long contracts, just results</li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Google Ads Management – from £150 per month</h3>
                <p className="text-lg text-gray-700 mb-4">
                  Ongoing campaign management to maximise your ROI and reduce wasted spend.
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Regular performance reviews</li>
                  <li>Budget optimisation</li>
                  <li>Monthly reporting</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Website Design & Hosting */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">🌐 Website Design & Hosting</h2>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Website Design – from £300 per website</h3>
                <p className="text-lg text-gray-700 mb-4">
                  Mobile-first, fast-loading websites built on AWS infrastructure.
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Responsive design</li>
                  <li>SEO optimised</li>
                  <li>Performance focused</li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Website Hosting – £15 per month or £120 per year</h3>
                <p className="text-lg text-gray-700 mb-4">
                  AWS S3 + CloudFront hosting with 80% cost savings and 82% faster load times.
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Zero downtime migration</li>
                  <li>Automatic backups</li>
                  <li>24/7 monitoring</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Social Media & Google Maps */}
        <section className="py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">📱 Social Media & Google Maps Optimisation</h2>

            <div className="space-y-6">
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Social + Maps Management – from £250 per month</h3>
                <p className="text-lg text-gray-700 mb-4">
                  Keep your business visible and engaging across social platforms and Google Maps.
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Regular content posting</li>
                  <li>Google Business Profile optimisation</li>
                  <li>Review management</li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Google Business Profile Setup – £75 one-time</h3>
                <p className="text-lg text-gray-700">
                  Professional setup of your Google Business Profile for maximum local visibility.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Data Analytics & Insights */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">📊 Data Analytics & Insights</h2>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-3">GA4 Setup – £75 one-time</h3>
                <p className="text-lg text-gray-700">
                  Complete Google Analytics 4 setup with custom events and conversion tracking.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Looker Studio Dashboard – from £80 one-time</h3>
                <p className="text-lg text-gray-700">
                  Custom data visualisation dashboards that make your metrics easy to understand.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Monthly Analytics Reports</h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li><strong>Basic:</strong> £40 per month</li>
                  <li><strong>Standard:</strong> £75 per month</li>
                  <li><strong>Premium:</strong> £120 per month</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Photography Services */}
        <section className="py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">📸 Photography Services</h2>

            <div className="space-y-6">
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Event Photography – from £200 per day</h3>
                <p className="text-lg text-gray-700 mb-4">
                  Professional photography for events, commercial projects, and editorial work.
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>High-quality images</li>
                  <li>Professional editing</li>
                  <li>Fast turnaround</li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Travel – £0.45 per mile</h3>
                <p className="text-lg text-gray-700">
                  Standard mileage rate for travel to your location.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Local SEO Add-Ons */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">🔍 Local SEO & Optimisation Add-Ons</h2>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Maps Boost – £50 one-time</h3>
                <p className="text-lg text-gray-700">
                  Optimise your Google Maps presence for better local search visibility.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-3">SEO Tune-Up – £100 one-time</h3>
                <p className="text-lg text-gray-700">
                  Comprehensive SEO audit and optimisation for your website.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Monthly SEO – £50 per month</h3>
                <p className="text-lg text-gray-700">
                  Ongoing SEO maintenance and content optimisation.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Why Businesses in Cheshire Choose Vivid Media Cheshire
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">✅ No Hidden Fees</h3>
                <p className="text-gray-700">
                  Every price is clear and upfront. No surprises.
                </p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">✅ Local Support</h3>
                <p className="text-gray-700">
                  Based in Nantwich, serving businesses across Cheshire.
                </p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">✅ Proven Results</h3>
                <p className="text-gray-700">
                  Real case studies showing 2,470% ROI and 82% faster load times.
                </p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">✅ Flexible Packages</h3>
                <p className="text-gray-700">
                  Mix and match services to fit your budget and goals.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 bg-gradient-to-r from-pink-50 to-purple-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Get a Fast, Free Quote
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Tell me what you need – hosting, ads, analytics, or photography – and I'll reply personally within 24 hours.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center bg-pink-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-pink-700 transition-colors shadow-lg hover:shadow-xl"
            >
              Get My Free Quote →
            </Link>
            <p className="mt-4 text-gray-600">
              No obligation. No jargon. Just clear answers and results that help your business grow.
            </p>
          </div>
        </section>
      </div>
    </Layout>
  );
}
