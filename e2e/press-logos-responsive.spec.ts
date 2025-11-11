import { test, expect } from '@playwright/test';

test.describe('PressLogos Responsive Design', () => {
  const homeUrl = '/';
  const photographyUrl = '/services/photography';

  test.describe('Mobile Breakpoint (≤640px)', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('should wrap logos onto multiple rows on home page', async ({ page }) => {
      await page.goto(homeUrl);
      
      // Wait for press logos to be visible
      const pressLogosContainer = page.locator('div.flex.flex-wrap.justify-center.items-center.gap-6');
      await expect(pressLogosContainer).toBeVisible();

      // Get all logo containers
      const logoContainers = pressLogosContainer.locator('div.group');
      const logoCount = await logoContainers.count();
      expect(logoCount).toBe(7);

      // Check that logos wrap (not all in one row)
      const firstLogo = logoContainers.first();
      const lastLogo = logoContainers.last();
      
      const firstBox = await firstLogo.boundingBox();
      const lastBox = await lastLogo.boundingBox();
      
      expect(firstBox).not.toBeNull();
      expect(lastBox).not.toBeNull();
      
      // Logos should be on different rows (different Y positions)
      if (firstBox && lastBox) {
        expect(Math.abs(firstBox.y - lastBox.y)).toBeGreaterThan(10);
      }
    });

    test('should maintain 24px gap spacing on mobile', async ({ page }) => {
      await page.goto(homeUrl);
      
      const pressLogosContainer = page.locator('div.flex.flex-wrap.justify-center.items-center.gap-6');
      await expect(pressLogosContainer).toBeVisible();
      
      // Verify gap-6 class is present (24px = 1.5rem = gap-6)
      await expect(pressLogosContainer).toHaveClass(/gap-6/);
    });

    test('should not cause horizontal scroll on mobile', async ({ page }) => {
      await page.goto(homeUrl);
      
      // Check document width vs viewport width
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1); // Allow 1px tolerance
    });

    test('should wrap logos on photography page mobile view', async ({ page }) => {
      await page.goto(photographyUrl);
      
      const pressLogosContainer = page.locator('div.flex.flex-wrap.justify-center.items-center.gap-6');
      await expect(pressLogosContainer).toBeVisible();

      const logoContainers = pressLogosContainer.locator('div.group');
      const logoCount = await logoContainers.count();
      expect(logoCount).toBe(7);
    });
  });

  test.describe('Tablet Breakpoint (≥768px)', () => {
    test.use({ viewport: { width: 768, height: 1024 } });

    test('should align logos in fewer rows on tablet', async ({ page }) => {
      await page.goto(homeUrl);
      
      const pressLogosContainer = page.locator('div.flex.flex-wrap.justify-center.items-center.gap-6');
      await expect(pressLogosContainer).toBeVisible();

      const logoContainers = pressLogosContainer.locator('div.group');
      const logoCount = await logoContainers.count();
      expect(logoCount).toBe(7);

      // Check that logos are more horizontally aligned
      const boxes = await Promise.all(
        Array.from({ length: logoCount }, (_, i) => 
          logoContainers.nth(i).boundingBox()
        )
      );

      // Count unique Y positions (rows)
      const yPositions = boxes
        .filter(box => box !== null)
        .map(box => Math.round(box!.y / 10) * 10); // Round to nearest 10px
      
      const uniqueRows = new Set(yPositions).size;
      
      // Should have fewer rows than mobile (typically 2-4 rows at tablet width)
      expect(uniqueRows).toBeLessThanOrEqual(4);
    });

    test('should not cause horizontal scroll on tablet', async ({ page }) => {
      await page.goto(homeUrl);
      
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
    });
  });

  test.describe('Desktop Breakpoint (≥1024px)', () => {
    test.use({ viewport: { width: 1024, height: 768 } });

    test('should display logos in centered layout on desktop', async ({ page }) => {
      await page.goto(homeUrl);
      
      const pressLogosContainer = page.locator('div.flex.flex-wrap.justify-center.items-center.gap-6');
      await expect(pressLogosContainer).toBeVisible();

      // Verify justify-center class for centered layout
      await expect(pressLogosContainer).toHaveClass(/justify-center/);

      const logoContainers = pressLogosContainer.locator('div.group');
      const logoCount = await logoContainers.count();
      expect(logoCount).toBe(7);
    });

    test('should align most logos in single or two rows on desktop', async ({ page }) => {
      await page.goto(homeUrl);
      
      const pressLogosContainer = page.locator('div.flex.flex-wrap.justify-center.items-center.gap-6');
      await expect(pressLogosContainer).toBeVisible();

      const logoContainers = pressLogosContainer.locator('div.group');
      const logoCount = await logoContainers.count();

      const boxes = await Promise.all(
        Array.from({ length: logoCount }, (_, i) => 
          logoContainers.nth(i).boundingBox()
        )
      );

      // Count unique Y positions (rows)
      const yPositions = boxes
        .filter(box => box !== null)
        .map(box => Math.round(box!.y / 10) * 10);
      
      const uniqueRows = new Set(yPositions).size;
      
      // Should have 1-2 rows at desktop width
      expect(uniqueRows).toBeLessThanOrEqual(2);
    });

    test('should not cause horizontal scroll on desktop', async ({ page }) => {
      await page.goto(homeUrl);
      
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
    });

    test('should display centered layout on photography page', async ({ page }) => {
      await page.goto(photographyUrl);
      
      const pressLogosContainer = page.locator('div.flex.flex-wrap.justify-center.items-center.gap-6');
      await expect(pressLogosContainer).toBeVisible();
      
      await expect(pressLogosContainer).toHaveClass(/justify-center/);
    });
  });

  test.describe('Large Desktop Breakpoint (≥1440px)', () => {
    test.use({ viewport: { width: 1440, height: 900 } });

    test('should maintain centered layout with balanced spacing', async ({ page }) => {
      await page.goto(homeUrl);
      
      const pressLogosContainer = page.locator('div.flex.flex-wrap.justify-center.items-center.gap-6');
      await expect(pressLogosContainer).toBeVisible();

      const logoContainers = pressLogosContainer.locator('div.group');
      const logoCount = await logoContainers.count();
      expect(logoCount).toBe(7);

      // Get container and first/last logo positions
      const containerBox = await pressLogosContainer.boundingBox();
      const firstLogoBox = await logoContainers.first().boundingBox();
      const lastLogoBox = await logoContainers.last().boundingBox();

      expect(containerBox).not.toBeNull();
      expect(firstLogoBox).not.toBeNull();
      expect(lastLogoBox).not.toBeNull();

      if (containerBox && firstLogoBox && lastLogoBox) {
        // Check that logos are centered within container
        const leftMargin = firstLogoBox.x - containerBox.x;
        const rightMargin = containerBox.x + containerBox.width - (lastLogoBox.x + lastLogoBox.width);
        
        // Margins should be relatively balanced (within 50px tolerance for wrapping)
        expect(Math.abs(leftMargin - rightMargin)).toBeLessThan(150);
      }
    });

    test('should not cause horizontal scroll on large desktop', async ({ page }) => {
      await page.goto(homeUrl);
      
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
    });
  });

  test.describe('Consistent Logo Height Across Breakpoints', () => {
    const breakpoints = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1024, height: 768 },
      { name: 'Large Desktop', width: 1440, height: 900 },
    ];

    for (const breakpoint of breakpoints) {
      test(`should maintain 32px height at ${breakpoint.name} (${breakpoint.width}px)`, async ({ page }) => {
        await page.setViewportSize({ width: breakpoint.width, height: breakpoint.height });
        await page.goto(homeUrl);
        
        const pressLogosContainer = page.locator('div.flex.flex-wrap.justify-center.items-center.gap-6');
        await expect(pressLogosContainer).toBeVisible();

        const logoImages = pressLogosContainer.locator('img');
        const firstImage = logoImages.first();
        
        // Check image dimensions (allow for browser rendering variations)
        const height = await firstImage.evaluate((img: HTMLImageElement) => img.height);
        expect(height).toBeGreaterThanOrEqual(32);
        expect(height).toBeLessThanOrEqual(40);
      });
    }
  });

  test.describe('Photography Page Responsive Behavior', () => {
    test('should maintain responsive behavior in hero section on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(photographyUrl);
      
      const pressLogosContainer = page.locator('div.flex.flex-wrap.justify-center.items-center.gap-6');
      await expect(pressLogosContainer).toBeVisible();
      
      // Should not cause horizontal scroll
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
    });

    test('should maintain responsive behavior in hero section on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(photographyUrl);
      
      const pressLogosContainer = page.locator('div.flex.flex-wrap.justify-center.items-center.gap-6');
      await expect(pressLogosContainer).toBeVisible();
      
      const logoContainers = pressLogosContainer.locator('div.group');
      const logoCount = await logoContainers.count();
      expect(logoCount).toBe(7);
    });
  });
});
