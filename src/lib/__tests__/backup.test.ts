import { parseBackup, serializeBackup, serializeSeedTs } from "../backup";
import { seedData } from "../seed";

describe("backup", () => {
  it("round-trips the seed data through export/import", () => {
    const json = serializeBackup(seedData);
    expect(parseBackup(json)).toEqual(seedData);
  });

  it("strips unknown top-level keys (raw localStorage dumps)", () => {
    const json = JSON.stringify({ ...seedData, __seedSig: "stale-sig" });
    const parsed = parseBackup(json) as unknown as Record<string, unknown>;
    expect(parsed.__seedSig).toBeUndefined();
    expect(parsed).toEqual(seedData);
  });

  it("rejects invalid JSON", () => {
    expect(() => parseBackup("{nope")).toThrow(/not valid JSON/);
  });

  it("rejects a backup without a profile", () => {
    const { profile: _profile, ...rest } = seedData;
    expect(() => parseBackup(JSON.stringify(rest))).toThrow(/profile/);
  });

  it("rejects a backup missing a section array", () => {
    const { skills: _skills, ...rest } = seedData;
    expect(() => parseBackup(JSON.stringify(rest))).toThrow(/skills/);
  });

  it("serializes a seed.ts whose embedded data matches the store", () => {
    const src = serializeSeedTs(seedData);
    expect(src).toContain('import { AppData } from "@/types";');
    expect(src).toContain("export const seedData: AppData = ");
    // The JSON body between the assignment and the trailing `;` must parse
    // back to the exact same data.
    const body = src.slice(src.indexOf("= ") + 2, src.lastIndexOf(";"));
    expect(JSON.parse(body)).toEqual(seedData);
  });
});
