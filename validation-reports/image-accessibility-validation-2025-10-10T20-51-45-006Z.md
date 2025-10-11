# Image Accessibility Validation Report

## Summary

- **Timestamp**: 2025-10-10T20-51-45-006Z
- **CloudFront Domain**: d15sc9fc739ev2.cloudfront.net
- **Total Images Tested**: 22
- **Successful**: 5
- **Failed**: 17
- **Warnings**: 22
- **Duration**: 13s

## Category Breakdown

### HOMEPAGE SERVICE-CARDS
- **Total**: 3
- **Successful**: 3
- **Failed**: 0
- **Success Rate**: 100%

### BLOG PREVIEWS
- **Total**: 3
- **Successful**: 1
- **Failed**: 2
- **Success Rate**: 33%

### SERVICE HEROES
- **Total**: 3
- **Successful**: 1
- **Failed**: 2
- **Success Rate**: 33%

### PORTFOLIO PHOTOGRAPHY
- **Total**: 6
- **Successful**: 0
- **Failed**: 6
- **Success Rate**: 0%

### PORTFOLIO ANALYTICS
- **Total**: 3
- **Successful**: 0
- **Failed**: 3
- **Success Rate**: 0%

### PORTFOLIO ADCAMPAIGNS
- **Total**: 3
- **Successful**: 0
- **Failed**: 3
- **Success Rate**: 0%

### ABOUT HERO
- **Total**: 1
- **Successful**: 0
- **Failed**: 1
- **Success Rate**: 0%

## Security Test

- **S3 Direct Access**: ✅ BLOCKED (SECURE)
- **Status Code**: 403

## Detailed Results

### HOMEPAGE SERVICE-CARDS

#### 1. /images/services/photography-hero.webp ✅ PASS

- **URL**: https://d15sc9fc739ev2.cloudfront.net/images/services/photography-hero.webp
- **Status Code**: 200
- **Response Time**: 281ms
- **Content Type**: image/webp
- **Content Length**: 57180 bytes
- **Cache Status**: Hit from cloudfront
- **Requirement**: 1.1

**Warnings:**
- Missing Cache-Control header

#### 2. /images/services/analytics-hero.webp ✅ PASS

- **URL**: https://d15sc9fc739ev2.cloudfront.net/images/services/analytics-hero.webp
- **Status Code**: 200
- **Response Time**: 97ms
- **Content Type**: image/webp
- **Content Length**: 23692 bytes
- **Cache Status**: Hit from cloudfront
- **Requirement**: 1.1

**Warnings:**
- Missing Cache-Control header

#### 3. /images/services/ad-campaigns-hero.webp ✅ PASS

- **URL**: https://d15sc9fc739ev2.cloudfront.net/images/services/ad-campaigns-hero.webp
- **Status Code**: 200
- **Response Time**: 15ms
- **Content Type**: image/webp
- **Content Length**: 23692 bytes
- **Cache Status**: Hit from cloudfront
- **Requirement**: 1.1

**Warnings:**
- Missing Cache-Control header

### BLOG PREVIEWS

#### 1. /images/hero/google-ads-analytics-dashboard.webp ✅ PASS

- **URL**: https://d15sc9fc739ev2.cloudfront.net/images/hero/google-ads-analytics-dashboard.webp
- **Status Code**: 200
- **Response Time**: 53ms
- **Content Type**: image/webp
- **Content Length**: 23692 bytes
- **Cache Status**: Hit from cloudfront
- **Requirement**: 1.2

**Warnings:**
- Missing Cache-Control header

#### 2. /images/hero/whatsapp-image-2025-07-11-flyers-roi.webp ❌ FAIL

- **URL**: https://d15sc9fc739ev2.cloudfront.net/images/hero/whatsapp-image-2025-07-11-flyers-roi.webp
- **Status Code**: 200
- **Response Time**: 701ms
- **Content Type**: text/html
- **Content Length**: 83941 bytes
- **Cache Status**: Error from cloudfront
- **Requirement**: 1.2

