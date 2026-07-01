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

/**
 * On-screen HTML mirror of ResumeDocument (the downloaded PDF).
 *
 * The DOWNLOADED PDF is the source of truth: this preview is a faithful HTML
 * reproduction of it, used both to show the user what they'll get and to
 * measure one-page overflow for auto-fit. Section order, names, per-item
 * layout and — crucially — the type scale are kept proportional to the PDF so
 * the measured height tracks the real PDF and the 1-page auto-fit is accurate.
 *
 * react-pdf lays out at A4 = 595.28 x 841.89 pt; this renders at A4 @96dpi =
 * 794 x 1123 px. The two differ by exactly the pt->px factor (1.3333), so every
 * size below is the PDF's pt value scaled by ~1.3333. Keep that relationship
 * when editing either renderer, or the preview will stop predicting the PDF.
 */

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

// PDF palette, mirrored so the preview reads like the download.
const INK = "#1a1a1a";
const MUTED = "#555555";
const LINK = "#2563eb";
const RULE = "#9ca3af";

// A4 @96dpi. The PDF renders at A4 in points; this is the same page scaled by
// the pt->px factor, so heights are directly comparable.
export const A4_PX_HEIGHT = 1123;
const A4_PX_WIDTH = 794;

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
  const visibleSkills = skills.filter((s) => s.visible);
  const skillGroups = Object.entries(
    visibleSkills.reduce<Record<string, string[]>>((acc, sk) => {
      (acc[sk.category] ||= []).push(sk.name);
      return acc;
    }, {})
  );
  const [skillsLeft, skillsRight] = chunkTwo(skillGroups);

  return (
    <div
      ref={ref}
      className="bg-white"
      style={{
        width: `${A4_PX_WIDTH}px`,
        minHeight: `${A4_PX_HEIGHT}px`,
        maxHeight: singlePage ? `${A4_PX_HEIGHT}px` : undefined,
        overflow: singlePage ? "hidden" : "visible",
        fontFamily: "Helvetica, Arial, sans-serif",
        fontSize: "12px", // 9pt
        lineHeight: 1.3,
        color: INK,
        // 26 / 34 / 24 pt padding, scaled to px.
        padding: "35px 45px 32px 45px",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div>
        <div style={{ fontSize: "26px", fontWeight: 700 }}>{profile.name}</div>
        <div style={{ fontSize: "15px", fontWeight: 700, marginTop: "1px" }}>
          {headerTitle ?? profile.title}
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            marginTop: "5px",
            fontSize: "12px",
            color: MUTED,
          }}
        >
          {profile.phone && <span style={{ marginRight: "16px" }}>{profile.phone}</span>}
          {profile.email && (
            <span style={{ marginRight: "16px", color: LINK }}>{profile.email}</span>
          )}
          {profile.linkedin && (
            <span style={{ marginRight: "16px", color: LINK }}>LinkedIn</span>
          )}
          {profile.github && (
            <span style={{ marginRight: "16px", color: LINK }}>GitHub</span>
          )}
          {profile.location && <span style={{ marginRight: "16px" }}>{profile.location}</span>}
        </div>
      </div>
      <div style={{ borderBottom: `1.6px solid ${INK}`, marginTop: "8px", marginBottom: "8px" }} />

      {customText && <p style={{ marginBottom: "8px" }}>{customText}</p>}

      {/* Summary */}
      {profile.about && (
        <Section title="Summary">
          <div style={{ textAlign: "justify" }}>{profile.about}</div>
        </Section>
      )}

      {/* Work Experience */}
      {experience.length > 0 && (
        <Section title="Work Experience">
          {experience.map((exp) => {
            const bullets = filterBulletsByDomain(exp.bullets, domainId).filter(
              (b) => !hiddenBulletIds.has(b.id)
            );
            return (
              <div key={exp.id} style={{ marginBottom: "5px" }}>
                <RowBetween
                  left={
                    <span style={{ fontWeight: 700 }}>
                      {exp.role}
                      {exp.company ? `, ${exp.company}` : ""}
                    </span>
                  }
                  right={
                    <span style={{ color: MUTED }}>
                      {exp.startDate} - {exp.endDate}
                    </span>
                  }
                />
                {bullets.map((b) => (
                  <Bullet key={b.id}>{b.text}</Bullet>
                ))}
              </div>
            );
          })}
        </Section>
      )}

      {/* Education — score and dates right-aligned (not stuck to the institute) */}
      {education.length > 0 && (
        <Section title="Education">
          {education.map((edu) => (
            <div key={edu.id} style={{ marginBottom: "3px" }}>
              <RowBetween
                left={
                  <span>
                    <span style={{ fontWeight: 700 }}>{edu.degree}</span>
                    {edu.institute ? `  ${edu.institute}` : ""}
                  </span>
                }
                right={
                  <span style={{ color: MUTED }}>
                    {edu.score ? `${edu.score}   ` : ""}
                    {edu.startDate} - {edu.endDate}
                  </span>
                }
              />
            </div>
          ))}
        </Section>
      )}

      {/* Technical Skills */}
      {skillGroups.length > 0 && (
        <Section title="Technical Skills">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ width: "48%" }}>
              {skillsLeft.map(([cat, names]) => (
                <Bullet key={cat}>
                  <span style={{ fontWeight: 700 }}>{cat}: </span>
                  {names.join(", ")}
                </Bullet>
              ))}
            </div>
            <div style={{ width: "48%" }}>
              {skillsRight.map(([cat, names]) => (
                <Bullet key={cat}>
                  <span style={{ fontWeight: 700 }}>{cat}: </span>
                  {names.join(", ")}
                </Bullet>
              ))}
            </div>
          </div>
        </Section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <Section title="Projects">
          {projects.map((proj) => {
            const bullets = filterBulletsByDomain(proj.bullets, domainId).filter(
              (b) => !hiddenBulletIds.has(b.id)
            );
            const twoCol = bulletsUseTwoCols(bullets);
            const [left, right] = chunkTwo(bullets);
            return (
              <div key={proj.id} style={{ marginBottom: "5px" }}>
                <RowBetween
                  left={
                    <span style={{ fontWeight: 700 }}>
                      {proj.title}
                      {proj.tools.length > 0 && (
                        <span style={{ fontWeight: 400, color: MUTED }}>
                          {"  |  "}
                          {proj.tools.join(", ")}
                        </span>
                      )}
                    </span>
                  }
                  right={
                    proj.sourceLink ? (
                      <span style={{ color: LINK }}>Source</span>
                    ) : null
                  }
                />
                {twoCol ? (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div style={{ width: "48%" }}>
                      {left.map((b) => (
                        <Bullet key={b.id}>{b.text}</Bullet>
                      ))}
                    </div>
                    <div style={{ width: "48%" }}>
                      {right.map((b) => (
                        <Bullet key={b.id}>{b.text}</Bullet>
                      ))}
                    </div>
                  </div>
                ) : (
                  bullets.map((b) => <Bullet key={b.id}>{b.text}</Bullet>)
                )}
              </div>
            );
          })}
        </Section>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <Section title="Certifications">
          {certifications.map((c) => (
            <RowBetween
              key={c.id}
              left={
                <span>
                  <span style={{ fontWeight: 700 }}>{c.name}</span>
                  {c.issuer ? `  ${c.issuer}` : ""}
                </span>
              }
              right={<span style={{ color: MUTED }}>{c.date}</span>}
            />
          ))}
        </Section>
      )}

      {/* Achievements */}
      {awards.length > 0 && (
        <Section title="Achievements">
          {awards.map((a) => (
            <div key={a.id} style={{ marginBottom: "3px" }}>
              <RowBetween
                left={
                  <span>
                    <span style={{ fontWeight: 700 }}>{a.title}</span>
                    {a.organization ? `  ${a.organization}` : ""}
                  </span>
                }
                right={<span style={{ color: MUTED }}>{a.date}</span>}
              />
              {a.description && <div style={{ color: MUTED }}>{a.description}</div>}
            </div>
          ))}
        </Section>
      )}

      {/* Languages */}
      {languages.length > 0 && (
        <Section title="Languages">
          <div>
            {languages.map((l) => `${l.name} (${l.proficiency})`).join("   ·   ")}
          </div>
        </Section>
      )}

      {/* Strengths */}
      {strengths.length > 0 && (
        <Section title="Strengths">
          {strengths.map((s) => (
            <Bullet key={s.id}>{s.name}</Bullet>
          ))}
        </Section>
      )}

      {/* Hobbies */}
      {hobbies.length > 0 && (
        <Section title="Hobbies">
          {hobbies.map((h) => (
            <Bullet key={h.id}>{h.name}</Bullet>
          ))}
        </Section>
      )}
    </div>
  );
});

// Mirror of the same rule in ResumeDocument: two columns only when every
// bullet fits one line in a half-width column, so the on-screen overflow
// measurement matches the generated PDF.
const SHORT_BULLET_MAX = 48;
function bulletsUseTwoCols(bullets: { text: string }[]): boolean {
  return bullets.length >= 3 && bullets.every((b) => b.text.length <= SHORT_BULLET_MAX);
}

function chunkTwo<T>(items: T[]): [T[], T[]] {
  const mid = Math.ceil(items.length / 2);
  return [items.slice(0, mid), items.slice(mid)];
}

function RowBetween({ left, right }: { left: React.ReactNode; right: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      {left}
      {right}
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", marginBottom: "1px", paddingLeft: "5px" }}>
      <span style={{ width: "11px", flexShrink: 0 }}>•</span>
      <span style={{ flex: 1 }}>{children}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: "9px" }}>
      <div
        style={{
          fontSize: "13px", // 10pt
          fontWeight: 700,
          letterSpacing: "0.8px",
          textTransform: "uppercase",
        }}
      >
        {title}
      </div>
      <div style={{ borderBottom: `1px solid ${RULE}`, marginTop: "3px", marginBottom: "5px" }} />
      {children}
    </section>
  );
}

export default ResumePreview;
