import { test, expect, devices } from '@playwright/test';

// Test navigation behavior across different devices and screen sizes
test.describe('Navigation Behavior Validation', () => {
  // Desktop Navigation Tests
  test.describe('Desktop Navigation (≥768px)', () => {
    test.beforeEach(async ({ page }) => {
      // Set desktop viewport
      await page.setViewportSize({ width: 1024, height: 768 });
      await page.goto('/');
    });

    test('should show full navigation menu without hamburger icon', async ({
      page,
    }) => {
      // Verify desktop navigation is visible
      const desktopNav = page.locator('nav[role="navigation"]').first();
      await expect(desktopNav).toBeVisible();

      // Verify hamburger button is hidden on desktop
      const hamburgerButton = page.locator(
        'button[aria-label="Toggle mobile menu"]'
      );
      await expect(hamburgerButton).toBeHidden();

      // Verify all navigation links are visible
      const navLinks = ['Home', 'Services', 'Blog', 'About', 'Contact'];
      for (const linkText of navLinks) {
        const link = page.locator(`nav a:has-text("${linkText}")`);
        await expect(link).toBeVisible();
      }

      // Verify CTA button is visible
      const ctaButton = page.locator('a:has-text("Get Started")').first();
      await expect(ctaButton).toBeVisible();
    });

    test('should navigate correctly when clicking desktop navigation links', async ({
      page,
    }) => {
      // Test navigation to each page
      const navigationTests = [
        { text: 'Services', expectedUrl: '/services' },
        { text: 'Blog', expectedUrl: '/blog' },
        { text: 'About', expectedUrl: '/about' },
        { text: 'Contact', expectedUrl: '/contact' },
        { text: 'Home', expectedUrl: '/' },
      ];

      for (const { text, expectedUrl } of navigationTests) {
        await page.locator(`nav a:has-text("${text}")`).first().click();
        await expect(page).toHaveURL(new RegExp(expectedUrl + '$'));

        // Verify active state styling
        const activeLink = page.locator(`nav a:has-text("${text}")`).first();
        await expect(activeLink).toHaveCSS('color', 'rgb(245, 39, 111)');
      }
    });

    test('should maintain navigation visibility at different desktop screen sizes', async ({
      page,
    }) => {
      const desktopSizes = [
        { width: 768, height: 1024 }, // md breakpoint
        { width: 1024, height: 768 }, // lg breakpoint
        { width: 1280, height: 720 }, // xl breakpoint
        { width: 1920, height: 1080 }, // 2xl breakpoint
      ];

      for (const size of desktopSizes) {
        await page.setViewportSize(size);
        await page.reload();

        // Verify desktop navigation is visible
        const desktopNav = page.locator('nav[role="navigation"]').first();
        await expect(desktopNav).toBeVisible();

        // Verify hamburger is hidden
        const hamburgerButton = page.locator(
          'button[aria-label="Toggle mobile menu"]'
        );
        await expect(hamburgerButton).toBeHidden();
      }
    });

    test('should support keyboard navigation on desktop', async ({ page }) => {
      // Focus on first navigation link
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab'); // Skip logo

      // Navigate through menu items with Tab
      const navLinks = ['Services', 'Blog', 'About', 'Contact'];
      for (const linkText of navLinks) {
        await page.keyboard.press('Tab');
        const focusedElement = page.locator(':focus');
        await expect(focusedElement).toHaveText(linkText);
      }

      // Test Enter key navigation
      await page.keyboard.press('Tab'); // Move to Get Started button
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toHaveText('Get Started');

      await page.keyboard.press('Enter');
      await expect(page).toHaveURL(/\/contact$/);
    });
  });

  // Mobile Navigation Tests
  test.describe('Mobile Navigation (<768px)', () => {
    test.beforeEach(async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
    });

    test('should show hamburger menu and hide desktop navigation', async ({
      page,
    }) => {
      // Verify desktop navigation is hidden
      const desktopNav = page.locator('nav[role="navigation"]').first();
      await expect(desktopNav).toBeHidden();

      // Verify hamburger button is visible
      const hamburgerButton = page.locator(
        'button[aria-label="Toggle mobile menu"]'
      );
      await expect(hamburgerButton).toBeVisible();

      // Verify mobile menu is initially closed
      const mobileMenu = page.locator(
        '[role="dialog"][aria-label="Mobile navigation menu"]'
      );
      await expect(mobileMenu).toBeHidden();
    });

    test('should open and close mobile menu correctly', async ({ page }) => {
      const hamburgerButton = page.locator(
        'button[aria-label="Toggle mobile menu"]'
      );
      const mobileMenu = page.locator(
        '[role="dialog"][aria-label="Mobile navigation menu"]'
      );
      const closeButton = page.locator('button[aria-label="Close menu"]');

      // Open mobile menu
      await hamburgerButton.click();
      await expect(mobileMenu).toBeVisible();
      await expect(hamburgerButton).toHaveAttribute('aria-expanded', 'true');

      // Verify menu content is visible
      const navLinks = ['Home', 'Services', 'Blog', 'About', 'Contact'];
      for (const linkText of navLinks) {
        const link = mobileMenu.locator(`a:has-text("${linkText}")`);
        await expect(link).toBeVisible();
      }

      // Close menu with close button
      await closeButton.click();
      await expect(mobileMenu).toBeHidden();
      await expect(hamburgerButton).toHaveAttribute('aria-expanded', 'false');
    });

    test('should close mobile menu when clicking backdrop', async ({
      page,
    }) => {
      const hamburgerButton = page.locator(
        'button[aria-label="Toggle mobile menu"]'
      );
      const mobileMenu = page.locator(
        '[role="dialog"][aria-label="Mobile navigation menu"]'
      );
      const backdrop = page.locator('.fixed.inset-0.bg-black.bg-opacity-50');

      // Open mobile menu
      await hamburgerButton.click();
      await expect(mobileMenu).toBeVisible();

      // Click backdrop to close
      await backdrop.click();
      await expect(mobileMenu).toBeHidden();
    });

    test('should close mobile menu with Escape key', async ({ page }) => {
      const hamburgerButton = page.locator(
        'button[aria-label="Toggle mobile menu"]'
      );
      const mobileMenu = page.locator(
        '[role="dialog"][aria-label="Mobile navigation menu"]'
      );

      // Open mobile menu
      await hamburgerButton.click();
      await expect(mobileMenu).toBeVisible();

      // Press Escape to close
      await page.keyboard.press('Escape');
      await expect(mobileMenu).toBeHidden();
    });

    test('should navigate correctly from mobile menu', async ({ page }) => {
      const hamburgerButton = page.locator(
        'button[aria-label="Toggle mobile menu"]'
      );
      const mobileMenu = page.locator(
        '[role="dialog"][aria-label="Mobile navigation menu"]'
      );

      // Open mobile menu
      await hamburgerButton.click();
      await expect(mobileMenu).toBeVisible();

      // Test navigation to Services page
      await mobileMenu.locator('a:has-text("Services")').click();
      await expect(page).toHaveURL(/\/services$/);

      // Verify menu closes after navigation
      await expect(mobileMenu).toBeHidden();
    });

    test('should maintain mobile navigation at different small screen sizes', async ({
      page,
    }) => {
      const mobileSizes = [
        { width: 320, height: 568 }, // iPhone SE
        { width: 375, height: 667 }, // iPhone 8
        { width: 414, height: 896 }, // iPhone XR
        { width: 767, height: 1024 }, // Just below md breakpoint
      ];

      for (const size of mobileSizes) {
        await page.setViewportSize(size);
        await page.reload();

        // Verify hamburger is visible
        const hamburgerButton = page.locator(
          'button[aria-label="Toggle mobile menu"]'
        );
        await expect(hamburgerButton).toBeVisible();

        // Verify desktop navigation is hidden
        const desktopNav = page.locator('nav[role="navigation"]').first();
        await expect(desktopNav).toBeHidden();
      }
    });
  });

  // Touch Device Tests
  test.describe('Touch Device Navigation', () => {
    test('should work correctly on mobile devices', async ({ browser }) => {
      const context = await browser.newContext({
        ...devices['iPhone 12'],
      });
      const page = await context.newPage();
      await page.goto('/');

      // Test touch interactions
      const hamburgerButton = page.locator(
        'button[aria-label="Toggle mobile menu"]'
      );
      const mobileMenu = page.locator(
        '[role="dialog"][aria-label="Mobile navigation menu"]'
      );

      // Touch to open menu
      await hamburgerButton.tap();
      await expect(mobileMenu).toBeVisible();

      // Touch navigation link
      await mobileMenu.locator('a:has-text("About")').tap();
      await expect(page).toHaveURL(/\/about$/);

      await context.close();
    });

    test('should work correctly on tablet devices', async ({ browser }) => {
      const context = await browser.newContext({
        ...devices['iPad'],
      });
      const page = await context.newPage();
      await page.goto('/');

      // iPad should show desktop navigation (768px width)
      const desktopNav = page.locator('nav[role="navigation"]').first();
      await expect(desktopNav).toBeVisible();

      const hamburgerButton = page.locator(
        'button[aria-label="Toggle mobile menu"]'
      );
      await expect(hamburgerButton).toBeHidden();

      // Test touch navigation on desktop layout
      await page.locator('nav a:has-text("Services")').tap();
      await expect(page).toHaveURL(/\/services$/);

      await context.close();
    });
  });

  // Accessibility Tests
  test.describe('Navigation Accessibility', () => {
    test('should have proper ARIA attributes', async ({ page }) => {
      await page.goto('/');

      // Check navigation landmarks
      const nav = page.locator('nav[role="navigation"]').first();
      await expect(nav).toHaveAttribute('role', 'navigation');

      // Check hamburger button attributes
      await page.setViewportSize({ width: 375, height: 667 });
      const hamburgerButton = page.locator(
        'button[aria-label="Toggle mobile menu"]'
      );
      await expect(hamburgerButton).toHaveAttribute(
        'aria-label',
        'Toggle mobile menu'
      );
      await expect(hamburgerButton).toHaveAttribute('aria-expanded', 'false');

      // Open menu and check updated attributes
      await hamburgerButton.click();
      await expect(hamburgerButton).toHaveAttribute('aria-expanded', 'true');

      // Check mobile menu attributes
      const mobileMenu = page.locator('[role="dialog"]');
      await expect(mobileMenu).toHaveAttribute('role', 'dialog');
      await expect(mobileMenu).toHaveAttribute('aria-modal', 'true');
      await expect(mobileMenu).toHaveAttribute(
        'aria-label',
        'Mobile navigation menu'
      );
    });

    test('should support screen reader navigation', async ({ page }) => {
      await page.goto('/');

      // Check for proper heading structure
      const logo = page.locator('a[aria-label="Go to homepage"]');
      await expect(logo).toHaveAttribute('aria-label', 'Go to homepage');

      // Check current page indication
      await page.goto('/services');
      const activeLink = page.locator('nav a[aria-current="page"]');
      await expect(activeLink).toHaveAttribute('aria-current', 'page');
    });

    test('should have sufficient touch target sizes on mobile', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      // Check hamburger button size (minimum 44x44px)
      const hamburgerButton = page.locator(
        'button[aria-label="Toggle mobile menu"]'
      );
      const buttonBox = await hamburgerButton.boundingBox();
      expect(buttonBox?.width).toBeGreaterThanOrEqual(44);
      expect(buttonBox?.height).toBeGreaterThanOrEqual(44);

      // Open mobile menu and check link sizes
      await hamburgerButton.click();
      const mobileMenu = page.locator('[role="dialog"]');
      const menuLinks = mobileMenu.locator('a');

      for (let i = 0; i < (await menuLinks.count()); i++) {
        const link = menuLinks.nth(i);
        const linkBox = await link.boundingBox();
        expect(linkBox?.height).toBeGreaterThanOrEqual(48);
      }
    });
  });

  // Cross-browser Compatibility Tests
  test.describe('Cross-browser Navigation', () => {
    ['chromium', 'firefox', 'webkit'].forEach(browserName => {
      test(`should work correctly in ${browserName}`, async ({ browser }) => {
        const context = await browser.newContext();
        const page = await context.newPage();
        await page.goto('/');

        // Test desktop navigation
        await page.setViewportSize({ width: 1024, height: 768 });
        const desktopNav = page.locator('nav[role="navigation"]').first();
        await expect(desktopNav).toBeVisible();

        // Test mobile navigation
        await page.setViewportSize({ width: 375, height: 667 });
        const hamburgerButton = page.locator(
          'button[aria-label="Toggle mobile menu"]'
        );
        await expect(hamburgerButton).toBeVisible();

        await hamburgerButton.click();
        const mobileMenu = page.locator('[role="dialog"]');
        await expect(mobileMenu).toBeVisible();

        await context.close();
      });
    });
  });
});
