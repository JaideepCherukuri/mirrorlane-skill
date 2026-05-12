# Mirrorlane Clone Website Rule (Amazon Q)

Apply these instructions when rebuilding a website from Mirrorlane artifacts.

# Clone Website

You are about to rebuild **$ARGUMENTS** as pixel-perfect website clones. When
multiple URLs are provided, process them independently and in parallel where
possible while keeping every site's Mirrorlane output, research notes, design
references, and clone code isolated in dedicated folders.

This is not a two-phase "inspect, then maybe build" process. As soon as you
extract enough exact information for a section, write the spec, dispatch the
right builder, and keep extracting the next section.

You are the foreman walking the job site: Mirrorlane gives you the clean source
artifact and hosted preview; you inspect, specify, delegate, merge, and verify
until the clone actually matches.

## Scope Defaults

The target is whatever page `$ARGUMENTS` resolves to. Clone exactly what is
visible at that URL unless the user gives a different scope.

Defaults:

- **Fidelity level:** Pixel-perfect: colors, spacing, typography, responsive
  layout, animations, interaction timing, and real content should match.
- **In scope:** Visual layout, styling, component structure, interactions,
  responsive behavior, and mock data where real backend data is unavailable.
- **Out of scope:** Real backend, databases, authentication, real-time systems,
  SEO optimization, and full accessibility audits unless the user asks.
- **Customization:** None. Preserve the target site's look and behavior.

User instructions override these defaults.

## Pre-Flight

1. **Browser automation is required.** Use the best available browser tool
   (Chrome MCP, Playwright MCP, Browserbase MCP, Puppeteer MCP, Codex browser,
   or equivalent). If none is available, ask the user how to connect one.
2. Parse `$ARGUMENTS` as one or more URLs. Normalize and validate each URL
   before continuing.
3. Verify Mirrorlane authentication:

```bash
mirrorlane doctor --json
```

4. For each URL, run Mirrorlane capture and wait for completion:

```bash
mirrorlane capture <target-url> --wait --timeout 1200 --poll-interval 3 --json
```

5. Download the reference package:

```bash
mirrorlane reference <job-id> --out docs/mirrorlane/<hostname> --json
```

6. Extract the clean ZIP into `docs/mirrorlane/<hostname>/clean/`. The folder
   should contain `mirrorlane-reference.json` and a `*-clean.zip`.
7. Verify the base Next.js project builds:

```bash
npm run build
```

8. Create the working directories if missing:
   `docs/research/`, `docs/research/components/`,
   `docs/design-references/`, `scripts/`, `public/`.
9. For multiple URLs, prepare per-site folders such as
   `docs/research/<hostname>/`, `docs/design-references/<hostname>/`, and
   `docs/mirrorlane/<hostname>/`.

## Guiding Principles

### 0. Mirrorlane Preview Is The Parity Oracle

The Mirrorlane hosted preview should already be close to the live site. Before
building, measure live vs hosted preview screenshots. If live vs hosted preview
is above 1% mismatch, document that capture limitation first. If hosted preview
is under 1%, the generated Next.js clone must target the same threshold.

Do not accept "close by eye." Use image diff numbers. The success gate is:

- hosted preview vs live: record the baseline
- local Next.js clone vs hosted preview: `<1%` mismatch
- local Next.js clone vs live: `<1%` mismatch unless the hosted preview
  baseline itself is above that threshold

### 1. Artifact-First Reconstruction

The clean ZIP is not mood-board material. Treat it as the source of exact
truth for DOM hierarchy, CSS, fonts, media, SVGs, image crops, script-driven
states, and route behavior. Start by mapping the clean ZIP's `site/`,
`vendor/`, `data/`, and `metadata/url-map.json` into the Next.js project.

The first implementation goal is a loss-minimized reconstruction of the first
viewport using the captured DOM/CSS/assets. Only after the first viewport
passes the `<1%` diff gate should you refactor that viewport into cleaner
components. Refactor in small steps and rerun the diff after each step so
componentization never destroys fidelity.

