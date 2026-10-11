import { randomUUID } from "node:crypto";
import { mutateApplication } from "@/lib/convex-server";

export type SkillCategoryInput = { name: string; slug: string; description?: string | null; position: number };
export type SkillInput = { categoryId: string; name: string; slug: string; description?: string | null; details?: string | null; iconMediaId?: string | null; position: number };

export function createSkillCategory(input: SkillCategoryInput) {
  return mutateApplication("simpleCreate", { table: "skillCategory", legacyId: randomUUID(), data: { ...input, description: input.description ?? null } });
}

export function updateSkillCategory(id: string, input: SkillCategoryInput) {
  return mutateApplication("simpleUpdate", { table: "skillCategory", id, data: { ...input, description: input.description ?? null } });
}

export function deleteSkillCategory(id: string) {
  return mutateApplication("simpleDelete", { table: "skillCategory", id });
}

export function createSkill(input: SkillInput) {
  return mutateApplication("simpleCreate", { table: "skill", legacyId: randomUUID(), data: { ...input, description: input.description ?? null, details: input.details ?? null, iconMediaId: input.iconMediaId ?? null } });
}

export function updateSkill(id: string, input: SkillInput) {
  return mutateApplication("simpleUpdate", { table: "skill", id, data: { ...input, description: input.description ?? null, details: input.details ?? null, iconMediaId: input.iconMediaId ?? null } });
}

export function deleteSkill(id: string) {
  return mutateApplication("simpleDelete", { table: "skill", id });
}
