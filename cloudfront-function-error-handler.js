/**
 * CloudFront Function: Error Handler for Static Site
 * 
 * Purpose: Prevent missing assets from returning HTML with 200 status
 * 
 * This function ensures that:
 * 1. Missing images return proper 404 status (not HTML with 200)
 * 2. HTML navigation requests get proper fallback handling
 * 3. Asset requests (images, CSS, JS) are never rewritten to HTML
 * 
 * Deploy this as a CloudFront Function and attach it to the viewer request event.
 * 
 * Configuration in CloudFront:
 * - Event type: Viewer Request
 * - Distribution: E2IBMHQ3GCW6ZK
 * - Behavior: Default (*)
 */

function handler(event) {
    var request = event.request;
    var uri = request.uri;
    var headers = request.headers;
    
    // Asset extensions that should NEVER be rewritten to HTML
    var assetExtensions = [
        '.webp', '.jpg', '.jpeg', '.png', '.gif', '.svg', '.ico', '.avif',
        '.css', '.js', '.json', '.xml', '.txt',
        '.woff', '.woff2', '.ttf', '.eot',
        '.mp4', '.webm', '.mp3', '.pdf'
    ];
    
    // Check if request is for an asset
    var isAsset = false;
    for (var i = 0; i < assetExtensions.length; i++) {
        if (uri.toLowerCase().endsWith(assetExtensions[i])) {
            isAsset = true;
            break;
        }
    }
    
    // If it's an asset request, pass through unchanged
    // This ensures missing assets return 403/404 from S3, not HTML
    if (isAsset) {
        return request;
    }
    
    // For HTML navigation requests without extension, add /index.html
    // This supports clean URLs like /about/ -> /about/index.html
    if (uri.endsWith('/')) {
        request.uri = uri + 'index.html';
    } else if (!uri.includes('.')) {
        // Handle URLs without trailing slash or extension
        // Check if Accept header indicates HTML request
        var acceptHeader = headers.accept ? headers.accept.value : '';
        if (acceptHeader.includes('text/html')) {
            request.uri = uri + '/index.html';
        }
    }
    
    return request;
}
