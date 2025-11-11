import { test, expect } from '@playwright/test';

/**
 * Responsive Design Testing
 * Tests mobile (375px), tablet (768px), and desktop (1024px+) layouts
 * Requirements: 12.1, 12.2, 12.3, 12.4, 12.5
 */

const BASE_URL = 'https://d15sc9fc739ev2.cloudfront.net';

test.describe('Mobile Layout (375px)', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('services cards display one per row', async ({ page }) => {
    await page.goto(BASE_URL);
    
    const servicesGrid = page.locator('section:has-text("My Services") .grid').first();
    await expect(servicesGrid).toBeVisible();
    
    // Check grid columns
    const gridColumns = await servicesGrid.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.gridTemplateColumns.split(' ').length;
    });
    
    expect(gridColumns).toBe(1);
  });

  test('pricing cards remain readable', async ({ page }) => {
    await page.goto(BASE_URL);
    
    const pricingSection = page.locator('section:has-text("pricing")').first();
    await expect(pricingSection).toBeVisible();
    
    // Check no overflow
    const hasOverflow = await pricingSection.evaluate((el) => {
      return el.scrollWidth > el.clientWidth;
    });
    
    expect(hasOverflow).toBe(false);
  });

  test('press logos wrap properly', async ({ page }) => {
    await page.goto(BASE_URL);
    
    const logosContainer = page.locator('.flex.flex-wrap').first();
    await expect(logosContainer).toBeVisible();
    
    const flexWrap = await logosContainer.evaluate((el) => {
      return window.getComputedStyle(el).flexWrap;
    });
    
    expect(flexWrap).toBe('wrap');
  });

  test('no horizontal scrolling', async ({ page }) => {
    await page.goto(BASE_URL);
    
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.body.scrollWidth > window.innerWidth;
    });
    
    expect(hasHorizontalScroll).toBe(false);
  });
});

test.describe('Tablet Layout (768px)', () => {
  test.use({ viewport: { width: 768, height: 1024 } });

  test('services cards display two per row', async ({ page }) => {
    await page.goto(BASE_URL);
    
    const servicesGrid = page.locator('section:has-text("My Services") .grid').first();
    await expect(servicesGrid).toBeVisible();
    
    const gridColumns = await servicesGrid.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.gridTemplateColumns.split(' ').length;
    });
    
    expect(gridColumns).toBe(2);
  });

  test('pricing blocks render correctly', async ({ page }) => {
    await page.goto(BASE_URL);
    
    const pricingSection = page.locator('section:has-text("pricing")').first();
    await expect(pricingSection).toBeVisible();
    
    const isVisible = await pricingSection.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden';
    });
    
    expect(isVisible).toBe(true);
  });

  test('press logos layout correct', async ({ page }) => {
    await page.goto(BASE_URL);
    
    const logosContainer = page.locator('.flex.flex-wrap').first();
    await expect(logosContainer).toBeVisible();
    
    const flexWrap = await logosContainer.evaluate((el) => {
      return window.getComputedStyle(el).flexWrap;
    });
    
    expect(flexWrap).toBe('wrap');
  });
});

test.describe('Desktop Layout (1440px)', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('services cards display three per row, centered', async ({ page }) => {
    await page.goto(BASE_URL);
    
    const servicesGrid = page.locator('section:has-text("My Services") .grid').first();
    await expect(servicesGrid).toBeVisible();
    
    const gridInfo = await servicesGrid.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        columns: style.gridTemplateColumns.split(' ').length,
        justifyItems: style.justifyItems
      };
    });
    
    expect(gridInfo.columns).toBe(3);
    expect(gridInfo.justifyItems).toBe('center');
  });

  test('all pricing blocks render correctly', async ({ page }) => {
    await page.goto(BASE_URL);
    
    const pricingSection = page.locator('section:has-text("pricing")').first();
    await expect(pricingSection).toBeVisible();
    
    const pricingLink = page.locator('a[href="/pricing"]').first();
    await expect(pricingLink).toBeVisible();
  });

  test('press logos display in single row', async ({ page }) => {
    await page.goto(BASE_URL);
    
    const logosContainer = page.locator('.flex.flex-wrap').first();
    await expect(logosContainer).toBeVisible();
    
    const logos = logosContainer.locator('img');
    const logoCount = await logos.count();
    
    expect(logoCount).toBeGreaterThan(0);
    
    // Check if logos are roughly on same horizontal line
    const positions = await logos.evaluateAll((elements) => {
      return elements.map(el => {
        const rect = el.getBoundingClientRect();
        return rect.top;
      });
    });
    
    const firstTop = positions[0];
    const allOnSameLine = positions.every(top => Math.abs(top - firstTop) < 50);
    
    expect(allOnSameLine).toBe(true);
  });
});

test.describe('Service Pages Pricing Blocks', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  const servicePages = [
    { name: 'Hosting', url: '/services/hosting' },
    { name: 'Photography', url: '/services/photography' },
    { name: 'Ad Campaigns', url: '/services/ad-campaigns' },
    { name: 'Analytics', url: '/services/analytics' }
  ];

  for (const service of servicePages) {
    test(`${service.name} page has pricing block`, async ({ page }) => {
      await page.goto(`${BASE_URL}${service.url}`);
      
      const pricingSection = page.locator('section:has-text("pricing"), div:has-text("pricing")').first();
      await expect(pricingSection).toBeVisible();
      
      const pricingLink = page.locator('a[href="/pricing"]').first();
      await expect(pricingLink).toBeVisible();
    });
  }
});