Componentized does not mean hand-redesigned. Good components preserve the
original DOM shape, CSS values, asset layering, and behavior while moving them
into maintainable React files and typed content modules.

### 2. Exact Port Before Interpretation

For high-fidelity sites, the first React implementation should look like a
careful port, not a redesign. Convert the captured section DOM into JSX with
the same wrapper depth, class names, inline SVGs, absolute layers,
pseudo-element hooks, ARIA attributes, and asset ordering. Import or port the
original CSS cascade that applies to that DOM slice, including media queries,
variables, keyframes, and `::before`/`::after` styles.

Port the **used CSS slice**, not the entire site stylesheet. Full stylesheet
dumps from WordPress/Webflow/Framer/Elementor sites often apply later-page
rules, stale experiment rules, broad mobile overrides, or unrelated global
resets that shift the first viewport. Start from the selectors that match the
captured DOM slice plus required global tokens/font-face/keyframes. If a broad
CSS import worsens the diff, treat that as CSS over-application and reduce the
stylesheet to the matched first-viewport rules.

Only after the exact port is under 1% mismatch may you improve maintainability:
split the JSX into named components, move repeated text into typed content,
rename local assets, and remove dead classes. After every cleanup step, rerun
the diff. If a cleanup increases mismatch beyond 1%, revert or refine that
cleanup.

Do not summarize a WordPress, Webflow, Framer, Elementor, Vite, or custom
runtime page into a simplified handcrafted hero. That is the most common reason
agents fail this task.

### 3. Completeness Beats Speed

Every builder must receive everything needed to build perfectly: screenshot,
computed CSS values, local asset paths, real text, component structure, states,
and behavior notes. If a builder has to guess a color, padding value, image, or
trigger condition, extraction was incomplete.

### 4. Small Tasks, Perfect Results

Break complex sections into focused component jobs. A simple banner can go to
one builder; a section with several card types, hover states, and responsive
layouts should be split into card builders plus a wrapper builder. If a builder
prompt grows past about 150 lines of spec content, split the task.

### 5. Real Content, Real Assets

Use real text, images, videos, SVGs, and fonts from the Mirrorlane clean ZIP and
live page inspection. Do not replace captured content with generic copy. Watch
for layered compositions: one visual block may include a background image,
foreground UI image, overlay icons, gradients, videos, and inline SVGs.

### 6. Foundation First

Do not build sections before the foundation exists: fonts, design tokens,
global CSS, metadata, asset conventions, TypeScript content types, and shared
icons. This foundation is sequential work. Everything after it can be parallel.

### 7. Extract Looks And Behavior

Websites are not still images. Extract computed appearance and behavior:
scroll effects, hover states, click states, sticky headers, tab changes,
carousels, timed transitions, smooth scrolling, parallax, reveal animations,
modals, accordions, and responsive layout changes.

For every behavior, document the trigger, before state, after state, transition
duration, easing, and implementation model.

### 8. Identify The Interaction Model Before Building

Before writing a spec for an interactive section, decide whether it is driven by
scroll, clicks, hover, time, media playback, or a combination. Scroll slowly
first. If the section changes while scrolling, document the scroll mechanism
before trying clicks. Do not build click-driven tabs when the original is
scroll-driven, or vice versa.

### 9. Extract Every State

Default state is not enough. For tabs, pills, accordions, menus, cards,
headers, and forms, capture every state. For scroll-dependent elements, capture
computed styles before and after the trigger. For hover states, capture both
states and the transition.

### 10. Spec Files Are The Source Of Truth

Every component gets a spec file in `docs/research/components/` before any
builder is dispatched. The builder receives the spec content inline in the
prompt. The spec file persists as an audit trail.

### 11. Build Must Always Compile

Every builder verifies `npx tsc --noEmit` before finishing. After merging
builders, verify `npm run build`. Broken builds are not acceptable stopping
points.

