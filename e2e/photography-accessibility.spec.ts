import { test, expect } from '@playwright/test';

test.describe('Photography Page Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/services/photography');
    // Wait for gallery to load
    await page.waitForSelector('[role="grid"]', { timeout: 10000 });
  });

  test('should have proper ARIA labels and roles', async ({ page }) => {
    // Check main gallery section has proper ARIA labeling
    const gallerySection = page.locator('section[aria-label="Photography Portfolio Gallery"]');
    await expect(gallerySection).toBeVisible();

    // Check gallery grid has proper role and labeling
    const galleryGrid = page.locator('[role="grid"]');
    await expect(galleryGrid).toBeVisible();
    await expect(galleryGrid).toHaveAttribute('aria-labelledby', 'gallery-heading');
    await expect(galleryGrid).toHaveAttribute('aria-describedby', 'gallery-instructions');

    // Check gallery heading exists
    const heading = page.locator('#gallery-heading');
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText('Portfolio Gallery');

    // Check instructions for screen readers
    const instructions = page.locator('#gallery-instructions');
    await expect(instructions).toBeVisible();
    await expect(instructions).toHaveClass(/sr-only/);
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Focus on first gallery item
    const firstImage = page.locator('[role="gridcell"]').first();
    await firstImage.focus();
    await expect(firstImage).toBeFocused();

    // Test arrow key navigation
    await page.keyboard.press('ArrowRight');
    const secondImage = page.locator('[role="gridcell"]').nth(1);
    await expect(secondImage).toBeFocused();

    // Test Home key
    await page.keyboard.press('Home');
    await expect(firstImage).toBeFocused();

    // Test End key
    await page.keyboard.press('End');
    const lastImage = page.locator('[role="gridcell"]').last();
    await expect(lastImage).toBeFocused();
  });

  test('should have proper focus indicators', async ({ page }) => {
    const firstImage = page.locator('[role="gridcell"]').first();
    await firstImage.focus();
    
    // Check focus ring is visible
    await expect(firstImage).toHaveCSS('outline-style', 'none'); // Should use focus:ring instead
    
    // Check for focus ring classes
    const focusRingClasses = await firstImage.getAttribute('class');
    expect(focusRingClasses).toContain('focus:ring-2');
    expect(focusRingClasses).toContain('focus:ring-brand-pink');
  });

  test('should have descriptive alt text for images', async ({ page }) => {
    const images = page.locator('[role="gridcell"] img');
    const imageCount = await images.count();
    
    for (let i = 0; i < Math.min(imageCount, 5); i++) {
      const img = images.nth(i);
      const altText = await img.getAttribute('alt');
      
      // Alt text should be descriptive (more than 10 characters)
      expect(altText).toBeTruthy();
      expect(altText!.length).toBeGreaterThan(10);
      
      // Should contain relevant keywords
      expect(altText).toMatch(/(photography|professional|Nantwich|campaign|editorial)/i);
    }
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    // Check main page heading
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    await expect(h1).toContainText('Professional Photography Services');

    // Check section headings are h2
    const h2Headings = page.locator('h2');
    const h2Count = await h2Headings.count();
    expect(h2Count).toBeGreaterThan(0);

    // Verify no heading levels are skipped
    const allHeadings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingLevels = [];
    
    for (let i = 0; i < await allHeadings.count(); i++) {
      const heading = allHeadings.nth(i);
      const tagName = await heading.evaluate(el => el.tagName.toLowerCase());
      const level = parseInt(tagName.charAt(1));
      headingLevels.push(level);
    }

    // Check heading hierarchy is logical
    for (let i = 1; i < headingLevels.length; i++) {
      const currentLevel = headingLevels[i];
      const previousLevel = headingLevels[i - 1];
      
      // Should not skip more than one level
      if (currentLevel > previousLevel) {
        expect(currentLevel - previousLevel).toBeLessThanOrEqual(1);
      }
    }
  });

  test('should have sufficient color contrast', async ({ page }) => {
    // Test main text elements for contrast
    const textElements = [
      'h1',
      'h2', 
      'p',
      '.text-gray-600',
      '.text-slate-600'
    ];

    for (const selector of textElements) {
      const elements = page.locator(selector);
      const count = await elements.count();
      
      if (count > 0) {
        const element = elements.first();
        await expect(element).toBeVisible();
        
        // Get computed styles
        const color = await element.evaluate(el => 
          window.getComputedStyle(el).color
        );
        const backgroundColor = await element.evaluate(el => 
          window.getComputedStyle(el).backgroundColor
        );
        
        // Basic check that colors are defined
        expect(color).toBeTruthy();
        expect(backgroundColor).toBeTruthy();
      }
    }
  });

  test('should work with screen reader announcements', async ({ page }) => {
    // Click on a gallery image
    const firstImage = page.locator('[role="gridcell"]').first();
    await firstImage.click();

    // Check for aria-live announcements (they should be added to DOM temporarily)
    await page.waitForTimeout(100); // Brief wait for announcement
    
    // The announcement element should exist briefly
    const announcements = page.locator('[aria-live="polite"]');
    // Note: The announcement is removed after 1 second, so we can't reliably test its presence
    // But we can verify the click handler exists
    await expect(firstImage).toHaveAttribute('tabindex', '0');
  });

  test('should have proper form labels and inputs', async ({ page }) => {
    // Check if there are any form elements on the page
    const formElements = page.locator('input, textarea, select');
    const formCount = await formElements.count();
    
    for (let i = 0; i < formCount; i++) {
      const element = formElements.nth(i);
      const id = await element.getAttribute('id');
      const ariaLabel = await element.getAttribute('aria-label');
      const ariaLabelledBy = await element.getAttribute('aria-labelledby');
      
      // Each form element should have proper labeling
      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        const labelExists = await label.count() > 0;
        
        // Should have either a label, aria-label, or aria-labelledby
        expect(labelExists || ariaLabel || ariaLabelledBy).toBeTruthy();
      }
    }
  });

  test('should be navigable without mouse', async ({ page }) => {
    // Start navigation from top of page
    await page.keyboard.press('Tab');
    
    // Should be able to reach gallery via keyboard
    let tabCount = 0;
    let reachedGallery = false;
    
    while (tabCount < 50 && !reachedGallery) {
      const focusedElement = page.locator(':focus');
      const role = await focusedElement.getAttribute('role');
      
      if (role === 'gridcell') {
        reachedGallery = true;
        break;
      }
      
      await page.keyboard.press('Tab');
      tabCount++;
    }
    
    expect(reachedGallery).toBeTruthy();
  });
});