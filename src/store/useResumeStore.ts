import { create } from "zustand";
import { AppData, Domain, Skill, Experience, Education, Project, Certification, Award, Language, Hobby, Reference, Profile } from "@/types";
import { loadData, saveData } from "@/lib/storage";
import { v4 as uuidv4 } from "uuid";

interface ResumeStore extends AppData {
  // Profile
  updateProfile: (profile: Partial<Profile>) => void;

  // Domains
  addDomain: (domain: Omit<Domain, "id">) => void;
  updateDomain: (id: string, updates: Partial<Domain>) => void;
  deleteDomain: (id: string) => void;
  reorderDomains: (domains: Domain[]) => void;

  // Skills
  addSkill: (skill: Omit<Skill, "id">) => void;
  updateSkill: (id: string, updates: Partial<Skill>) => void;
  deleteSkill: (id: string) => void;

  // Experience
  addExperience: (exp: Omit<Experience, "id">) => void;
  updateExperience: (id: string, updates: Partial<Experience>) => void;
  deleteExperience: (id: string) => void;

  // Education
  addEducation: (edu: Omit<Education, "id">) => void;
  updateEducation: (id: string, updates: Partial<Education>) => void;
  deleteEducation: (id: string) => void;

  // Projects
  addProject: (project: Omit<Project, "id">) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  // Certifications
  addCertification: (cert: Omit<Certification, "id">) => void;
  updateCertification: (id: string, updates: Partial<Certification>) => void;
  deleteCertification: (id: string) => void;

  // Awards
  addAward: (award: Omit<Award, "id">) => void;
  updateAward: (id: string, updates: Partial<Award>) => void;
  deleteAward: (id: string) => void;

  // Languages
  addLanguage: (lang: Omit<Language, "id">) => void;
  updateLanguage: (id: string, updates: Partial<Language>) => void;
  deleteLanguage: (id: string) => void;

  // Hobbies
  addHobby: (hobby: Omit<Hobby, "id">) => void;
  updateHobby: (id: string, updates: Partial<Hobby>) => void;
  deleteHobby: (id: string) => void;

  // References
  addReference: (ref: Omit<Reference, "id">) => void;
  updateReference: (id: string, updates: Partial<Reference>) => void;
  deleteReference: (id: string) => void;
}

function persist(data: AppData) {
  saveData(data);
}

const initial = loadData();

