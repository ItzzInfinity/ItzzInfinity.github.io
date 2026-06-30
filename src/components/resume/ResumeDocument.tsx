/**
 * Vector PDF resume built with @react-pdf/renderer.
 *
 * This is the single source of truth for the *downloaded* resume. The layout
 * mirrors template.pdf (see parsed/template_spec.json): A4, ~20pt name, bold
 * uppercase section headings with hairline rules, two-column skills/projects,
 * right-aligned dates. It is a pure function of its props so the same component
 * is used by the in-app download and by scripts/render-sample.tsx for visual
 * verification.
 *
 * Fonts: react-pdf's built-in Helvetica. The template uses Inter, which is
 * visually near-identical; bundling Inter TTFs is avoided to keep the static
 * GitHub Pages export free of runtime font fetches.
 */
import React from "react";
import {
  Document,
  Page,
  View,
  Text,
  Link,
  StyleSheet,
} from "@react-pdf/renderer";
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

export interface ResumeDocumentProps {
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
  // Title shown under the name; overrides profile.title (per-domain titles).
  headerTitle?: string;
  hiddenBulletIds?: string[];
}

const INK = "#1a1a1a";
const MUTED = "#555555";
const LINK = "#2563eb";
const RULE = "#9ca3af";

const styles = StyleSheet.create({
  page: {
    paddingTop: 26,
    paddingBottom: 24,
    paddingHorizontal: 34,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: INK,
    lineHeight: 1.3,
  },
  name: { fontSize: 20, fontFamily: "Helvetica-Bold" },
  title: { fontSize: 11, fontFamily: "Helvetica-Bold", marginTop: 1 },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
    fontSize: 9,
    color: MUTED,
  },
  contactItem: { marginRight: 12 },
  link: { color: LINK, textDecoration: "none" },
  headerRule: {
    borderBottomWidth: 1.2,
    borderBottomColor: INK,
    marginTop: 6,
    marginBottom: 6,
  },
  section: { marginBottom: 7 },
  sectionTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  sectionRule: {
    borderBottomWidth: 0.7,
    borderBottomColor: RULE,
    marginTop: 2,
    marginBottom: 4,
  },
  rowBetween: { flexDirection: "row", justifyContent: "space-between" },
  bold: { fontFamily: "Helvetica-Bold" },
  muted: { color: MUTED },
  bulletRow: { flexDirection: "row", marginBottom: 1, paddingLeft: 4 },
  bulletDot: { width: 8 },
  bulletText: { flex: 1 },
  twoCol: { flexDirection: "row", justifyContent: "space-between" },
  col: { width: "48%" },
  summaryText: { textAlign: "justify" },
});

function SectionHeading({ title }: { title: string }) {
  return (
    <View>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionRule} />
    </View>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.bulletRow}>
      <Text style={styles.bulletDot}>•</Text>
      <Text style={styles.bulletText}>{children}</Text>
    </View>
  );
}

function chunkTwo<T>(items: T[]): [T[], T[]] {
  const mid = Math.ceil(items.length / 2);
  return [items.slice(0, mid), items.slice(mid)];
}

