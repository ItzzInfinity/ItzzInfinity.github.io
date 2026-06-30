# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A cross-platform web application that doubles as a personal portfolio website and a dynamic resume generator. The user maintains a single pool of profile data and maps content to domains (VLSI / RTL Design / Verification / FPGA Design / Embedded / PCB Design). The Download page assembles a one-page PDF resume filtered to the selected domain, trimming lower-priority bullets when content overflows. It deploys as a static site to GitHub Pages (`ItzzInfinity.github.io`, served at the domain root).

See `FSD.md` for the full Functional Specification. The "What I need" section there is the live work backlog.

## Node is not on PATH by default

Node was installed via nvm. Every shell that runs npm/npx/tsx must load it first:

```bash
export NVM_DIR="$HOME/.nvm" && source "$NVM_DIR/nvm.sh" && nvm use 20
```

`./dev.sh` wraps this for the dev server.

## Tech Stack

- **Next.js 14** (App Router, TypeScript), static-exported (`output: 'export'`) for GitHub Pages
- **Tailwind CSS** — responsive styling
- **Zustand** — global state for the entire data model (persisted to `localStorage`)
- **@react-pdf/renderer** — generates the *downloaded* resume as a true vector PDF (this is the layout that must match `template.pdf`)
- **PyMuPDF** (Python) — the `scripts/` PDF text + hyperlink extraction tooling
- html2canvas + jspdf and @dnd-kit are installed but currently unused (legacy/planned).

## Commands

```bash
# --- Web app (load nvm first, see above) ---
npm install
npm run dev                  # dev server at localhost:3000
npm run build                # static export to ./out  (what GitHub Pages serves)
npx tsc --noEmit             # type-check
npm run lint
npm test                     # jest
npx jest path/to/file.test.ts

# Render the real ResumeDocument to a PDF for visual QA (no browser needed):
npx tsx scripts/render-sample.tsx [domainId]   # -> parsed/sample-resume.pdf

# --- PDF extraction tooling (Python 3, PyMuPDF) ---
pip install -r scripts/requirements.txt
python3 scripts/extract_resumes.py [SRC_DIR] [OUT_DIR]   # -> parsed/<name>.json (text + hyperlinks)
python3 scripts/extract_template.py [template.pdf]       # -> parsed/template_spec.json (fonts/sizes/rules)
```

`parsed/` is git-ignored (contains personal data; regenerate locally).

## Architecture

### Routes (`src/app/`)

`/` `/about` `/vlsi` `/embedded` `/pcb` are public. `/settings` (hidden, easter-egg access only) and `/download` must never appear in the public nav (`src/components/layout/Navbar.tsx`).

### State (`src/store/useResumeStore.ts`)

One Zustand store holds the whole data model (`profile`, `domains`, `skills`, `experience`, `education`, `projects`, `certifications`, `awards`, `languages`, `hobbies`, `strengths`, `references`), persisted to `localStorage` under `resume-builder-v2` via `src/lib/storage.ts` (abstracted so it can later become a remote API). `loadData` merges saved data over the seed so new fields are never missing; **bump the `STORAGE_KEY` version whenever the seed shape/content changes** or clients keep stale data. `src/lib/seed.ts` holds the real profile data for Anjan Prasad (merged from `~/Downloads/all_resumes/master_profile.json` + `template.pdf`; project source links come from github.com/ItzzInfinity repos). Each `Domain` carries an optional `resumeTitle` shown under the name when that domain is selected.

### Domain filtering (`src/lib/filter.ts`)

Every entity except `profile`/`education` carries `domainIds: string[]`. `filterByDomain` and `filterBulletsByDomain` (the latter also sorts by ascending `priority`) are shared by portfolio pages, the preview, and the PDF.

### Two resume renderers — keep them in sync

