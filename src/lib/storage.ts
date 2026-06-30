import { AppData } from "@/types";
import { seedData } from "./seed";

const STORAGE_KEY = "resume-builder-v1";

export function loadData(): AppData {
  if (typeof window === "undefined") return seedData;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedData;
    return JSON.parse(raw) as AppData;
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
