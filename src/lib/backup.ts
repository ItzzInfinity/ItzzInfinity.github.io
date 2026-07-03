import { AppData } from "@/types";

// Keys that make up AppData. `profile` is an object; everything else is an
// array of entities. Used both to validate imported backups and to build the
// seed.ts export, so a schema change only needs updating here.
const ARRAY_KEYS = [
  "domains",
  "skills",
  "experience",
  "education",
  "projects",
  "certifications",
  "awards",
  "languages",
  "hobbies",
  "strengths",
  "references",
] as const;

/**
 * Parse + validate a JSON backup produced by `serializeBackup` (or the raw
 * localStorage payload). Throws with a readable message when the shape is
 * wrong so the Settings UI can surface it.
 */
export function parseBackup(json: string): AppData {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error("File is not valid JSON.");
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error("Backup must be a JSON object.");
  }
  const obj = parsed as Record<string, unknown>;
  const profile = obj.profile;
  if (typeof profile !== "object" || profile === null || typeof (profile as { name?: unknown }).name !== "string") {
    throw new Error("Backup is missing a valid `profile` (with a `name`).");
  }
  for (const key of ARRAY_KEYS) {
    if (!Array.isArray(obj[key])) {
      throw new Error(`Backup is missing the \`${key}\` array.`);
    }
  }
  // Strip unknown top-level keys (e.g. the persisted __seedSig) so imports of
  // a raw localStorage dump also work.
  const clean: Record<string, unknown> = { profile };
  for (const key of ARRAY_KEYS) clean[key] = obj[key];
  return clean as unknown as AppData;
}

export function serializeBackup(data: AppData): string {
  return JSON.stringify(data, null, 2);
}

/**
 * Render the current store as a complete, ready-to-paste `src/lib/seed.ts`
 * file so content edited in the Settings UI can be promoted to the canonical
 * seed (FSD improvement #3). The seed signature mechanism in storage.ts means
 * committing the generated file propagates the data to every client.
 */
export function serializeSeedTs(data: AppData): string {
  const body = JSON.stringify(data, null, 2);
  return `import { AppData } from "@/types";

// Canonical seed data. Generated from the Settings → Backup tab
// ("Export as seed.ts"); paste over src/lib/seed.ts and commit to promote
// UI-edited content to every client (storage.ts re-seeds stale caches when
// this file's signature changes).
export const seedData: AppData = ${body};
`;
}

/** Trigger a browser download of `content` as `filename`. */
export function downloadFile(filename: string, content: string, mime = "application/json"): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
