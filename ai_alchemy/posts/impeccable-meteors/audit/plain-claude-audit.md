# Audit: Orionids Night at Cedar Hollow (`live/plain-claude/index.html`)

Audited 2026-10-04. This is a technical, code-level audit. The page itself was not changed.

**Evidence used**
- Source review of `index.html` (629 lines, one file, inline CSS and JS, fonts loaded from `fonts/`).
- Detector: `impeccable detect --json index.html`, run from `live/plain-claude`. It exited with code 2 and returned 24 findings. Each one was checked against the source and the rendered page (see the Implementation Integrity section).
- Renders: Playwright Chromium (chromium-1194) at 1440x900, 375x812 and 320x640. The mobile contexts emulated touch (`hasTouch`, `isMobile`). Screenshots are in `audit/`: `hero-1440.png`, `desktop-full.png`, `mobile-full.png`, `m320-full.png`, `map-1440.png` and `map-375.png`. `desktop-1440.png` and `mobile-375.png` were captured without scrolling, so they show the `.reveal` sections blank.
- Scripted checks: document scroll width, interactive targets smaller than 44px, keyboard tab order and focus outlines, empty-form submit, `prefers-reduced-motion: reduce` emulation, and WCAG contrast calculated from the hex values.
- Not tested: real devices, VoiceOver and NVDA output, and Safari or Firefox rendering. No touch gestures were synthesized. The page has no drag or swipe surfaces, and its only custom control (the party-size stepper) uses `click`.

---

## Audit Health Score

| # | Dimension | Score | Key Finding |
|---|-----------|-------|-------------|
| 1 | Accessibility | 3 | Text contrast is strong (8 to 9.7:1). The gaps: the input focus outline is removed by `input:focus{outline:none}`, form errors are not linked to their fields, and placeholders are 3.3:1 |
| 2 | Performance | 3 | Lean (about 40 KB HTML plus about 100 KB of woff2, no images). The starfield `requestAnimationFrame` loop never stops and repaints under two `backdrop-filter` layers |
| 3 | Responsive Design | 2 | The park map uses `preserveAspectRatio="xMidYMid slice"`, which crops the Lower Lot, the parking marker and the legend at every width. Mobile hides the nav and offers no replacement |
| 4 | Theming | 3 | The `:root` tokens cover the core palette. The secondary text color `#c9cee6` (6 uses) and about 20 rgba variants are hard-coded, and `color-scheme: dark` is missing |
| 5 | Implementation Integrity | 2 | The content and illustrations are specific to this event, but they sit in generic scaffolding: numbered eyebrow kickers, five headings built on the same italic-`<em>` pattern, and icon-tile cards |
| **Total** | | **13/20** | **Acceptable (significant work needed)** |

---

## Implementation Integrity Verdict

**FAIL (narrowly).** The content is specific to this event. It covers Halley's Comet and the 66 km/s speed, moonset at about 1 am, the red-flashlight and dark-adaptation etiquette, the 5 pm go/no-go weather call, and the lantern trail from the lower lot. The radiant diagram, the meteor canvas (whose meteors fan out from an upper-left radiant) and the park map were drawn for this page. That work is real and specific.

The visual structure around that content is template-shaped. You could put an unrelated product into the same skeleton and it would look the same:

- **The same section header four times.** Every `.sec-head` has a tracked-caps eyebrow (`01 — The shower`, `02 — When & where`, `03 — Pack list`, `04 — RSVP`). The heading follows the pattern "Roman serif + *italic ember em*", with a muted lede in the right column. Verified at lines 258-264, 332-338, 412-418 and 453-456.
- **More eyebrows elsewhere.** There is one on the hero (line 228), one labelled "Getting there" (line 396) and one labelled "You're on the list" (line 486). That makes 7 `.eyebrow` labels in total.
- **Icon-tile feature cards.** Four 56x56 rounded tiles sit above the h3 headings in the pack list (lines 420-439). This is the stock feature-card layout.
- **Glow accents.** The peak timeline dot has `0 0 40px` ember glow plus an 8px halo (line 116). The red-flashlight tile has a red glow (line 140).

