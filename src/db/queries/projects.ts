import { and, desc, eq, inArray } from "drizzle-orm";
import { cache } from "react";

import { db } from "../index";

import {
  project,
  projectBlock,
  projectCategory,
  projectCategoryAssignment,
  projectLink,
  projectMedia,
  projectSection,
  projectTechnology,
  technology,
} from "../schema/projects";

import { media } from "../schema/media";
import { slugRedirect } from "../schema/slug-redirects";

/**
 * Get all published projects.
 *
 * Used by the public projects listing.
 */
export async function getPublishedProjects() {
  return db
    .select()
    .from(project)
    .where(eq(project.status, "published"))
    .orderBy(desc(project.publishedAt));
}

/** Published and indexable projects for discovery surfaces. */
export async function getDiscoverableProjects() {
  return db.select({ slug: project.slug, title: project.title, updatedAt: project.updatedAt, canonicalOverride: project.canonicalOverride })
    .from(project)
    .where(and(eq(project.status, "published"), eq(project.robotsIndex, true)))
    .orderBy(desc(project.publishedAt));
}

/**
 * Get the featured published project.
 *
 * Returns one project or null.
 */
export async function getFeaturedProjects() {
  return db
    .select()
    .from(project)
    .where(
      and(
        eq(project.status, "published"),
        eq(project.featured, true),
      ),
    )
    .orderBy(
      desc(project.publishedAt),
      project.title,
    );
}

/**
 * Get one published project by slug.
 */
export async function getPublishedProjectBySlug(
  slug: string,
) {
  const result = await db
    .select()
    .from(project)
    .where(
      and(
        eq(project.slug, slug),
        eq(project.status, "published"),
      ),
    )
    .limit(1);

  return result[0] ?? null;
}

export async function getProjectSlugById(id: string) {
  const rows = await db.select({ slug: project.slug }).from(project).where(eq(project.id, id)).limit(1);
  return rows[0]?.slug ?? null;
}

export async function getProjectRedirectSlug(oldSlug: string) {
  const [row] = await db.select({ entityId: slugRedirect.entityId, newSlug: slugRedirect.newSlug }).from(slugRedirect)
    .where(and(eq(slugRedirect.kind, "project"), eq(slugRedirect.oldSlug, oldSlug))).limit(1);
  if (!row) return null;
  const [published] = await db.select({ slug: project.slug }).from(project)
    .where(and(eq(project.id, row.entityId), eq(project.slug, row.newSlug), eq(project.status, "published"))).limit(1);
  return published?.slug ?? null;
}

/**
 * Get categories assigned to a project.
 */
export async function getProjectCategories(
  projectId: string,
) {
  return db
    .select({
      id: projectCategory.id,
      name: projectCategory.name,
      slug: projectCategory.slug,
      description: projectCategory.description,
    })
    .from(projectCategoryAssignment)
    .innerJoin(
      projectCategory,
      eq(
        projectCategoryAssignment.categoryId,
        projectCategory.id,
      ),
    )
    .where(
      eq(
        projectCategoryAssignment.projectId,
        projectId,
      ),
    );
}

/** Get the distinct categories used by published projects. */
export async function getPublishedProjectCategoryNames() {
  return db
    .selectDistinct({ name: projectCategory.name })
    .from(projectCategoryAssignment)
    .innerJoin(projectCategory, eq(projectCategoryAssignment.categoryId, projectCategory.id))
    .innerJoin(project, eq(projectCategoryAssignment.projectId, project.id))
    .where(eq(project.status, "published"))
    .orderBy(projectCategory.name);
}

/**
 * Get technologies assigned to a project.
 */
export async function getProjectTechnologies(
  projectId: string,
) {
  return db
    .select({
      id: technology.id,
      name: technology.name,
      slug: technology.slug,
      description: technology.description,
      websiteUrl: technology.websiteUrl,
      iconMediaId: technology.iconMediaId,
    })
    .from(projectTechnology)
    .innerJoin(
      technology,
      eq(
        projectTechnology.technologyId,
        technology.id,
      ),
    )
    .where(
      eq(
        projectTechnology.projectId,
        projectId,
      ),
    )
    .orderBy(projectTechnology.position);
}

/**
 * Get the ordered semantic sections belonging to a project.
 */
export async function getProjectSections(
  projectId: string,
) {
  return db
    .select()
    .from(projectSection)
    .where(eq(projectSection.projectId, projectId))
    .orderBy(projectSection.position);
}

/**
 * Get the ordered blocks belonging to one project section.
 */
export async function getProjectBlocks(
  sectionId: string,
) {
  return db
    .select()
    .from(projectBlock)
    .where(
      eq(
        projectBlock.projectSectionId,
        sectionId,
      ),
    )
    .orderBy(projectBlock.position);
}

/**
 * Get project links ordered for display.
 */
