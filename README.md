# Haven — Interior Design Studio

A single-page marketing site for a fictional interior design studio, built as a
front-end practice project. Vanilla HTML, CSS and JavaScript — no build step, no
dependencies.

## Running it

Open `index.html` directly, or serve the folder:

```bash
python -m http.server 8000
# then visit http://localhost:8000
```

## Structure

```
index.html      all markup, one page, eight numbered sections
css/style.css   design tokens, layout, responsive rules
js/main.js      scroll reveal, nav, stat counters, before/after slider, accordion
assets/         hero video + poster, before/after images, logo, favicon
images/         section, project and team photography
```

## Notes

- **Layout** is fluid rather than fixed-breakpoint. Vertical rhythm resolves from
  four spacing tokens in `:root`, so spacing scales with viewport width instead of
  snapping between breakpoints. Content runs edge-to-edge minus the gutter up to a
  1560px ceiling.
- **Verified** for horizontal overflow at 16 widths from 320px to 1920px, and for
  content-edge alignment at 1024–2560px.
- **Accessibility**: 44px touch targets, 16px form inputs (below that iOS force-zooms
  on focus), `prefers-reduced-motion` honoured on the hero and button animations,
  keyboard-operable before/after slider.
- **Copy and imagery are placeholders** and would need replacing before any real use.

## Credit

Layout and visual direction are informed by an existing reference design; the
markup, stylesheet and JavaScript here were written from scratch.
