/**
 * CloudFront Function: Pretty URLs Rewriter
 * 
 * This function runs at CloudFront edge locations on viewer-request events.
 * It rewrites URLs to support pretty directory navigation:
 * 
 * Examples:
 * - / → /index.html
 * - /privacy-policy/ → /privacy-policy/index.html  
 * - /about → /about/index.html
 * - /styles.css → /styles.css (no change)
 * 
 * The function is designed to be lightweight and fast, with minimal processing overhead.
 */

function handler(event) {
    var request = event.request;
    var uri = request.uri;
    
    // Input validation - handle edge cases
    if (!uri || uri.length === 0) {
        return request; // Pass through invalid URIs
    }
    
    // Skip processing for files with extensions (except directories ending with /)
    // This preserves static assets like CSS, JS, images, etc.
    if (uri.includes('.') && !uri.endsWith('/')) {
        return request;
    }
    
    // Handle directory paths (ending with /)
    // Example: /privacy-policy/ → /privacy-policy/index.html
    if (uri.endsWith('/')) {
        request.uri += 'index.html';
    }
    // Handle extensionless paths (convert to directory + index.html)
    // Example: /about → /about/index.html
    else if (!uri.includes('.') && !uri.endsWith('/')) {
        request.uri += '/index.html';
    }
    
    return request;
}

// Export for testing (Node.js environment)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { handler };
}

// For CloudFront deployment, we need just the function code as a string
const CLOUDFRONT_FUNCTION_CODE = `function handler(event) {
    var request = event.request;
    var uri = request.uri;
    
    // Input validation - handle edge cases
    if (!uri || uri.length === 0) {
        return request; // Pass through invalid URIs
    }
    
    // Skip processing for files with extensions (except directories ending with /)
    // This preserves static assets like CSS, JS, images, etc.
    if (uri.includes('.') && !uri.endsWith('/')) {
        return request;
    }
    
    // Handle directory paths (ending with /)
    // Example: /privacy-policy/ → /privacy-policy/index.html
    if (uri.endsWith('/')) {
        request.uri += 'index.html';
    }
    // Handle extensionless paths (convert to directory + index.html)
    // Example: /about → /about/index.html
    else if (!uri.includes('.') && !uri.endsWith('/')) {
        request.uri += '/index.html';
    }
    
    return request;
}`;

// Export the function code string for deployment
if (typeof module !== 'undefined' && module.exports) {
    module.exports.CLOUDFRONT_FUNCTION_CODE = CLOUDFRONT_FUNCTION_CODE;
}