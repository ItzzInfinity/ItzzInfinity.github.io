<!-- Functional Specification Document (FSD)  -->

# Status Summary

One-table view of everything planned in this document and where it stands. Status legend: ✅ Done · 🔶 Partial · 🔲 To do · 💡 Planned (future).

| # | Area | Item | Status | Notes |
|---|------|------|--------|-------|
| 1 | Foundation | Next.js static-export app with routing for Home / About / VLSI (+RTL, Verification, FPGA) / Embedded / PCB / Settings / Download | ✅ Done | Phases 1–3 |
| 2 | Foundation | GitHub Pages deploy with CI gate (type-check → jest → self-check before build) | ✅ Done | `deploy.yml` |
| 3 | Foundation | `/settings` & `/download` hidden from public nav (easter-egg access) | ✅ Done | Build-order step 11 |
| 4 | Data | Data schema + Zustand store persisted to localStorage, storage layer abstracted for future backend | ✅ Done | Phase 2 |
| 5 | Data | Seed data extracted from real resume PDFs incl. hyperlinks (PyMuPDF scripts) + `template.pdf` spec extraction | ✅ Done | "What I need" items |
| 6 | Data | Seed-signature mechanism: stale client caches auto-discarded when `seed.ts` changes | ✅ Done | Fixed deployed-site staleness bug |
| 7 | Settings | CRUD for profile, skills, experience, projects, education | ✅ Done | Phase 4.1 (partial scope) |
| 8 | Settings | CRUD for domains, certifications, awards, languages, hobbies, strengths, references | 🔲 To do | Editable only via seed.ts / JSON import today |
| 9 | Settings | Drag-and-drop reordering (skills list, project/experience bullets) via @dnd-kit `SortableList` | ✅ Done | Phase 4.2 |
| 10 | Settings | Bullet priority + domain-mapping controls | ✅ Done | Phase 4.3/4.4 |
| 11 | Settings | JSON backup export/import + reset-to-seed (Backup tab, `src/lib/backup.ts`) | ✅ Done | Improvement #2 |
| 12 | Settings | "Export as seed.ts" round-trip (promote UI edits to canonical seed) | ✅ Done | Improvement #3 |
| 13 | Resume | One-page auto-fit: priority-based bullet trimming + real-PDF page-count verification pass | ✅ Done | Phase 6; self-verifying |
| 14 | Resume | Optional-section hiding after bullets exhausted (rule 10: hobbies → strengths → languages → awards → certifications) | ✅ Done | |
| 15 | Resume | 1-page / 2-page toggle; 2-page preview shows page-break guides | ✅ Done | |
| 16 | Resume | HTML preview is a faithful mirror of the downloaded PDF (order, layout, type scale) | ✅ Done | Phase 5 |
| 17 | Resume | Download page: domain radios with VLSI sub-domains, custom text input, one-click PDF download | ✅ Done | Phase 7 |
| 18 | Resume | Per-domain resume title + per-domain summary (also used as portfolio page intro) | ✅ Done | |
| 19 | Resume | Project `Source` links, conditional 2-col bullets, 2-line education layout, flexed heading rows (no text collisions) | ✅ Done | |
| 20 | Resume | References section + footer on the resume (FSD rule 8) | 🔲 To do | Neither renderer outputs them |
| 21 | QA | Self-check tooling: render + trim + geometric layout verification for every domain (`scripts/self-check.tsx`) | ✅ Done | All 6 domains pass; runs in CI |
| 22 | Improvement | ATS-friendly PDF metadata + domain keyword check | 🔲 To do | Improvement #4 |
| 23 | Improvement | Trim preview with pin ("never trim this") controls on Download page | 🔶 Partial | Improvement #5; the Advanced manual override covers "see & control what's trimmed", but pinning *within* auto-fit is still open |
| 24 | Improvement | Per-project date ranges, right-aligned like experience | 🔲 To do | Improvement #6 |
| 25 | Improvement | Section reorder from Preview page + Advanced manual override on Download page | ✅ Done | Improvement #7; Advanced panel: drag-reorder sections, plus a collapsible picker with section / entry / bullet checkboxes and drag-reorder of entries (projects included) that override auto-fit at runtime |
| 26 | Improvement | Custom domains end-to-end (dynamic portfolio routes from the store) | 🔲 To do | Improvement #8 |
| 27 | Improvement | Resume version history (last N generated PDFs in IndexedDB) | 🔲 To do | Improvement #9 |
| 28 | Improvement | Lighthouse/mobile pass (preview fit-width, tap targets) | 🔲 To do | Improvement #10 |
| 29 | Future | Multiple resume templates | 💡 Planned | Phase 9 |
| 30 | Future | Cloud login + database sync | 💡 Planned | Phase 9 |
| 31 | Future | Analytics for downloaded resume versions | 💡 Planned | Phase 9 |
| 32 | Future | AI-assisted summary & bullet rewriting | 💡 Planned | Phase 9 |
| 33 | Future | Theme customization for portfolio and resume | 💡 Planned | Phase 9 |
| 34 | Future | Per-section public/private visibility controls | 🔶 Partial | Settings/Download hidden; the Download page's Advanced override now gives per-section/per-entry control **for one download**, but nothing persists to the store or affects the public portfolio pages |
| 35 | Resume | Certificate credential links clickable on the resume | ✅ Done | Both renderers hyperlink the certificate name from `credentialLink` |

