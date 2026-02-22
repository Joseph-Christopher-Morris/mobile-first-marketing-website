/**
 * Social platform validation utilities
 * Provides tools and URLs for testing social sharing metadata
 */

import { VALIDATION_URLS } from '@/config/metadata.config';

/**
 * Social platform types
 */
export type SocialPlatform = 'linkedin' | 'facebook' | 'twitter' | 'whatsapp';

/**
 * Validation result for social platform
 */
export interface SocialValidationResult {
  platform: SocialPlatform;
  url: string;
  validationUrl: string;
  instructions: string;
}

/**
 * Gets validation URL for LinkedIn Post Inspector
 */
export function getLinkedInValidationUrl(pageUrl: string): string {
  return `${VALIDATION_URLS.linkedin}?url=${encodeURIComponent(pageUrl)}`;
}

/**
 * Gets validation URL for Facebook Sharing Debugger
 */
export function getFacebookValidationUrl(pageUrl: string): string {
  return `${VALIDATION_URLS.facebook}?q=${encodeURIComponent(pageUrl)}`;
}

/**
 * Gets validation URL for X (Twitter) Card Validator
 */
export function getTwitterValidationUrl(pageUrl: string): string {
  return `${VALIDATION_URLS.twitter}?url=${encodeURIComponent(pageUrl)}`;
}

/**
 * Gets WhatsApp test URL
 */
export function getWhatsAppTestUrl(pageUrl: string): string {
  return `${VALIDATION_URLS.whatsapp}?text=${encodeURIComponent(pageUrl)}`;
}

/**
 * Gets validation information for a specific platform
 */
export function getValidationInfo(
  platform: SocialPlatform,
  pageUrl: string
): SocialValidationResult {
  switch (platform) {
    case 'linkedin':
      return {
        platform: 'linkedin',
        url: pageUrl,
        validationUrl: getLinkedInValidationUrl(pageUrl),
        instructions:
          'Open the LinkedIn Post Inspector, enter your URL, and click "Inspect". LinkedIn will show how your link preview appears.',
      };

    case 'facebook':
      return {
        platform: 'facebook',
        url: pageUrl,
        validationUrl: getFacebookValidationUrl(pageUrl),
        instructions:
          'Open the Facebook Sharing Debugger, enter your URL, and click "Debug". Facebook will show the preview and any issues.',
      };

    case 'twitter':
      return {
        platform: 'twitter',
        url: pageUrl,
        validationUrl: getTwitterValidationUrl(pageUrl),
        instructions:
          'Open the Twitter Card Validator, enter your URL, and click "Preview card". Twitter will show how your card appears.',
      };

    case 'whatsapp':
      return {
        platform: 'whatsapp',
        url: pageUrl,
        validationUrl: getWhatsAppTestUrl(pageUrl),
        instructions:
          'Open WhatsApp Web or mobile app, send the URL to yourself or a test contact, and check the link preview.',
      };

    default:
      throw new Error(`Unknown platform: ${platform}`);
  }
}

/**
 * Gets validation information for all platforms
 */
export function getAllValidationInfo(pageUrl: string): SocialValidationResult[] {
  const platforms: SocialPlatform[] = ['linkedin', 'facebook', 'twitter', 'whatsapp'];
  return platforms.map((platform) => getValidationInfo(platform, pageUrl));
}

/**
 * Generates a validation report for manual testing
 */
export function generateValidationReport(pageUrl: string): string {
  const validations = getAllValidationInfo(pageUrl);

  let report = `Social Sharing Validation Report\n`;
  report += `URL: ${pageUrl}\n`;
  report += `Generated: ${new Date().toISOString()}\n\n`;

  validations.forEach((validation) => {
    report += `${validation.platform.toUpperCase()}\n`;
    report += `Validation URL: ${validation.validationUrl}\n`;
    report += `Instructions: ${validation.instructions}\n\n`;
  });

  return report;
}

/**
 * Metadata validation checklist
 */
export interface MetadataChecklist {
  hasTitle: boolean;
  hasDescription: boolean;
  hasImage: boolean;
  hasOpenGraph: boolean;
  hasTwitterCard: boolean;
  hasCanonicalUrl: boolean;
}

/**
 * Validates metadata presence (for client-side checking)
 */
export function validateMetadataPresence(): MetadataChecklist {
  if (typeof document === 'undefined') {
    throw new Error('validateMetadataPresence can only be called in browser environment');
  }

  return {
    hasTitle: !!document.querySelector('title')?.textContent,
    hasDescription: !!document.querySelector('meta[name="description"]')?.getAttribute('content'),
    hasImage: !!document.querySelector('meta[property="og:image"]')?.getAttribute('content'),
    hasOpenGraph:
      !!document.querySelector('meta[property="og:title"]') &&
      !!document.querySelector('meta[property="og:description"]') &&
      !!document.querySelector('meta[property="og:image"]'),
    hasTwitterCard:
      !!document.querySelector('meta[name="twitter:card"]') &&
      !!document.querySelector('meta[name="twitter:title"]') &&
      !!document.querySelector('meta[name="twitter:description"]'),
    hasCanonicalUrl: !!document.querySelector('link[rel="canonical"]')?.getAttribute('href'),
  };
}

/**
 * Generates a testing guide for social platforms
 */
export function generateTestingGuide(): string {
  return `
Social Sharing Testing Guide
============================

This guide helps you test social sharing metadata across all major platforms.

BEFORE TESTING
--------------
1. Deploy your changes to production
2. Wait 2-3 minutes for CloudFront cache to update
3. Clear any previous cached previews on social platforms

TESTING PROCEDURE
-----------------

1. LINKEDIN POST INSPECTOR
   URL: ${VALIDATION_URLS.linkedin}
   Steps:
   - Enter your page URL
   - Click "Inspect"
   - Verify title, description, and image appear correctly
   - Check that the image is at least 1200×630 pixels

2. FACEBOOK SHARING DEBUGGER
   URL: ${VALIDATION_URLS.facebook}
   Steps:
   - Enter your page URL
   - Click "Debug"
   - Review the preview
   - Click "Scrape Again" if you see old content
   - Verify all Open Graph tags are present

3. X (TWITTER) CARD VALIDATOR
   URL: ${VALIDATION_URLS.twitter}
   Steps:
   - Enter your page URL
   - Click "Preview card"
   - Verify the large image card displays correctly
   - Check title and description are accurate

4. WHATSAPP TESTING
   URL: ${VALIDATION_URLS.whatsapp}
   Steps:
   - Open WhatsApp Web or mobile app
   - Send the URL to yourself or a test contact
   - Verify the link preview shows correct title, description, and image
   - Test on both mobile and desktop if possible

COMMON ISSUES
-------------
- Old preview showing: Clear platform cache and try again
- Image not loading: Check image is publicly accessible via CloudFront
- Missing metadata: Verify metadata is in HTML source (View Page Source)
- Wrong content: Ensure you're testing the correct URL (check for trailing slashes)

VALIDATION CHECKLIST
--------------------
☐ Blog article shows article-specific preview (not homepage)
☐ Service page shows service-specific preview
☐ Homepage shows homepage-specific preview
☐ All images are at least 1200×630 pixels
☐ All platforms show correct title and description
☐ No console errors in browser
☐ No build errors during deployment

For more information, see the metadata documentation in src/lib/metadata/README.md
`;
}
