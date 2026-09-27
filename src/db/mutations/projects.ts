import { and, eq, inArray, ne, or } from "drizzle-orm";

import { db } from "@/db";

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
} from "@/db/schema/projects";

import { media } from "@/db/schema/media";
import { throwMappedDatabaseError } from "@/db/mutations/db-errors";

export type ProjectStatus =
  | "draft"
  | "published"
  | "archived";

export type ProjectCategoryInput = {
  categoryId: string;
};

export type ProjectTechnologyInput = {
  technologyId: string;
  position: number;
};

export type ProjectMediaInput = {
  mediaId: string;
  role:
    | "hero"
    | "preview"
    | "problem_gallery"
    | "wireframe"
    | "gallery"
    | "other";
  position: number;
  caption: string | null;
  altTextOverride: string | null;
};

export type ProjectSectionInput = {
  id?: string;
  type:
    | "about"
    | "problem"
    | "solution"
    | "build"
    | "results"
    | "gallery"
    | "whats_next";
  title: string | null;
  anchor: string | null;
  position: number;
  blocks: ProjectBlockInput[];
};

export type ProjectBlockInput = {
  id?: string;
  type:
    | "rich_text"
    | "quote"
    | "image"
    | "gallery"
    | "problem_list"
    | "objective_list"
    | "technology_list"
    | "process_steps"
    | "metrics"
    | "roadmap"
    | "callout";
  position: number;
  data: Record<string, unknown>;
};

export type ProjectLinkInput = {
  id?: string;
  type:
    | "live"
    | "repository"
    | "case_study"
    | "documentation"
    | "demo"
    | "other";
  label: string;
  url: string;
  position: number;
};

export type CreateProjectInput = {
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  projectType: string;
  location: string | null;
  year: number | null;

  status: ProjectStatus;
  featured: boolean;
  publishedAt: Date | null;

  seoTitle: string | null;
  seoDescription: string | null;
  canonicalOverride: string | null;
  robotsIndex: boolean;
  robotsFollow: boolean;
  socialTitle: string | null;
  socialDescription: string | null;
  socialImageId: string | null;

  categories: ProjectCategoryInput[];
  technologies: ProjectTechnologyInput[];
  media: ProjectMediaInput[];
  sections: ProjectSectionInput[];
  links: ProjectLinkInput[];
};

export type ProjectCategoryRecordInput = {
  name: string;
  slug: string;
  description: string | null;
};

export type TechnologyInput = ProjectCategoryRecordInput & {
  websiteUrl: string | null;
  iconMediaId: string | null;
};

export async function createProjectCategory(input: ProjectCategoryRecordInput) {
  try {
    const [duplicate] = await db.select({ id: projectCategory.id }).from(projectCategory)
      .where(or(eq(projectCategory.name, input.name), eq(projectCategory.slug, input.slug))).limit(1);
    if (duplicate) throw new Error("CONFLICT");
    const [row] = await db.insert(projectCategory).values(input).returning();
    return row;
  } catch (error) {
    throwMappedDatabaseError(error);
  }
}

export async function updateProjectCategory(id: string, input: ProjectCategoryRecordInput) {
  try {
    const [existing] = await db.select({ id: projectCategory.id }).from(projectCategory).where(eq(projectCategory.id, id)).limit(1);
    if (!existing) throw new Error("NOT_FOUND");
    const [duplicate] = await db.select({ id: projectCategory.id }).from(projectCategory)
      .where(and(ne(projectCategory.id, id), or(eq(projectCategory.name, input.name), eq(projectCategory.slug, input.slug)))).limit(1);
    if (duplicate) throw new Error("CONFLICT");
    const [row] = await db.update(projectCategory).set(input).where(eq(projectCategory.id, id)).returning();
    if (!row) throw new Error("NOT_FOUND");
    return row;
  } catch (error) {
    throwMappedDatabaseError(error);
  }
}

