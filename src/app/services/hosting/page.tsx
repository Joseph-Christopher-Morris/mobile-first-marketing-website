import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Layout } from "@/components/layout";
import { ServiceInquiryForm } from "@/components/ServiceInquiryForm";
import { PerformanceComparison } from "@/components/sections/PerformanceComparison";
import { DualStickyCTA } from "@/components/DualStickyCTA";
import { HostingServiceCard } from "@/components/SimplifiedServiceCard";

export const metadata: Metadata = {
  title: "secure cloud Website Hosting & Migration Services | Reliable Performance | Nantwich & Cheshire",
  description:
    "Make your website load 82% faster with secure cloud hosting and transparent annual pricing. Professional website migration with zero downtime for Nantwich and Cheshire businesses.",
  keywords: [
    "secure cloud website hosting Cheshire",
    "website migration Nantwich",
    "fast website hosting",
    "website hosting migration",
    "secure cloud infrastructure hosting",
    "website speed optimization",
    "Nantwich web hosting",
    "transparent hosting pricing",
  ],
  alternates: { canonical: "/services/hosting" },
  openGraph: {
    title: "secure cloud Website Hosting & Migration Services | Reliable Performance",
    description:
      "Make your website load 82% faster with professional secure cloud hosting and migration services. Transparent annual pricing and reliable performance.",
    url: "/services/hosting",
    images: [
      {
        url: "/images/services/web-hosting-and-migration/hosting-migration-card.webp",
        width: 1200,
        height: 630,
        alt: "secure cloud website hosting and migration services showing performance improvements",
      },
    ],
  },
};

