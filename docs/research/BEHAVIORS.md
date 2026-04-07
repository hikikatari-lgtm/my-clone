# TrueFire Browse Page Behaviors

## Scroll Behaviors
- **Sticky nav:** Position sticky, top: 0, z-index: 1020. No visual change on scroll (no shrink, no shadow change).
- **No scroll-snap:** Page uses normal scroll behavior.
- **No smooth scroll library:** No Lenis or Locomotive Scroll detected.
- **No scroll-driven animations:** No elements animate on scroll entry.

## Click Behaviors
- **Tab switching (Find The Perfect Course):** Click-driven. Active tab gets `btn-dark` class (black bg, white text). Inactive tabs have white bg with border. Content swaps instantly (no transition animation).
- **Nav dropdowns (Learn, Play, Explore):** Click to open dropdown menus.
- **Course cards:** Entire card is clickable link to course page.
- **Artist portraits:** Clickable links to artist pages.
- **VIEW ALL buttons:** Navigate to respective listing pages.
- **Promo banner X:** Dismisses the top banner.

## Hover Behaviors
- **Course cards:** Subtle shadow/lift on hover (typical card hover).
- **Tab buttons:** Slight bg color change on hover.
- **Nav links:** Color change on hover.
- **Footer links:** Underline on hover.
- **Artist portraits:** Likely opacity/scale change on hover.

## Responsive Behavior
- **Desktop (1440px):** Full 3-column card grids, horizontal nav, side-by-side app download layout.
- **Tablet (768px):** Cards likely 2-column, nav may collapse.
- **Mobile (390px):** Single column cards, hamburger menu, stacked app download.
- **Breakpoint:** col-md-4 = 768px breakpoint for card grids.