## Phase 1: Reconnaissance

Use both the live site and Mirrorlane hosted preview from
`docs/mirrorlane/<hostname>/mirrorlane-reference.json`. Use the clean ZIP as the
primary local source for assets.

### Baseline Parity Gate

Before writing clone code, capture live and hosted-preview screenshots at the
required viewports and compute diff percentages.

Use the bundled helper scripts if this skill repo is available:

```bash
npm install -D playwright pixelmatch pngjs
node skill/clone-website/scripts/capture-viewports.mjs <live-url> docs/design-references/<hostname>/live
node skill/clone-website/scripts/capture-viewports.mjs <hosted-preview-url> docs/design-references/<hostname>/hosted
node skill/clone-website/scripts/pixel-diff.mjs docs/design-references/<hostname>/hosted/desktop.png docs/design-references/<hostname>/live/desktop.png docs/design-references/<hostname>/diffs/hosted-live-desktop.png
```

Repeat for tablet and mobile. Save the JSON output in
`docs/research/<hostname>/PARITY_BASELINE.md`.

If hosted preview is below 1% mismatch but the local clone is not, the root
cause is in the clone workflow, not Mirrorlane capture.

If hosted preview renders an auth/login page, dashboard shell, error page, or
anything other than the target website, mark hosted preview as `invalid` for
visual parity and use the clean ZIP local replay as the artifact oracle. Do not
compare a login page to the clone.

### Screenshots

Take full-page screenshots at:

- Desktop: 1440px wide
- Tablet: 768px wide
- Mobile: 390px wide

Save them to `docs/design-references/<hostname>/` with clear names for live
site, hosted preview, and later local clone comparisons.

### Global Extraction

Before building sections, extract and document:

- **Fonts:** families, weights, styles, source, and computed usage.
- **Colors:** computed color palette across body, headings, CTAs, sections,
  cards, borders, shadows, and gradients.
- **Favicons and metadata:** copy from the clean ZIP or download from the live
  site into `public/seo/`.
- **Global UI patterns:** page background, scroll behavior, sticky elements,
  custom scrollbars, keyframes, smooth scroll libraries, global overlays.
- **Mirrorlane routes:** summarize important routes from
  `mirrorlane-reference.json`.
- **Asset inventory:** map important clean-ZIP assets to local `public/` paths.

### Mandatory Interaction Sweep

Run this pass before component specs:

- **Scroll sweep:** slowly scroll top to bottom. Record sticky header changes,
  reveal animations, scroll-driven tabs, parallax, snap points, and thresholds.
- **Click sweep:** click buttons, nav items, tabs, pills, cards, menus, and
  dialogs. Record content changes and animations.
- **Hover sweep:** hover links, cards, images, and buttons. Record color,
  transform, shadow, underline, and opacity changes.
- **Responsive sweep:** repeat at 1440, 768, and 390 widths.

Save this to `docs/research/<hostname>/BEHAVIORS.md`.

### Page Topology

Map every distinct section from top to bottom:

- Visual order
- Fixed/sticky overlays
- Section boundaries
- Layout model
- Interaction model
- Dependencies between sections

Save this to `docs/research/<hostname>/PAGE_TOPOLOGY.md`.

## Phase 2: Foundation Build

Do this yourself before dispatching builders:

1. Read `docs/mirrorlane/<hostname>/clean/metadata/url-map.json` and identify
   all first-viewport HTML, CSS, JS, fonts, images, SVGs, videos, and background
   assets.
2. Copy first-viewport assets from the clean ZIP into `public/<hostname>/`
   without renaming away meaning.
3. Port the original CSS values, variables, font faces, and keyframes before
   writing JSX. The clone should inherit measured values, not approximate them.
4. Configure fonts in `app/layout.tsx` using `next/font/google`,
   `next/font/local`, or CSS `@font-face` from local assets.
