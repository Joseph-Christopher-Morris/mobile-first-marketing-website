CONTENT-COPY-CLEANUP-GUIDE.md

Last Updated: 23 November 2025
Author: Vivid Media Cheshire
Purpose: Ensure consistent UK English, no em dashes, and correct theming across all service pages.

✅ Overview

This document outlines the exact rules and procedures for cleaning and maintaining the copy across all service pages on the Vivid Media Cheshire website.

These rules MUST be followed for:

/services/website-design

/services/ad-campaigns

/services/analytics

/services/web-hosting-and-migration

/free-audit

Any future service pages or landing pages

These rules ensure:

✔ No em dashes
✔ UK English
✔ Active voice
✔ Consistent theming
✔ Clear, accessible copy
✔ Google Ads landing-page compatibility

✅ 1. Remove All Em Dashes
Characters to remove:
Character	Name
—	Em dash
–	En dash
Replacement Rules:
a. If the dash links two clauses

Replace with a full stop or connecting words.

Examples:

Before: Takes 60 seconds — no obligation
After: Takes about 60 seconds with no obligation

Before: Better results — backed by data
After: Better results backed by data

Before: Good for SEO — improves user experience
After: Good for SEO. It improves user experience

b. If the dash shows a range

Replace with a normal hyphen.

Examples:

Before: 1–2 weeks
After: 1-2 weeks

Before: £300–£600
After: £300-£600

✅ 2. Maintain UK English Throughout

When updating or adding copy, ALWAYS use UK spelling.

US Spelling	UK Spelling
optimize	optimise
color	colour
behavior	behaviour
center	centre
analyze	analyse
tailored/optimized/etc	maintain as UK format

If unsure → check UK-ENGLISH-QUICK-REFERENCE.md.

✅ 3. Keep Current Page Theming

You selected Option A, meaning:

Keep the existing per-page colour palettes.

Do NOT standardise into one colour scheme.

Only tidy up inconsistencies if any are introduced.

Current Themes:
Page	Main Theme
Website Design	Pink + blue/indigo accents
Ad Campaigns	Pink gradient
Analytics	Purple gradient
Hosting & Migration	Pink/purple gradient
Free Audit	Pink
Rules:

✔ Keep all Tailwind colour classes as they are
✔ Do not replace colour families
✔ Only fix broken or inconsistent colours when necessary

✅ 4. Remove Deprecated Testimonials

Remove the following testimonials wherever they appear:

Website Design / Hosting

Sarah Mitchell

David Thompson

Analytics

Mark Stevens

Lisa Chen

Also remove these headings:

“What Cheshire businesses say”

Any testimonial section titles linked to these testimonials

Do NOT remove:

Anna

Claire

Zach
(these remain and are used on /free-audit and elsewhere)

✅ 5. Where to Apply These Rules

Apply the above rules in the following files:

/src/app/services/website-design/page.tsx
/src/app/services/ad-campaigns/page.tsx
/src/app/services/analytics/page.tsx
/src/app/services/web-hosting-and-migration/page.tsx
/src/app/free-audit/page.tsx
/src/components/* where copy appears


These rules also apply to any NEW pages created.

✅ 6. Find & Replace Procedure
Step 1 — Search for prohibited characters:
—
–

Step 2 — Replace based on rules:

Clause → replace with full stop or connecting phrasing

Range → replace with hyphen

Step 3 — Search for testimonial blocks:
Sarah Mitchell
Mitchell's Garage
David Thompson
Thompson Plumbing Services
Mark Stevens
Stevens Roofing
Lisa Chen
Chen & Associates


Delete entire associated JSX blocks.

Step 4 — Remove headings:
What Cheshire businesses say

Step 5 — Review for UK English consistency

Search for:

optimize
optimized
optimization
center
behavior
color
analyze


Replace with UK English.

✅ 7. Example Patch (as used in Website Design page)
- Takes 60 seconds — no obligation
+ Takes about 60 seconds with no obligation

- Every project is tailored to your specific needs — you'll get a precise quote
+ Every project is tailored to your specific needs. You will get a precise quote

- <option>1–2 weeks</option>
+ <option>1-2 weeks</option>


This format must be used for all service pages.

✅ 8. Deployment Notes

After updating content:

npm run build
node scripts/deploy.js


Then wait 2–3 minutes for CloudFront invalidation.

📦 This file is safe for Kiro ingestion

This MD file:

✔ Contains no code
✔ Uses declarative instructions
✔ Matches SCRAM content rules
✔ Suitable for automation
✔ Safe for content enforcement