### Detector findings, verified

| Detector rule | Count | Verdict | Notes |
|---|---|---|---|
| `low-contrast` (placeholders) | 2 | **True** | `#5e6688` on the field background measures 3.32:1 |
| `dark-glow` | 3 | **True** | `.tl.peak .dot` (ember, two findings) and `.item.red .ic` (red). The peak glow can be defended on theme. The flashlight glow is decoration |
| `icon-tile-stack` | 4 | **True** | Pack-list cards |
| `italic-serif-display` | 5 | **True, in context** | Only the `<em>` fragments are italic, but the same treatment is repeated on the h1 and all four h2s, so it reads as a formula rather than a choice |
| `hero-eyebrow-chip` | 1 | **True** | "Free public watch party · Oct 21–22, 2026" above the h1 |
| `all-caps-body` | 1 | **False positive / duplicate** | The 41 characters are that same hero eyebrow. It is a short label, not body copy |
| `cramped-padding` | 1 | **False positive** | `.card.map` has `padding:0` on purpose so the SVG runs edge to edge. The real defect in this card is the crop (P1 below) |
| `gpt-thin-border-wide-shadow` (advisory) | 1 | **True** | The peak dot has a 1px border and a 40px glow. Same element as the `dark-glow` finding |
| `overused-font` | 1 | **True (judgment)** | Instrument Serif is a currently fashionable display face. It fits the tone, but it is not distinctive |
| `kicker-above-heading` | 1 | **True** | "Getting there" above the h3 "Cedar Hollow Dark-Sky Park" |
| `numbered-section-labels` (advisory) | 4 | **True** | `01` to `04` |

That is 22 of 24 findings confirmed and 2 false positives.

Checks the detector does not cover (found by review or rendering):
- The brand icon's meteor trail does not render. The gradient `#g0` uses user-space coordinates (`x1="3" … x2="14"`) but keeps the default `gradientUnits="objectBoundingBox"`. As a result the whole stroke gets the first stop, which has `stop-opacity="0"`, and only the dot shows.
- A `#tr` gradient is defined in the radiant diagram but never used.
- The map card cropping is confirmed in the renders.

---

## Executive Summary

- **Audit Health Score: 13/20 (Acceptable)**
- **Issues: P0 0 · P1 1 · P2 13 · P3 6 (20 total)**
- **Top issues**
  1. **[P1]** The park map is cropped at every viewport. "LOWER LOT" is cut to "OWER LOT", the parking box is half off-canvas, the "Illustrative · not to scale" legend overlaps the lot label, and at 375px the right side of Meadow Field is cut off. This is the page's only wayfinding visual.
  2. **[P2]** Form-field focus is weaker than everywhere else. `input:focus{outline:none}` (line 157) cancels the `input:focus-visible` outline (line 63) because it has the same specificity and comes later. Only a 1px border color change is left.
  3. **[P2]** Form errors are announced through `aria-live` but are not linked to their inputs (`aria-describedby` is null). Placeholder text is 3.3:1.
  4. **[P2]** Below 960px the nav links are removed (`display:none`) and nothing replaces them. The header RSVP button is 34px tall.
  5. **[P2]** Generic scaffolding: the numbered eyebrows, the repeated italic-em heading pattern and the icon-tile cards.
- **Next steps:** fix the map crop first (`/impeccable adapt`), then the form accessibility gaps (`/impeccable harden`), then remove the template scaffolding (`/impeccable distill`, then `/impeccable typeset`).

---

## Detailed Findings by Severity

### P1 Major