5. Update `app/globals.css` with real tokens, background styles, keyframes,
   page-level behavior, and utility classes.
6. Create TypeScript content types in `types/` or `lib/content.ts`.
7. Extract reusable inline SVGs into named React components.
8. Copy needed images, videos, fonts, and icons from
   `docs/mirrorlane/<hostname>/clean/` into `public/` with understandable
   paths.
9. Verify:

```bash
npm run build
```

Do not proceed to lower-page sections until the above-the-fold local clone
passes the parity gate against hosted preview or has a written root-cause report
with exact blockers.

## Phase 2.5: First Viewport Exact Port

For the first viewport, do not start with a fresh design-system hero. First,
port the captured DOM/CSS exactly enough to pass the diff gate.

1. Open `docs/mirrorlane/<hostname>/clean/site/index.html` or the relevant
   clean route HTML.
2. Identify all DOM nodes visible in the first viewport, including fixed
   headers, overlays, chat buttons, cookie banners, hidden menu scaffolding,
   background layers, decorative wrappers, and SVG definitions.
3. Copy that DOM slice into a draft file and convert it to JSX:
   - `class` -> `className`
   - `for` -> `htmlFor`
   - inline `style` -> React style object only when needed
   - preserve wrapper depth and class names
   - preserve data attributes used by CSS/JS state
4. Port every CSS rule that can affect that slice:
   - global variables
   - imported font faces
   - exact class selectors
   - descendant selectors
   - pseudo-elements
   - media queries
   - keyframes and animation defaults
   Avoid importing unrelated full-page CSS unless it has been proven not to
   move the first viewport. A smaller matched-rule stylesheet is usually more
   faithful than a full cascade dump.
5. Replace source URLs with local `public/` asset paths using
   `metadata/url-map.json`.
6. Build and diff against clean replay.
7. Only then split the JSX into named React components while keeping DOM output
   equivalent.

The component spec must include the source DOM selectors and source CSS files
used. A spec that only describes the appearance is insufficient for this phase.

## Asset Discovery Pattern

Use browser automation on the live site and hosted preview to discover visible
assets and states:

```javascript
JSON.stringify({
  images: [...document.querySelectorAll("img")].map((img) => ({
    src: img.currentSrc || img.src,
    alt: img.alt,
    width: img.naturalWidth,
    height: img.naturalHeight,
    parentClasses: img.parentElement?.className,
    siblingImages: img.parentElement
      ? [...img.parentElement.querySelectorAll("img")].length
      : 0,
    position: getComputedStyle(img).position,
    zIndex: getComputedStyle(img).zIndex,
  })),
  videos: [...document.querySelectorAll("video")].map((video) => ({
    src: video.src || video.querySelector("source")?.src,
    poster: video.poster,
    autoplay: video.autoplay,
    loop: video.loop,
    muted: video.muted,
  })),
  backgroundImages: [...document.querySelectorAll("*")]
    .filter((element) => {
      const background = getComputedStyle(element).backgroundImage;
      return background && background !== "none";
    })
    .map((element) => ({
      url: getComputedStyle(element).backgroundImage,
      element: element.tagName + "." + String(element.className).split(" ")[0],
    })),
  svgCount: document.querySelectorAll("svg").length,
  fonts: [
    ...new Set(
      [...document.querySelectorAll("*")]
        .slice(0, 200)
        .map((element) => getComputedStyle(element).fontFamily),
    ),
  ],
  favicons: [...document.querySelectorAll('link[rel*="icon"]')].map((link) => ({
    href: link.href,
    sizes: link.sizes?.toString(),
  })),
});
```

## Phase 3: Component Specification And Dispatch

For each section in page order, do three things: extract, write the spec file,
then dispatch builders.

### Step 1: Extract

For every section:

1. Capture a section screenshot and save it in
   `docs/design-references/<hostname>/`.
