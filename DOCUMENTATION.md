# Bruno Galati — Portfolio: Technical Documentation

> Written for humans **and** for future AI prompts. If you are an AI asked to change this
> site, read this file first, then the specific section/slide file. Keep this document updated
> when you add, remove or re-choreograph a slide.

Live: https://brunobruno.github.io · Repo root: this folder · Stack: React 19 + Vite 8 + Framer Motion 12
(+ three.js / react-globe.gl / @react-three/fiber for the Tech view only).

---

## 1. One-paragraph summary

A single-page, scroll-driven portfolio with **three independent parallax "worlds"** selected by a fixed pill
switcher at the top of the page:

| View | URL | Theme | Entry file |
|---|---|---|---|
| **Design** (default) | `/` | A walk through art history (Lascaux → Rothko → AI) on paper/ink colours | `src/App.jsx` → `DesignView()` |
| **Tech** | `/?view=tech` | Outer space: evolution of tools → interactive Earth with live World Bank data → capital → technology → people → interactive Moon | `src/tech/TechView.jsx` (lazy) |
| **Experimental** | `/?view=experimental` | Playground, pure entertainment: kaleidoscopic 3D vortex → globe of live frontend job openings → meshing gear train → animated fog chamber | `src/experimental/ExperimentalView.jsx` (lazy) |

Both views share the chrome (progress bar, right-hand chapter nav, switcher), the Footer, the global type
system and the parallax primitives in `src/components/Parallax.jsx`.

---

## 2. Commands

```bash
npm install
npm run dev       # http://localhost:5173  (add ?view=tech for the Tech view)
npm run build     # outputs dist/ (two JS chunks: main + TechView)
npm run preview
npm run lint      # oxlint; 3 known harmless warnings (new Date() in render, unused `profile` import in Hero)
```

Deployment: `.github/workflows/deploy.yml` builds and publishes `dist/` to GitHub Pages on every push to `main`.
`vite.config.js` uses `base: '/'` (user site). `public/404.html` + `.nojekyll` keep Pages happy.

---

## 3. Repository map

```
index.html                     fonts (Google Fonts: Bebas Neue, Playfair, Unbounded, Space Grotesk, Cormorant), meta
public/
  data/countries.geojson       Natural Earth 110m admin-0 (vendored, 488 KB) – used by the Tech globe
src/
  main.jsx                     React root (NO StrictMode — see gotchas §10)
  App.jsx                      view state (?view=), AnimatePresence swap, lazy TechView, ViewSwitcher + Chrome
  views.js                     VIEWS registry: label + chapter list (ids must match section ids) + readView()
  styles/global.css            CSS variables (palette + fonts), .section/.pinned primitives, type utilities
  components/
    Parallax.jsx               ParallaxSection, PinnedSection, Layer, Reveal, SplitWords  (shared by all views)
    Chrome.jsx/.css            scroll progress bar + chapter dots (receives `chapters` prop)
    ViewSwitcher.jsx/.css      centered "Design | Tech | Experimental" pill (framer layoutId pill)
    ErrorBoundary.jsx          view-level crash boundary (keyed by view in App)
    useGlobeLifecycle.js       globe instance registry: pause/resume on visibility, context loss on unmount,
                               remount key on webglcontextlost
    FlowField.jsx              canvas flow field used by Design › Velocity
  data/content.js              profile + career timeline (Design view copy)
  sections/                    DESIGN VIEW slides (Hero, Cave, Perspective, DeStijl, OpArt, Suprematism,
                               Velocity, Pop, Rothko, Machine, Footer) – one .jsx + one .css each
  tech/                        TECH VIEW
    TechView.jsx               fetches World Bank data once, provides WorldContext, renders Starfield + slides
    world.js                   WorldContext / useWorld()  (separate file to avoid circular imports)
    tech.css                   Tech tokens (--space, --cyan, --lime, --violet, glass panels, .hud, .stat …)
    data/worldbank.js          World Bank API client + sessionStorage cache + money()/people() formatters
    data/companies.js          curated "largest company per country" dataset (ISO3 → {name, cap $B, sector})
    components/
      Starfield.jsx            fixed full-screen canvas: 3 parallax star layers, nebula, comets, scroll warp
      Counter.jsx              Counter (count-up on view) + LiveCounter (keeps ticking, e.g. population clock)
      MoonScene.jsx            R3F <Canvas>: procedural GLSL moon, OrbitControls, click-to-land markers
    sections/                  TECH slides – Evolution, Earth, Money, Technology, Population, Moon (+ .css)
  experimental/                EXPERIMENTAL VIEW
    ExperimentalView.jsx       renders the four labs + Footer (no shared data layer)
    experimental.css           tokens (--void, --magenta, --acid, glass, .hud)
    components/VortexScene.jsx R3F kaleidoscope tunnel (rings of drei <Text> glyphs + primitives, FUTURE finale)
    components/FogScene.jsx    R3F fullscreen shader quad: domain-warped FBM smoke + embers
    data/cities.js             city → lat/lng table + geocode(location)
    data/jobs.js               Arbeitnow client (frontend filter, last 7/30 days), groupByCity, LinkedIn search URL
    sections/                  Vortex, JobsGlobe, Gears, Fog (+ .css)
```

