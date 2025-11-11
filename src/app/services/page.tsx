// src/app/services/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { Layout } from "@/components/layout";
import { ServiceCard } from "@/components/services/ServiceCard";
import ServicesContactSection from "@/components/sections/ServicesContactSection";
import MobileStickyButton from "@/components/ui/MobileStickyButton";

export const metadata: Metadata = {
  title:
    "Website Design, Development & Digital Marketing in Nantwich and Cheshire | Professional Services",
  description:
    "Affordable website design, hosting, and digital marketing for Cheshire businesses. Get faster load times, better ads, and measurable growth.",
  keywords: [
    "website design Nantwich",
    "web development Cheshire",
    "website hosting migration",
    "digital marketing Nantwich",
    "ad campaigns Cheshire",
    "data analytics Cheshire",
    "photography services Nantwich",
    "Nantwich business marketing",
  ],
  alternates: { canonical: "/services" },
  openGraph: {
    title:
      "Website Design, Development & Digital Marketing in Nantwich and Cheshire",
    description:
      "I help Nantwich and Cheshire businesses grow with website design, data analytics, and ROI-focused ad campaigns.",
    url: "/services",
    images: [
      {
        url: "/images/services/hosting-migration-card.webp",
        width: 1200,
        height: 630,
        alt: "Digital services for Nantwich and Cheshire businesses",
      },
    ],
  },
};

