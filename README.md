# Kaliyattam Minimal Theme

A lightweight, performant, mobile-first Drupal 11 theme crafted specifically for the Kaliyattam cultural rituals and heritage archive.

---

## 1. Config-First Philosophy

Form layouts, field arrangements, and display modes are **intentionally configured via Drupal 11's core configuration system and Field Groups**, rather than being hardcoded or overridden in Twig templates:

- **Form Layouts & Fields**: Form element positioning, visibility, tabs, and collapsible sections are managed through Drupal's **Entity Form Display UI** (`admin/structure/types/manage/[bundle]/form-display`) and the `field_group` module.
- **Entity View Displays**: Cards, teasers, and full entity representations are configured through **Entity View Display UI** (`admin/structure/types/manage/[bundle]/display`) and synchronized via Drupal Recipes.
- **Why Config-First?**: Hardcoding form structures in Twig templates or PHP preprocess hooks introduces maintenance debt, breaks contrib module integrations (such as validation, AJAX, and field widgets), and bypasses Drupal's configuration management. Changes to fields should always be exported into recipe/sync YAML configurations.

---

## 2. Architecture & Design Principles

- **Zero-Build Vanilla Stack**: No Node.js build step or runtime bundling required. Assets are pure vanilla CSS and JavaScript, loaded directly and cached by Drupal's asset aggregator.
- **Design Token System (`tokens.css`)**: Centralized design tokens for colors, fluid typography (`clamp()`), spacing, shadows, and surfaces.
- **Native System Typography**: Intentionally uses high-performance system font stacks (`system-ui` for sans, `Georgia, "Times New Roman", Times, serif` for headings) to eliminate render-blocking network requests, flash of unstyled text (FOUT), and layout shifts (CLS).
- **Native Browser Color Scheme**: Supports light and dark modes via `:root` CSS variables and `<meta name="color-scheme" content="light dark">`, ensuring native browser controls (scrollbars, inputs, dialogs) render seamlessly in matching modes.

---

## 3. Media Carousel (`.km-carousel`)

Multi-image entity fields automatically render using a lightweight, performant carousel:
- **Hardware-Accelerated**: Pure CSS scroll-snap (`overflow-x: auto; scroll-snap-type: x mandatory`).
- **Resilient Slide Pitch Tracking**: Next/Prev navigation and active indicator dots use dynamic DOM offset measurements (`slides[i].offsetLeft - slides[0].offsetLeft`), remaining mathematically precise regardless of slide widths, peeks, gaps, or margins.
- **Accessibility (WCAG)**: Carousel container declares `role="group" aria-roledescription="carousel"`, controls have descriptive `aria-label` attributes (`"Previous slide"|t`, `"Next slide"|t`), slides have translatable labels (`'@n of @total'|t`), and dot indicators manage `role="tab"` and `aria-selected`.

---

## 4. Required Views & Safe Route Integration

The theme provides integrated segmented control toolbars and author links that link to core site views. URLs for these routes are generated safely in preprocess hooks with `try / catch` handling, ensuring the site will never throw a fatal `RouteNotFoundException` (HTTP 500) if any view is uninstalled, renamed, or temporarily unavailable:

| Route Name | Description | Default Path |
| --- | --- | --- |
| `view.events.page_1` | Upcoming Events | `/events` |
| `view.events.page_2` | Past Events | `/events/past` |
| `view.events_calendar.page_1` | Events FullCalendar | `/events/calendar` |
| `view.timeline_locations.page_locations` | Temples List | `/temples` |
| `view.locations_map.page_1` | Temples Map | `/temples/map` |
| `view.timeline_user.page_timeline` | Member Timeline | `/user/{user}/timeline` |

If any of these routes are missing, the corresponding tab/link is gracefully omitted.

---

## 5. File Structure

```
kaliyattam_minimal/
├── css/
│   ├── base.css         # Modern CSS reset and root typography
│   ├── tokens.css       # Design tokens and color-scheme definitions
│   ├── layout.css       # Page layout grids, headers, and sidebars
│   ├── components.css   # Reusable UI components, cards, toolbar, carousel
│   ├── forms.css        # Form element styles & CKEditor variables
│   └── dialog.css       # On-demand dialog, off-canvas, and media library styles
├── js/
│   ├── theme-init.js    # Immediate <head> color scheme initialization and js class
│   └── theme.js         # Theme toggle, mobile nav, hash listener, and carousel behavior
├── templates/           # Clean, minimalist Twig template overrides
├── kaliyattam_minimal.info.yml
├── kaliyattam_minimal.libraries.yml
├── kaliyattam_minimal.theme
└── README.md
```
