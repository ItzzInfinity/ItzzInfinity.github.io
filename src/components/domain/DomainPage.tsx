"use client";
import { useResumeStore } from "@/store/useResumeStore";
import { filterByDomain, filterBulletsByDomain } from "@/lib/filter";

interface Props {
  domainId: string;
  title: string;
  subtitle?: string;
  subDomains?: { id: string; label: string }[];
}

export default function DomainPage({ domainId, title, subtitle, subDomains }: Props) {
  // Full work experience lives on the About page; domain pages focus on
  // domain-specific summary, skills, and projects.
  const { domains, skills, projects } = useResumeStore();

  const domainSummary = domains.find((d) => d.id === domainId)?.summary;
  const domainSkills = filterByDomain(skills, domainId);
  const domainProjects = filterByDomain(projects, domainId);

  const grouped = domainSkills.reduce<Record<string, string[]>>((acc, sk) => {
    acc[sk.category] = acc[sk.category] || [];
    acc[sk.category].push(sk.name);
    return acc;
  }, {});

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
      {subtitle && <p className="text-slate-400 mb-8">{subtitle}</p>}

      {domainSummary && (
        <p className="text-slate-300 leading-relaxed mb-8 max-w-3xl">{domainSummary}</p>
      )}

      {subDomains && subDomains.length > 0 && (
        <div className="flex gap-2 mb-8 flex-wrap">
          {subDomains.map((sd) => (
            <span
              key={sd.id}
              className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-3 py-1 rounded-full text-sm"
            >
              {sd.label}
            </span>
          ))}
        </div>
      )}

      {Object.keys(grouped).length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-cyan-400 mb-4">Skills</h2>
          <div className="space-y-3">
            {Object.entries(grouped).map(([cat, names]) => (
              <div key={cat} className="flex gap-3 flex-wrap items-center">
                <span className="text-slate-500 text-xs uppercase tracking-wide w-28 shrink-0">{cat}</span>
                {names.map((n) => (
                  <span key={n} className="bg-slate-700 text-slate-200 px-3 py-1 rounded-md text-sm">
                    {n}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </section>
      )}

      {domainProjects.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-cyan-400 mb-4">Projects</h2>
          <div className="space-y-6">
            {domainProjects.map((proj) => (
              <div key={proj.id} className="bg-slate-800 border border-slate-700 rounded-xl p-5">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-semibold text-white">{proj.title}</p>
                  {proj.sourceLink && (
                    <a
                      href={proj.sourceLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs bg-slate-700 hover:bg-slate-600 text-cyan-400 px-3 py-1 rounded-md transition-colors"
                    >
                      Source ↗
                    </a>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {proj.tools.map((t) => (
                    <span key={t} className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded">
                      {t}
                    </span>
                  ))}
                </div>
                <ul className="list-disc list-inside space-y-1">
                  {filterBulletsByDomain(proj.bullets, domainId).map((b) => (
                    <li key={b.id} className="text-slate-300 text-sm">
                      {b.text}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {domainSkills.length === 0 && domainProjects.length === 0 && (
        <p className="text-slate-500 text-center py-16">
          No content mapped to this domain yet. Add content in{" "}
          <a href="/settings" className="text-cyan-400 hover:underline">
            Settings
          </a>
          .
        </p>
      )}
    </div>
  );
}
