import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Layout } from "@/components/layout";
import { ServiceInquiryForm } from "@/components/ServiceInquiryForm";
import { DualStickyCTA } from "@/components/DualStickyCTA";
import { HostingServiceCard } from "@/components/SimplifiedServiceCard";
import { ServiceSchemas } from "@/components/seo/ServiceSchema";

export const metadata: Metadata = {
  title: "Fast, secure website hosting for Cheshire businesses | Vivid Media Cheshire",
  description:
    "From £120 per year with 99.9% uptime and local support. Professional migration, same day replies and zero downtime for Nantwich and Cheshire businesses.",
  keywords: [
    "website hosting Cheshire",
    "website migration Nantwich",
    "fast website hosting",
    "secure cloud hosting",
    "website speed optimisation",
    "Nantwich web hosting",
    "transparent hosting pricing",
  ],
  alternates: { canonical: "/services/hosting" },
  openGraph: {
    title: "Fast, secure website hosting for Cheshire businesses",
    description:
      "From £120 per year with 99.9% uptime and local support. Professional migration, same day replies and zero downtime.",
    url: "/services/hosting",
    images: [
      {
        url: "/images/services/web-hosting-and-migration/hosting-migration-card.webp",
        width: 1200,
        height: 630,
        alt: "Website hosting and migration services for Cheshire businesses",
      },
    ],
  },
};

