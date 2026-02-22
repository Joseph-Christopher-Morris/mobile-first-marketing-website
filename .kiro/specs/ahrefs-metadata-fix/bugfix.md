# Bugfix Requirements Document

## Introduction

Ahrefs is detecting duplicate SEO titles and metadata issues across the website, causing the health score to drop to 71 (target: 85+). The root cause is the brand name "Vivid Media Cheshire" appearing twice in page titles due to metadata layering between the global layout template and page-level metadata configuration. This affects SEO rankings, user experience, and search engine crawlability.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a page uses buildMetadata() with a qualifier containing "Vivid Media Cheshire" THEN the system generates titles with duplicate brand names (e.g., "Pricing | Vivid Media Cheshire | Vivid Media Cheshire")

1.2 WHEN Ahrefs crawls the website THEN the system reports duplicate title tags across multiple pages

1.3 WHEN page titles exceed 60 characters due to duplication THEN the system displays truncated titles in search results

1.4 WHEN the root layout.tsx defines default metadata with brand-suffixed titles THEN the system creates potential conflicts with page-level metadata that also includes brand names

1.5 WHEN meta descriptions are missing or poorly formatted THEN the system fails to provide conversion-focused descriptions within the 140-155 character optimal range

### Expected Behavior (Correct)

2.1 WHEN a page uses buildMetadata() with any qualifier THEN the system SHALL generate titles with the brand name appearing exactly once at the end

2.2 WHEN Ahrefs crawls the website THEN the system SHALL report zero duplicate title tags

2.3 WHEN page titles are generated THEN the system SHALL ensure they remain under 60 characters while maintaining SEO structure "Primary Keyword | Supporting Context"

2.4 WHEN the root layout.tsx defines default metadata THEN the system SHALL provide fallback metadata only, without conflicting with page-level metadata

2.5 WHEN meta descriptions are generated THEN the system SHALL provide conversion-focused descriptions between 140-155 characters

2.6 WHEN metadata is deployed to production THEN the system SHALL invalidate CloudFront cache (distribution E2IBMHQ3GCW6ZK) to ensure changes are immediately visible

### Unchanged Behavior (Regression Prevention)

3.1 WHEN pages use buildMetadata() with valid intent and qualifier parameters THEN the system SHALL CONTINUE TO generate properly structured metadata objects

3.2 WHEN OpenGraph and Twitter card metadata are generated THEN the system SHALL CONTINUE TO include all required fields (title, description, images, url)

3.3 WHEN canonical URLs are generated THEN the system SHALL CONTINUE TO normalize paths with trailing slashes and build absolute URLs

3.4 WHEN noindex parameter is set to true THEN the system SHALL CONTINUE TO add proper robots meta tags

3.5 WHEN the website is deployed via GitHub Actions THEN the system SHALL CONTINUE TO use the S3 + CloudFront deployment architecture

3.6 WHEN users navigate between pages THEN the system SHALL CONTINUE TO display correct page-specific metadata without any visual or functional regressions
