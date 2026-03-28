# Design System Specification: High-End Editorial Automation

## 1. Overview & Creative North Star
### The Creative North Star: "The Curated Assistant"
This design system rejects the "mechanical" aesthetic of traditional SaaS. Instead of a rigid, spreadsheet-like CRM, we are building a **Digital Concierge**. The experience should feel like a premium editorial magazine—spacious, authoritative, yet deeply personal. 

We break the "template" look by utilizing **intentional asymmetry** and **tonal depth**. By abandoning heavy borders and rigid grids in favor of overlapping layers and sophisticated typography scales, we transform "automation" into "empowerment." The UI doesn't just display data; it curates an experience that feels human, soft, and effortlessly intelligent.

---

## 2. Colors
Our palette balances the reliability of Indigo with the energetic pulse of Coral. We move beyond flat fills by using surface-container tiers to imply physical depth.

### The "No-Line" Rule
**Strict Mandate:** 1px solid borders are prohibited for sectioning. 
Boundaries must be defined solely through background color shifts or subtle tonal transitions. For example, a `surface-container-low` (#eef1f3) card should sit on a `background` (#f5f7f9) to create definition. If you feel the need for a line, use white space or a color shift instead.

### Surface Hierarchy & Nesting
Treat the UI as a series of stacked, premium paper sheets. 
*   **Base:** `background` (#f5f7f9)
*   **Nesting Level 1:** `surface-container-low` (#eef1f3) for secondary content areas.
*   **Nesting Level 2 (High Priority):** `surface-container-lowest` (#ffffff) for primary cards to create a "lifted" feel.

### The "Glass & Gradient" Rule
To ensure we don't look "out-of-the-box," use **Glassmorphism** for floating elements (modals, popovers). Use a semi-transparent `surface-container-lowest` with a `backdrop-blur` of 12px-20px. 
*   **Signature Textures:** Apply a subtle linear gradient to primary CTAs: `primary` (#4a40e0) to `primary-container` (#9795ff). This adds "soul" and prevents the UI from feeling digitally sterile.

---

## 3. Typography
We use a dual-font strategy to balance character with utility.

*   **Display & Headlines (Plus Jakarta Sans):** Chosen for its modern, slightly geometric personality. High x-heights and open apertures feel welcoming. Use `display-lg` (3.5rem) with tighter letter-spacing (-0.02em) for hero moments to create an editorial impact.
*   **Body & Labels (Inter):** The workhorse. Inter provides maximum readability for data-heavy automation tasks. 
*   **The Hierarchy of Trust:** Use `headline-md` (1.75rem) in `on-surface` (#2c2f31) for section titles. The high contrast against the off-white backgrounds signals authority without aggression.

---

## 4. Elevation & Depth
In this system, "Elevation" is a feeling, not a drop-shadow.

### The Layering Principle
Depth is achieved by "stacking" the surface-container tiers. Place a `surface-container-lowest` card on a `surface-container-low` section. This creates a soft, natural lift that mimics fine stationery.

### Ambient Shadows
When a component must float (e.g., a "Hot Trends" tooltip), use **Ambient Shadows**:
*   **Blur:** 24px - 40px
*   **Opacity:** 4% - 6%
*   **Color:** Use a tinted version of `on-surface` (#2c2f31) rather than pure black to keep the lighting feeling organic and soft.

### The "Ghost Border" Fallback
If accessibility requires a container edge, use the **Ghost Border**: The `outline-variant` (#abadaf) token set to **15% opacity**. Never use 100% opaque, high-contrast borders.

---

## 5. Components

### Buttons
*   **Primary:** Gradient fill (`primary` to `primary-container`), `md` (0.75rem) roundedness.
*   **Secondary:** `surface-container-high` background with `on-surface` text. No border.
*   **Tertiary:** Text-only with `primary` color. Use for low-emphasis actions.

### Cards & Lists
*   **Rule:** Forbid divider lines. 
*   **Implementation:** Separate list items using `spacing-3` (1rem) or by alternating background colors between `surface` and `surface-container-low`.
*   **The "Human" Touch:** Cards should use `xl` (1.5rem) corners for a soft, friendly feel.

### Marketing Insights (The "Trend" Chip)
*   Use `tertiary-container` (#ff909d) for the background and `on-tertiary-container` (#67001f) for the text. 
*   **Micro-interaction:** On hover, the chip should scale (1.05x) rather than change color, maintaining the "soft" vibe.

### Input Fields
*   Background: `surface-container-lowest` (#ffffff).
*   Active State: A 2px "Ghost Border" using `primary-container` (#9795ff) at 40% opacity. 
*   Labeling: Use `label-md` (Inter, 0.75rem) in `on-surface-variant` (#595c5e) placed strictly above the field—never inside.

---

## 6. Do's and Don'ts

### Do
*   **DO** use whitespace as a structural element. If a layout feels "tight," double the padding using the `spacing-8` (2.75rem) token.
*   **DO** overlap elements (e.g., a card slightly hanging off a container edge) to break the "corporate grid" feel.
*   **DO** use illustrative, friendly icons with a consistent stroke weight (1.5px - 2px).

### Don't
*   **DON'T** use 100% black (#000000) for text. Always use `on-background` (#2c2f31) to reduce eye strain.
*   **DON'T** use "Hard" corners. Even the smallest components (Checkboxes/Radio buttons) must use at least `sm` (0.25rem) roundedness.
*   **DON'T** use high-contrast dividers. If you cannot separate elements with space, you have too much content on the screen.