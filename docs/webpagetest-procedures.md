# WebPageTest Integration Procedures

## Overview

WebPageTest provides real-world performance testing from multiple global locations with various connection speeds. This complements Lighthouse CI with actual network conditions.

---

## Configuration

### Test Location
- **Primary:** London, UK (EU West)
- **Secondary:** Frankfurt, Germany (EU Central)
- **Fallback:** Dublin, Ireland (EU West)

### Connection Profile
- **Primary:** 4G LTE (9 Mbps down, 2 Mbps up, 170ms RTT)
- **Secondary:** Cable (5 Mbps down, 1 Mbps up, 28ms RTT)
- **Mobile:** 3G Fast (1.6 Mbps down, 768 Kbps up, 150ms RTT)

### Test Settings
- **Runs:** 3 (median result)
- **First View:** Yes
- **Repeat View:** Yes (tests caching)
- **Video:** Yes (for filmstrip)
- **Connection:** 4G LTE
- **Browser:** Chrome (latest)
- **Mobile Emulation:** Moto G4

---

## Core Pages to Test

1. **Homepage:** `https://d15sc9fc739ev2.cloudfront.net/`
2. **About:** `https://d15sc9fc739ev2.cloudfront.net/about/`
3. **Contact:** `https://d15sc9fc739ev2.cloudfront.net/contact/`
4. **Services:** `https://d15sc9fc739ev2.cloudfront.net/services/`
5. **Photography:** `https://d15sc9fc739ev2.cloudfront.net/services/photography/`
6. **Blog:** `https://d15sc9fc739ev2.cloudfront.net/blog/`

---

## Pass Criteria

### Performance Metrics

| Metric | Target | Acceptable | Fail |
|--------|--------|------------|------|
| **First Byte** | < 200ms | < 400ms | > 600ms |
| **Start Render** | < 1.0s | < 1.5s | > 2.0s |
| **LCP** | < 2.5s | < 3.0s | > 4.0s |
| **CLS** | < 0.1 | < 0.15 | > 0.25 |
| **TBT** | < 200ms | < 300ms | > 600ms |
| **Speed Index** | < 2.5s | < 3.5s | > 4.5s |
| **Fully Loaded** | < 4.0s | < 5.0s | > 7.0s |

### Grades

- **Performance:** A or B
- **Security:** A
- **First Byte:** A or B
- **Keep-alive:** A
- **Compress Transfer:** A
- **Compress Images:** A or B
- **Cache Static:** A
- **CDN Detected:** Yes

### Resource Counts

- **Requests:** < 50 (first view)
- **Bytes In:** < 2 MB (first view)
- **Requests:** < 10 (repeat view)
- **Bytes In:** < 500 KB (repeat view)

---

## Testing Schedule

### Weekly Tests
- **Day:** Monday, 10:00 AM GMT
- **Frequency:** Weekly
- **Duration:** ~15 minutes
- **Notification:** Email to team

### Ad-hoc Tests
- After major deployments
- Before production releases
- When performance issues reported
- After infrastructure changes

---

## Running Tests

### Manual Testing (WebPageTest.org)

1. Go to https://www.webpagetest.org/
2. Enter URL: `https://d15sc9fc739ev2.cloudfront.net/`
3. Select:
   - **Test Location:** London, UK
   - **Browser:** Chrome
   - **Connection:** 4G LTE
4. Click "Advanced Settings":
   - **Number of Tests:** 3
   - **Repeat View:** First View and Repeat View
   - **Capture Video:** Yes
   - **Mobile Emulation:** Moto G4
5. Click "Start Test"
6. Wait for results (~3-5 minutes)
7. Review metrics and filmstrip
8. Save results URL

### API Testing (Automated)

```bash
# Install WebPageTest CLI
npm install -g webpagetest

# Run test
webpagetest test https://d15sc9fc739ev2.cloudfront.net/ \
  --location London_EC2:Chrome \
  --connectivity 4G \
  --runs 3 \
  --video \
  --first \
  --repeat \
  --mobile
```

### Using the Script

```bash
# Run WebPageTest for all core pages
node scripts/run-webpagetest.js

# Run for specific page
node scripts/run-webpagetest.js --url https://d15sc9fc739ev2.cloudfront.net/about/

# Run with custom location
node scripts/run-webpagetest.js --location Frankfurt
```

---

## Interpreting Results

### Waterfall Analysis

Look for:
- ✅ Early HTML response (< 200ms)
- ✅ Parallel resource loading
- ✅ CDN usage (CloudFront)
- ✅ Compressed resources
- ✅ Cached resources on repeat view
- ❌ Render-blocking resources
- ❌ Large JavaScript bundles
- ❌ Unoptimized images

### Filmstrip Review

Check:
- **0-1s:** White screen acceptable
- **1-2s:** Hero image visible
- **2-3s:** Main content rendered
- **3-4s:** Page interactive
- **4s+:** Fully loaded

### Core Web Vitals

- **LCP:** Should be hero image
- **CLS:** Should be < 0.1
- **FID/TBT:** Should be minimal

---

## Troubleshooting

### Slow First Byte
- Check CloudFront cache hit rate
- Verify origin response time
- Check DNS resolution time
- Review CloudFront distribution config

### High LCP
- Optimize hero image size
- Add priority loading
- Preconnect to critical origins
- Reduce render-blocking resources

### High CLS
- Add explicit dimensions to images
- Reserve space for dynamic content
- Avoid inserting content above fold
- Use CSS containment

### Large Bundle Size
- Code split by route
- Lazy load non-critical components
- Remove unused dependencies
- Optimize third-party scripts

---

## Reporting

### Weekly Report Template

```markdown
# WebPageTest Results - [Date]

## Summary
- **Test Date:** [Date]
- **Location:** London, UK
- **Connection:** 4G LTE
- **Pages Tested:** 6

## Results

### Homepage
- **LCP:** [X.X]s (Target: < 2.5s)
- **CLS:** [X.XX] (Target: < 0.1)
- **Speed Index:** [X.X]s (Target: < 2.5s)
- **Grade:** [A/B/C]
- **Status:** ✅ Pass / ❌ Fail

[Repeat for each page]

## Issues Found
1. [Issue description]
2. [Issue description]

## Recommendations
1. [Recommendation]
2. [Recommendation]

## Links
- [WebPageTest Results URL]
```

---

## Integration with CI/CD

### GitHub Actions (Future)

```yaml
name: WebPageTest

on:
  schedule:
    - cron: '0 10 * * 1'  # Monday 10 AM
  workflow_dispatch:

jobs:
  webpagetest:
    runs-on: ubuntu-latest
    steps:
      - name: Run WebPageTest
        run: |
          npm install -g webpagetest
          webpagetest test ${{ secrets.SITE_URL }} \
            --location London_EC2:Chrome \
            --connectivity 4G \
            --runs 3
```

---

## Best Practices

1. **Consistent Testing:** Same location, connection, time of day
2. **Multiple Runs:** Always run 3+ tests, use median
3. **Compare Trends:** Track metrics over time
4. **Test After Changes:** Run tests after major deployments
5. **Document Issues:** Log all performance regressions
6. **Share Results:** Communicate findings to team
7. **Act on Data:** Create tickets for issues found

---

## Resources

- **WebPageTest:** https://www.webpagetest.org/
- **Documentation:** https://docs.webpagetest.org/
- **API Docs:** https://docs.webpagetest.org/api/
- **CLI Tool:** https://github.com/marcelduran/webpagetest-api

---

**Last Updated:** November 12, 2025  
**Owner:** Development Team  
**Review Frequency:** Quarterly
