# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A cross-platform web application that doubles as a personal portfolio website and a dynamic resume generator. The user maintains a single pool of profile data and maps content to domains (VLSI / RTL Design / Verification / FPGA Design / Embedded / PCB Design). The Download page assembles a one-page PDF resume filtered to the selected domain, trimming lower-priority bullets when content overflows.

See `FSD.md` for the full Functional Specification including the data model, resume generation rules, and phased execution plan.

## Tech Stack

- **Next.js 14** (App Router, TypeScript) — portfolio routing + SSR/SSG
- **Tailwind CSS** — responsive styling
- **Zustand** — global state for the entire data model (persisted to `localStorage`)
- **@dnd-kit/core + @dnd-kit/sortable** — drag-and-drop reordering in Settings
- **html2canvas + jspdf** — PDF generation from the live resume preview DOM node
- **React Hook Form + Zod** — forms and schema validation in Settings

## Commands

```bash
# Install dependencies
npm install

# Dev server (localhost:3000)
npm run dev

# Production build
npm run build

# Type-check without emitting
npx tsc --noEmit

# Lint
npm run lint

# Run tests
npm test

# Run a single test file
npx jest path/to/file.test.ts
```

## Architecture

### Route Structure (`app/`)

| Route | Purpose |
|---|---|
| `/` | Home — branding, intro, domain highlights |
| `/about` | Profile, background, contact |
| `/vlsi` | VLSI parent page (RTL, Verification, FPGA sub-tabs) |
| `/embedded` | Embedded domain page |
| `/pcb` | PCB Design domain page |
| `/settings` | Hidden settings hub (easter-egg access only — not in nav) |
| `/download` | Domain picker, resume preview, PDF download |

Settings and Download pages must never appear in the public navigation.

### State Layer (`src/store/`)

All application data lives in a single Zustand store (`useResumeStore`) divided by entity: `profile`, `domains`, `skills`, `experience`, `education`, `projects`, `certifications`, `awards`, `bullets`. The store serialises to `localStorage` under the key `resume-builder-v1`. The storage layer is intentionally abstracted behind `src/lib/storage.ts` so it can later be swapped for a remote API.

### Domain Filtering

Every entity except `profile` and `education` carries a `domainIds: string[]` array. The helper `src/lib/filter.ts` exports `filterByDomain(items, domainId)` used by both portfolio pages and the resume preview.

### Resume Auto-Fit (`src/lib/autofit.ts`)

1. Render the resume preview inside a fixed `794px × 1123px` container (A4 at 96 dpi).
2. Check `scrollHeight > clientHeight`.
3. If overflow: remove the `ResumeBullet` with the lowest `priority` (highest number = lowest priority) and re-render.
4. Repeat until it fits or only required bullets remain.
5. If space is left, re-insert higher-priority available bullets.
Section drop order when a whole section still won't fit: Languages → Hobbies → References → Awards → Certifications → Projects → Education → Experience → Skills → Summary → Header (Header is never dropped).

### PDF Generation (`src/lib/pdf.ts`)

Calls `html2canvas` on the resume container element, then passes the canvas to `jspdf` to embed as an image on a single A4 page. Triggered from the Download page after auto-fit completes.

### Component Conventions

- Shared UI primitives live in `src/components/ui/` (Button, Input, Modal, Badge, etc.).
- Page-specific components are co-located under `src/components/<page>/`.
- The resume render is in `src/components/resume/ResumePreview.tsx` — it is used by both the Download page and the auto-fit loop, so it must remain a pure render component driven entirely by props.

## Key Design Constraints

- Resume must always be exactly one page (A4).
- Settings and Download routes are private — no public links.
- Source links appear to the right of every project heading inside the resume.
- Bullet priority is user-editable (lower number = higher priority = kept longer).
- Domain pages on the portfolio show the same data as the resume preview, but without the one-page constraint.
