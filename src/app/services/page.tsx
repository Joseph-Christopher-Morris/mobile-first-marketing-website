import type { Metadata } from "next";
import Link from "next/link";
import { Layout } from "@/components/layout";
import { ServiceCard } from "@/components/services/ServiceCard";

export const metadata: Metadata = {
  title:
    "Website Design, Development & Digital Marketing in Nantwich and Cheshire | Professional Services",
  description:
    "Professional website design, development, hosting migration, photography, data analytics, and strategic ad campaigns for businesses in Nantwich and Cheshire. Comprehensive digital marketing services that drive results.",
  keywords: [
    "website design Nantwich",
    "web development Cheshire",
    "website hosting migration",
    "photography services Nantwich",
    "data analytics Cheshire",
    "digital marketing Nantwich",
    "ad campaigns Cheshire",
    "professional services UK",
  ],
  alternates: { canonical: "/services" },
  openGraph: {
    title:
      "Website Design, Development & Digital Marketing in Nantwich and Cheshire",
    description:
      "Comprehensive digital marketing and web services for Cheshire businesses.",
    url: "/services",
    images: [
      {
        url: "/images/services/hosting-migration-card.webp",
        width: 1200,
        height: 630,
        alt: "Professional digital marketing services in Nantwich, Cheshire",
      },
    ],
  },
};

export default function ServicesPage() {
  // Service data for the cards
  const services = [
    {
      title: "Website Hosting & Migration",
      description: "Professional website hosting migration with 80% cost savings and 82% faster load times. Secure AWS S3 + CloudFront architecture with zero downtime deployment.",
      href: "/services/hosting",
      thumbnail: "/images/services/hosting-migration-card.webp",
      alt: "Website hosting and migration services showing cost savings and performance improvements"
    },
    {
      title: "Photography Services",
      description: "Professional photography for businesses, events, and editorial work. Published in major publications including BBC, Forbes, and The Times.",
      href: "/services/photography",
      thumbnail: "/images/services/photography-hero.webp",
      alt: "Professional photography services with published editorial work examples"
    },
    {
      title: "Data Analytics & Insights",
      description: "GA4 and Adobe-level analytics expertise with custom dashboards and reporting. Transform your data into actionable business insights.",
      href: "/services/analytics",
      thumbnail: "/images/services/analytics-hero.webp",
      alt: "Data analytics dashboard showing business insights and performance metrics"
    },
    {
      title: "Strategic Ad Campaigns",
      description: "ROI-focused advertising campaigns with proven results. Case studies show £13.5k revenue from £546 investment with 85% conversion rates.",
      href: "/services/ad-campaigns",
      thumbnail: "/images/services/ad-campaigns-hero.webp",
      alt: "Strategic advertising campaigns with ROI case studies and performance metrics"
    }
  ];

  // JSON-LD schema (LocalBusiness + FAQ)
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Professional Digital Marketing Services",
    image: "/images/services/hosting-migration-card.webp",
    url: "https://example.com/services",
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
        name: "Website Hosting & Migration",
        areaServed: "Cheshire",
        serviceType: "Professional website hosting and migration services",
      },
      {
        "@type": "Service",
        name: "Photography Services",
        areaServed: "Cheshire",
        serviceType: "Professional photography for businesses and editorial work",
      },
      {
        "@type": "Service",
        name: "Data Analytics",
        areaServed: "Cheshire",
        serviceType: "Analytics, dashboards, and business intelligence",
      },
      {
        "@type": "Service",
        name: "Strategic Ad Campaigns",
        areaServed: "Cheshire",
        serviceType: "ROI-focused advertising and campaign management",
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
                "Yes. I work across Cheshire and the North West, including Crewe, Chester, and Stoke-on-Trent.",
            },
          },
          {
            "@type": "Question",
            name:
              "Can you deliver analytics and dashboards for campaign performance?",
            acceptedAnswer: {
              "@type": "Answer",
              text:
                "Yes. I set up tracking, dashboards, and clear reports that show ROI and key actions.",
            },
          },
          {
            "@type": "Question",
            name:
              "What types of photography services do you offer?",
            acceptedAnswer: {
              "@type": "Answer",
              text:
                "I offer professional photography for businesses, events, and editorial work, with published examples in major publications.",
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
            <p className="mt-6 text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Professional digital marketing services that drive real results for businesses across Cheshire. 
              From website hosting and development to photography, analytics, and strategic advertising campaigns.
            </p>
          </header>

          {/* Service cards */}
          <section className="mb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {services.map((service, index) => (
                <ServiceCard
                  key={index}
                  title={service.title}
                  description={service.description}
                  href={service.href}
                  thumbnail={service.thumbnail}
                  alt={service.alt}
                />
              ))}
            </div>
          </section>

          {/* Why choose us section */}
          <section className="text-gray-700 leading-relaxed max-w-4xl mx-auto mb-20">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 text-center">
              Why Nantwich and Cheshire businesses choose our services
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Proven Results</h3>
                <p className="mb-4">
                  Our services deliver measurable outcomes: 80% cost savings on hosting, 
                  published editorial work in major publications, and advertising campaigns 
                  with documented ROI improvements.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Local Expertise</h3>
                <p className="mb-4">
                  Based in Nantwich with deep knowledge of the Cheshire market, 
                  we understand local business needs and deliver solutions that 
                  work for the regional economy.
                </p>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-20">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
              Frequently Asked Questions
            </h2>
            <div className="max-w-3xl mx-auto space-y-4">
              <details className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <summary className="font-semibold cursor-pointer text-lg">
                  Do you cover locations outside Nantwich and Cheshire?
                </summary>
                <p className="mt-3 text-gray-700">
                  Yes. I work across the North West, including Crewe, Chester,
                  and Stoke-on-Trent, providing the same high-quality services
                  throughout the region.
                </p>
              </details>
              <details className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <summary className="font-semibold cursor-pointer text-lg">
                  Can you provide dashboards and ongoing reporting?
                </summary>
                <p className="mt-3 text-gray-700">
                  Yes. I deliver comprehensive tracking, custom dashboards, and 
                  detailed monthly reports with clear next steps and actionable insights.
                </p>
              </details>
              <details className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <summary className="font-semibold cursor-pointer text-lg">
                  What types of businesses do you work with?
                </summary>
                <p className="mt-3 text-gray-700">
                  I work with a diverse range of businesses from small local companies 
                  to larger enterprises, tailoring services to meet specific needs and budgets.
                </p>
              </details>
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-12 mx-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Let's discuss your project requirements and how our services can help 
              your business grow. Get in touch for a free consultation.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center bg-pink-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-pink-700 transition-colors shadow-lg hover:shadow-xl"
            >
              Get Your Free Quote
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
          </section>
        </div>
      </main>
    </Layout>
  );
}