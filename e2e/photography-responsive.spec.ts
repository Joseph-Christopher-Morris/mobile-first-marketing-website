import { test, expect, devices } from '@playwright/test';

const viewports = [
  { name: 'Mobile', ...devices['iPhone 12'] },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Desktop', width: 1280, height: 720 },
  { name: 'Large Desktop', width: 1920, height: 1080 }
];

test.describe('Photography Page Responsive Design', () => {
  viewports.forEach(({ name, ...viewport }) => {
    test.describe(`${name} viewport`, () => {
      test.use({ viewport });

      test(`should display properly on ${name}`, async ({ page }) => {
        await page.goto('/services/photography');
        await page.waitForSelector('[role="grid"]', { timeout: 10000 });

        // Check hero section is visible
        const heroSection = page.locator('section').first();
        await expect(heroSection).toBeVisible();

        // Check gallery grid adapts to viewport
        const galleryGrid = page.locator('[role="grid"]');
        await expect(galleryGrid).toBeVisible();

        // Get grid computed styles
        const gridStyles = await galleryGrid.evaluate(el => {
          const styles = window.getComputedStyle(el);
          return {
            display: styles.display,
            gridTemplateColumns: styles.gridTemplateColumns,
            gap: styles.gap
          };
        });

        expect(gridStyles.display).toBe('grid');
        expect(gridStyles.gridTemplateColumns).toBeTruthy();

        // Check images are properly sized
        const images = page.locator('[role="gridcell"] img');
        const imageCount = await images.count();
        expect(imageCount).toBeGreaterThan(0);

        // Verify first few images load properly
        for (let i = 0; i < Math.min(imageCount, 3); i++) {
          const img = images.nth(i);
          await expect(img).toBeVisible();
          
          // Check image has proper dimensions
          const imgBox = await img.boundingBox();
          expect(imgBox).toBeTruthy();
          expect(imgBox!.width).toBeGreaterThan(0);
          expect(imgBox!.height).toBeGreaterThan(0);
        }
      });

      test(`should have proper text sizing on ${name}`, async ({ page }) => {
        await page.goto('/services/photography');

        // Check main heading
        const h1 = page.locator('h1');
        await expect(h1).toBeVisible();
        
        const h1Styles = await h1.evaluate(el => {
          const styles = window.getComputedStyle(el);
          return {
            fontSize: styles.fontSize,
            lineHeight: styles.lineHeight
          };
        });

        // Font size should be reasonable for viewport
        const fontSize = parseFloat(h1Styles.fontSize);
        if (name === 'Mobile') {
          expect(fontSize).toBeGreaterThanOrEqual(24); // At least 24px on mobile
        } else {
          expect(fontSize).toBeGreaterThanOrEqual(32); // At least 32px on larger screens
        }
      });

      test(`should have proper touch targets on ${name}`, async ({ page }) => {
        await page.goto('/services/photography');
        await page.waitForSelector('[role="grid"]', { timeout: 10000 });

        // Check gallery items have adequate touch targets
        const galleryItems = page.locator('[role="gridcell"]');
        const itemCount = await galleryItems.count();

        for (let i = 0; i < Math.min(itemCount, 5); i++) {
          const item = galleryItems.nth(i);
          const box = await item.boundingBox();
          
          expect(box).toBeTruthy();
          
          // Touch targets should be at least 44px (WCAG guideline)
          if (name === 'Mobile') {
            expect(box!.width).toBeGreaterThanOrEqual(44);
            expect(box!.height).toBeGreaterThanOrEqual(44);
          }
        }

        // Check CTA buttons have adequate size
        const ctaButtons = page.locator('a[href="/contact"]');
        const buttonCount = await ctaButtons.count();
        
        for (let i = 0; i < buttonCount; i++) {
          const button = ctaButtons.nth(i);
          const box = await button.boundingBox();
          
          if (box && name === 'Mobile') {
            expect(box.height).toBeGreaterThanOrEqual(44);
          }
        }
      });
    });
  });

  test('should maintain layout integrity across breakpoints', async ({ page }) => {
    const breakpoints = [320, 640, 768, 1024, 1280, 1920];
    
    for (const width of breakpoints) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto('/services/photography');
      await page.waitForSelector('[role="grid"]', { timeout: 10000 });

      // Check no horizontal overflow
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = await page.evaluate(() => window.innerWidth);
      
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1); // Allow 1px tolerance

      // Check gallery grid columns adapt properly
      const galleryGrid = page.locator('[role="grid"]');
      const gridColumns = await galleryGrid.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return styles.gridTemplateColumns;
      });

      expect(gridColumns).toBeTruthy();
      expect(gridColumns).not.toBe('none');

      // Verify images don't overflow their containers
      const images = page.locator('[role="gridcell"] img');
      const imageCount = await images.count();
      
      for (let i = 0; i < Math.min(imageCount, 3); i++) {
        const img = images.nth(i);
        const imgBox = await img.boundingBox();
        const containerBox = await img.locator('..').boundingBox();
        
        if (imgBox && containerBox) {
          expect(imgBox.width).toBeLessThanOrEqual(containerBox.width + 1);
          expect(imgBox.height).toBeLessThanOrEqual(containerBox.height + 1);
        }
      }
    }
  });

  test('should handle orientation changes on mobile', async ({ page, browserName }) => {
    // Skip on desktop browsers
    if (browserName === 'webkit' || browserName === 'chromium') {
      // Test portrait orientation
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/services/photography');
      await page.waitForSelector('[role="grid"]', { timeout: 10000 });

      const portraitLayout = await page.locator('[role="grid"]').evaluate(el => {
        const styles = window.getComputedStyle(el);
        return styles.gridTemplateColumns;
      });

      // Test landscape orientation
      await page.setViewportSize({ width: 667, height: 375 });
      await page.reload();
      await page.waitForSelector('[role="grid"]', { timeout: 10000 });

      const landscapeLayout = await page.locator('[role="grid"]').evaluate(el => {
        const styles = window.getComputedStyle(el);
        return styles.gridTemplateColumns;
      });

      // Layout should adapt to orientation
      expect(portraitLayout).toBeTruthy();
      expect(landscapeLayout).toBeTruthy();
      
      // Gallery should still be functional
      const galleryItems = page.locator('[role="gridcell"]');
      await expect(galleryItems.first()).toBeVisible();
    }
  });
});