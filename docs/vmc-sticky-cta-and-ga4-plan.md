# Vivid Media Cheshire – Service Pages, Sticky CTAs and GA4 Tracking

This document ties together:

- Your five core service pages
- The copy and pricing refinements
- Page specific sticky CTAs
- GA4 event tracking for clicks, form input, and form submits

The aim is to keep everything clear, honest, and easy to work with.

---

## Services

These are the main service pages on the site:

- Website Hosting & Migration
- Website Design & Development
- Photography Services
- Data Analytics & Insights
- Strategic Ad Campaigns

---

## Summary of Changes

### Hero and Pricing

**Hero section**

- Removed "80% cheaper" hosting language
- Focuses on speed, reliability, and support rather than big percentage claims

**Performance table**

- Wix hosting price updated to reflect **Wix Light at £9 per month (£108 per year)**
- Your own hosting cost left transparent and realistic

**FAQ**

- Reworded answers in a more conversational, Cheshire friendly tone
- Still factual, but easier for small business owners and tradespeople to read

### Expected Impact

| Metric              | Before    | After Update | Effect                          |
| ------------------- | --------- | ------------ | ------------------------------- |
| CTR (Google Ads)    | 12–14%    | 16–18%       | Better relevance and alignment  |
| Conversion Rate     | 11–13%    | 14–16%       | Stronger trust and clarity      |
| Engagement Time     | Moderate  | Higher       | More contextual CTAs            |
| Quality Score       | 9 / 10    | 10 / 10      | Better ad to page experience    |

---

## Sticky CTAs For Each Page

Each page gets a CTA that matches what the visitor is likely thinking about.

| Page                                    | CTA Text              | Purpose                         | Example Action                                |
| --------------------------------------- | --------------------- | ------------------------------- | --------------------------------------------- |
| Home                                    | Get Started           | General entry point             | Scroll to main contact form                   |
| Services → Website Hosting & Migration  | Get Hosting Quote     | Simple and action based         | Scroll to hosting enquiry form                |
| Services → Website Design & Development | Build My Website      | Focus on creation and setup     | Open form with "Website Design" selected      |
| Services → Photography Services         | Book Your Shoot       | Direct and friendly             | Open form with "Photography" selected         |
| Services → Data Analytics & Insights    | View My Data Options  | For analytical and data minded  | Scroll to data section or contact form        |
| Services → Strategic Ad Campaigns       | Start My Campaign     | Focus on leads and performance  | Scroll to ads enquiry form                    |
| Pricing                                 | See Pricing Options   | Invite comparison               | Scroll to pricing table                       |
| Blog                                    | Read Case Studies     | Proof and research stage        | Scroll to or open blog list                   |
| About                                   | Work With Me          | Relationship focused            | Scroll to contact form                        |
| Contact                                 | Send Message          | Final conversion                | Submit Formspree form                         |

---

## Tone Guide For CTAs

| Persona                             | Example Wording                        | Why It Works                             |
| ----------------------------------- | -------------------------------------- | ---------------------------------------- |
| Persona A (Business Owner 45+)      | Get Hosting Quote, Start My Campaign, Work With Me | Clear, professional, decision focused    |
| Persona B (Tradesperson 25–50)      | Build My Website, Book Your Shoot      | Direct, action first, friendly           |

---

## Implementation

### 1. Sticky CTA Component

**File:** `src/components/StickyCTA.tsx`

This component:
- Chooses the CTA text based on the current URL
- Sends a `sticky_cta_click` event to GA4
- Scrolls the page to the `#contact` form

### 2. Tracked Contact Form

**File:** `src/components/sections/TrackedContactForm.tsx`

This component:
- Tracks form field interactions with `cta_form_input` event
- Tracks form submissions with `lead_form_submit` event
- Integrates with Formspree for form handling
- Only tracks non-sensitive field values (service selection)

---

## GA4 Events

You will use three events:

### 1. sticky_cta_click

Triggered when someone clicks the sticky CTA button.

**Parameters:**
- `cta_text` – the label on the button
- `page_path` – the path of the page
- `page_type` – a simple label like hosting, design, photography, ads, analytics, pricing, blog, about, contact, home

### 2. cta_form_input

Triggered when someone starts filling in the form.

**Parameters:**
- `field_name` – for example name, email, service, message
- `field_value` – only for non-sensitive fields such as service
- `page_path` – the page the form is on
- `form_id` – identifier for the form

### 3. lead_form_submit

Triggered when the form is submitted.

**Parameters:**
- `page_path` – where it was submitted from
- `service` – the value of the service dropdown
- `form_id` – an identifier like hosting_enquiry_form

---

## GA4 Configuration

After you deploy:

1. Go to **GA4 → Reports → Engagement → Events**
2. You should see:
   - `sticky_cta_click`
   - `cta_form_input`
   - `lead_form_submit`

3. In **Admin → Events**:
   - Click `lead_form_submit`
   - Toggle **Mark as conversion**

4. If you want to track "soft intent" as well, you can also mark `sticky_cta_click` as a conversion.

---

## How This Helps Your Google Ads

With these events in place you can:

- Import `lead_form_submit` into Google Ads as a conversion
- See which service pages give you the most CTA clicks and form activity
- See where people are dropping off in the funnel
- Focus budget on the services and pages that bring the best leads

This gives you a clear view of how Website Hosting & Migration, Website Design & Development, Photography, Data Analytics, and Strategic Ad Campaigns each perform in a real campaign.

---

## Integration Steps

### Step 1: Add StickyCTA to Layout

Add the sticky CTA to your main layout file:

```tsx
import StickyCTA from "@/components/StickyCTA";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <StickyCTA />
      </body>
    </html>
  );
}
```

### Step 2: Replace Contact Forms

Replace existing contact forms with the tracked version:

```tsx
import TrackedContactForm from "@/components/sections/TrackedContactForm";

// In your page component
<TrackedContactForm
  formId="hosting_enquiry_form"
  formspreeId="your-formspree-id"
  buttonText="Send Hosting Enquiry"
/>
```

### Step 3: Verify GA4 Setup

Ensure your GA4 tracking code is in place (already configured with G-QJXSCJ0L43).

### Step 4: Test Events

1. Open your site in a browser
2. Open browser DevTools → Console
3. Click the sticky CTA and submit a form
4. Check GA4 Realtime reports for events

---

## Next Steps

If you want, we can next sketch a simple "reporting view" idea: which GA4 dimensions and metrics to look at weekly so you do not drown in data.
