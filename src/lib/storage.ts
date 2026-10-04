import { AppData } from "@/types";
import { seedData } from "./seed";
import { inheritBulletDomains } from "./filter";

const STORAGE_KEY = "resume-builder-v2";

// The canonical data lives in seed.ts; localStorage is only a runtime cache for
// edits made through the UI. `SEED_SIG` is a hash of the bundled seed — whenever
// seed.ts changes, the signature changes, so every client discards its cached
// data and adopts the new seed on the next load. (Stale caches written before
// this scheme have no signature, so they also fail the check and re-seed.)
function signature(data: unknown): string {
  const str = JSON.stringify(data);
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  return `${str.length}-${(h >>> 0).toString(36)}`;
}

const SEED_SIG = signature(seedData);

interface Persisted extends AppData {
  __seedSig?: string;
}

// Shared by the initial load and the cross-tab listener, so a tab that hears
// about a change applies exactly the same seed-signature rule as a fresh load.
export function parseStored(raw: string | null): AppData {
  if (!raw) return seedData;
  try {
    const parsed = JSON.parse(raw) as Persisted;
    // Seed changed since this cache was written -> adopt the fresh seed.
    if (parsed.__seedSig !== SEED_SIG) return seedData;
    const { __seedSig, ...rest } = parsed;
    const data = { ...seedData, ...rest };
    // Repair caches written before the Settings forms resolved bullet domains
    // on save: a bullet stored with `domainIds: []` is invisible on every resume.
    return {
      ...data,
      projects: data.projects.map((p) => ({ ...p, bullets: inheritBulletDomains(p.bullets, p.domainIds) })),
      experience: data.experience.map((e) => ({ ...e, bullets: inheritBulletDomains(e.bullets, e.domainIds) })),
    };
  } catch {
    return seedData;
  }
}

export function loadData(): AppData {
  if (typeof window === "undefined") return seedData;
  try {
    return parseStored(localStorage.getItem(STORAGE_KEY));
  } catch {
    return seedData;
  }
}

// Fires when *another* tab writes the cache (the browser never delivers a
// `storage` event to the tab that made the write), so editing in /settings
// shows up live in an open /download tab. A removed key (reset) or a cleared
// storage area (`key === null`) re-adopts the seed. Returns an unsubscribe.
export function subscribeToExternalChanges(onChange: (data: AppData) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = (e: StorageEvent) => {
    if (e.storageArea !== localStorage) return;
    if (e.key !== STORAGE_KEY && e.key !== null) return;
    onChange(parseStored(e.newValue));
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}

export function saveData(data: AppData): void {
  if (typeof window === "undefined") return;
  const payload: Persisted = { ...data, __seedSig: SEED_SIG };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function resetData(): AppData {
  if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEY);
  return seedData;
}
