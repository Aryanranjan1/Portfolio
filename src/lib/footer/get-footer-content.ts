import { getContactMethods, getFooterExploreItems, getFooterResources, getSiteSettings } from "@/db/queries/site";
import { isConfiguredContact } from "@/lib/contact/is-configured-contact";

export type FooterContent = {
  name: string;
  description: string;
  email: string;
  githubUrl: string;
  linkedinUrl: string;
  xUrl: string;
  location: string;
  worldwideText: string;
  resources: { id: string; label: string; url: string }[];
  exploreItems: { id: string; label: string; url: string }[];
};

export async function getFooterContent(): Promise<FooterContent> {
  const [settings, methods, resources, exploreItems] = await Promise.all([getSiteSettings(), getContactMethods(), getFooterResources(), getFooterExploreItems()]);
  const configuredMethods = methods.filter(isConfiguredContact);
  const byType = new Map(configuredMethods.map((method) => [method.type, method]));
  const email = byType.get("email");
  const primaryEmail = settings?.primaryEmail;
  const configuredPrimaryEmail = primaryEmail && !/example\.(com|org)|your-email/i.test(primaryEmail) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(primaryEmail);
  return {
    name: settings?.personName.toUpperCase() ?? "",
    description: settings?.shortDescription ?? "",
    email: email?.url ?? (configuredPrimaryEmail ? `mailto:${primaryEmail}` : ""),
    githubUrl: byType.get("github")?.url ?? "",
    linkedinUrl: byType.get("linkedin")?.url ?? "",
    xUrl: byType.get("x")?.url ?? "",
    location: settings?.location ?? "",
    worldwideText: "// Working worldwide.",
    resources,
    exploreItems,
  };
}
