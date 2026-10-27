# Swarm Signal design system

## Overview

Swarm Signal is a reading list for the IdentityMD community. The requested dark green and AI-armed Pepes are implemented as forest surfaces, lime controls, a tactical Pepe with a neural blaster and scout drone, and a second Pepe using an AI field terminal. The feed is the main product: source attribution, readable summaries and original-post links take priority over decoration.

The canonical implementation is `src/styles.css`, with markup and component state in `src/main.tsx`. This document describes the finished source, not a proposed redesign. The page uses a compact header, a short illustrated hero, then a feed and supporting sidebar. On phones, the sidebar follows the entire feed.

## Colors

CSS uses hex primitives mapped to semantic custom properties in `src/styles.css:10`. Components consume the semantic properties for shared roles.

| Semantic token | Primitive / value | Use |
| --- | --- | --- |
| `--color-page` | `--forest-950`, `#0c1510` | Page and inset share field |
| `--color-surface` | `--forest-900`, `#111e16` | Post cards, search, select, dialog |
| `--color-surface-raised` | `--forest-850`, `#16241b` | Report panel, navigation selection, small icon surfaces |
| `--color-hover` | `--forest-800`, `#1b2d20` | Hover, selected topic and saved state |
| `--color-border` | `--forest-700`, `#2c3d2f` | Structural borders and separators |
| `--color-input-border` | `--forest-600`, `#64785c` | Distinguishable field and outline-button boundaries |
| `--color-text` | `--forest-100`, `#eaf0e6` | Main text and headings |
| `--color-text-muted` | `--forest-300`, `#a4b2a3` | Secondary labels and metadata |
| `--color-accent`, `--color-focus` | `--lime-300`, `#c4f16a` | Primary fill, links, selected controls, focus, brand highlight |
| `--color-accent-hover` | `--lime-200`, `#d4ff85` | Primary-button hover |
| `--color-on-accent` | `#192312` | Text on lime fill |

Specific illustrated surfaces use `#192e1d` (hero), `#1b2b1d` (network panel), `#c5d2bd` (their secondary text), and `#c9d2c5` (post prose). The selected-topic border is `#425838`. Decorative monogram fills are sage `#bac6a7`, lavender `#c1b7d6`, sand `#d8c7a2`, and mint `#a5d1b9`, with text `#15231a`; they distinguish authors without impersonating profile photos. Illustration colors live inside the two SVG assets and are not UI status colors.

Measured pairs from the rendered export: post prose/surface **11.06:1**, secondary report text/raised surface **7.28:1**, original-post link/surface **13.22:1**, primary-button text/fill **12.50:1**, input boundary/surface **3.59:1**, and search focus/page **14.28:1**. Full values are in `validation/contrast.json`. The single implemented theme is dark; no theme switch exists.

## Typography

`--font-body` is `'Manrope', 'Segoe UI', sans-serif`. The local variable font is `public/fonts/manrope-latin-variable.woff2`, loaded with `font-display: swap` and weights 400–700. The actual weights used are **400, 600 and 700**; there is no italic face or second font family. The font loaded successfully during browser checks.

| Token | Desktop | At 620px and below | Main role |
| --- | --- | --- | --- |
| `--text-caption` | 12px | 12px | Dates, source labels and counts |
| `--text-small` | 14px | 14px | UI labels and mobile post prose |
| `--text-body` | 16px | 16px | Desktop prose, inputs, mobile card titles |
| `--text-heading` | 20px | 20px | Card titles, network heading, mobile feed heading |
| `--text-section` | 28px | 20px | Feed heading, dialog heading, report values |
| `--text-display` | 56px | 36px | Hero headline |

Sizes are declared in rem. Some roles switch tokens at the mobile breakpoint; the phone renders five distinct sizes and desktop renders six. The hero uses 1.07 line height and tracking −0.055em (−0.05em on phones). Feed headings use 1.2 and −0.04em; card titles use 1.4 and −0.025em. Prose is 1.7 on desktop and 1.65 on phones, with a 67ch maximum measure. Global line height is 1.6. Inputs stay at 16px on mobile. Headings balance, short prose uses pretty wrapping, and counters use tabular numerals. Critical text is not ellipsized.

## Spacing and layout

The declared spacing scale is `--space-1` through `--space-7`: **4, 8, 12, 16, 24, 32 and 48px**. The stylesheet’s component values follow this scale, with optical and density adjustments such as 10, 14, 18 and 20px where present in the source.

`.shell` is at most 1200px wide with 40px minimum desktop gutters. `.page-grid` uses a flexible feed, 320px sidebar and 32px gap; at 1120px it uses a 280px sidebar and 24px gap. Post padding is 24px and cards are separated by 16px. Controls generally have a 44px minimum height. Compact author links and utility controls can be smaller in one dimension while passing the measured 24px target-or-spacing baseline.

