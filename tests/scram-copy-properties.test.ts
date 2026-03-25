/**
 * SCRAM Copy Elimination — Property-Based Test Suite
 *
 * Tests all 16 correctness properties from the design document.
 * Properties 1–14 read page source (.tsx) files and extract visible text content.
 * Properties 15–16 are covered by tests/schema-generator.test.ts (referenced here).
 *
 * Test stability rules:
 *   - Ignore: code comments, import paths, CSS class names, JSON-LD keys,
 *     test fixtures, alt attributes on images
 *   - Extract visible text content only, stripping HTML tags and script blocks
 *
 * Pages are enabled per-property as their copy pass completes.
 */

import { describe, it, expect, test } from 'vitest';
import * as fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';
import { CANONICAL } from '@/config/canonical';

// ---------------------------------------------------------------------------
// Page registry — enable pages as their copy pass completes
// ---------------------------------------------------------------------------

interface PageEntry {
  name: string;
  file: string;
  /** Set to true once the page's copy pass is complete */
  copyDone: boolean;
}

const PAGES: PageEntry[] = [
  { name: 'Homepage', file: 'src/app/page.tsx', copyDone: true },
  { name: 'About', file: 'src/app/about/page.tsx', copyDone: false },
  { name: 'Contact', file: 'src/app/contact/page.tsx', copyDone: false },
  { name: 'Pricing', file: 'src/app/pricing/page.tsx', copyDone: true },
  { name: 'Free Audit', file: 'src/app/free-audit/page.tsx', copyDone: true },
  { name: 'Services', file: 'src/app/services/page.tsx', copyDone: false },
  { name: 'Website Design', file: 'src/app/services/website-design/page.tsx', copyDone: true },
  { name: 'Website Hosting', file: 'src/app/services/website-hosting/page.tsx', copyDone: false },
  { name: 'Ad Campaigns', file: 'src/app/services/ad-campaigns/page.tsx', copyDone: false },
  { name: 'Analytics', file: 'src/app/services/analytics/page.tsx', copyDone: false },
  { name: 'Photography', file: 'src/app/services/photography/page.tsx', copyDone: false },
  { name: 'Blog Index', file: 'src/app/blog/page.tsx', copyDone: false },
  { name: 'Privacy Policy', file: 'src/app/privacy-policy/page.tsx', copyDone: false },
];

// Pages that have completed their copy pass — test all properties on these
const COPY_DONE_PAGES = PAGES.filter((p) => p.copyDone);

// All pages — used for structural properties (11, 12) that are already satisfied
const ALL_PAGES = PAGES.filter((p) => fs.existsSync(path.resolve(p.file)));

// ---------------------------------------------------------------------------
// Banned lists (from requirements)
// ---------------------------------------------------------------------------

const BANNED_GENERIC_PHRASES = [
  'help businesses grow',
  'improve your online presence',
  'solutions tailored to your needs',
  'high-quality services',
  'designed to help',
  'enhance your ability',
  'comprehensive',
  'leverage',
  'streamline',
];

const BANNED_FILLER_PHRASES = [
  'no jargon',
  'no fuss',
  'plain english',
  'no obligation',
  'no pressure',
  'no sales pitch',
  'whichever you prefer',
  'clear next steps',
];

const BANNED_BUZZWORDS = [
  'bespoke',
  'cutting-edge',
  'innovative',
  'seamless',
  'robust',
  'scalable',
  'holistic',
  'synergy',
  'optimize',
  'empower',
];

const REASSURANCE_PHRASES = [
  'i reply the same day',
  'based in nantwich, working with south cheshire businesses',
  'you deal directly with me',
];

const CORE_LANGUAGE = [
  'your website feels like hard work',
  'it is not obvious what to do next',
  'people leave',
  'i fix that',
  'i remove the friction',
  'i make it obvious what to do next',
];

const BANNED_CTA_HEADINGS = [
  'ready to get more enquiries?',
  "let's fix your website",
];

// ---------------------------------------------------------------------------
// Text extraction helpers
// ---------------------------------------------------------------------------

