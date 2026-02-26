# SCRAM Content Update Implementation Plan

## Overview
Applying content direction updates to multiple pages as specified in SCRAM list.

## Pages to Update

### 1. About Page (`src/app/about/page.tsx`)
**Updates Required:**
- Hero copy: Update to "I help local businesses and trades across Cheshire attract more customers with professional visuals and straightforward marketing that gets results. You will always deal with me directly. No jargon, just reliable service that makes your business stand out."
- "Why Work With Me" paragraph: Update to "Working with me means everything is handled personally, from the first idea to the final campaign. I show up when I say I will, keep you updated in plain English, and focus on improvements you can see, like more enquiries, more bookings, or better engagement."
- "What I Do" section descriptions:
  - Photography: "Professional visuals that make your work and premises look their best on your website, listings, and social media."
  - Data Analytics: "Simple, clear insights that show what is working and where to focus next."
  - Ad Campaigns: "Google and Meta campaigns that reach the right people and turn attention into enquiries."

### 2. Blog Page (`src/app/blog/page.tsx`)
**Updates Required:**
- Update intro text to: "Practical tips and real success stories from local businesses. From running better ads to creating visuals that boost enquiries, learn what works and how you can apply it to your own marketing."
- Add existing service cards component below blog content

### 3. Contact Page (`src/app/contact/page.tsx`)
**Updates Required:**
- Update hero text to: "Need professional photos, a faster website, or help promoting your business online? Tell me what you are working on and I will reply within one business day with clear next steps."
- Add new FAQ: "Can we talk things through even if I am not sure what I need?" / "Yes. In our first chat, we can look at your current website or marketing together and decide on the most helpful next steps."

### 4. Website Design Page (`src/app/services/website-design/page.tsx`)
**Updates Required:**
- Supporting copy: "Mobile first websites on AWS CloudFront that are fast, SEO ready, and built to grow with your business and future ad campaigns. Designed to make it easier for customers to find you and get in touch."
- "Why Businesses Choose" bullets - append benefits
- Core feature blocks - adjust text per MD guidance
- Quote section: Include "Ready to create a website that works as hard as you do? Tell me about your project and we can build something that drives real enquiries and repeat customers."

### 5. Website Hosting Page (`src/app/services/website-hosting/page.tsx`)
**Updates Required:**
- Hero section: Use one-to-one version "I handle the setup, migration, and support so you can focus on running your business."
- Refine benefits bullets linking to visitor retention and Google Ads/SEO
- Add FAQ: "Will this help my Google Ads or SEO?" / "Yes. Faster load times and a clean setup usually improve quality scores for ads and help your site perform better in organic search, which means better value from your marketing spend."

### 6. Home Page (`src/app/page.tsx`)
**Updates Required:**
- Add existing service cards component below hero section

## Service Cards Component
- Already exists in `/services` page
- Reuse identical component on Home and Blog pages
- 5 cards: Website Design, Hosting, Ad Campaigns, Analytics, Photography

## Implementation Notes
- No new components needed
- No layout/styling changes
- Only update specific text blocks mentioned
- Maintain all existing functionality
- Verify builds after changes
