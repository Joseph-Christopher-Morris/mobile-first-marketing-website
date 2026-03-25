# Bugfix Requirements Document

## Introduction

This bugfix addresses critical search engine indexability issues affecting the Vivid Media Cheshire website deployed via AWS S3 + CloudFront. Google Search Console reports "Alternate page with proper canonical tag" and "Crawled – currently not indexed" for blog articles and some pages. The root cause is an incomplete sitemap that only lists top-level pages while omitting all blog articles (14 articles missing), plus an artifact URL (/services/hosting/) that conflicts with the canonical URL structure. This prevents search engines from discovering and indexing blog content, significantly reducing organic search visibility.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN the sitemap.xml is generated THEN the system includes only 14 top-level pages and omits all 14 blog article URLs

1.2 WHEN the sitemap.xml is generated THEN the system includes the artifact URL https://vividmediacheshire.com/services/hosting/ alongside the canonical URL https://vividmediacheshire.com/services/website-hosting/

1.3 WHEN search engines crawl blog articles via internal links THEN Google Search Console reports "Crawled – currently not indexed" because the URLs are not present in the sitemap

1.4 WHEN users search for blog content using site:vividmediacheshire.com/blog THEN blog articles do not appear in search results due to lack of indexing

1.5 WHEN search engines encounter both /services/hosting/ and /services/website-hosting/ in the sitemap THEN Google Search Console reports "Alternate page with proper canonical tag" indicating URL canonicalization confusion

### Expected Behavior (Correct)

2.1 WHEN the sitemap.xml is generated THEN the system SHALL include all 14 blog article URLs automatically derived from the src/content/blog/ directory structure

2.2 WHEN the sitemap.xml is generated THEN the system SHALL exclude the artifact URL /services/hosting/ and include only the canonical URL /services/website-hosting/

2.3 WHEN search engines crawl the sitemap THEN all blog articles SHALL be discoverable and eligible for indexing without relying solely on internal link discovery

2.4 WHEN users search for blog content using site:vividmediacheshire.com/blog THEN blog articles SHALL appear in search results after reindexing

2.5 WHEN the sitemap is submitted to Google Search Console THEN the system SHALL report improved coverage with reduced "Crawled – currently not indexed" issues

2.6 WHEN the artifact URL /services/hosting/ is accessed THEN the system SHALL redirect with HTTP 301 status to /services/website-hosting/ to consolidate link equity

### Unchanged Behavior (Regression Prevention)

3.1 WHEN the sitemap.xml includes existing top-level pages (/, /services/, /about/, /contact/, /pricing/, /blog/, /free-audit/, /privacy-policy/) THEN the system SHALL CONTINUE TO include these URLs with their current priority and changefreq values

3.2 WHEN the sitemap.xml includes service pages (/services/website-design/, /services/website-hosting/, /services/ad-campaigns/, /services/analytics/, /services/photography/) THEN the system SHALL CONTINUE TO include these URLs with their current priority and changefreq values

3.3 WHEN the deployment pipeline builds the static site THEN the system SHALL CONTINUE TO generate sitemap.xml in the public/ directory and copy it to the out/ directory for S3 deployment

3.4 WHEN the deployment scripts sync files to S3 THEN the system SHALL CONTINUE TO upload sitemap.xml with appropriate cache headers (Cache-Control: public, max-age=3600)

3.5 WHEN CloudFront invalidation runs THEN the system SHALL CONTINUE TO invalidate /sitemap.xml to ensure search engines receive the updated version

3.6 WHEN robots.txt is accessed THEN the system SHALL CONTINUE TO reference the sitemap location and allow crawler access

3.7 WHEN canonical tags are rendered in page metadata THEN the system SHALL CONTINUE TO use the correct canonical URLs matching the deployed URL structure