---

## 4. Shared architecture

### 4.1 Parallax primitives (`src/components/Parallax.jsx`)

| Primitive | What it does | Progress semantics |
|---|---|---|
| `ParallaxSection` | `<section class="section">`, min-height 100vh, render-prop `children(progress)` | 0 when the section's top enters the bottom of the viewport → 1 when its bottom leaves the top |
| `PinnedSection` | tall section (`height` prop, e.g. `320vh`) whose `.pinned__stage` is `position: sticky; height: 100vh` | 0 when the stage pins → 1 when it unpins. **Use this to "play a scene"** |
| `Layer` | drifts a child vertically at `speed` (+ optional rotate/scale/x) | — |
| `Reveal` | fade+rise once when scrolled into view (`whileInView`) | — |
| `SplitWords` | masked word-by-word headline reveal | — |

Progress values are already spring-smoothed (`useSpring`). Every slide follows the same recipe:

```jsx
export default function Slide() {
  return <PinnedSection id="money" className="money" height="320vh">{(p) => <Scene p={p} />}</PinnedSection>
}
function Scene({ p }) {
  const opacity = useTransform(p, [0, 0.3, 0.38], [1, 1, 0])   // keyframes on scroll progress
  return <motion.div style={{ opacity }} />
}
```

**Rule:** the first act of a pinned slide must be visible at `p = 0` (start keyframes at opacity 1),
otherwise the visitor sees an empty screen for the first few hundred pixels.

### 4.2 View switching (`App.jsx`, `views.js`, `ViewSwitcher.jsx`)

* View is read from `?view=tech` (anything else → `design`). `setView` pushes history, clears the hash and
  scrolls to top instantly; `popstate` is handled so back/forward works.
* `document.documentElement.dataset.view` is set (`:root[data-view='tech']` is used to recolour the pill).
* `AnimatePresence mode="wait"` swaps the whole view with **opacity + y only**. Do **not** animate `filter`
  or `scale` on that wrapper: a non-`none` filter/transform turns it into a containing block and breaks the
  `position: fixed` starfield and the sticky stages inside.
* `TechView` and `ExperimentalView` are `React.lazy` (`LAZY_VIEWS` map in `App.jsx`) → three.js/globe.gl
  (≈665 KB gzip, shared chunk) are only downloaded when a switch is used. The Design bundle stays ≈120 KB gzip.