/**
 * Read a page source file and extract only visible text content.
 * Strips: imports, code comments, CSS class names, JSON-LD script blocks,
 * image alt attributes, and HTML tags.
 */
function extractVisibleText(filePath: string): string {
  const raw = fs.readFileSync(path.resolve(filePath), 'utf-8');

  let text = raw;

  // 1. Remove single-line comments (// ...)
  text = text.replace(/\/\/.*$/gm, '');

  // 2. Remove multi-line comments (/* ... */)
  text = text.replace(/\/\*[\s\S]*?\*\//g, '');

  // 3. Remove import statements (single-line and multi-line)
  text = text.replace(/^import\s+.*$/gm, '');
  text = text.replace(/^import\s*\{[\s\S]*?\}\s*from\s*['"][^'"]*['"];?\s*$/gm, '');
  text = text.replace(/^import\s+[\s\S]*?from\s*['"][^'"]*['"];?\s*$/gm, '');

  // 4. Remove export const metadata = ... blocks (metadata objects, not visible copy)
  // Match the full block including nested objects and function calls
  text = text.replace(/export\s+const\s+metadata[\s\S]*?(?:^|\n)\}\);?\s*\n/gm, '');

  // 4a. Remove schema builder arrays (const xxxSchemas = [...])
  // These contain JSON-LD data, not visible copy
  text = text.replace(/(?:const|let|var)\s+\w*[Ss]chemas?\s*=\s*\[[\s\S]*?\];\s*/g, '');

  // 4b. Remove export default function/async function declarations and their opening
  text = text.replace(/export\s+default\s+(async\s+)?function\s+\w+\([^)]*\)\s*\{/g, '');

  // 4c. Remove const/let/var declarations (code, not copy)
  text = text.replace(/\b(const|let|var)\s+\w+[\s\S]*?[;{]/g, ' ');

  // 4d. Remove await expressions
  text = text.replace(/\bawait\s+\w+[^;]*/g, '');

  // 4e. Remove return statements
  text = text.replace(/\breturn\s*\(/g, '');

  // 4f. Remove function calls like getAllBlogPosts(), .slice(), .map(), etc.
  text = text.replace(/\.\w+\([^)]*\)/g, '');

  // 5. Remove JSON-LD script blocks
  text = text.replace(/<script[\s\S]*?type\s*=\s*["']application\/ld\+json["'][\s\S]*?<\/script>/gi, '');

  // 6. Remove all <script> blocks (inline JS)
  text = text.replace(/<script[\s\S]*?<\/script>/gi, '');

  // 7. Remove dangerouslySetInnerHTML blocks
  text = text.replace(/dangerouslySetInnerHTML\s*=\s*\{\s*\{\s*__html\s*:\s*`[\s\S]*?`\s*\}\s*\}/g, '');

  // 8. Remove image alt attributes (alt="..." or alt='...')
  text = text.replace(/\balt\s*=\s*"[^"]*"/g, '');
  text = text.replace(/\balt\s*=\s*'[^']*'/g, '');
  text = text.replace(/\balt\s*=\s*\{[^}]*\}/g, '');

  // 9. Remove CSS class names (className="..." or className='...' or className={...})
  text = text.replace(/\bclassName\s*=\s*"[^"]*"/g, '');
  text = text.replace(/\bclassName\s*=\s*'[^']*'/g, '');
  text = text.replace(/\bclassName\s*=\s*\{[^}]*\}/g, '');

  // 10. Remove href/src attribute values (but keep the text content)
  text = text.replace(/\bhref\s*=\s*"[^"]*"/g, '');
  text = text.replace(/\bhref\s*=\s*'[^']*'/g, '');
  text = text.replace(/\bsrc\s*=\s*"[^"]*"/g, '');
  text = text.replace(/\bsrc\s*=\s*'[^']*'/g, '');

  // 10b. Extract string values from JSX props before stripping tags
  // Props like heading="...", body="...", subline="...", etc. contain visible text
  // Replace prop="value" with just value (space-separated) so it survives tag stripping
  const NON_COPY_PROPS = /\b(className|href|src|alt|aria-label|ariaLabel|type|sizes|fill|stroke|viewBox|strokeLinecap|strokeLinejoin|strokeWidth|fetchPriority|quality|dateTime|key|id|rel|target)\b/;
  text = text.replace(/<([A-Z][A-Za-z]*)\s+([^>]+?)\/?\s*>/g, (match, _tag, attrs) => {
    // Extract string prop values from self-closing or opening component tags
    const values: string[] = [];
    const propRegex = /(\w+)\s*=\s*"([^"]*)"/g;
    let m;
    while ((m = propRegex.exec(attrs)) !== null) {
      const propName = m[1];
      const propValue = m[2];
      if (!NON_COPY_PROPS.test(propName) && propValue.length > 3 && !/^[\/\.]/.test(propValue)) {
        values.push(propValue);
      }
    }
    return values.length > 0 ? ' ' + values.join('. ') + ' ' : ' ';
  });
  // 11. Remove JSON-LD keys (@type, @context, etc.)
  text = text.replace(/"@(type|context|id|graph|list|set|reverse|language|value|base|vocab)"/g, '');

  // 12. Remove HTML/JSX tags but keep text content
  // Block-level elements get a period to create sentence boundaries
  text = text.replace(/<\/(?:h[1-6]|p|li|div|section|article|header|footer|blockquote|tr|td|th|dt|dd)>/gi, '. ');
  text = text.replace(/<[^>]+>/g, ' ');

  // 13. Remove JSX expression containers that are just variable references
  text = text.replace(/\{[a-zA-Z_$][a-zA-Z0-9_$.]*\}/g, '');

  // 13b. Remove remaining JSX expression containers (objects, arrays, ternaries, etc.)
  text = text.replace(/\{[^}]*\}/g, '. ');

  // 13c. Remove remaining curly braces
  text = text.replace(/[{}]/g, ' ');

  // 14. Collapse whitespace
  text = text.replace(/\s+/g, ' ').trim();

  // 14b. Clean up punctuation artifacts (multiple periods, period after period)
  text = text.replace(/\.(\s*\.)+/g, '.');
  text = text.replace(/\.\s*,/g, '.');

  return text;
}

