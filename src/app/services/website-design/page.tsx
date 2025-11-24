import Image from "next/image";
import Link from "next/link";
import { StickyWebsiteQuoteBar } from "@/components/ui/StickyWebsiteQuoteBar";
import { Layout } from "@/components/layout";
import { ServiceSchemas } from "@/components/seo/ServiceSchema";

export const metadata = {
  title: "Website Design and Development for Cheshire Businesses | Fast, SEO-ready Websites on secure cloud infrastructure",
  description:
    "Mobile-first websites built with secure cloud infrastructure for speed, SEO, and adaptability. Designed to grow with your business and future ad campaigns.",
};

export default function WebsiteDesignPage() {
  return (
    <Layout>
      {/* Service Schema - Spec requirement: Structured Data */}
      {ServiceSchemas.WebsiteDesign()}
      <main className="bg-slate-50 pb-24 md:pb-0">
      {/* Hero & Intro Section */}
      <section className="max-w-5xl mx-auto px-4 pt-10 pb-12">
        <div className="grid gap-8 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] items-centre">
          <div>
            <p className="text-sm font-semibold tracking-wide text-pink-600 uppercase mb-2">
              Website Design & Development
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Website Design & Development for Cheshire Businesses
            </h1>
            <p className="text-lg text-slate-700 mb-6">
              Mobile-first websites on secure cloud infrastructure that are fast, SEO-ready, and built to grow with your business and future ad campaigns. Designed to make it easier for customers to find you and get in touch.
            </p>

            <Link
              href="#website-quote"
              className="inline-flex items-centre justify-centre rounded-full bg-pink-600 px-8 py-4 text-base font-semibold text-white shadow-md hover:bg-pink-700 transition-colours mb-2"
            >
              Get a Free Website Quote →
            </Link>

            <p className="text-sm text-slate-600 mb-4">
              Takes about 60 seconds with no obligation
            </p>

            {/* Local Trust Strip */}
            <div className="inline-flex flex-wrap items-centre gap-2 text-sm text-slate-600 bg-slate-50 px-4 py-2 rounded-full border border-slate-200">
              <span className="flex items-centre gap-1">
                <svg className="w-4 h-4 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                Based in Nantwich
              </span>
              <span className="text-slate-400">•</span>
              <span>Serving Cheshire East</span>
              <span className="text-slate-400">•</span>
              <span>Reply same day</span>
            </div>
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

      {/* Who This Is For */}
      <section className="max-w-5xl mx-auto px-4 pb-12">
        <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-6 md:p-8 mb-12">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4 text-centre">
            Who this is for
          </h2>
          <div className="max-w-3xl mx-auto space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-pink-600 text-xl mt-1">✓</span>
              <p className="text-slate-700">
                <strong>Trades</strong> (plumbers, builders, garages) needing more enquiries from local customers
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-pink-600 text-xl mt-1">✓</span>
              <p className="text-slate-700">
                <strong>Local venues and service SMEs</strong> wanting a better online presence that actually brings in business
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-pink-600 text-xl mt-1">✓</span>
              <p className="text-slate-700">
                <strong>Businesses frustrated with slow Wix or outdated sites</strong> that don't convert visitors into customers
              </p>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-slate-900 mb-8 text-centre">
          Why Businesses Choose Vivid Media Cheshire
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="bg-white rounded-2xl p-6 shadow-sm text-centre">
            <div className="text-3xl mb-4">⚙️</div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Built on secure cloud infrastructure
            </h3>
            <p className="text-slate-700 text-sm">
              Reliable hosting and faster load times that help visitors stay on your site.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm text-centre">
            <div className="text-3xl mb-4">🧩</div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Modular Framework
            </h3>
            <p className="text-slate-700 text-sm">
              Easy to update as your offers or services change.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm text-centre">
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

      {/* WCAG 2.1 Accessibility Standards */}
      <section className="max-w-5xl mx-auto px-4 pb-12">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4 text-centre">
            Built to WCAG 2.1 Accessibility Standards
          </h2>
          <p className="text-slate-700 mb-6 text-centre max-w-3xl mx-auto">
            Every website I build follows WCAG 2.1 Level AA accessibility guidelines, ensuring your site works for everyone, including people with disabilities. This is not just good practice. It is better for SEO, user experience, and legal compliance.
          </p>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-3 flex items-centre gap-2">
                <span className="text-blue-600">✓</span>
                Keyboard Navigation
              </h3>
              <p className="text-sm text-slate-700">
                All interactive elements work with keyboard-only navigation, helping users who can't use a mouse.
              </p>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-3 flex items-centre gap-2">
                <span className="text-blue-600">✓</span>
                Screen Reader Compatible
              </h3>
              <p className="text-sm text-slate-700">
                Proper semantic HTML and ARIA labels ensure screen readers can navigate and understand your content.
              </p>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-3 flex items-centre gap-2">
                <span className="text-blue-600">✓</span>
                Colour Contrast Compliance
              </h3>
              <p className="text-sm text-slate-700">
                Text and interactive elements meet WCAG AA contrast ratios (4.5:1 for normal text, 3:1 for large text).
              </p>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-3 flex items-centre gap-2">
                <span className="text-blue-600">✓</span>
                Responsive Text Sizing
              </h3>
              <p className="text-sm text-slate-700">
                Text can be resized up to 200% without breaking layout or losing functionality.
              </p>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-3 flex items-centre gap-2">
                <span className="text-blue-600">✓</span>
                Focus Indicators
              </h3>
              <p className="text-sm text-slate-700">
                Clear visual indicators show which element is focused, making navigation easier for keyboard users.
              </p>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-3 flex items-centre gap-2">
                <span className="text-blue-600">✓</span>
                Alternative Text for Images
              </h3>
              <p className="text-sm text-slate-700">
                All images include descriptive alt text so screen reader users understand visual content.
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-white rounded-lg border-l-4 border-blue-600">
            <p className="text-sm text-slate-700">
              <strong>Why this matters:</strong> Accessible websites reach more customers, rank better in search engines, and reduce legal risk. Plus, many accessibility improvements (like clear navigation and readable text) benefit all users, not just those with disabilities.
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
              SEO-ready
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
            <p className="text-slate-700 text-sm mb-3">
              Layouts are shaped by real metrics and experience, not guesswork.
            </p>
            <p className="text-slate-700 text-sm">
              Every design decision is guided by conversion optimisation. From layout and navigation to page speed and clear calls-to-action, each website is built to attract visitors and turn them into customers.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="text-2xl mb-3">🔍</div>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              Microsoft Clarity Insights
            </h2>
            <p className="text-slate-700 text-sm">
              I use Microsoft Clarity to analyse how visitors interact with your site, including scroll depth, click behaviour and areas where people hesitate. These insights help me improve usability and support better conversion performance.
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
            <div className="flex items-centre text-sm text-slate-700">
              <span className="text-green-600 mr-2">✅</span>
              Better Google Ads landing page scores
            </div>
            <div className="flex items-centre text-sm text-slate-700">
              <span className="text-green-600 mr-2">✅</span>
              Improved visitor engagement
            </div>
            <div className="flex items-centre text-sm text-slate-700">
              <span className="text-green-600 mr-2">✅</span>
              Stronger organic SEO results
            </div>
          </div>
        </div>
      </section>

      {/* Process Section - Next Steps */}
      <section className="max-w-5xl mx-auto px-4 pb-12">
        <h2 className="text-2xl font-semibold text-slate-900 mb-6 text-centre">
          Your next steps
        </h2>
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-pink-100">
            <div className="w-9 h-9 rounded-full bg-pink-600 text-white flex items-centre justify-centre font-semibold mb-3">
              1
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">
              Free quote / call
            </h3>
            <p className="text-sm text-slate-700 mb-2">
              Tell me about your business and goals. I'll reply same day with a clear quote and realistic timeline.
            </p>
            <p className="text-xs text-slate-500">Usually within 2-4 hours</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-pink-100">
            <div className="w-9 h-9 rounded-full bg-pink-600 text-white flex items-centre justify-centre font-semibold mb-3">
              2
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">
              Design + build
            </h3>
            <p className="text-sm text-slate-700 mb-2">
              I'll create your site on secure cloud infrastructure with SEO, analytics, and conversion tracking built in.
            </p>
            <p className="text-xs text-slate-500">Typically 2-4 weeks</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-pink-100">
            <div className="w-9 h-9 rounded-full bg-pink-600 text-white flex items-centre justify-centre font-semibold mb-3">
              3
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">
              Launch + tracking
            </h3>
            <p className="text-sm text-slate-700 mb-2">
              Your site goes live with full analytics. I'll monitor performance and help you get more enquiries.
            </p>
            <p className="text-xs text-slate-500">Ongoing support included</p>
          </div>
        </div>

        <div className="text-centre bg-slate-50 rounded-xl p-6">
          <p className="text-slate-700 mb-2">
            <strong>Most Cheshire SME sites start from £300</strong>
          </p>
          <p className="text-sm text-slate-600">
            Every project is tailored to your specific needs. You will get a precise quote before any work begins
          </p>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="max-w-5xl mx-auto px-4 pb-12">
        <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-3xl p-6 md:p-8 shadow-sm">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6 text-centre">
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
                  Performance-focused
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

          <div className="text-centre">
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
          <div className="text-centre mb-8">
            <Link
              href="#website-quote"
              className="inline-flex items-centre justify-centre rounded-full bg-pink-600 px-8 py-4 text-base font-semibold text-white shadow-md hover:bg-pink-700 transition-colours mb-4"
            >
              Get a Free Website Quote
            </Link>
          </div>

          <div className="max-w-2xl mx-auto mb-6">
            <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-2 text-centre">
              Let's Design a Faster, Smarter Website Together
            </h2>
            <p className="text-slate-700 text-sm md:text-base text-centre">
              Ready to create a website that works as hard as you do? Tell me about your project and we can build something that drives real enquiries and repeat customers.
            </p>
          </div>

          {/* Form section */}
          <div className="bg-white rounded-2xl p-6 shadow-sm max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-slate-900 mb-2 text-centre">
              Quick Website Design Enquiry
            </h3>

            {/* Formspree form */}
            <form
              action="https://formspree.io/f/xpwaqjqr"
              method="POST"
              className="space-y-4"
            >
              <input type="hidden" name="_redirect" value="https://vividmediacheshire.com/thank-you" />
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
                className="w-full inline-flex items-centre justify-centre rounded-full bg-pink-600 px-8 py-3 text-sm font-semibold text-white shadow-md hover:bg-pink-700 transition-colours"
              >
                Get My Website Quote
              </button>

              <div className="mt-4 text-sm text-slate-500 text-centre">
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