**[P1] Park map is cropped and its labels collide**
- **Location:** `.card.map` > `svg` (lines 364-393). CSS `.map{min-height:340px}` and `.map svg{height:100%}` (lines 124-125).
- **Category:** Responsive / Implementation Integrity
- **Impact:** At 1440px the card renders at 547x492. That is taller than the 560:360 viewBox, and `slice` crops the left and right edges. The parking "P" box is cut in half, "LOWER LOT" reads "OWER LOT", and the "ILLUSTRATIVE · NOT TO SCALE" legend overlaps the lot label. At 375px (343x340) the crop is worse: the east side of Meadow Field and its dashed boundary are lost. The map exists to show the walk from the lot to the field, and the starting point is the part that gets cropped. See `audit/map-1440.png` and `audit/map-375.png`.
- **Recommendation:** Use `preserveAspectRatio="xMidYMid meet"` with a matching background, or give the card `aspect-ratio:560/360` and stop it stretching in the grid row (`align-self:start`). Keep labels at least 24 units inside the viewBox edge. If you want the slice look, redraw the composition so that key features sit in the central safe area.
- **Suggested command:** `/impeccable adapt`

### P2 Minor

**[P2] Input focus outline removed**
- **Location:** line 157, `input:focus,select:focus{…outline:none}`. This overrides line 63.
- **Category:** Accessibility
- **Impact:** Keyboard users get a bold 2px blue `--trail` outline on every link and button, but on the two text fields they only see a 1px border change to ember. Measured: the inputs report `outlineStyle:none` during Tab navigation. The focus style is inconsistent and much weaker exactly where users type.
- **WCAG/Standard:** 2.4.7 Focus Visible (borderline pass), 2.4.13 Focus Appearance (AAA, fails)
- **Recommendation:** Remove `outline:none` from the `:focus` rule, or move the border change to `:focus-visible` and keep the shared outline.
- **Suggested command:** `/impeccable harden`

**[P2] Form errors not linked to their fields**
- **Location:** lines 462-471 and the `setErr()` function at lines 603-607.
- **Category:** Accessibility
- **Impact:** `aria-invalid` is set and the `.err` spans are live regions, so the message is announced once. When focus returns to the field, the error is not read again because the input has no `aria-describedby`. The form also has `novalidate` and does not mark required fields visually.
- **WCAG/Standard:** 1.3.1 Info and Relationships, 3.3.1 Error Identification, 3.3.2 Labels or Instructions
- **Recommendation:** Give each `.err` an id and reference it from `aria-describedby` on the input. Add a "required" cue to both labels. Point the party-size hint at its group with `aria-describedby` as well.
- **Suggested command:** `/impeccable harden`

**[P2] Placeholder contrast 3.3:1**
- **Location:** line 155, `input::placeholder{color:#5e6688}`
- **Category:** Accessibility
- **Impact:** "Ada Lovelace" and "you@example.com" are hard to read, especially for people who are already dark-adapting outdoors with screens dimmed. Confirmed by the detector and by calculation.
- **WCAG/Standard:** 1.4.3 Contrast (Minimum)
- **Recommendation:** Raise the placeholder to about `#8a91b3` (at least 4.5:1), or drop the placeholders since the labels are already explicit.
- **Suggested command:** `/impeccable harden`

**[P2] Brand link's accessible name does not contain its visible text**
- **Location:** line 205, `aria-label="Orionids Night home"` on a link that displays "Cedar Hollow"
- **Category:** Accessibility
- **Impact:** A voice-control user who says "click Cedar Hollow" will not reach the link.
- **WCAG/Standard:** 2.5.3 Label in Name (Level A)
- **Recommendation:** Remove the `aria-label`, or make it start with the visible text, for example "Cedar Hollow, home".
- **Suggested command:** `/impeccable harden`

