# Accessibility Testing Guide

## Overview

This guide covers the comprehensive accessibility testing implementation for
WCAG 2.1 AA compliance. The testing suite includes automated and manual testing
approaches to ensure the website meets accessibility standards.

## Test Coverage

### WCAG 2.1 AA Compliance Areas

#### 1. Perceivable

- **Color Contrast (1.4.3)**: Automated contrast ratio testing for text and
  interactive elements
- **Text Alternatives (1.1.1)**: Image alt text validation and decorative image
  handling
- **Adaptable Content (1.3.1)**: Heading structure and landmark validation
- **Use of Color (1.4.1)**: Ensuring information isn't conveyed by color alone

#### 2. Operable

- **Keyboard Accessibility (2.1.1)**: Complete keyboard navigation testing
- **No Keyboard Trap (2.1.2)**: Ensuring focus isn't trapped except in modals
- **Focus Management (2.4.3)**: Logical focus order and focus restoration
- **Focus Visible (2.4.7)**: Visible focus indicators for all interactive
  elements

#### 3. Understandable

- **Page Titles (2.4.2)**: Descriptive and unique page titles
- **Labels and Instructions (3.3.2)**: Proper form labeling and error handling
- **Error Identification (3.3.1)**: Clear error messages and associations

#### 4. Robust

- **Name, Role, Value (4.1.2)**: Proper ARIA implementation and accessible names
- **Compatible (4.1.1)**: Valid HTML and assistive technology compatibility

## Test Implementation

### Automated Testing with Axe-Core

The test suite uses `@axe-core/playwright` for comprehensive automated
accessibility testing:

```typescript
const accessibilityScanResults = await new AxeBuilder({ page })
  .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
  .analyze();

expect(accessibilityScanResults.violations).toEqual([]);
```

### Manual Testing Implementation

#### Keyboard Navigation Tests

- Tab navigation through all focusable elements
- Reverse tab navigation (Shift+Tab)
- Enter and Space key activation
- Arrow key navigation in menus
- Focus trapping in modals
- Focus restoration after modal closure

#### Screen Reader Support Tests

- Accessible names for all interactive elements
- Proper form labels and descriptions
- Dynamic content announcements
- Context for complex widgets

#### Color and Contrast Tests

- Minimum contrast ratio validation (4.5:1 for normal text, 3:1 for large text)
- Interactive element contrast checking
- Non-color information conveyance
- High contrast mode support

#### Focus Management Tests

- Logical focus order validation
- Descriptive page titles
- Proper heading structure
- Skip link implementation

#### Mobile Accessibility Tests

- Adequate touch target sizes (44x44px minimum)
- Mobile screen reader support
- Mobile-specific ARIA attributes

## Running Accessibility Tests

### Command Line Options

```bash
# Run all accessibility tests
npm run test:e2e:accessibility

# Run comprehensive accessibility validation with reporting
npm run test:accessibility

# Run with verbose output
npm run test:accessibility:verbose

# Run specific accessibility test suites
npx playwright test e2e/accessibility.spec.ts --grep "WCAG 2.1 AA Compliance"
npx playwright test e2e/accessibility.spec.ts --grep "Keyboard Navigation"
npx playwright test e2e/accessibility.spec.ts --grep "Screen Reader Support"
```

### Test Configuration

The accessibility tests are configured to run across multiple browsers and
devices:

- Desktop Chrome, Firefox, Safari
- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 12)

### Continuous Integration

Accessibility tests should be integrated into the CI/CD pipeline:

```yaml
# Example GitHub Actions step
- name: Run Accessibility Tests
  run: |
    npm run test:accessibility

- name: Upload Accessibility Report
  uses: actions/upload-artifact@v3
  with:
    name: accessibility-report
    path: |
      accessibility-compliance-report.json
      accessibility-compliance-summary.md
```

## Test Reports

### Generated Reports

1. **JSON Report** (`accessibility-compliance-report.json`):
   - Detailed test results
   - Violation descriptions
   - Recommendations for fixes

