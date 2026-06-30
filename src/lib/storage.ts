import { AppData } from "@/types";
import { seedData } from "./seed";

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

export function loadData(): AppData {
  if (typeof window === "undefined") return seedData;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedData;
    const parsed = JSON.parse(raw) as Persisted;
    // Seed changed since this cache was written -> adopt the fresh seed.
    if (parsed.__seedSig !== SEED_SIG) return seedData;
    const { __seedSig, ...rest } = parsed;
    return { ...seedData, ...rest };
  } catch {
    return seedData;
  }
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
