import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test.describe('Press Logos Accessibility Compliance', () => {
  test.beforeEach(async ({ page }) => {
    // Test on home page
    await page.goto('http://localhost:3000');
    await injectAxe(page);
  });

  test('should have descriptive alt text for all logos', async ({ page }) => {
    const logos = await page.locator('img[alt*="logo"]').all();
    
    expect(logos.length).toBe(7);
    
    const expectedAltTexts = [
      'BBC News logo',
      'Forbes logo',
      'Financial Times logo',
      'CNN logo',
      'AutoTrader logo',
      'Daily Mail logo',
      'Business Insider logo'
    ];
    
    for (const expectedAlt of expectedAltTexts) {
      const logo = page.locator(`img[alt="${expectedAlt}"]`);
      await expect(logo).toBeVisible();
    }
  });

  test('should have aria-label attributes on logo containers', async ({ page }) => {
    const containers = await page.locator('[aria-label*="feature logo"]').all();
    
    expect(containers.length).toBe(7);
    
    const expectedAriaLabels = [
      'BBC News feature logo',
      'Forbes feature logo',
      'Financial Times feature logo',
      'CNN feature logo',
      'AutoTrader feature logo',
      'Daily Mail feature logo',
      'Business Insider feature logo'
    ];
    
    for (const expectedLabel of expectedAriaLabels) {
      const container = page.locator(`[aria-label="${expectedLabel}"]`);
      await expect(container).toBeVisible();
    }
  });

  test('should support keyboard navigation without layout disruption', async ({ page }) => {
    // Get initial viewport dimensions
    const initialViewport = page.viewportSize();
    
    // Focus on the first logo container
    await page.keyboard.press('Tab');
    
    // Check that viewport hasn't changed (no layout disruption)
    const afterTabViewport = page.viewportSize();
    expect(afterTabViewport).toEqual(initialViewport);
    
    // Verify no horizontal scroll appeared
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalScroll).toBe(false);
  });

  test('should meet WCAG 2.1 Level AA color contrast in default state', async ({ page }) => {
    // Run axe accessibility check
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: {
        html: true,
      },
    });
  });

  test('should meet WCAG 2.1 Level AA color contrast in hover state', async ({ page }) => {
    const firstLogo = page.locator('[aria-label*="feature logo"]').first();
    
    // Hover over the first logo
    await firstLogo.hover();
    
    // Run axe accessibility check in hover state
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: {
        html: true,
      },
    });
  });

  test('should pass axe accessibility scan on home page', async ({ page }) => {
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: {
        html: true,
      },
    });
  });

  test('should pass axe accessibility scan on photography page', async ({ page }) => {
    await page.goto('http://localhost:3000/services/photography');
    await injectAxe(page);
    
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: {
        html: true,
      },
    });
  });
});