* Chapter nav: `Chrome` receives `VIEWS[view].chapters`; ids must match the rendered section ids.
* `ViewSwitcher` builds its tabs from `VIEWS`, so adding a view = add an entry in `views.js` + `LAZY_VIEWS`.
  The pill is centred with the CSS `translate` property, **not** `transform` — framer-motion owns `transform`
  on that element (its `y` entrance animation would overwrite a `translateX(-50%)`).

### 4.3 Type & colour system (`global.css`, `tech.css`)

Utilities used everywhere: `.display` (Bebas, uppercase), `.serif` (Playfair), `.italic` (Cormorant),
`.wide` (Unbounded), `.eyebrow`, `.phrase` (+ `em` accent), `.body`, `.outline`, `.chips/.chip`.
Tech adds `.hud` (tiny tracked caps, cyan; `.hud--lime`), `.stat` (big thin tabular numbers),
`.gradient-text` (white→cyan→lime), `.glass` (blurred panel), `.beam`, `.orbit`.

Design palette lives in `:root` (`--ink`, `--paper`, `--yolk`, `--klein`, …). Tech palette is scoped under
`.tech` (`--space`, `--cyan #19c3e6`, `--lime #c6ff3f`, `--violet`, `--gold`, `--glass`, `--glass-border`).

**Class-name namespaces matter** – both views' CSS is global. Each slide owns a BEM block
(`.hero__`, `.cave__`, `.evo__`, `.earth__`, `.money__`, `.techno__`, `.people__`, `.moon__`).
`Population` deliberately uses `.people` because `.pop` is already taken by Design › Pop (yellow background).
Before adding a block name, grep `src/**/*.css` for it.

---

## 5. Design view (art history) — slide by slide

| # | id | File | Idea | Mechanic |
|---|---|---|---|---|
| 01 | `hero` | `sections/Hero.jsx` | Manifesto; Bauhaus primitives | `ParallaxSection`; blurred circle/triangle/bar `Layer`s, entrance animations, fade-out on scroll |
| 02 | `cave` | `Cave.jsx` | Lascaux – origins of mark-making | ochre layers, hand stencils |
| 03 | `perspective` | `Perspective.jsx` | Brunelleschi – perspective as first UI | **Pinned** tunnel of frames flying toward the camera, rotating rays |
| 04 | `destijl` | `DeStijl.jsx` | Mondrian – structure/grids | sliding colour blocks |
| 05 | `opart` | `OpArt.jsx` | Riley/Vasarely – perception | moiré stripes driven by scroll |
| 06 | `suprematism` | `Suprematism.jsx` | Malevich – direction/CV timeline | flying rectangles + career timeline from `data/content.js` |
| 07 | `velocity` | `Velocity.jsx` | Futurism – speed | `FlowField` canvas (particles follow a curl-ish field, cursor bends it) |
| 08 | `pop` | `Pop.jsx` | Warhol – repetition/stack chips | halftone grid, repeated tiles (yellow bg → `.pop`) |
| 09 | `rothko` | `Rothko.jsx` | Reflection | breathing colour fields |
| 10 | `machine` | `Machine.jsx` | AI as "the camera of our century" | neon brush strokes + self-drawing neural lattice |
| 11 | `contact` | `Footer.jsx` | Klein-blue contact footer (shared by both views) | — |

Copy for the Design view is inline in each section; profile/timeline data is in `src/data/content.js`.

---

## 6. Tech view (space) — slide by slide

Global backdrop: `components/Starfield.jsx` — one `position: fixed` canvas behind every slide.
Always alive (twinkle, slow drift, comets every 3–9 s, two breathing nebula gradients), reacts to scroll
(3 depth layers at different parallax rates; scroll *velocity* stretches stars into warp lines) and to the
pointer (gentle tilt). Respects `prefers-reduced-motion`. Pauses on hidden tabs.

Data: `TechView` calls `loadWorldData()` once and exposes `{ data, error }` via `useWorld()`:

