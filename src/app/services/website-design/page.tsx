import Image from "next/image";
import Link from "next/link";
import { StickyWebsiteQuoteBar } from "@/components/ui/StickyWebsiteQuoteBar";
import { Layout } from "@/components/layout";

export const metadata = {
  title: "Website Design and Development for Cheshire Businesses | Fast, SEO Ready Websites on secure cloud infrastructure",
  description:
    "Mobile-first websites built with secure cloud infrastructure for speed, SEO, and adaptability. Designed to grow with your business and future ad campaigns.",
};

export default function WebsiteDesignPage() {
  return (
    <Layout>
      <main className="bg-slate-50 pb-24 md:pb-0">
      {/* Hero & Intro Section */}
      <section className="max-w-5xl mx-auto px-4 pt-10 pb-12">
        <div className="grid gap-8 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] items-center">
          <div>
            <p className="text-sm font-semibold tracking-wide text-pink-600 uppercase mb-2">
              Website Design & Development
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Website Design & Development for Cheshire Businesses
            </h1>
            <p className="text-lg text-slate-700 mb-6">
              Mobile first websites on secure cloud infrastructure that are fast, SEO ready, and built to grow with your business and future ad campaigns. Designed to make it easier for customers to find you and get in touch.
            </p>

            <Link
              href="#website-quote"
              className="inline-flex items-center justify-center rounded-full bg-pink-600 px-8 py-4 text-base font-semibold text-white shadow-md hover:bg-pink-700 transition-colors mb-3"
            >
              Get a Free Website Quote →
            </Link>

            <p className="text-sm text-slate-600">
              No hidden fees. Every site is modular, fast, and tailored to your goals.
            </p>
          </div>

          {/* Featured image */}
          <div className="relative h-64 md:h-80 rounded-3xl overflow-hidden shadow-sm bg-slate-200">
            <Image
              src="/images/services/Website Design/PXL_20240222_004124044~2.webp"
              alt="Web designer working on a website design and hosting project"
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 480px, 100vw"
              priority
            />
          </div>
        </div>
      </section>

      {/* Why Businesses Choose Vivid Media Cheshire */}
      <section className="max-w-5xl mx-auto px-4 pb-12">
        <h2 className="text-2xl font-semibold text-slate-900 mb-8 text-center">
          Why Businesses Choose Vivid Media Cheshire
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
            <div className="text-3xl mb-4">⚙️</div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Built on secure cloud infrastructure
            </h3>
            <p className="text-slate-700 text-sm">
              Reliable hosting and faster load times that help visitors stay on your site.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
            <div className="text-3xl mb-4">🧩</div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Modular Framework
            </h3>
            <p className="text-slate-700 text-sm">
              Easy to update as your offers or services change.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
            <div className="text-3xl mb-4">⚡</div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Kiro Enhanced Workflow
            </h3>
            <p className="text-slate-700 text-sm">
              Your site is built and improved efficiently so you are not waiting around.
            </p>
          </div>
        </div>
      </section>

      {/* Core Feature blocks */}
      <section className="max-w-5xl mx-auto px-4 pb-12">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="text-2xl mb-3">⚡</div>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              Built for Speed
            </h2>
            <p className="text-slate-700 text-sm">
              Faster pages help more people complete forms or make enquiries.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="text-2xl mb-3">🔍</div>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              SEO Ready
            </h2>
            <p className="text-slate-700 text-sm">
              Clear structure helps the site appear for the right keywords in search.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="text-2xl mb-3">🎨</div>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              Custom Design
            </h2>
            <p className="text-slate-700 text-sm">
              Design is built around the existing brand and real customer questions.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="text-2xl mb-3">📈</div>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              Conversion Focused
            </h2>
            <p className="text-slate-700 text-sm">
              Layouts are shaped by real metrics and experience, not guesswork.
            </p>
          </div>
        </div>
      </section>

      {/* Real-World Performance Results */}
      <section className="max-w-5xl mx-auto px-4 pb-12">
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-900 mb-2">
            Real-World Performance Results
          </h2>
          <p className="text-slate-700 mb-6 text-sm md:text-base">
            Here is a real example from my own automotive photography website after moving to a custom design on secure cloud hosting and tuning it for mobile performance. Results were measured with Google Lighthouse on mobile.
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-rose-100 bg-rose-50 p-5">
              <p className="text-sm font-semibold text-rose-700 mb-3">
                Before: Slow & Expensive
              </p>

              {/* Before Screenshot */}
              <div className="mb-4 rounded-lg overflow-hidden">
                <Image
                  src="/images/services/before-hosting-performance.webp"
                  alt="Google Lighthouse performance score of 56 before secure cloud migration showing poor performance metrics"
                  width={400}
                  height={250}
                  className="w-full h-auto"
                />
              </div>

              <ul className="space-y-2 text-sm text-slate-800">
                <li>
                  <span className="font-semibold">Performance score:</span> 56 out of 100
                </li>
                <li>
                  <span className="font-semibold">Load time:</span> more than 14 seconds
                </li>
              </ul>
              <p className="mt-3 text-xs text-slate-600">
                The original website struggled with slow loading times and poor Lighthouse scores.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
              <p className="text-sm font-semibold text-emerald-700 mb-3">
                After: Fast & Affordable
              </p>

              {/* After Screenshot */}
              <div className="mb-4 rounded-lg overflow-hidden">
                <Image
                  src="/images/services/Web Hosting And Migration/pagespeed-aws-migration-desktop.webp"
                  alt="Google Lighthouse performance score of 99 after secure cloud migration showing excellent performance metrics"
                  width={400}
                  height={250}
                  className="w-full h-auto"
                />
              </div>

              <ul className="space-y-2 text-sm text-slate-800">
                <li>
                  <span className="font-semibold">Performance score:</span> 99 out of 100
                </li>
                <li>
                  <span className="font-semibold">Load time improvement:</span> 82% faster load time and 99/100 performance score
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <div className="flex items-center text-sm text-slate-700">
              <span className="text-green-600 mr-2">✅</span>
              Better Google Ads landing page scores
            </div>
            <div className="flex items-center text-sm text-slate-700">
              <span className="text-green-600 mr-2">✅</span>
              Improved visitor engagement
            </div>
            <div className="flex items-center text-sm text-slate-700">
              <span className="text-green-600 mr-2">✅</span>
              Stronger organic SEO results
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="max-w-5xl mx-auto px-4 pb-12">
        <h2 className="text-2xl font-semibold text-slate-900 mb-6">
          How I Build Your Website
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="w-9 h-9 rounded-full bg-pink-100 text-pink-700 flex items-center justify-center font-semibold mb-3">
              1
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">
              Discovery & Planning
            </h3>
            <p className="text-sm text-slate-700">
              We'll discuss your goals, audience, and ideas. I'll create a plan aligned with your business objectives.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="w-9 h-9 rounded-full bg-pink-100 text-pink-700 flex items-center justify-center font-semibold mb-3">
              2
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">
              Design & Development
            </h3>
            <p className="text-sm text-slate-700">
              Custom website built on secure cloud infrastructure, using modular components and SEO-friendly code.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="w-9 h-9 rounded-full bg-pink-100 text-pink-700 flex items-center justify-center font-semibold mb-3">
              3
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">
              Launch & Optimize
            </h3>
            <p className="text-sm text-slate-700">
              Once live, I'll set up analytics, test performance, and keep your site improving over time.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="max-w-5xl mx-auto px-4 pb-12">
        <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-3xl p-6 md:p-8 shadow-sm">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6 text-center">
            Website Design Pricing
          </h2>

          <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Website Design
              </h3>
              <p className="text-3xl font-bold text-pink-600 mb-4">
                from £300
              </p>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  Mobile-first responsive design
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  SEO optimised structure
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  Performance focused
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  Built on secure cloud infrastructure
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Website Hosting
              </h3>
              <p className="text-3xl font-bold text-pink-600 mb-4">
                £15/month
              </p>
              <p className="text-sm text-slate-600 mb-4">or £120 per year</p>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  secure cloud hosting with global delivery hosting
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  Transparent annual pricing
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  82% faster load times
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  Zero downtime migration
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-slate-600 mb-4">
              Every project is tailored to your specific needs and goals
            </p>
            <p className="text-sm text-gray-500">
              Full details on the{" "}
              <Link href="/pricing" className="text-pink-600 hover:text-pink-700 underline">
                pricing page
              </Link>.
            </p>
          </div>
        </div>
      </section>

      {/* CTA + Form */}
      <section
        id="website-quote"
        className="max-w-5xl mx-auto px-4 pb-16"
      >
        <div className="bg-gradient-to-br from-pink-50 via-white to-sky-50 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="text-center mb-8">
            <Link
              href="#website-quote"
              className="inline-flex items-center justify-center rounded-full bg-pink-600 px-8 py-4 text-base font-semibold text-white shadow-md hover:bg-pink-700 transition-colors mb-4"
            >
              Get a Free Website Quote
            </Link>
          </div>

          <div className="max-w-2xl mx-auto mb-6">
            <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-2 text-center">
              Let's Design a Faster, Smarter Website Together
            </h2>
            <p className="text-slate-700 text-sm md:text-base text-center">
              Ready to create a website that works as hard as you do? Tell me about your project and we can build something that drives real enquiries and repeat customers.
            </p>
          </div>

          {/* Form section */}
          <div className="bg-white rounded-2xl p-6 shadow-sm max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-slate-900 mb-2 text-center">
              Quick Website Design Enquiry
            </h3>

            {/* Formspree form */}
            <form
              action="https://formspree.io/f/xpwaqjqr"
              method="POST"
              className="space-y-4"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-slate-800">
                    Full Name *
                  </span>
                  <input
                    type="text"
                    name="name"
                    required
                    className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-800">
                    Email Address *
                  </span>
                  <input
                    type="email"
                    name="_replyto"
                    required
                    className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-medium text-slate-800">
                  UK Mobile Number *
                </span>
                <input
                  type="tel"
                  name="phone"
                  required
                  pattern="[0-9\s\+\-\(\)]+"
                  placeholder="07XXX XXXXXX"
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-800">
                  Tell me about your website goals *
                </span>
                <textarea
                  name="website_goals"
                  required
                  rows={3}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="What do you want your website to achieve for your business?"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-slate-800">
                    Budget range (optional)
                  </span>
                  <select
                    name="budget_range"
                    className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option>Under £1,000</option>
                    <option>£1,000 - £3,000</option>
                    <option>£3,000 - £5,000</option>
                    <option>£5,000+</option>
                    <option>Not sure yet</option>
                  </select>
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-800">
                    How soon would you like to start?
                  </span>
                  <select
                    name="timeline"
                    className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option>Within 1 week</option>
                    <option>1–2 weeks</option>
                    <option>This month</option>
                    <option>Just researching</option>
                  </select>
                </label>
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center rounded-full bg-pink-600 px-8 py-3 text-sm font-semibold text-white shadow-md hover:bg-pink-700 transition-colors"
              >
                Get My Website Quote
              </button>

              <div className="mt-4 text-sm text-slate-500 text-center">
                <p><strong>Hours (UK time)</strong></p>
                <p>Monday to Friday: 09:00 to 18:00</p>
                <p>Saturday: 10:00 to 14:00</p>
                <p>Sunday: 10:00 to 16:00</p>
                <p>I personally reply to all enquiries the same day during these hours.</p>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Sticky Mobile CTA */}
      <StickyWebsiteQuoteBar />
      </main>
    </Layout>
  );
}
