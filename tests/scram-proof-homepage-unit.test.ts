import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Unit Tests for SCRAM Proof-Driven Conversion — Homepage Service Scope,
 * Stock Proof Hierarchy, and Proof Attribution Correctness
 *
 * Feature: scram-proof-driven-conversion
 * Task: 10.7
 *
 * These are source-code analysis tests that read TSX source files and verify
 * structural patterns, section ordering, and attribution correctness.
 */

// --- Helpers ---

function readPageSource(file: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), file), 'utf-8');
}

function findPosition(source: string, pattern: string | RegExp): number {
  if (typeof pattern === 'string') {
    return source.indexOf(pattern);
  }
  const match = source.match(pattern);
  return match?.index ?? -1;
}

// --- Test Suites ---

describe('Homepage Service Scope (Validates: Requirements 6.1, 6.3)', () => {
  const homepageSource = readPageSource('src/app/page.tsx');

  it('should include a website redesign service card', () => {
    // The homepage has a two-card grid with website design card
    expect(homepageSource).toContain('/services/website-design');
  });

  it('should include a hosting service card', () => {
    // The homepage has a two-card grid with hosting card
    expect(homepageSource).toContain('/services/website-hosting');
  });

  it('should NOT include photography as a service card', () => {
    // Section 6 is the two-service card grid — extract just that section
    const section6Start = findPosition(homepageSource, '/* Section 6:');
    const section7Start = findPosition(homepageSource, '/* Section 7:');
    expect(section6Start).toBeGreaterThan(-1);
    expect(section7Start).toBeGreaterThan(-1);
    const serviceSection = homepageSource.slice(section6Start, section7Start);
    expect(serviceSection).not.toContain('/services/photography');
  });

  it('should NOT include ad-campaigns as a service card', () => {
    const section6Start = findPosition(homepageSource, '/* Section 6:');
    const section7Start = findPosition(homepageSource, '/* Section 7:');
    const serviceSection = homepageSource.slice(section6Start, section7Start);
    expect(serviceSection).not.toContain('/services/ad-campaigns');
  });

  it('should NOT include analytics as a service card', () => {
    const section6Start = findPosition(homepageSource, '/* Section 6:');
    const section7Start = findPosition(homepageSource, '/* Section 7:');
    const serviceSection = homepageSource.slice(section6Start, section7Start);
    expect(serviceSection).not.toContain('/services/analytics');
  });

  it('should have exactly two service cards in the grid', () => {
    const section6Start = findPosition(homepageSource, '/* Section 6:');
    const section7Start = findPosition(homepageSource, '/* Section 7:');
    const serviceSection = homepageSource.slice(section6Start, section7Start);
    // Count individual service card links (excluding the "View all services" link)
    const serviceCardLinks = serviceSection.match(/href='\/services\/[^']+'/g) || [];
    expect(serviceCardLinks.length).toBe(2);
  });

  it('should include a link to the full services page', () => {
    const section6Start = findPosition(homepageSource, '/* Section 6:');
    const section7Start = findPosition(homepageSource, '/* Section 7:');
    const serviceSection = homepageSource.slice(section6Start, section7Start);
    expect(serviceSection).toContain('/services/');
    expect(serviceSection).toContain('View all services');
  });
});


