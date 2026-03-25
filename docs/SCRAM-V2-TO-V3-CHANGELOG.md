# SCRAM v2 → v3 Changelog

All changes implemented across this session. Build passes clean after each version.

---

## SCRAM v2.2 — Final Conversion Layer

### §1 CTA Urgency Layer
- Added `urgencyLine` prop to `CTABlock` component
- "Most people miss this on their own." rendered below valueLine on Homepage and Website Design CTAs

### §2 Reader Recognition Trigger
- "If your website gets visitors but no enquiries, this is why." added to Homepage, Website Design, and Hosting pages
- Placed after WhyWebsitesFail / after hero on each page

### §3 Logic Completion (Ads Section)
- "So the problem wasn't traffic. It was what people saw next." added to `TheFeedGroupProofBlock`

### §4 Objection Neutralisation
- "Most websites don't fail because they look bad. They fail because no one made the next step obvious." added before transformation statements on all three key pages

### §5 Proof Hierarchy Weighting (Homepage)
- SpeedProofBlock: highest emphasis — `py-14 md:py-20`, `text-fluid-2xl md:text-3xl` (unchanged)
- TheFeedGroupProofBlock: reduced to diagnostic weight — `py-12 md:py-16`, `text-fluid-xl md:text-2xl`
- NYCCProofBlock: reduced to supporting weight — `py-10 md:py-14`, `text-fluid-xl md:text-2xl`
- StockPhotographyProofBlock (homepage): already lightest — `py-10 md:py-14`, `text-fluid-lg md:text-xl`
- TheFeedGroupProofBlock moved up in homepage order (between Speed and NYCC)

### Files changed
- `src/components/scram/CTABlock.tsx`
- `src/components/scram/TheFeedGroupProofBlock.tsx`
- `src/components/scram/NYCCProofBlock.tsx`
- `src/app/page.tsx`
- `src/app/services/website-design/page.tsx`
- `src/app/services/hosting/page.tsx`

---

## SCRAM v2.3 — Final 5% Conversion Reinforcement

### §1 CTA Expectation Framing
- valueLine updated to include "Usually within a day." on all three key pages

### §2 CTA Friction Removal
- "No pressure. I'll just show you what I see." added to CTABlock component (renders on all instances, below urgencyLine, above secondary CTA)

### §3 Behavioural Proof Reinforcement
- "People stayed longer. They didn't drop off straight away." added to SpeedProofBlock full variant, below the existing outcome line

### §4 Repeatable Insight Signal
- "This is a common pattern I see." added to TheFeedGroupProofBlock after the logic completion line

### §5 Cross-Domain Connection (Photography)
- "The same principle applies to websites. What people see changes what they do." added to StockPhotographyProofBlock photography variant, after demand interpretation

### Files changed
- `src/components/scram/CTABlock.tsx`
- `src/components/scram/SpeedProofBlock.tsx`
- `src/components/scram/TheFeedGroupProofBlock.tsx`
- `src/components/scram/StockPhotographyProofBlock.tsx`
- `src/app/page.tsx`
- `src/app/services/website-design/page.tsx`
- `src/app/services/hosting/page.tsx`

---

## SCRAM v3 — Website Conversion Audit Offer

### Free Audit Page (`/free-audit/`)
- Reframed as "Website Conversion Audit"
- Hero: core promise "I'll show you what's stopping people getting in touch"
- Deliverables split into "Clear issues" and "Simple actions" cards
- 3-step "How it works" section (Send → Review → Breakdown)
- "After the audit" upsell path (redesign / hosting / ads) — no pricing, no pressure
- Trust section: "You deal directly with me"
- CTA valueLine: "Short written breakdown. Within 24 hours."
- Schema and metadata updated to reflect "Website Conversion Audit"

### Files changed
- `src/app/free-audit/page.tsx`
- `src/app/free-audit/FreeAuditClient.tsx`

---

## SCRAM v3 Deployment — No Upsell Version (Phases 2–3.5)

### Phase 2 — Contact Page Clarification
- "Website Conversion Audit" label added above hero heading
- Hero rewritten: "Send me your website." → explanation → "Usually within a day."
- Trust line: "This is a free audit. If I don't find anything useful, I'll tell you."
- Clarity line: "I'll focus on what's confusing, what's missing, and what's causing people to leave."

### Phase 2.5 — CTA Alignment (Site-Wide)
- valueLine updated from "...Usually within a day." to "...This is a quick website audit." on Homepage, Website Design, and Hosting CTAs

### Phase 3 — Expectation Setting
- "You'll get a short, clear breakdown of what to fix." added above the contact form

### Phase 3.5 — Optional Context Field
- Already satisfied by existing message field on contact form — no new fields added

### Files changed
- `src/app/contact/page.tsx`
- `src/app/page.tsx`
- `src/app/services/website-design/page.tsx`
- `src/app/services/hosting/page.tsx`

---

## All Modified Files (Complete List)

| File | Versions |
|------|----------|
| `src/components/scram/CTABlock.tsx` | v2.2, v2.3 |
| `src/components/scram/TheFeedGroupProofBlock.tsx` | v2.2, v2.3 |
| `src/components/scram/NYCCProofBlock.tsx` | v2.2 |
| `src/components/scram/SpeedProofBlock.tsx` | v2.3 |
| `src/components/scram/StockPhotographyProofBlock.tsx` | v2.3 |
| `src/app/page.tsx` | v2.2, v2.3, v3 |
| `src/app/services/website-design/page.tsx` | v2.2, v2.3, v3 |
| `src/app/services/hosting/page.tsx` | v2.2, v2.3, v3 |
| `src/app/free-audit/page.tsx` | v3 |
| `src/app/free-audit/FreeAuditClient.tsx` | v3 |
| `src/app/contact/page.tsx` | v3 |
