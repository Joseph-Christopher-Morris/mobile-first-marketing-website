import type { Metadata } from 'next';
import { Layout } from '@/components/layout';
import { buildSEO } from '@/lib/seo';
import { JsonLd } from '@/components/JsonLd';
import { CANONICAL } from '@/config/canonical';
import {
  buildFAQPage,
  buildBreadcrumbList,
  buildWebPage,
} from '@/lib/schema-generator';
import FAQHero from '@/components/faq/FAQHero';
import FAQSection from '@/components/faq/FAQSection';
import FAQProofStrip from '@/components/faq/FAQProofStrip';
import FAQFitCheck from '@/components/faq/FAQFitCheck';
import FAQNextSteps from '@/components/faq/FAQNextSteps';
import FAQFinalCTA from '@/components/faq/FAQFinalCTA';
import {
  faqHero,
  faqSections,
  faqProofStrip,
  faqFitCheck,
  faqNextSteps,
  faqFinalCta,
  getAllVisibleFAQs,
} from '@/lib/faq/faqContent';

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export const metadata: Metadata = buildSEO({
  intent: 'Why Your Website Gets Visitors But No Enquiries | FAQ',
  description:
    'Answers to common questions about slow websites, weak landing pages, Google Ads, and why visitors do not get in touch. Based on real work in Nantwich and Crewe.',
  canonicalPath: '/faq/',
  skipTitleValidation: true,
});

// ---------------------------------------------------------------------------
// Structured data (matches visible content only)
// ---------------------------------------------------------------------------

const siteUrl = CANONICAL.urls.site;

const faqSchemas = [
  buildFAQPage(getAllVisibleFAQs()),
  buildWebPage({
    name: 'Why Your Website Gets Visitors But No Enquiries | FAQ',
    description:
      'Answers to common questions about slow websites, weak landing pages, Google Ads, and why visitors do not get in touch. Based on real work in Nantwich and Crewe.',
    url: `${siteUrl}${CANONICAL.routes.faq}`,
  }),
  buildBreadcrumbList([
    { name: 'Home', url: `${siteUrl}${CANONICAL.routes.home}` },
    { name: 'FAQ', url: `${siteUrl}${CANONICAL.routes.faq}` },
  ]),
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function FAQPage() {
  return (
    <Layout pageTitle="FAQ">
      <JsonLd schemas={faqSchemas} />
      <div className="min-h-screen bg-white">
        {/* 1. Hero + bridge */}
        <FAQHero
          title={faqHero.title}
          intro={faqHero.intro}
          proofLine={faqHero.proofLine}
          primaryCtaLabel={faqHero.primaryCtaLabel}
          primaryCtaHref={faqHero.primaryCtaHref}
          bridgeLines={faqHero.bridgeLines}
        />

        {/* 2-4. FAQ sections */}
        {faqSections.map((section) => (
          <FAQSection
            key={section.sectionSlug}
            sectionSlug={section.sectionSlug}
            title={section.title}
            items={section.items}
          />
        ))}

        {/* 5. Proof strip */}
        <FAQProofStrip
          title={faqProofStrip.title}
          items={faqProofStrip.items}
        />

        {/* 6. Fit check */}
        <FAQFitCheck
          title={faqFitCheck.title}
          items={[...faqFitCheck.items]}
        />

        {/* 7. Next steps */}
        <FAQNextSteps
          title={faqNextSteps.title}
          steps={[...faqNextSteps.steps]}
        />

        {/* 8. Final CTA */}
        <FAQFinalCTA
          title={faqFinalCta.title}
          supportingText={faqFinalCta.supportingText}
          primaryCtaLabel={faqFinalCta.primaryCtaLabel}
          primaryCtaHref={faqFinalCta.primaryCtaHref}
          secondaryText={faqFinalCta.secondaryText}
          secondaryEmail={faqFinalCta.secondaryEmail}
        />
      </div>
    </Layout>
  );
}
