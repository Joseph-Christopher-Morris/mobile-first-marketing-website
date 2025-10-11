import { test, expect } from '@playwright/test';

test.describe('Core Site Functionality', () => {
  test.describe('Basic Page Loading and Navigation', () => {
    test('should load homepage successfully', async ({ page }) => {
      await page.goto('/');

      // Verify page loads
      await expect(page).toHaveTitle(/.*/, { timeout: 10000 });

      // Check for main heading
      const mainHeading = page.getByRole('heading', { level: 1 });
      await expect(mainHeading).toBeVisible();

      // Verify page is interactive
      await page.waitForLoadState('domcontentloaded');

      // Check for navigation
      const nav = page.getByRole('navigation');
      await expect(nav.first()).toBeVisible();
    });

    test('should navigate between main pages', async ({ page }) => {
      await page.goto('/');

      // Test navigation to services
      const servicesLink = page
        .getByRole('link', { name: /services/i })
        .first();
      if (await servicesLink.isVisible()) {
        await servicesLink.click();
        await expect(page).toHaveURL(/\/services/);
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      }

      // Test navigation to about
      const aboutLink = page.getByRole('link', { name: /about/i }).first();
      if (await aboutLink.isVisible()) {
        await aboutLink.click();
        await expect(page).toHaveURL(/\/about/);
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      }

      // Test navigation to contact
      const contactLink = page.getByRole('link', { name: /contact/i }).first();
      if (await contactLink.isVisible()) {
        await contactLink.click();
        await expect(page).toHaveURL(/\/contact/);
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      }
    });

    test('should handle mobile navigation', async ({ page, isMobile }) => {
      test.skip(!isMobile, 'Mobile-specific test');

      await page.goto('/');

      // Check for mobile menu button
      const mobileMenuButton = page.locator(
        '[data-testid="mobile-menu-button"], [aria-label*="menu"], button[aria-expanded]'
      );

      if (await mobileMenuButton.first().isVisible()) {
        await mobileMenuButton.first().click();

        // Mobile menu should open
        const mobileMenu = page.locator(
          '[data-testid="mobile-menu"], [role="dialog"], nav[aria-expanded="true"]'
        );
        await expect(mobileMenu.first()).toBeVisible();

        // Should contain navigation links
        const navLinks = mobileMenu.first().getByRole('link');
        const linkCount = await navLinks.count();
        expect(linkCount).toBeGreaterThan(0);
      }
    });

    test('should load page resources efficiently', async ({ page }) => {
      const responses: Array<{
        url: string;
        status: number;
        contentType: string | undefined;
      }> = [];

      page.on('response', response => {
        responses.push({
          url: response.url(),
          status: response.status(),
          contentType: response.headers()['content-type'],
        });
      });

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Check for successful resource loading
      const failedResources = responses.filter(r => r.status >= 400);
      expect(failedResources.length).toBe(0);

      // Check for essential resources
      const cssResources = responses.filter(r =>
        r.contentType?.includes('text/css')
      );
      const jsResources = responses.filter(r =>
        r.contentType?.includes('javascript')
      );

      expect(cssResources.length).toBeGreaterThan(0);
      expect(jsResources.length).toBeGreaterThan(0);
    });
  });

  test.describe('Contact Form Functionality', () => {
    test('should load contact form', async ({ page }) => {
      await page.goto('/contact');

      // Check for contact form
      const contactForm = page.locator('form, [data-testid="contact-form"]');
      await expect(contactForm.first()).toBeVisible();

      // Check for required form fields
      const nameField = page.getByLabel(/name/i);
      const emailField = page.getByLabel(/email/i);
      const messageField = page.getByLabel(/message/i);

      await expect(nameField).toBeVisible();
      await expect(emailField).toBeVisible();
      await expect(messageField).toBeVisible();

      // Check for submit button
      const submitButton = page.getByRole('button', { name: /submit|send/i });
      await expect(submitButton).toBeVisible();
    });

    test('should validate required form fields', async ({ page }) => {
      await page.goto('/contact');

      // Try to submit empty form
      const submitButton = page.getByRole('button', { name: /submit|send/i });
      await submitButton.click();

      // Wait for validation
      await page.waitForTimeout(1000);

      // Check for validation messages
      const validationMessages = page.locator(
        '[role="alert"], .error, [aria-invalid="true"]'
      );
      const messageCount = await validationMessages.count();

      // Should have validation feedback
      expect(messageCount).toBeGreaterThan(0);
    });

    test('should accept valid form input', async ({ page }) => {
      await page.goto('/contact');

      // Fill out form with valid data
      await page.getByLabel(/name/i).fill('Test User');
      await page.getByLabel(/email/i).fill('test@example.com');

      const subjectField = page.getByLabel(/subject/i);
      if (await subjectField.isVisible()) {
        await subjectField.fill('Test Subject');
      }

      await page
        .getByLabel(/message/i)
        .fill('This is a test message for form validation.');

      // Submit form
      const submitButton = page.getByRole('button', { name: /submit|send/i });
      await submitButton.click();

      // Wait for response
      await page.waitForTimeout(3000);

      // Check for success or error message
      const responseMessage = page.locator(
        '[data-testid="success-message"], [data-testid="error-message"], [role="alert"]'
      );
      await expect(responseMessage.first()).toBeVisible({ timeout: 10000 });
    });

    test('should validate email format', async ({ page }) => {
      await page.goto('/contact');

      // Fill form with invalid email
      await page.getByLabel(/name/i).fill('Test User');
      await page.getByLabel(/email/i).fill('invalid-email');
      await page.getByLabel(/message/i).fill('Test message');

      // Submit form
      const submitButton = page.getByRole('button', { name: /submit|send/i });
      await submitButton.click();

      // Wait for validation
      await page.waitForTimeout(1000);

      // Should show email validation error
      const emailField = page.getByLabel(/email/i);
      const isInvalid = await emailField.getAttribute('aria-invalid');

      expect(isInvalid).toBe('true');
    });

    test('should handle form submission gracefully', async ({ page }) => {
      await page.goto('/contact');

      // Fill out form
      await page.getByLabel(/name/i).fill('Integration Test');
      await page.getByLabel(/email/i).fill('integration@test.com');
      await page
        .getByLabel(/message/i)
        .fill('Testing form submission handling');

      // Submit form
      const submitButton = page.getByRole('button', { name: /submit|send/i });
      await submitButton.click();

      // Button should show loading state or be disabled
      await page.waitForTimeout(500);

      const buttonState = await submitButton.evaluate(
        (btn: HTMLButtonElement) => ({
          disabled: btn.disabled,
          textContent: btn.textContent?.trim(),
          ariaLabel: btn.getAttribute('aria-label'),
        })
      );

      // Should indicate processing state
      expect(
        buttonState.disabled ||
          buttonState.textContent?.includes('Sending') ||
          buttonState.textContent?.includes('Loading') ||
          buttonState.ariaLabel?.includes('Sending')
      ).toBeTruthy();
    });
  });

  test.describe('Social Media and External Integrations', () => {
    test('should display configured social media links', async ({ page }) => {
      await page.goto('/');

      // Look for social media links
      const socialLinks = page.locator(
        'a[href*="facebook"], a[href*="twitter"], a[href*="linkedin"], a[href*="instagram"]'
      );
      const socialCount = await socialLinks.count();

      // Should have at least some social links if configured
      if (socialCount > 0) {
        for (let i = 0; i < socialCount; i++) {
          const link = socialLinks.nth(i);
          await expect(link).toBeVisible();

          // Links should open in new tab
          const target = await link.getAttribute('target');
          expect(target).toBe('_blank');

          // Should have proper rel attributes for security
          const rel = await link.getAttribute('rel');
          expect(rel).toContain('noopener');
        }
      }
    });

    test('should load analytics scripts if configured', async ({ page }) => {
      const scriptRequests: string[] = [];

      page.on('request', request => {
        const url = request.url();
        if (
          url.includes('google-analytics') ||
          url.includes('googletagmanager') ||
          url.includes('facebook.net') ||
          url.includes('analytics')
        ) {
          scriptRequests.push(url);
        }
      });

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // If analytics are configured, scripts should load
      const hasAnalytics =
        process.env.NEXT_PUBLIC_GA_ID ||
        process.env.NEXT_PUBLIC_GTM_ID ||
        process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;

      if (hasAnalytics) {
        expect(scriptRequests.length).toBeGreaterThan(0);
      }
    });

    test('should handle external link interactions', async ({ page }) => {
      await page.goto('/');

      // Find external links (excluding social media)
      const externalLinks = page.locator(
        'a[href^="http"]:not([href*="facebook"]):not([href*="twitter"]):not([href*="linkedin"]):not([href*="instagram"])'
      );
      const linkCount = await externalLinks.count();

      if (linkCount > 0) {
        const firstLink = externalLinks.first();

        // External links should open in new tab
        const target = await firstLink.getAttribute('target');
        const rel = await firstLink.getAttribute('rel');

        expect(target).toBe('_blank');
        expect(rel).toContain('noopener');
      }
    });

    test('should display contact information correctly', async ({ page }) => {
      await page.goto('/contact');

      // Check for contact email display
      const contactEmail = process.env.CONTACT_EMAIL;
      if (contactEmail) {
        const emailDisplay = page.locator(`text=${contactEmail}`);
        const emailLink = page.locator(`a[href="mailto:${contactEmail}"]`);

        // Email should be displayed or linked
        const emailVisible =
          (await emailDisplay.count()) > 0 || (await emailLink.count()) > 0;
        expect(emailVisible).toBeTruthy();
      }
    });

    test('should handle image loading and optimization', async ({ page }) => {
      await page.goto('/');

      const images = page.locator('img');
      const imageCount = await images.count();

      if (imageCount > 0) {
        // Check first few images
        for (let i = 0; i < Math.min(imageCount, 3); i++) {
          const img = images.nth(i);

          // Images should have alt text
          const alt = await img.getAttribute('alt');
          expect(alt).not.toBeNull();

          // Images should load successfully
          await expect(img).toBeVisible();

          // Check for optimization attributes
          const src = await img.getAttribute('src');
          const loading = await img.getAttribute('loading');

          // Should use optimized formats or lazy loading
          const isOptimized =
            src?.includes('webp') ||
            src?.includes('avif') ||
            src?.includes('w_') ||
            loading === 'lazy';

          if (i > 0) {
            // First image might not be lazy loaded
            expect(isOptimized).toBeTruthy();
          }
        }
      }
    });
  });

  test.describe('Error Handling', () => {
    test('should handle 404 pages gracefully', async ({ page }) => {
      await page.goto('/non-existent-page-test-404');

      // Should show 404 page
      const notFoundText = page.locator('text=/404|not found|page not found/i');
      await expect(notFoundText.first()).toBeVisible();

      // Should have navigation back to site
      const homeLink = page.getByRole('link', { name: /home|back/i });
      if ((await homeLink.count()) > 0) {
        await expect(homeLink.first()).toBeVisible();
      }
    });

    test('should handle JavaScript errors gracefully', async ({ page }) => {
      const jsErrors: string[] = [];

      page.on('pageerror', error => {
        jsErrors.push(error.message);
      });

      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');

      // Should not have critical JavaScript errors
      const criticalErrors = jsErrors.filter(
        (error: string) =>
          !error.includes('Non-Error promise rejection') &&
          !error.includes('ResizeObserver loop limit exceeded')
      );

      expect(criticalErrors.length).toBe(0);
    });

    test('should maintain functionality with slow network', async ({
      page,
    }) => {
      // Simulate slow network
      await page.route('**/*', async route => {
        await new Promise(resolve => setTimeout(resolve, 100));
        await route.continue();
      });

      await page.goto('/');

      // Page should still load and be functional
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible({
        timeout: 15000,
      });

      // Navigation should still work
      const nav = page.getByRole('navigation');
      await expect(nav.first()).toBeVisible();
    });
  });
});
