# IMAGE-OPTIMISATION-BACKLOG.md

Goal: 
Reduce image weight for key hero / service images to improve LCP and overall page weight, **without** changing visual design.

Context:
- Current mobile Lighthouse: Perf 93, LCP 2.8 s, CLS 0.107
- PageSpeed Insights flagged several images as larger than needed for their display size.
- All re-exports should stay in **WebP** (or be converted to WebP where currently PNG).

---

## 1. Hero Background (Homepage)

**File:**
- `/public/images/hero/230422_Chester_Stock_Photography-84.webp`

**Current issue:**
- ~88 KB and larger than required for rendered size.
- PSI suggests ~60–65 KB is enough.

**Kiro tasks:**
- Re-export as WebP at **max width 1600 px** (maintain aspect ratio).
- Use compression around **quality 65–70**.
- Target file size: **≤ 60 KB**.
- Keep same filename so no code changes are required.

---

## 2. Logo (Nav)

**File:**
- `/public/images/brand/VMC.png`  
  (currently large PNG used at ~78×44 in the navbar)

**Kiro tasks:**
- Create a dedicated small logo file for the navbar:
  - Export at **160×60 px**.
  - Save as **WebP** if possible: `VMC-nav.webp`.
  - Target size: **≤ 20 KB**.
- Update the site to use `VMC-nav.webp` for the nav logo only.
- Keep original `VMC.png` for any larger use-cases if needed (or phase out later).

---

## 3. Services – Photography Hero

**File:**
- `/public/images/services/photography-hero.webp`

**Current issue:**
- ~56 KB and larger than required (rendered smaller than source).

**Kiro tasks:**
- Re-export at **max width 600 px** (maintain aspect ratio).
- WebP, quality 65–70.
- Target size: **≤ 35 KB**.

---

## 4. Services – Website Design Hero

**File:**
- `/public/images/services/Website Design/PXL_20240222_004124044~2.webp`

**Current issue:**
- ~41 KB, source 800×600, rendered ~332×250.

**Kiro tasks:**
- Re-export at **max width 600 px**.
- WebP, quality 65–70.
- Target size: **≤ 25–30 KB**.

---

## 5. Services – Ad Campaigns Hero

**File:**
- `/public/images/services/WhatsApp Image 2025-11-11 at 9.27.14 AM.webp`

**Current issue:**
- ~30 KB, image larger than needed vs rendered size.

**Kiro tasks:**
- Re-export at **max width 600 px**.
- WebP, quality 65–70.
- Target size: **≤ 20 KB**.

---

## 6. Services – Hosting / Migration Card

**File:**
- `/public/images/services/web-hosting-and-migration/hosting-migration-card.webp`

**Current issue:**
- ~22 KB, source 800×600, rendered ~332×249.

**Kiro tasks:**
- Re-export at **max width 600 px**.
- WebP, quality 65–70.
- Target size: **≤ 15 KB**.

---

## 7. Services – Analytics Dashboard

**File:**
- `/public/images/services/screenshot-2025-09-23-analytics-dashboard.webp`

**Current issue:**
- ~37.6 KB, slightly bigger than necessary for rendered size.

**Kiro tasks:**
- Re-export at **max width 600 px**.
- WebP, quality 65–70.
- Target size: **≤ 20–25 KB**.

---

## 8. General Rules for Future Images

1. **Format**
   - Prefer **WebP** for all marketing imagery (heroes, cards, case-study images).
   - Only keep PNG when transparency is absolutely required.

2. **Sizing**
   - Desktop hero backgrounds: **1400–1600 px wide** max.
   - Mobile/Service cards: **400–600 px wide** max.
   - Logos / icons: size to their **actual display dimensions** × device pixel ratio (e.g. 2×).

3. **Compression Targets**
   - Heroes: aim for **50–70 KB**.
   - Service cards / smaller visuals: **15–35 KB**.
   - Logos/icons: **< 20 KB** where possible.

4. **No filename changes unless necessary**
   - Wherever possible, overwrite existing WebP assets, so React/Next components don’t need updates.
   - If a new file is required (e.g. `VMC-nav.webp`), update the relevant components in `/app` to reference the new name.

---

## 9. Acceptance Criteria

- After re-export:
  - Lighthouse **LCP on mobile <= ~2.5–2.6s** (slow 4G emulation).
  - **Total image weight on homepage reduced by ≥ 150 KB.**
  - Pages still visually match current design (no noticeable quality loss).
- No changes to layout, copy, or component structure – image optimisation **only**.