export default function HostingPage() {
  // JSON-LD schema for hosting services
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Website Hosting & Migration Services",
    description: "Professional website hosting and migration services with reliable performance and zero downtime",
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
      description: "Website hosting from £120 per year with zero downtime migration",
      areaServed: "Nantwich & Cheshire",
    },
    "@graph": [
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "Will my website be faster?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "In most cases yes. Moving to secure cloud hosting with tuned caching and a good setup reduces load times significantly. Faster sites help visitors stay longer, view more pages and contact you with more confidence.",
            },
          },
          {
            "@type": "Question",
            name: "Is there any downtime during migration?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "The migration is planned to avoid downtime. Your current site stays live while the new hosting is set up and tested. The final switch is done when everything is ready so visitors do not see a broken site.",
            },
          },
          {
            "@type": "Question",
            name: "Do I need any technical knowledge?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "No. You do not need to manage servers, DNS records or configuration yourself. I manage the technical parts and keep you updated in clear language.",
            },
          },
          {
            "@type": "Question",
            name: "Can you help if I already have a website on another platform?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. I can review your current setup and advise whether a direct migration is possible, or whether a rebuild is a better long term choice. In each case you get a clear, written plan before any work begins.",
            },
          },
        ],
      },
    ],
  };

  return (
    <Layout>
      {/* Service Schema */}
      {ServiceSchemas.WebsiteHosting()}
      <DualStickyCTA />
      <main className="bg-gray-50 py-16 md:py-20">
        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <section className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight mb-6">
              Fast, secure website hosting for Cheshire businesses
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Make your website load 82 percent faster with reliable hosting and simple, transparent pricing. Hosting is £15 per month or £120 per year when paid annually. I handle the setup, migration and support so you can focus on running your business.
            </p>
            
            {/* Hero bullet points */}
            <div className="max-w-2xl mx-auto mb-8 text-left">
              <ul className="space-y-2 text-base text-slate-700">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2 mt-1">•</span>
                  <span>Faster load times and more stable hosting</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2 mt-1">•</span>
                  <span>Zero downtime migration where your site stays live</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2 mt-1">•</span>
                  <span>Personal support from Nantwich</span>
                </li>
              </ul>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="tel:+447586378502"
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
                alt="Website hosting and migration services for Cheshire businesses"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-8 left-8 text-white">
                <h2 className="text-3xl font-bold mb-2">Professional hosting and migration</h2>
                <p className="text-xl">Zero downtime, local support</p>
              </div>
            </div>
          </section>

          {/* Intro Section */}
          <section className="mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 text-center">
              Why reliable hosting matters
            </h2>
            <p className="text-lg text-slate-700 max-w-4xl mx-auto leading-relaxed text-center">
              If your website is slow or unreliable, you lose visitors, enquiries and trust. Good hosting should be invisible. Pages should load quickly, stay online and support your business quietly in the background. That is what this hosting service is designed to do for Cheshire small businesses.
            </p>
          </section>

          {/* Hosting Package Card */}
          <section className="mb-20">
            <div className="max-w-md mx-auto">
              <HostingServiceCard />
            </div>
          </section>

          {/* Why Choose This Hosting */}
          <section className="mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-12 text-center">
              Why choose secure cloud hosting
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 flex flex-col">
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Built on secure, modern infrastructure</h3>
                <p className="text-sm md:text-base text-slate-700">
                  Your website is hosted on secure cloud infrastructure with a protective caching and security layer. That keeps your site fast, stable and resilient, even during busy periods.
                </p>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 flex flex-col">
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Instant speed boost</h3>
                <p className="text-sm md:text-base text-slate-700">
                  Faster pages help visitors stay longer, click more and contact you. A quick site feels more professional and helps improve visibility in search results.
                </p>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 flex flex-col">
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Zero downtime migration</h3>
                <p className="text-sm md:text-base text-slate-700">
                  Your site stays live while everything is moved behind the scenes. The migration is planned carefully, tested on a staging setup and then switched over when everything is ready.
                </p>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 flex flex-col">
                <h3 className="text-xl font-semibold text-slate-900 mb-3">No technical stress</h3>
                <p className="text-sm md:text-base text-slate-700">
                  You do not need to learn hosting dashboards or server settings. I handle the setup, monitoring, backups and ongoing tweaks. If you have a question you can contact me directly.
                </p>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 flex flex-col md:col-span-2">
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Designed for local businesses and trades</h3>
                <p className="text-sm md:text-base text-slate-700 mb-4">
                  Whether you run a garage, café, consultancy, clinic or trade service, your website should work as hard as you do. This hosting is set up for small business needs, not hobby projects. You get performance, stability and a person to speak to.
                </p>
                <div className="mt-4">
                  <p className="font-semibold text-slate-900 mb-2">You get:</p>
                  <ul className="space-y-2 text-slate-700">
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2 mt-1">•</span>
                      <span>Faster load times</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2 mt-1">•</span>
                      <span>A stable, secure setup</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2 mt-1">•</span>
                      <span>Clear annual pricing</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2 mt-1">•</span>
                      <span>Local support from Nantwich</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Real World Speed Improvements */}
          <section className="mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-center">
              Real world speed improvements
            </h2>
            <p className="text-lg text-gray-700 max-w-4xl mx-auto mb-12 text-center">
              I migrated my automotive photography site from traditional hosting to secure cloud hosting with global delivery. These are the results measured on mobile using Google Lighthouse.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-8">
              {/* Before Migration */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Before migration</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Performance score:</p>
                    <p className="text-xl font-semibold text-red-600">Poor</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Annual hosting cost:</p>
                    <p className="text-xl font-semibold text-gray-900">£550</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Load time:</p>
                    <p className="text-xl font-semibold text-gray-900">14 seconds plus</p>
                  </div>
                </div>
              </div>

              {/* After Migration */}
              <div className="bg-green-50 border-2 border-green-200 rounded-2xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-green-900 mb-6">After migration</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-green-700 mb-1">Performance score:</p>
                    <p className="text-xl font-semibold text-green-900">99 out of 100</p>
                  </div>
                  <div>
                    <p className="text-sm text-green-700 mb-1">Annual hosting cost:</p>
                    <p className="text-xl font-semibold text-green-900">£120 per year</p>
                  </div>
                  <div>
                    <p className="text-sm text-green-700 mb-1">Load time improvement:</p>
                    <p className="text-xl font-semibold text-green-900">82 percent faster</p>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-lg text-gray-700 max-w-4xl mx-auto text-center">
              These are real results from a live site. Fast hosting does not just feel better. It supports better search visibility and a smoother experience for visitors.
            </p>
          </section>

          {/* Pricing Section */}
          <section className="mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-center">
              Website hosting pricing
            </h2>
            <p className="text-lg text-gray-700 max-w-4xl mx-auto mb-12 text-center">
              Hosting is priced in a simple way. You pay one annual fee for a high quality setup and support, with a clear quote if migration work is needed.
            </p>

            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Hosting */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Hosting</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2 mt-1">•</span>
                    <span>£15 per month or £120 per year when paid annually</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2 mt-1">•</span>
                    <span>Secure cloud hosting with global delivery path</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2 mt-1">•</span>
                    <span>Automatic backups included</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2 mt-1">•</span>
                    <span>Monitoring and routine updates</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2 mt-1">•</span>
                    <span>Personal support, managed locally in Cheshire</span>
                  </li>
                </ul>
              </div>

              {/* Migration */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Migration</h3>
                <p className="text-gray-700 mb-4">
                  Migration work is quoted based on your current setup. This includes a review of your existing site, a migration plan, staging and final cutover with zero downtime. You will always receive a clear written quote before any work starts.
                </p>
                <p className="text-sm text-gray-600 mt-6 p-4 bg-gray-50 rounded-lg">
                  There are no surprise charges and no long contracts. You stay in control of your website and its running costs.
                </p>
              </div>
            </div>
          </section>

          {/* FAQs */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Frequently asked questions</h2>
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="font-semibold text-lg mb-3">How much does hosting cost?</h3>
                <p className="text-gray-700">
                  Hosting is £15 per month or £120 per year when paid annually. This includes hosting, backups, and support. Migration work is quoted separately depending on your setup.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="font-semibold text-lg mb-3">Will my website be faster?</h3>
                <p className="text-gray-700">
                  Yes. Modern cloud hosting with proper caching usually improves load times significantly. Faster pages help people stay longer and contact you with more confidence.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="font-semibold text-lg mb-3">Is there any downtime during migration?</h3>
                <p className="text-gray-700">
                  No. Your current site stays live while the new environment is prepared. The switch happens only when everything is ready.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="font-semibold text-lg mb-3">Do I need to understand hosting or servers?</h3>
                <p className="text-gray-700">
                  No. You do not need technical knowledge. I manage the hosting, security, and setup and keep you updated in simple terms.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="font-semibold text-lg mb-3">What happens if something goes wrong?</h3>
                <p className="text-gray-700">
                  You contact me directly. I keep backups in place and resolve issues quickly without sending you through support queues.
                </p>
              </div>
            </div>
          </section>

          {/* Final CTA Block */}
          <section className="text-center bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-12 mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Ready for faster, more stable hosting
            </h2>
            <p className="text-base md:text-lg text-slate-700 mb-8 max-w-2xl mx-auto">
              If your site feels slow or unreliable, or you are not sure what you are paying for, it might be time to move to a more modern setup. I can review your current website, explain your options and handle the migration for you.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
              <a
                href="tel:+447586378502"
                className="inline-flex items-center justify-center px-8 py-3 rounded-full text-base md:text-lg font-semibold bg-brand-pink text-white shadow-lg hover:bg-brand-pink2 hover:shadow-xl transition"
              >
                Call Joe
              </a>
              <a
                href="#contact"
                className="inline-flex items-center justify-center px-8 py-3 rounded-full text-base md:text-lg font-semibold bg-slate-900 text-white/90 hover:bg-black transition shadow-md hover:shadow-lg"
              >
                Get My Free Website Hosting Quote
              </a>
            </div>
            <p className="text-slate-700">
              No technical jargon. Just clear advice and a realistic plan for your website.
            </p>
          </section>

          {/* Service Enquiry Form */}
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
