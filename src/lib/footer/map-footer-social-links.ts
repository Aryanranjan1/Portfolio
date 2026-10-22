import { isConfiguredContact } from "../contact/is-configured-contact";

export const footerSocialProviders = [
  "github",
  "linkedin",
  "x",
  "youtube",
  "threads",
  "instagram",
  "email",
] as const;

export type FooterSocialProvider = (typeof footerSocialProviders)[number];
export type FooterSocialLink = { type: FooterSocialProvider; href: string; label: string };
export type FooterContactMethod = { type: string; value: string | null; url: string | null; active: boolean };

const labels: Record<FooterSocialProvider, string> = {
  github: "GitHub",
  linkedin: "LinkedIn",
  x: "X",
  youtube: "YouTube",
  threads: "Threads",
  instagram: "Instagram",
  email: "Email",
};

export function mapFooterSocialLinks(
  methods: FooterContactMethod[],
  primaryEmail: string | null | undefined,
): FooterSocialLink[] {
  const grouped = new Map<string, FooterContactMethod[]>();

  for (const method of methods) {
    if (!method.active || !isConfiguredContact(method)) continue;
    const matches = grouped.get(method.type) ?? [];
    matches.push(method);
    grouped.set(method.type, matches);
  }

  const uniqueUrls = new Map<FooterSocialProvider, string>();
  for (const provider of footerSocialProviders) {
    const matches = grouped.get(provider) ?? [];
    // Duplicate provider records are ambiguous; suppress them instead of silently
    // selecting whichever record happened to appear last in the query.
    if (matches.length === 1 && matches[0].url) uniqueUrls.set(provider, matches[0].url);
  }

  if (!uniqueUrls.has("email") && isConfiguredPrimaryEmail(primaryEmail)) {
    uniqueUrls.set("email", `mailto:${primaryEmail.trim()}`);
  }

  return footerSocialProviders.flatMap((type) => {
    const href = uniqueUrls.get(type);
    return href ? [{ type, href, label: labels[type] }] : [];
  });
}

function isConfiguredPrimaryEmail(value: string | null | undefined): value is string {
  return Boolean(
    value &&
      !/example\.(com|org)|your-email/i.test(value) &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
  );
}
