/**
 * CloudFront Function: Redirect /services/hosting/ to /services/website-hosting/
 * 
 * This function implements a 301 redirect for the artifact URL to consolidate
 * link equity and prevent URL canonicalization confusion in Google Search Console.
 * 
 * Requirements addressed:
 * - 2.2: Exclude artifact URL /services/hosting/ from sitemap
 * - 2.5: Improve Google Search Console coverage
 * - 2.6: Redirect artifact URL with HTTP 301 status
 * 
 * CloudFront Function Limitations:
 * - Cannot set HTTP status code directly (CloudFront handles this)
 * - Must return response with status code and location header
 * - Executes at viewer request stage for optimal performance
 */

function handler(event) {
  var request = event.request;
  var uri = request.uri;

  // Check if the request is for the artifact URL
  // Match both /services/hosting and /services/hosting/ (with or without trailing slash)
  if (uri === '/services/hosting' || uri === '/services/hosting/') {
    // Return 301 redirect response
    var response = {
      statusCode: 301,
      statusDescription: 'Moved Permanently',
      headers: {
        'location': { value: '/services/website-hosting/' }
      }
    };
    return response;
  }

  // For all other requests, pass through unchanged
  return request;
}