At **940px**, the content becomes one column, the shell caps at 760px with 24px gutters, and the sidebar becomes two columns below the feed. The external header link is removed. At **620px**, gutters become 16px, sidebar panels stack, the header is at least 68px tall, and the hero has a 220px minimum height. The home mark remains at the left; Saved and the named About icon sit at the right. The redundant feed navigation link hides while the home mark still returns to the feed.

Mobile search spans the feed width. Topic buttons keep their text while decorative icons hide, fitting the four filters into one row at 390px. The count, native sort and capture date may wrap when space or enlarged text requires it. The post’s original-X action is in its top row, so it is reachable before reading the summary. The header also wraps at enlarged text sizes. Below **360px**, spacing and icon widths become denser. No content is hidden to conceal horizontal overflow.

Screenshots and automated checks covered 320, 390, 768, 1024 and 1440px; 200% root-text enlargement at 390px and an RTL overflow check also passed. These are not claims of physical-device testing or browser-native zoom.

## Elevation & depth

The system is flat. Cards and fields use one-pixel borders; report and network panels use tonal differences. There are no box shadows, nested card surfaces, gradient text or floating/sticky chrome. The hero’s low-opacity 36px grid is decorative. The native modal uses a `#050b08d9` backdrop and a bordered forest surface. Browser-native modal behavior provides inert background content and focus containment.

## Shapes

`--radius-control` is **8px** and `--radius-panel` is **16px**. Desktop cards use the panel radius; phone cards use **12px**. Topic buttons are capsules with a 30px radius. Monograms are circles. The frog mark uses its own rounded-square SVG silhouette. Text containers use natural height; the hero uses minimum height and contained artwork.

## Components

| Pattern / source | Use and states |
| --- | --- |
| `App`, `src/main.tsx:17` | Owns search, topic, sort, hash view, local saves, announcements and modal state. Feed and Saved have explicit empty states with recovery actions. Storage failure leaves a persistent inline warning. |
| `.primary-button`, `.secondary-button`, `src/styles.css:92` | Lime fill for the main action, outline for secondary destinations. At least 44px high; hover is pointer-only. Keyboard focus is a 2px lime outline. |
| `.search-field`, `.sort-field`, `src/styles.css:109` | Native labeled search and select. Visible Search/Sort labels remain when populated. Search has a clear button and a focus-within ring. Native select supplies its keyboard model. |
| `.topic-button`, `src/main.tsx:131` | Native buttons with `aria-pressed`; selected fill and border supplement the text/state. These are filters, not custom tabs. |
| `PostCard`, `src/main.tsx:229` | Props: `post`, `rank`, `saved`, `onSave`, `onShare`, `onTopic`. Author/date, original link, editorial title, summary, topic, captured metrics, save/share, native source disclosure. No fake verification mark or clickable-like count. |
| `.save-button` | Toggles an accessible pressed state, solid bookmark and label; saves in local storage and announces the result politely. The count keeps a reserved width. |
| Native `<dialog>`, `src/main.tsx:202` | About and Share variants. Escape/Close dismiss, focus stays inside while open and returns to the trigger. Share includes a selectable original URL, copied feedback and manual-copy recovery. |
| `Icon`, `src/icons.tsx` | One local 24px SVG set, 1.6px stroke and `currentColor`. Icons are decorative inside named controls. Filled bookmark indicates saved state. |

Assets are `public/favicon.svg`, `public/pepe-operator.svg`, `public/pepe-scout.svg` and `public/og-image.png`. `scripts/og-card.html` is the share-image source. The primary illustration has meaningful alt text; repeated logo imagery is decorative beside named text. No remote fonts or image CDNs are needed.

Motion is limited to named color/background/border transitions of **150ms ease-out**, plus a **0.96** press scale on major buttons, only under `prefers-reduced-motion: no-preference`. There are no autoplay or endless animations. Forced-colors CSS retains system focus and selected boundaries, but that mode was not rendered during validation.

## Do’s and don’ts

- Start related pages with `.shell` and the existing type/color tokens; keep the primary content before supporting panels in DOM order.
- Reuse `PostCard` and `Icon` for another reading list. Put original/source attribution next to the material and keep summary copy visibly editorial.
- Use native buttons, links, selects, details and dialogs. Keep a visible text label or an explicit accessible name when an icon replaces text.
- Preserve the dated snapshot language, local-only save explanation and manual-copy fallback. Update the capture date with the data.
- Keep the first post and its original link on the opening phone screen. Do not add another hero, ticker, slogan stack or unverified live counter.
- Reuse forest surfaces and lime emphasis. Do not add another font, glow treatment or competing accent for routine controls.