**Errors:**
- Invalid Content-Type: text/html (expected image/*)

**Warnings:**
- Missing Cache-Control header

#### 3. /images/hero/240619-london-19.webp ❌ FAIL

- **URL**: https://d15sc9fc739ev2.cloudfront.net/images/hero/240619-london-19.webp
- **Status Code**: 200
- **Response Time**: 664ms
- **Content Type**: text/html
- **Content Length**: 83941 bytes
- **Cache Status**: Error from cloudfront
- **Requirement**: 1.2

**Errors:**
- Invalid Content-Type: text/html (expected image/*)

**Warnings:**
- Missing Cache-Control header

### SERVICE HEROES

#### 1. /images/services/250928-hampson-auctions-sunday-11.webp ❌ FAIL

- **URL**: https://d15sc9fc739ev2.cloudfront.net/images/services/250928-hampson-auctions-sunday-11.webp
- **Status Code**: 200
- **Response Time**: 662ms
- **Content Type**: text/html
- **Content Length**: 83941 bytes
- **Cache Status**: Error from cloudfront
- **Requirement**: 2.1, 2.3, 2.5

**Errors:**
- Invalid Content-Type: text/html (expected image/*)

**Warnings:**
- Missing Cache-Control header

#### 2. /images/services/screenshot-2025-09-23-analytics-dashboard.webp ❌ FAIL

- **URL**: https://d15sc9fc739ev2.cloudfront.net/images/services/screenshot-2025-09-23-analytics-dashboard.webp
- **Status Code**: 200
- **Response Time**: 693ms
- **Content Type**: text/html
- **Content Length**: 83941 bytes
- **Cache Status**: Error from cloudfront
- **Requirement**: 2.1, 2.3, 2.5

**Errors:**
- Invalid Content-Type: text/html (expected image/*)

**Warnings:**
- Missing Cache-Control header

#### 3. /images/services/ad-campaigns-hero.webp ✅ PASS

- **URL**: https://d15sc9fc739ev2.cloudfront.net/images/services/ad-campaigns-hero.webp
- **Status Code**: 200
- **Response Time**: 13ms
- **Content Type**: image/webp
- **Content Length**: 23692 bytes
- **Cache Status**: Hit from cloudfront
- **Requirement**: 2.1, 2.3, 2.5

**Warnings:**
- Missing Cache-Control header

### PORTFOLIO PHOTOGRAPHY

#### 1. /images/services/240217-australia-trip-232-1.webp ❌ FAIL

- **URL**: https://d15sc9fc739ev2.cloudfront.net/images/services/240217-australia-trip-232-1.webp
- **Status Code**: 200
- **Response Time**: 658ms
- **Content Type**: text/html
- **Content Length**: 83941 bytes
- **Cache Status**: Error from cloudfront
- **Requirement**: 2.2

**Errors:**
- Invalid Content-Type: text/html (expected image/*)

**Warnings:**
- Missing Cache-Control header

#### 2. /images/services/240219-australia-trip-148.webp ❌ FAIL

- **URL**: https://d15sc9fc739ev2.cloudfront.net/images/services/240219-australia-trip-148.webp
- **Status Code**: 200
- **Response Time**: 688ms
- **Content Type**: text/html
- **Content Length**: 83941 bytes
- **Cache Status**: Error from cloudfront
- **Requirement**: 2.2

**Errors:**
- Invalid Content-Type: text/html (expected image/*)

**Warnings:**
- Missing Cache-Control header

#### 3. /images/services/240619-london-19.webp ❌ FAIL

- **URL**: https://d15sc9fc739ev2.cloudfront.net/images/services/240619-london-19.webp
- **Status Code**: 200
- **Response Time**: 666ms
- **Content Type**: text/html
- **Content Length**: 83941 bytes
- **Cache Status**: Error from cloudfront
- **Requirement**: 2.2

**Errors:**
- Invalid Content-Type: text/html (expected image/*)

**Warnings:**
- Missing Cache-Control header

#### 4. /images/services/240619-london-26-1.webp ❌ FAIL

- **URL**: https://d15sc9fc739ev2.cloudfront.net/images/services/240619-london-26-1.webp
- **Status Code**: 200
- **Response Time**: 666ms
- **Content Type**: text/html
- **Content Length**: 83941 bytes
- **Cache Status**: Error from cloudfront
- **Requirement**: 2.2

**Errors:**
- Invalid Content-Type: text/html (expected image/*)

**Warnings:**
- Missing Cache-Control header

#### 5. /images/services/240619-london-64.webp ❌ FAIL

- **URL**: https://d15sc9fc739ev2.cloudfront.net/images/services/240619-london-64.webp
- **Status Code**: 200
- **Response Time**: 691ms
- **Content Type**: text/html
- **Content Length**: 83941 bytes
- **Cache Status**: Error from cloudfront
- **Requirement**: 2.2

**Errors:**
- Invalid Content-Type: text/html (expected image/*)

**Warnings:**
- Missing Cache-Control header

#### 6. /images/services/250125-liverpool-40.webp ❌ FAIL

- **URL**: https://d15sc9fc739ev2.cloudfront.net/images/services/250125-liverpool-40.webp
- **Status Code**: 200
- **Response Time**: 682ms
- **Content Type**: text/html
- **Content Length**: 83941 bytes
- **Cache Status**: Error from cloudfront
- **Requirement**: 2.2

**Errors:**
- Invalid Content-Type: text/html (expected image/*)

**Warnings:**
- Missing Cache-Control header

### PORTFOLIO ANALYTICS

#### 1. /images/services/screenshot-2025-08-12-124550.webp ❌ FAIL

- **URL**: https://d15sc9fc739ev2.cloudfront.net/images/services/screenshot-2025-08-12-124550.webp
- **Status Code**: 200
- **Response Time**: 671ms
- **Content Type**: text/html
- **Content Length**: 83941 bytes
- **Cache Status**: Error from cloudfront
- **Requirement**: 2.4

**Errors:**
- Invalid Content-Type: text/html (expected image/*)

**Warnings:**
- Missing Cache-Control header

#### 2. /images/hero/stock-photography-samira.webp ❌ FAIL

- **URL**: https://d15sc9fc739ev2.cloudfront.net/images/hero/stock-photography-samira.webp
- **Status Code**: 200
- **Response Time**: 506ms
- **Content Type**: text/html
- **Content Length**: 83941 bytes
- **Cache Status**: Error from cloudfront
- **Requirement**: 2.4

**Errors:**
- Invalid Content-Type: text/html (expected image/*)

**Warnings:**
- Missing Cache-Control header

#### 3. /images/services/output-5-analytics.webp ❌ FAIL

- **URL**: https://d15sc9fc739ev2.cloudfront.net/images/services/output-5-analytics.webp
- **Status Code**: 200
- **Response Time**: 668ms
- **Content Type**: text/html
- **Content Length**: 83941 bytes
- **Cache Status**: Error from cloudfront
- **Requirement**: 2.4

**Errors:**
- Invalid Content-Type: text/html (expected image/*)

**Warnings:**
- Missing Cache-Control header

### PORTFOLIO ADCAMPAIGNS

#### 1. /images/services/accessible-top8-campaigns-source.webp ❌ FAIL

- **URL**: https://d15sc9fc739ev2.cloudfront.net/images/services/accessible-top8-campaigns-source.webp
- **Status Code**: 200
- **Response Time**: 702ms
- **Content Type**: text/html
- **Content Length**: 83941 bytes
- **Cache Status**: Error from cloudfront
- **Requirement**: 2.6

**Errors:**
- Invalid Content-Type: text/html (expected image/*)

**Warnings:**
- Missing Cache-Control header

#### 2. /images/services/top-3-mediums-by-conversion-rate.webp ❌ FAIL

- **URL**: https://d15sc9fc739ev2.cloudfront.net/images/services/top-3-mediums-by-conversion-rate.webp
- **Status Code**: 200
- **Response Time**: 664ms
- **Content Type**: text/html
- **Content Length**: 83941 bytes
- **Cache Status**: Error from cloudfront
- **Requirement**: 2.6

**Errors:**
- Invalid Content-Type: text/html (expected image/*)

**Warnings:**
- Missing Cache-Control header

#### 3. /images/services/screenshot-2025-08-12-124550.webp ❌ FAIL

- **URL**: https://d15sc9fc739ev2.cloudfront.net/images/services/screenshot-2025-08-12-124550.webp
- **Status Code**: 200
- **Response Time**: 672ms
- **Content Type**: text/html
- **Content Length**: 83941 bytes
- **Cache Status**: Error from cloudfront
- **Requirement**: 2.6

**Errors:**
- Invalid Content-Type: text/html (expected image/*)

**Warnings:**
- Missing Cache-Control header

### ABOUT HERO

#### 1. /images/about/a7302858.webp ❌ FAIL

- **URL**: https://d15sc9fc739ev2.cloudfront.net/images/about/a7302858.webp
- **Status Code**: 200
- **Response Time**: 688ms
- **Content Type**: text/html
- **Content Length**: 83941 bytes
- **Cache Status**: Error from cloudfront
- **Requirement**: 3.1

**Errors:**
- Invalid Content-Type: text/html (expected image/*)

**Warnings:**
- Missing Cache-Control header

## Recommendations

### Failed Images (17)

The following images failed validation and need immediate attention:

- **/images/hero/whatsapp-image-2025-07-11-flyers-roi.webp** (blog-previews): Invalid Content-Type: text/html (expected image/*)
- **/images/hero/240619-london-19.webp** (blog-previews): Invalid Content-Type: text/html (expected image/*)
- **/images/services/250928-hampson-auctions-sunday-11.webp** (service-heroes): Invalid Content-Type: text/html (expected image/*)
- **/images/services/screenshot-2025-09-23-analytics-dashboard.webp** (service-heroes): Invalid Content-Type: text/html (expected image/*)
- **/images/services/240217-australia-trip-232-1.webp** (portfolio-photography): Invalid Content-Type: text/html (expected image/*)
- **/images/services/240219-australia-trip-148.webp** (portfolio-photography): Invalid Content-Type: text/html (expected image/*)
- **/images/services/240619-london-19.webp** (portfolio-photography): Invalid Content-Type: text/html (expected image/*)
- **/images/services/240619-london-26-1.webp** (portfolio-photography): Invalid Content-Type: text/html (expected image/*)
- **/images/services/240619-london-64.webp** (portfolio-photography): Invalid Content-Type: text/html (expected image/*)
- **/images/services/250125-liverpool-40.webp** (portfolio-photography): Invalid Content-Type: text/html (expected image/*)
- **/images/services/screenshot-2025-08-12-124550.webp** (portfolio-analytics): Invalid Content-Type: text/html (expected image/*)
- **/images/hero/stock-photography-samira.webp** (portfolio-analytics): Invalid Content-Type: text/html (expected image/*)
- **/images/services/output-5-analytics.webp** (portfolio-analytics): Invalid Content-Type: text/html (expected image/*)
- **/images/services/accessible-top8-campaigns-source.webp** (portfolio-adCampaigns): Invalid Content-Type: text/html (expected image/*)
- **/images/services/top-3-mediums-by-conversion-rate.webp** (portfolio-adCampaigns): Invalid Content-Type: text/html (expected image/*)
- **/images/services/screenshot-2025-08-12-124550.webp** (portfolio-adCampaigns): Invalid Content-Type: text/html (expected image/*)
- **/images/about/a7302858.webp** (about-hero): Invalid Content-Type: text/html (expected image/*)


**Actions Required:**
1. Verify images exist in the source repository
2. Check build process includes all images
3. Verify deployment script uploads images correctly
4. Check S3 bucket permissions and CloudFront OAC configuration

### Performance and Configuration Warnings

- **/images/services/photography-hero.webp**: Missing Cache-Control header
- **/images/services/analytics-hero.webp**: Missing Cache-Control header
- **/images/services/ad-campaigns-hero.webp**: Missing Cache-Control header
- **/images/hero/google-ads-analytics-dashboard.webp**: Missing Cache-Control header
- **/images/hero/whatsapp-image-2025-07-11-flyers-roi.webp**: Missing Cache-Control header
- **/images/hero/240619-london-19.webp**: Missing Cache-Control header
- **/images/services/250928-hampson-auctions-sunday-11.webp**: Missing Cache-Control header
- **/images/services/screenshot-2025-09-23-analytics-dashboard.webp**: Missing Cache-Control header
- **/images/services/ad-campaigns-hero.webp**: Missing Cache-Control header
- **/images/services/240217-australia-trip-232-1.webp**: Missing Cache-Control header
- **/images/services/240219-australia-trip-148.webp**: Missing Cache-Control header
- **/images/services/240619-london-19.webp**: Missing Cache-Control header
- **/images/services/240619-london-26-1.webp**: Missing Cache-Control header
- **/images/services/240619-london-64.webp**: Missing Cache-Control header
- **/images/services/250125-liverpool-40.webp**: Missing Cache-Control header
- **/images/services/screenshot-2025-08-12-124550.webp**: Missing Cache-Control header
- **/images/hero/stock-photography-samira.webp**: Missing Cache-Control header
- **/images/services/output-5-analytics.webp**: Missing Cache-Control header
- **/images/services/accessible-top8-campaigns-source.webp**: Missing Cache-Control header
- **/images/services/top-3-mediums-by-conversion-rate.webp**: Missing Cache-Control header
- **/images/services/screenshot-2025-08-12-124550.webp**: Missing Cache-Control header
- **/images/about/a7302858.webp**: Missing Cache-Control header


**Optimization Recommendations:**
1. Configure long-term caching for images (max-age=31536000, immutable)
2. Ensure correct Content-Type headers for WebP files
3. Monitor image file sizes and optimize large images
4. Set up CloudFront compression for better performance

### Next Steps

1. **Fix Critical Issues**: Address any failed image loads immediately
2. **Security**: Secure S3 bucket if publicly accessible
3. **Performance**: Optimize caching and Content-Type headers
4. **Monitoring**: Set up automated monitoring for ongoing validation
5. **Documentation**: Update deployment procedures based on findings

---

**Report Generated**: 2025-10-10T20:51:57.564Z  
**Validation Requirements**: 5.5, 7.2 from website-image-navigation-fixes spec
