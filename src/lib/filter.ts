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

// A bullet with no domains of its own inherits its parent entry's. The Settings
// forms add bullets as `domainIds: []` and resolve them on save, so the order
// you click things in doesn't matter — stamping the parent's domains at
// "add bullet" time silently dropped every bullet typed before a domain chip
// was picked (it was saved with `[]` and filtered out of every resume).
export function inheritBulletDomains<T extends { domainIds: string[] }>(
  bullets: T[],
  parentDomainIds: string[]
): T[] {
  return bullets.map((b) => (b.domainIds.length ? b : { ...b, domainIds: [...parentDomainIds] }));
}