```js
data = {
  gdp:        { USA: { value, year, name }, ... },   // NY.GDP.MKTP.CD, current US$
  population: { USA: { value, year, name }, ... },   // SP.POP.TOTL
  world:      { gdp, population, year },             // WLD aggregate (falls back to the sum)
}
```

| # | id | File | Height | Choreography (p = pinned progress) |
|---|---|---|---|---|
| 01 | `evolution` | `tech/sections/Evolution.jsx` | pinned 380vh | **Act 1 (0–0.3)** title "Nothing stays built." + personal copy about rebuilding the toolkit; breathing sun glow + three rotating orbit rings (CSS spin + scroll rotate). **Act 2 (0.3–0.82)** a horizontal rail of 7 eras (Stone → Press → Transistor → Web → Touch → Models → You) flies right-to-left over a glowing beam; each era brightens/lifts as it crosses the centre. **Act 3 (0.84–1)** "Frameworks expire. Curiosity compounds." |
| 02 | `earth` | `Earth.jsx` | section 150vh | `react-globe.gl` globe (no texture: dark Phong sphere, cyan atmosphere). Countries = **hex-dot polygons** coloured by log-GDP (dim → cyan → lime) and slightly extruded by GDP. Labels on the top-12 economies: `"$29.2T · NVIDIA"`. **Interactions:** auto-rotates; drag to orbit; hover shows a flag+name chip; **click a country** → fly-to, white highlight, pulsing lime rings, animated arcs from the top-8 economies into it, and the glass panel shows GDP, population, GDP/capita and the largest company (name, ≈market cap, sector). Click empty space or × → back to World. Right column: title, panel, clickable top-8 bar list. Globe scales/rises in with section progress and is paused via IntersectionObserver when off-screen. |
| 03 | `money` | `Money.jsx` | pinned 320vh | "Money is the oldest software." Continuous **capital streams** (light packets crossing the screen). A **donut ring** of the top-10 economies as a share of gross world product draws itself with scroll (`strokeDashoffset`), the remaining ~180 countries as a dim grey arc; centre shows a counting `$xxx.xT` total. Ring sits right during the intro, slides left for the mid copy (legend appears), centres for the outro facts: $7.5T FX/day (BIS 2022), output per human (computed), ~65 ms transatlantic round trip. |
| 04 | `technology` | `Technology.jsx` | section 160vh | "Every curve is getting steeper." Synthwave perspective floor (CSS 3D grid, animated), falling data columns as `Layer`s, sticky left copy. Right: **time-to-100M-users chart** (Telephone 75y … ChatGPT 2 months; bars animate via variants) + a 2×2 stat grid: 5.5B online / 2.6B offline (ITU 2024), 8.9B mobile connections (GSMA 2024), 6h 40m daily screen time (DataReportal 2024), Moore 2×. |
| 05 | `population` | `Population.jsx` | pinned 300vh | "Eight billion reasons to care." A **1,000-dot canvas matrix** (each dot ≈ 8.2M people) lights up with scroll with an organic jittered front and breathing pulses. Mid: glass **live population clock** = World Bank mid-year total + 2.2 people/s since 1 July of that year (UN WPP 2024 net rate), with births/deaths rates. Outro: accessibility message. |
| 06 | `moon` | `Moon.jsx` + `components/MoonScene.jsx` | pinned 340vh | **Fully procedural GLSL moon** (no textures): multi-octave cell-noise craters with bowls and rims, fbm maria, regolith grain, vertex displacement, finite-difference bump normals, Lambert + wrap lighting, blue earthshine on the dark side. **Scroll sweeps the sun** (thin crescent on arrival → full moon at the finale). **Interactions:** drag to orbit (OrbitControls, damping, auto-rotate, zoom disabled so the wheel still scrolls the page), **click the surface to drop a landing marker** (pulsing lime ring + HTML label with lat/lng; "Touchdown confirmed" toast). Tranquility Base (Apollo 11) is pre-placed. Moon enters small from the right, parks right for the mid copy, centres and lifts for the outro. `frameloop` switches to `never` when off-screen. |
| 07 | `contact` | `../sections/Footer.jsx` | — | shared footer |