**[P2] Content hidden when JavaScript doesn't run**
- **Location:** `.reveal{opacity:0}` (line 173) is applied from the HTML, and the `.in` class is added only by script (lines 590-594).
- **Category:** Accessibility / Implementation Integrity
- **Impact:** If the script fails, is blocked or throws before line 590 (for example if `getContext` fails), every section below the hero stays invisible: the facts, the schedule, the map, the pack list and the RSVP form. Full-page captures taken without scrolling show the same blank page, so link previews and some crawlers see it too.
- **Recommendation:** Gate the hidden state on a class that JS sets, for example `.js .reveal{opacity:0}` with `document.documentElement.classList.add('js')`.
- **Suggested command:** `/impeccable harden`

**[P2] Mobile nav removed with no replacement**
- **Location:** line 186, `.nav ul{display:none}` at 960px and below
- **Category:** Responsive
- **Impact:** On tablets and phones the only header action is "RSVP free". The anchors for The Orionids, When & where and What to bring disappear on a long page (8,875px tall at 375px).
- **Recommendation:** Keep a compact, horizontally scrollable row of the three anchors, or add a small disclosure menu. Three short links fit at 375px with a smaller gap.
- **Suggested command:** `/impeccable adapt`

**[P2] Touch targets under 44px**
- **Location:** header `.btn.sm` "RSVP free" is 95x34. The brand link is 133x24. The hero "What are the Orionids?" button is 210x43.
- **Category:** Responsive
- **Impact:** The primary call to action in the fixed header is below the 44px minimum on touch devices.
- **WCAG/Standard:** 2.5.8 Target Size (AA, 24px, passes). Below platform guidance and 2.5.5 (AAA, 44px).
- **Recommendation:** Raise `.btn.sm` to `min-height:44px` and pad the brand link vertically.
- **Suggested command:** `/impeccable adapt`

**[P2] Body font size fixed in px**
- **Location:** line 38, `body{font-size:17px}`
- **Category:** Responsive / Accessibility
- **Impact:** Text that inherits from body ignores the user's browser default font size, while the `rem`-sized parts do scale. The result is uneven scaling for low-vision users who raise the default size.
- **WCAG/Standard:** 1.4.4 Resize Text (zoom still works, so this is a robustness issue rather than a fail)
- **Recommendation:** Use `font-size:1.0625rem`.
- **Suggested command:** `/impeccable typeset`

**[P2] Starfield loop never stops, and blur layers repaint every frame**
- **Location:** `frame()` at lines 540-571. `backdrop-filter` on `.nav.scrolled` (line 53) and `.ticket` (line 82).
- **Category:** Performance
- **Impact:** `requestAnimationFrame` runs for the whole visit, even when the hero is scrolled out of view. The `.ticket` blur sits directly over the canvas, so the backdrop is re-blurred on every frame. The fixed nav blur adds more compositing. On low-end phones this drains battery and makes scrolling stutter, which matters for people checking the page in a dark field at 2 am. `resize` regenerates every star with no debounce, so rotating the phone reshuffles the sky.
- **Recommendation:** Pause the loop with an IntersectionObserver on `.hero` and on `visibilitychange`. Debounce `resize`. Swap the ticket's `backdrop-filter` for a solid `--ink-2` at about 0.85 alpha.
- **Suggested command:** `/impeccable optimize`

**[P2] Numbered eyebrow kickers on every section**
- **Location:** lines 228, 260, 334, 396, 414, 454 and 486
- **Category:** Implementation Integrity
- **Impact:** Seven tracked-caps labels, four of them numbered `01` to `04`, frame an event page like a SaaS template. They add scanning noise and no information: "Pack list" sits directly above "Dress for 4 am, not 8 pm."
- **Recommendation:** Delete the numbered kickers. Put the hero date into the ticket or the lede, where it already appears.
- **Suggested command:** `/impeccable distill`

**[P2] Same heading pattern repeated five times**
- **Location:** h1 (line 229) and the h2s at lines 261, 335, 415 and 455. CSS `h2 em,h1 em` at line 47.
- **Category:** Implementation Integrity
- **Impact:** Every heading is roman Instrument Serif followed by an *italic ember fragment*. After the hero, the device is predictable and stops adding emphasis.
- **Recommendation:** Keep the italic accent for the hero only. Give the section heads a different, more restrained treatment.
- **Suggested command:** `/impeccable typeset`

