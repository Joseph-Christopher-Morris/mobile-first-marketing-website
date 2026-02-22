/**
 * Content Processor Fallback Handler Tests
 * 
 * Verifies that the content processor correctly injects onerror fallback handlers
 * to all content images while preserving existing lazy loading attributes.
 */

import { processContentForHeroEnforcement } from '../src/lib/content-processor';

describe('Content Processor - Fallback Handler', () => {
  test('adds onerror fallback to simple img tag', () => {
    const input = '<img src="/images/blog/test.jpg">';
    const output = processContentForHeroEnforcement(input);
    
    expect(output).toContain('onerror="this.src=\'/images/blog/default.webp\'"');
    expect(output).toContain('loading="lazy"');
    expect(output).toContain('fetchpriority="low"');
  });

  test('preserves existing loading attribute', () => {
    const input = '<img src="/images/blog/test.jpg" loading="lazy">';
    const output = processContentForHeroEnforcement(input);
    
    expect(output).toContain('loading="lazy"');
    expect(output).toContain('onerror="this.src=\'/images/blog/default.webp\'"');
    expect(output).toContain('fetchpriority="low"');
  });

  test('preserves existing fetchpriority attribute', () => {
    const input = '<img src="/images/blog/test.jpg" fetchpriority="low">';
    const output = processContentForHeroEnforcement(input);
    
    expect(output).toContain('fetchpriority="low"');
    expect(output).toContain('onerror="this.src=\'/images/blog/default.webp\'"');
    expect(output).toContain('loading="lazy"');
  });

  test('does not add duplicate onerror if already present', () => {
    const input = '<img src="/images/blog/test.jpg" onerror="customHandler()">';
    const output = processContentForHeroEnforcement(input);
    
    expect(output).toContain('onerror="customHandler()"');
    expect(output).not.toContain('onerror="this.src=\'/images/blog/default.webp\'"');
  });

  test('handles multiple img tags in content', () => {
    const input = `
      <p>Some text</p>
      <img src="/images/blog/image1.jpg">
      <p>More text</p>
      <img src="/images/blog/image2.jpg">
    `;
    const output = processContentForHeroEnforcement(input);
    
    const onerrorCount = (output.match(/onerror="this\.src='\/images\/blog\/default\.webp'"/g) || []).length;
    expect(onerrorCount).toBe(2);
  });

  test('handles img tags with existing attributes', () => {
    const input = '<img src="/images/blog/test.jpg" alt="Test Image" class="blog-image">';
    const output = processContentForHeroEnforcement(input);
    
    expect(output).toContain('alt="Test Image"');
    expect(output).toContain('class="blog-image"');
    expect(output).toContain('onerror="this.src=\'/images/blog/default.webp\'"');
    expect(output).toContain('loading="lazy"');
    expect(output).toContain('fetchpriority="low"');
  });

  test('converts non-self-closing tags to self-closing', () => {
    const input = '<img src="/images/blog/test.jpg">';
    const output = processContentForHeroEnforcement(input);
    
    expect(output).toMatch(/<img[^>]*\/>/);
  });

  test('handles img tags with all attributes already present', () => {
    const input = '<img src="/images/blog/test.jpg" loading="lazy" fetchpriority="low" onerror="existing()">';
    const output = processContentForHeroEnforcement(input);
    
    expect(output).toContain('loading="lazy"');
    expect(output).toContain('fetchpriority="low"');
    expect(output).toContain('onerror="existing()"');
    // Should not add duplicates
    expect(output.match(/loading=/g)?.length).toBe(1);
    expect(output.match(/fetchpriority=/g)?.length).toBe(1);
    expect(output.match(/onerror=/g)?.length).toBe(1);
  });
});
