> Note: this audit was run before I fixed its three P1 issues (red light mode, the small text under "Gates 8 pm", and faint input borders). The live page includes those fixes.

# Audit: Orionids Night at Cedar Hollow (`site/index.html`)

Audited 2026-10-04 against `reference/audit.md`. Evidence comes from the bundled detector (`impeccable detect --json site/index.html`, run from `the project folder` with DESIGN.md present), a full read of the source, and Playwright renders in Chromium at 1440x900, 820x1180, 390x844 and 320x700. The 390 render ran in an emulated mobile context with touch. Contrast numbers are WCAG ratios worked out from token hex values. Red-light-mode numbers are sampled from rendered pixels.

Screenshots are in `audit/`: `desk.png`, `tab.png`, `mob.png` (full page), `mob-hero.png`, `mob-scrub.png`, `mob-scrub-after.png`, `mob-red.png`, `mob-red-label.png`, `mob-done.png`, `desk-reduced.png`. `mob-night.png` was taken while a smooth scroll was still running, so its dark strip at the top is a capture artifact and not a page bug.

## Audit Health Score

| # | Dimension | Score | Key Finding |
|---|-----------|-------|-------------|
| 1 | Accessibility | 3 | Solid semantics, form and focus handling. In red-light mode, text on madder drops to 2.4-2.9:1. Signboard gloss text is 4.21:1. Input borders are 2.27:1. |
| 2 | Performance | 3 | Lean, with no images and self-hosted woff2. Both canvas animation loops keep running forever, even off-screen. |
| 3 | Responsive Design | 3 | No overflow at 320/390/820/1440, and the scrubber drags under touch. The red-light toggle is 35px tall, and orbit labels shrink to about 10px on phones. |
| 4 | Theming | 2 | The core dye tokens are used well. The label's sub-palette is hard-coded and about 12 tints are undocumented. The red-light "theme" is amber and breaks contrast. |
| 5 | Implementation Integrity | 3 | A coherent, product-specific system. The drift is type-ramp sprawl, and the red-light mode does not produce red light. |
| **Total** | | **14/20** | **Good (address weak dimensions)** |

## Implementation Integrity Verdict

**PASS.** The page expresses its DESIGN.md system specifically and consistently:
- Full-bleed single-dye bands separated by pinstripes (`.pin`, lines 50-53).
- Blanket-stitch and fringe line work as data-URI SVGs (lines 27-29).
- One light surface, the woven label (lines 92-103).
- Big Shoulders uppercase over Atkinson Hyperlegible Next.
- Bark-tinted sewn-on shadows on the label and patches only.
- A live canvas sky that freezes under reduced motion.

None of it could be swapped onto an unrelated product. The deterministic warnings are mostly false positives against intentional display type (see below).

The verified integrity problems:
1. **Red-light mode is not red.** The filter `grayscale(1) sepia(1) saturate(7) hue-rotate(-38deg) brightness(.62)` (line 207) renders the woven label as `rgb(160,128,34)`, an amber/olive with a strong green channel, so the promise to protect night vision is only half kept. It also pushes several text pairs below AA.
2. **Type-ramp drift.** There are about 12 off-ramp font sizes, and 10 literal uses of four colors that DESIGN.md names but CSS never tokenizes.

### Detector results, verified

The detector returned 32 findings: 12 warnings and 20 advisories.

