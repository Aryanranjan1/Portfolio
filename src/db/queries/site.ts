import { asc, eq } from "drizzle-orm";
import { cache } from "react";

import { db } from "../index";

import {
  contactMethod,
  footerResource,
  footerExploreItem,
  siteSettings,
} from "../schema/site";
import { media } from "../schema/media";

import {
  faq,
  timelineEntry,
} from "../schema/content";

import {
  skill,
  skillCategory,
} from "../schema/skills";
import { aboutTechnology } from "../schema/content";
import { getPublicAboutTechnologies } from "@/lib/about/technologies";

/**
 * Get the singleton site settings record.
 */
export const getSiteSettings = cache(async function getSiteSettings() {
  const result = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.singleton, true))
    .limit(1);

  return result[0] ?? null;
});

export const getDefaultSocialImage = cache(async function getDefaultSocialImage() {
  const [result] = await db
    .select({ id: media.id, url: media.url, filename: media.filename, mimeType: media.mimeType, width: media.width, height: media.height, altText: media.altText })
    .from(siteSettings)
    .innerJoin(media, eq(siteSettings.defaultSocialImageId, media.id))
    .where(eq(siteSettings.singleton, true))
    .limit(1);
  return result?.mimeType.startsWith("image/") ? result : null;
});

export async function getConfiguredResume() {
  const [resume] = await db.select({
    id: media.id,
    filename: media.filename,
    mimeType: media.mimeType,
    storageKey: media.storageKey,
    url: media.url,
    fileSizeBytes: media.fileSizeBytes,
    deletionPending: media.deletionPending,
  }).from(siteSettings)
    .innerJoin(media, eq(siteSettings.resumeMediaId, media.id))
    .where(eq(siteSettings.singleton, true))
    .limit(1);
  if (!resume || resume.deletionPending || resume.mimeType !== "application/pdf" || !resume.filename.toLowerCase().endsWith(".pdf") || !resume.storageKey.startsWith("resume/")) return null;
  return resume;
}

/**
 * Get active contact methods ordered by position.
 */
export const getContactMethods = cache(async function getContactMethods() {
  return db
    .select()
    .from(contactMethod)
    .where(eq(contactMethod.active, true))
    .orderBy(contactMethod.position);
});

export async function getFooterResources() {
  return db.select({ id: footerResource.id, label: footerResource.label, url: footerResource.url })
    .from(footerResource)
    .where(eq(footerResource.active, true))
    .orderBy(footerResource.position, footerResource.id);
}

export async function getFooterExploreItems() {
  return db.select({ id: footerExploreItem.id, label: footerExploreItem.label, url: footerExploreItem.url })
    .from(footerExploreItem).where(eq(footerExploreItem.active, true)).orderBy(footerExploreItem.position, footerExploreItem.id);
}

/**
 * Get active timeline entries ordered by position.
 */
export async function getTimeline() {
  return db
    .select()
    .from(timelineEntry)
    .where(eq(timelineEntry.active, true))
    .orderBy(timelineEntry.position);
}

/**
 * Get active FAQs ordered by position.
 */
export async function getFAQs() {
  return db
    .select()
    .from(faq)
    .where(eq(faq.active, true))
    .orderBy(faq.position);
}

export async function getAboutTechnologies() {
  const rows = await db.select({
    id: aboutTechnology.id,
    label: aboutTechnology.label,
    position: aboutTechnology.position,
    mediaId: aboutTechnology.mediaId,
    imageId: media.id,
    imageUrl: media.url,
    mimeType: media.mimeType,
    deletionPending: media.deletionPending,
  }).from(aboutTechnology)
    .leftJoin(media, eq(aboutTechnology.mediaId, media.id))
    .where(eq(aboutTechnology.active, true))
    .orderBy(asc(aboutTechnology.position), asc(aboutTechnology.id));

  return getPublicAboutTechnologies(rows.map((row) => ({
    id: row.id,
    label: row.label,
    position: row.position,
    active: true,
    logoUrl: row.imageId && !row.deletionPending && row.mimeType?.startsWith("image/") ? row.imageUrl : null,
  })));
}

/**
 * Get all skill categories and their skills.
 */
export async function getSkills() {
  const categories = await db
    .select()
    .from(skillCategory)
    .orderBy(skillCategory.position);

  const skills = await db
    .select({
      id: skill.id,
      categoryId: skill.categoryId,
      name: skill.name,
      slug: skill.slug,
      description: skill.description,
      details: skill.details,
      position: skill.position,
      iconMediaId: skill.iconMediaId,
      icon: {
        id: media.id,
        url: media.url,
        filename: media.filename,
        altText: media.altText,
        width: media.width,
        height: media.height,
      },
    })
    .from(skill)
    .leftJoin(media, eq(skill.iconMediaId, media.id))
    .orderBy(skill.position);

  return categories.map((category) => ({
    ...category,
    skills: skills.filter(
      (item) => item.categoryId === category.id,
    ),
  }));
}