/**
 * Extract visible text specifically from string literals in JSX content.
 * This is more targeted — it pulls text from quoted strings and JSX text nodes.
 */
function extractStringLiterals(filePath: string): string[] {
  const raw = fs.readFileSync(path.resolve(filePath), 'utf-8');

  // Remove comments
  let text = raw.replace(/\/\/.*$/gm, '');
  text = text.replace(/\/\*[\s\S]*?\*\//g, '');

  // Remove imports
  text = text.replace(/^import\s+.*$/gm, '');

  // Remove export const metadata blocks
  text = text.replace(/export\s+const\s+metadata\s*=[\s\S]*?;\s*\n/g, '');

  // Remove script blocks
  text = text.replace(/<script[\s\S]*?<\/script>/gi, '');
  text = text.replace(/dangerouslySetInnerHTML\s*=\s*\{\s*\{\s*__html\s*:\s*`[\s\S]*?`\s*\}\s*\}/g, '');

  // Remove alt attributes
  text = text.replace(/\balt\s*=\s*"[^"]*"/g, '');
  text = text.replace(/\balt\s*=\s*'[^']*'/g, '');

  // Remove className attributes
  text = text.replace(/\bclassName\s*=\s*"[^"]*"/g, '');
  text = text.replace(/\bclassName\s*=\s*'[^']*'/g, '');

  // Remove href/src attributes
  text = text.replace(/\bhref\s*=\s*"[^"]*"/g, '');
  text = text.replace(/\bsrc\s*=\s*"[^"]*"/g, '');

  // Extract double-quoted strings (likely visible text in JSX props)
  const doubleQuoted = text.match(/"([^"]{2,})"/g) || [];
  // Extract single-quoted strings
  const singleQuoted = text.match(/'([^']{2,})'/g) || [];

  const all = [...doubleQuoted, ...singleQuoted]
    .map((s) => s.slice(1, -1)) // remove quotes
    .filter((s) => !s.startsWith('/')) // remove paths
    .filter((s) => !s.startsWith('http')) // remove URLs
    .filter((s) => !s.startsWith('@')) // remove JSON-LD keys
    .filter((s) => !s.includes('{') && !s.includes('}')) // remove template expressions
    .filter((s) => !/^[a-z-]+$/.test(s)) // remove single CSS-like tokens
    .filter((s) => s.length > 3); // remove very short strings

  return all;
}

