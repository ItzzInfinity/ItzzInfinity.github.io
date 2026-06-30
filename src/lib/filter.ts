export function filterByDomain<T extends { domainIds: string[] }>(
  items: T[],
  domainId: string
): T[] {
  return items.filter((item) => item.domainIds.includes(domainId));
}

export function filterBulletsByDomain<T extends { domainIds: string[] }>(
  bullets: T[],
  domainId: string
): T[] {
  return bullets
    .filter((b) => b.domainIds.includes(domainId))
    .sort((a, b) => {
      const pa = (a as unknown as { priority: number }).priority;
      const pb = (b as unknown as { priority: number }).priority;
      return pa - pb;
    });
}
