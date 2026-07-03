# Resume Builder + Portfolio

A cross-platform web app that is both a **personal portfolio website** and a **dynamic resume generator**. You maintain one pool of profile data (skills, experience, projects, education, …), tag each item with the domains it belongs to (e.g. VLSI / RTL Design / Verification / FPGA / Embedded / PCB Design), and the app:

- serves public portfolio pages per domain,
- assembles a **one-page A4 PDF resume** filtered to any selected domain, automatically trimming the lowest-priority bullets until everything fits (with an optional 2-page mode and full manual override),
- deploys as a **static site to GitHub Pages** — no server, no database.

The downloaded resume is a true vector PDF rendered with `@react-pdf/renderer`, with clickable email / LinkedIn / GitHub / Source links.

## Features

- **One data pool, many resumes** — every skill, project, and bullet carries `domainIds`; pick a domain on the Download page and get a resume tailored to it, including a per-domain job title and summary.
- **Convergent auto-fit** — bullets have user-editable priorities (lower number = kept longer). The app measures the preview, hides bullets lowest-priority-first, then verifies against the *real* PDF page count before enabling the Download button.
- **Advanced overrides** — drag-reorder resume sections, or switch to manual mode and tick exactly which sections/bullets appear.
- **In-browser editor** — the hidden `/settings` page edits everything (profile, domains, skills with drag-and-drop ordering, experience, projects, …) and persists to `localStorage`.
- **Backup / promote** — Settings → Backup exports/imports the whole dataset as JSON, and can export it as a ready-to-commit `seed.ts` so your edits become the canonical data served to every visitor.
- **CI-verified layout** — every push renders every domain's resume, trims it to one page, and geometrically verifies (via PyMuPDF) that nothing overlaps or falls off the page before deploying.

## Tech stack

| Piece | Choice |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript), static export (`output: 'export'`) |
| Styling | Tailwind CSS |
| State | Zustand, persisted to `localStorage` |
| PDF (download) | `@react-pdf/renderer` (vector, Helvetica) |
| Drag & drop | `@dnd-kit` |
| Layout QA tooling | Python 3 + PyMuPDF (`scripts/`) |
| Hosting | GitHub Pages via GitHub Actions |

## Quick start

### Option A — installer scripts

The `installer/` folder has a script per OS that installs Node 20 (via nvm / winget), the npm dependencies, and (optionally) the Python tooling:

```bash
# Linux
./installer/install-linux.sh

# macOS
./installer/install-macos.sh
```

```powershell
# Windows (PowerShell)
.\installer\install-windows.ps1
```

### Option B — manual

Prerequisites: **Node.js 20** and optionally **Python 3** (only for the PDF QA scripts).

```bash
git clone https://github.com/<your-username>/<this-repo>.git
cd <this-repo>
npm install
npm run dev            # http://localhost:3000
```

> **Note (this machine / nvm users):** Node is installed via nvm and is not on PATH by default. Either run `./dev.sh`, or load nvm first:
> `export NVM_DIR="$HOME/.nvm" && source "$NVM_DIR/nvm.sh" && nvm use 20`

## Routes

| Route | Visibility | Purpose |
|---|---|---|
| `/`, `/about`, `/vlsi`, `/embedded`, `/pcb` | public | Portfolio pages |
| `/settings` | **hidden** — type the URL | Edit all data, backup/restore, export seed |
| `/download` | **hidden** — type the URL | Pick a domain, auto-fit, download the PDF |

`/settings` and `/download` are deliberately never linked from the public nav. Keep it that way if you host this publicly.

## Use it with **your** data and host it on **your** GitHub

Follow these steps to turn this into your own portfolio + resume site:

### 1. Get the code

Fork this repository (or click "Use this template" if enabled), then clone your fork:

```bash
git clone https://github.com/<your-username>/<your-fork>.git
cd <your-fork>
```

### 2. Install and run locally

Run the installer for your OS from `installer/` (or `npm install` manually), then:

```bash
npm run dev
```

### 3. Enter your data

Open **http://localhost:3000/settings** and work through the tabs:

- **Profile** — name, title, email, phone, LinkedIn, GitHub, portfolio URL, location, about text.
- **Domains** — rename/disable the existing domains or create your own (each domain can have its own resume title and summary; sub-domains are supported via a parent domain).
- **Skills / Experience / Projects / Education / Certifications / Awards / etc.** — add your items and tick which domains each belongs to. Give bullets a **priority** (lower number = more important = survives auto-fit trimming longer).

Your edits live in your browser's `localStorage` — they are *not* yet part of the site.

### 4. Promote your edits to the canonical seed