export const useResumeStore = create<ResumeStore>((set, get) => ({
  ...initial,

  updateProfile: (updates) =>
    set((s) => {
      const next = { ...s, profile: { ...s.profile, ...updates } };
      persist(next);
      return next;
    }),

  addDomain: (domain) =>
    set((s) => {
      const next = { ...s, domains: [...s.domains, { ...domain, id: uuidv4() }] };
      persist(next);
      return next;
    }),
  updateDomain: (id, updates) =>
    set((s) => {
      const next = { ...s, domains: s.domains.map((d) => (d.id === id ? { ...d, ...updates } : d)) };
      persist(next);
      return next;
    }),
  deleteDomain: (id) =>
    set((s) => {
      const next = { ...s, domains: s.domains.filter((d) => d.id !== id) };
      persist(next);
      return next;
    }),
  reorderDomains: (domains) =>
    set((s) => {
      const next = { ...s, domains };
      persist(next);
      return next;
    }),

  addSkill: (skill) =>
    set((s) => {
      const next = { ...s, skills: [...s.skills, { ...skill, id: uuidv4() }] };
      persist(next);
      return next;
    }),
  updateSkill: (id, updates) =>
    set((s) => {
      const next = { ...s, skills: s.skills.map((sk) => (sk.id === id ? { ...sk, ...updates } : sk)) };
      persist(next);
      return next;
    }),
  deleteSkill: (id) =>
    set((s) => {
      const next = { ...s, skills: s.skills.filter((sk) => sk.id !== id) };
      persist(next);
      return next;
    }),

  addExperience: (exp) =>
    set((s) => {
      const next = { ...s, experience: [...s.experience, { ...exp, id: uuidv4() }] };
      persist(next);
      return next;
    }),
  updateExperience: (id, updates) =>
    set((s) => {
      const next = { ...s, experience: s.experience.map((e) => (e.id === id ? { ...e, ...updates } : e)) };
      persist(next);
      return next;
    }),
  deleteExperience: (id) =>
    set((s) => {
      const next = { ...s, experience: s.experience.filter((e) => e.id !== id) };
      persist(next);
      return next;
    }),

  addEducation: (edu) =>
    set((s) => {
      const next = { ...s, education: [...s.education, { ...edu, id: uuidv4() }] };
      persist(next);
      return next;
    }),
  updateEducation: (id, updates) =>
    set((s) => {
      const next = { ...s, education: s.education.map((e) => (e.id === id ? { ...e, ...updates } : e)) };
      persist(next);
      return next;
    }),
  deleteEducation: (id) =>
    set((s) => {
      const next = { ...s, education: s.education.filter((e) => e.id !== id) };
      persist(next);
      return next;
    }),

  addProject: (project) =>
    set((s) => {
      const next = { ...s, projects: [...s.projects, { ...project, id: uuidv4() }] };
      persist(next);
      return next;
    }),
  updateProject: (id, updates) =>
    set((s) => {
      const next = { ...s, projects: s.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)) };
      persist(next);
      return next;
    }),
  deleteProject: (id) =>
    set((s) => {
      const next = { ...s, projects: s.projects.filter((p) => p.id !== id) };
      persist(next);
      return next;
    }),

  addCertification: (cert) =>
    set((s) => {
      const next = { ...s, certifications: [...s.certifications, { ...cert, id: uuidv4() }] };
      persist(next);
      return next;
    }),
  updateCertification: (id, updates) =>
    set((s) => {
      const next = { ...s, certifications: s.certifications.map((c) => (c.id === id ? { ...c, ...updates } : c)) };
      persist(next);
      return next;
    }),
  deleteCertification: (id) =>
    set((s) => {
      const next = { ...s, certifications: s.certifications.filter((c) => c.id !== id) };
      persist(next);
      return next;
    }),

  addAward: (award) =>
    set((s) => {
      const next = { ...s, awards: [...s.awards, { ...award, id: uuidv4() }] };
      persist(next);
      return next;
    }),
  updateAward: (id, updates) =>
    set((s) => {
      const next = { ...s, awards: s.awards.map((a) => (a.id === id ? { ...a, ...updates } : a)) };
      persist(next);
      return next;
    }),
  deleteAward: (id) =>
    set((s) => {
      const next = { ...s, awards: s.awards.filter((a) => a.id !== id) };
      persist(next);
      return next;
    }),

  addLanguage: (lang) =>
    set((s) => {
      const next = { ...s, languages: [...s.languages, { ...lang, id: uuidv4() }] };
      persist(next);
      return next;
    }),
  updateLanguage: (id, updates) =>
    set((s) => {
      const next = { ...s, languages: s.languages.map((l) => (l.id === id ? { ...l, ...updates } : l)) };
      persist(next);
      return next;
    }),
  deleteLanguage: (id) =>
    set((s) => {
      const next = { ...s, languages: s.languages.filter((l) => l.id !== id) };
      persist(next);
      return next;
    }),

  addHobby: (hobby) =>
    set((s) => {
      const next = { ...s, hobbies: [...s.hobbies, { ...hobby, id: uuidv4() }] };
      persist(next);
      return next;
    }),
  updateHobby: (id, updates) =>
    set((s) => {
      const next = { ...s, hobbies: s.hobbies.map((h) => (h.id === id ? { ...h, ...updates } : h)) };
      persist(next);
      return next;
    }),
  deleteHobby: (id) =>
    set((s) => {
      const next = { ...s, hobbies: s.hobbies.filter((h) => h.id !== id) };
      persist(next);
      return next;
    }),

  addReference: (ref) =>
    set((s) => {
      const next = { ...s, references: [...s.references, { ...ref, id: uuidv4() }] };
      persist(next);
      return next;
    }),
  updateReference: (id, updates) =>
    set((s) => {
      const next = { ...s, references: s.references.map((r) => (r.id === id ? { ...r, ...updates } : r)) };
      persist(next);
      return next;
    }),
  deleteReference: (id) =>
    set((s) => {
      const next = { ...s, references: s.references.filter((r) => r.id !== id) };
      persist(next);
      return next;
    }),
}));