2. Extract computed CSS for the section container and important descendants.
3. Extract real text, alt text, aria labels, placeholders, and button labels.
4. Identify local assets from `public/` or clean-ZIP paths.
5. Capture every interactive state: hover, active, scrolled, opened, selected,
   loading, and mobile states.
6. Assess complexity and decide whether to split into sub-components.

Use a computed-style extraction snippet like this:

```javascript
(function (selector) {
  const element = document.querySelector(selector);
  if (!element) return JSON.stringify({ error: "Element not found: " + selector });
  const props = [
    "fontSize",
    "fontWeight",
    "fontFamily",
    "lineHeight",
    "letterSpacing",
    "color",
    "backgroundColor",
    "background",
    "padding",
    "margin",
    "width",
    "height",
    "maxWidth",
    "display",
    "flexDirection",
    "justifyContent",
    "alignItems",
    "gap",
    "gridTemplateColumns",
    "borderRadius",
    "border",
    "boxShadow",
    "overflow",
    "position",
    "top",
    "right",
    "bottom",
    "left",
    "zIndex",
    "opacity",
    "transform",
    "transition",
    "objectFit",
    "objectPosition",
    "filter",
    "backdropFilter",
  ];
  function styles(node) {
    const computed = getComputedStyle(node);
    return Object.fromEntries(
      props
        .map((prop) => [prop, computed[prop]])
        .filter(([, value]) => value && !["none", "normal", "auto", "0px"].includes(value)),
    );
  }
  function walk(node, depth = 0) {
    if (depth > 4) return null;
    const children = [...node.children];
    return {
      tag: node.tagName.toLowerCase(),
      classes: String(node.className || "").split(" ").slice(0, 8).join(" "),
      text:
        node.childNodes.length === 1 && node.childNodes[0].nodeType === 3
          ? node.textContent.trim().slice(0, 240)
          : null,
      styles: styles(node),
      image:
        node.tagName === "IMG"
          ? {
              src: node.src,
              alt: node.alt,
              naturalWidth: node.naturalWidth,
              naturalHeight: node.naturalHeight,
            }
          : null,
      childCount: children.length,
      children: children.slice(0, 24).map((child) => walk(child, depth + 1)).filter(Boolean),
    };
  }
  return JSON.stringify(walk(element), null, 2);
})("SELECTOR");
```

### Step 2: Write The Spec File

Create `docs/research/components/<hostname>-<section>.spec.md`.

Template:

```markdown
# <Section> Specification

## Overview

- **Target file:** `components/<Section>.tsx`
- **Screenshot:** `docs/design-references/<hostname>/<section>.png`
- **Interaction model:**

## DOM Structure

## Computed Styles

### Container

- display:
- padding:
- maxWidth:

### Key Elements

- exact styles from `getComputedStyle()`

## States And Behaviors

- **Trigger:**
- **State A:**
- **State B:**
- **Transition:**
- **Implementation approach:**

## Per-State Content

## Assets

- local paths under `public/`

## Text Content

Verbatim copy.

## Responsive Behavior

- **Desktop 1440px:**
- **Tablet 768px:**
- **Mobile 390px:**
- **Breakpoint:**
```

Fill every section. If a field truly does not apply, write `N/A` after checking.

### Step 3: Dispatch Builders

Dispatch builder agents based on complexity:

- **Simple section:** one builder owns the section.
- **Complex section:** split into sub-components, then a wrapper.

Every builder prompt must include:

- Full spec content inline
- Screenshot path
- Exact target file path
- Shared imports/components to use
- Local asset paths
- Responsive requirements
- `npx tsc --noEmit` verification requirement

Do not wait for one builder to finish before extracting the next section.

### Step 4: Merge

As builders finish:

- Review their changes
- Merge intelligently
- Run `npm run build`
- Fix type errors immediately

Continue extract -> spec -> dispatch -> merge until all sections are built.

## Phase 4: Page Assembly

Wire all sections into `app/page.tsx`:

