import { normalizeUsableCanonicalOverride, normalizeUsableSiteOrigin } from "./origin-validation";

export type SitemapEntry = { url: string; lastModified?: Date | string | number };

export function getSitemapContentUrl(originValue: string, path: string, canonicalOverride?: string | null) {
  const origin = normalizeUsableSiteOrigin(originValue);
  if (!origin) return null;

  const canonical = normalizeUsableCanonicalOverride(canonicalOverride);
  if (canonical) {
    return new URL(canonical).origin === origin ? canonical : null;
  }

  return new URL(path, origin).toString();
}

export function dedupeSitemapEntries<T extends SitemapEntry>(entries: T[]) {
  const seen = new Set<string>();
  return entries.filter((entry) => {
    if (seen.has(entry.url)) return false;
    seen.add(entry.url);
    return true;
  });
}
