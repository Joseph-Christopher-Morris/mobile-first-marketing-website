// src/app/services/page.tsx
import type { Metadata } from "next";
import { Layout } from "@/components/layout";
import { ServiceCard } from "@/components/services/ServiceCard";
import ProblemHero from "@/components/scram/ProblemHero";
import CTABlock from "@/components/scram/CTABlock";
import { buildSEO } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { CANONICAL } from "@/config/canonical";
import { STANDARD_CTA } from "@/lib/proof-data";
import {
  buildCollectionPage,
  buildItemList,
  buildLocalBusiness,
  buildBreadcrumbList,
  buildFAQPage,
} from "@/lib/schema-generator";

export const metadata: Metadata = buildSEO({
  intent: "Not Getting Enquiries?",
  description:
    "Not getting enquiries from your website? I fix websites, ads, and analytics for Nantwich and Crewe businesses. Based in Nantwich, transparent pricing.",
  canonicalPath: "/services/",
  ogImage:
    "/images/services/web-hosting-and-migration/hosting-migration-card.webp",
});

const siteUrl = CANONICAL.urls.site;

const services = [
  {
    title: "Website Redesign",
    description:
      "Your website looks fine but nobody gets in touch. I rebuild it so visitors know what to do next.",
    href: "/services/website-design",
    thumbnail:
      "/images/services/Website Design/PXL_20240222_004124044~2.webp",
    alt: "Web designer working on a website design and hosting project",
    bestFor: "Best for trades not getting enquiries",
  },
  {
    title: "Slow Website Fixes and Hosting Migration",
    description:
      "Your site takes too long to load. Visitors leave before they see what you do. I move it to faster hosting and fix the speed.",
    href: "/services/website-hosting",
    thumbnail:
      "/images/services/web-hosting-and-migration/hosting-migration-card.webp",
    alt: "Website hosting and migration services showing performance improvements",
    bestFor: "Best for businesses with slow or expensive sites",
  },
  {
    title: "Google Ads Management",
    description:
      "You are spending money on ads but the phone is not ringing. I set up campaigns that reach the right people and track what works.",
    href: "/services/ad-campaigns",
    thumbnail:
      "/images/services/WhatsApp Image 2025-11-11 at 9.27.14 AM.webp",
    alt: "Strategic advertising campaigns dashboard and performance view",
    bestFor: "Best for businesses wasting money on ads",
  },
  {
    title: "Analytics and Clarity",
    description:
      "You do not know where your leads come from. I set up tracking so you see what is working and what is not.",
    href: "/services/analytics",
    thumbnail:
      "/images/services/screenshot-2025-09-23-analytics-dashboard.webp",
    alt: "Data analytics dashboard showing business insights and performance metrics",
    bestFor: "Best for businesses guessing at what works",
  },
  {
    title: "Photography Services",
    description:
      "Your website uses stock photos and it shows. I shoot real images of your work so customers trust what they see.",
    href: "/services/photography",
    thumbnail: "/images/services/photography-hero.webp",
    alt: "Professional photography services with published editorial work examples",
    bestFor: "Best for businesses needing real images",
  },
];

const faqItems = [
  {
    question: "Do I need to understand the technical side?",
    answer:
      "No. I handle everything from setup to launch. You get plain reports showing what changed and why it matters.",
  },
  {
    question: "How do I know which service I need?",
    answer:
      "Start with the problem. If your website is not getting enquiries, that is a redesign. If it is slow, that is hosting. If you are not sure, send me your website and I will tell you.",
  },
  {
    question: "How much does it cost to get started?",
    answer:
      "Most website projects fall between £500 and £1,200. You get a clear quote before any work begins.",
  },
  {
    question: "Do you work outside Nantwich and Crewe?",
    answer:
      "I work with clients across the North West and support remote projects anywhere in the UK.",
  },
];

