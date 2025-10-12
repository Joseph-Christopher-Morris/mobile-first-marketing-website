import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Layout } from "@/components/layout";

export const metadata: Metadata = {
  title:
    "Automotive Photography, Analytics, and Ad Campaigns in Nantwich, Cheshire | Vivid Auto Photography",
  description:
    "Professional automotive photography, media production, analytics, and ROI-focused ad campaigns for businesses in Nantwich and Cheshire. Data-driven services that grow dealerships, workshops, and local brands.",
  keywords: [
    "automotive photography Nantwich",
    "car photography Cheshire",
    "automotive media production",
    "marketing analytics Nantwich",
    "data analytics Cheshire",
    "automotive marketing tech",
    "ad campaigns Nantwich",
    "car dealership photography UK",
  ],
  alternates: { canonical: "/services" },
  openGraph: {
    title:
      "Automotive Photography, Analytics, and Ad Campaigns in Nantwich, Cheshire",
    description:
      "Data-driven automotive media and marketing services for Cheshire businesses.",
    url: "/services",
    images: [
      {
        url: "/images/hero/aston-martin-db6-website.webp",
        width: 1200,
        height: 630,
        alt: "Automotive photography in Nantwich, Cheshire",
      },
    ],
  },
};

export default function ServicesPage() {
  // JSON-LD schema (LocalBusiness + FAQ)
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Vivid Auto Photography",
    image: "/images/hero/aston-martin-db6-website.webp",
    url: "https://vividauto.photography/services",
    telephone: "+44 07586 378502",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Nantwich",
      addressRegion: "Cheshire",
      addressCountry: "UK",
    },
    areaServed: ["Nantwich", "Crewe", "Cheshire", "North West England"],
    makesOffer: [
      {
        "@type": "Service",
        name: "Automotive Photography",
        areaServed: "Cheshire",
        serviceType: "Commercial photography for cars and vehicles",
      },
      {
        "@type": "Service",
        name: "Marketing Analytics",
        areaServed: "Cheshire",
        serviceType: "Analytics, dashboards, and reporting",
      },
      {
        "@type": "Service",
        name: "Ad Campaign Management",
        areaServed: "Cheshire",
        serviceType: "Paid media planning and optimisation",
      },
    ],
    "@graph": [
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "Do you cover locations outside Nantwich and Cheshire?",
            acceptedAnswer: {
              "@type": "Answer",
              text:
                "Yes. We work across Cheshire and the North West, including Crewe, Chester, and Stoke-on-Trent.",
            },
          },
          {
            "@type": "Question",
            name:
              "Can you deliver analytics and dashboards for campaign performance?",
            acceptedAnswer: {
              "@type": "Answer",
              text:
                "Yes. We set up tracking, dashboards, and clear reports that show ROI and key actions.",
            },
          },
          {
            "@type": "Question",
            name:
              "Do you photograph cars for dealerships and private sellers?",
            acceptedAnswer: {
              "@type": "Answer",
              text:
                "Yes. We shoot for dealerships, restorers, and private sellers, with mobile-optimised delivery.",
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
          <header className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">
              Automotive Services in Nantwich, Cheshire
            </h1>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              We help Cheshire businesses grow with professional automotive
              media, data analytics, and ROI-focused ad campaigns. Browse our
              core services below and see how we improve visibility and
              conversions.
            </p>
          </header>

          {/* Service cards */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Photography */}
            <Link
              href="/services/photography"
              className="group bg-white rounded-2xl shadow-lg ring-1 ring-black/5 overflow-hidden hover:shadow-xl transition"
            >
              <div className="relative h-56">
                <Image
                  src="/images/services/photography-hero.webp"
                  alt="Automotive photography in Nantwich, Cheshire for dealerships and restorers"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-black/55" />
                <h2 className="absolute bottom-4 left-5 text-white text-2xl font-bold">
                  Automotive Photography
                </h2>
              </div>
              <div className="p-6">
                <p className="text-gray-600">
                  High quality car photography for Cheshire dealerships,
                  auctions, and private sellers. Clean lighting, panel-true
                  angles, and mobile-ready delivery that increases enquiries.
                </p>
                <span className="mt-5 inline-flex items-center text-brand-pink hover:text-brand-pink2 font-semibold">
                  Learn More
                  <svg
                    className="ml-2 w-4 h-4"
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
                </span>
              </div>
            </Link>

            {/* Analytics */}
            <Link
              href="/services/analytics"
              className="group bg-white rounded-2xl shadow-lg ring-1 ring-black/5 overflow-hidden hover:shadow-xl transition"
            >
              <div className="relative h-56">
                <Image
                  src="/images/services/screenshot-2025-09-23-analytics-dashboard.webp"
                  alt="Marketing analytics and dashboards for Nantwich and Cheshire businesses"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-black/55" />
                <h2 className="absolute bottom-4 left-5 text-white text-2xl font-bold">
                  Data Analytics and Reporting
                </h2>
              </div>
              <div className="p-6">
                <p className="text-gray-600">
                  We implement tracking, build dashboards, and translate data
                  into actions. Get clear reports on campaign performance and
                  website behaviour so you can invest with confidence.
                </p>
                <span className="mt-5 inline-flex items-center text-brand-pink hover:text-brand-pink2 font-semibold">
                  Learn More
                  <svg
                    className="ml-2 w-4 h-4"
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
                </span>
              </div>
            </Link>

            {/* Ad Campaigns */}
            <Link
              href="/services/ad-campaigns"
              className="group bg-white rounded-2xl shadow-lg ring-1 ring-black/5 overflow-hidden hover:shadow-xl transition"
            >
              <div className="relative h-56">
                <Image
                  src="/images/services/ad-campaigns-hero.webp"
                  alt="Paid media and ad campaign management for Cheshire automotive brands"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-black/55" />
                <h2 className="absolute bottom-4 left-5 text-white text-2xl font-bold">
                  Paid Media and Ad Campaigns
                </h2>
              </div>
              <div className="p-6">
                <p className="text-gray-600">
                  Search and social campaigns that reach buyers near Nantwich
                  and across Cheshire. We optimise creatives, audiences, and
                  budgets to improve lead quality and ROI.
                </p>
                <span className="mt-5 inline-flex items-center text-brand-pink hover:text-brand-pink2 font-semibold">
                  Learn More
                  <svg
                    className="ml-2 w-4 h-4"
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
                </span>
              </div>
            </Link>
          </section>

          {/* Local SEO copy block */}
          <section className="mt-20 text-gray-700 leading-relaxed max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Why Nantwich and Cheshire businesses choose us
            </h2>
            <p className="mb-4">
              We combine automotive media, analytics, and marketing tech so
              local brands see real outcomes. Dealerships, garages, restorers,
              and events teams in Nantwich and the wider Cheshire area use our
              work to increase enquiries, improve conversion rates, and cut
              wasted ad spend.
            </p>
            <p>
              Ready to plan your next shoot or campaign?{" "}
              <Link
                href="/contact"
                className="text-brand-pink hover:text-brand-pink2 font-semibold"
              >
                Talk to us
              </Link>{" "}
              about dates, budget, and goals.
            </p>
          </section>

          {/* FAQ */}
          <section className="mt-20">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              FAQs
            </h2>
            <div className="space-y-4">
              <details className="bg-white rounded-lg p-4 shadow-sm">
                <summary className="font-semibold cursor-pointer">
                  Do you cover locations outside Nantwich and Cheshire?
                </summary>
                <p className="mt-2 text-gray-700">
                  Yes. We work across the North West, including Crewe, Chester,
                  and Stoke-on-Trent.
                </p>
              </details>
              <details className="bg-white rounded-lg p-4 shadow-sm">
                <summary className="font-semibold cursor-pointer">
                  Can you provide dashboards and ongoing reporting?
                </summary>
                <p className="mt-2 text-gray-700">
                  Yes. We deliver tracking, dashboards, and monthly reports with
                  clear next steps.
                </p>
              </details>
              <details className="bg-white rounded-lg p-4 shadow-sm">
                <summary className="font-semibold cursor-pointer">
                  Do you work with dealerships and private sellers?
                </summary>
                <p className="mt-2 text-gray-700">
                  Yes. We tailor shoots and packages to the outcome you need,
                  from quick listings to full campaigns.
                </p>
              </details>
            </div>
          </section>

          {/* CTA */}
          <div className="text-center mt-16">
            <Link
              href="/contact"
              className="inline-flex items-center bg-brand-pink text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-brand-pink2 transition-colors"
            >
              Get a quote for Nantwich and Cheshire
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
          </div>
        </div>
      </main>
    </Layout>
  );
}