# Thinking out Loud -  Will organize later
1. Need a way to generate resume as PDF on the go.
2. This should be cross-platform (Windows, Mac, Linux, Android, iOS).
3. So a web-based solution is preferred.
4. Need it to be a multi domain solution, 
5. Like I want to apply for VLSI and also have skill for embedded so I want to have a resume for both domains.
6. It should be easy to use and intuitive.
7. It should be highly modular.
8. Resume have set its own rules like 
   - Resume should be one page.
   - Resume should have a header with name and contact info.
   - Resume should have a summary section. - Dynamic based on the domain.
   - Resume should have a skills section. - Dynamic based on the domain.
   - Resume should have an experience section. - Dynamic based on the domain.
   - Resume should have an education section. - Dynamic based on the domain.
   - Resume should have a projects section. - Dynamic based on the domain.
   - Resume should have a footer section. 
   - Resume should have a section for certifications. - Dynamic based on the domain.
   - Resume should have a section for awards. - Dynamic based on the domain.
   - Resume should have a section for hobbies. 
   - Resume should have a section for languages known.
   - Resume should have a section for references.
9. All the pointers should be self adjustable as per the content. For example, if I have a lot of experience, the experience section should expand and other sections should adjust accordingly.
10. Best case would be to make this a personal github portfolio website with multiple sections as 
    - `Home`
    - `About`
    - `VSLI`    
      - `RTL Design`
      - `Verification`
      - `FPGA Design`
    - `Embedded`
    - `PCB Design`
    - More sections can be added as per the requirement. -  Upper layer access from `settings` 
    - `Setting`
    - `Download` -  This is the resume download section where user can download the resume in PDF format.
11. All the sections should have options to add, edit, delete, and rearrange the tabs.
12. The resume should be downloadable in PDF format with a single click.
13. The projects which I have done should have a `source` linked button to the right side of the project heading.
14. I will add detailed pointers to the every project like 5 - 6 pointers for each project. These should be displayed in a bullet format.
15. When there is empty space in the resume, it should be filled with the pointers according to the priority. If it is not fitting in one page the points can be removed from the bottom of the resume. The priority of the pointers should be in ascending order after being added which is editable in the webpage sections.
16. Downloadable resume should have a `Download` button. and a set of radio buttons to select the domain. And a section If I want to add a new line or custom text in the resume. 

   
# Structured Goal

## Current state — 2026-08-21 (session 1) — download-page content picker + credential links

- **Current phase:** Improvements / backlog batches (Phase 7 shipped; working `## What I need` one `---` batch at a time)
- **Last completed task:** The 4-item batch at the bottom of `## What I need` — credential links + the Download page's Advanced content picker
- **Next task:** Nothing pending from the user. The oldest open roadmap rows are #20 (References section + footer, FSD rule 8) and #22 (ATS-friendly PDF metadata + domain keyword check); #23 (pinning *within* auto-fit) is the natural follow-on to this session's picker.

