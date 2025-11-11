
function handler(event) {
    var response = event.response;
    var headers = response.headers;

    // Security Headers
    headers['strict-transport-security'] = { value: 'max-age=63072000; includeSubDomains; preload' };
    headers['content-security-policy'] = { value: "Content-Security-Policy:  default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com; img-src 'self' data: https://www.google-analytics.com; connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com; style-src 'self' 'unsafe-inline'; font-src 'self' https://fonts.gstatic.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests;" };
    headers['x-content-type-options'] = { value: 'nosniff' };
    headers['x-frame-options'] = { value: 'DENY' };
    headers['x-xss-protection'] = { value: '1; mode=block' };
    headers['referrer-policy'] = { value: 'strict-origin-when-cross-origin' };
    headers['permissions-policy'] = { value: 'camera=(), microphone=(), geolocation=()' };

    return response;
}
