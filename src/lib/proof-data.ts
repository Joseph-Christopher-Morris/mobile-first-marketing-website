/**
 * Shared proof data constants for the SCRAM proof-driven conversion system.
 *
 * All proof components and pages must import from this file
 * rather than duplicating data in component internals.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SpeedProof {
  before: { loadTime: string; performanceScore: number };
  after: { loadTime: string; performanceScore: number };
  unit: string;
}

export interface NYCCProof {
  adminTimeSaved: string;
  outcomes: string[];
  social: { followers: number; posts: number; reactions: number; period: string };
  attribution: string;
}

export interface TheFeedGroupProof {
  clicks: number;
  impressions: string;
  ctr: string;
  avgCpc: string;
  attribution: string;
}

export interface StockProof {
  revenueStart: string;
  revenueEnd: string;
  interpretation: string;
}

export interface AhrefsProof {
  healthScoreBefore: number;
  healthScoreAfter: number;
  period: string;
  fixes: string[];
  copySnippets: {
    veryShort: string;
    short: string;
    medium: string;
  };
  attribution: string;
}

export interface CTAData {
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
}

// ---------------------------------------------------------------------------
// Proof constants
// ---------------------------------------------------------------------------

export const SPEED_PROOF: SpeedProof = {
  before: { loadTime: '14+', performanceScore: 56 },
  after: { loadTime: '<2', performanceScore: 99 },
  unit: 'seconds',
} as const;

export const NYCC_PROOF: NYCCProof = {
  adminTimeSaved: '8 hours per year',
  outcomes: [
    'Clearer booking and information structure',
    'Fewer confused enquiries',
  ],
  social: { followers: 270, posts: 66, reactions: 475, period: '90 days' },
  attribution: 'NYCC project',
} as const;

/** One approved final figure set only — no alternate rounded values. */
export const THEFEEDGROUP_PROOF: TheFeedGroupProof = {
  clicks: 40,
  impressions: '1.25K',
  ctr: '3.14%',
  avgCpc: '£3.58',
  attribution: 'THEFEEDGROUP Google Ads campaign',
} as const;

export const STOCK_PROOF: StockProof = {
  revenueStart: '£1.88',
  revenueEnd: '£928.07',
  interpretation:
    'Every sale is a data point. Over time, the pattern shows what people actually need. I follow that pattern instead of guessing.',
} as const;

export const AHREFS_PROOF: AhrefsProof = {
  healthScoreBefore: 71,
  healthScoreAfter: 91,
  period: 'February 2026 to March 2026',
  fixes: [
    'Removing false-positive broken links from Cloudflare email obfuscation',
    'Improving internal link health',
    'Invalidating stale CloudFront cache',
    'Refining page-level SEO signals',
    'Improving crawl consistency',
  ],
  copySnippets: {
    veryShort:
      'Ahrefs Health Score improved from 71 to 91 after technical SEO and crawl fixes.',
    short:
      "I improved my site's Ahrefs Health Score from 71 to 91 by fixing crawl errors, false broken links, and internal link issues.",
    medium:
      "I improved my own site's Ahrefs Health Score from 71 to 91 by fixing crawl errors, false broken links caused by infrastructure settings, and internal link health. That made the site easier for search engines to crawl properly.",
  },
  attribution: "Joe's own website",
} as const;

// ---------------------------------------------------------------------------
// CTA constants
// ---------------------------------------------------------------------------

export const STANDARD_CTA: CTAData = {
  primaryLabel: 'Send me your website',
  primaryHref: '/contact/',
  secondaryLabel: 'Email me directly',
  secondaryHref: 'mailto:joe@vividmediacheshire.com',
} as const;

export const PHOTOGRAPHY_CTA: CTAData = {
  primaryLabel: 'Book your photoshoot',
  primaryHref: '#contact',
  secondaryLabel: 'View portfolio',
  secondaryHref: '#gallery',
} as const;
