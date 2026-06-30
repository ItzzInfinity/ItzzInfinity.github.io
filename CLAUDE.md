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

One Zustand store holds the whole data model (`profile`, `domains`, `skills`, `experience`, `education`, `projects`, `certifications`, `awards`, `languages`, `hobbies`, `references`), persisted to `localStorage` under `resume-builder-v1` via `src/lib/storage.ts` (abstracted so it can later become a remote API). Seed/placeholder data is `src/lib/seed.ts`; the canonical real profile lives in `~/Downloads/all_resumes/master_profile.json` and is hand-merged into the seed.

### Domain filtering (`src/lib/filter.ts`)

Every entity except `profile`/`education` carries `domainIds: string[]`. `filterByDomain` and `filterBulletsByDomain` (the latter also sorts by ascending `priority`) are shared by portfolio pages, the preview, and the PDF.

### Two resume renderers — keep them in sync

- **`src/components/resume/ResumePreview.tsx`** — HTML/CSS, used for the on-screen preview **and** for one-page overflow measurement. Rendered at true A4 px (`794×1123`, A4 @96dpi) with `overflow:hidden`; the on-screen scaling is a CSS `transform` so it doesn't affect measurement.
- **`src/components/resume/ResumeDocument.tsx`** — `@react-pdf/renderer` vector document, the actual **download**. Layout mirrors `template.pdf` per `parsed/template_spec.json` (A4, 20pt bold name, bold uppercase section headings with hairline rules, two-column skills/projects, right-aligned dates, clickable email/LinkedIn/GitHub/Source links). Uses built-in **Helvetica** (Inter has no reliable static TTF to bundle; Helvetica is visually near-identical and avoids runtime font fetches in the static export).

Both are pure prop-driven components and receive the same filtered data + `hiddenBulletIds`, so the downloaded PDF matches what auto-fit decided on screen. `scripts/render-sample.tsx` imports the same `ResumeDocument` so QA reflects production output exactly.

### Auto-fit (`src/app/download/page.tsx` + `src/lib/autofit.ts`)

Convergent loop, **not** rAF/timeout (the earlier rAF version caused a runaway re-render loop that broke navigation away from `/download`):

1. `removableOrder` = all domain bullet ids sorted lowest-priority-first (highest `priority` number first).
2. A `useLayoutEffect` keyed on `[fitting, hiddenBulletIds.length, removableOrder]` measures `isOverflowing(previewRef)`; if overflowing and bullets remain, it hides one more (`slice(0, len+1)`), which re-renders and re-measures.
3. When it fits or `removableOrder` is exhausted, it sets `fitting=false` and stops. A separate effect resets the pass when domain/customText/content changes.

When editing this loop, preserve termination: never make the layout effect depend on values it also mutates without bounding them.

### PDF download flow

Download handler dynamically imports `@react-pdf/renderer` + `ResumeDocument`, builds the element via `React.createElement` (cast to `ReactElement<DocumentProps>` — the renderer accepts a component returning `<Document>` at runtime even though the types want a `Document` element), calls `pdf(element).toBlob()`, and triggers a one-click download.

## Deployment

`.github/workflows/deploy.yml` runs `npm ci && npm run build` and publishes `./out` to GitHub Pages on push to `main`. `public/.nojekyll` keeps Pages from stripping `_next/`. `trailingSlash: true` emits `/route/index.html` so nested routes resolve without a server. No `basePath` (user-site repo serves at root).

## Key Constraints

- Resume must always be exactly one page (A4); `ResumeDocument` layout fidelity is judged against `template.pdf`.
- `/settings` and `/download` are private — no public links.
- Project headings show a `Source` link on the right.
- Bullet priority is user-editable: lower number = higher priority = kept longer when trimming.
