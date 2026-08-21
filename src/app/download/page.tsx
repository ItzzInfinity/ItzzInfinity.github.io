"use client";
import React, { useRef, useState, useMemo, useCallback, useEffect, useLayoutEffect } from "react";
import { useResumeStore } from "@/store/useResumeStore";
import ResumePreview, { A4_PX_HEIGHT } from "@/components/resume/ResumePreview";
import type { ResumeDocumentProps } from "@/components/resume/ResumeDocument";
import type { DocumentProps } from "@react-pdf/renderer";
import { filterByDomain, filterBulletsByDomain } from "@/lib/filter";
import { isOverflowing, removableItemIds, countPdfPages } from "@/lib/autofit";
import { DEFAULT_SECTION_ORDER, SECTION_LABELS, SectionKey } from "@/lib/sections";
import {
  ItemOrder,
  ItemizedSection,
  applyItemOrder,
  isItemHideId,
  visibleItems,
} from "@/lib/visibility";
import AdvancedPanel, { PanelSection } from "@/components/download/AdvancedPanel";

type PageMode = "1" | "2";

// Stable identity so `effectiveHidden` does not churn in 2-page mode.
const EMPTY_HIDDEN: string[] = [];

export default function DownloadPage() {
  const store = useResumeStore();
  const topLevelDomains = useMemo(
    () => store.domains.filter((d) => !d.parentId && d.enabled),
    [store.domains]
  );
  const [selectedDomain, setSelectedDomain] = useState(topLevelDomains[0]?.id ?? "");
  const [customText, setCustomText] = useState("");
  const [pageMode, setPageMode] = useState<PageMode>("1");
  const [hiddenBulletIds, setHiddenBulletIds] = useState<string[]>([]);
  const [fitting, setFitting] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [overflowed, setOverflowed] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [contentHeight, setContentHeight] = useState(A4_PX_HEIGHT);
  // Advanced panel: runtime-only section reorder + manual content override.
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [sectionOrder, setSectionOrder] = useState<SectionKey[]>([...DEFAULT_SECTION_ORDER]);
  const [manualMode, setManualMode] = useState(false);
  const [manualHidden, setManualHidden] = useState<string[]>([]);
  // Runtime-only per-section entry order (Advanced panel drag handles).
  const [itemOrder, setItemOrder] = useState<ItemOrder>({});
  const previewRef = useRef<HTMLDivElement>(null);

  const singlePage = pageMode === "1";

  // Hidden ids the preview/PDF actually use: the user's explicit selection in
  // manual mode, the auto-fit result in 1-page mode, nothing in 2-page mode.
  const effectiveHidden = useMemo(
    () => (manualMode ? manualHidden : singlePage ? hiddenBulletIds : EMPTY_HIDDEN),
    [manualMode, manualHidden, singlePage, hiddenBulletIds]
  );

  // Track the preview's rendered height so 2-page mode can draw a page break
  // at each A4 boundary instead of showing one long continuous sheet.
  useEffect(() => {
    const el = previewRef.current;
    if (!el) return;
    const update = () => setContentHeight(el.scrollHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [singlePage, selectedDomain, customText, hiddenBulletIds]);

  // In 2-page mode, one dashed break line per A4 boundary the content crosses.
  const pageBreaks = singlePage
    ? []
    : Array.from(
        { length: Math.max(0, Math.ceil(contentHeight / A4_PX_HEIGHT) - 1) },
        (_, i) => (i + 1) * A4_PX_HEIGHT
      );

  // Memoised so identities are stable across renders (prevents effect thrash).
  // Each list is domain-filtered, then put into the Advanced panel's runtime
  // order (a no-op until the user drags something).
  const filteredSkills = useMemo(() => applyItemOrder(filterByDomain(store.skills, selectedDomain), itemOrder.skills), [store.skills, selectedDomain, itemOrder.skills]);
  const filteredExperience = useMemo(() => applyItemOrder(filterByDomain(store.experience, selectedDomain), itemOrder.experience), [store.experience, selectedDomain, itemOrder.experience]);
  const filteredProjects = useMemo(() => applyItemOrder(filterByDomain(store.projects, selectedDomain), itemOrder.projects), [store.projects, selectedDomain, itemOrder.projects]);
  const filteredCerts = useMemo(() => applyItemOrder(filterByDomain(store.certifications, selectedDomain), itemOrder.certifications), [store.certifications, selectedDomain, itemOrder.certifications]);
  const filteredAwards = useMemo(() => applyItemOrder(filterByDomain(store.awards, selectedDomain), itemOrder.awards), [store.awards, selectedDomain, itemOrder.awards]);
  const orderedEducation = useMemo(() => applyItemOrder(store.education, itemOrder.education), [store.education, itemOrder.education]);
  const orderedLanguages = useMemo(() => applyItemOrder(store.languages, itemOrder.languages), [store.languages, itemOrder.languages]);
  const orderedStrengths = useMemo(() => applyItemOrder(store.strengths, itemOrder.strengths), [store.strengths, itemOrder.strengths]);
  const orderedHobbies = useMemo(() => applyItemOrder(store.hobbies, itemOrder.hobbies), [store.hobbies, itemOrder.hobbies]);

  // Per-domain title shown under the name; falls back to the profile title.
  const headerTitle = useMemo(() => {
    const d = store.domains.find((x) => x.id === selectedDomain);
    return d?.resumeTitle ?? store.profile.title;
  }, [store.domains, selectedDomain, store.profile.title]);

  // Per-domain summary paragraph; falls back to the profile about text.
  const summaryText = useMemo(() => {
    const d = store.domains.find((x) => x.id === selectedDomain);
    return d?.summary ?? store.profile.about;
  }, [store.domains, selectedDomain, store.profile.about]);

  // Ordered trim sequence: bullets lowest-priority-first, then optional
  // sections (as `section:<name>` tokens) least-important-first.
  const removableOrder = useMemo(
    () => removableItemIds(filteredProjects, filteredExperience, selectedDomain),
    [filteredProjects, filteredExperience, selectedDomain]
  );

  // Everything the PDF needs except hiddenBulletIds; shared by the verify
  // pass and the download handler so both render the exact same document.
  const baseDocProps = useMemo<Omit<ResumeDocumentProps, "hiddenBulletIds">>(
    () => ({
      domainId: selectedDomain,
      customText,
      profile: store.profile,
      skills: filteredSkills,
      experience: filteredExperience,
      education: orderedEducation,
      projects: filteredProjects,
      certifications: filteredCerts,
      awards: filteredAwards,
      languages: orderedLanguages,
      hobbies: orderedHobbies,
      strengths: orderedStrengths,
      headerTitle,
      summaryText,
      sectionOrder,
    }),
    [
      selectedDomain,
      customText,
      store.profile,
      filteredSkills,
      filteredExperience,
      orderedEducation,
      filteredProjects,
      filteredCerts,
      filteredAwards,
      orderedLanguages,
      orderedHobbies,
      orderedStrengths,
      headerTitle,
      summaryText,
      sectionOrder,
    ]
  );

  // Single place that turns a hidden-id list into a complete set of renderer
  // props. Bullet ids and `section:` tokens are passed through for the
  // renderers to interpret; `item:` tokens are applied HERE, by dropping whole
  // entries from the arrays, so the preview and the PDF cannot disagree about
  // which entries exist. Auto-fit never emits `item:` tokens, so this is an
  // identity transform outside manual override.
  const docPropsFor = useCallback(
    (hidden: string[]): ResumeDocumentProps => {
      if (!hidden.some(isItemHideId)) {
        return { ...baseDocProps, hiddenBulletIds: hidden };
      }
      const set = new Set(hidden);
      return {
        ...baseDocProps,
        skills: visibleItems(baseDocProps.skills, set),
        experience: visibleItems(baseDocProps.experience, set),
        education: visibleItems(baseDocProps.education, set),
        projects: visibleItems(baseDocProps.projects, set),
        certifications: visibleItems(baseDocProps.certifications, set),
        awards: visibleItems(baseDocProps.awards, set),
        languages: visibleItems(baseDocProps.languages, set),
        hobbies: visibleItems(baseDocProps.hobbies, set),
        strengths: visibleItems(baseDocProps.strengths ?? [], set),
        hiddenBulletIds: hidden,
      };
    },
    [baseDocProps]
  );

  // Manual selections reference the current domain's bullet ids, so a domain
  // switch always drops back to auto-fit.
  useEffect(() => {
    setManualMode(false);
    setManualHidden([]);
    setItemOrder({});
  }, [selectedDomain]);

  // Restart the fit pass whenever the resume content, section order or page
  // mode changes. Auto-fit only runs in single-page mode (2-page mode lets
  // content flow) and is suspended entirely while manual override is active.
  useEffect(() => {
    if (manualMode) return;
    setHiddenBulletIds([]);
    setOverflowed(false);
    setFitting(singlePage);
  }, [selectedDomain, customText, removableOrder, singlePage, sectionOrder, itemOrder, manualMode]);

  // Convergent auto-fit (single-page only): remove one lowest-priority bullet
  // per render until the preview fits one A4 page, or nothing is left to trim.
  // If it still overflows after exhausting removable bullets, flag overflow so
  // the user can switch to a 2-page layout.
  useLayoutEffect(() => {
    if (!fitting || manualMode) return;
    const el = previewRef.current;
    if (!el) return;
    if (isOverflowing(el) && hiddenBulletIds.length < removableOrder.length) {
      setHiddenBulletIds(removableOrder.slice(0, hiddenBulletIds.length + 1));
    } else {
      setFitting(false);
      setOverflowed(isOverflowing(el));
    }
  }, [fitting, manualMode, hiddenBulletIds.length, removableOrder]);

  // Ref mirror so the verify pass can read the HTML pass's result without
  // depending on hiddenBulletIds (which it also writes).
  const hiddenRef = useRef<string[]>(hiddenBulletIds);
  hiddenRef.current = hiddenBulletIds;

  // Self-check pass (single-page only). The HTML preview only approximates
  // react-pdf's Helvetica metrics, so after the fast on-screen fit converges,
  // render the REAL PDF, count its pages, and keep trimming until the PDF
  // itself is one page. Bounded: each iteration hides one more bullet and the
  // loop stops when removableOrder is exhausted; the whole loop runs inside
  // one effect invocation and hiddenBulletIds is written once at the end, so
  // this cannot re-trigger itself.
  useEffect(() => {
    if (!singlePage || fitting || manualMode) return;
    let cancelled = false;
    (async () => {
      setVerifying(true);
      try {
        const [{ pdf }, mod] = await Promise.all([
          import("@react-pdf/renderer"),
          import("@/components/resume/ResumeDocument"),
        ]);
        let hidden = hiddenRef.current;
        let fits = false;
        for (;;) {
          if (cancelled) return;
          const element = React.createElement(
            mod.default,
            docPropsFor(hidden)
          ) as React.ReactElement<DocumentProps>;
          const blob = await pdf(element).toBlob();
          const bytes = new Uint8Array(await blob.arrayBuffer());
          if (countPdfPages(bytes) <= 1) {
            fits = true;
            break;
          }
          if (hidden.length >= removableOrder.length) break;
          hidden = removableOrder.slice(0, hidden.length + 1);
        }
        if (!cancelled) {
          setHiddenBulletIds(hidden);
          setOverflowed(!fits);
        }
      } finally {
        if (!cancelled) setVerifying(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fitting, singlePage, manualMode, removableOrder, docPropsFor]);

  // Manual override: never trim, but still render the real PDF once per
  // change to warn (not fix) when the explicit selection exceeds one page.
  useEffect(() => {
    if (!manualMode || !singlePage) return;
    let cancelled = false;
    (async () => {
      setVerifying(true);
      try {
        const [{ pdf }, mod] = await Promise.all([
          import("@react-pdf/renderer"),
          import("@/components/resume/ResumeDocument"),
        ]);
        const element = React.createElement(
          mod.default,
          docPropsFor(manualHidden)
        ) as React.ReactElement<DocumentProps>;
        const blob = await pdf(element).toBlob();
        const bytes = new Uint8Array(await blob.arrayBuffer());
        if (!cancelled) setOverflowed(countPdfPages(bytes) > 1);
      } finally {
        if (!cancelled) setVerifying(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [manualMode, singlePage, manualHidden, docPropsFor]);

  // What the Advanced panel's content picker shows: every section with its
  // entries, in the order they will actually render. Built from the same
  // domain-filtered lists the resume uses, and NOT filtered by manualHidden —
  // a hidden entry must stay in the list so it can be ticked back on.
  const panelSections = useMemo<PanelSection[]>(() => {
    const bulletsFor = (bullets: { id: string; text: string; priority: number; domainIds: string[] }[]) =>
      filterBulletsByDomain(bullets, selectedDomain).map((b) => ({ id: b.id, text: b.text }));
    const plain = <T extends { id: string }>(items: T[], label: (i: T) => string) =>
      items.map((i) => ({ id: i.id, label: label(i), bullets: [] }));

    const byKey: Record<SectionKey, PanelSection["items"]> = {
      summary: [],
      experience: filteredExperience.map((e) => ({
        id: e.id,
        label: `${e.role}${e.company ? `, ${e.company}` : ""}`,
        bullets: bulletsFor(e.bullets),
      })),
      education: plain(orderedEducation, (e) => `${e.degree}${e.institute ? ` - ${e.institute}` : ""}`),
      skills: plain(filteredSkills, (s) => `${s.category}: ${s.name}`),
      projects: filteredProjects.map((p) => ({
        id: p.id,
        label: p.title,
        bullets: bulletsFor(p.bullets),
      })),
      certifications: plain(filteredCerts, (c) => `${c.name}${c.issuer ? ` - ${c.issuer}` : ""}`),
      awards: plain(filteredAwards, (a) => `${a.title}${a.organization ? ` - ${a.organization}` : ""}`),
      languages: plain(orderedLanguages, (l) => `${l.name} (${l.proficiency})`),
      strengths: plain(orderedStrengths, (x) => x.name),
      hobbies: plain(orderedHobbies, (h) => h.name),
    };

    return DEFAULT_SECTION_ORDER.map((key) => ({
      key,
      label: SECTION_LABELS[key],
      items: byKey[key],
    }));
  }, [
    selectedDomain,
    filteredExperience,
    filteredProjects,
    filteredSkills,
    filteredCerts,
    filteredAwards,
    orderedEducation,
    orderedLanguages,
    orderedStrengths,
    orderedHobbies,
  ]);

  function handleItemOrderChange(section: ItemizedSection, ids: string[]) {
    setItemOrder((prev) => ({ ...prev, [section]: ids }));
  }

  const previewProps = useMemo(() => docPropsFor(effectiveHidden), [docPropsFor, effectiveHidden]);
  const previewHiddenSet = useMemo(() => new Set(effectiveHidden), [effectiveHidden]);
  const manualHiddenSet = useMemo(() => new Set(manualHidden), [manualHidden]);

  function handleManualModeChange(on: boolean) {
    setManualMode(on);
    if (on) {
      // Halt any in-flight auto-fit and seed the checkboxes from its result,
      // so manual mode starts at "what you currently see".
      setFitting(false);
      setVerifying(false);
      setManualHidden(singlePage ? [...hiddenBulletIds] : []);
    }
    // Turning it off restarts the auto-fit pass (reset effect keys on manualMode).
  }

  function handleToggleHidden(id: string, hide: boolean) {
    setManualHidden((prev) =>
      hide ? (prev.includes(id) ? prev : [...prev, id]) : prev.filter((x) => x !== id)
    );
  }

  const trimmedBullets = hiddenBulletIds.filter((id) => !id.startsWith("section:")).length;
  const trimmedSections = hiddenBulletIds
    .filter((id) => id.startsWith("section:"))
    .map((id) => id.slice("section:".length));

  async function handleDownload() {
    setDownloading(true);
    try {
      const [{ pdf }, mod] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/components/resume/ResumeDocument"),
      ]);
      // Manual override wins; otherwise 1-page mode uses the auto-fit trim
      // and 2-page mode trims nothing (react-pdf paginates automatically).
      const element = React.createElement(
        mod.default,
        docPropsFor(effectiveHidden)
      ) as React.ReactElement<DocumentProps>;
      const blob = await pdf(element).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${store.profile.name.replace(/\s+/g, "_")}_${selectedDomain}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">Download Resume</h1>

      <div className="flex gap-8 flex-wrap lg:flex-nowrap">
        {/* Controls */}
        <aside className="w-full lg:w-64 shrink-0 space-y-6">
          <div>
            <p className="text-sm text-slate-400 uppercase tracking-wide mb-3">Select Domain</p>
            <div className="space-y-2">
              {topLevelDomains.map((d) => {
                const subDomains = store.domains.filter((s) => s.parentId === d.id && s.enabled);
                return (
                  <div key={d.id} className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="domain"
                        value={d.id}
                        checked={selectedDomain === d.id}
                        onChange={() => setSelectedDomain(d.id)}
                        className="accent-cyan-400"
                      />
                      <span className="text-slate-300 group-hover:text-white">{d.name}</span>
                    </label>
                    {subDomains.length > 0 && (
                      <div className="ml-6 space-y-2 border-l border-slate-700 pl-3">
                        {subDomains.map((s) => (
                          <label key={s.id} className="flex items-center gap-3 cursor-pointer group">
                            <input
                              type="radio"
                              name="domain"
                              value={s.id}
                              checked={selectedDomain === s.id}
                              onChange={() => setSelectedDomain(s.id)}
                              className="accent-cyan-400"
                            />
                            <span className="text-sm text-slate-400 group-hover:text-white">{s.name}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-sm text-slate-400 uppercase tracking-wide mb-2">Layout</p>
            <div className="flex gap-2">
              {(["1", "2"] as PageMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setPageMode(m)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    pageMode === m
                      ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/50"
                      : "bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200"
                  }`}
                >
                  {m} Page{m === "2" ? "s" : ""}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm text-slate-400 uppercase tracking-wide mb-2">Custom Note</p>
            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Add a custom line to the resume..."
              rows={3}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 resize-none focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <button
              onClick={() => setAdvancedOpen((o) => !o)}
              className="w-full flex items-center justify-between text-sm text-slate-400 hover:text-slate-200 border border-slate-700 rounded-lg px-3 py-2 transition-colors"
            >
              <span className="uppercase tracking-wide">Advanced</span>
              <span>{advancedOpen ? "▾" : "▸"}</span>
            </button>
            {advancedOpen && (
              <div className="mt-3">
                <AdvancedPanel
                  sectionOrder={sectionOrder}
                  onSectionOrderChange={setSectionOrder}
                  manualMode={manualMode}
                  onManualModeChange={handleManualModeChange}
                  manualHidden={manualHiddenSet}
                  onToggleHidden={handleToggleHidden}
                  sections={panelSections}
                  onItemOrderChange={handleItemOrderChange}
                />
              </div>
            )}
          </div>

          <button
            onClick={handleDownload}
            disabled={downloading || (singlePage && !manualMode && (fitting || verifying))}
            className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-900 font-semibold py-3 rounded-lg transition-colors"
          >
            {downloading
              ? "Generating PDF..."
              : singlePage && !manualMode && (fitting || verifying)
              ? "Fitting to one page..."
              : "Download PDF"}
          </button>

          {singlePage && verifying && !manualMode && (
            <p className="text-xs text-slate-400">
              Verifying one-page fit against the actual PDF...
            </p>
          )}

          {manualMode && (
            <p className="text-xs text-cyan-400">
              Manual override active — {manualHidden.length} item
              {manualHidden.length === 1 ? "" : "s"} hidden, auto-fit paused.
              {singlePage && verifying ? " Checking page count..." : ""}
            </p>
          )}

          {singlePage && !manualMode && trimmedBullets > 0 && (
            <p className="text-xs text-amber-400">
              {trimmedBullets} low-priority bullet{trimmedBullets > 1 ? "s" : ""}
              {trimmedSections.length > 0
                ? ` and the ${trimmedSections.join(", ")} section${trimmedSections.length > 1 ? "s" : ""}`
                : ""}{" "}
              trimmed to fit one page.
            </p>
          )}

          {singlePage && overflowed && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 space-y-2">
              <p className="text-xs text-amber-300">
                {manualMode
                  ? "Your manual selection overflows one page. Uncheck more items or switch to a 2-page layout."
                  : "This resume still overflows one page even after trimming. Switch to a 2-page layout to show everything."}
              </p>
              <button
                onClick={() => setPageMode("2")}
                className="w-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold py-2 rounded-md transition-colors"
              >
                Use 2-page layout
              </button>
            </div>
          )}
        </aside>

        {/* Resume Preview */}
        <div className="flex-1 overflow-auto">
          <div style={{ transform: "scale(0.85)", transformOrigin: "top left", position: "relative" }}>
            {/* Built from the same props object the PDF is rendered from, so
                the preview cannot silently disagree with the download. */}
            <ResumePreview
              ref={previewRef}
              {...previewProps}
              hiddenBulletIds={previewHiddenSet}
              singlePage={singlePage}
            />
            {/* Page-break guides for the 2-page layout */}
            {pageBreaks.map((top, i) => (
              <div
                key={top}
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: `${top}px`,
                  borderTop: "2px dashed #ef4444",
                  pointerEvents: "none",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "2px",
                    fontSize: "11px",
                    color: "#ef4444",
                    background: "white",
                    padding: "1px 6px",
                  }}
                >
                  Page {i + 2}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