Copy tone for the Tech view: inspiring, first person, short "HUD" eyebrows (`Transmission 0N · Name`),
one italic lime accent word per phrase.

---

## 6b. Experimental view (playground) — slide by slide

No shared data layer; each lab is self-contained. Eyebrows read `Lab 0N · Name`; palette is magenta / acid
yellow / violet on near-black (`experimental.css`).

| # | id | File | Height | What it does |
|---|---|---|---|---|
| 01 | `vortex` | `sections/Vortex.jsx` + `components/VortexScene.jsx` | pinned 620vh | **Kaleidoscopic tunnel** in R3F: 30 rings, 12 slots each (4 drei `<Text>` glyphs in 3-fold symmetry + 8 primitives: torus/octa/box/cone/ring, some wireframe), counter-rotating with time *and* scroll; two wireframe tubes, 1,500 dust points, fog. Scroll flies the camera down the tube with a full 360° barrel roll (ends upright) and a pointer-driven sway. **Finale (p 0.78→0.97):** the six letters of **FUTURE** fly in from the walls, un-tumble and lock into a line lit by a magenta point light. Font: Unbounded 900 woff from Google Fonts (`FONT` const; troika needs woff/ttf, not woff2). HTML copy: intro top-left, mid line, outro at the bottom. |
| 02 | `jobs` | `sections/JobsGlobe.jsx` | section 150vh | **Globe of live frontend openings.** `react-globe.gl`, dark sphere, dim violet hex land, magenta atmosphere. Pins = `pointsData` per city (height ∝ count). **Hover tooltip on the planet shows only the first 10 characters of the first title + "…" (and `+N`)** — `clip()` in `data/jobs.js`. **Click a pin** (or a city in the list) → fly-to, white pin, acid rings, and the right-hand glass panel lists that city's openings: title, company, posted-ago, tags, remote flag, "View posting" (original URL) and "Search on LinkedIn" (pre-filled LinkedIn jobs search for title + city, last 7 days). Click empty globe / × to reset. `waitForGlobeReady={false}` + per-instance init effect + `useGlobeLifecycle` keep it alive across view switches; pauses off-screen. |
| 03 | `gears` | `sections/Gears.jsx` | pinned 480vh | **Procedural SVG gear train.** `gearPath(n, m)` draws trapezoid teeth + hub + spoke windows (evenodd). `buildTrain()` chains 12 gears (teeth in `TEETH`, heading angles in `ANGLES`) with one shared module so pitch circles touch, alternates direction, and solves each gear's **phase** so a tooth meets a gap at the contact point. One shared `drive` MotionValue = scroll × 4 turns + idle spin (`useAnimationFrame`, 14°/s); each gear's angle is `drive × ratio × dir + phase`, written **imperatively** to the SVG `transform` attribute via `useMotionValueEvent` (see gotchas). The SVG is taller than the viewport and pans down with scroll. A glass "drive shaft" dial shows the current angle. Finishes: brass / steel / copper gradients + drop shadow. |
| 04 | `fog` | `sections/Fog.jsx` + `components/FogScene.jsx` | pinned 460vh | **Procedural fog chamber.** One fullscreen shader quad in R3F (`FogScene.jsx`): double domain-warped FBM smoke that churns while idle, drifts sideways and thickens to white-out with scroll, then **parts at p ≈ 0.8** to reveal the word **EMERGE**. Pointer steers the warp field; sparse ember specks drift upward. Uniforms: `uTime`, `uProgress`, `uPointer`, `uRes`. Copy acts: intro top-left, mid corridor line, outro word centered. |
| 05 | `contact` | `../sections/Footer.jsx` | — | shared footer |

### Jobs data (`experimental/data/jobs.js`)

