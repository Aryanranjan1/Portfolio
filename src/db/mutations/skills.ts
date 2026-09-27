import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { media } from "@/db/schema/media";
import { skill, skillCategory } from "@/db/schema/skills";

export type SkillCategoryInput = {
  name: string;
  slug: string;
  description?: string | null;
  position: number;
};

export type SkillInput = {
  categoryId: string;
  name: string;
  slug: string;
  description?: string | null;
  details?: string | null;
  iconMediaId?: string | null;
  position: number;
};

/* -------------------------------------------------------------------------- */
/* Errors                                                                     */
/* -------------------------------------------------------------------------- */

function throwConflict(): never {
  throw new Error("CONFLICT");
}

function throwNotFound(): never {
  throw new Error("NOT_FOUND");
}

/* -------------------------------------------------------------------------- */
/* Existence checks                                                           */
/* -------------------------------------------------------------------------- */

async function assertSkillCategoryExists(
  id: string,
): Promise<void> {
  const result = await db
    .select({
      id: skillCategory.id,
    })
    .from(skillCategory)
    .where(eq(skillCategory.id, id))
    .limit(1);

  if (result.length === 0) {
    throwNotFound();
  }
}

async function assertMediaExists(
  id: string | null | undefined,
): Promise<void> {
  if (!id) {
    return;
  }

  const result = await db
    .select({
      id: media.id,
    })
    .from(media)
    .where(eq(media.id, id))
    .limit(1);

  if (result.length === 0) {
    throwNotFound();
  }
}

/* -------------------------------------------------------------------------- */
/* Skill Category uniqueness                                                   */
/* -------------------------------------------------------------------------- */

async function assertCategoryNameUnique(
  name: string,
  excludeId?: string,
): Promise<void> {
  const result = await db
    .select({
      id: skillCategory.id,
    })
    .from(skillCategory)
    .where(eq(skillCategory.name, name))
    .limit(1);

  if (
    result.length > 0 &&
    result[0].id !== excludeId
  ) {
    throwConflict();
  }
}

async function assertCategorySlugUnique(
  slug: string,
  excludeId?: string,
): Promise<void> {
  const result = await db
    .select({
      id: skillCategory.id,
    })
    .from(skillCategory)
    .where(eq(skillCategory.slug, slug))
    .limit(1);

  if (
    result.length > 0 &&
    result[0].id !== excludeId
  ) {
    throwConflict();
  }
}

async function assertCategoryPositionUnique(
  position: number,
  excludeId?: string,
): Promise<void> {
  const result = await db
    .select({
      id: skillCategory.id,
    })
    .from(skillCategory)
    .where(eq(skillCategory.position, position))
    .limit(1);

  if (
    result.length > 0 &&
    result[0].id !== excludeId
  ) {
    throwConflict();
  }
}

/* -------------------------------------------------------------------------- */
/* Skill uniqueness                                                            */
/* -------------------------------------------------------------------------- */

async function assertSkillNameUnique(
  name: string,
  categoryId: string,
  excludeId?: string,
): Promise<void> {
  const result = await db
    .select({
      id: skill.id,
    })
    .from(skill)
    .where(
      and(
        eq(skill.name, name),
        eq(skill.categoryId, categoryId),
      ),
    )
    .limit(1);

  if (
    result.length > 0 &&
    result[0].id !== excludeId
  ) {
    throwConflict();
  }
}

async function assertSkillSlugUnique(
  slug: string,
  excludeId?: string,
): Promise<void> {
  const result = await db
    .select({
      id: skill.id,
    })
    .from(skill)
    .where(eq(skill.slug, slug))
    .limit(1);

  if (
    result.length > 0 &&
    result[0].id !== excludeId
  ) {
    throwConflict();
  }
}

async function assertSkillPositionUnique(
  categoryId: string,
  position: number,
  excludeId?: string,
): Promise<void> {
  const result = await db
    .select({
      id: skill.id,
    })
    .from(skill)
    .where(
      and(
        eq(skill.categoryId, categoryId),
        eq(skill.position, position),
      ),
    )
    .limit(1);

  if (
    result.length > 0 &&
    result[0].id !== excludeId
  ) {
    throwConflict();
  }
}

/* -------------------------------------------------------------------------- */
/* Database error handling                                                     */
/* -------------------------------------------------------------------------- */

/**
 * PostgreSQL remains the final authority for UNIQUE constraints.
 *
 * The pre-checks above provide cleaner application errors, while this
 * catches race conditions where another request inserts the same value
 * between the pre-check and the INSERT/UPDATE.
 */
