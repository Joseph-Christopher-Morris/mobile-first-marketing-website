## Vivid Media Cheshire – Pricing Integration & Update Instructions

**Goal:**  
Implement the new **pricing section** into the website in a clean, mobile-first layout consistent with existing UX and brand tone.

---

### 1. File to Update
`src/app/pricing/page.tsx`  
*(If the page doesn’t exist, create it under `/app/pricing/` following the same layout structure used in `/services/hosting/page.tsx`.)*

---

### 2. Metadata
```tsx
export const metadata = {
  title: "Pricing | Vivid Media Cheshire",
  description:
    "Transparent pricing for websites, ads, analytics, and photography. Affordable packages for Cheshire small businesses.",
  keywords: [
    "website design Cheshire",
    "digital marketing Cheshire",
    "Google Ads management Nantwich",
    "AWS website hosting UK",
    "affordable marketing services Cheshire",
    "local SEO packages",
  ],
  alternates: { canonical: "/pricing" },
};
```

---

### 3. Page Structure
Use this sequence for the pricing page:

1. **Hero Section**  
   - Title: `Simple, transparent pricing. No jargon or hidden fees.`  
   - Subtitle: `All services are built around clear results, affordability, and performance.`  
   - CTA Button: `Get My Free Quote →` → links to `/contact`

2. **Main Pricing Sections** (import the markdown content)
   - Google Ads Campaigns  
   - Website Design & Hosting  
   - Social Media & Google Maps Optimisation  
   - Data Analytics & Insights  
   - Photography Services  
   - Local SEO & Optimisation Add-Ons  
   - Bundled Savings (use a 2-column table layout on desktop, stacked on mobile)  
   - “Why Businesses in Cheshire Choose Vivid Media Cheshire”  
   - “Get a Fast, Free Quote” CTA at the end

3. **SEO Note:**  
   Include the “SEO Optimised Keywords” as a hidden paragraph inside `<Head>` or at the bottom of the component for indexing.

---

### 4. Layout Guidelines (from Design & UX Guidelines)
- Follow **mobile-first** layout.  
- Use **cards** with `rounded-2xl` and soft shadows.  
- Use pink accents (`bg-pink-600 hover:bg-pink-700`) for CTAs.  
- Section spacing: `py-16` mobile, `py-24` desktop.  
- Typography scale:
  - H1: `text-4xl md:text-5xl font-extrabold`
  - H2: `text-3xl font-bold`
  - Paragraphs: `text-lg text-gray-700 leading-relaxed`
- No em dashes. Use hyphens or en dashes (`–`) where necessary.
- Maintain consistent padding (`px-4 sm:px-6 lg:px-8`).

---

### 5. Example Section Layout (for reference)
```tsx
<section className="py-16 bg-white">
  <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2 className="text-3xl font-bold text-gray-900 mb-6">💡 Google Ads Campaigns</h2>
    <p className="text-lg text-gray-700 mb-6">
      <strong>Google Ads Setup – £20 one-time</strong><br />
      Get your campaigns professionally set up, tracked, and optimised from the start.
    </p>
    <ul className="list-disc pl-6 text-gray-700">
      <li>Improved click-through rates</li>
      <li>Ad spend tracked and reported</li>
      <li>No long contracts, just results</li>
    </ul>
  </div>
</section>
```

---

### 6. Footer CTA
```tsx
<section className="text-center bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-12">
  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
    Get a Fast, Free Quote
  </h2>
  <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
    Tell me what you need — hosting, ads, analytics, or photography — and I’ll reply personally within 24 hours.
  </p>
  <Link
    href="/contact"
    className="inline-flex items-center bg-pink-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-pink-700 transition-colors shadow-lg hover:shadow-xl"
  >
    Get My Free Quote →
  </Link>
  <p className="mt-4 text-gray-600">
    No obligation. No jargon. Just clear answers and results that help your business grow.
  </p>
</section>
```

---

### 7. Testing Checklist
- [ ] All pound signs (£) render correctly  
- [ ] All lists wrap naturally on mobile  
- [ ] All headings and CTAs follow consistent spacing  
- [ ] No em dashes in text  
- [ ] Lighthouse mobile score ≥ 95

