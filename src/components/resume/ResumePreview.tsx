"use client";
import React, { forwardRef } from "react";
import {
  Profile,
  Skill,
  Experience,
  Education,
  Project,
  Certification,
  Award,
  Language,
  Hobby,
  Strength,
} from "@/types";
import { filterBulletsByDomain } from "@/lib/filter";

interface Props {
  domainId: string;
  customText?: string;
  profile: Profile;
  skills: Skill[];
  experience: Experience[];
  education: Education[];
  projects: Project[];
  certifications: Certification[];
  awards: Award[];
  languages: Language[];
  hobbies: Hobby[];
  strengths?: Strength[];
  // Title shown under the name; overrides profile.title (used for per-domain titles).
  headerTitle?: string;
  // When false, the page is allowed to grow past one A4 (2-page mode).
  singlePage?: boolean;
  hiddenBulletIds?: Set<string>;
}

const ResumePreview = forwardRef<HTMLDivElement, Props>(function ResumePreview(
  {
    domainId,
    customText,
    profile,
    skills,
    experience,
    education,
    projects,
    certifications,
    awards,
    languages,
    hobbies,
    strengths = [],
    headerTitle,
    singlePage = true,
    hiddenBulletIds = new Set(),
  },
  ref
) {
  const grouped = skills.reduce<Record<string, string[]>>((acc, sk) => {
    if (!sk.visible) return acc;
    acc[sk.category] = acc[sk.category] || [];
    acc[sk.category].push(sk.name);
    return acc;
  }, {});

  return (
    <div
      ref={ref}
      className="bg-white text-gray-900"
      style={{
        width: "794px",
        minHeight: "1123px",
        maxHeight: singlePage ? "1123px" : undefined,
        overflow: singlePage ? "hidden" : "visible",
        fontFamily: "Arial, sans-serif",
        fontSize: "10px",
        padding: "32px 40px",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <header className="mb-3 border-b-2 border-gray-800 pb-3">
        <h1 style={{ fontSize: "22px", fontWeight: 700, margin: 0 }}>{profile.name}</h1>
        <p style={{ fontSize: "12px", color: "#374151", marginTop: "2px" }}>{headerTitle ?? profile.title}</p>
        <div style={{ display: "flex", gap: "16px", marginTop: "4px", flexWrap: "wrap", fontSize: "9px", color: "#4B5563" }}>
          {profile.email && <span>{profile.email}</span>}
          {profile.phone && <span>{profile.phone}</span>}
          {profile.location && <span>{profile.location}</span>}
          {profile.linkedin && <span>{profile.linkedin}</span>}
          {profile.github && <span>{profile.github}</span>}
          {profile.portfolio && <span>{profile.portfolio}</span>}
        </div>
      </header>

      {customText && (
        <p style={{ fontSize: "10px", marginBottom: "6px", color: "#374151" }}>{customText}</p>
      )}

      {/* Skills */}
      {Object.keys(grouped).length > 0 && (
        <Section title="SKILLS">
          {Object.entries(grouped).map(([cat, names]) => (
            <div key={cat} style={{ display: "flex", gap: "4px", marginBottom: "2px" }}>
              <span style={{ fontWeight: 600, minWidth: "100px", color: "#374151" }}>{cat}:</span>
              <span>{names.join(" · ")}</span>
            </div>
          ))}
        </Section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <Section title="EXPERIENCE">
          {experience.map((exp) => {
            const bullets = filterBulletsByDomain(exp.bullets, domainId).filter(
              (b) => !hiddenBulletIds.has(b.id)
            );
            return (
              <div key={exp.id} style={{ marginBottom: "6px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 600 }}>{exp.role}</span>
                  <span style={{ color: "#6B7280" }}>{exp.startDate} – {exp.endDate}</span>
                </div>
                <div style={{ color: "#4B5563", marginBottom: "2px" }}>
                  {exp.company} · {exp.location}
                </div>
                <ul style={{ margin: "2px 0 0 14px", padding: 0 }}>
                  {bullets.map((b) => (
                    <li key={b.id} style={{ marginBottom: "1px" }}>{b.text}</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </Section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <Section title="PROJECTS">
          {projects.map((proj) => {
            const bullets = filterBulletsByDomain(proj.bullets, domainId).filter(
              (b) => !hiddenBulletIds.has(b.id)
            );
            return (
              <div key={proj.id} style={{ marginBottom: "6px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 600 }}>
                    {proj.title}
                    {proj.tools.length > 0 && (
                      <span style={{ fontWeight: 400, color: "#6B7280" }}> | {proj.tools.join(", ")}</span>
                    )}
                  </span>
                  {proj.sourceLink && (
                    <span style={{ color: "#2563EB", fontSize: "9px" }}>{proj.sourceLink}</span>
                  )}
                </div>
                <ul style={{ margin: "2px 0 0 14px", padding: 0 }}>
                  {bullets.map((b) => (
                    <li key={b.id} style={{ marginBottom: "1px" }}>{b.text}</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </Section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <Section title="EDUCATION">
          {education.map((edu) => (
            <div key={edu.id} style={{ marginBottom: "4px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 600 }}>{edu.degree}</span>
                <span style={{ color: "#6B7280" }}>{edu.startDate} – {edu.endDate}</span>
              </div>
              <div style={{ color: "#4B5563" }}>
                {edu.institute} · {edu.location}
                {edu.score && ` · ${edu.score}`}
              </div>
            </div>
          ))}
        </Section>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <Section title="CERTIFICATIONS">
          {certifications.map((c) => (
            <div key={c.id} style={{ marginBottom: "3px" }}>
              <span style={{ fontWeight: 600 }}>{c.name}</span>
              <span style={{ color: "#6B7280" }}> · {c.issuer} · {c.date}</span>
            </div>
          ))}
        </Section>
      )}

      {/* Awards */}
      {awards.length > 0 && (
        <Section title="AWARDS">
          {awards.map((a) => (
            <div key={a.id} style={{ marginBottom: "3px" }}>
              <span style={{ fontWeight: 600 }}>{a.title}</span>
              <span style={{ color: "#6B7280" }}> · {a.organization} · {a.date}</span>
              {a.description && <div style={{ color: "#374151" }}>{a.description}</div>}
            </div>
          ))}
        </Section>
      )}

      {/* Languages */}
      {languages.length > 0 && (
        <Section title="LANGUAGES">
          <div style={{ display: "flex", gap: "12px" }}>
            {languages.map((l) => (
              <span key={l.id}>{l.name} ({l.proficiency})</span>
            ))}
          </div>
        </Section>
      )}

      {/* Strengths */}
      {strengths.length > 0 && (
        <Section title="STRENGTHS">
          <ul style={{ margin: "0 0 0 14px", padding: 0 }}>
            {strengths.map((s) => (
              <li key={s.id} style={{ marginBottom: "1px" }}>{s.name}</li>
            ))}
          </ul>
        </Section>
      )}

      {/* Hobbies */}
      {hobbies.length > 0 && (
        <Section title="HOBBIES">
          <div>{hobbies.map((h) => h.name).join(" · ")}</div>
        </Section>
      )}
    </div>
  );
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: "8px" }}>
      <h2
        style={{
          fontSize: "10px",
          fontWeight: 700,
          letterSpacing: "1px",
          borderBottom: "1px solid #D1D5DB",
          paddingBottom: "2px",
          marginBottom: "4px",
          textTransform: "uppercase",
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

export default ResumePreview;