- **`src/components/resume/ResumePreview.tsx`** — HTML/CSS, used for the on-screen preview **and** for one-page overflow measurement. Rendered at true A4 px (`794×1123`, A4 @96dpi); `singlePage` prop toggles the `maxHeight`/`overflow:hidden` clip (off in 2-page mode so it grows). The on-screen scaling is a CSS `transform` so it doesn't affect measurement. `headerTitle` overrides `profile.title` (per-domain titles).
- **`src/components/resume/ResumeDocument.tsx`** — `@react-pdf/renderer` vector document, the actual **download**. Layout mirrors `template.pdf` per `parsed/template_spec.json` (A4, 20pt bold name, bold uppercase section headings with hairline rules, two-column skills/projects, right-aligned dates, clickable email/LinkedIn/GitHub/Source links). Uses built-in **Helvetica** (Inter has no reliable static TTF to bundle; Helvetica is visually near-identical and avoids runtime font fetches in the static export).

**Project bullets use conditional columns** (`bulletsUseTwoCols`, duplicated in both files and kept in sync via `SHORT_BULLET_MAX`): two columns only when a project has ≥3 bullets that are all short (label-style like `HDL: Verilog`); long descriptive bullets render full width so a single line never wraps. This rule MUST be identical in both renderers — when they diverged (preview single-column, PDF two-column) the preview under-measured height and the downloaded PDF silently overflowed to a 2nd page.

Both are pure prop-driven components and receive the same filtered data + `hiddenBulletIds`, so the downloaded PDF matches what auto-fit decided on screen. `scripts/render-sample.tsx` imports the same `ResumeDocument` so QA reflects production output exactly.

### Auto-fit & page mode (`src/app/download/page.tsx` + `src/lib/autofit.ts`)

The Download page domain selector lists top-level domains with their sub-domains indented as radios (VLSI → RTL / Verification / FPGA); `selectedDomain` can be any domain id and all filtering/title logic keys off it. The page also has a 1-page / 2-page toggle (`pageMode`). **2-page mode** disables trimming and lets react-pdf paginate automatically (the HTML preview is unclipped). **1-page mode** runs the convergent auto-fit loop — **not** rAF/timeout (the earlier rAF version caused a runaway re-render loop that broke navigation away from `/download`):

1. `removableOrder` = all domain bullet ids sorted lowest-priority-first (highest `priority` number first).
2. A `useLayoutEffect` keyed on `[fitting, hiddenBulletIds.length, removableOrder]` measures `isOverflowing(previewRef)`; if overflowing and bullets remain, it hides one more (`slice(0, len+1)`), which re-renders and re-measures.
3. When it fits or `removableOrder` is exhausted, it sets `fitting=false`, and sets `overflowed` if it still overflows — which surfaces a banner suggesting the 2-page layout. A separate effect resets the pass when domain/customText/pageMode/content changes.

When editing this loop, preserve termination: never make the layout effect depend on values it also mutates without bounding them.

### PDF download flow

Download handler dynamically imports `@react-pdf/renderer` + `ResumeDocument`, builds the element via `React.createElement` (cast to `ReactElement<DocumentProps>` — the renderer accepts a component returning `<Document>` at runtime even though the types want a `Document` element), calls `pdf(element).toBlob()`, and triggers a one-click download.

## Deployment

`.github/workflows/deploy.yml` runs `npm ci && npm run build` and publishes `./out` to GitHub Pages on push to `main`. `public/.nojekyll` keeps Pages from stripping `_next/`. `trailingSlash: true` emits `/route/index.html` so nested routes resolve without a server. No `basePath` (user-site repo serves at root).

## Key Constraints

- Resume defaults to one page (A4) via auto-fit; users can opt into a 2-page layout. `ResumeDocument` layout fidelity is judged against `template.pdf`.
- `/settings` and `/download` are private — **no public links anywhere** (the home page Download button was deliberately removed; reach them by typing the path).
- Project headings show a `Source` link on the right.
- Bullet priority is user-editable: lower number = higher priority = kept longer when trimming.
