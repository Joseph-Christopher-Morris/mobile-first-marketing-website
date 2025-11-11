# Implementation Plan

- [x] 1. Update PressLogos Component to Remove CSS Filters





  - Open `src/components/PressLogos.tsx`
  - Remove all CSS filter classes from Image component (brightness, invert, sepia, saturate, hue-rotate)
  - Update className to only include `h-8 w-auto opacity-80 hover:opacity-100 transition-opacity`
  - Remove `group` wrapper div (no longer needed without filters)
  - Verify all seven SVG logos are still referenced correctly
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 2. Remove Old PNG/JPG Press Logos







  - [x] 2.1 Remove PNG/JPG references from home page

    - Open `src/app/page.tsx`
    - Search for any `<Image>` or `<img>` tags referencing `/images/publications/`
    - Remove entire blocks that display old PNG/JPG press logos
    - Verify no broken image references remain

    - _Requirements: 3.1, 3.4_

  - [x] 2.2 Delete PNG/JPG files from public directory

    - Navigate to `/public/images/publications` directory
    - Delete all PNG/JPG press logo files (BBC, Forbes, FT, etc.)
    - Keep only the SVG files in `/public/images/press-logos/`
    - _Requirements: 3.2, 3.5_


  - [x] 2.3 Remove PNG/JPG files from S3 bucket

    - Use AWS CLI or console to delete old press logo files from S3
    - Verify files are removed from production bucket
    - _Requirements: 3.3_

- [x] 3. Update Home Page Services Section Layout






  - [x] 3.1 Update services section wrapper

    - Open `src/app/page.tsx`
    - Locate the "My Services" section
    - Update section wrapper to use `py-16 bg-gray-50`
    - Update container to use `max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center`
    - Update heading to use `text-3xl font-bold text-gray-900 mb-12`
    - _Requirements: 4.1, 4.2_


  - [x] 3.2 Update services grid layout

    - Change grid classes from `grid-cols-1 md:grid-cols-2 lg:grid-cols-4` to `grid gap-8 sm:grid-cols-2 lg:grid-cols-3 justify-items-center`
    - Verify grid centers cards on desktop (3 columns)
    - Verify grid shows 2 columns on tablet
    - Verify grid shows 1 column on mobile
    - _Requirements: 4.1, 4.3, 4.4, 4.5_


  - [x] 3.3 Update service card styling

    - Update each service card to use `bg-white rounded-2xl shadow-sm border border-gray-200 p-6 max-w-sm text-left hover:shadow-md transition-shadow`
    - Ensure cards have consistent structure: heading, description, link
    - Verify hover effects work correctly
    - _Requirements: 4.1, 4.2_

- [x] 4. Add Home Page Pricing Teaser Section





  - Open `src/app/page.tsx`
  - Add new section after services section, before final CTA
  - Use `py-12 bg-gray-50` for section wrapper
  - Add centered container with `max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center`
  - Add heading: "Simple, transparent pricing"
  - Add pricing summary text with key prices
  - Add "View full pricing" button linking to `/pricing`
  - Style button with `bg-pink-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-pink-700 transition-colors`
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 5. Add Pricing Block to Hosting Page





  - Open `src/app/services/hosting/page.tsx`
  - Add pricing section near existing transparent pricing section
  - Use `max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-6`
  - Add heading: "Hosting pricing"
  - Add pricing items: "£15 per month or £120 per year" and "free tailored quote for migration"
  - Add link to `/pricing` page with `text-pink-600 hover:text-pink-700 underline`
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 6. Add Pricing Block to Photography Page





  - Open `src/app/services/photography/page.tsx`
  - Add pricing section near "How We Work" or reassurance section
  - Use `max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 bg-slate-50 border border-slate-200 rounded-2xl p-6`
  - Add heading: "Photography pricing"
  - Add pricing items: "from £200 per day" and "£0.45 per mile"
  - Add link to `/pricing` page
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 7. Add Pricing Blocks to Other Service Pages




  - [x] 7.1 Add pricing to Ads/Campaigns page
    - Open `src/app/services/ad-campaigns/page.tsx`
    - Add pricing card with setup £20, management from £150/month
    - Use consistent styling: `bg-white rounded-2xl shadow-sm border border-gray-200 p-6`
    - Add link to `/pricing`
    - _Requirements: 8.1, 8.4, 8.5_


  - [x] 7.2 Add pricing to Analytics page
    - Open `src/app/services/analytics/page.tsx`
    - Add pricing card with GA4 setup £75, dashboard from £80, monthly from £40/month
    - Use consistent styling
    - Add link to `/pricing`
    - _Requirements: 8.2, 8.4, 8.5_

  - [x] 7.3 Add pricing to Social/SEO page (if exists)


    - Locate social media or local SEO service page
    - Add pricing card with Social + Maps from £250/month, GBP setup £75, SEO add-ons
    - Use consistent styling
    - Add link to `/pricing`
    - _Requirements: 8.3, 8.4, 8.5_

