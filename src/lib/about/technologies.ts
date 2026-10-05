export type AboutTechnologyRecord = {
  id: string;
  label: string;
  position: number;
  active: boolean;
  logoUrl: string | null;
};

export function getPublicAboutTechnologies<T extends AboutTechnologyRecord>(items: T[]) {
  return items
    .filter((item) => item.active)
    .sort((left, right) => left.position - right.position || left.id.localeCompare(right.id))
    .map(({ id, label, position, logoUrl }) => ({ id, label, position, logoUrl: logoUrl || null }));
}
