"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import { useResumeStore } from "@/store/useResumeStore";
import ResumePreview from "@/components/resume/ResumePreview";
import { filterByDomain, filterBulletsByDomain } from "@/lib/filter";
import { isOverflowing } from "@/lib/autofit";

export default function DownloadPage() {
  const store = useResumeStore();
  const topLevelDomains = store.domains.filter((d) => !d.parentId && d.enabled);
  const [selectedDomain, setSelectedDomain] = useState(topLevelDomains[0]?.id ?? "");
  const [customText, setCustomText] = useState("");
  const [hiddenBulletIds, setHiddenBulletIds] = useState<Set<string>>(new Set());
  const [downloading, setDownloading] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const filteredSkills = filterByDomain(store.skills, selectedDomain);
  const filteredExperience = filterByDomain(store.experience, selectedDomain);
  const filteredProjects = filterByDomain(store.projects, selectedDomain);
  const filteredCerts = filterByDomain(store.certifications, selectedDomain);
  const filteredAwards = filterByDomain(store.awards, selectedDomain);

  const runAutoFit = useCallback(() => {
    const el = previewRef.current;
    if (!el) return;

    // Collect all optional bullets sorted by priority desc (lowest priority = removed first)
    const allBullets: { id: string; priority: number }[] = [];
    for (const proj of filteredProjects) {
      for (const b of filterBulletsByDomain(proj.bullets, selectedDomain)) {
        allBullets.push({ id: b.id, priority: b.priority });
      }
    }
    for (const exp of filteredExperience) {
      for (const b of filterBulletsByDomain(exp.bullets, selectedDomain)) {
        allBullets.push({ id: b.id, priority: b.priority });
      }
    }

    // Sort descending by priority number (higher number = lower priority = trimmed first)
    const sorted = [...allBullets].sort((a, b) => b.priority - a.priority);
    const hidden = new Set<string>();

    // Remove bullets iteratively until it fits or we've removed all
    let idx = 0;
    const check = () => {
      if (!isOverflowing(el) || idx >= sorted.length) {
        setHiddenBulletIds(new Set(hidden));
        return;
      }
      hidden.add(sorted[idx].id);
      idx++;
      setHiddenBulletIds(new Set(hidden));
      requestAnimationFrame(check);
    };
    requestAnimationFrame(check);
  }, [filteredProjects, filteredExperience, selectedDomain]);

  useEffect(() => {
    setHiddenBulletIds(new Set());
    setTimeout(runAutoFit, 100);
  }, [selectedDomain, customText, runAutoFit]);

  async function handleDownload() {
    if (!previewRef.current) return;
    setDownloading(true);
    try {
      const { default: html2canvas } = await import("html2canvas");
      const { default: jsPDF } = await import("jspdf");
      const canvas = await html2canvas(previewRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, "PNG", 0, 0, pdfW, pdfH);
      pdf.save(`${store.profile.name.replace(/\s+/g, "_")}_${selectedDomain}_resume.pdf`);
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

          {hiddenBulletIds.size > 0 && (
            <p className="text-xs text-amber-400">
              {hiddenBulletIds.size} low-priority bullet{hiddenBulletIds.size > 1 ? "s" : ""} trimmed to fit one page.
            </p>
          )}
        </aside>

        {/* Resume Preview */}
        <div className="flex-1 overflow-auto">
          <div className="origin-top-left" style={{ transform: "scale(0.85)", transformOrigin: "top left" }}>
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
              hiddenBulletIds={hiddenBulletIds}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
