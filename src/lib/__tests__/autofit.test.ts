import { countPdfPages, removableBulletIds, collectBullets } from "@/lib/autofit";

// jsdom has no TextEncoder; the fixture strings are pure ASCII anyway.
function bytes(s: string): Uint8Array {
  return Uint8Array.from(s, (c) => c.charCodeAt(0));
}

describe("countPdfPages", () => {
  it("counts /Type /Page objects, ignoring the /Pages tree node", () => {
    const pdf =
      "%PDF-1.3\n" +
      "1 0 obj\n<< /Type /Pages /Count 2 /Kids [2 0 R 3 0 R] >>\nendobj\n" +
      "2 0 obj\n<< /Type /Page /Parent 1 0 R >>\nendobj\n" +
      "3 0 obj\n<< /Type /Page /Parent 1 0 R >>\nendobj\n" +
      "%%EOF";
    expect(countPdfPages(bytes(pdf))).toBe(2);
  });

  it("counts a single-page document as 1", () => {
    const pdf =
      "%PDF-1.3\n" +
      "1 0 obj\n<< /Type /Pages /Count 1 /Kids [2 0 R] >>\nendobj\n" +
      "2 0 obj\n<< /Type /Page /Parent 1 0 R >>\nendobj\n%%EOF";
    expect(countPdfPages(bytes(pdf))).toBe(1);
  });

  it("falls back to the /Pages /Count when page dicts are not visible", () => {
    const pdf = "%PDF-1.3\n1 0 obj\n<< /Type /Pages /Count 3 >>\nendobj\n%%EOF";
    expect(countPdfPages(bytes(pdf))).toBe(3);
  });
});

describe("removableBulletIds", () => {
  const projects = [
    {
      bullets: [
        { id: "p1", text: "a", priority: 1, domainIds: ["vlsi"] },
        { id: "p9", text: "b", priority: 9, domainIds: ["vlsi"] },
        { id: "px", text: "c", priority: 2, domainIds: ["embedded"] },
      ],
    },
  ];
  const experience = [
    {
      bullets: [
        { id: "e5", text: "d", priority: 5, domainIds: ["vlsi", "embedded"] },
      ],
    },
  ];

  it("orders lowest-priority (highest number) first and filters by domain", () => {
    expect(removableBulletIds(projects, experience, "vlsi")).toEqual([
      "p9",
      "e5",
      "p1",
    ]);
  });

  it("excludes bullets not mapped to the domain", () => {
    expect(removableBulletIds(projects, experience, "embedded")).toEqual([
      "e5",
      "px",
    ]);
  });
});

describe("collectBullets", () => {
  it("sorts ascending by priority across projects and experience", () => {
    const flat = collectBullets(
      [{ id: "proj", bullets: [{ id: "b2", text: "x", priority: 2, domainIds: [] }] }],
      [{ id: "exp", bullets: [{ id: "b1", text: "y", priority: 1, domainIds: [] }] }]
    );
    expect(flat.map((b) => b.id)).toEqual(["b1", "b2"]);
  });
});