export default function ServicesPage() {
  // ORDERED to match: Website Design → Hosting → Strategic Ad Campaigns → Data Analytics → Photography
  const services = [
    {
      title: "Website Design & Development",
      description:
        "Mobile first websites on AWS CloudFront, built on a modular framework that is ready for SEO, analytics, and ad campaigns.",
      href: "/services/website-design",
      thumbnail: "/images/services/Website Design/PXL_20240222_004124044~2.webp",
      alt: "Web designer working on a website design and hosting project",
    },
    {
      title: "Website Hosting & Migration",
      description:
        "AWS S3 + CloudFront hosting with 80% cost reduction and 82% faster load times. Professional website migration with zero downtime.",
      href: "/services/website-hosting",
      thumbnail: "/images/services/hosting-migration-card.webp",
      alt: "Website hosting and migration services showing cost savings and performance improvements",
    },
    {
      title: "Strategic Ad Campaigns",
      description:
        "Targeted advertising campaigns designed to maximize ROI and reach your ideal customers across all platforms.",
      href: "/services/ad-campaigns",
      thumbnail: "/images/services/ad-campaigns-hero.webp",
      alt: "Strategic advertising campaigns dashboard and performance view",
    },
    {
      title: "Data Analytics & Insights",
      description:
        "Comprehensive analytics and data-driven insights to optimize your business performance and drive growth.",
      href: "/services/analytics",
      thumbnail: "/images/services/screenshot-2025-09-23-analytics-dashboard.webp",
      alt: "Data analytics dashboard showing business insights and performance metrics",
    },
    {
      title: "Photography Services",
      description:
        "Professional automotive and commercial photography with mobile-optimized delivery and stunning visual storytelling.",
      href: "/services/photography",
      thumbnail: "/images/services/photography-hero.webp",
      alt: "Professional photography services with published editorial work examples",
    },
  ];

  // JSON-LD schema updated to your FAQ set
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Nantwich & Cheshire Digital Services",
    image: "/images/services/hosting-migration-card.webp",
    url: "https://example.com/services",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Nantwich",
      addressRegion: "Cheshire",
      addressCountry: "UK",
    },
    areaServed: ["Nantwich", "Cheshire", "Crewe", "North West England", "UK"],
    makesOffer: services.map((service) => ({
      "@type": "Service",
      name: service.title,
      serviceType: service.description,
      areaServed: "Nantwich & Cheshire",
    })),
    "@graph": [
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "Do I need to understand the technical side?",
            acceptedAnswer: {
              "@type": "Answer",
              text:
                "No. I handle everything from setup to launch. You’ll get clear explanations and simple reports showing what’s working, without any jargon.",
            },
          },
          {
            "@type": "Question",
            name: "How long does the migration process take?",
            acceptedAnswer: {
              "@type": "Answer",
              text:
                "Most migrations are completed within one to two weeks, depending on your site’s size and setup. The switchover is seamless and happens with zero downtime.",
            },
          },
          {
            "@type": "Question",
            name: "Can you help me get more leads for my business?",
            acceptedAnswer: {
              "@type": "Answer",
              text:
                "Yes. I design websites and ad campaigns that attract the right customers and turn visitors into enquiries. Many clients start seeing more leads within the first month.",
            },
          },
          {
            "@type": "Question",
            name: "How much does it cost to get started?",
            acceptedAnswer: {
              "@type": "Answer",
              text:
                "Packages are flexible and based on your goals. A basic site starts from a few hundred pounds, while complete design, analytics, and marketing projects are priced to match your needs.",
            },
          },
          {
            "@type": "Question",
            name: "Can I update my own website later?",
            acceptedAnswer: {
              "@type": "Answer",
              text:
                "Yes. I’ll show you how to make simple updates like adding text or photos. If you prefer, I can handle improvements over time.",
            },
          },
          {
            "@type": "Question",
            name: "Do you offer ongoing support and reporting?",
            acceptedAnswer: {
              "@type": "Answer",
              text:
                "Yes. I provide monthly performance updates with easy-to-read insights that show what’s working, where to improve, and how your results are growing.",
            },
          },
          {
            "@type": "Question",
            name: "Do you work outside Nantwich and Cheshire?",
            acceptedAnswer: {
              "@type": "Answer",
              text:
                "Yes. I work with clients across the North West, including Manchester and Stoke-on-Trent, and can support remote UK projects.",
            },
          },
        ],
      },
    ],
  };

  return (
    <Layout>
      <main className="py-24 bg-gray-50">
        {/* JSON-LD */}
        <script
          type="application/ld+json"
          // @ts-ignore
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <header className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
              Website Design, Development & Digital Marketing in Nantwich and Cheshire
            </h1>
            <p className="mt-6 text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
              Faster, more affordable websites and smarter ads for Nantwich and Cheshire businesses.
            </p>
            <p className="mt-4 text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
              I help Nantwich and Cheshire businesses grow with website design, data analytics, and
              ROI-focused ad campaigns. Browse my core services below to see how we boost visibility
              and conversions.
            </p>
          </header>

          {/* Service cards */}
          <section className="mb-20">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 xl:gap-12 justify-items-center">
                {services.map((service, index) => (
                  <div key={index} className="w-full max-w-sm">
                    <ServiceCard
                      title={service.title}
                      description={service.description}
                      href={service.href}
                      thumbnail={service.thumbnail}
                      alt={service.alt}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Real performance before & after */}
          <section className="mb-20">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">
                Real-World Speed Improvements
              </h2>
              <p className="text-lg text-gray-700 mb-10 text-center max-w-3xl mx-auto leading-relaxed">
                I migrated my automotive photography site from traditional hosting to AWS
                S3 + CloudFront. Here's how the numbers changed on mobile, measured with
                Google Lighthouse.
              </p>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Before card */}
                <article className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
                  <h3 className="text-sm font-semibold tracking-wide text-gray-500 uppercase mb-1">
                    Before – Old Site
                  </h3>
                  <p className="text-2xl font-extrabold text-orange-500 mb-4">Performance 56</p>

                  {/* Before screenshot */}
                  <div className="mb-4 rounded-lg overflow-hidden">
                    <img
                      src="/images/services/before-hosting-performance.webp"
                      alt="Google Lighthouse performance score of 56 before AWS migration"
                      className="w-full h-auto"
                    />
                  </div>

                  <dl className="space-y-2 text-sm sm:text-base text-gray-700">
                    <div className="flex justify-between">
                      <dt>First Contentful Paint</dt>
                      <dd className="font-semibold">3.3s</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Largest Contentful Paint</dt>
                      <dd className="font-semibold">14.2s</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Total Blocking Time</dt>
                      <dd className="font-semibold">300&nbsp;ms</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Speed Index</dt>
                      <dd className="font-semibold">6.6s</dd>
                    </div>
                  </dl>

                  <p className="mt-4 text-sm text-gray-500">
                    Slow load times meant lost visitors and fewer enquiries.
                  </p>
                </article>

                {/* After card */}
                <article className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
                  <h3 className="text-sm font-semibold tracking-wide text-gray-500 uppercase mb-1">
                    After – AWS Migration
                  </h3>
                  <p className="text-2xl font-extrabold text-emerald-600 mb-4">Performance 99</p>

                  {/* After screenshot */}
                  <div className="mb-4 rounded-lg overflow-hidden">
                    <img
                      src="/images/services/Web Hosting And Migration/pagespeed-aws-migration-desktop.webp"
                      alt="Google Lighthouse performance score of 99 after AWS migration"
                      className="w-full h-auto"
                    />
                  </div>

                  <dl className="space-y-2 text-sm sm:text-base text-gray-700">
                    <div className="flex justify-between">
                      <dt>First Contentful Paint</dt>
                      <dd className="font-semibold">1.1s</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Largest Contentful Paint</dt>
                      <dd className="font-semibold">1.8s</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Total Blocking Time</dt>
                      <dd className="font-semibold">20&nbsp;ms</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Speed Index</dt>
                      <dd className="font-semibold">2.1s</dd>
                    </div>
                  </dl>

                  <p className="mt-4 text-sm text-gray-500">
                    Faster pages, smoother browsing, and a better experience on mobile.
                  </p>
                </article>
              </div>

              <p className="mt-6 text-xs text-gray-500 text-center">
                Metrics from Google Lighthouse mobile tests for my automotive photography
                site before and after migrating to AWS.
              </p>
            </div>
          </section>

          {/* Why Nantwich and Cheshire Businesses Choose Me */}
          <section className="max-w-5xl mx-auto mb-20">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              Why Nantwich and Cheshire Businesses Choose Me
            </h2>
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              I blend creative website design with data-driven marketing and analytics to help local
              brands grow with confidence. From development to ad campaigns, every project focuses on
              measurable performance that increases visibility, enquiries, and ROI.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Ready to improve your digital performance? Let’s talk about your goals, budget, and
              next steps.
            </p>
          </section>

          {/* FAQs */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">FAQs</h2>
            <div className="max-w-3xl mx-auto space-y-4">
              <details className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <summary className="font-semibold cursor-pointer text-lg">
                  Do I need to understand the technical side?
                </summary>
                <p className="mt-3 text-gray-700">
                  No. I handle everything from setup to launch. You’ll get clear explanations and
                  simple reports showing what’s working, without any jargon or confusing tools.
                </p>
              </details>

              <details className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <summary className="font-semibold cursor-pointer text-lg">
                  How long does the migration process take?
                </summary>
                <p className="mt-3 text-gray-700">
                  Most migrations are completed within one to two weeks, depending on your site’s size
                  and setup. The switchover is seamless and happens with zero downtime.
                </p>
              </details>

              <details className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <summary className="font-semibold cursor-pointer text-lg">
                  Can you help me get more leads for my business?
                </summary>
                <p className="mt-3 text-gray-700">
                  Yes. I design websites and ad campaigns that attract the right customers and turn
                  visitors into enquiries. Many clients start seeing more leads within the first month.
                </p>
              </details>

              <details className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <summary className="font-semibold cursor-pointer text-lg">
                  How much does it cost to get started?
                </summary>
                <p className="mt-3 text-gray-700">
                  Packages are flexible and based on your goals. A basic site starts from a few hundred
                  pounds, while complete design, analytics, and marketing projects are priced to match
                  your needs. You’ll always receive a precise quote before any work begins.
                </p>
              </details>

              <details className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <summary className="font-semibold cursor-pointer text-lg">
                  Can I update my own website later?
                </summary>
                <p className="mt-3 text-gray-700">
                  Yes. I’ll show you how to make simple updates like adding text or photos. If you
                  prefer, I can handle updates and improvements for you over time.
                </p>
              </details>

              <details className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <summary className="font-semibold cursor-pointer text-lg">
                  Do you offer ongoing support and reporting?
                </summary>
                <p className="mt-3 text-gray-700">
                  Yes. I provide monthly performance updates with easy-to-read insights that show what’s
                  working, where to improve, and how your results are growing.
                </p>
              </details>

              <details className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <summary className="font-semibold cursor-pointer text-lg">
                  Do you work outside Nantwich and Cheshire?
                </summary>
                <p className="mt-3 text-gray-700">
                  Yes. I work with clients across the North West, including Manchester and
                  Stoke-on-Trent, and also support remote projects anywhere in the UK.
                </p>
              </details>
            </div>
          </section>

          {/* Pricing Teaser Section */}
          <section className="mb-20">
            <div className="max-w-5xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Simple, transparent pricing
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Websites from £300, hosting from £15 per month, Google Ads management from £150 per month,
                and event photography from £200 per day.
              </p>
              <Link
                href="/pricing"
                className="inline-flex items-center bg-pink-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-pink-700 transition-colors"
              >
                View full pricing
              </Link>
            </div>
          </section>

          {/* Services Contact Section with Form */}
          <div id="form">
            <ServicesContactSection />
          </div>
        </div>
      </main>

      {/* Mobile Sticky Button */}
      <MobileStickyButton />
    </Layout>
  );
}
