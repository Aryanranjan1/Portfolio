import { eq } from "drizzle-orm";

import { db } from "../index";

import {
  contactMethod,
  siteSettings,
} from "../schema/site";

import {
  faq,
  timelineEntry,
} from "../schema/content";

import {
  skill,
  skillCategory,
} from "../schema/skills";

/**
 * Get the singleton site settings record.
 */
export async function getSiteSettings() {
  const result = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.singleton, true))
    .limit(1);

  return result[0] ?? null;
}

/**
 * Get active contact methods ordered by position.
 */
export async function getContactMethods() {
  return db
    .select()
    .from(contactMethod)
    .where(eq(contactMethod.active, true))
    .orderBy(contactMethod.position);
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

/**
 * Get all skill categories and their skills.
 */
export async function getSkills() {
  const categories = await db
    .select()
    .from(skillCategory)
    .orderBy(skillCategory.position);

  const skills = await db
    .select()
    .from(skill)
    .orderBy(skill.position);

  return categories.map((category) => ({
    ...category,
    skills: skills.filter(
      (item) => item.categoryId === category.id,
    ),
  }));
}