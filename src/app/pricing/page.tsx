import { Metadata } from 'next';
import { Layout } from '@/components/layout';
import Link from 'next/link';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  intent: "Pricing",
  qualifier: "for Digital Marketing Services",
  description: "Transparent pricing for websites, hosting, Google Ads management, analytics dashboards, and photography across Cheshire.",
  canonicalPath: "/pricing/",
});

export default function PricingPage() {
  return (
    <Layout pageTitle="Pricing">
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="bg-gray-50 py-16 md:py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight mb-4">
              Simple, transparent pricing – no hidden fees.
            </h1>
            <p className="text-xl md:text-2xl text-slate-700 mb-8 max-w-3xl mx-auto font-medium">
              Every website is built for speed, clarity, and measurable results. You deal directly with me from start to finish.
            </p>
            <Link
              href="#contact"
              className="inline-flex items-center justify-center px-8 py-3 rounded-full text-base md:text-lg font-semibold bg-brand-pink text-white shadow-lg hover:bg-brand-pink2 hover:shadow-xl transition"
            >
              Get My Free Quote →
            </Link>
            <p className="mt-4 text-slate-700 text-lg">
              I reply personally the same day between 09:00 and 18:00.
            </p>
          </div>
        </section>

        {/* Google Ads Campaigns */}
        <section className="py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">💡 Google Ads Campaigns</h2>

            <div className="space-y-6">
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Google Ads Setup – £90 one-time</h3>
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
                  Optimised for conversions with clear monthly reports.
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
                <h3 className="text-xl font-bold text-gray-900 mb-3">Conversion Landing Page – from £300</h3>
                <p className="text-lg text-gray-700 mb-4">
                  A single-page website built to turn visitors into calls and enquiries.
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Mobile-first, responsive design</li>
                  <li>Speed and performance optimised</li>
                  <li>SEO-ready for local search</li>
                </ul>
                <p className="text-sm text-gray-600 mt-4 font-medium">
                  <strong>Who this is for:</strong> Trades and local services that need fast enquiries from Google or Google Ads.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Small Business Website – from £750</h3>
                <p className="text-lg text-gray-700 mb-4">
                  A professional multi-page website that forms the foundation of your business online.
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>5–7 core pages</li>
                  <li>Clean, modern design aligned to your brand</li>
                  <li>Easy content management</li>
                </ul>
                <p className="text-sm text-gray-600 mt-4 font-medium">
                  <strong>Who this is for:</strong> Small businesses that want a professional online presence with room to grow.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Content-Heavy Website – from £1,200</h3>
                <p className="text-lg text-gray-700 mb-4">
                  A scalable website designed for businesses with multiple services, content, or portfolios.
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>15–30+ pages</li>
                  <li>Structured navigation and page hierarchy</li>
                  <li>SEO foundations for long-term growth</li>
                </ul>
                <p className="text-sm text-gray-600 mt-4 font-medium">
                  <strong>Who this is for:</strong> Agencies, event companies, and businesses using content as a growth channel.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Website Hosting – £15 per month or £120 per year</h3>
                <p className="text-lg text-gray-700 mb-4">
                  Secure cloud hosting with personal same-day support.
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Zero downtime migration</li>
                  <li>Automatic backups</li>
                  <li>24/7 monitoring</li>
                </ul>
              </div>
            </div>

            {/* Global Pricing Clarifier */}
            <div className="mt-8 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
              <p className="text-gray-700 italic">
                <strong>Important:</strong> Prices depend on structure and complexity. The £300 price applies to single-page landing pages only.
              </p>
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
                <h3 className="text-xl font-bold text-gray-900 mb-3">Photography – from £150 per project</h3>
                <p className="text-lg text-gray-700 mb-4">
                  Professional coverage that helps clients trust your business.
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
        <section className="bg-gradient-to-r from-pink-50 to-purple-50 py-16 md:py-20" id="contact">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Get a Fast, Free Quote
            </h2>
            <p className="text-base md:text-lg text-slate-700 mb-4 max-w-2xl mx-auto">
              Tell me what you need and I'll reply personally the same day.
            </p>
            <p className="text-lg text-slate-700 mb-8 font-medium">
              I personally reply to all enquiries the same day between 09:00 and 18:00.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-3 rounded-full text-base md:text-lg font-semibold bg-brand-pink text-white shadow-lg hover:bg-brand-pink2 hover:shadow-xl transition"
            >
              Get My Free Quote →
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  );
}