export async function deleteProjectCategory(id: string) {
  try {
    const [row] = await db.delete(projectCategory).where(eq(projectCategory.id, id)).returning({ id: projectCategory.id });
    if (!row) throw new Error("NOT_FOUND");
    return row;
  } catch (error) {
    throwMappedDatabaseError(error);
  }
}

export async function createTechnology(input: TechnologyInput) {
  try {
    const [duplicate] = await db.select({ id: technology.id }).from(technology)
      .where(or(eq(technology.name, input.name), eq(technology.slug, input.slug))).limit(1);
    if (duplicate) throw new Error("CONFLICT");
    if (input.iconMediaId) await assertMediaExists(input.iconMediaId);
    const [row] = await db.insert(technology).values(input).returning();
    return row;
  } catch (error) {
    throwMappedDatabaseError(error);
  }
}

export async function updateTechnology(id: string, input: TechnologyInput) {
  try {
    const [existing] = await db.select({ id: technology.id }).from(technology).where(eq(technology.id, id)).limit(1);
    if (!existing) throw new Error("NOT_FOUND");
    const [duplicate] = await db.select({ id: technology.id }).from(technology)
      .where(and(ne(technology.id, id), or(eq(technology.name, input.name), eq(technology.slug, input.slug)))).limit(1);
    if (duplicate) throw new Error("CONFLICT");
    if (input.iconMediaId) await assertMediaExists(input.iconMediaId);
    const [row] = await db.update(technology).set(input).where(eq(technology.id, id)).returning();
    if (!row) throw new Error("NOT_FOUND");
    return row;
  } catch (error) {
    throwMappedDatabaseError(error);
  }
}

export async function deleteTechnology(id: string) {
  try {
    const [row] = await db.delete(technology).where(eq(technology.id, id)).returning({ id: technology.id });
    if (!row) throw new Error("NOT_FOUND");
    return row;
  } catch (error) {
    throwMappedDatabaseError(error);
  }
}

async function assertMediaExists(id: string) {
  const [row] = await db.select({ id: media.id }).from(media).where(eq(media.id, id)).limit(1);
  if (!row) throw new Error("NOT_FOUND");
}

export type UpdateProjectInput =
  CreateProjectInput & {
    id: string;
};

function assertPublishedState(
  status: ProjectStatus,
  publishedAt: Date | null,
) {
  if (
    status === "published" &&
    !publishedAt
  ) {
    throw new Error("VALIDATION_ERROR");
  }
}

function assertUniqueNumbers(
  values: number[],
) {
  const unique = new Set(values);

  if (unique.size !== values.length) {
    throw new Error("VALIDATION_ERROR");
  }
}

function assertUniqueStrings(
  values: string[],
) {
  const unique = new Set(values);

  if (unique.size !== values.length) {
    throw new Error("VALIDATION_ERROR");
  }
}

function assertUniqueMediaRelationships(
  values: ProjectMediaInput[],
) {
  const keys = values.map(
    (item) =>
      `${item.mediaId}:${item.role}`,
  );

  assertUniqueStrings(keys);
}

