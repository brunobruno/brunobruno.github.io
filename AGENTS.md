# Agent notes

Read `DOCUMENTATION.md` first — it describes both parallax views (Design `/`, Tech `/?view=tech`), every
slide's scroll choreography, data sources and known gotchas.

- Verify with `npm run lint && npm run build` (3 pre-existing oxlint warnings are expected).
- Dev server: `npm run dev` → http://localhost:5173 (append `?view=tech` for the Tech view).
- Slide CSS is global: each slide owns a BEM block; grep `src/**/*.css` before naming a new one.
- Keep act 1 of any pinned slide visible at progress 0; never animate `filter`/`scale` on the view wrapper.
- Update `DOCUMENTATION.md` and `src/views.js` whenever slides/chapters change.
