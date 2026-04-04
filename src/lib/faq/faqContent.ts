/**
 * Central content config for the /faq/ page.
 * All FAQ copy, proof items, and section data live here for easy editing.
 *
 * This file is the single source of truth for all visible FAQ content,
 * metadata copy, and structured data generation.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FAQItem {
  question: string;
  /** Plain text answer used for schema markup and rendering */
  answerText: string;
  /** Optional internal link to weave into the rendered answer */
  internalLink?: { href: string; label: string };
}

export interface FAQSectionData {
  sectionSlug: string;
  title: string;
  items: FAQItem[];
}

export interface ProofItem {
  description: string;
}

// ---------------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------------

export const faqHero = {
  title:
    'Questions people actually ask when their website gets visitors but no enquiries',
  intro:
    'Answers from real projects about speed, structure, messaging, landing pages, and why visitors do not get in touch.',
  proofLine: 'Based on real work from Nantwich and Crewe projects',
  primaryCtaLabel: 'Send me your website',
  primaryCtaHref: '/contact/',
  bridgeLines: [
    'This is where most websites go wrong.',
    'People land on the page.',
    'They do not see what to do next.',
    'So they leave.',
  ],
} as const;

// ---------------------------------------------------------------------------
// FAQ sections
// ---------------------------------------------------------------------------

export const faqSections: FAQSectionData[] = [
  {
    sectionSlug: 'website-conversion',
    title: 'Website and Conversion',
    items: [
      {
        question: 'Why does my website get visitors but no enquiries?',
        answerText:
          'Most of the time, the problem is not traffic. People land on the page, do not see a clear next step, and leave. Your website redesign needs to make the page easier to understand and easier to act on.',
        internalLink: {
          href: '/services/website-design/',
          label: 'website redesign',
        },
      },
      {
        question: 'What actually stops people getting in touch?',
        answerText:
          'Usually, it is not the design. It is unclear next steps, too many choices, weak messaging, or no obvious reason to act. People do not figure it out. They move on.',
      },
      {
        question: 'Do I need more traffic or a better website?',
        answerText:
          'Most of the time, the website. Sending more traffic to a weak page just increases waste. Fix the page first. Then more visitors become more valuable.',
      },
      {
        question: 'How do I know if my website is losing me enquiries?',
        answerText:
          'If people land on your site and leave without getting in touch, the problem is usually speed, structure, or unclear messaging. Send me your website and I will tell you what is getting in the way.',
        internalLink: {
          href: '/contact/',
          label: 'Send me your website',
        },
      },
    ],
  },
  {
    sectionSlug: 'google-ads',
    title: 'Google Ads and Landing Pages',
    items: [
      {
        question: 'Why did my ads get clicks but no leads?',
        answerText:
          'This happens a lot. The ads can do their job and the page can still fail. People click, land, and do not see what they expected. The ads worked. The page did not. That is where Google Ads and landing page structure need to work together.',
        internalLink: {
          href: '/services/ad-campaigns/',
          label: 'Google Ads',
        },
      },
      {
        question: 'Should I fix my website before running ads?',
        answerText:
          'Yes. Ads send people into the system you already have. If the page is slow, unclear, or weak, paid traffic just reaches the problem faster. Fix the page first. Then send the right people to it.',
      },
      {
        question: 'Why am I getting the wrong kind of enquiries?',
        answerText:
          'Usually, the message is too broad. Your page is attracting everyone instead of helping the right people recognise themselves. Better structure and clearer wording filter out poor-fit leads earlier.',
      },
    ],
  },
  {
    sectionSlug: 'speed-ux',
    title: 'Speed and User Experience',
    items: [
      {
        question: 'Does website speed really affect enquiries?',
        answerText:
          'Yes. People leave quickly when a page feels slow. I took my own site from around 14 seconds down to under 2. That changed how people behaved on the page. They stayed longer, read more, and the next step became easier to act on. Good analytics setup helps you see that change more clearly.',
        internalLink: {
          href: '/services/analytics/',
          label: 'analytics setup',
        },
      },
      {
        question: 'Why do people leave without taking action?',
        answerText:
          'Because nothing on the page makes the next step feel obvious. The message does not connect. The structure does not guide them. Or the page takes too long to load. People do not wait around and work it out for you.',
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Proof strip
// ---------------------------------------------------------------------------

export const faqProofStrip = {
  title: 'Real examples',
  items: [
    { description: '14s to under 2s load time' },
    { description: 'Ahrefs Health Score improved from 71 to 91' },
    { description: 'Ad traffic analysed to find landing-page weakness' },
    { description: 'Clearer structure reduced confusion and wasted time' },
  ] satisfies ProofItem[],
} as const;

// ---------------------------------------------------------------------------
// Fit check
// ---------------------------------------------------------------------------

export const faqFitCheck = {
  title: 'This is for you if',
  items: [
    'Your website gets visitors but no enquiries',
    'People leave without taking action',
    'You are running ads but not seeing leads',
    'Your site feels slow, unclear, or hard to use',
  ],
} as const;

// ---------------------------------------------------------------------------
// Next steps
// ---------------------------------------------------------------------------

export const faqNextSteps = {
  title: 'What happens next',
  steps: [
    'You send me the URL',
    'I look at speed, structure, and messaging',
    'I reply with what I would fix',
    'You get a clear next step',
    'No pressure to proceed',
  ],
} as const;

// ---------------------------------------------------------------------------
// Final CTA
// ---------------------------------------------------------------------------

export const faqFinalCta = {
  title: "Send me your website. I'll tell you what is stopping people getting in touch.",
  supportingText: "No pressure. I'll just show you what I see.",
  primaryCtaLabel: 'Send me your website',
  primaryCtaHref: '/contact/',
  secondaryText: "Or email me if that's easier",
  secondaryEmail: 'joe@vividmediacheshire.com',
} as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Flatten all visible FAQs for schema generation (plain text only). */
export function getAllVisibleFAQs(): Array<{
  question: string;
  answer: string;
}> {
  return faqSections.flatMap((section) =>
    section.items.map((item) => ({
      question: item.question,
      answer: item.answerText,
    })),
  );
}
