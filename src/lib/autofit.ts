import { ProjectBullet, ExperienceBullet } from "@/types";

export interface FlatBullet {
  id: string;
  text: string;
  priority: number;
  parentId: string;
  parentType: "project" | "experience";
}

export function collectBullets(
  projects: { id: string; bullets: ProjectBullet[] }[],
  experience: { id: string; bullets: ExperienceBullet[] }[]
): FlatBullet[] {
  const bullets: FlatBullet[] = [];
  for (const p of projects) {
    for (const b of p.bullets) {
      bullets.push({ id: b.id, text: b.text, priority: b.priority, parentId: p.id, parentType: "project" });
    }
  }
  for (const e of experience) {
    for (const b of e.bullets) {
      bullets.push({ id: b.id, text: b.text, priority: b.priority, parentId: e.id, parentType: "experience" });
    }
  }
  return bullets.sort((a, b) => a.priority - b.priority);
}

export function isOverflowing(el: HTMLElement): boolean {
  return el.scrollHeight > el.clientHeight + 2;
}