- [x] 8. Update Navigation with Pricing Links






  - [x] 8.1 Add pricing link to header navigation

    - Open `src/components/layout/Header.tsx`
    - Add "Pricing" link with href `/pricing`
    - Use consistent styling with other nav links

    - Verify link appears in desktop and mobile navigation
    - _Requirements: 5.1, 5.2, 5.4_


  - [x] 8.2 Add pricing link to footer navigation

    - Open `src/components/layout/Footer.tsx`
    - Add "Pricing" link to quick links section
    - Use consistent styling with other footer links
    - _Requirements: 5.1, 5.2_

- [x] 9. Test Responsive Design









  - [x] 9.1 Test mobile layout (375px width)

    - Verify services cards display one per row
    - Verify pricing cards remain readable
    - Verify press logos wrap properly
    - Verify no horizontal scrolling
    - _Requirements: 12.1, 12.2, 12.3, 12.4_


  - [x] 9.2 Test tablet layout (768px width)















    - Verify services cards display two per row
    - Verify pricing blocks render correctly
    - Verify press logos layout
    - _Requirements: 12.5_


  - [x] 9.3 Test desktop layout (1024px+ width)





    - Verify services cards display three per row, centered
    - Verify all pricing blocks render correctly
    - Verify press logos display in single row
    - _Requirements: 12.5_

- [x] 10. Run Accessibility Tests





  - Run axe accessibility scan on updated pages
  - Verify press logos have descriptive alt text
  - Verify pricing cards use semantic HTML
  - Verify pricing links have clear text
  - Verify keyboard navigation works
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [-] 11. Build and Deploy with Full Sync



  - [x] 11.1 Build static export

    - Run `npm run build` to generate complete static export
    - Verify build completes without errors
    - Check `./out` directory contains all files
    - Verify `./out/_next/static/` has chunk files
    - _Requirements: 1.1_


  - [x] 11.2 Sync to S3 with delete flag








    - Run `aws s3 sync ./out s3://<BUCKET_NAME> --delete`
    - Ensure entire `./out` folder is synced including `_next/static/**`
    - Verify sync completes successfully
    - _Requirements: 1.2, 1.4_


  - [ ] 11.3 Invalidate CloudFront cache









    - Run CloudFront invalidation for `/index.html` and `/_next/static/*`
    - Wait for invalidation to complete
    - Verify invalidation status
    - _Requirements: 1.3_

- [x] 12. Post-Deployment Verification






  - [x] 12.1 Verify no chunk errors

    - Open production site in browser
    - Open browser console
    - Navigate through all pages
    - Verify no "Unexpected token '<'" errors
    - Verify no "ChunkLoadError" messages
    - _Requirements: 1.5, 14.5_



  - [x] 12.2 Verify press logos display correctly
    - Check home page press logos section
    - Check photography page press logos
    - Verify logos are not warped or stretched
    - Verify logos are not recolored (no filters)
    - Verify hover effects work (opacity only)
    - _Requirements: 14.2, 14.3_

  - [x] 12.3 Verify no old PNG/JPG logos remain
    - Check all pages for old press logo references
    - Verify no broken image links
    - Verify only SVG logos are displayed
    - _Requirements: 14.1_

  - [x] 12.4 Verify pricing information displays
    - Check home page pricing teaser
    - Check hosting page pricing block
    - Check photography page pricing block
    - Check ads/campaigns page pricing block
    - Check analytics page pricing block
    - Check social/SEO page pricing block (if exists)

    - Verify all pricing links work
    - _Requirements: 14.4_

  - [x] 12.5 Verify navigation updates

    - Check header navigation has pricing link
    - Check footer navigation has pricing link
    - Verify pricing links work from all pages
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
