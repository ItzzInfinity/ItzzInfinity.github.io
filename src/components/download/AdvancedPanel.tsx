"use client";
import { useState } from "react";
import { SECTION_LABELS, SectionKey, DEFAULT_SECTION_ORDER } from "@/lib/sections";
import { ItemizedSection, itemHideId } from "@/lib/visibility";
import SortableList from "@/components/settings/SortableList";

/**
 * Advanced controls for the Download page (hidden behind the Advanced
 * toggle): drag-to-reorder resume sections, and a manual override mode that
 * replaces auto-fit with an explicit content picker.
 *
 * The picker is an accordion — every section collapses to a single row, so a
 * long portfolio stays navigable — and offers three grains of control:
 *
 *   - the section checkbox hides the whole section  (`section:<key>`)
 *   - an entry checkbox hides that one entry        (`item:<id>`)
 *   - a bullet checkbox hides one bullet            (the bullet's own id)
 *
 * Entries inside a section can also be dragged, which reorders them on the
 * resume itself (projects included). Everything here is runtime-only state —
 * nothing is persisted to the store.
 */

export interface PanelItem {
  id: string;
  label: string;
  /** Bullets belonging to this entry (experience and projects only). */
  bullets: { id: string; text: string }[];
}

export interface PanelSection {
  key: SectionKey;
  label: string;
  /** Empty for `summary`, which the section checkbox alone covers. */
  items: PanelItem[];
}

interface AdvancedPanelProps {
  sectionOrder: SectionKey[];
  onSectionOrderChange: (order: SectionKey[]) => void;
  manualMode: boolean;
  onManualModeChange: (on: boolean) => void;
  // Hidden ids (bullets + `section:` + `item:` tokens) while manual mode is on.
  manualHidden: Set<string>;
  onToggleHidden: (id: string, hidden: boolean) => void;
  sections: PanelSection[];
  onItemOrderChange: (section: ItemizedSection, ids: string[]) => void;
}

