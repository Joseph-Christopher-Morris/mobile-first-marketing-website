# Performance Budget Report

Generated: 04/10/2025, 18:59:32

## Summary

- **Total Tests:** 20
- **Passed:** 12 ✅
- **Failed:** 8 ❌
- **Warnings:** 2 ⚠️
- **Pass Rate:** 60.0%

## Performance Budget Results

### ✅ Passed Tests

- **Lighthouse Performance Score:** 94.0 (budget: 85)
- **FCP:** 1652ms (budget: 1800ms)
- **TBT:** 191ms (budget: 200ms)
- **CSS Bundle:** 92.4 KB (budget: 100 KB)
- **Total Assets:** 1.6 MB (budget: 2 MB)
- **Lighthouse Performance Score:** 90.2 (budget: 85)
- **LCP:** 2492ms (budget: 2500ms)
- **TBT:** 163ms (budget: 200ms)
- **SI:** 3352ms (budget: 3400ms)
- **TTI:** 3463ms (budget: 3800ms)
- **CSS Bundle:** 82.2 KB (budget: 100 KB)
- **Total Assets:** 1.8 MB (budget: 2 MB)

### ❌ Failed Tests

- **LCP:** 2555ms (budget: 2500ms) - **OVER BUDGET**
- **CLS:** 0.125 (budget: 0.1) - **OVER BUDGET**
- **SI:** 3674ms (budget: 3400ms) - **OVER BUDGET**
- **TTI:** 3886ms (budget: 3800ms) - **OVER BUDGET**
- **JavaScript Bundle:** 516.3 KB (budget: 500 KB) - **OVER BUDGET**
- **CLS:** 0.103 (budget: 0.1) - **OVER BUDGET**
- **FCP:** 1881ms (budget: 1800ms) - **OVER BUDGET**
- **JavaScript Bundle:** 505.4 KB (budget: 500 KB) - **OVER BUDGET**

### ⚠️ Warnings

- **playwright:** Playwright performance tests failed
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
