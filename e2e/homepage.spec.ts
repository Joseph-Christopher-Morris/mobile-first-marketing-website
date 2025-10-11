import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load homepage successfully', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Mobile-First Marketing/);

    // Check main heading
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('should display hero section with CTA buttons', async ({ page }) => {
    // Check hero section exists
    const heroSection = page.locator('[data-testid="hero-section"]').first();
    await expect(heroSection).toBeVisible();

    // Check CTA buttons are present and clickable
    const ctaButtons = page
      .getByRole('button')
      .filter({ hasText: /Get Started|Contact Us|Learn More/i });
    await expect(ctaButtons.first()).toBeVisible();
    await expect(ctaButtons.first()).toBeEnabled();
  });

  test('should display services showcase', async ({ page }) => {
    // Check services section
    const servicesSection = page
      .locator('[data-testid="services-showcase"]')
      .first();
    await expect(servicesSection).toBeVisible();

    // Check for service cards
    const serviceCards = page.locator('[data-testid="service-card"]');
    await expect(serviceCards.first()).toBeVisible();
  });

  test('should display testimonials carousel', async ({ page }) => {
    // Check testimonials section
    const testimonialsSection = page
      .locator('[data-testid="testimonials-carousel"]')
      .first();
    await expect(testimonialsSection).toBeVisible();

    // Check for testimonial content
    const testimonials = page.locator('[data-testid="testimonial"]');
    await expect(testimonials.first()).toBeVisible();
  });

  test('should display blog preview section', async ({ page }) => {
    // Check blog section
    const blogSection = page.locator('[data-testid="blog-preview"]').first();
    await expect(blogSection).toBeVisible();

    // Check for blog post cards
    const blogCards = page.locator('[data-testid="blog-card"]');
    await expect(blogCards.first()).toBeVisible();
  });

  test('should have working navigation', async ({ page }) => {
    // Test desktop navigation
    if (await page.locator('[data-testid="desktop-nav"]').isVisible()) {
      const navLinks = page.locator('[data-testid="desktop-nav"] a');
      await expect(navLinks.first()).toBeVisible();
    }

    // Test mobile navigation
    const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"]');
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();
      const mobileNav = page.locator('[data-testid="mobile-nav"]');
      await expect(mobileNav).toBeVisible();
    }
  });

  test('should be responsive on mobile', async ({ page, isMobile }) => {
    if (isMobile) {
      // Check mobile-specific elements
      const bottomNav = page.locator('[data-testid="bottom-navigation"]');
      await expect(bottomNav).toBeVisible();

      // Check mobile menu button
      const mobileMenuButton = page.locator(
        '[data-testid="mobile-menu-button"]'
      );
      await expect(mobileMenuButton).toBeVisible();

      // Test mobile menu functionality
      await mobileMenuButton.click();
      const mobileMenu = page.locator('[data-testid="mobile-menu"]');
      await expect(mobileMenu).toBeVisible();
    }
  });

  test('should have proper accessibility', async ({ page }) => {
    // Check for main landmark
    await expect(page.getByRole('main')).toBeVisible();

    // Check for navigation landmark
    await expect(page.getByRole('navigation').first()).toBeVisible();

    // Check for proper heading hierarchy
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toBeVisible();

    // Check for alt text on images
    const images = page.locator('img');
    const imageCount = await images.count();

    for (let i = 0; i < Math.min(imageCount, 5); i++) {
      const img = images.nth(i);
      await expect(img).toHaveAttribute('alt');
    }
  });

  test('should load images properly', async ({ page }) => {
    // Wait for images to load
    await page.waitForLoadState('networkidle');

    // Check that images are loaded
    const images = page.locator('img');
    const imageCount = await images.count();

    if (imageCount > 0) {
      const firstImage = images.first();
      await expect(firstImage).toBeVisible();

      // Check that image has loaded (not broken)
      const naturalWidth = await firstImage.evaluate(
        (img: HTMLImageElement) => img.naturalWidth
      );
      expect(naturalWidth).toBeGreaterThan(0);
    }
  });

  test('should have fast loading performance', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const loadTime = Date.now() - startTime;

    // Should load within 3 seconds (adjust based on requirements)
    expect(loadTime).toBeLessThan(3000);
  });
});