* **Why not LinkedIn?** LinkedIn's Jobs API is partner-only and scraping breaks its ToS. We use the free,
  CORS-enabled **Arbeitnow job board** (`https://www.arbeitnow.com/api/job-board-api?page=N`, 300/page,
  newest first, mostly DACH/NL/UK). Every card still links to an equivalent **LinkedIn search**
  (`linkedinSearch(title, city)` → `f_TPR=r604800` = past week).
* Pipeline: fetch pages 1–8 in parallel (`allSettled`) → title matches `FRONTEND` regex → `geocode()` via
  `data/cities.js` (lower-case, diacritics stripped, token match; unknown cities/remote are dropped) →
  posted ≤ 7 days (widened to 30 if < 8 results) → newest 60 → `sessionStorage` for 1 h (`xp:jobs:v1`).
* To add a city, add a key to `CITIES` (include German/local spellings, e.g. `muenchen`, `koeln`).

---

## 7. Data sources & how to refresh them

| Data | Source | Where | Notes |
|---|---|---|---|
| GDP (current US$), population per country, world totals | **World Bank Indicators API** (public, no key) `https://api.worldbank.org/v2/country/{all|WLD}/indicator/{NY.GDP.MKTP.CD|SP.POP.TOTL}?format=json&mrv=1&per_page=400` | `tech/data/worldbank.js` | `mrv=1` = most recent value. Aggregates (regions/income groups) are filtered by the `AGGREGATES` set. Cached in `sessionStorage`. A per-day `&d=YYYY-MM-DD` cache-buster is appended because Cloudflare occasionally serves a cached copy **without CORS headers**. Fetches use `Promise.allSettled`, so one failing indicator doesn't kill the view. |
| Country shapes, ISO codes, fallback POP_EST / GDP_MD_EST | Natural Earth 110m (public domain), vendored from the react-globe.gl examples | `public/data/countries.geojson` | Use `ISO_A3`, falling back to `ADM0_A3` when it is `-99` (France, Norway, Kosovo…); same for `ISO_A2` → `WB_A2`. Antarctica is dropped. Centroids are computed from the **largest ring** so France isn't placed in the Atlantic by French Guiana. |
| Largest company per country (≈ market cap, sector) | **Hand-curated** — there is no free public API for this | `tech/data/companies.js` | Values are rounded 2025 snapshots in USD billions, labelled "~2025" in the UI. Update `asOf` and the numbers together. Missing countries show "Not in the index yet." |
| Static facts | BIS Triennial Survey 2022 ($7.5T FX/day), ITU 2024 (5.5B online / 2.6B offline), GSMA 2024 (8.9B mobile connections), DataReportal 2024 (6h 40m screen time/day), UN WPP 2024 (+2.2 people/s), Moore 1965, time-to-100M-users (commonly cited figures), Apollo Guidance Computer specs | inline in `Money.jsx`, `Technology.jsx`, `Population.jsx`, `Moon.jsx` | Each fact shows its source in a `.hud` line. Keep that habit. |

---

## 8. Dependencies added for the Tech view

| Package | Version | Why |
|---|---|---|
| `three` | 0.186.1 | WebGL; shared by globe.gl and R3F (one copy) |
| `react-globe.gl` | 2.38.0 | Earth globe (hex polygons, labels, arcs, rings, controls) |
| `@react-three/fiber` | 9.8.2 | React renderer for three (Moon, Vortex, Fog) — React 19 compatible |
| `@react-three/drei` | 10.7.9 | `OrbitControls` (Moon), `Text` (Vortex glyphs). **Do not use `Html`** — see gotchas. |

All are published > 7 days before adoption. Don't add textures/CDN assets: the whole Tech view is
self-contained except for the World Bank calls.

---

## 9. How to add a slide (either view)