The file `src/lib/seed.ts` is the data every visitor sees. To replace the bundled sample data (currently the original author's real profile) with yours:

1. Go to **Settings → Backup**.
2. Click **"Export as seed.ts"**.
3. Paste the downloaded content over `src/lib/seed.ts`.
4. Commit it.

(You can also edit `src/lib/seed.ts` by hand — it's plain TypeScript.)

The store keys off a hash of the seed, so when the deployed seed changes, every visitor's cached copy is automatically discarded and replaced. Committing a new `seed.ts` is all it takes to update the live site's content.

### 5. Sanity-check the resume locally

```bash
npx tsx scripts/render-sample.tsx [domainId]   # renders the real PDF to parsed/sample-resume.pdf
npx tsx scripts/self-check.tsx                 # every enabled domain must fit one page, no overlaps
```

The self-check needs Python 3 + PyMuPDF (`pip install -r scripts/requirements.txt`). It also runs in CI, so a broken layout will block deployment rather than go live.

### 6. Set up GitHub Pages hosting

Two choices for the repository name:

- **User site (recommended, what this project assumes):** name the repo `<your-username>.github.io`. The site is served at `https://<your-username>.github.io/` — no config changes needed.
- **Project site:** any repo name; the site is served at `https://<your-username>.github.io/<repo>/`. You must add the base path in `next.config.mjs`:

  ```js
  const nextConfig = {
    output: "export",
    basePath: "/<repo>",     // add this line for a project site
    trailingSlash: true,
    images: { unoptimized: true },
  };
  ```

Then, in your repository on GitHub: **Settings → Pages → Build and deployment → Source: "GitHub Actions"**.

### 7. Deploy

```bash
git push origin main
```

The included workflow (`.github/workflows/deploy.yml`) runs on every push to `main`: it type-checks, runs the unit tests, runs the geometric resume self-check for every domain, builds the static export, and publishes `./out` to GitHub Pages. Your site is live a minute or two later.

### 8. Download your resume

Visit `https://<your-site>/download`, pick a domain, wait for the fit/verify pass to finish, and click Download.

## Development commands

```bash
npm run dev                  # dev server at localhost:3000
npm run build                # static export to ./out (what GitHub Pages serves)
npx tsc --noEmit             # type-check
npm run lint                 # eslint
npm test                     # jest
npx jest path/to/file.test.ts

# Resume QA (no browser needed)
npx tsx scripts/render-sample.tsx [domainId]   # -> parsed/sample-resume.pdf
npx tsx scripts/self-check.tsx [domainId ...]  # -> parsed/check-<domain>.pdf, exits non-zero on layout failure

# PDF extraction tooling (Python 3)
pip install -r scripts/requirements.txt
python3 scripts/extract_resumes.py [SRC_DIR] [OUT_DIR]   # old resume PDFs -> JSON (text + hyperlinks)
python3 scripts/extract_template.py [template.pdf]       # -> parsed/template_spec.json (fonts/sizes/rules)
```

`parsed/` is git-ignored (it can contain personal data); regenerate it locally.

## Project structure

```
src/
  app/                    # Next.js routes (/, /about, /vlsi, /embedded, /pcb, /settings, /download)
  components/
    layout/Navbar.tsx     # public nav (never links to /settings or /download)
    resume/
      ResumePreview.tsx   # HTML preview — also the measuring stick for auto-fit
      ResumeDocument.tsx  # @react-pdf/renderer document — the actual download
    settings/             # settings editor, drag-and-drop lists, backup manager
    download/             # advanced panel (section reorder, manual override)
  lib/
    seed.ts               # ★ canonical data — replace with yours (step 4 above)
    filter.ts             # domain filtering + bullet priority sorting
    autofit.ts            # trim order: bullets lowest-priority-first, then optional sections
    sections.ts           # shared resume section order
    backup.ts             # JSON export/import + "export as seed.ts"
  store/useResumeStore.ts # Zustand store (whole data model, localStorage-persisted)
scripts/                  # render-sample / self-check (tsx) + PyMuPDF extraction (python)
installer/                # per-OS setup scripts
.github/workflows/        # build + verify + deploy to GitHub Pages
```

### A note on the two resume renderers

`ResumePreview.tsx` (HTML) and `ResumeDocument.tsx` (react-pdf) must stay in visual/layout sync — the preview is used to *measure* overflow, and the PDF is what actually downloads. If you change layout rules in one, mirror them in the other, then run `npx tsx scripts/self-check.tsx`. See `CLAUDE.md` for the full set of invariants.

## License

Personal project — fork it, replace `src/lib/seed.ts` with your own data, and make it yours.