### Session summary
1. Refreshed `src/lib/seed.ts` from github.com/ItzzInfinity: rewrote FM Radio, clock-project, ESP-FrameBuffer and Ultimate Pi Box (the first two now ship real KiCad boards, so both moved to `pcb`), added TangNano-9K-projects / DayForge / AudioChop / YT-AIO, and added Yosys/nextpnr + Icarus Verilog skills.
2. Made certificate `credentialLink`s clickable in both renderers — they were in the data model and seed all along but neither renderer emitted them.
3. Added `src/lib/visibility.ts`: `item:<id>` hide tokens plus `applyItemOrder`, and routed every render site (verify pass, download handler, preview) through one `docPropsFor()` in the Download page.
4. Rebuilt `AdvancedPanel` as a two-level accordion — section / entry / bullet checkboxes for all ten sections, plus drag-reorder of entries (projects included) that feeds the resume.
5. Wired `@testing-library/jest-dom` into jest for the first time; added 8 component tests + 10 unit tests (29 total, all passing).

**Gotchas learned this session:**
- **Adding resume content is not free even at low priority.** A project's title + tools line is *not trimmable*, so richer entries raise the page's fixed cost regardless of bullet priority. Fleshing out the PCB projects pushed the pcb one-pager from 10/24 items trimmed to 24/32 — auto-fit removed *every* project bullet and shipped bare titles. Fixed by shortening titles/tool lists, dropping `pcb` from the firmware-only ESP-FrameBuffer, and demoting the breadboard-only SpO2/SigGen bullets to priority 2 so the two custom-board bullets are the only priority-1 project content the page must keep. **When adding seed content, re-run `self-check` and read the trim ratio, not just the pass/fail.**
- **`@testing-library/jest-dom` was a dependency but had never been wired in**, so *any* component test failed with `toBeChecked is not a function`. It needs two files, not one: `jest.setup.js` (`setupFilesAfterEnv`, for the runtime matchers) *and* `jest-dom.d.ts` (for `tsc --noEmit`, which otherwise errors on the matcher types even though jest passes).
- Entry hiding is applied **upstream** of the renderers on purpose (`visibleItems` in `docPropsFor`), not inside them. Any filtering rule written twice is a rule the preview and the PDF will eventually disagree about — that is the recurring failure mode in this repo.
- The section-order sortable list is kept separate from the accordion to avoid nesting one `DndContext` inside another.

### Partially done
- none

### Blocked
- none

### Next step (exact)
No user batch is open — wait for the next `---` block in `## What I need`. If picking up work unprompted, start roadmap row #20: neither renderer outputs a References section, so add a `references` entry to the `SectionKey` map in `src/lib/sections.ts` and a matching `render()` branch in **both** `ResumeDocument.tsx` and `ResumePreview.tsx`, then re-run `npx tsx scripts/self-check.tsx`.

### Assumptions
- The four new low-priority software repos (DayForge, AudioChop, YT-AIO) belong under `embedded` because it is the only non-hardware-specific domain; say so if they should be dropped from the resume entirely.

## Project Vision

Build a cross-platform web application that works as both a personal portfolio website and a dynamic resume generator. The application should let the user maintain reusable profile, skills, education, experience, certification, award, hobby, language, reference, and project data, then generate a one-page PDF resume customized for a selected domain such as VLSI, Embedded, PCB Design, RTL Design, Verification, or FPGA Design.

## Core Objectives

1. Create a web-based portfolio so it works on Windows, macOS, Linux, Android, and iOS.
2. Maintain all resume and portfolio content from an editable interface.
3. Support multiple domains, where each domain can choose different summary text, skills, experience, projects, certifications, and awards.
4. Generate a clean one-page resume PDF from selected domain data.
5. Automatically fit resume content into one page by using priority-based bullet selection.
6. Allow custom text or an extra line to be added before downloading the resume.
7. Keep the system modular so new sections, domains, and resume templates can be added later.

## Main Application Sections

1. `Home`
   - Landing section for personal branding, short intro, and quick navigation.
2. `About`
   - General profile, background, contact details, and career summary.
3. `VLSI`
   - Parent domain page for semiconductor-related work.
   - Subsections:
     - `RTL Design`
     - `Verification`
     - `FPGA Design`
4. `Embedded`
   - Embedded systems skills, projects, tools, and experience.