describe('Stock Proof Hierarchy on Homepage (Validates: Requirements 9.6, 9.7)', () => {
  const homepageSource = readPageSource('src/app/page.tsx');

  it('SpeedProofBlock appears before StockPhotographyProofBlock', () => {
    const speedPos = findPosition(homepageSource, '<SpeedProofBlock');
    const stockPos = findPosition(homepageSource, '<StockPhotographyProofBlock');
    expect(speedPos).toBeGreaterThan(-1);
    expect(stockPos).toBeGreaterThan(-1);
    expect(speedPos).toBeLessThan(stockPos);
  });

  it('NYCCProofBlock appears before StockPhotographyProofBlock', () => {
    const nyccPos = findPosition(homepageSource, '<NYCCProofBlock');
    const stockPos = findPosition(homepageSource, '<StockPhotographyProofBlock');
    expect(nyccPos).toBeGreaterThan(-1);
    expect(stockPos).toBeGreaterThan(-1);
    expect(nyccPos).toBeLessThan(stockPos);
  });

  it('TheFeedGroupProofBlock appears before StockPhotographyProofBlock', () => {
    const tfgPos = findPosition(homepageSource, '<TheFeedGroupProofBlock');
    const stockPos = findPosition(homepageSource, '<StockPhotographyProofBlock');
    expect(tfgPos).toBeGreaterThan(-1);
    expect(stockPos).toBeGreaterThan(-1);
    expect(tfgPos).toBeLessThan(stockPos);
  });

  it('StockPhotographyProofBlock uses homepage variant', () => {
    const stockMatch = homepageSource.match(/<StockPhotographyProofBlock[^>]*variant="homepage"/);
    expect(stockMatch).not.toBeNull();
  });

  it('StockPhotographyProofBlock appears after the final CTA block', () => {
    const finalCtaPos = findPosition(homepageSource, '/* Section 8: Final CTA */');
    const stockPos = findPosition(homepageSource, '/* Section 9: StockPhotographyProofBlock');
    expect(finalCtaPos).toBeGreaterThan(-1);
    expect(stockPos).toBeGreaterThan(-1);
    expect(finalCtaPos).toBeLessThan(stockPos);
  });
});

describe('Proof Attribution Correctness — Homepage (Validates: Requirements 20.1, 20.2, 20.3)', () => {
  const homepageSource = readPageSource('src/app/page.tsx');

  it('SpeedProofBlock has sourceAttribution identifying Joe\'s own website', () => {
    const attrMatch = homepageSource.match(
      /<SpeedProofBlock[^>]*sourceAttribution="([^"]*)"/
    );
    expect(attrMatch).not.toBeNull();
    const attribution = attrMatch![1].toLowerCase();
    // Must identify it as Joe's own website/rebuild
    expect(attribution).toMatch(/my own|own website|own.*rebuild/i);
  });

  it('NYCCProofBlock is present on the homepage', () => {
    expect(homepageSource).toContain('<NYCCProofBlock');
  });

  it('NYCC proof data is attributed to NYCC project via proof-data.ts', () => {
    const proofData = readPageSource('src/lib/proof-data.ts');
    expect(proofData).toContain("attribution: 'NYCC project'");
  });

  it('TheFeedGroupProofBlock is present on the homepage', () => {
    expect(homepageSource).toContain('<TheFeedGroupProofBlock');
  });

  it('THEFEEDGROUP proof data is attributed to THEFEEDGROUP campaign via proof-data.ts', () => {
    const proofData = readPageSource('src/lib/proof-data.ts');
    expect(proofData).toContain("attribution: 'THEFEEDGROUP Google Ads campaign'");
  });

  it('homepage imports proof data from src/lib/proof-data.ts', () => {
    expect(homepageSource).toContain("from '@/lib/proof-data'");
  });
});

describe('Proof Attribution Correctness — Photography Page (Validates: Requirements 20.1, 20.2, 20.3)', () => {
  const photographySource = readPageSource('src/app/services/photography/page.tsx');

  it('AuthorityProofBlock is present with publications array', () => {
    expect(photographySource).toContain('<AuthorityProofBlock');
    expect(photographySource).toContain('publications={[');
  });

  it('AuthorityProofBlock includes expected publications', () => {
    // Extract the publications section
    const pubStart = photographySource.indexOf('<AuthorityProofBlock');
    const pubEnd = photographySource.indexOf('/>', pubStart);
    const pubSection = photographySource.slice(pubStart, pubEnd);

    expect(pubSection).toContain("name: 'BBC'");
    expect(pubSection).toContain("name: 'Financial Times'");
    expect(pubSection).toContain("name: 'CNN'");
    expect(pubSection).toContain("name: 'The Times'");
  });

  it('StockPhotographyProofBlock variant="photography" is present', () => {
    const stockMatch = photographySource.match(
      /<StockPhotographyProofBlock[^>]*variant="photography"/
    );
    expect(stockMatch).not.toBeNull();
  });

  it('photography page imports from proof-data.ts', () => {
    expect(photographySource).toContain("from '@/lib/proof-data'");
  });
});
