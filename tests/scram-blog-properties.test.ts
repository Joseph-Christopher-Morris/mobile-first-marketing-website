import { describe, it, expect, vi } from 'vitest';
import * as fc from 'fast-check';
import React from 'react';
import { render, cleanup } from '@testing-library/react';

// Mock next/link to render a plain anchor tag
vi.mock('next/link', () => ({
  default: ({ href, children, className, ...rest }: any) =>
    React.createElement('a', { href, className, ...rest }, children),
}));

// Mock next/image to render a plain img tag
vi.mock('next/image', () => ({
  default: ({ src, alt, ...rest }: any) =>
    React.createElement('img', { src, alt, ...rest }),
}));

import BlogPostCTA from '../src/components/scram/BlogPostCTA';
import { DEFAULT_PROBLEM, DEFAULT_SOLUTION } from '../src/components/scram/BlogPostCTA';

/**
 * Property-Based Tests for SCRAM Blog CTA
 *
 * Feature: scram-website-overhaul
 *
 * Properties tested:
 * - Property 16: Every blog post links to Website Design service page
 * - Property 17: Blog post end CTA contains required elements
 *
 * **Validates: Requirements 16.1, 17.1, 25.1, 25.2**
 */

// --- Arbitraries ---

const nonEmptyString = fc
  .string({ minLength: 1, maxLength: 120 })
  .filter((s) => s.trim().length > 0);

describe('Feature: scram-website-overhaul - Blog CTA Property Tests', () => {

  // --- Property 16: Every blog post links to Website Design service page ---

  describe('Property 16: Every blog post links to Website Design service page', () => {
    it('BlogPostCTA always contains a link to /services/website-design/ for any valid props', () => {
      // Feature: scram-website-overhaul, Property 16: Every blog post links to Website Design service page
      // **Validates: Requirements 16.1, 17.1**

      fc.assert(
        fc.property(nonEmptyString, nonEmptyString, (problemReminder, solutionStatement) => {
          const { container } = render(
            React.createElement(BlogPostCTA, {
              problemReminder,
              solutionStatement,
            })
          );

          const links = container.querySelectorAll('a');
          const hrefs = Array.from(links).map((a) => a.getAttribute('href'));
          expect(hrefs).toContain('/services/website-design/');

          cleanup();
        }),
        { numRuns: 100 }
      );
    });

    it('BlogPostCTA with default props links to /services/website-design/', () => {
      // Feature: scram-website-overhaul, Property 16: Every blog post links to Website Design service page
      // **Validates: Requirements 16.1, 17.1**

      const { container } = render(
        React.createElement(BlogPostCTA, {
          problemReminder: DEFAULT_PROBLEM,
          solutionStatement: DEFAULT_SOLUTION,
        })
      );

      const links = container.querySelectorAll('a');
      const hrefs = Array.from(links).map((a) => a.getAttribute('href'));
      expect(hrefs).toContain('/services/website-design/');

      cleanup();
    });
  });

  // --- Property 17: Blog post end CTA contains required elements ---

  describe('Property 17: Blog post end CTA contains required elements', () => {
    it('BlogPostCTA renders problem reminder, solution statement, and Website Design link for any valid inputs', () => {
      // Feature: scram-website-overhaul, Property 17: Blog post end CTA contains required elements
      // **Validates: Requirements 25.1, 25.2**

      fc.assert(
        fc.property(nonEmptyString, nonEmptyString, (problemReminder, solutionStatement) => {
          const { container } = render(
            React.createElement(BlogPostCTA, {
              problemReminder,
              solutionStatement,
            })
          );

          const text = container.textContent || '';

          // Must contain the problem reminder
          expect(text).toContain(problemReminder.trim());

          // Must contain the solution statement
          expect(text).toContain(solutionStatement.trim());

          // Must contain a link to Website Design service page
          const links = container.querySelectorAll('a');
          const hrefs = Array.from(links).map((a) => a.getAttribute('href'));
          expect(hrefs).toContain('/services/website-design/');

          cleanup();
        }),
        { numRuns: 100 }
      );
    });

    it('BlogPostCTA link meets minimum 44x44px tap target', () => {
      // Feature: scram-website-overhaul, Property 17: Blog post end CTA contains required elements
      // **Validates: Requirements 25.1, 30.2**

      const { container } = render(
        React.createElement(BlogPostCTA, {
          problemReminder: DEFAULT_PROBLEM,
          solutionStatement: DEFAULT_SOLUTION,
        })
      );

      const link = container.querySelector('a[href="/services/website-design/"]');
      expect(link).not.toBeNull();

      // Verify tap target CSS classes
      const className = link!.getAttribute('class') || '';
      expect(className).toMatch(/min-w-\[44px\]|min-w-\[48px\]/);
      expect(className).toMatch(/min-h-\[44px\]|min-h-\[48px\]/);

      cleanup();
    });

    it('BlogPostCTA renders as an aside element for semantic correctness', () => {
      // Feature: scram-website-overhaul, Property 17: Blog post end CTA contains required elements
      // **Validates: Requirements 25.1**

      fc.assert(
        fc.property(nonEmptyString, nonEmptyString, (problemReminder, solutionStatement) => {
          const { container } = render(
            React.createElement(BlogPostCTA, {
              problemReminder,
              solutionStatement,
            })
          );

          // BlogPostCTA should render as an <aside> element
          const aside = container.querySelector('aside');
          expect(aside).not.toBeNull();

          cleanup();
        }),
        { numRuns: 100 }
      );
    });
  });
});
