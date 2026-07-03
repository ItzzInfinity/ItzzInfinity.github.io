"use client";
import { Experience, Project } from "@/types";
import { filterBulletsByDomain } from "@/lib/filter";
import { DEFAULT_SECTION_ORDER, SECTION_LABELS, SectionKey } from "@/lib/sections";
import SortableList from "@/components/settings/SortableList";

/**
 * Advanced controls for the Download page (hidden behind the Advanced
 * toggle): drag-to-reorder resume sections, and a manual override mode that
 * replaces auto-fit with explicit per-section / per-bullet checkboxes for a
 * quick one-off download. Everything here is runtime-only state — nothing is
 * persisted to the store.
 */
interface AdvancedPanelProps {
  sectionOrder: SectionKey[];
  onSectionOrderChange: (order: SectionKey[]) => void;
  manualMode: boolean;
  onManualModeChange: (on: boolean) => void;
  // Hidden ids (bullets + `section:` tokens) while manual mode is active.
  manualHidden: Set<string>;
  onToggleHidden: (id: string, hidden: boolean) => void;
  domainId: string;
  experience: Experience[];
  projects: Project[];
}

export default function AdvancedPanel({
  sectionOrder,
  onSectionOrderChange,
  manualMode,
  onManualModeChange,
  manualHidden,
  onToggleHidden,
  domainId,
  experience,
  projects,
}: AdvancedPanelProps) {
  const orderChanged = sectionOrder.some((k, i) => k !== DEFAULT_SECTION_ORDER[i]);

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
          Pick exactly which sections and bullets appear, ignoring priorities. Starts
          from what auto-fit chose.
        </p>

        {manualMode && (
          <div className="mt-3 space-y-4 max-h-96 overflow-y-auto pr-1">
            {/* Sections */}
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Sections</p>
              <div className="space-y-1">
                {sectionOrder.map((key) => {
                  const token = `section:${key}`;
                  return (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!manualHidden.has(token)}
                        onChange={(e) => onToggleHidden(token, !e.target.checked)}
                        className="accent-cyan-400"
                      />
                      <span className="text-sm text-slate-300">{SECTION_LABELS[key]}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Experience bullets */}
            {experience.map((exp) => {
              const bullets = filterBulletsByDomain(exp.bullets, domainId);
              if (bullets.length === 0) return null;
              return (
                <BulletGroup
                  key={exp.id}
                  title={`${exp.role}${exp.company ? `, ${exp.company}` : ""}`}
                  bullets={bullets}
                  manualHidden={manualHidden}
                  onToggleHidden={onToggleHidden}
                />
              );
            })}

            {/* Project bullets */}
            {projects.map((proj) => {
              const bullets = filterBulletsByDomain(proj.bullets, domainId);
              if (bullets.length === 0) return null;
              return (
                <BulletGroup
                  key={proj.id}
                  title={proj.title}
                  bullets={bullets}
                  manualHidden={manualHidden}
                  onToggleHidden={onToggleHidden}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function BulletGroup({
  title,
  bullets,
  manualHidden,
  onToggleHidden,
}: {
  title: string;
  bullets: { id: string; text: string }[];
  manualHidden: Set<string>;
  onToggleHidden: (id: string, hidden: boolean) => void;
}) {
  return (
    <div>
      <p className="text-xs text-slate-400 mb-1 truncate" title={title}>
        {title}
      </p>
      <div className="space-y-1">
        {bullets.map((b) => (
          <label key={b.id} className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={!manualHidden.has(b.id)}
              onChange={(e) => onToggleHidden(b.id, !e.target.checked)}
              className="accent-cyan-400 mt-0.5 shrink-0"
            />
            <span className="text-xs text-slate-400 leading-snug" title={b.text}>
              {b.text.length > 90 ? `${b.text.slice(0, 90)}…` : b.text}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
