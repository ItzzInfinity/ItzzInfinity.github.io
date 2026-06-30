import { AppData } from "@/types";
import { seedData } from "./seed";

// Bump this when the seed shape/content changes so clients pick up the new
// data instead of stale localStorage from a previous version.
const STORAGE_KEY = "resume-builder-v2";

export function loadData(): AppData {
  if (typeof window === "undefined") return seedData;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedData;
    // Merge over the seed so fields added in newer versions are never missing.
    return { ...seedData, ...(JSON.parse(raw) as Partial<AppData>) };
  } catch {
    return seedData;
  }
}

export function saveData(data: AppData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function resetData(): AppData {
  if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEY);
  return seedData;
}
