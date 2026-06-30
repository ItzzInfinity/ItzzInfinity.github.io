"use client";
import { useResumeStore } from "@/store/useResumeStore";

export default function AboutPage() {
  const { profile, education, experience } = useResumeStore();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">About</h1>

      <section className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold text-cyan-400 mb-4">Profile</h2>
        <p className="text-2xl font-bold text-white">{profile.name}</p>
        <p className="text-slate-400 mb-4">{profile.title}</p>
        <p className="text-slate-300 leading-relaxed">{profile.about}</p>
      </section>

      <section className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold text-cyan-400 mb-4">Contact</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {[
            { label: "Email", value: profile.email, href: `mailto:${profile.email}` },
            { label: "Phone", value: profile.phone },
            { label: "Location", value: profile.location },
            { label: "LinkedIn", value: profile.linkedin, href: `https://${profile.linkedin}` },
            { label: "GitHub", value: profile.github, href: `https://${profile.github}` },
            { label: "Portfolio", value: profile.portfolio, href: `https://${profile.portfolio}` },
          ].map(({ label, value, href }) => (
            <div key={label}>
              <dt className="text-slate-500 text-xs uppercase tracking-wide">{label}</dt>
              <dd className="text-slate-200 mt-0.5">
                {href ? (
                  <a href={href} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
                    {value}
                  </a>
                ) : (
                  value
                )}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold text-cyan-400 mb-4">Work Experience</h2>
        {experience.map((exp) => (
          <div key={exp.id} className="mb-6 last:mb-0">
            <div className="flex justify-between items-start gap-4">
              <p className="font-semibold text-white">
                {exp.role}
                <span className="text-slate-400 font-normal"> · {exp.company}</span>
              </p>
              <p className="text-slate-400 text-sm whitespace-nowrap">
                {exp.startDate} – {exp.endDate}
              </p>
            </div>
            {exp.location && <p className="text-slate-500 text-sm mb-2">{exp.location}</p>}
            {exp.bullets.length > 0 && (
              <ul className="list-disc list-inside space-y-1">
                {exp.bullets.map((b) => (
                  <li key={b.id} className="text-slate-300 text-sm">{b.text}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </section>

      <section className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-cyan-400 mb-4">Education</h2>
        {education.map((edu) => (
          <div key={edu.id} className="mb-4 last:mb-0">
            <div className="flex justify-between items-start gap-4">
              <p className="font-semibold text-white">{edu.degree}</p>
              <p className="text-slate-400 text-sm whitespace-nowrap">
                {edu.startDate} – {edu.endDate}
              </p>
            </div>
            <p className="text-slate-300">{edu.institute}</p>
            <p className="text-slate-400 text-sm">
              {edu.location}
              {edu.score && ` · ${edu.score}`}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}