async function validateProjectReferences(
  tx: Parameters<
    Parameters<typeof db.transaction>[0]
  >[0],
  input: CreateProjectInput,
) {
  /*
   * Categories
   */

  const categoryIds =
    input.categories.map(
      (item) => item.categoryId,
    );

  assertUniqueStrings(categoryIds);

  if (categoryIds.length > 0) {
    const categories =
      await tx
        .select({
          id: projectCategory.id,
        })
        .from(projectCategory)
        .where(
          inArray(
            projectCategory.id,
            categoryIds,
          ),
        );

    if (
      categories.length !==
      categoryIds.length
    ) {
      throw new Error("NOT_FOUND");
    }
  }

  /*
   * Technologies
   */

  const technologyIds =
    input.technologies.map(
      (item) => item.technologyId,
    );

  assertUniqueStrings(technologyIds);

  assertUniqueNumbers(
    input.technologies.map(
      (item) => item.position,
    ),
  );

  if (technologyIds.length > 0) {
    const technologies =
      await tx
        .select({
          id: technology.id,
        })
        .from(technology)
        .where(
          inArray(
            technology.id,
            technologyIds,
          ),
        );

    if (
      technologies.length !==
      technologyIds.length
    ) {
      throw new Error("NOT_FOUND");
    }
  }

  /*
   * Media
   */

  assertUniqueMediaRelationships(
    input.media,
  );

  assertUniqueNumbers(
    input.media.map(
      (item) => item.position,
    ),
  );

  const mediaIds =
    input.media.map(
      (item) => item.mediaId,
    );

  assertUniqueStrings(mediaIds);

  if (mediaIds.length > 0) {
    const mediaRows =
      await tx
        .select({
          id: media.id,
        })
        .from(media)
        .where(
          inArray(
            media.id,
            mediaIds,
          ),
        );

    if (
      mediaRows.length !==
      mediaIds.length
    ) {
      throw new Error("NOT_FOUND");
    }
  }

  /*
   * Sections
   */

  assertUniqueNumbers(
    input.sections.map(
      (section) => section.position,
    ),
  );

  assertUniqueStrings(
    input.sections.map(
      (section) => section.type,
    ),
  );

  for (const section of input.sections) {
    assertUniqueNumbers(
      section.blocks.map(
        (block) => block.position,
      ),
    );
  }

  /*
   * Links
   */

  assertUniqueNumbers(
    input.links.map(
      (link) => link.position,
    ),
  );
}

export async function createProject(
  input: CreateProjectInput,
) {
  assertPublishedState(
    input.status,
    input.publishedAt,
  );

  return db.transaction(async (tx) => {
    await validateProjectReferences(
      tx,
      input,
    );

    const [createdProject] =
      await tx
        .insert(project)
        .values({
          slug: input.slug,
          title: input.title,
          shortDescription:
            input.shortDescription,
          description:
            input.description,
          projectType:
            input.projectType,
          location:
            input.location,
          year: input.year,

          status: input.status,
          featured: input.featured,
          publishedAt:
            input.publishedAt,

          seoTitle:
            input.seoTitle,
          seoDescription:
            input.seoDescription,
          canonicalOverride:
            input.canonicalOverride,
          robotsIndex:
            input.robotsIndex,
          robotsFollow:
            input.robotsFollow,
          socialTitle:
            input.socialTitle,
          socialDescription:
            input.socialDescription,
          socialImageId:
            input.socialImageId,
        })
        .returning();

    if (!createdProject) {
      throw new Error("INTERNAL_ERROR");
    }

    await replaceProjectRelationships(
      tx,
      createdProject.id,
      input,
    );

    return createdProject;
  });
}

export async function updateProject(
  input: UpdateProjectInput,
) {
  assertPublishedState(
    input.status,
    input.publishedAt,
  );

  return db.transaction(async (tx) => {
    await validateProjectReferences(
      tx,
      input,
    );

    const [updatedProject] =
      await tx
        .update(project)
        .set({
          slug: input.slug,
          title: input.title,
          shortDescription:
            input.shortDescription,
          description:
            input.description,
          projectType:
            input.projectType,
          location:
            input.location,
          year: input.year,

          status: input.status,
          featured: input.featured,
          publishedAt:
            input.publishedAt,

          seoTitle:
            input.seoTitle,
          seoDescription:
            input.seoDescription,
          canonicalOverride:
            input.canonicalOverride,
          robotsIndex:
            input.robotsIndex,
          robotsFollow:
            input.robotsFollow,
          socialTitle:
            input.socialTitle,
          socialDescription:
            input.socialDescription,
          socialImageId:
            input.socialImageId,

          updatedAt: new Date(),
        })
        .where(
          eq(
            project.id,
            input.id,
          ),
        )
        .returning();

    if (!updatedProject) {
      throw new Error("NOT_FOUND");
    }

    await replaceProjectRelationships(
      tx,
      updatedProject.id,
      input,
    );

    return updatedProject;
  });
}