export default function AdvancedPanel({
  sectionOrder,
  onSectionOrderChange,
  manualMode,
  onManualModeChange,
  manualHidden,
  onToggleHidden,
  sections,
  onItemOrderChange,
}: AdvancedPanelProps) {
  const orderChanged = sectionOrder.some((k, i) => k !== DEFAULT_SECTION_ORDER[i]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggleExpanded(key: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <div className="space-y-5 border border-slate-700 rounded-lg p-3 bg-slate-800/50">
      {/* Section order */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-slate-400 uppercase tracking-wide">Section Order</p>
          {orderChanged && (
            <button
              onClick={() => onSectionOrderChange([...DEFAULT_SECTION_ORDER])}
              className="text-xs text-cyan-400 hover:text-cyan-300"
            >
              Reset
            </button>
          )}
        </div>
        <SortableList
          items={sectionOrder.map((key) => ({ id: key }))}
          onReorder={(items) => onSectionOrderChange(items.map((i) => i.id as SectionKey))}
          renderItem={(item) => (
            <div className="text-sm text-slate-300 bg-slate-800 border border-slate-700 rounded px-2 py-1">
              {SECTION_LABELS[item.id as SectionKey]}
            </div>
          )}
          className="space-y-1"
        />
      </div>

      {/* Manual content override */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={manualMode}
            onChange={(e) => onManualModeChange(e.target.checked)}
            className="accent-cyan-400"
          />
          <span className="text-sm text-slate-200 font-medium">Override auto-fit</span>
        </label>
        <p className="text-xs text-slate-500 mt-1">
          Pick exactly what appears, ignoring priorities. Untick a whole section or a
          single entry, or open one to pick bullets. Drag entries to reorder them on
          the resume. Starts from what auto-fit chose.
        </p>

        {manualMode && (
          <div className="mt-3 space-y-1 max-h-[28rem] overflow-y-auto pr-1">
            {sectionOrder.map((key) => {
              const section = sections.find((s) => s.key === key);
              if (!section) return null;
              return (
                <SectionAccordion
                  key={key}
                  section={section}
                  open={expanded.has(key)}
                  onToggleOpen={() => toggleExpanded(key)}
                  openItems={expanded}
                  onToggleOpenItem={toggleExpanded}
                  manualHidden={manualHidden}
                  onToggleHidden={onToggleHidden}
                  onItemOrderChange={onItemOrderChange}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function SectionAccordion({
  section,
  open,
  onToggleOpen,
  openItems,
  onToggleOpenItem,
  manualHidden,
  onToggleHidden,
  onItemOrderChange,
}: {
  section: PanelSection;
  open: boolean;
  onToggleOpen: () => void;
  openItems: Set<string>;
  onToggleOpenItem: (key: string) => void;
  manualHidden: Set<string>;
  onToggleHidden: (id: string, hidden: boolean) => void;
  onItemOrderChange: (section: ItemizedSection, ids: string[]) => void;
}) {
  const sectionToken = `section:${section.key}`;
  const sectionOn = !manualHidden.has(sectionToken);
  const shownItems = section.items.filter((i) => !manualHidden.has(itemHideId(i.id))).length;

  return (
    <div className="border border-slate-700 rounded bg-slate-800/60">
      <div className="flex items-center gap-2 px-2 py-1.5">
        <input
          type="checkbox"
          checked={sectionOn}
          onChange={(e) => onToggleHidden(sectionToken, !e.target.checked)}
          className="accent-cyan-400 shrink-0"
          aria-label={`Include ${section.label}`}
        />
        <button
          type="button"
          onClick={onToggleOpen}
          disabled={section.items.length === 0}
          className="flex-1 flex items-center justify-between gap-2 text-left disabled:cursor-default"
        >
          <span
            className={`text-sm ${sectionOn ? "text-slate-200" : "text-slate-500 line-through"}`}
          >
            {section.label}
          </span>
          <span className="flex items-center gap-2 shrink-0">
            {section.items.length > 0 && (
              <span className="text-[11px] text-slate-500">
                {shownItems}/{section.items.length}
              </span>
            )}
            {section.items.length > 0 && (
              <span className="text-slate-500 text-xs">{open ? "▾" : "▸"}</span>
            )}
          </span>
        </button>
      </div>

      {open && section.items.length > 0 && (
        <div className={`px-2 pb-2 ${sectionOn ? "" : "opacity-50"}`}>
          <SortableList
            items={section.items}
            onReorder={(items) =>
              onItemOrderChange(
                section.key as ItemizedSection,
                items.map((i) => i.id)
              )
            }
            renderItem={(item) => (
              <ItemRow
                item={item}
                open={openItems.has(item.id)}
                onToggleOpen={() => onToggleOpenItem(item.id)}
                manualHidden={manualHidden}
                onToggleHidden={onToggleHidden}
              />
            )}
            className="space-y-1"
          />
        </div>
      )}
    </div>
  );
}

function ItemRow({
  item,
  open,
  onToggleOpen,
  manualHidden,
  onToggleHidden,
}: {
  item: PanelItem;
  open: boolean;
  onToggleOpen: () => void;
  manualHidden: Set<string>;
  onToggleHidden: (id: string, hidden: boolean) => void;
}) {
  const token = itemHideId(item.id);
  const itemOn = !manualHidden.has(token);
  const shownBullets = item.bullets.filter((b) => !manualHidden.has(b.id)).length;

  return (
    <div className="rounded bg-slate-900/50 border border-slate-800">
      <div className="flex items-center gap-2 px-2 py-1">
        <input
          type="checkbox"
          checked={itemOn}
          onChange={(e) => onToggleHidden(token, !e.target.checked)}
          className="accent-cyan-400 shrink-0"
          aria-label={`Include ${item.label}`}
        />
        <button
          type="button"
          onClick={onToggleOpen}
          disabled={item.bullets.length === 0}
          className="flex-1 flex items-center justify-between gap-2 text-left min-w-0 disabled:cursor-default"
        >
          <span
            className={`text-xs truncate ${itemOn ? "text-slate-300" : "text-slate-600 line-through"}`}
            title={item.label}
          >
            {item.label}
          </span>
          {item.bullets.length > 0 && (
            <span className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] text-slate-500">
                {shownBullets}/{item.bullets.length}
              </span>
              <span className="text-slate-500 text-xs">{open ? "▾" : "▸"}</span>
            </span>
          )}
        </button>
      </div>

      {open && item.bullets.length > 0 && (
        <div className={`pl-7 pr-2 pb-1.5 space-y-1 ${itemOn ? "" : "opacity-50"}`}>
          {item.bullets.map((b) => (
            <label key={b.id} className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={!manualHidden.has(b.id)}
                onChange={(e) => onToggleHidden(b.id, !e.target.checked)}
                className="accent-cyan-400 mt-0.5 shrink-0"
              />
              <span className="text-[11px] text-slate-400 leading-snug" title={b.text}>
                {b.text.length > 90 ? `${b.text.slice(0, 90)}…` : b.text}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