- Import all section components
- Apply the topology map
- Connect structured content to props
- Implement page-level scroll, sticky, animation, and theme behavior
- Verify `npm run build`

## Phase 5: Visual QA Diff

Do not declare completion after build.

Take same-viewport screenshots of the live site, Mirrorlane hosted preview, and
local clone:

- 1440 x 900
- 768 x 900
- 390 x 844

Compare section by section:

- Layout proportions
- Typography size, weight, line-height, and wrapping
- Asset selection, crop, object position, and loading behavior
- Colors, shadows, borders, gradients, and background layers
- Sticky behavior, scroll reveals, hover/focus states, tabs, menus, dialogs

For every discrepancy:

1. Check whether the component spec was wrong.
2. If the spec was wrong, re-extract and update it.
3. If implementation was wrong, patch the component.
4. Rebuild and retake screenshots.

Repeat until the clone is pixel-matched or remaining differences are explicitly
documented with evidence.

### Root-Cause Loop For >1% Mismatch

If any viewport exceeds 1% mismatch, stop adding new sections and diagnose.
Create `docs/research/<hostname>/PARITY_ROOT_CAUSES.md` with this table:

| Symptom | Evidence | Likely root cause | Fix | Retest result |
| --- | --- | --- | --- | --- |

Check these causes in order:

1. **Asset path loss:** image/video/font exists in clean ZIP but was not copied
   or mapped into `public/`.
2. **CSS loss:** original CSS file, variable, keyframe, media query, or pseudo
   element was not ported.
3. **CSS over-application:** too much of the source cascade was imported,
   causing unrelated section rules, broad mobile overrides, or stale theme
   defaults to move the first viewport.
4. **DOM-shape loss:** JSX simplified a wrapper, overlay, mask, absolute layer,
   or stacking context that affects layout.
5. **Font mismatch:** wrong family, weight, fallback, loading mode, or local
   font source.
6. **Viewport state mismatch:** screenshot was taken at a different scroll
   position, cookie/banner state, animation frame, or loaded state.
7. **Runtime behavior loss:** carousel, scroll animation, sticky state, tab,
   menu, shader/canvas, or video behavior was not rebuilt.
8. **Responsive breakpoint loss:** media queries were guessed instead of
   extracted.
9. **Third-party dependency loss:** a visible script-generated element was
   ignored instead of recreated as local React behavior.

Patch the highest-impact root cause first, then rerun the same screenshot diff.
Do not continue broad implementation while the first viewport is failing.

## Pre-Dispatch Checklist

Before dispatching a builder, verify:

- [ ] Spec file exists and is complete.
- [ ] CSS values came from computed styles, not guesses.
- [ ] Interaction model is documented.
- [ ] Every state was extracted.
- [ ] Scroll triggers and transitions are documented.
- [ ] Hover states are documented.
- [ ] Layered assets are identified.
- [ ] Responsive behavior is documented.
- [ ] Text is verbatim.
- [ ] Builder prompt is small enough for focused execution.

## What Not To Do

- Do not build click behavior when the original is scroll-driven.
- Do not extract only the default state.
- Do not miss overlay or layered images.
- Do not replace videos, canvases, or animations with fake static mockups.
- Do not paste a captured HTML document as the finished clone; build
  maintainable components that reproduce the original.
- Do not approximate CSS values.
- Do not build the whole site in one monolithic component.
- Do not tell builders to "go read docs"; give them the spec inline.
- Do not skip real asset extraction from the Mirrorlane clean ZIP.
- Do not give builders unrelated sections.
- Do not skip responsive extraction.
- Do not forget smooth scroll libraries.
- Do not dispatch builders without a spec file.

## Completion

Report:

- Target URL and Mirrorlane job id
- Total sections built
- Total components created
- Total spec files written
- Total assets copied from the Mirrorlane clean ZIP
- Build and typecheck status
- Screenshot comparison paths
- Visual QA results and remaining discrepancies
