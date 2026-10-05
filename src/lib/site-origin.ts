import { getSiteSettings } from "@/db/queries/site";
import { normalizeUsableCanonicalOverride, normalizeUsableSiteOrigin } from "@/lib/seo/origin-validation";

export { isUsableCanonicalOverride, normalizeUsableSiteOrigin, normalizeUsableCanonicalOverride } from "@/lib/seo/origin-validation";

export function validateCanonicalOrigin(value: unknown): string {
  if (typeof value !== "string") throw new Error("VALIDATION_ERROR");
  const normalized = normalizeUsableSiteOrigin(value);
  if (!normalized) throw new Error("VALIDATION_ERROR");
  return normalized;
}

export function getSiteOriginConfiguration(settings: { canonicalOrigin: string } | null) {
  const environmentValue = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const configuredValue = environmentValue || settings?.canonicalOrigin || "";
  return {
    source: environmentValue ? "environment" as const : "siteSettings" as const,
    configuredValue,
    effectiveOrigin: normalizeUsableSiteOrigin(configuredValue),
  };
}

export async function getSiteOrigin(configuredSettings?: Awaited<ReturnType<typeof getSiteSettings>>): Promise<URL | null> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const settings = configured ? null : configuredSettings ?? await getSiteSettings();
  const value = configured || settings?.canonicalOrigin;
  const normalized = normalizeUsableSiteOrigin(value);
  return normalized ? new URL(normalized) : null;
}

export async function getAbsoluteSiteUrl(path: string): Promise<string | null> {
  const origin = await getSiteOrigin();
  return origin ? new URL(path, origin).toString() : null;
}

export async function getCanonicalSiteUrl(path: string, override?: string | null): Promise<string | null> {
  const normalizedOverride = normalizeUsableCanonicalOverride(override);
  if (normalizedOverride) return normalizedOverride;
  return getAbsoluteSiteUrl(path);
}