| Detector finding | Count | Verdict |
|---|---|---|
| `all-caps-body` (47 and 51 chars) | 2 | **False positive.** These are the hero H1 and the `.close` line, both display headlines sanctioned by DESIGN.md's Park Sign Rule. No paragraph is set in caps. |
| `cramped-padding` on `<section class="band">` | 4 | **False positive.** Bands pad `clamp(64px,9vw,128px) clamp(20px,5vw,72px)` (line 45), and every band renders with generous inset in screenshots. |
| `tight-leading` 1.12x / 0.95x | 3 | **False positive.** These are `.big-line` (the Lead style, documented at 1.12) and `.close` (0.95), both display-size condensed type of 1.7rem and up. All body text is 1.6. |
| `dark-glow` (#2b1a0d) | 1 | **False positive as a glow.** The flagged shadow is the bark-tinted, offset shadow on `.scrub` (line 182), which sits on the mustard band, not a dark page. It is a minor drift, though: the Sewn-On Rule lists only the label and patches as casting shadows (P3). |
| `repeating-stripes-gradient` | 1 | **False positive.** These are the woven-label grain (documented) and the stitched range track. Both are deliberate textile vocabulary. |
| `design-system-font-size` | 15 | **Partly valid.** 2.55rem, 1.5rem, 0.95rem and 1.7rem are documented in DESIGN.md prose, though not in the frontmatter ramp. 0.72rem, 0.82rem, 0.85rem, 0.98rem, 1rem, 1.35rem, 15px and four clamp() scales are true drift (P2). |
| `design-system-color` | 6 | **Valid.** These are #7a6649, #fff1ec, #efe1bf, rgb(205,187,146) (#cdbb92), rgba(255,255,255,.18) and rgba(0,0,0,.45). The last is a neutral gray shadow, which DESIGN.md forbids (P3). |
| `design-system-radius` 999px | 1 | **Valid.** The red-light toggle is a pill (line 68), outside the 2/4/6px scale (P3). |

## Executive Summary

- **Audit Health Score: 14/20 (Good)**
- **Issues found: 12.** P0: 0, P1: 3, P2: 5, P3: 4.
- **Top issues:**
  1. **[P1]** Red-light mode breaks contrast and renders amber rather than red. On madder surfaces, text drops to about 2.4-2.9:1 (line 207).
  2. **[P1]** The gloss line under "Gates 8 pm" and "Best after 1 am" is 4.21:1 because of `opacity:.92` (line 90).
  3. **[P1]** Input and stepper borders are 2.27:1 against the field (#b9a77f on #fffaf0), below the 3:1 non-text minimum (lines 110, 116).
  4. **[P2]** Both canvas `requestAnimationFrame` loops run forever, including off-screen. That costs battery on the phones people use in the car park.
  5. **[P2]** Timeline copy fades to 3.0:1 while the scrubber is in use (line 201).
- **Next steps:** fix the red-light filter and the three contrast pairs first (all small CSS changes). Then pause the animations off-screen. Then fold the stray sizes and colors into tokens.

## Detailed Findings by Severity

### P1 Major

**[P1] Red-light mode drops text below AA contrast and does not produce red light**
- **Location:** `site/index.html` line 207 (`html.redlight body{filter:grayscale(1) sepia(1) saturate(7) hue-rotate(-38deg) brightness(.62) contrast(1.05)}`)
- **Category:** Accessibility / Theming / Implementation Integrity
- **Impact:** This is the mode visitors are told to use on the night (PRODUCT.md: "white screens ruin night vision"). Measured from the 390px render (`mob-red-label.png`):
  - Wool gloss text on madder: 2.87:1.
  - "Save my spot" button label: 2.37:1.
  - Input placeholder: 2.16:1.
  - Meteor tally: 3.62:1.

  The label renders as a large amber field, `rgb(160,128,34)`, whose green channel is about half its red. That is the light most likely to disturb dark adaptation. The mode is least readable in exactly the place it is meant to be used.
- **WCAG/Standard:** 1.4.3 Contrast (Minimum); DESIGN.md "Respect the dark".
- **Recommendation:**
  - Build red mode from tokens, not a hue-rotate filter. Redefine `--wool`, `--madder`, `--mustard` and the other color tokens under `html.redlight` as values in a red-only ramp, where text is something like `#ff3b2f` on near-black and dyes become dark reds.
  - Repaint the canvases from those tokens.
  - If the filter stays, keep the luminance mapping and add a red-channel-only `feColorMatrix` (`values="0.3 0.6 0.1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0"`) so green and blue go to zero. Re-check contrast afterwards.
  - Mirror `aria-pressed` onto the inline `[data-red]` button too (line 438 only updates `btns[0]`).
- **Suggested command:** `/impeccable colorize`

**[P1] Signboard gloss text under-contrast**
- **Location:** line 90, `.label-facts span{... opacity:.92 ...}` (the "North Meadow, ..." and "The waxing moon sets ..." lines on the madder blanket edge)
- **Category:** Accessibility
- **Impact:** Wool on madder is 4.71:1. The 0.92 opacity lowers it to 4.21:1 at 16.8px regular weight. This is the key logistics copy (where to go, when to look).
- **WCAG/Standard:** 1.4.3 Contrast (Minimum)
- **Recommendation:** Remove the `opacity:.92`. Wool on madder at full strength passes, and hierarchy already comes from the size and face change.
- **Suggested command:** `/impeccable polish`

**[P1] Form field and stepper boundaries below 3:1**
- **Location:** lines 110 and 116 (`border:2px solid #b9a77f` on `#fffaf0`, set on a `#f1e5c9` label)
- **Category:** Accessibility
- **Impact:** The input border is 2.27:1 against its fill, and the fill barely differs from the label cloth. Low-vision users and anyone outdoors at night will struggle to find the hit areas of the only conversion form on the page. Focus is fine: the border turns madder at 5.67:1.
- **WCAG/Standard:** 1.4.11 Non-text Contrast
- **Recommendation:** Darken `label-stroke` to at least 3:1 against `label-field`, for example a bark-soft-leaning tan around #8f7b52 (already used for hover, line 112). Update DESIGN.md's `label-stroke` to match.
- **Suggested command:** `/impeccable harden`

### P2 Minor

**[P2] Canvas animation loops never pause**
- **Location:** hero sky `frame()` lines 503-512; scrubber `tick()` lines 613-626
- **Category:** Performance
- **Impact:** The hero loop starts at load and never checks visibility. The scrubber's IntersectionObserver only starts its loop and never stops it, so after a visitor scrolls past the night section, both canvases repaint at 60fps for the rest of the visit. In red-light mode, every frame also re-filters the whole `body`. On a phone at 2 am with a cold battery, that matters.
- **Recommendation:** Track intersection for both canvases and cancel or resume rAF on visibility, stopping on exit as well as starting on entry. Consider dropping the frame rate for the twinkle. Debounce the `resize` handler (line 510), which re-seeds and re-projects on every event.
- **Suggested command:** `/impeccable optimize`

**[P2] Timeline text fades below AA during scrubbing**
- **Location:** line 201, `.timeline.scrubbing li{opacity:.62}`
- **Category:** Accessibility
- **Impact:** Once the visitor touches the scrubber, every timeline entry except the current one drops to 3.0:1 (bark-mid body copy) or 3.41:1 (bark headings) on mustard, and stays there for the rest of the visit. The copy is still meant to be read.
- **WCAG/Standard:** 1.4.3 Contrast (Minimum)
- **Recommendation:** Mark the current step with something other than fading. For example, emphasize the `.now` row with the larger solid node, a madder-deep rule or a bolder time. Or keep inactive rows at an opacity of 0.85 or higher, which holds 4.5:1 on mustard.
- **Suggested command:** `/impeccable polish`

**[P2] Type-ramp drift: about 12 sizes off the DESIGN.md scale**
- **Location:**
  - `.brand small` 0.72rem (line 63, 11.5px)
  - `.scrub-ticks` 0.82rem (line 198)
  - `.err` and `.scrub-note` 0.85rem (lines 115, 199)
  - `.woven .sub` 0.98rem (line 105)
  - `.field input` 1rem (line 110)
  - `.where dt` 1.35rem (line 172)
  - `.orbit text` 15px (line 148)
  - Clamp scales: `.hero .lede` (line 75), `.timeline time` (line 155), `.close` (line 174), `.scrub-time` (line 187)
- **Category:** Implementation Integrity
- **Impact:** DESIGN.md says running text is 1.05rem or larger, read at arm's length on a phone. The brand subline (11.5px, carrying the "fictional park" disclosure), the scrubber ticks and the scrubber note all fall below that. Each new one-off size weakens the ramp.
- **Recommendation:** Map each to a documented step: Label 0.9rem for small UI, Body for notes, Title for `dt`. Add a documented "caption" step if one is really needed. Add the deliberate clamp scales (hero lede, scrub time, close line) to the frontmatter ramp.
- **Suggested command:** `/impeccable typeset`

**[P2] Label sub-palette and tints hard-coded instead of tokenized**
- **Location:** lines 105, 110-120, 126, 131, 157-158
- **Category:** Theming
- **Impact:**
  - DESIGN.md names `bark-soft` (#4a3320), `bark-mid` (#3d2614), `label-field` (#fffaf0) and `label-stroke` (#b9a77f), yet the CSS has no tokens for them and repeats the literals 10 times.
  - Six more tints appear nowhere in DESIGN.md: #7a6649, #8f7b52, #fff1ec, #efe1bf, #e2d4b0, #cdbb92.
  - `--forest-deep` is defined but never used. The badge green #2c5537 nearly duplicates `forest` (#2f5a3c).

  A proper token-based red-light mode (see P1) would have to chase every one of these literals.
- **Recommendation:** Add `--bark-soft`, `--bark-mid`, `--label-field`, `--label-stroke`, `--label-hover` and `--field-error` to `:root` and use them everywhere. Either document the hover, error and divider tints or derive them with `color-mix()`. Remove `--forest-deep`, and use `--forest` in the badge.
- **Suggested command:** `/impeccable polish`

**[P2] Orbit diagram labels shrink to about 10px on phones**
- **Location:** lines 147-148 and 335-347 (`.orbit text{font-size:15px}` inside a 520-unit viewBox)
- **Category:** Responsive
- **Impact:** At 390px, the SVG renders about 350px wide, so the labels ("Earth, late October", "Halley's dust trail") come out around 10px. That is the diagram's whole explanation for first-timers. The dust-trail ellipse is also clipped at the left edge of the viewBox.
- **Recommendation:** Below 560px, raise the SVG text to about 22-24 user units, or move the labels into HTML around the figure. Widen the viewBox so the ellipse is not clipped.
- **Suggested command:** `/impeccable adapt`

### P3 Polish

**[P3] Meteor counting is pointer-only**
- **Location:** lines 526-531 (`pointerdown` on `#sky`, which is `aria-hidden`)
- **Category:** Accessibility
- **Impact:** The tally ("Tap meteors in the sky to count them: 0") is announced through `aria-live`, but keyboard and screen-reader users have no way to add to it. It is a delight feature, not part of the task, which is why this is P3.
- **Recommendation:** Add a small "I saw one" button next to the tally, or make the tally a button that counts.
- **Suggested command:** `/impeccable harden`

**[P3] Red-light toggle: small target, pill shape, and an inline duplicate without state**
- **Location:** lines 68-70, 261, 402, 438
- **Category:** Responsive / Implementation Integrity
- **Impact:**
  - The nav toggle is 155x35 and the inline one is 125x35. Both are below the 44px target the design uses elsewhere, though they pass WCAG 2.5.8's 24px minimum.
  - `border-radius:999px` is outside the 2/4/6px rounded scale and is the pill shape DESIGN.md warns against.
  - The inline `[data-red]` button never receives `aria-pressed`.
  - Desktop nav links are 20px tall.
- **Recommendation:** Give the toggle a minimum height of 44px and a 4px radius, and set `aria-pressed` on every `[data-red]` button in `setRed()`. Pad the nav links vertically.
- **Suggested command:** `/impeccable adapt`

**[P3] Shadows outside the shadow vocabulary**
- **Location:** line 195 (range thumb `rgba(0,0,0,.45)`), line 182 (`.scrub` frame shadow)
- **Category:** Implementation Integrity
- **Impact:** The thumb uses a neutral gray shadow ("never neutral gray"), and the scrubber frame casts a shadow although the Sewn-On Rule reserves shadows for the label and patches. Each is a small drift.
- **Recommendation:** Tint the thumb shadow with bark. Either document the scrubber as a sewn-on object or drop its shadow.
- **Suggested command:** `/impeccable polish`

**[P3] "2–5 am" wraps in the narrow timeline column**
- **Location:** line 221 (`grid-template-columns:4.6rem 1fr` under 560px)
- **Category:** Responsive
- **Impact:** At 390px the peak time breaks into "2–5" / "am" next to its node, which weakens the page's most important time.
- **Recommendation:** Widen the column slightly, or add `white-space:nowrap` with a smaller time size for that row.
- **Suggested command:** `/impeccable layout`

## Patterns & Systemic Issues

- **Contrast is tuned for the default theme only.** Each pair passes or nearly passes in the default dark theme. The failures all come from alpha or filter applied on top of tokens: opacity 0.92 on the gloss, 0.62 on the timeline, and the hue-rotate filter for red mode. Any time the page dims something, re-check the ratio.
- **Two token systems.** The four dyes and wool are tokenized and used about 100 times. Everything on the woven label, and every hover, error and divider state, uses literal hex. Canvas code and inline SVGs repeat the token hexes as literals, about 20 times for #f6ecd4 and #f1e5c9. That is why a themed red mode is harder than it should be.
- **Ad-hoc small type.** Wherever the page needed small print (brand subline, ticks, notes, errors), it got a new size between 0.72rem and 0.98rem instead of the documented Label step.

## Positive Findings

- **Form flow is strong, verified in the browser:**
  - Real `<label for>` labels.
  - `aria-describedby` errors and `aria-invalid`.
  - Focus moves to the first invalid field.
  - Errors are plain-language ("That email looks off. Check for a missing @ or dot.").
  - `aria-busy` while submitting.
  - On success, focus moves to a `role="status"` panel that personalizes the count ("Thanks, Ada. 3 spots saved...").
  - The stepper is a labelled `role="group"` with `aria-live` output and disabled limits.
- **Keyboard and semantics:**
  - The skip link is the first tab stop.
  - Tab order runs nav, then form, then stepper.
  - The dashed mustard `:focus-visible` outline is clearly visible on dark grounds (8.7:1 on sky).
  - Landmarks are header, nav, main and footer.
  - The orbit diagram has `role="img"` with a real `<title>`.
  - Decorative SVGs and canvases are `aria-hidden`.
- **The scrubber is well built.**
  - It is a native `<input type=range>` with `aria-valuetext` ("6:05 am, about 6 meteors an hour").
  - Arrow keys work.
  - It is 44px tall.
  - Under synthesized touch (CDP touch events, Chromium, emulated 390px mobile), a horizontal drag moved it from 8:00 pm to 5:10 am without scrolling the page, and a tap on the track jumped to 5:40 am.
  - Physical-device touch is untested.
- **Reduced motion is intentional, not a kill switch.** Twinkle stops, the meteors freeze mid-fall so the state is still visible (`desk-reduced.png`), smooth scroll turns off, and the scrubber redraws on input instead of animating.
- **Responsive layout holds** at 320, 390, 820 and 1440 with no horizontal scroll. The label correctly moves above the facts on narrow screens.
- **Performance basics are good.** There are no raster images, the fonts are seven self-hosted woff2 files (about 95KB) with `font-display:swap`, the display face is preloaded, and the DPR is capped at 2.
- **Honesty is built in.** The fictional park is disclosed in the nav, the "Where" section and the footer, and rates are labelled "typical-year estimates", exactly as PRODUCT.md asks.

## Recommended Actions

1. **[P1] `/impeccable colorize`**: Rebuild red-light mode as a token-based red-only theme, or use a red-channel color matrix. Bring wool on madder, the button label and the placeholder back above 4.5:1. Sync `aria-pressed` on both toggles.
2. **[P1] `/impeccable harden`**: Darken `label-stroke` to at least 3:1 against `label-field` for inputs and the stepper. Add a keyboard path for meteor counting.
3. **[P1] `/impeccable polish`**: Remove `opacity:.92` from the `.label-facts` gloss. Replace the timeline fade with emphasis on the current row. Tokenize the label sub-palette and the undocumented tints. Fix the gray thumb shadow.
4. **[P2] `/impeccable optimize`**: Pause both canvas rAF loops when off-screen, and debounce resize.
5. **[P2] `/impeccable typeset`**: Collapse the about 12 off-ramp sizes onto Label and Body, and document the deliberate clamp scales in DESIGN.md.
6. **[P2] `/impeccable adapt`**: Enlarge the orbit labels on phones and widen the viewBox. Give the red-light toggle a minimum height of 44px and a 4px radius.
7. **[P3] `/impeccable layout`**: Keep "2–5 am" on one line in the mobile timeline.
8. **`/impeccable polish`**: Final pass after the fixes above.

> You can ask me to run these one at a time, all at once, or in any order you prefer.
>
> Re-run `/impeccable audit` after fixes to see your score improve.
