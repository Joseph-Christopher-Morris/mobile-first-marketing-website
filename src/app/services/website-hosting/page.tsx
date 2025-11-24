import { Metadata } from 'next';
import Image from 'next/image';
import EnhancedCTA from '@/components/services/EnhancedCTA';
import { Layout } from '@/components/layout';

export const metadata: Metadata = {
  title: 'Fast, Reliable Website Hosting and Setup for Small Businesses | Vivid Media Cheshire',
  description: 'Affordable secure cloud hosting designed for performance, reliability, and easy scalability - perfect for growing brands and new websites.',
  keywords: 'website hosting Cheshire, secure cloud website migration, fast website builder, small business hosting, global content delivery network hosting',
};

export default function WebsiteHostingPage() {
  return (
    <Layout>
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-pink-50 to-purple-50 py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-centre">
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                  Fast, Reliable Website Hosting and Setup for Small Businesses
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                  Make your website load 82 percent faster with reliable hosting and transparent annual pricing. I handle the setup, migration, and support so you can focus on running your business.
                </p>
                <EnhancedCTA
                  href="#contact-form"
                  variant="primary"
                >
                  Get Hosting Quote
                </EnhancedCTA>
              </div>
              <div className="relative">
                <Image
                  src="/images/services/web-hosting-and-migration/hosting-migration-card.webp"
                  alt="Website hosting and migration for small businesses in Cheshire"
                  width={600}
                  height={400}
                  className="rounded-2xl shadow-lg"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* Core Pitch Section */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-centre mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">The Core Pitch</h2>
            </div>
            <div className="prose prose-lg mx-auto text-gray-700">
              <p className="text-xl leading-relaxed mb-6">
                My hosting and website setups use secure cloud infrastructure, the same enterprise technology powering leading brands. I combine technical expertise, modern design, and analytics skills to create websites that load fast, perform reliably, and scale easily with your business.
              </p>
              <p className="text-xl leading-relaxed mb-6">
                Each website I host is part of a modular framework, making it simple to adapt pages and layouts for ad campaigns, seasonal offers, or new services without rebuilding everything from scratch.
              </p>
              <p className="text-xl leading-relaxed">
                Using Kiro, my AI-assisted workflow system, I streamline development and updates to save time and reduce costs for clients, while keeping quality and performance high.
              </p>
            </div>
          </div>
        </section>

        {/* Hosting Highlights */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-centre mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Hosting Highlights</h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm">
                <div className="text-3xl mb-4">⚡</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Instant Speed Boost</h3>
                <p className="text-gray-600">
                  Faster load times mean more visitors stay, more calls come in, and better results from Google Ads and SEO.
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm">
                <div className="text-3xl mb-4">🔒</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">No Tech Stress</h3>
                <p className="text-gray-600">
                  I manage setup, security, and updates with no need for you to learn a new system.
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm">
                <div className="text-3xl mb-4">🔧</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Scalable & Modular</h3>
                <p className="text-gray-600">
                  Add landing pages, new features, or ad campaign sections easily, all built to evolve with your business.
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm">
                <div className="text-3xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">SEO & Analytics Ready</h3>
                <p className="text-gray-600">
                  optimised for Google Lighthouse performance and set up for GA4 tracking from launch.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Performance Example */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-centre mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Real Performance Example</h2>
              <p className="text-gray-600">
                Results measured with Google Lighthouse for my automotive photography site after migrating to secure cloud.
              </p>
            </div>

            {/* Before/After Screenshots */}
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="text-centre">
                <h3 className="text-xl font-semibold text-red-600 mb-4">Before Migration</h3>
                <div className="bg-red-50 p-4 rounded-2xl">
                  <Image
                    src="/images/services/Web Hosting And Migration/before-hosting-performance.webp"
                    alt="Website performance before secure cloud migration showing poor Lighthouse scores"
                    width={500}
                    height={300}
                    className="rounded-lg shadow-md mx-auto"
                  />
                  <p className="text-sm text-red-700 mt-3">Poor performance scores and slow loading times</p>
                </div>
              </div>
              <div className="text-centre">
                <h3 className="text-xl font-semibold text-green-600 mb-4">After Migration</h3>
                <div className="bg-green-50 p-4 rounded-2xl">
                  <Image
                    src="/images/services/Web Hosting And Migration/pagespeed-aws-migration-desktop.webp"
                    alt="Website performance after secure cloud migration showing excellent Lighthouse scores"
                    width={500}
                    height={300}
                    className="rounded-lg shadow-md mx-auto"
                  />
                  <p className="text-sm text-green-700 mt-3">Excellent performance scores and fast loading</p>
                </div>
              </div>
            </div>

            {/* Performance Metrics Table */}
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-8">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Metric</th>
                      <th className="text-centre py-3 px-4 font-semibold text-gray-900">Before Migration</th>
                      <th className="text-centre py-3 px-4 font-semibold text-gray-900">After Migration</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 text-gray-700">Performance Score (Mobile)</td>
                      <td className="py-3 px-4 text-centre text-red-600 font-semibold">56/100</td>
                      <td className="py-3 px-4 text-centre text-green-600 font-semibold">99/100</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-gray-700">Load Time</td>
                      <td className="py-3 px-4 text-centre text-red-600 font-semibold">14+ seconds</td>
                      <td className="py-3 px-4 text-centre text-green-600 font-semibold">Under 2 seconds</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-centre mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-centre">
                <div className="bg-pink-100 w-16 h-16 rounded-full flex items-centre justify-centre mx-auto mb-4">
                  <span className="text-2xl font-bold text-pink-600">1</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Discovery & Planning</h3>
                <p className="text-gray-600">
                  I review your current setup and goals, then recommend the right hosting approach.
                </p>
              </div>
              <div className="text-centre">
                <div className="bg-pink-100 w-16 h-16 rounded-full flex items-centre justify-centre mx-auto mb-4">
                  <span className="text-2xl font-bold text-pink-600">2</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Migration or Setup</h3>
                <p className="text-gray-600">
                  Your website is configured on secure cloud with minimal downtime.
                </p>
              </div>
              <div className="text-centre">
                <div className="bg-pink-100 w-16 h-16 rounded-full flex items-centre justify-centre mx-auto mb-4">
                  <span className="text-2xl font-bold text-pink-600">3</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">optimisation & Support</h3>
                <p className="text-gray-600">
                  I monitor performance and help with updates, SEO tweaks, or design improvements.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-centre mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            </div>
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  How much does hosting cost?
                </h3>
                <p className="text-gray-700">
                  Website hosting is £15 per month or £120 per year when paid annually. This includes secure hosting, monitoring, backups and personal support.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Will this help my Google Ads or SEO?
                </h3>
                <p className="text-gray-700">
                  Yes. Faster load times and a clean setup normally improve quality scores for Google Ads and help your site perform better in organic search, which means better value from your marketing spend.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Do I need to understand hosting or servers?
                </h3>
                <p className="text-gray-700">
                  No. I handle the technical setup, monitoring and ongoing care, and explain everything in clear, straightforward language so you never need to deal with hosting dashboards or server settings.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  What happens if something goes wrong with my site?
                </h3>
                <p className="text-gray-700">
                  You contact me directly. I investigate the issue, restore from a backup if required and explain what happened in plain English. The focus is getting you back online quickly and preventing repeat issues.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Can you host a site that is already built?
                </h3>
                <p className="text-gray-700">
                  Yes. I can review your existing website and check how it is built. If a direct migration is possible, I will move it safely. If a rebuild is better long term, I will explain why and provide a clear written plan before any work begins.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section id="contact-form" className="py-16 bg-gray-50">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-centre mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Get a Website Hosting or Build Quote</h2>
              <p className="text-gray-600">
                Tell me a bit about your current website or the one you would like to build, and I will get back to you personally the same day with ideas and next steps.
              </p>
            </div>

            <form
              action="https://formspree.io/f/xpwaqjqr"
              method="POST"
              className="space-y-6 bg-gray-50 p-8 rounded-2xl shadow-sm"
            >
              <input type="hidden" name="_redirect" value="https://vividmediacheshire.com/thank-you" />
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="_replyto"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  UK Mobile Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  pattern="[0-9\s\+\-\(\)]+"
                  placeholder="07XXX XXXXXX"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-2">
                  Service Interest
                </label>
                <select
                  id="service"
                  name="service"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option>Website Hosting & Migration</option>
                  <option>Website Design & Development</option>
                  <option>Ad Campaign Integration</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Project Details *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Tell me about your website, hosting, or goals..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-pink-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-pink-700 transition-colours duration-200"
              >
                Send Hosting Enquiry
              </button>

              <div className="mt-4 text-sm text-slate-500 text-centre">
                <p><strong>Hours (UK time)</strong></p>
                <p>Monday to Friday: 09:00 to 18:00</p>
                <p>Saturday: 10:00 to 14:00</p>
                <p>Sunday: 10:00 to 16:00</p>
                <p>I personally reply to all enquiries the same day during these hours.</p>
              </div>

              <p className="text-sm text-gray-500 text-centre mt-4">
                This form is powered by Formspree. By submitting, you agree to be contacted about your enquiry.
              </p>
            </form>
          </div>
        </section>
      </div>
    </Layout>
  );
}
