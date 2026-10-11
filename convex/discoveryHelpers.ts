export function isPublicIndexable(row: Record<string, unknown>) {
  return row.status === "published" && row.robotsIndex === true;
}

export function isPublishedSlugMatch(row: Record<string, unknown> | null | undefined, slug: string) {
  return row?.slug === slug && row.status === "published";
}
