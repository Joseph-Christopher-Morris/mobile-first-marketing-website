## Vivid Media Cheshire – Monochrome Logo Update Instructions

**Goal:**  
Replace raster logos (BBC, Forbes, Financial Times, CNN, AutoTrader, Daily Mail, Business Insider) with **monochrome SVG icons** that align with the site’s minimal, professional visual identity.

---

### 1. File Placement

Place all SVGs in:  
```
/public/images/press-logos/
```

### 2. File Naming Convention

| Publication | Filename |
|--------------|-----------|
| BBC | `bbc-logo.svg` |
| Forbes | `forbes-logo.svg` |
| Financial Times | `financial-times-logo.svg` |
| CNN | `cnn-logo.svg` |
| AutoTrader | `autotrader-logo.svg` |
| Daily Mail | `daily-mail-logo.svg` |
| Business Insider | `business-insider-logo.svg` |

**Naming Rules:**
- Lowercase
- Hyphen-separated
- No spaces or parentheses
- Vector-only SVGs (no embedded raster images)

---

### 3. Design Guidelines
- **Monochrome (single colour):** `#1F2937` (Tailwind `gray-800`)
- **Hover colour:** `#4B5563` (Tailwind `gray-600`)
- Remove all fills or background rectangles from SVGs.
- Use `currentColor` for SVG paths so they inherit the parent text colour.
- Maintain consistent visual size (approx. 100–120px width).

---

### 4. Example SVG Embed
Each logo should be imported and rendered like this:

```tsx
<section className="mt-12 flex flex-wrap justify-center gap-8 items-center text-gray-800">
  <Image src="/images/press-logos/bbc-logo.svg" alt="BBC News logo" width={100} height={30} />
  <Image src="/images/press-logos/forbes-logo.svg" alt="Forbes logo" width={100} height={30} />
  <Image src="/images/press-logos/financial-times-logo.svg" alt="Financial Times logo" width={100} height={30} />
  <Image src="/images/press-logos/cnn-logo.svg" alt="CNN logo" width={100} height={30} />
  <Image src="/images/press-logos/autotrader-logo.svg" alt="AutoTrader logo" width={100} height={30} />
  <Image src="/images/press-logos/daily-mail-logo.svg" alt="Daily Mail logo" width={100} height={30} />
  <Image src="/images/press-logos/business-insider-logo.svg" alt="Business Insider logo" width={100} height={30} />
</section>
```

---

### 5. Optional CSS Enhancement
Add a subtle grayscale + opacity hover effect for refinement:

```css
.press-logos img {
  filter: grayscale(100%);
  opacity: 0.9;
  transition: opacity 0.3s ease;
}
.press-logos img:hover {
  opacity: 1;
}
```

Or use Tailwind utility classes directly:
```html
<Image
  src="/images/press-logos/forbes-logo.svg"
  className="opacity-90 hover:opacity-100 transition-all grayscale hover:grayscale-0"
/>
```

---

### 6. Accessibility & Performance
- Ensure all `<Image>` components include proper `alt` text (e.g., "Forbes logo").
- Test logos in both **light** and **dark** mode (if applicable).
- Validate SVGs are optimized — use [SVGOMG](https://j