/**
 * Extract mailto: links and visible email addresses from page source.
 */
function extractEmails(filePath: string): string[] {
  const raw = fs.readFileSync(path.resolve(filePath), 'utf-8');
  const emails: string[] = [];

  // mailto: links — only capture actual email addresses, not template expressions
  const mailtoMatches = raw.match(/mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g) || [];
  for (const m of mailtoMatches) {
    emails.push(m.replace('mailto:', ''));
  }

  // Visible email patterns in text
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const visibleText = extractVisibleText(filePath);
  const visibleEmails = visibleText.match(emailPattern) || [];
  emails.push(...visibleEmails);

  return [...new Set(emails)];
}

/**
 * Extract internal links from page source.
 */
function extractInternalLinks(filePath: string): string[] {
  const raw = fs.readFileSync(path.resolve(filePath), 'utf-8');
  const links: string[] = [];

  // href="/..." patterns
  const hrefMatches = raw.match(/href\s*=\s*"(\/[^"]*?)"/g) || [];
  for (const m of hrefMatches) {
    const match = m.match(/href\s*=\s*"(\/[^"]*?)"/);
    if (match) links.push(match[1]);
  }

  return links;
}

/**
 * Count words in a sentence (simple whitespace split).
 */
function wordCount(sentence: string): number {
  return sentence.split(/\s+/).filter((w) => w.length > 0).length;
}

/**
 * Split visible text into sentences.
 * Handles common abbreviations and avoids splitting on decimal numbers.
 */
function splitSentences(text: string): string[] {
  // Treat checkmark/cross list items as sentence boundaries
  let normalized = text.replace(/[✓✗]/g, '.');
  // Split on sentence-ending punctuation followed by space and uppercase letter
  return normalized
    .split(/(?<=[.!?])\s+(?=[A-Z])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 5);
}

// ---------------------------------------------------------------------------
// Property 1: No banned generic phrases
// Validates: Requirements 1
// ---------------------------------------------------------------------------

describe('Property 1: No banned generic phrases', () => {
  for (const page of ALL_PAGES) {
    // Skip pages that still have banned phrases pending copy pass
    const skip = !page.copyDone && ['Pricing', 'Website Hosting'].includes(page.name);
    const testFn = skip ? it.skip : it;
    const label = skip
      ? `${page.name} contains zero banned generic phrases (enable after copy pass)`
      : `${page.name} contains zero banned generic phrases`;

    testFn(label, () => {
      const text = extractVisibleText(page.file).toLowerCase();

      fc.assert(
        fc.property(
          fc.constantFrom(...BANNED_GENERIC_PHRASES),
          (phrase) => {
            expect(text).not.toContain(phrase);
          },
        ),
        { numRuns: BANNED_GENERIC_PHRASES.length },
      );
    });
  }
});

// ---------------------------------------------------------------------------
// Property 2: No banned filler phrases
// Validates: Requirements 3
// ---------------------------------------------------------------------------

describe('Property 2: No banned filler phrases', () => {
  for (const page of ALL_PAGES) {
    const testFn = page.copyDone ? it : it.skip;
    const label = page.copyDone
      ? `${page.name} contains zero banned filler phrases`
      : `${page.name} contains zero banned filler phrases (enable after copy pass)`;

    testFn(label, () => {
      const text = extractVisibleText(page.file).toLowerCase();

      fc.assert(
        fc.property(
          fc.constantFrom(...BANNED_FILLER_PHRASES),
          (phrase) => {
            expect(text).not.toContain(phrase);
          },
        ),
        { numRuns: BANNED_FILLER_PHRASES.length },
      );
    });
  }
});

