/**
 * Shared resume section order (FSD improvement #7 / status row 25).
 *
 * Both renderers (ResumeDocument and ResumePreview) consume this list instead
 * of hard-coding section order, and the Download page's Advanced panel lets
 * the user reorder it at runtime. The default matches the template.pdf order
 * both renderers previously hard-coded, so nothing changes unless the user
 * overrides it.
 */

export const DEFAULT_SECTION_ORDER = [
  "summary",
  "experience",
  "education",
  "skills",
  "projects",
  "certifications",
  "awards",
  "languages",
  "strengths",
  "hobbies",
] as const;

export type SectionKey = (typeof DEFAULT_SECTION_ORDER)[number];

export const SECTION_LABELS: Record<SectionKey, string> = {
  summary: "Summary",
  experience: "Work Experience",
  education: "Education",
  skills: "Technical Skills",
  projects: "Projects",
  certifications: "Certifications",
  awards: "Achievements",
  languages: "Languages",
  strengths: "Strengths",
  hobbies: "Hobbies",
};

// Sections auto-fit never trims (see OPTIONAL_SECTION_TRIM_ORDER in
// lib/autofit.ts for the ones it does). Manual override in the Advanced
// panel may still hide these via `section:<key>` tokens.
export const CRITICAL_SECTIONS: ReadonlySet<SectionKey> = new Set([
  "summary",
  "experience",
  "education",
  "skills",
  "projects",
]);

/** Restores a possibly stale/partial saved order to a valid full order. */
export function normalizeSectionOrder(order: string[]): SectionKey[] {
  const valid = order.filter((k): k is SectionKey =>
    (DEFAULT_SECTION_ORDER as readonly string[]).includes(k)
  );
  const missing = DEFAULT_SECTION_ORDER.filter((k) => !valid.includes(k));
  return [...new Set([...valid, ...missing])];
}
