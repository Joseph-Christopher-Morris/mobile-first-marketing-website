import { test, expect } from '@playwright/test';

test.describe('Critical User Journeys', () => {
  test.describe('Visitor to Lead Conversion', () => {
    test('should complete full visitor-to-lead journey', async ({ page }) => {
      // Start at homepage
      await page.goto('/');

      // Verify homepage loads with proper SEO metadata
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

      // Validate page title and meta description
      const title = await page.title();
      expect(title).toContain('Mobile-First');
      expect(title).toContain('Photography');

      // Check for structured data
      const structuredData = await page
        .locator('script[type="application/ld+json"]')
        .count();
      expect(structuredData).toBeGreaterThan(0);

      // Click on primary CTA
      const primaryCTA = page
        .getByRole('button', { name: /get started|contact us/i })
        .first();
      await primaryCTA.click();

      // Should navigate to contact page or open contact form
      if (page.url().includes('/contact')) {
        // Navigated to contact page
        await expect(
          page.getByRole('heading', { name: /contact/i })
        ).toBeVisible();
      } else {
        // Contact form modal/section opened
        await expect(
          page.locator('[data-testid="contact-form"]')
        ).toBeVisible();
      }

      // Fill out contact form
      await page.getByLabel(/name/i).fill('Test Lead');
      await page.getByLabel(/email/i).fill('testlead@example.com');
      await page.getByLabel(/subject/i).fill('Interested in Services');
      await page
        .getByLabel(/message/i)
        .fill(
          'I am interested in learning more about your services. Please contact me to discuss my project requirements.'
        );

      // Submit form
      const submitButton = page.getByRole('button', { name: /submit|send/i });
      await submitButton.click();

      // Verify success
      const successMessage = page.locator('[data-testid="success-message"]');
      await expect(successMessage).toBeVisible({ timeout: 10000 });
    });

    test('should handle service inquiry journey', async ({ page }) => {
      // Navigate to services page
      await page.goto('/services');

      // Verify services page loads
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

      // Click on a specific service
      const serviceCard = page.locator('[data-testid="service-card"]').first();
      await serviceCard.click();

      // Should navigate to service detail page
      await expect(page).toHaveURL(/\/services\/[^\/]+$/);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

      // Click on service-specific CTA
      const serviceCTA = page
        .getByRole('button', { name: /get quote|contact|inquire/i })
        .first();
      if (await serviceCTA.isVisible()) {
        await serviceCTA.click();

        // Should open contact form or navigate to contact
        const contactForm = page.locator('[data-testid="contact-form"]');
        await expect(contactForm).toBeVisible();

        // Form should be pre-filled with service context
        const subjectField = page.getByLabel(/subject/i);
        const subjectValue = await subjectField.inputValue();
        expect(subjectValue).toContain('Service');
      }
    });
  });

  test.describe('Content Discovery Journey', () => {
    test('should complete blog discovery and engagement', async ({ page }) => {
      // Start at homepage
      await page.goto('/');

      // Navigate to blog section
      const blogLink = page.getByRole('link', { name: /blog/i }).first();
      await blogLink.click();

      // Verify blog page loads
      await expect(page).toHaveURL(/\/blog/);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

      // Click on a blog post
      const blogPost = page.locator('[data-testid="blog-card"]').first();
      await blogPost.click();

      // Should navigate to blog post detail
      await expect(page).toHaveURL(/\/blog\/[^\/]+$/);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

      // Check for related posts or CTA
      const relatedPosts = page.locator('[data-testid="related-posts"]');
      const ctaSection = page.locator('[data-testid="blog-cta"]');

      // Should have either related posts or CTA
      await expect(relatedPosts.or(ctaSection)).toBeVisible();

      // If CTA is present, test interaction
      if (await ctaSection.isVisible()) {
        const ctaButton = ctaSection.getByRole('button').first();
        if (await ctaButton.isVisible()) {
          await ctaButton.click();

          // Should lead to contact or service page
          await page.waitForLoadState('domcontentloaded');
          expect(page.url()).toMatch(/\/(contact|services)/);
        }
      }
    });

    test('should handle testimonial to contact journey', async ({ page }) => {
      // Navigate to homepage
      await page.goto('/');

      // Find testimonials section
      const testimonialsSection = page.locator(
        '[data-testid="testimonials-carousel"]'
      );
      await expect(testimonialsSection).toBeVisible();

      // Look for testimonial CTA
      const testimonialCTA = testimonialsSection
        .getByRole('button', { name: /see more|view all|contact/i })
        .first();

      if (await testimonialCTA.isVisible()) {
        await testimonialCTA.click();

        // Should navigate to testimonials page or contact
        await page.waitForLoadState('domcontentloaded');

        if (page.url().includes('/testimonials')) {
          // On testimonials page, look for contact CTA
          const contactCTA = page
            .getByRole('button', { name: /contact|get started/i })
            .first();
          if (await contactCTA.isVisible()) {
            await contactCTA.click();
            await expect(
              page.locator('[data-testid="contact-form"]')
            ).toBeVisible();
          }
        } else {
          // Should be on contact page
          await expect(
            page.locator('[data-testid="contact-form"]')
          ).toBeVisible();
        }
      }
    });
  });

  test.describe('Mobile User Journey', () => {
    test('should complete mobile-first user journey', async ({
      page,
      isMobile,
    }) => {
      test.skip(!isMobile, 'Mobile-specific test');

      // Navigate to homepage
      await page.goto('/');

      // Verify mobile navigation
      const mobileMenuButton = page.locator(
        '[data-testid="mobile-menu-button"]'
      );
      await expect(mobileMenuButton).toBeVisible();

      // Test mobile menu
      await mobileMenuButton.click();
      const mobileMenu = page.locator('[data-testid="mobile-menu"]');
      await expect(mobileMenu).toBeVisible();

      // Navigate to services via mobile menu
      const servicesLink = mobileMenu.getByRole('link', { name: /services/i });
      await servicesLink.click();

      // Verify services page on mobile
      await expect(page).toHaveURL(/\/services/);

      // Test bottom navigation if present
      const bottomNav = page.locator('[data-testid="bottom-navigation"]');
      if (await bottomNav.isVisible()) {
        const contactBottomLink = bottomNav.getByRole('link', {
          name: /contact/i,
        });
        if (await contactBottomLink.isVisible()) {
          await contactBottomLink.click();
          await expect(page).toHaveURL(/\/contact/);
        }
      }

      // Test mobile contact form
      const contactForm = page.locator('[data-testid="contact-form"]');
      await expect(contactForm).toBeVisible();

      // Test mobile form interaction
      await page.getByLabel(/name/i).tap();
      await page.getByLabel(/name/i).fill('Mobile User');

      await page.getByLabel(/email/i).tap();
      await page.getByLabel(/email/i).fill('mobile@example.com');

      // Verify mobile keyboard doesn't break layout
      const viewport = page.viewportSize();
      if (viewport) {
        expect(viewport.width).toBeLessThanOrEqual(768);
      }
    });

    test('should handle mobile performance requirements', async ({
      page,
      isMobile,
    }) => {
      test.skip(!isMobile, 'Mobile-specific test');

      const startTime = Date.now();

      // Navigate to homepage
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');

      const loadTime = Date.now() - startTime;

      // Mobile should load within 4 seconds (slower than desktop)
      expect(loadTime).toBeLessThan(4000);

      // Check for mobile-optimized images
      const images = page.locator('img');
      const imageCount = await images.count();

      if (imageCount > 0) {
        const firstImage = images.first();
        const src = await firstImage.getAttribute('src');

        // Should use responsive images or WebP format
        expect(src).toMatch(/\.(webp|avif)|w_\d+|q_auto/);
      }
    });

    test('should test mobile responsiveness across different viewports', async ({
      page,
      browserName,
    }) => {
      const viewports = [
        { width: 320, height: 568, name: 'iPhone SE' },
        { width: 375, height: 667, name: 'iPhone 8' },
        { width: 414, height: 896, name: 'iPhone 11 Pro Max' },
        { width: 768, height: 1024, name: 'iPad' },
        { width: 1024, height: 768, name: 'iPad Landscape' },
      ];

      for (const viewport of viewports) {
        await page.setViewportSize({
          width: viewport.width,
          height: viewport.height,
        });
        await page.goto('/');

        // Wait for layout to stabilize
        await page.waitForTimeout(500);

        // Check that content is visible and properly laid out
        const mainHeading = page.getByRole('heading', { level: 1 });
        await expect(mainHeading).toBeVisible();

        // Verify no horizontal scrolling on mobile
        if (viewport.width <= 768) {
          const bodyWidth = await page.evaluate(
            () => document.body.scrollWidth
          );
          expect(bodyWidth).toBeLessThanOrEqual(viewport.width + 20); // Allow small tolerance
        }

        // Test navigation accessibility on different viewports
        const nav = page.getByRole('navigation').first();
        await expect(nav).toBeVisible();

        // Test form elements are properly sized
        await page.goto('/contact');
        const nameField = page.getByLabel(/name/i);
        if (await nameField.isVisible()) {
          const fieldBox = await nameField.boundingBox();
          if (fieldBox) {
            expect(fieldBox.width).toBeGreaterThan(200); // Minimum usable width
            expect(fieldBox.width).toBeLessThan(viewport.width - 40); // Proper margins
          }
        }
      }
    });

    test('should handle touch interactions properly', async ({
      page,
      isMobile,
    }) => {
      test.skip(!isMobile, 'Mobile-specific test');

      await page.goto('/');

      // Test touch targets are properly sized (minimum 44px)
      const buttons = page.getByRole('button');
      const buttonCount = await buttons.count();

      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const button = buttons.nth(i);
        if (await button.isVisible()) {
          const box = await button.boundingBox();
          if (box) {
            expect(box.height).toBeGreaterThanOrEqual(44);
            expect(box.width).toBeGreaterThanOrEqual(44);
          }
        }
      }

      // Test swipe gestures if carousel is present
      const carousel = page.locator(
        '[data-testid="testimonials-carousel"], [data-testid="carousel"]'
      );
      if (await carousel.isVisible()) {
        const carouselBox = await carousel.boundingBox();
        if (carouselBox) {
          // Simulate swipe left
          await page.touchscreen.tap(
            carouselBox.x + carouselBox.width - 50,
            carouselBox.y + carouselBox.height / 2
          );
          await page.waitForTimeout(300);

          // Verify carousel responded to touch
          const activeSlide = carousel.locator(
            '[aria-current="true"], .active, [data-active="true"]'
          );
          if ((await activeSlide.count()) > 0) {
            await expect(activeSlide.first()).toBeVisible();
          }
        }
      }
    });
  });

  test.describe('Error Handling Journey', () => {
    test('should handle 404 errors gracefully', async ({ page }) => {
      // Navigate to non-existent page
      await page.goto('/non-existent-page-12345');

      // Should show 404 page
      await expect(page.getByText(/404|not found/i)).toBeVisible();

      // Should have navigation back to site
      const homeLink = page.getByRole('link', { name: /home|back to home/i });
      await expect(homeLink).toBeVisible();

      // Test navigation back to home
      await homeLink.click();
      await expect(page).toHaveURL('/');
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });

    test('should handle network errors gracefully', async ({ page }) => {
      // Navigate to homepage first
      await page.goto('/');

      // Simulate network failure for API calls
      await page.route('/api/**', route => {
        route.abort('failed');
      });

      // Try to submit contact form
      await page.goto('/contact');

      const contactForm = page.locator('[data-testid="contact-form"]');
      await expect(contactForm).toBeVisible();

      // Fill form
      await page.getByLabel(/name/i).fill('Network Test');
      await page.getByLabel(/email/i).fill('network@example.com');
      await page.getByLabel(/subject/i).fill('Network Test');
      await page.getByLabel(/message/i).fill('Testing network error handling');

      // Submit form
      const submitButton = page.getByRole('button', { name: /submit|send/i });
      await submitButton.click();

      // Should show error message
      const errorMessage = page.locator('[data-testid="error-message"]');
      await expect(errorMessage).toBeVisible();

      // Error message should be user-friendly
      const errorText = await errorMessage.textContent();
      expect(errorText).toMatch(/try again|network|error|problem/i);
    });
  });

  test.describe('SEO and Metadata Validation', () => {
    test('should validate homepage SEO metadata', async ({ page }) => {
      await page.goto('/');

      // Validate title tag
      const title = await page.title();
      expect(title).toContain('Mobile-First');
      expect(title).toContain('Photography');
      expect(title.length).toBeGreaterThan(30);
      expect(title.length).toBeLessThan(60);

      // Validate meta description
      const metaDescription = await page
        .locator('meta[name="description"]')
        .getAttribute('content');
      expect(metaDescription).toBeTruthy();
      expect(metaDescription!.length).toBeGreaterThan(120);
      expect(metaDescription!.length).toBeLessThan(160);
      expect(metaDescription).toContain('mobile-first');

      // Validate canonical URL
      const canonical = await page
        .locator('link[rel="canonical"]')
        .getAttribute('href');
      expect(canonical).toBeTruthy();
      expect(canonical).toMatch(/^https?:\/\//);

      // Validate Open Graph tags
      const ogTitle = await page
        .locator('meta[property="og:title"]')
        .getAttribute('content');
      const ogDescription = await page
        .locator('meta[property="og:description"]')
        .getAttribute('content');
      const ogImage = await page
        .locator('meta[property="og:image"]')
        .getAttribute('content');
      const ogUrl = await page
        .locator('meta[property="og:url"]')
        .getAttribute('content');

      expect(ogTitle).toBeTruthy();
      expect(ogDescription).toBeTruthy();
      expect(ogImage).toBeTruthy();
      expect(ogUrl).toBeTruthy();

      // Validate Twitter Card tags
      const twitterCard = await page
        .locator('meta[name="twitter:card"]')
        .getAttribute('content');
      const twitterTitle = await page
        .locator('meta[name="twitter:title"]')
        .getAttribute('content');
      const twitterDescription = await page
        .locator('meta[name="twitter:description"]')
        .getAttribute('content');

      expect(twitterCard).toBe('summary_large_image');
      expect(twitterTitle).toBeTruthy();
      expect(twitterDescription).toBeTruthy();
    });

    test('should validate structured data on all pages', async ({ page }) => {
      const pages = ['/', '/services', '/about', '/contact', '/blog'];

      for (const pagePath of pages) {
        await page.goto(pagePath);

        // Check for structured data scripts
        const structuredDataScripts = page.locator(
          'script[type="application/ld+json"]'
        );
        const scriptCount = await structuredDataScripts.count();
        expect(scriptCount).toBeGreaterThan(0);

        // Validate JSON-LD structure
        for (let i = 0; i < scriptCount; i++) {
          const scriptContent = await structuredDataScripts
            .nth(i)
            .textContent();
          expect(scriptContent).toBeTruthy();

          // Parse JSON to ensure it's valid
          let parsedData;
          try {
            parsedData = JSON.parse(scriptContent!);
          } catch (error) {
            throw new Error(`Invalid JSON-LD on ${pagePath}: ${error}`);
          }

          // Validate required schema.org properties
          expect(parsedData['@context']).toBe('https://schema.org');
          expect(parsedData['@type']).toBeTruthy();

          // Validate organization schema if present
          if (parsedData['@type'] === 'Organization') {
            expect(parsedData.name).toBeTruthy();
            expect(parsedData.description).toBeTruthy();
            expect(parsedData.url).toBeTruthy();
            expect(parsedData.contactPoint).toBeTruthy();
            expect(parsedData.contactPoint.email).toBeTruthy();
            expect(parsedData.sameAs).toBeInstanceOf(Array);
          }

          // Validate website schema if present
          if (parsedData['@type'] === 'WebSite') {
            expect(parsedData.name).toBeTruthy();
            expect(parsedData.url).toBeTruthy();
            expect(parsedData.description).toBeTruthy();
          }
        }
      }
    });

    test('should validate page-specific SEO elements', async ({ page }) => {
      // Test services page SEO
      await page.goto('/services');

      const servicesTitle = await page.title();
      expect(servicesTitle).toContain('Services');

      const servicesH1 = page.getByRole('heading', { level: 1 });
      await expect(servicesH1).toBeVisible();
      const h1Text = await servicesH1.textContent();
      expect(h1Text).toContain('Services');

      // Test about page SEO
      await page.goto('/about');

      const aboutTitle = await page.title();
      expect(aboutTitle).toContain('About');

      // Test contact page SEO
      await page.goto('/contact');

      const contactTitle = await page.title();
      expect(contactTitle).toContain('Contact');

      // Validate contact page has proper schema
      const contactStructuredData = page.locator(
        'script[type="application/ld+json"]'
      );
      const contactScriptCount = await contactStructuredData.count();
      expect(contactScriptCount).toBeGreaterThan(0);
    });

    test('should validate heading hierarchy across pages', async ({ page }) => {
      const pages = ['/', '/services', '/about', '/contact'];

      for (const pagePath of pages) {
        await page.goto(pagePath);

        // Should have exactly one H1
        const h1Elements = page.getByRole('heading', { level: 1 });
        const h1Count = await h1Elements.count();
        expect(h1Count).toBe(1);

        // H1 should not be empty
        const h1Text = await h1Elements.first().textContent();
        expect(h1Text?.trim().length).toBeGreaterThan(0);

        // Check for proper heading hierarchy (no skipped levels)
        const allHeadings = page.locator('h1, h2, h3, h4, h5, h6');
        const headingCount = await allHeadings.count();

        if (headingCount > 1) {
          const headingLevels: number[] = [];
          for (let i = 0; i < headingCount; i++) {
            const heading = allHeadings.nth(i);
            const tagName = await heading.evaluate(el =>
              el.tagName.toLowerCase()
            );
            const level = parseInt(tagName.charAt(1));
            headingLevels.push(level);
          }

          // First heading should be H1
          expect(headingLevels[0]).toBe(1);

          // Check for proper hierarchy (no skipped levels)
          for (let i = 1; i < headingLevels.length; i++) {
            const currentLevel = headingLevels[i];
            const previousLevel = headingLevels[i - 1];

            // Current level should not skip more than one level
            expect(currentLevel - previousLevel).toBeLessThanOrEqual(1);
          }
        }
      }
    });

    test('should validate image alt attributes and optimization', async ({
      page,
    }) => {
      await page.goto('/');

      const images = page.locator('img');
      const imageCount = await images.count();

      if (imageCount > 0) {
        for (let i = 0; i < imageCount; i++) {
          const img = images.nth(i);

          // All images should have alt attributes
          const alt = await img.getAttribute('alt');
          expect(alt).not.toBeNull();

          // Alt text should be descriptive (not just filename)
          if (alt && alt.trim().length > 0) {
            expect(alt).not.toMatch(/\.(jpg|jpeg|png|gif|webp|avif)$/i);
            expect(alt.length).toBeGreaterThan(3);
          }

          // Images should have proper loading attributes
          const loading = await img.getAttribute('loading');
          const src = await img.getAttribute('src');

          // First image might not be lazy loaded, others should be
          if (i > 0) {
            expect(loading).toBe('lazy');
          }

          // Check for modern image formats or optimization
          if (src) {
            const isOptimized =
              src.includes('webp') ||
              src.includes('avif') ||
              src.includes('w_') ||
              src.includes('q_auto') ||
              src.includes('_next/image');
            expect(isOptimized).toBeTruthy();
          }
        }
      }
    });

    test('should validate robots.txt and sitemap', async ({ page }) => {
      // Test robots.txt
      const robotsResponse = await page.request.get('/robots.txt');
      expect(robotsResponse.status()).toBe(200);

      const robotsContent = await robotsResponse.text();
      expect(robotsContent).toContain('User-agent');
      expect(robotsContent).toContain('Sitemap');

      // Test sitemap.xml
      const sitemapResponse = await page.request.get('/sitemap.xml');
      expect(sitemapResponse.status()).toBe(200);

      const sitemapContent = await sitemapResponse.text();
      expect(sitemapContent).toContain('<?xml');
      expect(sitemapContent).toContain('<urlset');
      expect(sitemapContent).toContain('<url>');
      expect(sitemapContent).toContain('<loc>');
    });
  });

  test.describe('Accessibility Journey', () => {
    test('should support keyboard-only navigation', async ({ page }) => {
      await page.goto('/');

      // Start keyboard navigation
      await page.keyboard.press('Tab');

      // Should focus on first interactive element
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();

      // Navigate through several elements
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Tab');
        const currentFocus = page.locator(':focus');
        await expect(currentFocus).toBeVisible();
      }

      // Test Enter key activation
      const currentFocused = page.locator(':focus');
      const tagName = await currentFocused.evaluate(el =>
        el.tagName.toLowerCase()
      );

      if (['a', 'button'].includes(tagName)) {
        await page.keyboard.press('Enter');

        // Should navigate or trigger action
        await page.waitForTimeout(1000);

        // Verify something happened (URL change or modal open)
        const currentUrl = page.url();
        const modals = page.locator('[role="dialog"], [data-testid*="modal"]');
        const modalCount = await modals.count();

        expect(currentUrl !== '/' || modalCount > 0).toBeTruthy();
      }
    });

    test('should support screen reader navigation', async ({ page }) => {
      await page.goto('/');

      // Check for proper heading hierarchy
      const h1 = page.getByRole('heading', { level: 1 });
      await expect(h1).toBeVisible();

      const h2s = page.getByRole('heading', { level: 2 });
      const h2Count = await h2s.count();
      expect(h2Count).toBeGreaterThan(0);

      // Check for landmarks
      await expect(page.getByRole('main')).toBeVisible();
      await expect(page.getByRole('navigation')).toBeVisible();

      // Check for proper form labels
      await page.goto('/contact');

      const nameField = page.getByLabel(/name/i);
      await expect(nameField).toBeVisible();

      const emailField = page.getByLabel(/email/i);
      await expect(emailField).toBeVisible();

      // Check for error announcements
      const submitButton = page.getByRole('button', { name: /submit|send/i });
      await submitButton.click();

      // Error should be announced via aria-live or role="alert"
      const errorRegion = page.locator(
        '[role="alert"], [aria-live="polite"], [aria-live="assertive"]'
      );
      await expect(errorRegion).toBeVisible();
    });
  });

  test.describe('Advanced User Flow Testing', () => {
    test('should handle multi-step service inquiry process', async ({
      page,
    }) => {
      await page.goto('/');

      // Navigate through service discovery flow
      const servicesLink = page
        .getByRole('link', { name: /services/i })
        .first();
      await servicesLink.click();

      await expect(page).toHaveURL(/\/services/);

      // Select a specific service
      const serviceCards = page.locator(
        '[data-testid="service-card"], .service-card, [class*="service"]'
      );
      const serviceCount = await serviceCards.count();

      if (serviceCount > 0) {
        const firstService = serviceCards.first();
        await firstService.click();

        // Should navigate to service detail or open modal
        await page.waitForTimeout(1000);

        // Look for service-specific contact form or CTA
        const serviceCTA = page
          .getByRole('button', {
            name: /get quote|contact|inquire|learn more/i,
          })
          .first();
        if (await serviceCTA.isVisible()) {
          await serviceCTA.click();

          // Should open contact form with service context
          const contactForm = page.locator(
            '[data-testid="contact-form"], form'
          );
          await expect(contactForm.first()).toBeVisible();

          // Check if service is pre-selected or mentioned
          const subjectField = page.getByLabel(/subject|service/i);
          if (await subjectField.isVisible()) {
            const subjectValue = await subjectField.inputValue();
            // Should contain service-related text
            expect(subjectValue.length).toBeGreaterThan(0);
          }
        }
      }
    });

    test('should validate complete blog engagement flow', async ({ page }) => {
      await page.goto('/blog');

      // Should load blog listing
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

      // Find and click on a blog post
      const blogPosts = page.locator(
        '[data-testid="blog-card"], .blog-post, article'
      );
      const postCount = await blogPosts.count();

      if (postCount > 0) {
        const firstPost = blogPosts.first();
        await firstPost.click();

        // Should navigate to blog post detail
        await expect(page).toHaveURL(/\/blog\/[^\/]+/);

        // Validate blog post SEO
        const postTitle = await page.title();
        expect(postTitle.length).toBeGreaterThan(10);

        // Check for article structured data
        const articleSchema = page.locator(
          'script[type="application/ld+json"]'
        );
        const schemaContent = await articleSchema.first().textContent();
        if (schemaContent) {
          const parsedSchema = JSON.parse(schemaContent);
          if (parsedSchema['@type'] === 'Article') {
            expect(parsedSchema.headline).toBeTruthy();
            expect(parsedSchema.author).toBeTruthy();
            expect(parsedSchema.datePublished).toBeTruthy();
          }
        }

        // Test social sharing if present
        const shareButtons = page.locator(
          '[data-testid="share-button"], .share-button, [aria-label*="share"]'
        );
        const shareCount = await shareButtons.count();

        if (shareCount > 0) {
          const firstShareButton = shareButtons.first();
          await expect(firstShareButton).toBeVisible();

          // Click should open share dialog or new window
          await firstShareButton.click();
          await page.waitForTimeout(500);
        }

        // Test related posts or CTA
        const relatedSection = page.locator(
          '[data-testid="related-posts"], .related-posts, [class*="related"]'
        );
        const ctaSection = page.locator(
          '[data-testid="blog-cta"], .blog-cta, [class*="cta"]'
        );

        // Should have either related content or CTA
        const hasRelatedContent = (await relatedSection.count()) > 0;
        const hasCTA = (await ctaSection.count()) > 0;

        expect(hasRelatedContent || hasCTA).toBeTruthy();
      }
    });

    test('should test cross-device consistency', async ({
      page,
      browserName,
    }) => {
      const testPages = ['/', '/services', '/about', '/contact'];

      for (const pagePath of testPages) {
        await page.goto(pagePath);

        // Test that core elements are present regardless of device
        const mainHeading = page.getByRole('heading', { level: 1 });
        await expect(mainHeading).toBeVisible();

        const navigation = page.getByRole('navigation').first();
        await expect(navigation).toBeVisible();

        // Test that interactive elements work
        const buttons = page.getByRole('button');
        const buttonCount = await buttons.count();

        if (buttonCount > 0) {
          const firstButton = buttons.first();
          if (await firstButton.isVisible()) {
            // Button should be clickable
            await expect(firstButton).toBeEnabled();

            // Button should have proper focus styles
            await firstButton.focus();
            const focusedElement = page.locator(':focus');
            await expect(focusedElement).toBeVisible();
          }
        }

        // Test that forms work consistently
        if (pagePath === '/contact') {
          const nameField = page.getByLabel(/name/i);
          const emailField = page.getByLabel(/email/i);

          if ((await nameField.isVisible()) && (await emailField.isVisible())) {
            await nameField.fill('Cross Device Test');
            await emailField.fill('crossdevice@test.com');

            const nameValue = await nameField.inputValue();
            const emailValue = await emailField.inputValue();

            expect(nameValue).toBe('Cross Device Test');
            expect(emailValue).toBe('crossdevice@test.com');
          }
        }
      }
    });
  });
});
