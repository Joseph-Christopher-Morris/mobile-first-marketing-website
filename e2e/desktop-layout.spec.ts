import { test, expect } from '@playwright/test';

/**
 * Desktop Layout Tests (1024px+ width)
 * Task 9.3: Test desktop layout
 * Requirements: 12.5
 */

const BASE_URL = process.env.TEST_URL || 'https://d15sc9fc739ev2.cloudfront.net';
const DESKTOP_WIDTH = 1440;
const DESKTOP_HEIGHT = 900;

test.describe('Desktop Layout Tests (1024px+)', () => {
  test.use({ viewport: { width: DESKTOP_WIDTH, height: DESKTOP_HEIGHT } });

  test.describe('Home Page', () => {
    test('services cards display three per row, centered', async ({ page }) => {
      await page.goto(`${BASE_URL}/`);
      
      // Wait for services section to load
      await page.waitForSelector('.grid', { timeout: 10000 });
      
      // Check grid layout
      const grid = page.locator('.grid').first();
      await expect(grid).toBeVisible();
      
      // Check for 3-column grid on desktop
      const gridClasses = await grid.getAttribute('class');
      expect(gridClasses).toContain('lg:grid-cols-3');
      
      // Check for centering
      expect(gridClasses).toContain('justify-items-center');
      
      // Count service cards
      const cards = page.locator('.bg-white.rounded-2xl');
      const cardCount = await cards.count();
      expect(cardCount).toBeGreaterThanOrEqual(3);
      
      console.log(`✓ Services grid: ${cardCount} cards in 3-column layout, centered`);
    });

    test('press logos display in single row', async ({ page }) => {
      await page.goto(`${BASE_URL}/`);
      
      // Wait for press logos section
      await page.waitForSelector('img[alt*="logo"]', { timeout: 10000 });
      
      // Get all press logo images
      const logos = page.locator('img[alt*="logo"]');
      const logoCount = await logos.count();
      expect(logoCount).toBeGreaterThanOrEqual(7);
      
      // Check if logos are in a single row by comparing Y positions
      const positions = await logos.evaluateAll((elements) => {
        return elements.map(el => {
          const rect = el.getBoundingClientRect();
          return { top: Math.floor(rect.top), left: rect.left };
        });
      });
      
      // All logos should have the same top position (single row)
      const uniqueTops = new Set(positions.map(p => p.top));
      expect(uniqueTops.size).toBeLessThanOrEqual(2); // Allow for minor pixel differences
      
      console.log(`✓ Press logos: ${logoCount} logos in single row`);
    });

    test('pricing teaser renders correctly', async ({ page }) => {
      await page.goto(`${BASE_URL}/`);
      
      // Look for pricing teaser section
      const pricingSection = page.locator('section.py-12.bg-gray-50').filter({
        has: page.locator('text=/Simple.*transparent.*pricing/i')
      });
      
      await expect(pricingSection).toBeVisible();
      
      // Check for heading
      const heading = pricingSection.locator('h2');
      await expect(heading).toBeVisible();
      const headingText = await heading.textContent();
      expect(headingText?.toLowerCase()).toContain('pricing');
      
      // Check for pricing link/button
      const pricingLink = pricingSection.locator('a[href="/pricing"]');
      await expect(pricingLink).toBeVisible();
      
      console.log(`✓ Pricing teaser: heading and link present`);
    });

    test('no horizontal scrolling', async ({ page }) => {
      await page.goto(`${BASE_URL}/`);
      
      const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
      const windowWidth = await page.evaluate(() => window.innerWidth);
      
      expect(scrollWidth).toBeLessThanOrEqual(windowWidth);
      
      console.log(`✓ No horizontal scroll: body ${scrollWidth}px, window ${windowWidth}px`);
    });
  });

  test.describe('Service Pages - Pricing Blocks', () => {
    const servicePages = [
      { url: '/services/hosting', name: 'Hosting' },
      { url: '/services/photography', name: 'Photography' },
      { url: '/services/ad-campaigns', name: 'Ads/Campaigns' },
      { url: '/services/analytics', name: 'Analytics' },
    ];

    for (const servicePage of servicePages) {
      test(`${servicePage.name} page pricing block renders correctly`, async ({ page }) => {
        await page.goto(`${BASE_URL}${servicePage.url}`);
        
        // Look for pricing block (white or slate background)
        const pricingBlock = page.locator('.bg-white.rounded-2xl, .bg-slate-50.rounded-2xl').filter({
          has: page.locator('text=/pricing/i')
        }).first();
        
        await expect(pricingBlock).toBeVisible({ timeout: 10000 });
        
        // Check for heading
        const heading = pricingBlock.locator('h2, h3').first();
        await expect(heading).toBeVisible();
        const headingText = await heading.textContent();
        expect(headingText?.toLowerCase()).toContain('pricing');
        
        // Check for pricing link
        const pricingLink = pricingBlock.locator('a[href="/pricing"]');
        await expect(pricingLink).toBeVisible();
        
        console.log(`✓ ${servicePage.name}: pricing block with heading and link`);
      });

      test(`${servicePage.name} page has no horizontal scrolling`, async ({ page }) => {
        await page.goto(`${BASE_URL}${servicePage.url}`);
        
        const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
        const windowWidth = await page.evaluate(() => window.innerWidth);
        
        expect(scrollWidth).toBeLessThanOrEqual(windowWidth);
        
        console.log(`✓ ${servicePage.name}: no horizontal scroll`);
      });
    }
  });

  test.describe('Layout Consistency', () => {
    test('all pages maintain consistent max-width containers', async ({ page }) => {
      const pages = [
        '/',
        '/services/hosting',
        '/services/photography',
        '/services/ad-campaigns',
        '/services/analytics',
      ];

      for (const pagePath of pages) {
        await page.goto(`${BASE_URL}${pagePath}`);
        
        // Check for max-width containers
        const containers = page.locator('[class*="max-w-"]');
        const count = await containers.count();
        
        expect(count).toBeGreaterThan(0);
        
        console.log(`✓ ${pagePath}: ${count} max-width containers found`);
      }
    });

    test('responsive grid classes are present', async ({ page }) => {
      await page.goto(`${BASE_URL}/`);
      
      // Check for responsive grid on services section
      const grid = page.locator('.grid').first();
      const gridClasses = await grid.getAttribute('class');
      
      // Should have responsive breakpoints
      expect(gridClasses).toMatch(/sm:grid-cols-\d+/);
      expect(gridClasses).toMatch(/lg:grid-cols-\d+/);
      
      console.log(`✓ Responsive grid classes present: ${gridClasses}`);
    });
  });
});