**[P2] Icon-tile feature cards in the pack list**
- **Location:** `.bring .item .ic` (lines 136 and 420-439)
- **Category:** Implementation Integrity
- **Impact:** This is the generic feature-card layout, with a hover lift on cards that do nothing when clicked (line 135). The lift suggests they are interactive when they are not.
- **Recommendation:** Present the list as a checklist (icon inline with the title, no tile), or as a more specific "what to bring" layout. Remove the hover lift from non-interactive cards.
- **Suggested command:** `/impeccable distill`

**[P2] Hard-coded secondary text color and alpha variants; no `color-scheme`**
- **Location:** `#c9cee6` at lines 80, 104, 128, 142 and 153, plus SVG line 383. About 20 hard-coded `rgba()` values derived from existing tokens. `#5e6688`, `#ff9b8f` and `#ff8f82` are also untokenized. There is no `color-scheme: dark` on `:root`.
- **Category:** Theming
- **Impact:** The most-used body-copy tint is not a token, so palette changes miss it. The error red exists in three variants (`--red`, `#ff9b8f`, `#ff8f82`). Without `color-scheme: dark`, native UI such as scrollbars and the autofill background renders in light mode on a dark page.
- **Recommendation:** Add `--text-2:#c9cee6`, `--text-3` for placeholders and the legend, `--danger`, and `--ember-a*` alpha tokens (or use `color-mix()`). Add `color-scheme: dark`. The page is intentionally dark-only (dark-sky theme), and that is the right call. Make it explicit.
- **Suggested command:** `/impeccable colorize`

### P3 Polish

**[P3] Glow accents**: `.tl.peak .dot` (line 116) and `.item.red .ic` (line 140). The peak glow can be argued for (the meteors are brightest then). The flashlight glow is decoration. Keep at most one. *Category: Implementation Integrity.* `/impeccable quieter`

**[P3] Brand icon meteor trail invisible**: gradient `#g0` (line 206) has coordinates in user space but the default `objectBoundingBox` units, so the stroke renders with 0 opacity and the logo shows only a dot. Add `gradientUnits="userSpaceOnUse"`. The `#tr` gradient (line 296) is defined but never used. *Category: Implementation Integrity.* `/impeccable polish`

**[P3] Map semantics and micro-text**: `aria-label` on the plain `div.card.map` (line 364) is ignored because the div has no role, and it duplicates the SVG's own label. The legend is 9px `#5e6688` (3.3:1), and the other map labels are 10px. *Category: Accessibility.* `/impeccable polish`

**[P3] Display face not preloaded**: the 122px h1 swaps from Georgia to Instrument Serif (`font-display:swap`, no `<link rel=preload>`), which causes a visible reflow of the largest element. Preload the two Instrument Serif files. The Manrope 800 face is declared but unused (it is not downloaded, so this is only clean-up). *Category: Performance.* `/impeccable optimize`

**[P3] Countdown has no state for after the event starts**: after 8 pm on Oct 21 it sits at `00 00 00 00` while the page keeps asking for RSVPs. Swap in a "Gates are open" or "See you next year" state. *Category: Implementation Integrity.* `/impeccable harden`

**[P3] Minor semantics**: the `<time>` elements have no `datetime` (lines 343-359). The stepper buttons give no disabled or bounds feedback at 1 and 10. The inline `list-style:none` on the timeline `<ol>` drops list semantics in Safari VoiceOver (add `role="list"`). *Category: Accessibility.* `/impeccable polish`

---

## Patterns & Systemic Issues

