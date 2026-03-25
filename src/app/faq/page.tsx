import type { Metadata } from 'next';
import { Layout } from '@/components/layout';
import { FAQAccordion } from '@/components/FAQAccordion';
import ProblemHero from '@/components/scram/ProblemHero';
import CTABlock from '@/components/scram/CTABlock';
import { buildSEO } from '@/lib/seo';
import { JsonLd } from '@/components/JsonLd';
import { CANONICAL } from '@/config/canonical';
import { STANDARD_CTA } from '@/lib/proof-data';
import {
  buildFAQPage,
  buildBreadcrumbList,
  buildWebPage,
} from '@/lib/schema-generator';

export const metadata: Metadata = buildSEO({
  intent: 'FAQ',
  qualifier: 'Websites, Ads, Photography',
  description:
    'Answers to common questions about websites, Google Ads, flyers, stock photography, and eBay selling. Based on real results from Nantwich and Crewe projects.',
  canonicalPath: '/faq/',
});

const siteUrl = CANONICAL.urls.site;

// ---------------------------------------------------------------------------
// FAQ data grouped by category
// ---------------------------------------------------------------------------

const websiteFAQs = [
  {
    question: 'Why does my website get visitors but no enquiries?',
    answer:
      'Most websites do get traffic. The problem is what happens next. People land on the page, scroll, and leave because nothing clearly tells them what to do. In one project, ads generated over 1,500 clicks. The issue was not traffic. The page did not guide people to take action. When that was fixed, lead quality improved.',
  },
  {
    question: 'What actually stops people getting in touch?',
    answer:
      'It is usually not design. It is unclear next steps, too many choices, and no clear reason to act. People do not figure it out. They move on.',
  },
  {
    question: 'Does website speed really affect enquiries?',
    answer:
      'Yes. My own site used to take around 14 seconds to load. Now it loads in under 2 seconds. People stopped leaving early. They stayed longer and started enquiring. Speed changes behaviour.',
  },
];

const adsFAQs = [
  {
    question: 'Why did my ads get clicks but no leads?',
    answer:
      'This happens a lot. One campaign generated over 121,000 impressions and 1,500+ clicks. The ads worked. The landing page did not. Once the page was improved, the same traffic became more valuable.',
  },
  {
    question: 'Do I need more traffic or a better website?',
    answer:
      'Most of the time, the website. If people are already visiting but not converting, sending more traffic just increases waste. Fix what people see first.',
  },
];

const flyerFAQs = [
  {
    question: 'Do flyers still work for getting clients?',
    answer:
      'Yes, if used properly. £546 spent on flyers generated around £13.5K in work over time. The key was targeting the right audience, being consistent, and following up conversations. Flyers do not work instantly. They build trust.',
  },
  {
    question: 'Why did one flyer lead to multiple jobs?',
    answer:
      'Because it started conversations. Those conversations led to race teams, auctions, and repeat work. Offline marketing works when it connects to real people and builds trust over time.',
  },
];

const stockPhotoFAQs = [
  {
    question: 'Can stock photography actually make money?',
    answer:
      'Yes, but not quickly. Income grew from a few pounds to over £900 through consistent uploads, evergreen subjects, and understanding demand. It compounds over time.',
  },
  {
    question: 'What makes a stock photo sell?',
    answer:
      'Images that solve a real use case, have space for text, and are not easy to recreate. Many sales come from simple, practical images used in real business contexts.',
  },
  {
    question: 'What does stock photography teach about websites?',
    answer:
      'What people see changes what they do. The same principle applies to websites. Clarity and usefulness outperform creativity.',
  },
];

const ebayFAQs = [
  {
    question: 'How did you get sales without ads?',
    answer:
      'One model car collection generated over 137,000 impressions organically. This came from better photos, clearer listings, and timing listings properly. Presentation drives attention.',
  },
  {
    question: 'How do you increase order value on eBay?',
    answer:
      'Bundling and combined postage. This encourages multi-item orders and higher basket value. Small changes in structure increase revenue.',
  },
  {
    question: 'How do you get repeat buyers?',
    answer:
      'Through clear communication, reliable delivery, and consistent quality. Trust leads to repeat purchases.',
  },
  {
    question: 'How do you scale listings without losing quality?',
    answer:
      'By building a repeatable workflow. Better photos and structured listings improved both speed and buyer confidence.',
  },
];

const decisionFAQs = [
  {
    question: 'What happens if I send you my website?',
    answer:
      'I review it and show you what is stopping people getting in touch. You get clear issues, simple actions, and no pressure to proceed. Usually within a day.',
  },
  {
    question: 'Is this just theory or based on real results?',
    answer:
      'Everything here comes from real work. £13.5K from flyers, 1,500+ ad clicks analysed, 137,000+ eBay impressions, and consistent stock photography income. This is based on what actually worked.',
  },
];

// Flatten all FAQs for schema markup
const allFAQs = [
  ...websiteFAQs,
  ...adsFAQs,
  ...flyerFAQs,
  ...stockPhotoFAQs,
  ...ebayFAQs,
  ...decisionFAQs,
];

const faqSchemas = [
  buildFAQPage(allFAQs),
  buildWebPage({
    name: 'FAQ — Websites, Ads, Photography',
    description:
      'Answers to common questions about websites, Google Ads, flyers, stock photography, and eBay selling. Based on real results.',
    url: `${siteUrl}${CANONICAL.routes.faq}`,
  }),
  buildBreadcrumbList([
    { name: 'Home', url: `${siteUrl}${CANONICAL.routes.home}` },
    { name: 'FAQ', url: `${siteUrl}${CANONICAL.routes.faq}` },
  ]),
];

export default function FAQPage() {
  return (
    <Layout pageTitle="FAQ">
      <JsonLd schemas={faqSchemas} />
      <div className="min-h-screen bg-white">
        <ProblemHero
          heading="Questions people actually ask"
          subline="Answers from real projects. Websites, ads, flyers, photography, and eBay selling."
          ctaLabel="Send me your website"
          ctaHref="/contact/"
          proofText="Based on real results from Nantwich and Crewe projects"
        />

        <FAQAccordion faqs={websiteFAQs} title="Website and Conversion" />
        <FAQAccordion faqs={adsFAQs} title="Google Ads and Traffic" />
        <FAQAccordion faqs={flyerFAQs} title="Offline Marketing and Flyers" />
        <FAQAccordion faqs={stockPhotoFAQs} title="Stock Photography and Content" />
        <FAQAccordion faqs={ebayFAQs} title="eBay and Product Selling" />
        <FAQAccordion faqs={decisionFAQs} title="Decision and Action" />

        <CTABlock
          heading="Send me your website. I will show you what is not working."
          body="Usually within a day. No pressure."
          primaryLabel={STANDARD_CTA.primaryLabel}
          primaryHref={STANDARD_CTA.primaryHref}
          secondaryLabel={STANDARD_CTA.secondaryLabel}
          secondaryHref={STANDARD_CTA.secondaryHref}
          variant="end-of-page"
        />
      </div>
    </Layout>
  );
}
