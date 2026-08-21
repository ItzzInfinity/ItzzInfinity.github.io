import {
  applyItemOrder,
  isItemHideId,
  itemHideId,
  visibleItems,
} from "@/lib/visibility";

const items = [{ id: "a" }, { id: "b" }, { id: "c" }];

describe("item hide tokens", () => {
  it("namespaces ids so they cannot collide with bullet ids", () => {
    expect(itemHideId("prj-clock")).toBe("item:prj-clock");
    expect(isItemHideId("item:prj-clock")).toBe(true);
    expect(isItemHideId("prb-clock-1")).toBe(false);
    expect(isItemHideId("section:hobbies")).toBe(false);
  });

  it("drops only the entries whose token is hidden", () => {
    expect(visibleItems(items, new Set([itemHideId("b")]))).toEqual([
      { id: "a" },
      { id: "c" },
    ]);
  });

  it("ignores bullet and section tokens that happen to match an id", () => {
    // A bare id in the hidden list is a BULLET hide, never an entry hide.
    expect(visibleItems(items, new Set(["b", "section:b"]))).toEqual(items);
  });

  it("returns the input untouched when nothing is hidden", () => {
    expect(visibleItems(items, new Set())).toBe(items);
  });
});

describe("applyItemOrder", () => {
  it("reorders to match the given id list", () => {
    expect(applyItemOrder(items, ["c", "a", "b"]).map((i) => i.id)).toEqual([
      "c",
      "a",
      "b",
    ]);
  });

  it("keeps unlisted ids at the end in their original relative order", () => {
    const four = [...items, { id: "d" }];
    expect(applyItemOrder(four, ["c"]).map((i) => i.id)).toEqual([
      "c",
      "a",
      "b",
      "d",
    ]);
  });

  it("never drops content when the saved order is stale", () => {
    expect(applyItemOrder(items, ["gone", "b"]).map((i) => i.id).sort()).toEqual([
      "a",
      "b",
      "c",
    ]);
  });

  it("is a no-op for an empty or missing order", () => {
    expect(applyItemOrder(items, [])).toBe(items);
    expect(applyItemOrder(items)).toBe(items);
  });

  it("does not mutate the input array", () => {
    const input = [...items];
    applyItemOrder(input, ["c", "b", "a"]);
    expect(input.map((i) => i.id)).toEqual(["a", "b", "c"]);
  });
});