- **Template scaffolding is applied across the whole page, not in one spot.** The same eyebrow, italic-em heading and two-column lede structure is stamped onto all four sections, which is the root of 3 of the P2 integrity issues. Fixing the `.sec-head` pattern once fixes most of them.
- **The form's styles override the global accessibility defaults.** The global focus-visible rule is good, but local `:focus` and placeholder rules undo it inside the form. The form is the one place on the page where users must succeed.
- **Fixed-ratio SVGs inside fluid containers.** The map uses `slice`. The ridge uses `preserveAspectRatio="none"`, which is fine for a silhouette. Any SVG that carries information needs `meet` or a fixed aspect ratio.
- **Colors drift outside the token set.** The tokens cover the hero palette, but the next tier (secondary text, error, alpha tints) was written as literals, about 25 times in all.

## Positive Findings

- **Contrast is excellent where it matters.** Body and muted text measure 8.2 to 8.9:1, ember labels 9.7:1, the dark text on the ember buttons 9.7:1, and error text 8.9:1.
- **Reduced motion is handled with care.** The canvas still draws a static starfield instead of going blank, reveals render immediately, smooth scroll is turned off, and the RSVP success state still appears. Verified with emulation: all 13 `.reveal` elements were visible at opacity 1. The detector found no problem with a blanket 0.01ms kill switch.
- **Keyboard flow is logical.** The tab order goes nav, hero CTAs, fields, stepper, then submit. A clear `:focus-visible` outline appears on all links and buttons. On submit, focus moves to the first invalid field. On success, focus moves to a `role="status"` region and the "RSVP for someone else" button resets the form and refocuses the name field.
- **Semantics are mostly correct.** There is one h1, sections use h2, and cards use h3. The page has `nav`, `header`, `main` and `footer` landmarks. The details are a `<dl>` and the schedule an `<ol>`. Decorative SVGs have `aria-hidden` and the informative ones have `role="img"` plus labels. The countdown uses `aria-live="off"` so it does not announce every second.
- **No horizontal scroll** at 320px, 375px or 1440px. The timeline changes cleanly to a vertical layout under 960px. The stepper buttons are 52x50.
- **Lean delivery.** One request for the HTML, local fonts with `font-display:swap`, no frameworks, no images, and the canvas DPR is capped at 2.
- **The content is specific to the event** and worth keeping: the etiquette tips, the weather-call promise and the timeline tied to moonset.

## Recommended Actions

1. **[P1] `/impeccable adapt`**: fix the park map crop (`meet` or a fixed `aspect-ratio`, labels inside a safe area). Also bring back mobile section navigation and raise the header RSVP and brand link to 44px.
2. **[P2] `/impeccable harden`**: restore the input focus outline, link errors with `aria-describedby`, mark required fields, raise placeholder contrast, fix the brand link's label-in-name, gate `.reveal` on a `.js` class, and add a post-event countdown state.
3. **[P2] `/impeccable distill`**: remove the numbered eyebrow kickers and turn the icon-tile pack list into a checklist without hover lift.
4. **[P2] `/impeccable typeset`**: keep the italic-ember accent for the hero only, give the section heads their own treatment, and change `body` font size to rem.
5. **[P2] `/impeccable optimize`**: pause the starfield when the hero is off-screen or the tab is hidden, debounce resize, drop the ticket's `backdrop-filter` over the live canvas, and preload Instrument Serif.
6. **[P2] `/impeccable colorize`**: tokenize `#c9cee6`, the placeholder and legend gray, the error red and the ember and line alpha variants, and declare `color-scheme: dark`.
7. **[P3] `/impeccable quieter`**: reduce the glow accents to at most the peak dot.
8. **[P3] `/impeccable polish`**: fix the brand gradient units, remove the unused `#tr` gradient and the stray `aria-label`, add `datetime` and `role="list"`, and finish with a full polish pass.

> You can ask me to run these one at a time, all at once, or in any order you prefer.
>
> Re-run `/impeccable audit` after fixes to see your score improve.