5. `PCB Design`
   - PCB design projects, tools, board details, and source links.
6. `Settings`
   - Add, edit, delete, reorder, and configure sections, domains, projects, and resume content.
7. `Download`
   - Select domain, add optional custom text, preview resume, and download PDF.

## Data Model Plan

1. `Profile`
   - Name, title, email, phone, LinkedIn, GitHub, portfolio URL, location.
2. `Domain`
   - Domain name, enabled status, order, related sections, and resume configuration.
3. `Summary`
   - Domain-specific summary text.
4. `Skill`
   - Skill name, category, domain mapping, priority, visibility.
5. `Experience`
   - Company, role, duration, location, domain mapping, bullet points.
6. `Education`
   - Degree, institute, duration, score, location.
7. `Project`
   - Project title, domain mapping, source link, tools used, bullet points.
8. `Certification`
   - Name, issuer, date, credential link, domain mapping.
9. `Award`
   - Title, organization, date, description, domain mapping.
10. `ResumeBullet`
   - Text, parent section, domain mapping, priority, enabled status.
11. `ResumeTemplate`
   - Layout rules, font sizes, spacing, visible sections, and fit strategy.

## Resume Generation Rules

1. Resume must fit on one page.
2. Header should always include name and contact information.
3. Summary, skills, experience, projects, certifications, and awards should change based on selected domain.
4. Education can remain mostly common, but should still be configurable.
5. Projects should show a `Source` button or link on the right side of the project heading.
6. Project details should appear as bullet points.
7. Each bullet point should have an editable priority.
8. When empty space is available, include more bullets based on priority.
9. When content exceeds one page, remove lower-priority bullets first.
10. If a complete section does not fit, hide optional sections before critical sections.
11. Suggested section priority:
    - Header
    - Summary
    - Skills
    - Experience
    - Projects
    - Education
    - Certifications
    - Awards
    - Languages
    - Hobbies
    - References

## Execution Plan

### Phase 1: Project Setup

1. Choose the frontend framework and project structure.
2. Set up routing for `Home`, `About`, domain pages, `Settings`, and `Download`.
3. Create a shared layout with navigation, responsive design, and basic theme styles.
4. Define reusable UI components for buttons, forms, tabs, modals, lists, and section editors.

### Phase 2: Content Schema and Storage

1. Define the application data schema for profile, domains, skills, projects, experience, education, and resume bullets.
2. Start with local JSON or browser storage for quick development.
3. Create seed data for VLSI, Embedded, PCB Design, RTL Design, Verification, and FPGA Design.
4. Keep the storage layer separate so it can later move to a database or backend API.

### Phase 3: Portfolio Pages

1. Build the `Home` page with personal intro and domain highlights.
2. Build the `About` page with profile, background, and contact information.
3. Build domain pages that display filtered skills, projects, tools, and experience.
4. Add project cards or project rows with title, description, bullet points, and source link.
5. Ensure pages work well on desktop and mobile.

### Phase 4: Settings Module

1. Build CRUD forms to add, edit, and delete:
   - Domains
   - Skills
   - Projects
   - Experience
   - Education
   - Certifications
   - Awards
   - Resume bullets
2. Add drag-and-drop or order controls to rearrange sections and items.
3. Add priority controls for every resume bullet.
4. Add domain mapping controls so each item can belong to one or more domains.
5. Add enable/disable toggles for optional content.

### Phase 5: Resume Preview

1. Build a resume preview component using the selected domain.
2. Filter all resume content by selected domain.
3. Render sections in the selected order.
4. Display source links beside project headings.
5. Add custom text input for optional one-line resume additions.
6. Create a print-friendly layout that matches A4 or Letter page dimensions.

### Phase 6: Auto-Fit Algorithm

1. Render the resume preview in a fixed one-page container.
2. Measure whether the content overflows the page.
3. If content overflows, remove the lowest-priority optional bullet.
4. Repeat until the resume fits on one page.
5. If space remains, add back higher-priority available bullets.
6. Keep required sections visible and only trim optional content.
7. Show a warning if required content still cannot fit after trimming.

### Phase 7: PDF Download

