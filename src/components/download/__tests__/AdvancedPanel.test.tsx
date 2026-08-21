import { render, screen, fireEvent, within } from "@testing-library/react";
import AdvancedPanel, { PanelSection } from "@/components/download/AdvancedPanel";
import { DEFAULT_SECTION_ORDER, SECTION_LABELS, SectionKey } from "@/lib/sections";

const sections: PanelSection[] = DEFAULT_SECTION_ORDER.map((key) => ({
  key,
  label: SECTION_LABELS[key],
  items:
    key === "projects"
      ? [
          {
            id: "prj-clock",
            label: "Seven-Segment Smart Clock",
            bullets: [
              { id: "prb-clock-1", text: "Designed the board." },
              { id: "prb-clock-2", text: "Wrote the firmware." },
            ],
          },
          { id: "prj-fm", label: "FM Radio", bullets: [] },
        ]
      : key === "hobbies"
      ? [{ id: "hob-1", label: "Repairing electronics", bullets: [] }]
      : [],
}));

function setup(hidden: string[] = []) {
  const onToggleHidden = jest.fn();
  const onItemOrderChange = jest.fn();
  render(
    <AdvancedPanel
      sectionOrder={[...DEFAULT_SECTION_ORDER] as SectionKey[]}
      onSectionOrderChange={jest.fn()}
      manualMode
      onManualModeChange={jest.fn()}
      manualHidden={new Set(hidden)}
      onToggleHidden={onToggleHidden}
      sections={sections}
      onItemOrderChange={onItemOrderChange}
    />
  );
  return { onToggleHidden, onItemOrderChange };
}

const expander = (label: string) =>
  screen.getByRole("button", { name: new RegExp(`^${label}`) });

const headerRow = (label: string) => expander(label).parentElement!;

describe("AdvancedPanel manual override", () => {
  it("collapses every section by default so a long portfolio stays readable", () => {
    setup();
    expect(screen.queryByText("Seven-Segment Smart Clock")).not.toBeInTheDocument();
    expect(within(headerRow("Projects")).getByText("2/2")).toBeInTheDocument();
  });

  it("hides a whole section from its own checkbox", () => {
    const { onToggleHidden } = setup();
    fireEvent.click(screen.getByLabelText("Include Hobbies"));
    expect(onToggleHidden).toHaveBeenCalledWith("section:hobbies", true);
  });

  it("hides a whole project entry - what per-bullet checkboxes could not do", () => {
    const { onToggleHidden } = setup();
    fireEvent.click(expander("Projects"));
    fireEvent.click(screen.getByLabelText("Include Seven-Segment Smart Clock"));
    expect(onToggleHidden).toHaveBeenCalledWith("item:prj-clock", true);
  });

  it("still exposes individual bullets one level deeper", () => {
    const { onToggleHidden } = setup();
    fireEvent.click(expander("Projects"));
    fireEvent.click(expander("Seven-Segment Smart Clock"));
    fireEvent.click(screen.getByLabelText(/Designed the board/));
    expect(onToggleHidden).toHaveBeenCalledWith("prb-clock-1", true);
  });

  it("gives entries with no bullets no expander to open", () => {
    setup();
    fireEvent.click(expander("Projects"));
    expect(expander("FM Radio")).toBeDisabled();
  });

  it("reflects already-hidden ids as unchecked and counts what will render", () => {
    setup(["item:prj-clock", "section:hobbies"]);
    expect(screen.getByLabelText("Include Hobbies")).not.toBeChecked();
    fireEvent.click(expander("Projects"));
    expect(screen.getByLabelText("Include Seven-Segment Smart Clock")).not.toBeChecked();
    expect(within(headerRow("Projects")).getByText("1/2")).toBeInTheDocument();
  });

  it("re-checking a hidden entry asks for it to be shown again", () => {
    const { onToggleHidden } = setup(["item:prj-clock"]);
    fireEvent.click(expander("Projects"));
    fireEvent.click(screen.getByLabelText("Include Seven-Segment Smart Clock"));
    expect(onToggleHidden).toHaveBeenCalledWith("item:prj-clock", false);
  });

  it("offers a drag handle per entry so projects can be reordered", () => {
    setup();
    const before = screen.getAllByRole("button", { name: "Drag to reorder" }).length;
    fireEvent.click(expander("Projects"));
    const after = screen.getAllByRole("button", { name: "Drag to reorder" }).length;
    expect(before).toBe(DEFAULT_SECTION_ORDER.length); // section-order list only
    expect(after).toBe(before + 2); // + the two project entries
  });
});