// ---------------------------------------------------------------------------
// Property 3: No banned buzzwords
// Validates: Requirements 5
// ---------------------------------------------------------------------------

describe('Property 3: No banned buzzwords', () => {
  for (const page of ALL_PAGES) {
    const testFn = page.copyDone ? it : it.skip;
    const label = page.copyDone
      ? `${page.name} contains zero banned buzzwords`
      : `${page.name} contains zero banned buzzwords (enable after copy pass)`;

    testFn(label, () => {
      const text = extractVisibleText(page.file).toLowerCase();

      fc.assert(
        fc.property(
          fc.constantFrom(...BANNED_BUZZWORDS),
          (buzzword) => {
            const regex = new RegExp(`\\b${buzzword}\\b`, 'i');
            expect(regex.test(text)).toBe(false);
          },
        ),
        { numRuns: BANNED_BUZZWORDS.length },
      );
    });
  }
});

// ---------------------------------------------------------------------------
// Property 4: No "we" in copy
// Validates: Requirements 5.1
// ---------------------------------------------------------------------------

describe('Property 4: No "we" in copy', () => {
  for (const page of ALL_PAGES) {
    const testFn = page.copyDone ? it : it.skip;
    const label = page.copyDone
      ? `${page.name} contains zero "we" as first-person pronoun`
      : `${page.name} contains zero "we" as first-person pronoun (enable after copy pass)`;

    testFn(label, () => {
      const text = extractVisibleText(page.file);
      const weMatches = text.match(/\bwe\b/gi) || [];
      expect(weMatches.length).toBe(0);
    });
  }
});

// ---------------------------------------------------------------------------
// Property 5: No em dashes
// Validates: Requirements 5.2
// ---------------------------------------------------------------------------

describe('Property 5: No em dashes', () => {
  for (const page of ALL_PAGES) {
    const testFn = page.copyDone ? it : it.skip;
    const label = page.copyDone
      ? `${page.name} contains zero em dash characters`
      : `${page.name} contains zero em dash characters (enable after copy pass)`;

    testFn(label, () => {
      const text = extractVisibleText(page.file);
      expect(text).not.toContain('\u2014');
    });
  }
});

// ---------------------------------------------------------------------------
// Property 6: Sentence length (max 26 words)
// Validates: Requirements 4
// ---------------------------------------------------------------------------

