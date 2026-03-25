/**
 * CloudFront Function: Redirect /services/hosting/ to /services/website-hosting/
 * 
 * This function implements a 301 permanent redirect for the artifact URL
 * /services/hosting/ to the canonical URL /services/website-hosting/
 * 
 * Requirements addressed:
 * - 2.2: Exclude artifact URL from sitemap and redirect to canonical URL
 * - 2.5: Consolidate link equity with proper 301 redirect
 * 
 * CloudFront Function Limitations:
 * - Must be < 10KB in size
 * - Cannot make network requests
 * - Runs at edge locations for minimal latency
 * - Event type: viewer-request (runs before cache lookup)
 */

function handler(event) {
    var request = event.request;
    var uri = request.uri;
    
    // Check if the request is for /services/hosting/ (with or without trailing slash)
    if (uri === '/services/hosting' || uri === '/services/hosting/') {
        // Return 301 permanent redirect to canonical URL
        return {
            statusCode: 301,
            statusDescription: 'Moved Permanently',
            headers: {
                'location': { value: '/services/website-hosting/' }
            }
        };
    }
    
    // For all other requests, pass through unchanged
    return request;
}