function rethrowDatabaseConflict(
  error: unknown,
): never {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  ) {
    throwConflict();
  }

  throw error;
}

/* -------------------------------------------------------------------------- */
/* Skill Categories                                                            */
/* -------------------------------------------------------------------------- */

export async function createSkillCategory(
  input: SkillCategoryInput,
) {
  await assertCategoryNameUnique(
    input.name,
  );

  await assertCategorySlugUnique(
    input.slug,
  );

  await assertCategoryPositionUnique(
    input.position,
  );

  try {
    const [created] = await db
      .insert(skillCategory)
      .values({
        name: input.name,
        slug: input.slug,
        description:
          input.description ?? null,
        position: input.position,
      })
      .returning();

    return created;
  } catch (error) {
    rethrowDatabaseConflict(error);
  }
}

export async function updateSkillCategory(
  id: string,
  input: SkillCategoryInput,
) {
  const existing = await db
    .select({
      id: skillCategory.id,
    })
    .from(skillCategory)
    .where(eq(skillCategory.id, id))
    .limit(1);

  if (existing.length === 0) {
    throwNotFound();
  }

  await assertCategoryNameUnique(
    input.name,
    id,
  );

  await assertCategorySlugUnique(
    input.slug,
    id,
  );

  await assertCategoryPositionUnique(
    input.position,
    id,
  );

  try {
    const [updated] = await db
      .update(skillCategory)
      .set({
        name: input.name,
        slug: input.slug,
        description:
          input.description ?? null,
        position: input.position,
      })
      .where(eq(skillCategory.id, id))
      .returning();

    if (!updated) {
      throwNotFound();
    }

    return updated;
  } catch (error) {
    rethrowDatabaseConflict(error);
  }
}

export async function deleteSkillCategory(
  id: string,
): Promise<void> {
  const existing = await db
    .select({
      id: skillCategory.id,
    })
    .from(skillCategory)
    .where(eq(skillCategory.id, id))
    .limit(1);

  if (existing.length === 0) {
    throwNotFound();
  }

  await db
    .delete(skillCategory)
    .where(eq(skillCategory.id, id));
}

/* -------------------------------------------------------------------------- */
/* Skills                                                                      */
/* -------------------------------------------------------------------------- */

export async function createSkill(
  input: SkillInput,
) {
  await assertSkillCategoryExists(
    input.categoryId,
  );

  await assertMediaExists(
    input.iconMediaId,
  );

  await assertSkillNameUnique(
    input.name,
    input.categoryId,
  );

  await assertSkillSlugUnique(
    input.slug,
  );

  await assertSkillPositionUnique(
    input.categoryId,
    input.position,
  );

  try {
    const [created] = await db
      .insert(skill)
      .values({
        categoryId: input.categoryId,
        name: input.name,
        slug: input.slug,
        description:
          input.description ?? null,
        details:
          input.details ?? null,
        iconMediaId:
          input.iconMediaId ?? null,
        position: input.position,
      })
      .returning();

    return created;
  } catch (error) {
    rethrowDatabaseConflict(error);
  }
}

export async function updateSkill(
  id: string,
  input: SkillInput,
) {
  const existing = await db
    .select({
      id: skill.id,
    })
    .from(skill)
    .where(eq(skill.id, id))
    .limit(1);

  if (existing.length === 0) {
    throwNotFound();
  }

  await assertSkillCategoryExists(
    input.categoryId,
  );

  await assertMediaExists(
    input.iconMediaId,
  );

  await assertSkillNameUnique(
    input.name,
    input.categoryId,
    id,
  );

  await assertSkillSlugUnique(
    input.slug,
    id,
  );

  await assertSkillPositionUnique(
    input.categoryId,
    input.position,
    id,
  );

  try {
    const [updated] = await db
      .update(skill)
      .set({
        categoryId: input.categoryId,
        name: input.name,
        slug: input.slug,
        description:
          input.description ?? null,
        details:
          input.details ?? null,
        iconMediaId:
          input.iconMediaId ?? null,
        position: input.position,
      })
      .where(eq(skill.id, id))
      .returning();

    if (!updated) {
      throwNotFound();
    }

    return updated;
  } catch (error) {
    rethrowDatabaseConflict(error);
  }
}

export async function deleteSkill(
  id: string,
): Promise<void> {
  const existing = await db
    .select({
      id: skill.id,
    })
    .from(skill)
    .where(eq(skill.id, id))
    .limit(1);

  if (existing.length === 0) {
    throwNotFound();
  }

  await db
    .delete(skill)
    .where(eq(skill.id, id));
}