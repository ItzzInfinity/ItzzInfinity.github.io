/**
 * Renders ResumeDocument to a real PDF for visual verification against
 * template.pdf. Uses the app's seed data so layout/spacing/columns are
 * exercised exactly as the in-app download would produce them.
 *
 * Run: npx tsx scripts/render-sample.tsx [domainId]
 * Output: parsed/sample-resume.pdf
 */
import React from "react";
import { renderToFile, type DocumentProps } from "@react-pdf/renderer";
import ResumeDocument from "@/components/resume/ResumeDocument";
import { seedData } from "@/lib/seed";
import { filterByDomain } from "@/lib/filter";

async function main() {
  const domainId = process.argv[2] || "vlsi";
  const domain = seedData.domains.find((d) => d.id === domainId);
  const props = {
    domainId,
    headerTitle: domain?.resumeTitle ?? seedData.profile.title,
    summaryText: domain?.summary ?? seedData.profile.about,
    profile: seedData.profile,
    skills: filterByDomain(seedData.skills, domainId),
    experience: filterByDomain(seedData.experience, domainId),
    education: seedData.education,
    projects: filterByDomain(seedData.projects, domainId),
    certifications: filterByDomain(seedData.certifications, domainId),
    awards: filterByDomain(seedData.awards, domainId),
    languages: seedData.languages,
    hobbies: seedData.hobbies,
    strengths: seedData.strengths,
    hiddenBulletIds: [],
  };
  const out = "parsed/sample-resume.pdf";
  const element = React.createElement(ResumeDocument, props) as React.ReactElement<DocumentProps>;
  await renderToFile(element, out);
  console.log(`Wrote ${out} for domain "${domainId}"`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
