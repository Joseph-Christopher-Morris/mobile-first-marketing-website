import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate between main pages', async ({ page }) => {
    // Test navigation to Services page
    const servicesLink = page.getByRole('link', { name: /services/i }).first();
    await servicesLink.click();

    await expect(page).toHaveURL(/\/services/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // Test navigation to Blog page
    const blogLink = page.getByRole('link', { name: /blog/i }).first();
    await blogLink.click();

    await expect(page).toHaveURL(/\/blog/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // Test navigation to Contact page
    const contactLink = page.getByRole('link', { name: /contact/i }).first();
    await contactLink.click();

    await expect(page).toHaveURL(/\/contact/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // Test navigation back to Home
    const homeLink = page.getByRole('link', { name: /home/i }).first();
    await homeLink.click();

    await expect(page).toHaveURL('/');
  });

  test('should work with mobile navigation', async ({ page, isMobile }) => {
    if (isMobile) {
      // Open mobile menu
      const mobileMenuButton = page.locator(
        '[data-testid="mobile-menu-button"]'
      );
      await expect(mobileMenuButton).toBeVisible();
      await mobileMenuButton.click();

      // Check mobile menu is open
      const mobileMenu = page.locator('[data-testid="mobile-menu"]');
      await expect(mobileMenu).toBeVisible();

      // Navigate to Services via mobile menu
      const servicesLink = mobileMenu.getByRole('link', { name: /services/i });
      await servicesLink.click();

      await expect(page).toHaveURL(/\/services/);

      // Menu should close after navigation
      await expect(mobileMenu).not.toBeVisible();
    }
  });

  test('should work with bottom navigation on mobile', async ({
    page,
    isMobile,
  }) => {
    if (isMobile) {
      const bottomNav = page.locator('[data-testid="bottom-navigation"]');
      await expect(bottomNav).toBeVisible();

      // Test bottom navigation links
      const bottomNavLinks = bottomNav.getByRole('link');
      const linkCount = await bottomNavLinks.count();

      expect(linkCount).toBeGreaterThan(0);

      // Test navigation via bottom nav
      const servicesBottomLink = bottomNav.getByRole('link', {
        name: /services/i,
      });
      if ((await servicesBottomLink.count()) > 0) {
        await servicesBottomLink.click();
        await expect(page).toHaveURL(/\/services/);
      }
    }
  });

  test('should highlight active navigation items', async ({ page }) => {
    // Navigate to Services page
    await page.goto('/services');

    // Check that Services nav item is highlighted
    const servicesNavItem = page
      .locator('[data-testid="nav-services"]')
      .first();
    if (await servicesNavItem.isVisible()) {
      await expect(servicesNavItem).toHaveAttribute('aria-current', 'page');
    }

    // Navigate to Blog page
    await page.goto('/blog');

    // Check that Blog nav item is highlighted
    const blogNavItem = page.locator('[data-testid="nav-blog"]').first();
    if (await blogNavItem.isVisible()) {
      await expect(blogNavItem).toHaveAttribute('aria-current', 'page');
    }
  });

  test('should handle service page navigation', async ({ page }) => {
    // Navigate to Services page
    await page.goto('/services');

    // Click on a service card to go to individual service page
    const serviceCard = page.locator('[data-testid="service-card"]').first();
    if (await serviceCard.isVisible()) {
      await serviceCard.click();

      // Should navigate to individual service page
      await expect(page).toHaveURL(/\/services\/[^\/]+$/);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    }
  });

  test('should handle blog post navigation', async ({ page }) => {
    // Navigate to Blog page
    await page.goto('/blog');

    // Click on a blog post to go to individual post page
    const blogCard = page.locator('[data-testid="blog-card"]').first();
    if (await blogCard.isVisible()) {
      await blogCard.click();

      // Should navigate to individual blog post page
      await expect(page).toHaveURL(/\/blog\/[^\/]+$/);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    }
  });

  test('should handle breadcrumb navigation', async ({ page }) => {
    // Navigate to a service page
    await page.goto('/services/photography');

    // Check for breadcrumbs
    const breadcrumbs = page.locator('[data-testid="breadcrumbs"]');
    if (await breadcrumbs.isVisible()) {
      // Click on Services breadcrumb
      const servicesBreadcrumb = breadcrumbs.getByRole('link', {
        name: /services/i,
      });
      await servicesBreadcrumb.click();

      await expect(page).toHaveURL('/services');
    }
  });

  test('should handle 404 pages gracefully', async ({ page }) => {
    // Navigate to non-existent page
    await page.goto('/non-existent-page');

    // Should show 404 page
    await expect(page.getByText(/404|not found/i)).toBeVisible();

    // Should have link back to home
    const homeLink = page.getByRole('link', { name: /home|back to home/i });
    await expect(homeLink).toBeVisible();

    await homeLink.click();
    await expect(page).toHaveURL('/');
  });

  test('should maintain navigation state during page transitions', async ({
    page,
  }) => {
    // Start on home page
    await page.goto('/');

    // Navigate to services
    const servicesLink = page.getByRole('link', { name: /services/i }).first();
    await servicesLink.click();

    // Use browser back button
    await page.goBack();
    await expect(page).toHaveURL('/');

    // Use browser forward button
    await page.goForward();
    await expect(page).toHaveURL(/\/services/);
  });

  test('should have keyboard navigation support', async ({ page }) => {
    // Focus on first navigation link
    const firstNavLink = page.getByRole('link').first();
    await firstNavLink.focus();
    await expect(firstNavLink).toBeFocused();

    // Tab through navigation links
    await page.keyboard.press('Tab');
    const secondNavLink = page.getByRole('link').nth(1);
    await expect(secondNavLink).toBeFocused();

    // Press Enter to navigate
    await page.keyboard.press('Enter');

    // Should navigate to the linked page
    await page.waitForLoadState('domcontentloaded');
    expect(page.url()).not.toBe('/');
  });

  test('should handle external links properly', async ({ page, context }) => {
    // Look for external links (social media, etc.)
    const externalLinks = page.locator(
      'a[href^="http"]:not([href*="localhost"]):not([href*="127.0.0.1"])'
    );
    const externalLinkCount = await externalLinks.count();

    if (externalLinkCount > 0) {
      const firstExternalLink = externalLinks.first();

      // External links should open in new tab/window
      await expect(firstExternalLink).toHaveAttribute('target', '_blank');
      await expect(firstExternalLink).toHaveAttribute(
        'rel',
        /noopener|noreferrer/
      );
    }
  });
});
