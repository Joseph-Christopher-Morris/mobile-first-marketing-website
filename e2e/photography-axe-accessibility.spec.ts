import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Photography Page Axe Accessibility Tests', () => {
  test('should not have any automatically detectable accessibility issues', async ({ page }) => {
    await page.goto('/services/photography');
    await page.waitForSelector('[role="grid"]', { timeout: 10000 });

    // Run axe accessibility scan
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    // Assert no violations
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should pass accessibility scan on gallery section', async ({ page }) => {
    await page.goto('/services/photography');
    await page.waitForSelector('[role="grid"]', { timeout: 10000 });

    // Focus scan on gallery section
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('[role="grid"]')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should pass accessibility scan on hero section', async ({ page }) => {
    await page.goto('/services/photography');
    
    // Focus scan on hero section
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('section:first-of-type')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should pass color contrast requirements', async ({ page }) => {
    await page.goto('/services/photography');
    await page.waitForSelector('[role="grid"]', { timeout: 10000 });

    // Specifically test color contrast
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['color-contrast'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper keyboard navigation', async ({ page }) => {
    await page.goto('/services/photography');
    await page.waitForSelector('[role="grid"]', { timeout: 10000 });

    // Test keyboard navigation rules
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['keyboard', 'focus-order-semantics', 'tabindex'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper ARIA implementation', async ({ page }) => {
    await page.goto('/services/photography');
    await page.waitForSelector('[role="grid"]', { timeout: 10000 });

    // Test ARIA rules
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules([
        'aria-allowed-attr',
        'aria-required-attr', 
        'aria-valid-attr-value',
        'aria-valid-attr',
        'aria-roles'
      ])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper heading structure', async ({ page }) => {
    await page.goto('/services/photography');
    await page.waitForSelector('[role="grid"]', { timeout: 10000 });

    // Test heading structure
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['heading-order'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper image alt text', async ({ page }) => {
    await page.goto('/services/photography');
    await page.waitForSelector('[role="grid"]', { timeout: 10000 });

    // Test image accessibility
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['image-alt'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should generate detailed accessibility report', async ({ page }) => {
    await page.goto('/services/photography');
    await page.waitForSelector('[role="grid"]', { timeout: 10000 });

    // Comprehensive scan with detailed reporting
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'])
      .analyze();

    // Log results for debugging if needed
    if (accessibilityScanResults.violations.length > 0) {
      console.log('Accessibility violations found:');
      accessibilityScanResults.violations.forEach((violation, index) => {
        console.log(`${index + 1}. ${violation.id}: ${violation.description}`);
        console.log(`   Impact: ${violation.impact}`);
        console.log(`   Help: ${violation.helpUrl}`);
        violation.nodes.forEach((node, nodeIndex) => {
          console.log(`   Node ${nodeIndex + 1}: ${node.html}`);
        });
      });
    }

    // Assert no violations
    expect(accessibilityScanResults.violations).toEqual([]);

    // Log passes for verification
    console.log(`✅ Accessibility scan passed ${accessibilityScanResults.passes.length} checks`);
    
    // Ensure we tested a reasonable number of elements
    expect(accessibilityScanResults.passes.length).toBeGreaterThan(10);
  });
});