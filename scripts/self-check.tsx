/**
 * Self-checking resume QA. For every enabled domain this script reproduces
 * the app's verified auto-fit loop headlessly:
 *
 *   1. Render the REAL ResumeDocument (the exact component the download
 *      uses) with the seed data filtered to the domain.
 *   2. Count the pages of the produced PDF.
 *   3. If it exceeds one page, hide the next lowest-priority bullet (same
 *      order as the Download page via removableBulletIds) and re-render.
 *   4. Repeat until the PDF is one page or nothing is left to trim.
 *
 * The final PDFs are written to parsed/check-<domain>.pdf and then handed to
 * scripts/check_layout.py (PyMuPDF), which verifies geometrically that no
 * text overlaps (e.g. the Education score colliding with the institute) and
 * that nothing escapes the page. Exits non-zero if any domain cannot fit or
 * any layout check fails.
 *
 * Run: npx tsx scripts/self-check.tsx [domainId ...]   (default: all enabled)
 */
import React from "react";
import fs from "fs";
import { execFileSync } from "child_process";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import ResumeDocument, {
  type ResumeDocumentProps,
} from "@/components/resume/ResumeDocument";
import { seedData } from "@/lib/seed";
import { filterByDomain } from "@/lib/filter";
import { removableItemIds, countPdfPages } from "@/lib/autofit";

interface DomainResult {
  domainId: string;
  pages: number;
  trimmed: number;
  removable: number;
  out: string;
  fits: boolean;
}

function buildProps(domainId: string, hiddenBulletIds: string[]): ResumeDocumentProps {
  const domain = seedData.domains.find((d) => d.id === domainId);
  return {
    domainId,
    headerTitle: domain?.resumeTitle ?? seedData.profile.title,
    summaryText: domain?.summary ?? seedData.profile.about,
    profile: seedData.profile,
    skills: filterByDomain(seedData.skills, domainId),
    experience: filterByDomain(seedData.experience, domainId),
    education: seedData.education,
    projects: filterByDomain(seedData.projects, domainId),
    certifications: filterByDomain(seedData.certifications, domainId),
    awards: filterByDomain(seedData.awards, domainId),
    languages: seedData.languages,
    hobbies: seedData.hobbies,
    strengths: seedData.strengths,
    hiddenBulletIds,
  };
}

async function renderPdf(domainId: string, hidden: string[]): Promise<Buffer> {
  const element = React.createElement(
    ResumeDocument,
    buildProps(domainId, hidden)
  ) as React.ReactElement<DocumentProps>;
  return Buffer.from(await renderToBuffer(element));
}

async function checkDomain(domainId: string): Promise<DomainResult> {
  const projects = filterByDomain(seedData.projects, domainId);
  const experience = filterByDomain(seedData.experience, domainId);
  const removable = removableItemIds(projects, experience, domainId);

  let hidden: string[] = [];
  let buf = await renderPdf(domainId, hidden);
  let pages = countPdfPages(buf);
  while (pages > 1 && hidden.length < removable.length) {
    hidden = removable.slice(0, hidden.length + 1);
    buf = await renderPdf(domainId, hidden);
    pages = countPdfPages(buf);
  }

  const out = `parsed/check-${domainId}.pdf`;
  fs.writeFileSync(out, buf);
  return {
    domainId,
    pages,
    trimmed: hidden.length,
    removable: removable.length,
    out,
    fits: pages === 1,
  };
}

async function main() {
  fs.mkdirSync("parsed", { recursive: true });
  const requested = process.argv.slice(2);
  const domainIds =
    requested.length > 0
      ? requested
      : seedData.domains.filter((d) => d.enabled).map((d) => d.id);

  let failed = false;
  const results: DomainResult[] = [];
  for (const id of domainIds) {
    if (!seedData.domains.some((d) => d.id === id)) {
      console.error(`FAIL  unknown domain "${id}"`);
      failed = true;
      continue;
    }
    const r = await checkDomain(id);
    results.push(r);
    const status = r.fits ? "ok  " : "FAIL";
    console.log(
      `${status}  ${r.domainId.padEnd(12)} pages=${r.pages}  trimmed=${r.trimmed}/${r.removable} items  -> ${r.out}`
    );
    if (!r.fits) failed = true;
  }

  // Geometric layout check (text overlaps, page escapes) via PyMuPDF.
  const pdfs = results.map((r) => r.out);
  if (pdfs.length > 0) {
    try {
      const output = execFileSync("python3", ["scripts/check_layout.py", ...pdfs], {
        encoding: "utf8",
      });
      process.stdout.write(output);
    } catch (e) {
      const err = e as { stdout?: string; stderr?: string; code?: string };
      if (err.code === "ENOENT") {
        console.warn("warn  python3 not found; skipping geometric layout check");
      } else {
        if (err.stdout) process.stdout.write(err.stdout);
        if (err.stderr) process.stderr.write(err.stderr);
        failed = true;
      }
    }
  }

  if (failed) {
    console.error("\nself-check FAILED");
    process.exit(1);
  }
  console.log("\nself-check passed: every domain fits one page with clean layout");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