2. **Markdown Summary** (`accessibility-compliance-summary.md`):
   - Human-readable compliance status
   - Summary of violations
   - Next steps and recommendations

### Report Structure

```json
{
  "summary": {
    "total": 45,
    "passed": 43,
    "failed": 2,
    "skipped": 0,
    "compliance": "NON-COMPLIANT",
    "timestamp": "2024-01-15T10:30:00.000Z"
  },
  "violations": [
    {
      "title": "should meet color contrast requirements",
      "error": "Text element has contrast ratio 3.2, requires 4.5",
      "location": "e2e/accessibility.spec.ts:450"
    }
  ],
  "recommendations": [...]
}
```

## Common Accessibility Issues and Fixes

### 1. Color Contrast Issues

**Problem**: Text doesn't meet minimum contrast ratio **Fix**: Adjust color
values to meet WCAG AA standards (4.5:1 for normal text)

```css
/* Before */
.text {
  color: #999;
  background: #fff;
} /* 2.8:1 ratio */

/* After */
.text {
  color: #666;
  background: #fff;
} /* 5.7:1 ratio */
```

### 2. Missing Form Labels

**Problem**: Form inputs lack proper labels **Fix**: Add explicit labels or ARIA
attributes

```html
<!-- Before -->
<input type="email" placeholder="Email" />

<!-- After -->
<label for="email">Email Address</label>
<input
  type="email"
  id="email"
  placeholder="Email"
  required
  aria-required="true"
/>
```

### 3. Focus Management Issues

**Problem**: Focus indicators not visible or logical order broken **Fix**: Add
visible focus styles and proper tab order

```css
/* Focus indicators */
button:focus,
a:focus {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}

/* Skip to main content */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: #000;
  color: #fff;
  padding: 8px;
  text-decoration: none;
  transition: top 0.3s;
}

.skip-link:focus {
  top: 6px;
}
```

### 4. Missing ARIA Labels

**Problem**: Interactive elements lack accessible names **Fix**: Add appropriate
ARIA labels

```html
<!-- Before -->
<button onclick="closeModal()">×</button>

<!-- After -->
<button onclick="closeModal()" aria-label="Close modal">×</button>
```

## Best Practices

### 1. Semantic HTML

- Use proper heading hierarchy (h1 → h2 → h3)
- Use semantic elements (nav, main, article, section)
- Provide landmarks for screen readers

### 2. ARIA Implementation

- Use ARIA labels for complex interactions
- Implement live regions for dynamic content
- Provide context for form errors

### 3. Keyboard Navigation

- Ensure all interactive elements are keyboard accessible
- Implement logical tab order
- Provide skip links for keyboard users

### 4. Testing Strategy

- Run automated tests on every build
- Perform manual testing with keyboard navigation
- Test with actual screen readers when possible
- Include accessibility testing in code reviews

## Troubleshooting

### Common Test Failures

1. **Axe-core violations**: Review specific violation details and implement
   fixes
2. **Keyboard navigation issues**: Check tab order and focus management
3. **Color contrast failures**: Adjust color values or font weights
4. **Missing labels**: Add proper labels or ARIA attributes

### Debugging Tips

1. Use browser developer tools accessibility panel
2. Test with keyboard navigation manually
3. Use screen reader testing tools
4. Validate HTML markup for semantic correctness

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Axe-core Rules](https://dequeuniversity.com/rules/axe/)
- [Playwright Accessibility Testing](https://playwright.dev/docs/accessibility-testing)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

## Maintenance

### Regular Tasks

1. **Weekly**: Run accessibility tests as part of development workflow
2. **Monthly**: Review and update test coverage
3. **Quarterly**: Audit accessibility implementation and update guidelines
4. **Annually**: Review WCAG updates and adjust testing accordingly

### Monitoring

- Set up automated accessibility testing in CI/CD
- Monitor accessibility metrics over time
- Track and resolve accessibility issues promptly
- Maintain accessibility documentation and training materials
