export interface Profile {
  name: string;
  title: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  portfolio: string;
  location: string;
  about: string;
}

export interface Domain {
  id: string;
  name: string;
  slug: string;
  enabled: boolean;
  order: number;
  parentId?: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  domainIds: string[];
  priority: number;
  visible: boolean;
}

export interface ExperienceBullet {
  id: string;
  text: string;
  priority: number;
  domainIds: string[];
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  location: string;
  domainIds: string[];
  bullets: ExperienceBullet[];
}

export interface Education {
  id: string;
  degree: string;
  institute: string;
  startDate: string;
  endDate: string;
  score: string;
  location: string;
}

export interface ProjectBullet {
  id: string;
  text: string;
  priority: number;
  domainIds: string[];
}

export interface Project {
  id: string;
  title: string;
  domainIds: string[];
  sourceLink: string;
  tools: string[];
  bullets: ProjectBullet[];
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  credentialLink: string;
  domainIds: string[];
}

export interface Award {
  id: string;
  title: string;
  organization: string;
  date: string;
  description: string;
  domainIds: string[];
}

export interface Language {
  id: string;
  name: string;
  proficiency: string;
}

export interface Hobby {
  id: string;
  name: string;
}

export interface Reference {
  id: string;
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
}

export type SectionKey =
  | "summary"
  | "skills"
  | "experience"
  | "projects"
  | "education"
  | "certifications"
  | "awards"
  | "languages"
  | "hobbies"
  | "references";

export interface AppData {
  profile: Profile;
  domains: Domain[];
  skills: Skill[];
  experience: Experience[];
  education: Education[];
  projects: Project[];
  certifications: Certification[];
  awards: Award[];
  languages: Language[];
  hobbies: Hobby[];
  references: Reference[];
}
