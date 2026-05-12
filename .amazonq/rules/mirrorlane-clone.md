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

### 1. Completeness Beats Speed

Every builder must receive everything needed to build perfectly: screenshot,
computed CSS values, local asset paths, real text, component structure, states,
and behavior notes. If a builder has to guess a color, padding value, image, or
trigger condition, extraction was incomplete.

### 2. Small Tasks, Perfect Results

Break complex sections into focused component jobs. A simple banner can go to
one builder; a section with several card types, hover states, and responsive
layouts should be split into card builders plus a wrapper builder. If a builder
prompt grows past about 150 lines of spec content, split the task.

### 3. Real Content, Real Assets

Use real text, images, videos, SVGs, and fonts from the Mirrorlane clean ZIP and
live page inspection. Do not replace captured content with generic copy. Watch
for layered compositions: one visual block may include a background image,
foreground UI image, overlay icons, gradients, videos, and inline SVGs.

### 4. Foundation First

Do not build sections before the foundation exists: fonts, design tokens,
global CSS, metadata, asset conventions, TypeScript content types, and shared
icons. This foundation is sequential work. Everything after it can be parallel.

### 5. Extract Looks And Behavior

Websites are not still images. Extract computed appearance and behavior:
scroll effects, hover states, click states, sticky headers, tab changes,
carousels, timed transitions, smooth scrolling, parallax, reveal animations,
modals, accordions, and responsive layout changes.

For every behavior, document the trigger, before state, after state, transition
duration, easing, and implementation model.

### 6. Identify The Interaction Model Before Building

Before writing a spec for an interactive section, decide whether it is driven by
scroll, clicks, hover, time, media playback, or a combination. Scroll slowly
first. If the section changes while scrolling, document the scroll mechanism
before trying clicks. Do not build click-driven tabs when the original is
scroll-driven, or vice versa.

### 7. Extract Every State

Default state is not enough. For tabs, pills, accordions, menus, cards,
headers, and forms, capture every state. For scroll-dependent elements, capture
computed styles before and after the trigger. For hover states, capture both
states and the transition.

### 8. Spec Files Are The Source Of Truth

Every component gets a spec file in `docs/research/components/` before any
builder is dispatched. The builder receives the spec content inline in the
prompt. The spec file persists as an audit trail.

### 9. Build Must Always Compile

Every builder verifies `npx tsc --noEmit` before finishing. After merging
builders, verify `npm run build`. Broken builds are not acceptable stopping
points.

## Phase 1: Reconnaissance

Use both the live site and Mirrorlane hosted preview from
`docs/mirrorlane/<hostname>/mirrorlane-reference.json`. Use the clean ZIP as the
primary local source for assets.

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

1. Configure fonts in `app/layout.tsx` using `next/font/google`,
   `next/font/local`, or CSS `@font-face` from local assets.
2. Update `app/globals.css` with real tokens, background styles, keyframes,
   page-level behavior, and utility classes.
3. Create TypeScript content types in `types/` or `lib/content.ts`.
4. Extract reusable inline SVGs into named React components.
5. Copy needed images, videos, fonts, and icons from
   `docs/mirrorlane/<hostname>/clean/` into `public/` with understandable
   paths.
6. Verify:

```bash
npm run build
```

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
