import { cache } from "react";
import { readPublic } from "@/lib/convex-read";
import { getPublicAboutTechnologies } from "@/lib/about/technologies";
import type { ConvexRow } from "../types";

type PublicSkill = {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string | null;
  details: string | null;
  position: number;
  iconMediaId: string | null;
  icon: { id: string; url: string; filename: string; altText: string | null; width: number | null; height: number | null } | null;
};
type PublicSkillCategory = { id: string; name: string; slug: string; description: string | null; position: number; skills: PublicSkill[] };
type Settings = ConvexRow<"siteSettings">;
type ContactMethod = ConvexRow<"contactMethod"> & { iconUrl: string | null };
type FooterResource = Pick<ConvexRow<"footerResource">, "id" | "label" | "url">;
type FooterExploreItem = Pick<ConvexRow<"footerExploreItem">, "id" | "label" | "url">;
type Timeline = ConvexRow<"timelineEntry">;
type FAQ = ConvexRow<"faq">;
type AboutTechnology = { id: string; label: string; position: number; active: boolean; logoUrl: string | null };
type SocialImage = Pick<ConvexRow<"media">, "id" | "url" | "filename" | "mimeType" | "width" | "height" | "altText">;
type Resume = Pick<ConvexRow<"media">, "id" | "filename" | "mimeType" | "storageKey" | "url" | "fileSizeBytes" | "deletionPending">;

export const getSiteSettings = cache(async function getSiteSettings() {
  return readPublic<Settings | null>("siteSettings");
});

export const getDefaultSocialImage = cache(async function getDefaultSocialImage() {
  return readPublic<SocialImage | null>("defaultSocialImage");
});

export async function getConfiguredResume() {
  return readPublic<Resume | null>("configuredResume");
}

export const getContactMethods = cache(async function getContactMethods() {
  return readPublic<ContactMethod[]>("contactMethods");
});

export async function getFooterResources() {
  return readPublic<FooterResource[]>("footerResources");
}

export async function getFooterExploreItems() {
  return readPublic<FooterExploreItem[]>("footerExploreItems");
}

export async function getTimeline() {
  return readPublic<Timeline[]>("timeline");
}

export async function getFAQs() {
  return readPublic<FAQ[]>("faqs");
}

export async function getAboutTechnologies() {
  const rows = await readPublic<AboutTechnology[]>("aboutTechnologies");
  return getPublicAboutTechnologies(rows);
}

export async function getSkills() {
  return readPublic<PublicSkillCategory[]>("skills");
}
