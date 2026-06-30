"use client";
import React, { useRef, useState, useMemo, useEffect, useLayoutEffect } from "react";
import { useResumeStore } from "@/store/useResumeStore";
import ResumePreview from "@/components/resume/ResumePreview";
import type { ResumeDocumentProps } from "@/components/resume/ResumeDocument";
import type { DocumentProps } from "@react-pdf/renderer";
import { filterByDomain, filterBulletsByDomain } from "@/lib/filter";
import { isOverflowing } from "@/lib/autofit";

export default function DownloadPage() {
  const store = useResumeStore();
  const topLevelDomains = useMemo(
    () => store.domains.filter((d) => !d.parentId && d.enabled),
    [store.domains]
  );
  const [selectedDomain, setSelectedDomain] = useState(topLevelDomains[0]?.id ?? "");
  const [customText, setCustomText] = useState("");
  const [hiddenBulletIds, setHiddenBulletIds] = useState<string[]>([]);
  const [fitting, setFitting] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  // Memoised so identities are stable across renders (prevents effect thrash).
  const filteredSkills = useMemo(() => filterByDomain(store.skills, selectedDomain), [store.skills, selectedDomain]);
  const filteredExperience = useMemo(() => filterByDomain(store.experience, selectedDomain), [store.experience, selectedDomain]);
  const filteredProjects = useMemo(() => filterByDomain(store.projects, selectedDomain), [store.projects, selectedDomain]);
  const filteredCerts = useMemo(() => filterByDomain(store.certifications, selectedDomain), [store.certifications, selectedDomain]);
  const filteredAwards = useMemo(() => filterByDomain(store.awards, selectedDomain), [store.awards, selectedDomain]);

  // Ordered list of bullet ids eligible for trimming: lowest priority first.
  const removableOrder = useMemo(() => {
    const all: { id: string; priority: number }[] = [];
    for (const proj of filteredProjects) {
      for (const b of filterBulletsByDomain(proj.bullets, selectedDomain)) all.push({ id: b.id, priority: b.priority });
    }
    for (const exp of filteredExperience) {
      for (const b of filterBulletsByDomain(exp.bullets, selectedDomain)) all.push({ id: b.id, priority: b.priority });
    }
    return all.sort((a, b) => b.priority - a.priority).map((x) => x.id);
  }, [filteredProjects, filteredExperience, selectedDomain]);

  // Restart the fit pass whenever the resume content changes.
  useEffect(() => {
    setHiddenBulletIds([]);
    setFitting(true);
  }, [selectedDomain, customText, removableOrder]);

  // Convergent auto-fit: remove one lowest-priority bullet per render until the
  // preview no longer overflows one A4 page (or nothing is left to trim).
  useLayoutEffect(() => {
    if (!fitting) return;
    const el = previewRef.current;
    if (!el) return;
    if (isOverflowing(el) && hiddenBulletIds.length < removableOrder.length) {
      setHiddenBulletIds(removableOrder.slice(0, hiddenBulletIds.length + 1));
    } else {
      setFitting(false);
    }
  }, [fitting, hiddenBulletIds.length, removableOrder]);

  async function handleDownload() {
    setDownloading(true);
    try {
      const [{ pdf }, mod] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/components/resume/ResumeDocument"),
      ]);
      const props: ResumeDocumentProps = {
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
        hiddenBulletIds,
      };
      const element = React.createElement(mod.default, props) as React.ReactElement<DocumentProps>;
      const blob = await pdf(element).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${store.profile.name.replace(/\s+/g, "_")}_${selectedDomain}_resume.pdf`;
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
              {topLevelDomains.map((d) => (
                <label key={d.id} className="flex items-center gap-3 cursor-pointer group">
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
            disabled={downloading}
            className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-900 font-semibold py-3 rounded-lg transition-colors"
          >
            {downloading ? "Generating PDF..." : "Download PDF"}
          </button>

          {hiddenBulletIds.length > 0 && (
            <p className="text-xs text-amber-400">
              {hiddenBulletIds.length} low-priority bullet{hiddenBulletIds.length > 1 ? "s" : ""} trimmed to fit one page.
            </p>
          )}
        </aside>

        {/* Resume Preview */}
        <div className="flex-1 overflow-auto">
          <div style={{ transform: "scale(0.85)", transformOrigin: "top left" }}>
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
              hiddenBulletIds={new Set(hiddenBulletIds)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
