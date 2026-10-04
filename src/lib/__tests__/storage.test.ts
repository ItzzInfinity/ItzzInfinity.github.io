import { saveData, subscribeToExternalChanges } from "@/lib/storage";
import { useResumeStore } from "@/store/useResumeStore";
import { seedData } from "@/lib/seed";

const KEY = "resume-builder-v2";

// jsdom never fires `storage` for the tab's own writes, same as a browser, so
// these tests dispatch the event by hand to simulate another tab's write.
function fireStorage(key: string | null, newValue: string | null) {
  window.dispatchEvent(new StorageEvent("storage", { key, newValue, storageArea: localStorage }));
}

// Produces the exact string another tab's saveData would have written.
function writtenBy(data: typeof seedData): string {
  saveData(data);
  const raw = localStorage.getItem(KEY)!;
  localStorage.removeItem(KEY);
  return raw;
}

describe("cross-tab sync", () => {
  afterEach(() => localStorage.clear());

  it("delivers another tab's write to subscribers", () => {
    const seen: string[] = [];
    const off = subscribeToExternalChanges((d) => seen.push(d.profile.name));
    fireStorage(KEY, writtenBy({ ...seedData, profile: { ...seedData.profile, name: "Other Tab" } }));
    off();
    expect(seen).toEqual(["Other Tab"]);
  });

  it("ignores unrelated keys and stops after unsubscribe", () => {
    const cb = jest.fn();
    const off = subscribeToExternalChanges(cb);
    fireStorage("something-else", "{}");
    off();
    fireStorage(KEY, writtenBy(seedData));
    expect(cb).not.toHaveBeenCalled();
  });

  it("re-adopts the seed when another tab resets (key removed)", () => {
    const cb = jest.fn();
    const off = subscribeToExternalChanges(cb);
    fireStorage(KEY, null);
    off();
    expect(cb).toHaveBeenCalledWith(seedData);
  });

  it("updates the live store without writing back", () => {
    const projects = [{ ...seedData.projects[0], title: "Added in Settings" }];
    fireStorage(KEY, writtenBy({ ...seedData, projects }));
    expect(useResumeStore.getState().projects[0].title).toBe("Added in Settings");
    expect(localStorage.getItem(KEY)).toBeNull();
  });
});

describe("bullet domain repair", () => {
  afterEach(() => localStorage.clear());

  it("gives domain-less bullets their entry's domains on load", () => {
    const project = { ...seedData.projects[0], domainIds: ["pcb"], bullets: [{ id: "b1", text: "typed before a chip", priority: 1, domainIds: [] }] };
    const seen: string[][] = [];
    const off = subscribeToExternalChanges((d) => seen.push(d.projects[0].bullets[0].domainIds));
    fireStorage(KEY, writtenBy({ ...seedData, projects: [project] }));
    off();
    expect(seen).toEqual([["pcb"]]);
  });
});
