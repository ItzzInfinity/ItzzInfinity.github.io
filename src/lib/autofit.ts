import { ProjectBullet, ExperienceBullet } from "@/types";
import { filterBulletsByDomain } from "@/lib/filter";

export interface FlatBullet {
  id: string;
  text: string;
  priority: number;
  parentId: string;
  parentType: "project" | "experience";
}

export function collectBullets(
  projects: { id: string; bullets: ProjectBullet[] }[],
  experience: { id: string; bullets: ExperienceBullet[] }[]
): FlatBullet[] {
  const bullets: FlatBullet[] = [];
  for (const p of projects) {
    for (const b of p.bullets) {
      bullets.push({ id: b.id, text: b.text, priority: b.priority, parentId: p.id, parentType: "project" });
    }
  }
  for (const e of experience) {
    for (const b of e.bullets) {
      bullets.push({ id: b.id, text: b.text, priority: b.priority, parentId: e.id, parentType: "experience" });
    }
  }
  return bullets.sort((a, b) => a.priority - b.priority);
}

export function isOverflowing(el: HTMLElement): boolean {
  return el.scrollHeight > el.clientHeight + 2;
}

/**
 * Ids of all domain-visible project/experience bullets, ordered by trim
 * priority: lowest-priority bullet (highest `priority` number) first. Shared
 * by the Download page auto-fit and scripts/self-check.tsx so both trim in
 * the exact same order.
 */
export function removableBulletIds(
  projects: { bullets: ProjectBullet[] }[],
  experience: { bullets: ExperienceBullet[] }[],
  domainId: string
): string[] {
  const all: { id: string; priority: number }[] = [];
  for (const p of projects) {
    for (const b of filterBulletsByDomain(p.bullets, domainId)) {
      all.push({ id: b.id, priority: b.priority });
    }
  }
  for (const e of experience) {
    for (const b of filterBulletsByDomain(e.bullets, domainId)) {
      all.push({ id: b.id, priority: b.priority });
    }
  }
  return all.sort((a, b) => b.priority - a.priority).map((x) => x.id);
}

/**
 * FSD rule 10: when trimming bullets alone cannot fit the page, optional
 * sections are hidden before critical ones, least-important first (the FSD
 * section priority list puts Hobbies/Languages at the bottom). Summary,
 * skills, experience, projects and education are never hidden.
 */
export const OPTIONAL_SECTION_TRIM_ORDER = [
  "hobbies",
  "strengths",
  "languages",
  "awards",
  "certifications",
] as const;
export type TrimmableSection = (typeof OPTIONAL_SECTION_TRIM_ORDER)[number];

// Section hides travel in the same hidden-id list as bullets (prefixed so
// they can never collide with real bullet ids), keeping the auto-fit loop a
// simple monotonic prefix of one ordered list.
export function sectionTrimId(section: TrimmableSection): string {
  return `section:${section}`;
}

/**
 * The full trim sequence for one-page auto-fit: every removable bullet
 * (lowest priority first), then optional sections (least important first).
 * The Download page and scripts/self-check.tsx both hide a growing prefix of
 * this list until the rendered PDF fits one page.
 */
export function removableItemIds(
  projects: { bullets: ProjectBullet[] }[],
  experience: { bullets: ExperienceBullet[] }[],
  domainId: string
): string[] {
  return [
    ...removableBulletIds(projects, experience, domainId),
    ...OPTIONAL_SECTION_TRIM_ORDER.map(sectionTrimId),
  ];
}

/**
 * Counts pages in a rendered PDF byte stream. The HTML preview only
 * approximates react-pdf's Helvetica metrics, so the fit loop verifies its
 * result against the real PDF: render, count pages here, and keep trimming
 * until this reports 1. react-pdf (pdfkit) writes page dictionaries
 * uncompressed, so counting `/Type /Page` objects is reliable; the /Pages
 * tree `/Count` is the fallback.
 */
export function countPdfPages(bytes: Uint8Array): number {
  let s = "";
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    s += String.fromCharCode(...bytes.subarray(i, Math.min(i + CHUNK, bytes.length)));
  }
  const pages = s.match(/\/Type\s*\/Page(?!s)/g);
  if (pages && pages.length > 0) return pages.length;
  const count = s.match(/\/Type\s*\/Pages[^>]*\/Count\s+(\d+)/);
  return count ? parseInt(count[1], 10) : 1;
}