export default function ResumeDocument(props: ResumeDocumentProps) {
  const {
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
    hiddenBulletIds = [],
  } = props;

  const hidden = new Set(hiddenBulletIds);

  const visibleSkills = skills.filter((s) => s.visible);
  const skillGroups = Object.entries(
    visibleSkills.reduce<Record<string, string[]>>((acc, sk) => {
      (acc[sk.category] ||= []).push(sk.name);
      return acc;
    }, {})
  );
  const [skillsLeft, skillsRight] = chunkTwo(skillGroups);

  return (
    <Document title={`${profile.name} Resume`}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View>
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.title}>{profile.title}</Text>
          <View style={styles.contactRow}>
            {profile.phone ? (
              <Text style={styles.contactItem}>{profile.phone}</Text>
            ) : null}
            {profile.email ? (
              <Link
                style={[styles.contactItem, styles.link]}
                src={`mailto:${profile.email}`}
              >
                {profile.email}
              </Link>
            ) : null}
            {profile.linkedin ? (
              <Link
                style={[styles.contactItem, styles.link]}
                src={normalizeUrl(profile.linkedin)}
              >
                LinkedIn
              </Link>
            ) : null}
            {profile.github ? (
              <Link
                style={[styles.contactItem, styles.link]}
                src={normalizeUrl(profile.github)}
              >
                GitHub
              </Link>
            ) : null}
            {profile.location ? (
              <Text style={styles.contactItem}>{profile.location}</Text>
            ) : null}
          </View>
        </View>
        <View style={styles.headerRule} />

        {customText ? (
          <Text style={{ marginBottom: 6 }}>{customText}</Text>
        ) : null}

        {/* Summary */}
        {profile.about ? (
          <View style={styles.section}>
            <SectionHeading title="Summary" />
            <Text style={styles.summaryText}>{profile.about}</Text>
          </View>
        ) : null}

        {/* Experience */}
        {experience.length > 0 ? (
          <View style={styles.section}>
            <SectionHeading title="Work Experience" />
            {experience.map((exp) => {
              const bullets = filterBulletsByDomain(exp.bullets, domainId).filter(
                (b) => !hidden.has(b.id)
              );
              return (
                <View key={exp.id} style={{ marginBottom: 4 }}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.bold}>
                      {exp.role}
                      {exp.company ? `, ${exp.company}` : ""}
                    </Text>
                    <Text style={styles.muted}>
                      {exp.startDate} - {exp.endDate}
                    </Text>
                  </View>
                  {bullets.map((b) => (
                    <Bullet key={b.id}>{b.text}</Bullet>
                  ))}
                </View>
              );
            })}
          </View>
        ) : null}

        {/* Education */}
        {education.length > 0 ? (
          <View style={styles.section}>
            <SectionHeading title="Education" />
            {education.map((edu) => (
              <View key={edu.id} style={{ marginBottom: 2 }}>
                <View style={styles.rowBetween}>
                  <Text>
                    <Text style={styles.bold}>{edu.degree}</Text>
                    {edu.institute ? `  ${edu.institute}` : ""}
                  </Text>
                  <Text style={styles.muted}>
                    {edu.score ? `${edu.score}   ` : ""}
                    {edu.startDate} - {edu.endDate}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : null}

        {/* Technical Skills */}
        {skillGroups.length > 0 ? (
          <View style={styles.section}>
            <SectionHeading title="Technical Skills" />
            <View style={styles.twoCol}>
              <View style={styles.col}>
                {skillsLeft.map(([cat, names]) => (
                  <Bullet key={cat}>
                    <Text style={styles.bold}>{cat}: </Text>
                    {names.join(", ")}
                  </Bullet>
                ))}
              </View>
              <View style={styles.col}>
                {skillsRight.map(([cat, names]) => (
                  <Bullet key={cat}>
                    <Text style={styles.bold}>{cat}: </Text>
                    {names.join(", ")}
                  </Bullet>
                ))}
              </View>
            </View>
          </View>
        ) : null}

        {/* Projects */}
        {projects.length > 0 ? (
          <View style={styles.section}>
            <SectionHeading title="Projects" />
            {projects.map((proj) => {
              const bullets = filterBulletsByDomain(proj.bullets, domainId).filter(
                (b) => !hidden.has(b.id)
              );
              const [left, right] = chunkTwo(bullets);
              return (
                <View key={proj.id} style={{ marginBottom: 4 }}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.bold}>
                      {proj.title}
                      {proj.tools.length > 0 ? (
                        <Text style={[styles.muted, { fontFamily: "Helvetica" }]}>
                          {"  |  "}
                          {proj.tools.join(", ")}
                        </Text>
                      ) : null}
                    </Text>
                    {proj.sourceLink ? (
                      <Link style={styles.link} src={normalizeUrl(proj.sourceLink)}>
                        Source
                      </Link>
                    ) : null}
                  </View>
                  <View style={styles.twoCol}>
                    <View style={styles.col}>
                      {left.map((b) => (
                        <Bullet key={b.id}>{b.text}</Bullet>
                      ))}
                    </View>
                    <View style={styles.col}>
                      {right.map((b) => (
                        <Bullet key={b.id}>{b.text}</Bullet>
                      ))}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        ) : null}

        {/* Certifications */}
        {certifications.length > 0 ? (
          <View style={styles.section}>
            <SectionHeading title="Certifications" />
            {certifications.map((c) => (
              <View key={c.id} style={styles.rowBetween}>
                <Text>
                  <Text style={styles.bold}>{c.name}</Text>
                  {c.issuer ? `  ${c.issuer}` : ""}
                </Text>
                <Text style={styles.muted}>{c.date}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* Achievements (Awards) */}
        {awards.length > 0 ? (
          <View style={styles.section}>
            <SectionHeading title="Achievements" />
            {awards.map((a) => (
              <View key={a.id} style={{ marginBottom: 2 }}>
                <View style={styles.rowBetween}>
                  <Text>
                    <Text style={styles.bold}>{a.title}</Text>
                    {a.organization ? `  ${a.organization}` : ""}
                  </Text>
                  <Text style={styles.muted}>{a.date}</Text>
                </View>
                {a.description ? (
                  <Text style={styles.muted}>{a.description}</Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}

        {/* Languages */}
        {languages.length > 0 ? (
          <View style={styles.section}>
            <SectionHeading title="Languages" />
            <Text>
              {languages.map((l) => `${l.name} (${l.proficiency})`).join("   ·   ")}
            </Text>
          </View>
        ) : null}

        {/* Strengths */}
        {strengths.length > 0 ? (
          <View style={styles.section}>
            <SectionHeading title="Strengths" />
            {strengths.map((s) => (
              <Bullet key={s.id}>{s.name}</Bullet>
            ))}
          </View>
        ) : null}

        {/* Hobbies */}
        {hobbies.length > 0 ? (
          <View style={styles.section}>
            <SectionHeading title="Hobbies" />
            {hobbies.map((h) => (
              <Bullet key={h.id}>{h.name}</Bullet>
            ))}
          </View>
        ) : null}
      </Page>
    </Document>
  );
}

function normalizeUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}