export async function deleteProject(
  projectId: string,
) {
  const result = await db
    .delete(project)
    .where(
      eq(project.id, projectId),
    )
    .returning({
      id: project.id,
      slug: project.slug,
    });

  if (result.length === 0) {
    throw new Error("NOT_FOUND");
  }

  return result[0];
}

export async function setProjectStatus(
  projectId: string,
  status: ProjectStatus,
  publishedAt: Date | null,
) {
  assertPublishedState(
    status,
    publishedAt,
  );

  const [updatedProject] =
    await db
      .update(project)
      .set({
        status,
        publishedAt,
        updatedAt: new Date(),
      })
      .where(
        eq(
          project.id,
          projectId,
        ),
      )
      .returning();

  if (!updatedProject) {
    throw new Error("NOT_FOUND");
  }

  return updatedProject;
}

async function replaceProjectRelationships(
  tx: Parameters<
    Parameters<typeof db.transaction>[0]
  >[0],
  projectId: string,
  input: CreateProjectInput,
) {
  /*
   * Categories
   */

  await tx
    .delete(projectCategoryAssignment)
    .where(
      eq(
        projectCategoryAssignment.projectId,
        projectId,
      ),
    );

  if (
    input.categories.length > 0
  ) {
    await tx
      .insert(
        projectCategoryAssignment,
      )
      .values(
        input.categories.map(
          (category) => ({
            projectId,
            categoryId:
              category.categoryId,
          }),
        ),
      );
  }

  /*
   * Technologies
   */

  await tx
    .delete(projectTechnology)
    .where(
      eq(
        projectTechnology.projectId,
        projectId,
      ),
    );

  if (
    input.technologies.length > 0
  ) {
    await tx
      .insert(projectTechnology)
      .values(
        input.technologies.map(
          (technology) => ({
            projectId,
            technologyId:
              technology.technologyId,
            position:
              technology.position,
          }),
        ),
      );
  }

  /*
   * Media
   */

  await tx
    .delete(projectMedia)
    .where(
      eq(
        projectMedia.projectId,
        projectId,
      ),
    );

  if (input.media.length > 0) {
    await tx
      .insert(projectMedia)
      .values(
        input.media.map(
          (item) => ({
            projectId,
            mediaId: item.mediaId,
            role: item.role,
            position:
              item.position,
            caption:
              item.caption,
            altTextOverride:
              item.altTextOverride,
          }),
        ),
      );
  }

  /*
   * Sections
   *
   * project_block rows are removed
   * automatically through ON DELETE CASCADE.
   */

  await tx
    .delete(projectSection)
    .where(
      eq(
        projectSection.projectId,
        projectId,
      ),
    );

  for (const section of input.sections) {
    const [createdSection] =
      await tx
        .insert(projectSection)
        .values({
          projectId,
          type: section.type,
          title: section.title,
          anchor: section.anchor,
          position:
            section.position,
        })
        .returning({
          id: projectSection.id,
        });

    if (!createdSection) {
      throw new Error("INTERNAL_ERROR");
    }

    if (
      section.blocks.length > 0
    ) {
      await tx
        .insert(projectBlock)
        .values(
          section.blocks.map(
            (block) => ({
              projectSectionId:
                createdSection.id,
              type: block.type,
              position:
                block.position,
              data: block.data,
            }),
          ),
        );
    }
  }

  /*
   * Links
   */

  await tx
    .delete(projectLink)
    .where(
      eq(
        projectLink.projectId,
        projectId,
      ),
    );

  if (input.links.length > 0) {
    await tx
      .insert(projectLink)
      .values(
        input.links.map(
          (link) => ({
            projectId,
            type: link.type,
            label: link.label,
            url: link.url,
            position:
              link.position,
          }),
        ),
      );
  }
}
