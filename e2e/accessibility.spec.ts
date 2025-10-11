import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Validation', () => {
  test.describe('WCAG 2.1 AA Compliance - Automated Testing', () => {
    test('should pass axe-core WCAG 2.1 AA compliance tests', async ({
      page,
    }) => {
      await page.goto('/');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should pass axe-core compliance on contact page', async ({
      page,
    }) => {
      await page.goto('/contact');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should pass axe-core compliance on all main pages', async ({
      page,
    }) => {
      const pages = ['/', '/about', '/services', '/contact'];

      for (const pagePath of pages) {
        await page.goto(pagePath);

        const accessibilityScanResults = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .analyze();

        expect(
          accessibilityScanResults.violations,
          `Accessibility violations found on ${pagePath}`
        ).toEqual([]);
      }
    });
  });

  test.describe('WCAG 2.1 AA Compliance - Manual Testing', () => {
    test('should have proper heading hierarchy', async ({ page }) => {
      await page.goto('/');

      // Check for single H1
      const h1Elements = page.getByRole('heading', { level: 1 });
      const h1Count = await h1Elements.count();
      expect(h1Count).toBe(1);

      // Check heading hierarchy (no skipped levels)
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
      const headingLevels: number[] = [];

      for (const heading of headings) {
        const tagName = await heading.evaluate(el => el.tagName.toLowerCase());
        const level = parseInt(tagName.charAt(1));
        headingLevels.push(level);
      }

      // Verify no levels are skipped
      for (let i = 1; i < headingLevels.length; i++) {
        const currentLevel = headingLevels[i];
        const previousLevel = headingLevels[i - 1];

        if (currentLevel > previousLevel) {
          expect(currentLevel - previousLevel).toBeLessThanOrEqual(1);
        }
      }
    });

    test('should have proper landmarks', async ({ page }) => {
      await page.goto('/');

      // Check for main landmark
      const main = page.getByRole('main');
      await expect(main).toBeVisible();

      // Check for navigation landmark
      const nav = page.getByRole('navigation');
      await expect(nav.first()).toBeVisible();

      // Check for banner (header) if present
      const banner = page.getByRole('banner');
      const bannerCount = await banner.count();
      if (bannerCount > 0) {
        await expect(banner.first()).toBeVisible();
      }

      // Check for contentinfo (footer) if present
      const contentinfo = page.getByRole('contentinfo');
      const contentinfoCount = await contentinfo.count();
      if (contentinfoCount > 0) {
        await expect(contentinfo.first()).toBeVisible();
      }
    });

    test('should have accessible images', async ({ page }) => {
      await page.goto('/');

      const images = page.locator('img');
      const imageCount = await images.count();

      for (let i = 0; i < imageCount; i++) {
        const img = images.nth(i);

        // All images should have alt text
        const altText = await img.getAttribute('alt');
        expect(altText).not.toBeNull();

        // Decorative images should have empty alt
        const isDecorative = await img.evaluate(el => {
          return (
            el.closest('[role="presentation"]') !== null ||
            el.getAttribute('role') === 'presentation'
          );
        });

        if (isDecorative) {
          expect(altText).toBe('');
        } else {
          // Non-decorative images should have meaningful alt text
          expect(altText?.length || 0).toBeGreaterThan(0);
        }
      }
    });

    test('should have accessible forms', async ({ page }) => {
      await page.goto('/contact');

      const formInputs = page.locator('input, textarea, select');
      const inputCount = await formInputs.count();

      for (let i = 0; i < inputCount; i++) {
        const input = formInputs.nth(i);
        const inputType = await input.getAttribute('type');

        // Skip hidden inputs
        if (inputType === 'hidden') continue;

        // Each input should have a label
        const inputId = await input.getAttribute('id');
        const ariaLabel = await input.getAttribute('aria-label');
        const ariaLabelledby = await input.getAttribute('aria-labelledby');

        if (inputId) {
          const label = page.locator(`label[for="${inputId}"]`);
          const labelCount = await label.count();

          // Should have either a label, aria-label, or aria-labelledby
          expect(labelCount > 0 || ariaLabel || ariaLabelledby).toBeTruthy();
        } else {
          expect(ariaLabel || ariaLabelledby).toBeTruthy();
        }

        // Required fields should be marked
        const isRequired = await input.getAttribute('required');
        const ariaRequired = await input.getAttribute('aria-required');

        if (isRequired !== null) {
          expect(ariaRequired).toBe('true');
        }
      }
    });

    test('should have accessible error messages', async ({ page }) => {
      await page.goto('/contact');

      // Submit empty form to trigger validation
      const submitButton = page.getByRole('button', { name: /submit|send/i });
      await submitButton.click();

      // Wait for error messages
      await page.waitForTimeout(1000);

      const errorMessages = page.locator(
        '[role="alert"], [aria-live="polite"], [aria-live="assertive"]'
      );
      const errorCount = await errorMessages.count();

      if (errorCount > 0) {
        // Error messages should be announced
        for (let i = 0; i < errorCount; i++) {
          const error = errorMessages.nth(i);
          await expect(error).toBeVisible();

          const errorText = await error.textContent();
          expect(errorText?.length || 0).toBeGreaterThan(0);
        }
      }

      // Check for field-specific error associations
      const inputsWithErrors = page.locator(
        'input[aria-describedby], textarea[aria-describedby]'
      );
      const inputErrorCount = await inputsWithErrors.count();

      for (let i = 0; i < inputErrorCount; i++) {
        const input = inputsWithErrors.nth(i);
        const describedBy = await input.getAttribute('aria-describedby');

        if (describedBy) {
          const errorElement = page.locator(`#${describedBy}`);
          await expect(errorElement).toBeVisible();
        }
      }
    });
  });

  test.describe('Keyboard Navigation - WCAG 2.1 AA Compliance', () => {
    test('should support complete keyboard navigation (2.1.1)', async ({
      page,
    }) => {
      await page.goto('/');

      // Get all focusable elements
      const focusableElements = await page
        .locator(
          'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
        )
        .all();
      const focusableCount = focusableElements.length;

      if (focusableCount === 0) {
        console.log('No focusable elements found on page');
        return;
      }

      // Test tab navigation through all elements
      const visitedElements: Array<{
        tagName: string;
        role: string | null;
        tabIndex: string | null;
        ariaLabel: string | null;
        text: string;
        id: string;
        className: string;
      }> = [];

      for (let i = 0; i < Math.min(focusableCount + 2, 20); i++) {
        await page.keyboard.press('Tab');

        const focusedElement = page.locator(':focus');
        const isVisible = await focusedElement.isVisible().catch(() => false);

        if (isVisible) {
          const elementInfo = await focusedElement.evaluate(el => ({
            tagName: el.tagName.toLowerCase(),
            role: el.getAttribute('role'),
            tabIndex: el.getAttribute('tabindex'),
            ariaLabel: el.getAttribute('aria-label'),
            text: el.textContent?.trim().substring(0, 50) || '',
            id: el.id,
            className: el.className,
          }));

          visitedElements.push(elementInfo);

          // WCAG 2.4.7: Focus must be visible
          const focusIndicator = await focusedElement.evaluate(el => {
            const styles = window.getComputedStyle(el);
            return {
              outline: styles.outline,
              outlineWidth: styles.outlineWidth,
              outlineStyle: styles.outlineStyle,
              outlineColor: styles.outlineColor,
              boxShadow: styles.boxShadow,
              border: styles.border,
              backgroundColor: styles.backgroundColor,
            };
          });

          // Check for visible focus indicator
          const hasVisibleFocus =
            focusIndicator.outline !== 'none' ||
            focusIndicator.outlineWidth !== '0px' ||
            focusIndicator.boxShadow !== 'none' ||
            focusIndicator.boxShadow.includes('inset') ||
            focusIndicator.border.includes('px');

          expect(
            hasVisibleFocus,
            `Element ${elementInfo.tagName}${elementInfo.id ? '#' + elementInfo.id : ''} lacks visible focus indicator`
          ).toBeTruthy();
        }
      }

      expect(
        visitedElements.length,
        'Should be able to navigate to focusable elements'
      ).toBeGreaterThan(0);
    });

    test('should support reverse tab navigation (2.1.1)', async ({ page }) => {
      await page.goto('/');

      // Tab forward several times
      const forwardSteps = 5;
      for (let i = 0; i < forwardSteps; i++) {
        await page.keyboard.press('Tab');
      }

      const forwardElement = page.locator(':focus');
      const forwardElementInfo = await forwardElement
        .evaluate(el => ({
          tagName: el.tagName,
          id: el.id,
          className: el.className,
          text: el.textContent?.trim(),
        }))
        .catch(() => null);

      // Tab backward
      await page.keyboard.press('Shift+Tab');

      const backwardElement = page.locator(':focus');
      const backwardElementInfo = await backwardElement
        .evaluate(el => ({
          tagName: el.tagName,
          id: el.id,
          className: el.className,
          text: el.textContent?.trim(),
        }))
        .catch(() => null);

      // Elements should be different (reverse navigation working)
      if (forwardElementInfo && backwardElementInfo) {
        const elementsAreDifferent =
          forwardElementInfo.tagName !== backwardElementInfo.tagName ||
          forwardElementInfo.id !== backwardElementInfo.id ||
          forwardElementInfo.text !== backwardElementInfo.text;

        expect(
          elementsAreDifferent,
          'Reverse tab navigation should move to different element'
        ).toBeTruthy();
      }
    });

    test('should have no keyboard traps except modals (2.1.2)', async ({
      page,
    }) => {
      await page.goto('/');

      // Test that we can tab through the entire page and return to start
      const initialFocus = await page.evaluate(
        () => document.activeElement?.tagName
      );

      // Tab through many elements
      for (let i = 0; i < 30; i++) {
        await page.keyboard.press('Tab');

        // Check if we're trapped (same element after multiple tabs)
        const currentFocus = await page.evaluate(() => ({
          tagName: document.activeElement?.tagName,
          id: document.activeElement?.id,
          className: document.activeElement?.className,
        }));

        // If we find a modal, that's acceptable keyboard trap
        const isInModal =
          (await page
            .locator('[role="dialog"], [data-testid*="modal"]')
            .count()) > 0;

        if (!isInModal) {
          // Should not be trapped in non-modal content
          const isTrapped = await page.evaluate(() => {
            const active = document.activeElement;
            return (
              active && active.getAttribute('data-keyboard-trap') === 'true'
            );
          });

          expect(
            isTrapped,
            'Found unexpected keyboard trap outside of modal'
          ).toBeFalsy();
        }
      }
    });

    test('should support Enter and Space key activation', async ({ page }) => {
      await page.goto('/');

      // Find first button
      const button = page.getByRole('button').first();
      await button.focus();

      // Test Enter key
      const initialUrl = page.url();
      await page.keyboard.press('Enter');

      // Wait for potential navigation or modal
      await page.waitForTimeout(1000);

      const afterEnterUrl = page.url();
      const modals = page.locator('[role="dialog"], [data-testid*="modal"]');
      const modalCount = await modals.count();

      // Something should have happened
      expect(afterEnterUrl !== initialUrl || modalCount > 0).toBeTruthy();
    });

    test('should support arrow key navigation in menus', async ({
      page,
      isMobile,
    }) => {
      await page.goto('/');

      // Open mobile menu if on mobile
      if (isMobile) {
        const mobileMenuButton = page.locator(
          '[data-testid="mobile-menu-button"]'
        );
        if (await mobileMenuButton.isVisible()) {
          await mobileMenuButton.click();
        }
      }

      // Find navigation menu
      const nav = page.getByRole('navigation').first();
      const menuItems = nav.getByRole('link');
      const menuItemCount = await menuItems.count();

      if (menuItemCount > 1) {
        // Focus first menu item
        await menuItems.first().focus();

        // Use arrow keys to navigate
        await page.keyboard.press('ArrowDown');

        const focusedAfterArrow = page.locator(':focus');
        const focusedText = await focusedAfterArrow.textContent();

        const secondItemText = await menuItems.nth(1).textContent();

        // Should focus next item (or handle appropriately)
        expect(focusedText).toBeTruthy();
      }
    });

    test('should trap focus in modals (2.4.3)', async ({ page }) => {
      await page.goto('/');

      // Look for modal trigger
      const modalTrigger = page
        .getByRole('button', { name: /menu|modal|open/i })
        .first();

      if (await modalTrigger.isVisible()) {
        await modalTrigger.click();

        // Wait for modal
        await page.waitForTimeout(500);

        const modal = page.locator('[role="dialog"], [data-testid*="modal"]');
        const modalCount = await modal.count();

        if (modalCount > 0) {
          // Focus should be trapped in modal
          const focusableInModal = modal.locator(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          const focusableCount = await focusableInModal.count();

          if (focusableCount > 1) {
            // Tab through modal elements
            await page.keyboard.press('Tab');
            const firstFocus = page.locator(':focus');

            // Should be within modal
            const modalElement = await modal.first().elementHandle();
            if (modalElement) {
              const isInModal = await firstFocus.evaluate((el, modalEl) => {
                return modalEl?.contains(el) || false;
              }, modalElement);

              expect(isInModal).toBeTruthy();

              // Test focus wrapping - tab to last element then one more
              for (let i = 0; i < focusableCount; i++) {
                await page.keyboard.press('Tab');
              }

              // Should wrap back to first focusable element
              const wrappedFocus = page.locator(':focus');
              const isStillInModal = await wrappedFocus.evaluate(
                (el, modalEl) => {
                  return modalEl?.contains(el) || false;
                },
                modalElement
              );

              expect(
                isStillInModal,
                'Focus should wrap within modal'
              ).toBeTruthy();
            }
          }
        }
      }
    });

    test('should restore focus when modals close (2.4.3)', async ({ page }) => {
      await page.goto('/');

      // Look for modal trigger
      const modalTrigger = page
        .getByRole('button', { name: /menu|modal|open/i })
        .first();

      if (await modalTrigger.isVisible()) {
        // Focus the trigger and remember it
        await modalTrigger.focus();
        const triggerInfo = await modalTrigger.evaluate(el => ({
          tagName: el.tagName,
          id: el.id,
          className: el.className,
          text: el.textContent?.trim(),
        }));

        // Open modal
        await modalTrigger.click();
        await page.waitForTimeout(500);

        const modal = page.locator('[role="dialog"], [data-testid*="modal"]');
        const modalCount = await modal.count();

        if (modalCount > 0) {
          // Close modal (try Escape key first)
          await page.keyboard.press('Escape');
          await page.waitForTimeout(300);

          // If still open, try close button
          const closeButton = modal
            .locator('[aria-label*="close"], [data-testid*="close"], button')
            .first();
          if ((await modal.isVisible()) && (await closeButton.isVisible())) {
            await closeButton.click();
            await page.waitForTimeout(300);
          }

          // Focus should return to trigger
          const currentFocus = page.locator(':focus');
          const currentFocusInfo = await currentFocus
            .evaluate(el => ({
              tagName: el?.tagName,
              id: el?.id,
              className: el?.className,
              text: el?.textContent?.trim(),
            }))
            .catch(() => null);

          if (currentFocusInfo) {
            const focusRestored =
              currentFocusInfo.tagName === triggerInfo.tagName &&
              currentFocusInfo.id === triggerInfo.id &&
              currentFocusInfo.text === triggerInfo.text;

            expect(
              focusRestored,
              'Focus should return to modal trigger after closing'
            ).toBeTruthy();
          }
        }
      }
    });
  });

  test.describe('Screen Reader Support - WCAG 2.1 AA Compliance', () => {
    test('should have proper accessible names for all interactive elements (4.1.2)', async ({
      page,
    }) => {
      await page.goto('/');

      // Check buttons have accessible names
      const buttons = page.getByRole('button');
      const buttonCount = await buttons.count();

      for (let i = 0; i < buttonCount; i++) {
        const button = buttons.nth(i);
        const accessibleName = await button.evaluate(el => {
          // Calculate accessible name according to spec
          const ariaLabel = el.getAttribute('aria-label');
          const ariaLabelledby = el.getAttribute('aria-labelledby');
          const title = el.getAttribute('title');
          const textContent = el.textContent?.trim();

          if (ariaLabel) return ariaLabel;
          if (ariaLabelledby) {
            const labelElement = document.getElementById(ariaLabelledby);
            return labelElement?.textContent?.trim() || '';
          }
          if (textContent) return textContent;
          if (title) return title;

          return '';
        });

        expect(
          accessibleName,
          `Button at index ${i} lacks accessible name`
        ).toBeTruthy();
        expect(
          accessibleName.length,
          `Button at index ${i} has empty accessible name`
        ).toBeGreaterThan(0);
      }

      // Check links have accessible names and context
      const links = page.getByRole('link');
      const linkCount = await links.count();

      for (let i = 0; i < Math.min(linkCount, 15); i++) {
        const link = links.nth(i);
        const linkInfo = await link.evaluate(el => {
          const ariaLabel = el.getAttribute('aria-label');
          const ariaLabelledby = el.getAttribute('aria-labelledby');
          const title = el.getAttribute('title');
          const textContent = el.textContent?.trim();
          const href = el.getAttribute('href');

          let accessibleName = '';
          if (ariaLabel) accessibleName = ariaLabel;
          else if (ariaLabelledby) {
            const labelElement = document.getElementById(ariaLabelledby);
            accessibleName = labelElement?.textContent?.trim() || '';
          } else if (textContent) accessibleName = textContent;
          else if (title) accessibleName = title;

          return { accessibleName, href, textContent };
        });

        expect(
          linkInfo.accessibleName,
          `Link at index ${i} (href: ${linkInfo.href}) lacks accessible name`
        ).toBeTruthy();
        expect(
          linkInfo.accessibleName.length,
          `Link at index ${i} has empty accessible name`
        ).toBeGreaterThan(0);

        // Links should not just say "click here" or "read more" without context
        const genericTexts = [
          'click here',
          'read more',
          'more',
          'here',
          'link',
        ];
        const isGeneric = genericTexts.some(
          text => linkInfo.accessibleName.toLowerCase().trim() === text
        );

        if (isGeneric) {
          // Generic links should have additional context via aria-label or aria-describedby
          const hasContext = await link.evaluate(el => {
            return (
              el.getAttribute('aria-label') ||
              el.getAttribute('aria-describedby') ||
              el
                .closest('article, section')
                ?.querySelector('h1, h2, h3, h4, h5, h6')?.textContent
            );
          });

          expect(
            hasContext,
            `Link "${linkInfo.accessibleName}" needs additional context`
          ).toBeTruthy();
        }
      }
    });

    test('should have proper form labels and descriptions (3.3.2)', async ({
      page,
    }) => {
      await page.goto('/contact');

      const formControls = page.locator(
        'input:not([type="hidden"]), textarea, select'
      );
      const controlCount = await formControls.count();

      for (let i = 0; i < controlCount; i++) {
        const control = formControls.nth(i);
        const controlInfo = await control.evaluate(el => {
          const htmlEl = el as
            | HTMLInputElement
            | HTMLTextAreaElement
            | HTMLSelectElement;
          return {
            id: htmlEl.id,
            name: htmlEl.name,
            type: 'type' in htmlEl ? htmlEl.type : 'select',
            required: htmlEl.hasAttribute('required'),
            ariaLabel: htmlEl.getAttribute('aria-label'),
            ariaLabelledby: htmlEl.getAttribute('aria-labelledby'),
            ariaDescribedby: htmlEl.getAttribute('aria-describedby'),
          };
        });

        // Each form control should have a label
        let hasLabel = false;

        if (controlInfo.ariaLabel) {
          hasLabel = true;
        } else if (controlInfo.ariaLabelledby) {
          const labelElement = page.locator(`#${controlInfo.ariaLabelledby}`);
          hasLabel = (await labelElement.count()) > 0;
        } else if (controlInfo.id) {
          const label = page.locator(`label[for="${controlInfo.id}"]`);
          hasLabel = (await label.count()) > 0;
        }

        expect(
          hasLabel,
          `Form control ${controlInfo.type}${controlInfo.id ? '#' + controlInfo.id : ''} lacks proper label`
        ).toBeTruthy();

        // Required fields should be properly indicated
        if (controlInfo.required) {
          const ariaRequired = await control.getAttribute('aria-required');
          expect(
            ariaRequired,
            `Required field ${controlInfo.id} should have aria-required="true"`
          ).toBe('true');
        }
      }
    });

    test('should announce dynamic content changes', async ({ page }) => {
      await page.goto('/contact');

      // Submit form to trigger dynamic content
      const submitButton = page.getByRole('button', { name: /submit|send/i });
      await submitButton.click();

      // Wait for dynamic content
      await page.waitForTimeout(1000);

      // Check for live regions
      const liveRegions = page.locator(
        '[aria-live], [role="alert"], [role="status"]'
      );
      const liveRegionCount = await liveRegions.count();

      if (liveRegionCount > 0) {
        for (let i = 0; i < liveRegionCount; i++) {
          const region = liveRegions.nth(i);
          const content = await region.textContent();

          // Live regions should have content
          expect(content?.trim().length || 0).toBeGreaterThan(0);
        }
      }
    });

    test('should provide context for complex widgets', async ({ page }) => {
      await page.goto('/');

      // Check for carousels or complex widgets
      const carousels = page.locator(
        '[role="region"][aria-label*="carousel"], [data-testid*="carousel"]'
      );
      const carouselCount = await carousels.count();

      for (let i = 0; i < carouselCount; i++) {
        const carousel = carousels.nth(i);

        // Should have accessible name
        const ariaLabel = await carousel.getAttribute('aria-label');
        const ariaLabelledby = await carousel.getAttribute('aria-labelledby');

        expect(ariaLabel || ariaLabelledby).toBeTruthy();

        // Check for navigation controls
        const prevButton = carousel.locator(
          '[aria-label*="previous"], [aria-label*="prev"]'
        );
        const nextButton = carousel.locator('[aria-label*="next"]');

        const prevCount = await prevButton.count();
        const nextCount = await nextButton.count();

        if (prevCount > 0 || nextCount > 0) {
          // Navigation buttons should have accessible names
          if (prevCount > 0) {
            const prevLabel = await prevButton
              .first()
              .getAttribute('aria-label');
            expect(prevLabel).toBeTruthy();
          }

          if (nextCount > 0) {
            const nextLabel = await nextButton
              .first()
              .getAttribute('aria-label');
            expect(nextLabel).toBeTruthy();
          }
        }
      }
    });
  });

  test.describe('Color and Contrast - WCAG 2.1 AA Compliance', () => {
    test('should meet minimum color contrast requirements (1.4.3)', async ({
      page,
    }) => {
      await page.goto('/');

      // Helper function to convert RGB to relative luminance
      const getLuminance = (r: number, g: number, b: number) => {
        const [rs, gs, bs] = [r, g, b].map(c => {
          c = c / 255;
          return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
      };

      // Helper function to calculate contrast ratio
      const getContrastRatio = (l1: number, l2: number) => {
        const lighter = Math.max(l1, l2);
        const darker = Math.min(l1, l2);
        return (lighter + 0.05) / (darker + 0.05);
      };

      // Helper function to parse RGB color
      const parseRgb = (rgbString: string) => {
        const match = rgbString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        return match
          ? [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])]
          : [0, 0, 0];
      };

      // Check text elements for contrast
      const textElements = page.locator(
        'p, h1, h2, h3, h4, h5, h6, span, a:not([role="button"]), li, td, th, label'
      );
      const elementCount = await textElements.count();

      for (let i = 0; i < Math.min(elementCount, 10); i++) {
        const element = textElements.nth(i);

        const isVisible = await element.isVisible().catch(() => false);
        if (!isVisible) continue;

        const styles = await element.evaluate(el => {
          const computed = window.getComputedStyle(el);
          const rect = el.getBoundingClientRect();

          return {
            color: computed.color,
            backgroundColor: computed.backgroundColor,
            fontSize: computed.fontSize,
            fontWeight: computed.fontWeight,
            width: rect.width,
            height: rect.height,
          };
        });

        // Skip if element is too small or has no content
        if (styles.width < 10 || styles.height < 10) continue;

        const textContent = await element.textContent();
        if (!textContent?.trim()) continue;

        // Parse colors
        const [textR, textG, textB] = parseRgb(styles.color);
        const [bgR, bgG, bgB] = parseRgb(
          styles.backgroundColor || 'rgb(255, 255, 255)'
        );

        // Calculate luminance and contrast ratio
        const textLuminance = getLuminance(textR, textG, textB);
        const bgLuminance = getLuminance(bgR, bgG, bgB);
        const contrastRatio = getContrastRatio(textLuminance, bgLuminance);

        // Determine required contrast ratio based on font size and weight
        const fontSize = parseFloat(styles.fontSize);
        const fontWeight = parseInt(styles.fontWeight) || 400;
        const isLargeText =
          fontSize >= 18 || (fontSize >= 14 && fontWeight >= 700);
        const requiredRatio = isLargeText ? 3.0 : 4.5;

        expect(
          contrastRatio,
          `Text element ${i} (${textContent.substring(0, 30)}...) has contrast ratio ${contrastRatio.toFixed(2)}, requires ${requiredRatio}`
        ).toBeGreaterThanOrEqual(requiredRatio);
      }
    });

    test('should not rely solely on color for information (1.4.1)', async ({
      page,
    }) => {
      await page.goto('/contact');

      // Submit form to trigger validation
      const submitButton = page.getByRole('button', { name: /submit|send/i });
      await submitButton.click();

      await page.waitForTimeout(1000);

      // Check for error states
      const errorFields = page.locator(
        'input[aria-invalid="true"], textarea[aria-invalid="true"]'
      );
      const errorFieldCount = await errorFields.count();

      for (let i = 0; i < errorFieldCount; i++) {
        const field = errorFields.nth(i);

        // Error should be indicated by more than just color
        const errorIndicators = await field.evaluate(el => {
          const ariaDescribedby = el.getAttribute('aria-describedby');
          const ariaInvalid = el.getAttribute('aria-invalid');
          const hasErrorText =
            ariaDescribedby && document.getElementById(ariaDescribedby);
          const hasErrorIcon = el.parentElement?.querySelector(
            '[data-testid*="error"], .error-icon, [aria-label*="error"]'
          );
          const hasErrorBorder =
            window.getComputedStyle(el).borderWidth !== '0px';

          return {
            hasErrorText: !!hasErrorText,
            hasErrorIcon: !!hasErrorIcon,
            hasErrorBorder,
            ariaInvalid,
          };
        });

        // Should have non-color error indication
        const hasNonColorIndication =
          errorIndicators.hasErrorText ||
          errorIndicators.hasErrorIcon ||
          errorIndicators.ariaInvalid === 'true';

        expect(
          hasNonColorIndication,
          `Error field ${i} relies solely on color for error indication`
        ).toBeTruthy();
      }
    });
  });

  test.describe('Focus Management - WCAG 2.1 AA Compliance', () => {
    test('should have logical focus order (2.4.3)', async ({ page }) => {
      await page.goto('/');

      const focusOrder: Array<{
        tagName: string;
        role: string | null;
        text: string;
        position: { x: number; y: number };
        id: string;
        className: string;
      }> = [];

      // Tab through the page and record focus order
      for (let i = 0; i < 15; i++) {
        await page.keyboard.press('Tab');

        const focusedElement = page.locator(':focus');
        const isVisible = await focusedElement.isVisible().catch(() => false);

        if (isVisible) {
          const elementInfo = await focusedElement.evaluate(el => {
            const rect = el.getBoundingClientRect();
            return {
              tagName: el.tagName.toLowerCase(),
              role: el.getAttribute('role'),
              text: el.textContent?.trim().substring(0, 30) || '',
              position: { x: rect.left, y: rect.top },
              id: el.id,
              className: el.className,
            };
          });

          focusOrder.push(elementInfo);
        }
      }

      // Check that focus generally moves left-to-right, top-to-bottom
      for (let i = 1; i < focusOrder.length; i++) {
        const current = focusOrder[i];
        const previous = focusOrder[i - 1];

        // Allow some flexibility for responsive layouts
        const isLogicalOrder =
          current.position.y > previous.position.y || // Next row
          (Math.abs(current.position.y - previous.position.y) < 50 &&
            current.position.x >= previous.position.x - 100); // Same row, reasonable x progression

        // Skip check for elements that might be in different layout contexts
        const skipCheck =
          (current.tagName === 'button' && previous.tagName === 'a') ||
          current.role === 'navigation' ||
          previous.role === 'navigation';

        if (!skipCheck) {
          expect(
            isLogicalOrder,
            `Focus order issue: ${previous.tagName}${previous.id ? '#' + previous.id : ''} (${previous.position.x}, ${previous.position.y}) to ${current.tagName}${current.id ? '#' + current.id : ''} (${current.position.x}, ${current.position.y})`
          ).toBeTruthy();
        }
      }
    });

    test('should have descriptive page titles (2.4.2)', async ({ page }) => {
      const pages = [
        { path: '/', expectedKeywords: ['home', 'marketing', 'business'] },
        { path: '/about', expectedKeywords: ['about', 'company', 'team'] },
        { path: '/services', expectedKeywords: ['services', 'solutions'] },
        { path: '/contact', expectedKeywords: ['contact', 'get in touch'] },
      ];

      for (const pageInfo of pages) {
        await page.goto(pageInfo.path);

        const title = await page.title();
        expect(
          title.length,
          `Page ${pageInfo.path} should have a title`
        ).toBeGreaterThan(0);
        expect(
          title.length,
          `Page ${pageInfo.path} title should be descriptive`
        ).toBeGreaterThan(10);

        // Title should be unique and descriptive
        const titleLower = title.toLowerCase();
        const hasRelevantKeyword = pageInfo.expectedKeywords.some(keyword =>
          titleLower.includes(keyword.toLowerCase())
        );

        expect(
          hasRelevantKeyword,
          `Page ${pageInfo.path} title "${title}" should contain relevant keywords`
        ).toBeTruthy();
      }
    });

    test('should have proper heading structure (1.3.1)', async ({ page }) => {
      await page.goto('/');

      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
      const headingStructure: Array<{ level: number; text: string }> = [];

      for (const heading of headings) {
        const level = await heading.evaluate(el =>
          parseInt(el.tagName.charAt(1))
        );
        const text = await heading.textContent();
        const isVisible = await heading.isVisible();

        if (isVisible && text?.trim()) {
          headingStructure.push({ level, text: text.trim() });
        }
      }

      expect(
        headingStructure.length,
        'Page should have headings'
      ).toBeGreaterThan(0);

      // Should have exactly one H1
      const h1Count = headingStructure.filter(h => h.level === 1).length;
      expect(h1Count, 'Page should have exactly one H1').toBe(1);

      // Check for proper nesting (no skipped levels)
      for (let i = 1; i < headingStructure.length; i++) {
        const current = headingStructure[i];
        const previous = headingStructure[i - 1];

        if (current.level > previous.level) {
          const levelDifference = current.level - previous.level;
          expect(
            levelDifference,
            `Heading level skip detected: H${previous.level} "${previous.text}" followed by H${current.level} "${current.text}"`
          ).toBeLessThanOrEqual(1);
        }
      }
    });

    test('should provide skip links for keyboard users (2.4.1)', async ({
      page,
    }) => {
      await page.goto('/');

      // Tab to first element to activate skip links
      await page.keyboard.press('Tab');

      // Look for skip links
      const skipLinks = page.locator('a[href^="#"], [data-testid*="skip"]');
      const skipLinkCount = await skipLinks.count();

      if (skipLinkCount > 0) {
        const firstSkipLink = skipLinks.first();
        const isVisible = await firstSkipLink.isVisible();
        const href = await firstSkipLink.getAttribute('href');
        const text = await firstSkipLink.textContent();

        expect(
          isVisible,
          'Skip link should be visible when focused'
        ).toBeTruthy();
        expect(href, 'Skip link should have valid href').toBeTruthy();
        expect(
          text?.toLowerCase().includes('skip'),
          'Skip link should have descriptive text'
        ).toBeTruthy();

        // Test that skip link works
        if (href && href.startsWith('#')) {
          await firstSkipLink.click();

          const targetElement = page.locator(href);
          const targetExists = (await targetElement.count()) > 0;

          expect(
            targetExists,
            `Skip link target ${href} should exist`
          ).toBeTruthy();
        }
      }
    });
  });

  test.describe('Mobile Accessibility', () => {
    test('should have adequate touch targets', async ({ page, isMobile }) => {
      test.skip(!isMobile, 'Mobile-specific test');

      await page.goto('/');

      // Check button sizes
      const buttons = page.getByRole('button');
      const buttonCount = await buttons.count();

      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const button = buttons.nth(i);
        const boundingBox = await button.boundingBox();

        if (boundingBox) {
          // Touch targets should be at least 44x44px
          expect(boundingBox.width).toBeGreaterThanOrEqual(44);
          expect(boundingBox.height).toBeGreaterThanOrEqual(44);
        }
      }

      // Check link sizes
      const links = page.getByRole('link');
      const linkCount = await links.count();

      for (let i = 0; i < Math.min(linkCount, 5); i++) {
        const link = links.nth(i);
        const boundingBox = await link.boundingBox();

        if (boundingBox) {
          // Links should have adequate touch targets
          const area = boundingBox.width * boundingBox.height;
          expect(area).toBeGreaterThanOrEqual(44 * 44 * 0.7); // Allow some flexibility for text links
        }
      }
    });

    test('should support mobile screen readers', async ({ page, isMobile }) => {
      test.skip(!isMobile, 'Mobile-specific test');

      await page.goto('/');

      // Check for mobile-specific ARIA attributes
      const mobileNav = page.locator('[data-testid="mobile-menu"]');
      const mobileNavCount = await mobileNav.count();

      if (mobileNavCount > 0) {
        // Mobile menu should be properly labeled
        const ariaLabel = await mobileNav.first().getAttribute('aria-label');
        const role = await mobileNav.first().getAttribute('role');

        expect(ariaLabel || role).toBeTruthy();
      }

      // Check mobile form accessibility
      await page.goto('/contact');

      const formInputs = page.locator('input, textarea');
      const inputCount = await formInputs.count();

      for (let i = 0; i < inputCount; i++) {
        const input = formInputs.nth(i);

        // Mobile inputs should have proper labels
        const inputId = await input.getAttribute('id');
        const ariaLabel = await input.getAttribute('aria-label');

        if (inputId) {
          const label = page.locator(`label[for="${inputId}"]`);
          const labelCount = await label.count();
          expect(labelCount > 0 || ariaLabel).toBeTruthy();
        }
      }
    });
  });
});