describe('Property 6: Sentence length', () => {
  for (const page of ALL_PAGES) {
    const testFn = page.copyDone ? it : it.skip;
    const label = page.copyDone
      ? `${page.name} has no sentence exceeding 26 words`
      : `${page.name} has no sentence exceeding 26 words (enable after copy pass)`;

    testFn(label, () => {
      const text = extractVisibleText(page.file);
      const sentences = splitSentences(text);

      for (const sentence of sentences) {
        const count = wordCount(sentence);
        expect(
          count,
          `Sentence exceeds 26 words (${count}): "${sentence.slice(0, 80)}..."`,
        ).toBeLessThanOrEqual(26);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// Property 7: Reassurance cap (max once per page)
// Validates: Requirements 10
// ---------------------------------------------------------------------------

describe('Property 7: Reassurance cap', () => {
  for (const page of ALL_PAGES) {
    const testFn = page.copyDone ? it : it.skip;
    const label = page.copyDone
      ? `${page.name} has each reassurance phrase at most once`
      : `${page.name} has each reassurance phrase at most once (enable after copy pass)`;

    testFn(label, () => {
      const text = extractVisibleText(page.file).toLowerCase();

      fc.assert(
        fc.property(
          fc.constantFrom(...REASSURANCE_PHRASES),
          (phrase) => {
            const regex = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
            const matches = text.match(regex) || [];
            expect(
              matches.length,
              `"${phrase}" appears ${matches.length} times on ${page.name}`,
            ).toBeLessThanOrEqual(1);
          },
        ),
        { numRuns: REASSURANCE_PHRASES.length },
      );
    });
  }
});

// ---------------------------------------------------------------------------
// Property 8: Core language presence (Homepage + Website Design)
// Validates: Requirements 6
// ---------------------------------------------------------------------------

describe('Property 8: Core language presence', () => {
  const corePages = ALL_PAGES.filter(
    (p) => p.name === 'Homepage' || p.name === 'Website Design',
  );

  for (const page of corePages) {
    const testFn = page.copyDone ? it : it.skip;
    const label = page.copyDone
      ? `${page.name} contains at least two Core_Language phrases`
      : `${page.name} contains at least two Core_Language phrases (enable after copy pass)`;

    testFn(label, () => {
      const text = extractVisibleText(page.file).toLowerCase();
      let count = 0;
      for (const phrase of CORE_LANGUAGE) {
        if (text.includes(phrase.toLowerCase())) count++;
      }
      expect(
        count,
        `${page.name} has ${count} Core_Language phrases, need at least 2`,
      ).toBeGreaterThanOrEqual(2);
    });
  }
});

// ---------------------------------------------------------------------------
// Property 9: Core language repetition cap (max 2 per page, outside CTA/FAQ)
// Validates: Requirements 6.5
// ---------------------------------------------------------------------------

describe('Property 9: Core language repetition cap', () => {
  for (const page of ALL_PAGES) {
    const testFn = page.copyDone ? it : it.skip;
    const label = page.copyDone
      ? `${page.name} has no Core_Language phrase more than twice`
      : `${page.name} has no Core_Language phrase more than twice (enable after copy pass)`;

    testFn(label, () => {
      const text = extractVisibleText(page.file).toLowerCase();

      fc.assert(
        fc.property(
          fc.constantFrom(...CORE_LANGUAGE),
          (phrase) => {
            const regex = new RegExp(
              phrase.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
              'gi',
            );
            const matches = text.match(regex) || [];
            expect(
              matches.length,
              `"${phrase}" appears ${matches.length} times on ${page.name}`,
            ).toBeLessThanOrEqual(2);
          },
        ),
        { numRuns: CORE_LANGUAGE.length },
      );
    });
  }
});

// ---------------------------------------------------------------------------
// Property 10: CTA copy directness (no banned CTA headings)
// Validates: Requirements 7
// ---------------------------------------------------------------------------

describe('Property 10: CTA copy directness', () => {
  for (const page of ALL_PAGES) {
    const testFn = page.copyDone ? it : it.skip;
    const label = page.copyDone
      ? `${page.name} has no banned CTA headings`
      : `${page.name} has no banned CTA headings (enable after copy pass)`;

    testFn(label, () => {
      const text = extractVisibleText(page.file).toLowerCase();

      fc.assert(
        fc.property(
          fc.constantFrom(...BANNED_CTA_HEADINGS),
          (heading) => {
            expect(text).not.toContain(heading);
          },
        ),
        { numRuns: BANNED_CTA_HEADINGS.length },
      );
    });
  }
});

// ---------------------------------------------------------------------------
// Property 11: Canonical hosting route
// Validates: Requirements 14
// Zero internal links point to /services/hosting/ (must use /services/website-hosting/)
// ---------------------------------------------------------------------------

describe('Property 11: Canonical hosting route', () => {
  // ENABLED — Task 2 already fixed all hosting routes
  for (const page of ALL_PAGES) {
    it(`${page.name} has zero internal links to /services/hosting/`, () => {
      const links = extractInternalLinks(page.file);

      fc.assert(
        fc.property(
          fc.constantFrom(...(links.length > 0 ? links : ['/placeholder/'])),
          (link) => {
            // The link must not be exactly /services/hosting/ or start with /services/hosting/
            expect(link).not.toMatch(/^\/services\/hosting\//);
          },
        ),
        { numRuns: Math.max(links.length, 1) },
      );
    });
  }
});

// ---------------------------------------------------------------------------
// Property 12: Canonical email consistency
// Validates: Requirements 15
// All mailto links and visible emails use canonical email
// ---------------------------------------------------------------------------

describe('Property 12: Canonical email consistency', () => {
  // ENABLED — Task 2 already fixed all email references
  for (const page of ALL_PAGES) {
    it(`${page.name} uses only the canonical email`, () => {
      const emails = extractEmails(page.file);

      if (emails.length === 0) return; // page has no emails, that's fine

      fc.assert(
        fc.property(
          fc.constantFrom(...emails),
          (email) => {
            expect(email).toBe(CANONICAL.contact.email);
          },
        ),
        { numRuns: emails.length },
      );
    });
  }
});

// ---------------------------------------------------------------------------
// Property 13: Photography stats
// Validates: Requirements 12
// Only "3,500+ licensed images" and "90+ countries" as statistics
// ---------------------------------------------------------------------------

describe('Property 13: Photography stats', () => {
  const photoPage = ALL_PAGES.find((p) => p.name === 'Photography');

  if (photoPage) {
    it('Photography page contains approved statistics only', () => {
      // Read raw source to check both prop values and body text
      const raw = fs.readFileSync(path.resolve(photoPage.file), 'utf-8');

      // Must contain the approved stats (in proofText prop or body copy)
      // The proofText uses "3,500+" and body text uses "over 3,500"
      expect(raw).toMatch(/3,500\+?\s*(licensed\s+)?images/i);
      expect(raw).toMatch(/90\+?\s*countries/i);

      // Must NOT contain legacy metric grid numbers
      // Legacy patterns: "3+" (as in 3+ years), "50+" (as in 50+ clients), "100+" (as in 100+ projects)
      const legacyStatPatterns = [
        /\b3\+\s*(years|clients|businesses)/i,
        /\b50\+\s*(clients|businesses|projects)/i,
        /\b100\+\s*(projects|websites|clients)/i,
      ];

      for (const pattern of legacyStatPatterns) {
        expect(
          pattern.test(raw),
          `Legacy stat pattern found: ${pattern}`,
        ).toBe(false);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// Property 14: Photography hero image
// Validates: Requirements 12.1
// Photography page hero image is photography-hero.webp
// ---------------------------------------------------------------------------

describe('Property 14: Photography hero image', () => {
  const photoPage = ALL_PAGES.find((p) => p.name === 'Photography');

  if (photoPage) {
    it('Photography page uses photography-hero.webp as hero image', () => {
      const raw = fs.readFileSync(path.resolve(photoPage.file), 'utf-8');

      // The ProblemHero component should have imageSrc pointing to photography-hero.webp
      expect(raw).toContain('photography-hero.webp');

      // Verify it's NOT using the old editorial-proof image
      // Check that the hero image reference is specifically photography-hero.webp
      const heroMatch = raw.match(/imageSrc\s*=\s*"([^"]+)"/);
      if (heroMatch) {
        expect(heroMatch[1]).toContain('photography-hero.webp');
      }
    });
  }
});

// ---------------------------------------------------------------------------
// Property 15: Schema builder contracts
// Validates: Requirements 17
// Already covered by tests/schema-generator.test.ts — reference test
// ---------------------------------------------------------------------------

describe('Property 15: Schema builder contracts (reference)', () => {
  it('schema builder contract tests exist in tests/schema-generator.test.ts', () => {
    const testFile = path.resolve('tests/schema-generator.test.ts');
    expect(fs.existsSync(testFile)).toBe(true);

    const content = fs.readFileSync(testFile, 'utf-8');
    // Verify the test file covers validation/throws
    expect(content).toContain('throws on empty description');
    expect(content).toContain('throws on missing');
    expect(content).toContain('throws on empty');
  });
});

// ---------------------------------------------------------------------------
// Property 16: Schema description language
// Validates: Requirements 17.4
// Already covered by tests/schema-generator.test.ts — reference test
// ---------------------------------------------------------------------------

describe('Property 16: Schema description language (reference)', () => {
  it('schema description language tests exist in tests/schema-generator.test.ts', () => {
    const testFile = path.resolve('tests/schema-generator.test.ts');
    expect(fs.existsSync(testFile)).toBe(true);

    const content = fs.readFileSync(testFile, 'utf-8');
    // Verify the test file covers banned phrases in builder output
    expect(content).toContain('no banned generic phrases');
  });
});
