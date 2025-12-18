/**
 * CONTENT PROCESSOR - HERO ENFORCEMENT
 * 
 * Processes blog content to ensure content images don't interfere with hero image loading.
 * Adds loading="lazy" to all content images to prevent preloading conflicts.
 */

export function processContentForHeroEnforcement(content: string): string {
  // Add loading="lazy" and fetchpriority="low" to all img tags in content
  // This prevents them from being preloaded before the hero image
  return content.replace(
    /<img([^>]*?)>/gi,
    (match, attributes) => {
      // Don't modify if already has loading attribute
      if (attributes.includes('loading=')) {
        return match;
      }
      
      // Add lazy loading and low priority
      return `<img${attributes} loading="lazy" fetchpriority="low">`;
    }
  );
}

export function validateHeroEnforcement(content: string, heroImage: string): {
  isValid: boolean;
  violations: string[];
} {
  const violations: string[] = [];
  
  // Check if content starts with img tag
  const trimmedContent = content.trim();
  if (trimmedContent.startsWith('<img')) {
    violations.push('Content starts with <img> tag - hero images must be in post.image only');
  }
  
  // Check if hero image appears in content
  if (content.includes(heroImage)) {
    violations.push(`Hero image ${heroImage} found in content - should be post.image only`);
  }
  
  return {
    isValid: violations.length === 0,
    violations
  };
}