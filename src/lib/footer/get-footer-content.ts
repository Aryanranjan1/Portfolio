import { getContactMethods, getFooterExploreItems, getFooterResources, getSiteSettings } from "@/lib/convex/queries/site";
import { mapFooterSocialLinks } from "./map-footer-social-links";

export type FooterContent = {
  name: string;
  description: string;
  socialLinks: ReturnType<typeof mapFooterSocialLinks>;
  location: string;
  worldwideText: string;
  resources: { id: string; label: string; url: string }[];
  exploreItems: { id: string; label: string; url: string }[];
};

export async function getFooterContent(): Promise<FooterContent> {
  const [settings, methods, resources, exploreItems] = await Promise.all([getSiteSettings(), getContactMethods(), getFooterResources(), getFooterExploreItems()]);
  return {
    name: settings?.personName.toUpperCase() ?? "",
    description: settings?.shortDescription ?? "",
    socialLinks: mapFooterSocialLinks(methods, settings?.primaryEmail),
    location: settings?.location ?? "",
    worldwideText: "// Working worldwide.",
    resources,
    exploreItems,
  };
}
