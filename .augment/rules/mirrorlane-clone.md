# Mirrorlane Clone Website Rule (Augment)

Apply these instructions when rebuilding a website from Mirrorlane artifacts.

# Mirrorlane Website Clone Workflow

Use Mirrorlane as the capture system of record. Do not reimplement crawling,
asset capture, hosted preview generation, network interception, or ZIP
generation. Your job is to turn the approved Mirrorlane artifacts into
maintainable application code.

## Hard Rules

- Use `mirrorlane doctor` before capture work.
- Use `mirrorlane capture <url> --wait` to create the reference.
- Use `mirrorlane reference <job-id> --out <dir>` to download the sanitized
  reference package and clean ZIP.
- Treat the clean ZIP as the primary artifact. Treat the live site and hosted
  preview URLs as validation references.
- Never claim completion until the generated app builds and desktop/mobile
  screenshots have been compared against the reference.
- Do not paste a captured HTML document as the final implementation. Build
  reusable components, tokens, layout primitives, and data structures.
- Do not ask Mirrorlane to expose raw manifests, worker logs, queue payloads,
  storage paths, or capture internals.

## Preflight

1. Verify authentication:

```bash
mirrorlane doctor --json
```

2. Create a workspace per target host:

```bash
mkdir -p clones/<hostname>
```

3. Start from the repo's existing app if one exists. Otherwise copy or create a
Next.js/Tailwind starter app.

## Capture

Run:

```bash
mirrorlane capture <target-url> --wait --timeout 1200 --poll-interval 3 --json
```

Then run:

```bash
mirrorlane reference <job-id> --out references/<hostname> --json
```

The reference folder should contain `mirrorlane-reference.json` and a clean ZIP.
Extract the clean ZIP into `references/<hostname>/clean/`.

## Study The Reference

Read `mirrorlane-reference.json` first. Build a short implementation brief:

- routes and viewport targets
- global typography, colors, spacing, radii, shadows, motion
- asset families: images, icons, fonts, media
- repeated sections and components
- scroll behavior, sticky elements, menus, dialogs, forms, hover states
- likely dynamic or animated behaviors

Use browser tools to inspect the hosted preview URL and the live site when the
ZIP does not answer a visual or interaction question.

## Build Plan

Create a component plan before editing:

- `app/page.tsx` and route-level files
- `components/layout/*` for shell, nav, footer, section frames
- `components/sections/*` for major page sections
- `components/ui/*` for buttons, cards, badges, media, menus
- `lib/content.ts` or equivalent for structured content
- `app/globals.css` for tokens, font loading, base styling, and animations

Prefer real assets from the clean ZIP. Keep filenames understandable. Do not
hotlink the source site unless the user explicitly asks and has rights.

## Implementation Loop

1. Build the shell, typography, asset pipeline, and first viewport.
2. Implement sections in page order.
3. Add responsive states for desktop, tablet, and mobile.
4. Add interaction states: hover, focus, menus, accordions, sliders, video, and
   scroll effects visible in the reference.
5. Run:

```bash
npm run lint
npm run typecheck
npm run build
```

If the project does not define all three scripts, run the closest available
checks and add missing scripts when appropriate.

## Visual QA Loop

Take screenshots of both the generated app and the reference at minimum:

- 1440 x 900
- 1024 x 900
- 390 x 844

Compare:

- layout proportions and section order
- typography size, weight, line-height, and wrapping
- asset selection, crop, object position, and loading behavior
- spacing, borders, shadows, gradients, and color contrast
- sticky navigation, scroll reveals, hover/focus states, dialogs, and menus

For each mismatch, patch the relevant component or token, rebuild, and retake
screenshots. Repeat until differences are either fixed or explicitly documented
as blocked by unavailable private functionality.

## Completion Report

Finish with:

- target URL and Mirrorlane job id
- local reference folder and clean ZIP path
- build/check commands run
- screenshot paths
- known remaining differences
- files changed

Do not report pixel parity without evidence.