1. Add a `Download` page with domain radio buttons.
2. Add resume preview for the selected domain.
3. Add custom text input.
4. Add a single-click `Download PDF` button.
5. Generate PDF from the finalized one-page resume layout.
6. Test PDF output across desktop and mobile browsers.

### Phase 8: Testing and Validation

1. Test domain filtering for every section.
2. Test add, edit, delete, and reorder flows.
3. Test priority-based bullet trimming.
4. Test resume PDF output for one-page formatting.
5. Test mobile, tablet, and desktop layouts.
6. Test empty states when a section has no content.
7. Test source links and contact links.

### Phase 9: Future Enhancements

1. Add multiple resume templates.
2. Add cloud login and database sync.
3. Add import/export JSON backup.
4. Add analytics for downloaded resume versions.
5. Add AI-assisted summary and bullet rewriting.
6. Add theme customization for portfolio and resume.
7. Add public/private visibility controls for portfolio sections.

## Minimum Viable Product

The first working version should include:

1. Portfolio pages for `Home`, `About`, `VLSI`, `Embedded`, and `PCB Design`.
2. Editable local data for profile, skills, projects, education, and experience.
3. Domain selection on the `Download` page.
4. Resume preview filtered by selected domain.
5. Priority-based bullet trimming to keep the resume on one page.
6. One-click PDF download.

## Recommended Build Order

1. Build static portfolio layout.
2. Create data schema and seed content.
3. Connect pages to dynamic data.
4. Build resume preview.
5. Add domain filtering.
6. Add settings forms.
7. Add priority and ordering controls.
8. Add one-page fit logic.
9. Add PDF download.
10. Polish responsive design and test end-to-end.
11. Add public/private visibility controls for portfolio sections. - Download / Settings Must not be public. - Need to add an easter egg to get to the settings page.


## Improvement Suggestions (proposed)

Concrete next steps that would make the product meaningfully better, roughly in order of value-for-effort:

