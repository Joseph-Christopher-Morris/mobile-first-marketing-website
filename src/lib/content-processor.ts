/**
 * CONTENT PROCESSOR - HERO ENFORCEMENT
 * 
 * Processes blog content to ensure content images don't interfere with hero image loading.
 * Adds loading="lazy" to all content images to prevent preloading conflicts.
 */

export function processContentForHeroEnforcement(content: string): string {
  // Add loading="lazy", fetchpriority="low", and onerror fallback to all img tags in content
  // This prevents them from being preloaded before the hero image and provides fallback for missing images
  return content.replace(
    /<img([^>]*?)\/?>/gi,
    (match, attributes) => {
      let modifiedAttributes = attributes;
      
      // Add loading="lazy" if not present
      if (!attributes.includes('loading=')) {
        modifiedAttributes += ' loading="lazy"';
      }
      
      // Add fetchpriority="low" if not present
      if (!attributes.includes('fetchpriority=')) {
        modifiedAttributes += ' fetchpriority="low"';
      }
      
      // Add onerror fallback if not present
      if (!attributes.includes('onerror=')) {
        modifiedAttributes += ' onerror="this.src=\'/images/blog/default.webp\'"';
      }
      
      // Return self-closing tag
      return `<img${modifiedAttributes} />`;
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