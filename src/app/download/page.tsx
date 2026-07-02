"use client";
import React, { useRef, useState, useMemo, useEffect, useLayoutEffect } from "react";
import { useResumeStore } from "@/store/useResumeStore";
import ResumePreview, { A4_PX_HEIGHT } from "@/components/resume/ResumePreview";
import type { ResumeDocumentProps } from "@/components/resume/ResumeDocument";
import type { DocumentProps } from "@react-pdf/renderer";
import { filterByDomain } from "@/lib/filter";
import { isOverflowing, removableItemIds, countPdfPages } from "@/lib/autofit";

type PageMode = "1" | "2";

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
  const previewRef = useRef<HTMLDivElement>(null);

  const singlePage = pageMode === "1";

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
  const filteredSkills = useMemo(() => filterByDomain(store.skills, selectedDomain), [store.skills, selectedDomain]);
  const filteredExperience = useMemo(() => filterByDomain(store.experience, selectedDomain), [store.experience, selectedDomain]);
  const filteredProjects = useMemo(() => filterByDomain(store.projects, selectedDomain), [store.projects, selectedDomain]);
  const filteredCerts = useMemo(() => filterByDomain(store.certifications, selectedDomain), [store.certifications, selectedDomain]);
  const filteredAwards = useMemo(() => filterByDomain(store.awards, selectedDomain), [store.awards, selectedDomain]);

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
      education: store.education,
      projects: filteredProjects,
      certifications: filteredCerts,
      awards: filteredAwards,
      languages: store.languages,
      hobbies: store.hobbies,
      strengths: store.strengths,
      headerTitle,
      summaryText,
    }),
    [
      selectedDomain,
      customText,
      store.profile,
      filteredSkills,
      filteredExperience,
      store.education,
      filteredProjects,
      filteredCerts,
      filteredAwards,
      store.languages,
      store.hobbies,
      store.strengths,
      headerTitle,
      summaryText,
    ]
  );

  // Restart the fit pass whenever the resume content or page mode changes.
  // Auto-fit only runs in single-page mode; 2-page mode lets content flow.
  useEffect(() => {
    setHiddenBulletIds([]);
    setOverflowed(false);
    setFitting(singlePage);
  }, [selectedDomain, customText, removableOrder, singlePage]);

  // Convergent auto-fit (single-page only): remove one lowest-priority bullet
  // per render until the preview fits one A4 page, or nothing is left to trim.
  // If it still overflows after exhausting removable bullets, flag overflow so
  // the user can switch to a 2-page layout.
  useLayoutEffect(() => {
    if (!fitting) return;
    const el = previewRef.current;
    if (!el) return;
    if (isOverflowing(el) && hiddenBulletIds.length < removableOrder.length) {
      setHiddenBulletIds(removableOrder.slice(0, hiddenBulletIds.length + 1));
    } else {
      setFitting(false);
      setOverflowed(isOverflowing(el));
    }
  }, [fitting, hiddenBulletIds.length, removableOrder]);

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
    if (!singlePage || fitting) return;
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
          const element = React.createElement(mod.default, {
            ...baseDocProps,
            hiddenBulletIds: hidden,
          }) as React.ReactElement<DocumentProps>;
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
  }, [fitting, singlePage, removableOrder, baseDocProps]);

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
      const props: ResumeDocumentProps = {
        ...baseDocProps,
        // In 2-page mode nothing is trimmed; react-pdf paginates automatically.
        hiddenBulletIds: singlePage ? hiddenBulletIds : [],
      };
      const element = React.createElement(mod.default, props) as React.ReactElement<DocumentProps>;
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

          <button
            onClick={handleDownload}
            disabled={downloading || (singlePage && (fitting || verifying))}
            className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-900 font-semibold py-3 rounded-lg transition-colors"
          >
            {downloading
              ? "Generating PDF..."
              : singlePage && (fitting || verifying)
              ? "Fitting to one page..."
              : "Download PDF"}
          </button>

          {singlePage && verifying && (
            <p className="text-xs text-slate-400">
              Verifying one-page fit against the actual PDF...
            </p>
          )}

          {singlePage && trimmedBullets > 0 && (
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
                This resume still overflows one page even after trimming. Switch to a 2-page layout to show everything.
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
            <ResumePreview
              ref={previewRef}
              domainId={selectedDomain}
              customText={customText}
              profile={store.profile}
              skills={filteredSkills}
              experience={filteredExperience}
              education={store.education}
              projects={filteredProjects}
              certifications={filteredCerts}
              awards={filteredAwards}
              languages={store.languages}
              hobbies={store.hobbies}
              strengths={store.strengths}
              headerTitle={headerTitle}
              summaryText={summaryText}
              singlePage={singlePage}
              hiddenBulletIds={new Set(singlePage ? hiddenBulletIds : [])}
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