1. Create `src/<sections|tech/sections>/Name.jsx` + `Name.css` with a unique BEM block (grep first).
2. Wrap in `ParallaxSection` (flowing content) or `PinnedSection` (a scene). Use `useTransform(p, …)` for
   scroll choreography; keep act 1 visible at `p = 0`; fade the last act in before `p = 0.95`.
3. Add idle motion too (CSS keyframes or a canvas loop) — every slide should breathe when the user stops.
4. Render it in `App.jsx › DesignView` or `tech/TechView.jsx`, and add `[id, label]` to `src/views.js`.
5. For canvases/WebGL: size with `ResizeObserver`, pause with `IntersectionObserver`/`document.hidden`,
   cap `devicePixelRatio` at 1.5–2, respect `prefers-reduced-motion`.
6. Run `npm run lint && npm run build`, then eyeball both views in the browser at several scroll stops.

---

## 10. Gotchas learned the hard way (read before debugging)

* **`.pop` collision** – Design's `Pop.css` paints `.pop` yellow; Tech's population slide is `.people`.
* **Fixed/sticky inside an animated wrapper** – never leave `filter`/`scale` on the AnimatePresence wrapper.
* **`whileInView` on a `scaleX(0)` element never fires** (zero-size box → IntersectionObserver never
  intersects). Put `whileInView` on a parent and propagate via `variants` (see `Technology.jsx` chart).
* **Framer `Counter` + inline `format` fns** – the formatter is read through a ref; don't add it to effect deps
  or the count-up restarts every render.
* **GLSL in three.js**: `modelMatrix`/`normalMatrix` exist only in the **vertex** stage. The Moon passes a
  `uNormalMatrix` (mat3) uniform updated each frame for world-space normals in the fragment shader.
* **Moon framing**: the sphere's apparent radius is `asin(1/cameraZ)`; camera at z = 3.7 with fov 38 leaves
  ~15 % margin so displacement and markers aren't clipped. R3F's wrapper is `overflow: hidden`; `Moon.css`
  overrides it so marker labels can hang outside.
* **World Bank CORS** – intermittent missing `Access-Control-Allow-Origin` on CDN cache hits; handled by the
  daily cache-buster + `allSettled` + Natural Earth fallbacks (`live: false` → the panel says "estimate").
* **`useWorld` lives in `tech/world.js`**, not `TechView.jsx`, to avoid a circular import with the slides.
* **Rotating SVG groups with framer**: CSS `style={{ rotate }}` on a `motion.g` rotates around the *viewBox*
  origin (gears orbit instead of spinning), and a MotionValue passed to `motion.g`'s `transform` **prop** is
  not reliably applied as an SVG attribute (gears went fully static). The robust way is imperative: keep a
  `<g>` ref and `useMotionValueEvent(drive, 'change', d => el.setAttribute('transform', \`rotate(${…})\`))`
  inside a plain `<g transform="translate(x y)">` — `rotate()` then spins around the gear's own centre.
* **Panning a tall SVG**: percentage `y` is relative to the element's own height — compute the pan in px from
  the rendered width × viewBox aspect (see `Gears.jsx` › `trainY`).
* **R3F camera roll**: `camera.lookAt()` resets roll every frame; set `camera.rotation.z` *after* it.
* **react-globe.gl needs `waitForGlobeReady={false}` when there is no texture**: the default `true` keeps
  `scene.visible = false` in *two* places — the three-globe group (until `globeLayer.onReady` fires) and the
  three-render-objects scene (until `finishLoad`, which only runs on a `backgroundImageUrl` change). With a
  procedural `globeMaterial` and no image props there is nothing to wait for, so the flag must be `false`.
  Symptom otherwise: canvas exists, context is fine, zero pixels — `window.scene.children` is your check.
* **With `waitForGlobeReady={false}`, `onGlobeReady` does NOT fire** — it runs during `new ThreeGlobe()`
  construction, before react-kapsule forwards the prop. Do globe setup (controls, `pointOfView`,
  `resumeAnimation`, lifecycle `register`) once per instance in an effect keyed on the lifecycle key,
  guarded by a ref (see `JobsGlobe.jsx` › `onReady` / `initedFor`).