export default function HostingPage() {
  // JSON-LD schema for hosting services
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "secure cloud Website Hosting & Migration Services",
    description: "Professional secure cloud hosting and website migration services with reliable performance and 82% faster load times",
    provider: {
      "@type": "LocalBusiness",
      name: "Vivid Media Cheshire",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Nantwich",
        addressRegion: "Cheshire",
        addressCountry: "UK",
      },
      areaServed: ["Nantwich", "Cheshire", "Crewe", "North West England", "UK"],
    },
    serviceType: "Website Hosting and Migration",
    offers: {
      "@type": "Offer",
      description: "secure cloud hosting with transparent annual pricing and 82% faster load times",
      areaServed: "Nantwich & Cheshire",
    },
    "@graph": [
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "What is the cost of secure cloud hosting?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Our hosting offers reliable performance and transparent annual pricing at £120 per year, which includes secure cloud infrastructure, business domain, and professional email service.",
            },
          },
          {
            "@type": "Question",
            name: "Will my website be faster?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes, secure cloud hosting typically makes websites 82% faster. Faster pages mean more visitors stay, more calls come in, and better Google rankings.",
            },
          },
          {
            "@type": "Question",
            name: "Is there any downtime during migration?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "No, your site stays live while we migrate everything behind the scenes. The migration process has zero downtime.",
            },
          },
          {
            "@type": "Question",
            name: "Do I need technical knowledge?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Not at all. We manage the setup, security, and maintenance. You just enjoy the results - faster site, lower costs, better performance.",
            },
          },
        ],
      },
    ],
  };

  return (
    <Layout>
      <DualStickyCTA />
      <main className="bg-gray-50 py-16 md:py-20">
        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <section className="text-center mb-20">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight mb-6">
              Fast, Secure, and Transparent Hosting
            </h1>
            <p className="text-xl md:text-2xl text-slate-700 max-w-4xl mx-auto leading-relaxed mb-8">
              Professional migration and same-day support. Free consultation included for all new clients.
            </p>
            <p className="text-base md:text-lg text-slate-700 max-w-3xl mx-auto leading-relaxed mb-8">
              £120 per year with 99.9% uptime and local support. I personally reply to all enquiries the same day during business hours.
            </p>
            <p className="text-base md:text-lg text-slate-700 max-w-3xl mx-auto leading-relaxed mb-8">
              We handle everything. Set up, migration, and support, so you can focus on running your business.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="tel:+447123456789"
                className="inline-flex items-center justify-center px-8 py-3 rounded-full text-base md:text-lg font-semibold bg-brand-pink text-white shadow-lg hover:bg-brand-pink2 hover:shadow-xl transition"
              >
                Call Joe
              </a>
              <a
                href="#contact"
                className="inline-flex items-center justify-center px-8 py-3 rounded-full text-base md:text-lg font-semibold bg-slate-900 text-white/90 hover:bg-black transition shadow-md hover:shadow-lg"
              >
                Get Hosting Quote
              </a>
            </div>
          </section>

          {/* Hero Image */}
          <section className="mb-20">
            <div className="relative h-[480px] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/images/services/web-hosting-and-migration/hosting-migration-card.webp"
                alt="secure cloud website hosting and migration services with reliable performance and 82% faster load times"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-8 left-8 text-white">
                <h2 className="text-3xl font-bold mb-2">secure cloud hosting Excellence</h2>
                <p className="text-xl">Professional migration with zero downtime</p>
              </div>
            </div>
          </section>

          {/* Simplified Service Card */}
          <section className="mb-20">
            <div className="max-w-md mx-auto">
              <HostingServiceCard />
            </div>
          </section>

          {/* Why Move to secure cloud hosting */}
          <section className="mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 text-center">
              Why Move to secure cloud hosting
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto mt-12">
              <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 flex flex-col">
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Enterprise Performance at DIY Prices</h3>
                <p className="text-sm md:text-base text-slate-700">
                  Wix Light costs £9 per month (£108 per year). My secure cloud hosting is similar in price but delivers enterprise-grade speed, better SEO, and personal support.
                </p>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 flex flex-col">
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Instant Speed Boost</h3>
                <p className="text-sm md:text-base text-slate-700">
                  Faster pages mean more visitors stay, more calls come in, and more sales happen.
                </p>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 flex flex-col">
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Zero Downtime</h3>
                <p className="text-sm md:text-base text-slate-700">
                  Your site stays live while we migrate everything behind the scenes.
                </p>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 flex flex-col">
                <h3 className="text-xl font-semibold text-slate-900 mb-3">No Tech Stress</h3>
                <p className="text-sm md:text-base text-slate-700">
                  We manage the setup, security, and maintenance. You enjoy the results.
                </p>
              </div>
            </div>
          </section>

          {/* Built for Local Businesses */}
          <section className="mb-20 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
              Built for Local Businesses & Trades
            </h2>
            <p className="text-xl text-gray-700 mb-8 text-center max-w-3xl mx-auto">
              Whether you run a café, garage, or trade service, your website should work as hard as you do.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-lg text-gray-700">A faster site that shows up higher on Google</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-lg text-gray-700">Lower running costs</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-lg text-gray-700">A trustworthy setup that never locks you in</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-lg text-gray-700">More leads from people who actually find you online</span>
              </div>
            </div>
          </section>

          {/* Real Results */}
          <section className="mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
              Real Results
            </h2>
            <div className="bg-white rounded-2xl p-8 shadow-lg max-w-4xl mx-auto text-center">
              <blockquote className="text-xl text-gray-700 leading-relaxed italic">
                "I cut hosting costs by over 80% and dropped our page load time from 14 seconds to under 2.
                Our Google ranking jumped almost immediately. Now I'm focusing on getting the same lift in Google results."
              </blockquote>
            </div>
          </section>

          {/* Before and After Performance */}
          <PerformanceComparison
            title="Real-World Speed Improvements"
            subtitle="I migrated my automotive photography site from traditional hosting to secure cloud hosting with global delivery. Here's how the numbers changed on mobile, measured with Google Lighthouse."
            beforeImage="/images/services/Web Hosting And Migration/before-hosting-performance.webp"
            afterImage="/images/services/Web Hosting And Migration/pagespeed-aws-migration-desktop.webp"
            beforeImageAlt="Website performance before secure cloud migration showing poor performance scores and slow load times"
            afterImageAlt="Google Lighthouse performance score of 99 after secure cloud migration showing 1.1s load time"
            beforeStats={{
              performanceScore: "Poor",
              annualCost: "£550",
              loadTime: "14+ seconds"
            }}
            afterStats={{
              performanceScore: "99/100",
              annualCost: "£108",
              loadTimeImprovement: "82% Faster"
            }}
            resultText="From 14 seconds to under 2 seconds load time"
          />

          {/* Hosting Pricing */}
          <section className="mb-16">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Hosting pricing
              </h2>
              <p className="text-gray-700 mb-1">
                <strong>Website hosting:</strong> £15 per month or £120 per year
              </p>
              <p className="text-gray-700 mb-3">
                <strong>Migration:</strong> free tailored quote based on your current setup
              </p>
              <p className="text-sm text-gray-500 mt-3">
                Full details are available on the{" "}
                <Link href="/pricing" className="text-pink-600 hover:text-pink-700 underline">
                  pricing page
                </Link>.
              </p>
            </div>
          </section>

          {/* Transparent Pricing */}
          <section className="mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
              Cost Comparison
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Wix Light: £9/month (£108/year)</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
                    <span>Shared servers with limited control</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
                    <span>Slower caching and SEO performance</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
                    <span>Support queue wait times</span>
                  </li>
                </ul>
              </div>
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-8">
                <h3 className="text-2xl font-bold text-green-800 mb-4">Vivid Media (secure cloud): £108/year</h3>
                <ul className="space-y-3 text-green-700">
                  <li className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>secure cloud infrastructure + protective caching and security layer (enterprise-grade)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>82% faster load times, better Google rankings</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>Direct access to me, managed locally in Cheshire</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* FAQs */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
            <div className="max-w-3xl mx-auto space-y-4">
              <details className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <summary className="font-semibold cursor-pointer text-lg">
                  How does your hosting compare to Wix or other DIY builders?
                </summary>
                <p className="mt-3 text-gray-700">
                  Wix's Light plan costs around £9 per month (£108 per year). It's fine for small personal sites, but it runs on shared servers with less control over caching, speed, and SEO. My hosting uses secure cloud infrastructure and protective caching and security layer — the same systems used by major global brands, but I manage everything locally here in Cheshire. That means your website loads faster, performs better in Google search, and you always speak directly to me instead of waiting in a support queue.
                </p>
              </details>

              <details className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <summary className="font-semibold cursor-pointer text-lg">
                  Will my website be faster?
                </summary>
                <p className="mt-3 text-gray-700">
                  Yes, secure cloud hosting typically makes websites 82% faster. Faster pages mean more visitors stay, more calls come in, and better Google rankings.
                </p>
              </details>

              <details className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <summary className="font-semibold cursor-pointer text-lg">
                  Is there any downtime during migration?
                </summary>
                <p className="mt-3 text-gray-700">
                  No, your site stays live while we migrate everything behind the scenes. The migration process has zero downtime.
                </p>
              </details>

              <details className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <summary className="font-semibold cursor-pointer text-lg">
                  Do I need technical knowledge?
                </summary>
                <p className="mt-3 text-gray-700">
                  Not at all. We manage the setup, security, and maintenance. You just enjoy the results - faster site, lower costs, better performance.
                </p>
              </details>
            </div>
          </section>

          {/* Hosting Pricing */}
          <section className="py-12">
            <div className="max-w-5xl mx-auto px-4">
              <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-3xl p-6 md:p-8 shadow-sm">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 text-center">
                  Website Hosting Pricing
                </h2>

                <div className="max-w-2xl mx-auto">
                  <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      secure cloud hosting with global delivery Hosting
                    </h3>
                    <p className="text-3xl font-bold text-pink-600 mb-2">
                      £15 <span className="text-base font-normal text-gray-600">per month</span>
                    </p>
                    <p className="text-lg text-gray-700 mb-4">
                      or £120 per year
                    </p>
                    <ul className="space-y-2 text-sm text-gray-700 text-left max-w-md mx-auto">
                      <li className="flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        Enterprise-grade secure cloud infrastructure + protective caching and security layer
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        82% faster load times vs traditional hosting
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        Zero downtime migration
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        Automatic backups included
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        Personal support, managed locally in Cheshire
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="text-center mt-6">
                  <p className="text-sm text-gray-600">
                    Professional migration service included. No hidden fees.
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Full details on the{" "}
                    <Link href="/pricing" className="text-pink-600 hover:text-pink-700 underline">
                      pricing page
                    </Link>.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="text-center bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-12 mx-4">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Ready for Faster, Smarter Hosting?
            </h2>
            <p className="text-base md:text-lg text-slate-700 mb-8 max-w-2xl mx-auto">
              Get a free migration quote today. I will assess your current setup, handle the migration,
              and have your new site running faster — all with zero downtime.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-3 rounded-full text-base md:text-lg font-semibold bg-brand-pink text-white shadow-lg hover:bg-brand-pink2 hover:shadow-xl transition"
            >
              Get My Free Website Hosting Quote
              <svg
                className="ml-2 w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
            <p className="mt-4 text-slate-700">
              No tech talk. Just honest savings and better performance.
            </p>
          </section>

          {/* Service Inquiry Form */}
          <section id="contact">
            <ServiceInquiryForm
              serviceName="Website Hosting & Migration"
              formspreeId="xpwaqjqr"
            />
          </section>
        </div>
      </main>
    </Layout>
  );
}