// Schema: CollectionPage, ItemList, LocalBusiness, BreadcrumbList, FAQPage
const servicesSchemas = [
  buildCollectionPage({
    name: "Services",
    description:
      "Your website is not getting enquiries. Pick the problem that sounds like yours. I fix websites, ads, analytics, and photography for Nantwich and Crewe businesses.",
    url: `${siteUrl}${CANONICAL.routes.services}`,
  }),
  buildItemList([
    {
      name: "Website Redesign",
      url: `${siteUrl}${CANONICAL.routes.websiteDesign}`,
      description:
        "Your website looks fine but nobody gets in touch. I rebuild it so visitors know what to do and actually contact you.",
    },
    {
      name: "Slow Website Fixes and Hosting Migration",
      url: `${siteUrl}${CANONICAL.routes.websiteHosting}`,
      description:
        "Your site takes too long to load and visitors leave before they see what you do. I move it to faster hosting and fix the speed.",
    },
    {
      name: "Google Ads Management",
      url: `${siteUrl}${CANONICAL.routes.adCampaigns}`,
      description:
        "You are spending money on ads but the phone is not ringing. I set up campaigns that reach the right people and track results.",
    },
    {
      name: "Analytics and Clarity",
      url: `${siteUrl}${CANONICAL.routes.analytics}`,
      description:
        "You do not know where your leads come from. I set up tracking so you see what is working and stop guessing.",
    },
    {
      name: "Photography Services",
      url: `${siteUrl}${CANONICAL.routes.photography}`,
      description:
        "Your website uses stock photos and it shows. I shoot real images of your work so customers trust what they see.",
    },
  ]),
  buildLocalBusiness(
    "Websites that look fine but do not get enquiries. I fix that for trades, local services, and small businesses across Nantwich and Crewe."
  ),
  buildBreadcrumbList([
    { name: "Home", url: `${siteUrl}${CANONICAL.routes.home}` },
    { name: "Services", url: `${siteUrl}${CANONICAL.routes.services}` },
  ]),
  buildFAQPage(faqItems),
];

export default function ServicesPage() {
  return (
    <Layout>
      <JsonLd schemas={servicesSchemas} />

      {/* Hero */}
      <ProblemHero
        heading="Your website is not bringing in work."
        subline="Pick the problem that sounds like yours. I will point you in the right direction."
        ctaLabel="Tell me what's happening"
        ctaHref="/contact/"
      />

      <main className="bg-gray-50 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Service cards */}
          <section className="mb-20">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:justify-items-center">
                {services.map((service, index) => (
                  <div
                    key={index}
                    className={`w-full max-w-sm ${
                      index >= 3
                        ? "lg:col-span-1 lg:justify-self-center"
                        : ""
                    }`}
                  >
                    <ServiceCard
                      title={service.title}
                      description={service.description}
                      href={service.href}
                      thumbnail={service.thumbnail}
                      alt={service.alt}
                      bestFor={service.bestFor}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Location section */}
          <section className="mb-20">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                Why Nantwich and Crewe businesses struggle online
              </h2>
              <p className="text-base md:text-lg text-slate-700 leading-relaxed">
                Most local businesses have a website that looks decent but does nothing.
              </p>
              <p className="mt-4 text-base md:text-lg text-slate-700 leading-relaxed">
                Visitors land, glance around, and leave without getting in touch.
              </p>
              <p className="mt-4 text-base md:text-lg text-slate-700 leading-relaxed">
                The problem is rarely the design. It is speed, structure, and messaging.
              </p>
              <p className="mt-4 text-base md:text-lg text-slate-700 leading-relaxed">
                I fix those three things for businesses across Nantwich and Crewe.
              </p>
            </div>
          </section>

          {/* Pricing range */}
          <section className="mb-20">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Pricing
              </h2>
              <p className="text-base md:text-lg text-slate-700 mb-2">
                Most website projects fall between £500 and £1,200.
              </p>
              <p className="text-base md:text-lg text-slate-700 mb-2">
                Hosting from £15 per month.
              </p>
              <p className="text-base md:text-lg text-slate-700 mb-2">
                Google Ads management from £150 per month.
              </p>
              <p className="text-base md:text-lg text-slate-700">
                Event photography from £200 per day.
              </p>
            </div>
          </section>
        </div>
      </main>

      {/* FAQs */}
      <section className="bg-white py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Common questions
          </h2>
          <div className="space-y-4">
            {faqItems.map((faq, index) => (
              <details
                key={index}
                className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
              >
                <summary className="font-semibold cursor-pointer text-lg">
                  {faq.question}
                </summary>
                <p className="mt-3 text-gray-700">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* End-of-page CTA */}
      <CTABlock
        heading="Send me your website. I will tell you what to fix."
        body="Based in Nantwich, working with Nantwich and Crewe businesses."
        primaryLabel={STANDARD_CTA.primaryLabel}
        primaryHref={STANDARD_CTA.primaryHref}
        secondaryLabel={STANDARD_CTA.secondaryLabel}
        secondaryHref={STANDARD_CTA.secondaryHref}
        variant="end-of-page"
        reassurance="I reply the same day"
      />
    </Layout>
  );
}
