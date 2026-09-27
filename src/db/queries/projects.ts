import { and, desc, eq } from "drizzle-orm";

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

/**
 * Get the featured published project.
 *
 * Returns one project or null.
 */
export async function getFeaturedProject() {
  const result = await db
    .select()
    .from(project)
    .where(
      and(
        eq(project.status, "published"),
        eq(project.featured, true),
      ),
    )
    .orderBy(desc(project.publishedAt))
    .limit(1);

  return result[0] ?? null;
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
  return db
    .select()
    .from(projectLink)
    .where(eq(projectLink.projectId, projectId))
    .orderBy(projectLink.position);
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

/**
 * Get a complete published project page.
 *
 * This composes the project and all of its related
 * public content into one server-side data structure.
 */
export async function getPublishedProjectPage(
  slug: string,
) {
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

  const sectionsWithBlocks = await Promise.all(
    sections.map(async (section) => {
      const blocks = await getProjectBlocks(
        section.id,
      );

      return {
        ...section,
        blocks,
      };
    }),
  );

  return {
    ...currentProject,
    categories,
    technologies,
    sections: sectionsWithBlocks,
    links,
    media: projectMediaItems,
  };
}