# Design System Document: The Editorial Ledger

## 1. Overview & Creative North Star
### Creative North Star: "The Heritage Curator"
This design system moves away from the sterile, "SaaS-blue" aesthetics of typical fintech. Instead, it adopts the persona of a **Heritage Curator**. It treats family financial data with the same reverence one would give to an archival editorial. 

The system achieves a premium feel through **intentional asymmetry**, high-contrast typography scales, and a rejection of traditional structural "boxes." By utilizing deep tonal shifts and "Glassmorphism," we create an environment that feels secure (authoritative deep blues) yet breathing and organic (soft greens and reds). We are not just building a dashboard; we are building a digital legacy.

---

## 2. Colors & Surface Philosophy
The palette is rooted in a "Deep Sea and Forest" logic, providing an immediate sense of stability and growth.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning. Boundaries must be defined solely through:
- **Background Color Shifts:** E.g., a `surface-container-low` section sitting on a `surface` background.
- **Tonal Transitions:** Using the hierarchy of `surface-container` tokens to imply structure.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—like stacked sheets of fine, heavy-weight paper.
- **Base Layer:** `surface` (#faf9fc)
- **Content Blocks:** `surface-container-low` (#f4f3f6)
- **Interactive Elevated Elements:** `surface-container-lowest` (#ffffff)
- **High-Priority Modals:** `surface-container-highest` (#e3e2e5)

### The "Glass & Gradient" Rule
To escape the "flat-UI" trap, use **Glassmorphism** for floating elements (like navigation bars or hovering metric cards). Use semi-transparent versions of `surface` with a 20px backdrop-blur. 
*Signature Texture:* Apply a subtle linear gradient to main Action Buttons—transitioning from `primary` (#002542) to `primary-container` (#1b3b5a) at a 45-degree angle—to provide a "lacquered" finish.

---

### Color Token Roles
- **Primary (Stability):** `primary` (#002542) - Use for high-level branding and authoritative actions.
- **Secondary (Income/Growth):** `secondary` (#306856) - Reserved strictly for positive financial delta and success states.
- **Tertiary (Expense/Caution):** `tertiary` (#50000a) - A sophisticated, desaturated red for outflows. It is "subtle," not "alarming."

---

## 3. Typography
The system uses a pairing of **Manrope** (Display) and **Inter** (Body) to balance editorial flair with high-performance readability.

- **Display & Headlines (Manrope):** These are the "Editorial Voice." Use `display-lg` (3.5rem) for total balance overviews. The wide tracking of Manrope conveys a sense of modern luxury.
- **Body & Titles (Inter):** These are the "Data Workhorses." Inter is utilized for transaction lists and forms. Its tall x-height ensures that financial figures remain legible even at `body-sm` (0.75rem).
- **Hierarchy Logic:** Use a 2-step jump in scale to create "Drama." For example, pair a `headline-lg` title with a `body-md` description to create a clear typographic "anchor" on the page.

---

## 4. Elevation & Depth
We eschew the "box-shadow" defaults of the early 2010s in favor of **Tonal Layering.**

### The Layering Principle
Depth is achieved by "stacking" container tiers. Place a `surface-container-lowest` card on a `surface-container-low` background to create a soft, natural lift.

### Ambient Shadows
When a floating effect is required (e.g., a "New Transaction" FAB), use **Ambient Shadows**:
- **Shadow Color:** A tinted version of `on-surface` (#1a1c1e) at 6% opacity.
- **Blur:** 32px to 64px. This mimics natural light diffusion rather than a digital "drop shadow."

### The "Ghost Border" Fallback
If accessibility requires a container edge, use the **Ghost Border**: `outline-variant` (#c3c6ce) at 20% opacity. 100% opaque borders are strictly forbidden.

---

## 5. Components

### Cards (Dashboard Metrics)
- **Styling:** No borders. Use `surface-container-low`.
- **Layout:** Use asymmetric internal padding (e.g., 32px top, 24px sides) to create a custom, high-end feel.
- **Data:** Metric numbers should use `display-sm` in `primary` color.

### Tables (Transactions)
- **The "No-Divider" Rule:** Forbid the use of horizontal lines between rows. Instead, use a subtle background hover state (`surface-container-high`) and vertical white space (16px between rows) to separate content.
- **Income/Expense:** Use `on-secondary-container` for positive values and `on-tertiary-container` for expenses.

### Buttons
- **Primary:** Gradient fill (`primary` to `primary-container`). Roundedness: `md` (0.375rem).
- **Secondary:** Transparent background with a `Ghost Border` and `primary` text.
- **Tertiary:** Text-only, using `label-md` bold, uppercase with 0.05em tracking.

### Forms & Inputs
- **Input Fields:** Use `surface-container-highest` as the fill. No bottom border; instead, use a 2px "Focus Indicator" in `primary` that animates from the center outward when the field is active.
- **States:** Error states should use `error` (#ba1a1a) text but the background should shift to a soft `error-container` (#ffdad6) tint.

### Additional Suggested Component: The "Family Ledger" Chip
A custom chip for tagging family members. Use `secondary-fixed` backgrounds with `on-secondary-fixed-variant` text to create a soft, non-intrusive metadata tag.

---

## 6. Do’s and Don’ts

### Do:
- **Do** use whitespace as a structural element. If an element feels "stuck," add 8px of padding rather than a line.
- **Do** use `surface-tint` sparingly to highlight active navigation states or "Member of the Month" highlights.
- **Do** ensure all financial figures have high contrast (meeting WCAG AA standards using the `on-surface` tokens).

### Don’t:
- **Don’t** use pure black (#000000) for shadows or text; use the provided `on-surface` tokens.
- **Don’t** use the `DEFAULT` roundedness for everything. Use `full` for chips and `xl` (0.75rem) for large dashboard containers to create a "soft/hard" visual rhythm.
- **Don’t** stack more than three levels of surface containers, as it dilutes the "Editorial" clarity.