export async function getProjectLinks(
  projectId: string,
) {
  const links = await db
    .select()
    .from(projectLink)
    .where(eq(projectLink.projectId, projectId))
    .orderBy(projectLink.position);
  return links.filter(({ url }) => {
    try {
      const parsed = new URL(url);
      return !["example.com", "example.org", "example.net"].some((host) => parsed.hostname === host || parsed.hostname.endsWith(`.${host}`)) && !(parsed.hostname === "github.com" && parsed.pathname.startsWith("/example/"));
    } catch {
      return false;
    }
  });
}

/**
 * Get media attached to a project.
 */
export async function getProjectMedia(
  projectId: string,
) {
  return db
    .select({
      projectId: projectMedia.projectId,
      mediaId: projectMedia.mediaId,
      role: projectMedia.role,
      position: projectMedia.position,
      caption: projectMedia.caption,
      altTextOverride: projectMedia.altTextOverride,

      storageKey: media.storageKey,
      url: media.url,
      filename: media.filename,
      mimeType: media.mimeType,
      width: media.width,
      height: media.height,
      altText: media.altText,
    })
    .from(projectMedia)
    .innerJoin(
      media,
      eq(projectMedia.mediaId, media.id),
    )
    .where(
      eq(projectMedia.projectId, projectId),
    )
    .orderBy(projectMedia.position);
}

/** Load listing relationships for a set of projects in three queries. */
export async function getProjectListingRelationships(projectIds: string[]) {
  const grouped = new Map(projectIds.map((id) => [id, { categories: [] as { id: string; name: string; slug: string; description: string | null }[], technologies: [] as { id: string; name: string; slug: string; description: string | null; websiteUrl: string | null; iconMediaId: string | null }[], media: [] as Awaited<ReturnType<typeof getProjectMedia>> }]));
  if (!projectIds.length) return grouped;
  const [categories, technologies, mediaRows] = await Promise.all([
    db.select({ projectId: projectCategoryAssignment.projectId, id: projectCategory.id, name: projectCategory.name, slug: projectCategory.slug, description: projectCategory.description })
      .from(projectCategoryAssignment).innerJoin(projectCategory, eq(projectCategoryAssignment.categoryId, projectCategory.id))
      .where(inArray(projectCategoryAssignment.projectId, projectIds)),
    db.select({ projectId: projectTechnology.projectId, id: technology.id, name: technology.name, slug: technology.slug, description: technology.description, websiteUrl: technology.websiteUrl, iconMediaId: technology.iconMediaId })
      .from(projectTechnology).innerJoin(technology, eq(projectTechnology.technologyId, technology.id))
      .where(inArray(projectTechnology.projectId, projectIds)).orderBy(projectTechnology.position),
    db.select({ projectId: projectMedia.projectId, mediaId: projectMedia.mediaId, role: projectMedia.role, position: projectMedia.position, caption: projectMedia.caption, altTextOverride: projectMedia.altTextOverride, storageKey: media.storageKey, url: media.url, filename: media.filename, mimeType: media.mimeType, width: media.width, height: media.height, altText: media.altText })
      .from(projectMedia).innerJoin(media, eq(projectMedia.mediaId, media.id))
      .where(inArray(projectMedia.projectId, projectIds)).orderBy(projectMedia.position),
  ]);
  for (const row of categories) grouped.get(row.projectId)?.categories.push({ id: row.id, name: row.name, slug: row.slug, description: row.description });
  for (const row of technologies) grouped.get(row.projectId)?.technologies.push({ id: row.id, name: row.name, slug: row.slug, description: row.description, websiteUrl: row.websiteUrl, iconMediaId: row.iconMediaId });
  for (const row of mediaRows) grouped.get(row.projectId)?.media.push(row);
  return grouped;
}

/**
 * Get a complete published project page.
 *
 * This composes the project and all of its related
 * public content into one server-side data structure.
 */
export const getPublishedProjectPage = cache(async function getPublishedProjectPage(slug: string) {
  const currentProject =
    await getPublishedProjectBySlug(slug);

  if (!currentProject) {
    return null;
  }

  const [
    categories,
    technologies,
    sections,
    links,
    projectMediaItems,
  ] = await Promise.all([
    getProjectCategories(currentProject.id),
    getProjectTechnologies(currentProject.id),
    getProjectSections(currentProject.id),
    getProjectLinks(currentProject.id),
    getProjectMedia(currentProject.id),
  ]);

  const allBlocks = sections.length ? await db.select().from(projectBlock)
    .where(inArray(projectBlock.projectSectionId, sections.map((section) => section.id)))
    .orderBy(projectBlock.position) : [];
  const blocksBySection = new Map<string, typeof allBlocks>();
  for (const block of allBlocks) {
    const group = blocksBySection.get(block.projectSectionId) ?? [];
    group.push(block);
    blocksBySection.set(block.projectSectionId, group);
  }
  const sectionsWithBlocks = sections.map((section) => ({ ...section, blocks: blocksBySection.get(section.id) ?? [] }));

  return {
    ...currentProject,
    categories,
    technologies,
    sections: sectionsWithBlocks,
    links,
    media: projectMediaItems,
  };
});
