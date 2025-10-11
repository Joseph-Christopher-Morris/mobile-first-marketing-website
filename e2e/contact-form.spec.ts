import { test, expect } from '@playwright/test';

test.describe('Contact Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact');
  });

  test('should display contact form', async ({ page }) => {
    // Check form is visible
    const contactForm = page.locator('[data-testid="contact-form"]');
    await expect(contactForm).toBeVisible();

    // Check required form fields
    await expect(page.getByLabel(/name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/subject/i)).toBeVisible();
    await expect(page.getByLabel(/message/i)).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    const submitButton = page.getByRole('button', { name: /submit|send/i });

    // Try to submit empty form
    await submitButton.click();

    // Check for validation errors
    const errorMessages = page.locator('[data-testid="error-message"]');
    await expect(errorMessages.first()).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    // Fill form with invalid email
    await page.getByLabel(/name/i).fill('John Doe');
    await page.getByLabel(/email/i).fill('invalid-email');
    await page.getByLabel(/subject/i).fill('Test Subject');
    await page.getByLabel(/message/i).fill('This is a test message');

    const submitButton = page.getByRole('button', { name: /submit|send/i });
    await submitButton.click();

    // Check for email validation error
    const emailError = page.locator('[data-testid="email-error"]');
    await expect(emailError).toBeVisible();
  });

  test('should submit form successfully with valid data', async ({ page }) => {
    // Fill form with valid data
    await page.getByLabel(/name/i).fill('John Doe');
    await page.getByLabel(/email/i).fill('john@example.com');
    await page.getByLabel(/subject/i).fill('Test Inquiry');
    await page
      .getByLabel(/message/i)
      .fill('This is a test message with sufficient length for validation.');

    // Optional fields
    const phoneField = page.getByLabel(/phone/i);
    if (await phoneField.isVisible()) {
      await phoneField.fill('+1234567890');
    }

    const companyField = page.getByLabel(/company/i);
    if (await companyField.isVisible()) {
      await companyField.fill('Test Company');
    }

    // Submit form
    const submitButton = page.getByRole('button', { name: /submit|send/i });
    await submitButton.click();

    // Check for success message
    const successMessage = page.locator('[data-testid="success-message"]');
    await expect(successMessage).toBeVisible({ timeout: 10000 });
  });

  test('should handle form submission errors gracefully', async ({ page }) => {
    // Mock API to return error
    await page.route('/api/contact', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, message: 'Server error' }),
      });
    });

    // Fill and submit form
    await page.getByLabel(/name/i).fill('John Doe');
    await page.getByLabel(/email/i).fill('john@example.com');
    await page.getByLabel(/subject/i).fill('Test Subject');
    await page.getByLabel(/message/i).fill('This is a test message');

    const submitButton = page.getByRole('button', { name: /submit|send/i });
    await submitButton.click();

    // Check for error message
    const errorMessage = page.locator('[data-testid="error-message"]');
    await expect(errorMessage).toBeVisible();
  });

  test('should have proper form accessibility', async ({ page }) => {
    // Check form has proper labels
    const nameField = page.getByLabel(/name/i);
    await expect(nameField).toHaveAttribute('required');

    const emailField = page.getByLabel(/email/i);
    await expect(emailField).toHaveAttribute('type', 'email');
    await expect(emailField).toHaveAttribute('required');

    // Check form can be navigated with keyboard
    await nameField.focus();
    await expect(nameField).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(emailField).toBeFocused();
  });

  test('should work on mobile devices', async ({ page, isMobile }) => {
    if (isMobile) {
      // Check form is properly sized for mobile
      const contactForm = page.locator('[data-testid="contact-form"]');
      await expect(contactForm).toBeVisible();

      // Check touch targets are large enough
      const submitButton = page.getByRole('button', { name: /submit|send/i });
      const buttonBox = await submitButton.boundingBox();

      if (buttonBox) {
        expect(buttonBox.height).toBeGreaterThanOrEqual(44); // Minimum touch target size
      }

      // Test form interaction on mobile
      await page.getByLabel(/name/i).tap();
      await page.getByLabel(/name/i).fill('Mobile User');

      await page.getByLabel(/email/i).tap();
      await page.getByLabel(/email/i).fill('mobile@example.com');
    }
  });

  test('should display contact information', async ({ page }) => {
    // Check contact info section
    const contactInfo = page.locator('[data-testid="contact-info"]');
    await expect(contactInfo).toBeVisible();

    // Check for phone number (should be clickable on mobile)
    const phoneLink = page.locator('a[href^="tel:"]');
    if ((await phoneLink.count()) > 0) {
      await expect(phoneLink.first()).toBeVisible();
    }

    // Check for email link
    const emailLink = page.locator('a[href^="mailto:"]');
    if ((await emailLink.count()) > 0) {
      await expect(emailLink.first()).toBeVisible();
    }
  });

  test('should prevent spam submissions', async ({ page }) => {
    // Fill form with spam-like content
    await page.getByLabel(/name/i).fill('Spam User');
    await page.getByLabel(/email/i).fill('spam@example.com');
    await page.getByLabel(/subject/i).fill('FREE MONEY CLICK HERE');
    await page
      .getByLabel(/message/i)
      .fill(
        'Click here to win free money from our casino! Visit https://spam1.com and https://spam2.com and https://spam3.com'
      );

    const submitButton = page.getByRole('button', { name: /submit|send/i });
    await submitButton.click();

    // Should show spam detection message
    const spamMessage = page.locator('[data-testid="spam-message"]');
    await expect(spamMessage).toBeVisible();
  });

  test('should enforce rate limiting', async ({ page }) => {
    const formData = {
      name: 'Rate Limit Test',
      email: 'ratelimit@example.com',
      subject: 'Rate Limit Test',
      message: 'This is a rate limit test message',
    };

    // Submit form multiple times quickly
    for (let i = 0; i < 4; i++) {
      await page.getByLabel(/name/i).fill(formData.name);
      await page.getByLabel(/email/i).fill(formData.email);
      await page.getByLabel(/subject/i).fill(formData.subject);
      await page.getByLabel(/message/i).fill(formData.message);

      const submitButton = page.getByRole('button', { name: /submit|send/i });
      await submitButton.click();

      // Wait a bit between submissions
      await page.waitForTimeout(500);
    }

    // Should show rate limit message
    const rateLimitMessage = page.locator('[data-testid="rate-limit-message"]');
    await expect(rateLimitMessage).toBeVisible();
  });
});