* **`<StrictMode>` is removed** (`main.jsx`): its simulated unmount runs react-kapsule's `comp._destructor()`
  → `emptyObject(state.scene)` + `renderer.dispose()` on the *same* mounted globe → permanently blank canvas
  in dev (prod unaffected). Verified: production build renders the globe, dev with StrictMode doesn't.
  Don't re-add StrictMode without re-testing both globes.
* **`useGlobeLifecycle`** (`src/components/useGlobeLifecycle.js`) registers each globe's renderer on ready,
  pauses/resumes with visibility, and on unmount `forceContextLoss()`es the WebGL context (globe.gl only
  calls `renderer.dispose()`, leaving the context alive; Chrome caps ~16 contexts and silently kills the
  oldest canvases on repeated view switches). On a real `webglcontextlost` it bumps `key` to remount.
* **drei `<Html>` caused the intermittent `NotFoundError: removeChild` crash** that could blank the whole
  page: it mounts a React portal into the canvas parent, and React 19's unmount order races drei's own DOM
  removal. Moon marker labels are now plain DOM elements positioned every frame by `LabelProjector`
  (`MoonScene.jsx`) — project marker → screen px, hide when facing away. Avoid `<Html>` entirely.
* **`ErrorBoundary`** (`src/components/ErrorBoundary.jsx`) wraps the active view in `App.jsx` keyed by view,
  so a WebGL/third-party crash shows a fallback instead of unmounting the whole site.
* Console noise that is expected in dev: framer's "container has a non-static position" (fires while
  Suspense hides the tree), drei/React 19 "Attempted to synchronously unmount a root", `THREE.Clock`
  deprecation from drei. None affect the build.
* Flags are **images, not emoji** — Windows has no flag emoji font. `Earth.jsx` › `Flag` uses
  `flagcdn.com` (the open-source `flag-icons` set) at `w80`/`w160`, with a `◍` fallback glyph via `onError`.
  Add country flags anywhere else through the same component.

---

## 11. Verification checklist

```bash
npm run lint && npm run build
npm run dev   # then check:
#  /            Design view unchanged (hero, pinned perspective tunnel, footer)
#  /?view=tech  stars + comets move while idle; Evolution rail; globe loads (hex dots) and the panel shows
#               "World Bank · <year>"; click a country → fly-to + arcs + company; Money ring draws;
#               chart bars animate; dot matrix lights; population clock ticks; Moon phase sweeps with scroll,
#               drag orbits, click drops a marker; footer; switcher returns to Design and resets scroll.
#  /?view=experimental  vortex tunnel flies to FUTURE; jobs globe renders hex dots + pins, click → panel;
#               gears visibly rotate AND pan down on scroll; fog thickens then parts to EMERGE.
#               Also cycle Design → Tech → Experimental a few times: no console exceptions, globe alive.
```

For a quick headless pass, Chrome's DevTools protocol can be driven from Node 22 (built-in `WebSocket`):
launch `chrome --headless=new --remote-debugging-port=9333`, `Page.navigate`, `Runtime.evaluate(scrollTo)`,
`Page.captureScreenshot`, and collect `Runtime.consoleAPICalled`/`exceptionThrown` to catch shader
compile errors — that is how the `modelMatrix` and `.pop` bugs above were found.

---

## 12. Prompt template for future AI changes

> "This repo is the two-view portfolio described in DOCUMENTATION.md. Change **<view> › <slide id>**:
> <what>. Keep the existing progress keyframe style (`useTransform(p, …)`), the slide's BEM block,
> idle + scroll animation, reduced-motion respect, and update DOCUMENTATION.md §5/§6 and `src/views.js`
> if ids or chapters change. Run `npm run lint && npm run build` before finishing."
