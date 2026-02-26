# Performance Budget Report

Generated: 05/10/2025, 16:51:31

## Summary

- **Total Tests:** 10
- **Passed:** 5 ✅
- **Failed:** 5 ❌
- **Warnings:** 1 ⚠️
- **Pass Rate:** 50.0%

## Performance Budget Results

### ✅ Passed Tests

- **Lighthouse Performance Score:** 92.4 (budget: 85)
- **TBT:** 156ms (budget: 200ms)
- **SI:** 3105ms (budget: 3400ms)
- **CSS Bundle:** 81.8 KB (budget: 100 KB)
- **Total Assets:** 1.8 MB (budget: 2 MB)

### ❌ Failed Tests

- **LCP:** 2626ms (budget: 2500ms) - **OVER BUDGET**
- **CLS:** 0.111 (budget: 0.1) - **OVER BUDGET**
- **FCP:** 1876ms (budget: 1800ms) - **OVER BUDGET**
- **TTI:** 3912ms (budget: 3800ms) - **OVER BUDGET**
- **JavaScript Bundle:** 509.4 KB (budget: 500 KB) - **OVER BUDGET**

### ⚠️ Warnings

- **playwright:** Playwright performance tests failed

## Recommendations

### Optimize Largest Contentful Paint (HIGH Priority)

**Metric:** LCP

**Actions:**

- Optimize and compress hero images
- Implement critical CSS inlining
- Preload key resources
- Optimize server response times

### Reduce Cumulative Layout Shift (MEDIUM Priority)

**Metric:** CLS

**Actions:**

- Add size attributes to images and videos
- Reserve space for dynamic content
- Use CSS aspect-ratio for responsive media
- Avoid inserting content above existing content

### Reduce JavaScript Bundle Size (HIGH Priority)

**Metric:** JavaScript Bundle

**Actions:**

- Implement code splitting
- Remove unused dependencies
- Use dynamic imports for non-critical code
- Enable tree shaking optimization

## Performance Budgets

| Metric            | Budget | Description                  |
| ----------------- | ------ | ---------------------------- |
| LCP               | 2500ms | Largest Contentful Paint     |
| FID               | 100ms  | First Input Delay            |
| CLS               | 0.1    | Cumulative Layout Shift      |
| FCP               | 1800ms | First Contentful Paint       |
| TTI               | 3800ms | Time to Interactive          |
| TBT               | 200ms  | Total Blocking Time          |
| JS Bundle         | 500 KB | JavaScript Bundle Size       |
| CSS Bundle        | 100 KB | CSS Bundle Size              |
| Performance Score | 85     | Lighthouse Performance Score |