1. **Run the self-check in CI** — add a GitHub Actions step that runs `npx tsc --noEmit`, `npm test`, and `npx tsx scripts/self-check.tsx` before deploy, so a seed/renderer change that breaks one-page fit or overlaps text can never reach the live site. - **Done** (`deploy.yml` build job now runs type-check → jest → PyMuPDF install → `self-check.tsx` before `npm run build`; any failure blocks the deploy.)
2. **JSON import/export backup in Settings** — one button to download the whole store as JSON and one to restore it; protects UI edits (which live only in localStorage and are discarded whenever the seed changes) and doubles as the migration path to a future backend. - **Done** (Settings → Backup tab: "Download JSON backup", validated import that replaces the store, and a "Reset to seed" button; `src/lib/backup.ts` + tests.)
3. **Editable seed round-trip** — a script (or Settings button) that exports the current store as a ready-to-paste `seed.ts` body, so content edited in the UI can be promoted to the canonical seed instead of retyping it in code. - **Done** (Settings → Backup → "Export as seed.ts" downloads a complete `seed.ts`; paste over `src/lib/seed.ts` and commit — the seed-signature mechanism propagates it to all clients.)
4. **ATS-friendly PDF metadata & keyword check** — set PDF title/author/subject/keywords from the profile + domain, and add a self-check rule that flags when a domain's resume is missing its own domain keywords (e.g. "UVM" absent from the verification resume after heavy trimming).
5. **Trim preview/control** — in the Download page, list which bullets/sections auto-fit removed (they're already known ids) with pin buttons ("never trim this"), giving manual override without breaking the priority system. - **Partially covered** (the Advanced panel's manual override shows every section/bullet as a checkbox seeded from the auto-fit result, so you can see and change exactly what's trimmed; a pin that constrains auto-fit *without* disabling it is still open.)
6. **Per-project date ranges** — the old resumes carry project durations (e.g. "Nov 2025 – Ongoing"); add optional `startDate`/`endDate` to `Project` and right-align them like experience.
7. **Section reorder from Settings** — `SectionKey` and per-domain section order exist in the data model plan but renderers hard-code the order; make both renderers consume a shared ordered section list. - **Done** (both renderers now render from a `sectionOrder` prop backed by `src/lib/sections.ts`; the Download page's Advanced panel (collapsed by default) drag-reorders sections at runtime, and its "Override auto-fit" mode replaces priority-based trimming with explicit per-section and per-bullet checkboxes — seeded from the auto-fit result — for quick one-off downloads. Manual selections still get a real-PDF page-count check that warns (without trimming) if they exceed one page. Runtime-only: nothing is persisted, and switching domains drops back to auto-fit.)
8. **Custom domains end-to-end** — Settings can create a domain, but there's no portfolio route for it; generate domain pages from the store (dynamic segment) instead of hand-written `/vlsi`, `/embedded`, `/pcb` pages.
9. **Resume version history** — keep the last N generated PDFs (domain, date, trimmed items) in IndexedDB so a previously sent resume can be reproduced exactly.
10. **Lighthouse/mobile pass** — the preview is a fixed 794px sheet scaled by CSS; on small screens add pinch/fit-width controls and check tap targets on the Download controls.

## Steps Completed
1. Created a basic project structure with routing for `Home`, `About`, domain pages, `Settings`, and `Download`.
2. Filled it like lorem ipsum for now. 

## What I need 
- Need to parse PDFs and extract the content from it. `/home/itzzinfinity/Downloads/all_resumes/` - This is the path where all the resumes are stored. Need to extract the content from it and store it in a structured format like JSON or CSV.
- Need to maintain hyperlinks too which are embedded in the PDF. Need to extract the content from the PDF and store it in a structured format.
- There are Few Issues in the MVP which I need to fix like 
  - After going to the `Download` page, if I click on the `Home` or `About` page, it is not loading the content. 
  - Make just the minimum file which will be hosted in the github pages. So that I can host it in the github pages. I dont think the current project is ready to be hosted in the github pages. 
  - Downloaded sample resume is not looking good. Texts are overlapping. Need to fix the layout of the resume. 
  - Make a script which will extract the template which I will give and that's how I want the resume to look like.  
  - `template.pdf` - This is the template which I want to use for the resume. Need to extract the formatting from it and use it in the resume generation.
  - Need to hide Download button too from home page same as settings - **Done**
  - Need to visit `https://github.com/ItzzInfinity?tab=repositories` my repos and add them accordingly to respective domains. - **Done**
  - VLSI Resume is currently overflowing - Detect if Overflow detected suggest 2 page view - 1 or 2 page style depends up to user. - **Done**
  - for projects in the resume one single line is divided into 2 lines which is causing 2 page overflow by 6 to 11 lines. Need to fix it. - **Done** (preview & PDF now share a conditional 2-col / full-width rule so long bullets no longer wrap in a narrow column; the two renderers' heights match so 1-page auto-fit is accurate)
  - If the page is not full, then the empty space should be filled with more bullets from the lower priority sections. - **Handled** (auto-fit only ever removes the minimum bullets needed to fit, and shows everything otherwise, so the page is always as full as available content allows; there is no separate hidden pool to pad from)
  - VLSI should have a sub radio button for RTL, Verification, FPGA. So that I can select the sub domain and generate the resume accordingly. - **Done**
  - In about section, I want to add full work experience too. - **Done**
  - in About Education section duration/years should be displayed right side as same as work experience. - **Done**
  - When changing domains (Radio Buttons). Domain name under Name in resume is not changing - **Reopened** - This is working in localhost but not in the deployed version. Need to check why it is not working in the deployed version. - **Fixed** (root cause: a stale localStorage cache on the deployed origin shallow-overrode the new seed `domains` array, dropping `resumeTitle`. storage.ts now stamps a seed signature and auto-discards stale caches when seed.ts changes.)
  - Downloaded resume is not same as the preview. Need to fix it. Although Downloaded resume is what I need to get in the preview, NOT VISE-VERSA. - **Done** (the downloaded `ResumeDocument` is the source of truth; `ResumePreview` was rewritten to be a faithful HTML mirror of it — same section order/names, per-item layout, and a type scale that is the PDF's pt sizes scaled by the pt→px factor, so the preview reads like the download and measures like it.)
  - The Pointers are not aligned same with the preview - 
    - Name, Skill, Experience, Projects, Education, Languages, Strengths, Hobbies -- Preview
    - Name, Summary, Education, Technical Skills, Projects, Languages, Strengths, Hobbies -- Downloaded Resume 
    - **Done** (preview now follows the download's order/headings: Summary, Work Experience, Education, Technical Skills, Projects, Certifications, Achievements, Languages, Strengths, Hobbies.)
  - Need to remove _resume from the downloaded resume name. - **Done** (filename is now `<Name>_<domain>.pdf`.)
  - Need a split Preview for 2 page layout. It is currently showing one long page. - **Done** (2-page mode overlays a dashed page-break guide at each A4 boundary the content crosses, labelled Page 2/…, instead of one continuous sheet.)
  ---
  - Selected 1 Page resume from VLSI and got 2 pages Need to set correct height for the 1 page resume. - Two descriptive lines of hobbies got overflowed the page. - Calculate One page height and set the height accordingly. - **Done** (root cause: the preview used a smaller type scale than the PDF, so it under-measured and auto-fit stopped trimming while the real PDF still overflowed. Preview now renders at the PDF's proportional sizes on a true A4 @96dpi sheet, so `isOverflowing` predicts the PDF.) - **Not Fixed - Reopened** - **Fixed (self-verifying)** (no HTML approximation of react-pdf's Helvetica metrics can be exact, so the app stopped trusting it: after the fast on-screen fit converges, the Download page renders the REAL PDF, counts its pages, and keeps trimming until the PDF itself is one page — the Download button is disabled until this verification passes, so a 1-page download can never come out as 2 pages again. VLSI specifically could never fit even with every bullet trimmed (it was one hobby line over), so FSD rule 10 is now implemented too: after bullets are exhausted, optional sections are hidden least-important-first (hobbies → strengths → languages → awards → certifications). `npx tsx scripts/self-check.tsx` re-runs this loop headlessly for every domain and fails CI-style if any domain can't reach one page.)
  - The Education section in preview is good but not in the downloaded resume. As Grades are sticked with Institute name and address in the preview - **Done** (both renderers put degree + institute on the left and score + dates right-aligned; the score is no longer stuck to the institute/address.) - **Not Fixed - Reopened** - **Fixed** (root cause: in a react-pdf row a bare `<Text>` keeps its intrinsic width, so the long degree+institute text ran into the right-aligned score/dates. Every heading row in `ResumeDocument` now gives the left text `flex: 1` (wraps) and the right text `flexShrink: 0, textAlign: right`; `ResumePreview` mirrors this. Verified geometrically: `scripts/check_layout.py` (PyMuPDF) asserts no two words on the same line overlap and nothing renders off-page, for every domain's generated PDF.)
  - Self-check mechanism: `npx tsx scripts/self-check.tsx` renders the real `ResumeDocument` for every enabled domain, trims lowest-priority bullets (then optional sections) and re-renders until each PDF is exactly one page, writes `parsed/check-<domain>.pdf`, then runs `scripts/check_layout.py` to verify no overlapping text and nothing off-page. Exits non-zero on any failure — run it after any change to seed data or either renderer. - **Done** (all 6 domains currently pass)
  ---
  - Add a summary for each domain, readable from old resumes, usable on webpage sections too. - **Done** (`Domain.summary` added; seeded per domain from the DV / FPGA / Embedded / PCB_Design resume variants in `~/Downloads/all_resumes`. The resume Summary section now uses the selected domain's summary (falls back to `profile.about`), and each domain portfolio page shows its summary as the intro paragraph.)
  - About already has full experience in detail — no need for experience on each domain section. - **Done** (the Experience section was removed from `DomainPage`; domain pages now show summary, skills, and projects only.)
  - In PCB Design add KiCad, Altium (Beginner), EasyEDA. - **Done** (added as a "PCB Design" skill category mapped to the pcb domain; they also appear in the PCB summary.)
  - If resume is 2 pages, add more points to fill it up (page 2 was mostly empty); find resources in old references. - **Done** (mined the old resume PDFs for real content: extra Sodexo/Electro Meter experience bullets (fault diagnosis, NABL documentation, plant visits, Sheets/Apps Script automation), descriptive bullets for the ALU and ESP32 Signal Generator projects, and two recovered projects — Ultimate Pi Sound Box and SIS Report Downloader. All seeded at lower priority so 1-page mode trims them first; the embedded 2-page layout now fills ~44% of page 2 (was ~10%). That exhausts what the references contain — filling page 2 further needs new writing, not extraction.)
  - Education should be a two-line layout: bold degree with right-aligned dates, then "Institute · Location · Score" as a muted detail line (per screenshot). - **Done** (both `ResumeDocument` and `ResumePreview` render education as two lines with an en-dash date range; verified visually and geometrically via self-check.)
  - Drag-and-drop reordering in Settings (Phase 4.2) — **Done** (`SortableList` built on the previously-unused @dnd-kit: the Skills list is drag-reorderable (resume skill order follows it; priorities renumbered), and project/experience bullets can be dragged inside the edit form to set trim priority, top = kept longest.)  
  ---
  - Repos on github.com/ItzzInfinity have been updated — find the new and updated ones, summarize them, and fold them into `src/lib/seed.ts` (mostly PCB Design and Embedded). - **Done** (pulled all 25 repos from the GitHub API and read the READMEs/file trees of every original one. Four existing seed projects were rewritten and four new repos added; skills gained Yosys/nextpnr and Icarus Verilog/GTKWave. The two headline changes are that **FM Radio** and **clock-project** now ship full KiCad 9 hardware — real custom boards, not breadboards — so both moved to `pcb` as their primary domain. Gotcha found while doing it: adding content is not free even at low priority, because a project's title + tools line is *not trimmable* — the first pass grew the pcb resume's fixed header cost enough that auto-fit trimmed every project bullet, leaving bare titles. Fixed by shortening titles/tool lists, dropping `pcb` from the firmware-only ESP-FrameBuffer, and demoting the breadboard-only SpO2/SigGen bullets to priority 2 so the two custom-board bullets are the only priority-1 project content the pcb page must keep. `npx tsx scripts/self-check.tsx` passes for all 6 domains. Not committed or pushed, as requested.)
---
- Certificate credential links are not working in resume - **Fixed** (root cause: `credentialLink` existed in `types/index.ts` and was populated in `seed.ts`, but *neither* renderer ever emitted it — the certifications block rendered name/issuer/date as plain text. Both renderers now hyperlink the certificate name when it has a credential link, styled like the header links (bold, link colour, no underline) so nothing shifts. Verified with PyMuPDF: all three certificate URIs are live in the generated PDF.)
- In *./download* page only the experience and projects have check boxes 
  - like if I want to Uncheck the entire project - this is not possible in current scenario - **Done** (every entry now has its own checkbox that hides the whole entry, projects included. Added a third hide grain, `item:<id>`, alongside the existing bullet ids and `section:<key>` tokens — see `src/lib/visibility.ts`.)
- I want to check other pointers too  - **Done** (the picker covers all ten sections, not just experience and projects: education, skills, certifications, achievements, languages, strengths and hobbies all list their entries with checkboxes.)
- modification `Drag-and-drop reordering in Settings (Phase 4.2)` in download after override option add dropdown for each section and project details as the entire detailed portfolio is becoming very long and I want to check/uncheck the entire section or project details instead of checking each pointer, and add drag functionality for each section including projects too after override option. - **Done** (the override area is now a two-level accordion: every section collapses to one row showing a `shown/total` count, opens to its entries, and an entry with bullets opens one level further. So you can untick a section, an entry, or a bullet without scrolling past the ones you don't care about. Entries inside every section are drag-reorderable and that order feeds the resume itself — project order included — via a runtime `itemOrder` map. Two design notes worth keeping: (1) `item:` tokens are applied *upstream* in the Download page by `visibleItems`, not inside the renderers, because the preview and the PDF have drifted before whenever a filtering rule had to be written twice; the renderers never learn about entry hiding at all. (2) The section-order list is deliberately left as a separate sortable list rather than making the accordion rows themselves draggable — that would have nested one DndContext inside another. `applyItemOrder` also keeps ids missing from a stale order rather than dropping them, so reordering can never silently delete content. 8 component tests in `src/components/download/__tests__/AdvancedPanel.test.tsx` and 10 unit tests in `src/lib/__tests__/visibility.test.ts` cover it; `@testing-library/jest-dom` was already a dependency but had never been wired into `jest.config.js`, so this batch added `jest.setup.js` + `jest-dom.d.ts` to make component tests possible at all.)  